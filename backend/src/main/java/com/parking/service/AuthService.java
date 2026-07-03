package com.parking.service;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.dto.ResetPasswordRequest;
import com.parking.model.RefreshToken;
import com.parking.model.User;
import com.parking.repository.RefreshTokenRepository;
import com.parking.repository.UserRepository;
import com.parking.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService implements org.springframework.security.core.userdetails.UserDetailsService {
    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final OtpService otpService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepo, RefreshTokenRepository refreshRepo, PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils, OtpService otpService, EmailService emailService) {
        this.userRepo = userRepo;
        this.refreshRepo = refreshRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username)
            throws org.springframework.security.core.userdetails.UsernameNotFoundException {
        User u = userRepo.findByUsername(username)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(u.getUsername())
                .password(u.getPasswordHash())
                .authorities(java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + u.getRole().name())))
                .disabled(u.getStatus() != User.Status.ACTIVE)
                .build();
    }

    private LoginResponse generateLoginResponse(User u) {
        String access = jwtUtils.generateJwtToken(u.getUsername(), java.util.List.of("ROLE_" + u.getRole().name()));

        UUID refreshUuid = UUID.randomUUID();
        RefreshToken rt = new RefreshToken();
        rt.setId(UUID.randomUUID());
        rt.setUserId(u.getId());
        rt.setToken(refreshUuid);
        rt.setExpiresAt(java.time.Instant.now().plusSeconds(7 * 24 * 3600));

        refreshRepo.save(rt);

        return new LoginResponse(access, refreshUuid.toString(), u);
    }

    public LoginResponse login(LoginRequest req) {
        try {
            // 1. Kiểm tra Username hoặc Email tồn tại dưới DB
            String loginIdentifier = req.getUsername().trim();
            Optional<User> uOpt = Optional.empty();
            if (loginIdentifier.contains("@")) {
                uOpt = userRepo.findByEmail(loginIdentifier.toLowerCase());
            }
            if (uOpt.isEmpty()) {
                uOpt = userRepo.findByUsername(loginIdentifier);
            }

            if (uOpt.isEmpty()) {
                throw new RuntimeException("❌ LỖI: Không tìm thấy tài khoản với Username hoặc Email '" + loginIdentifier + "' dưới Database!");
            }

            User u = uOpt.get();

            // 2. Kiểm tra mật khẩu khớp hay không
            if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
                throw new RuntimeException("❌ LỖI: Mật khẩu bị sai (hoặc chưa mã hóa băm Bcrypt)!");
            }

            // 3. Kiểm tra Role trước khi tạo JWT
            if (u.getRole() == null) {
                throw new RuntimeException("❌ LỖI: User này tồn tại nhưng cột 'role' dưới Database đang bị rỗng (NULL)!");
            }

            // 4. Kiểm tra OTP
            if (req.getOtp() == null || req.getOtp().trim().isEmpty()) {
                if (u.getEmail() == null || u.getEmail().trim().isEmpty()) {
                    throw new RuntimeException("❌ LỖI: Tài khoản chưa cấu hình email nhận mã OTP!");
                }
                String otp = otpService.generateOtp(u.getEmail());
                emailService.sendOtpEmail(u.getEmail(), otp);
                
                return new LoginResponse(true, u.getEmail(), "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra!");
            }

            // 5. Xác thực OTP
            boolean isOtpValid = otpService.verifyOtp(u.getEmail(), req.getOtp());
            if (!isOtpValid) {
                throw new RuntimeException("❌ LỖI: Mã OTP không chính xác hoặc đã hết hạn!");
            }

            // 6. OTP hợp lệ, sinh response đăng nhập thành công
            return generateLoginResponse(u);

        } catch (Exception e) {
            System.err.println("=================================================");
            System.err.println("❌ PHÁT HIỆN LỖI HỆ THỐNG TẠI HÀM LOGIN:");
            System.err.println("=================================================");
            e.printStackTrace();
            throw e;
        }
    }

    public LoginResponse register(RegisterRequest req) {
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            throw new RuntimeException("Tài khoản (Số điện thoại) này đã được đăng ký.");
        }
        
        try {
            User u = new User();
            u.setId(UUID.randomUUID());
            u.setUsername(req.getUsername());
            u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            u.setFullName(req.getFullName());
            u.setEmail(req.getEmail());
            u.setPhone(req.getPhone());
            if (req.getUsername().matches("^\\+?[0-9]{9,15}$")) {
                u.setRole(User.Role.DRIVER);
            } else if (req.getRole() != null && req.getRole().equalsIgnoreCase("STAFF")) {
                u.setRole(User.Role.STAFF);
            } else {
                u.setRole(User.Role.DRIVER); // Mặc định đăng ký mới là tài xế (Driver)
            }
            u.setStatus(User.Status.ACTIVE);
            u.setCreatedAt(Instant.now());
            userRepo.save(u);

            // Tự động đăng nhập luôn sau khi đăng ký thành công (bỏ qua OTP)
            return generateLoginResponse(u);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    public void resetPassword(ResetPasswordRequest req) {
        // 1. Tìm user bằng email
        User u = userRepo.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

        // 2. Xác thực mã OTP
        boolean isOtpValid = otpService.verifyOtp(req.getEmail(), req.getOtp());
        if (!isOtpValid) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }

        // 3. Cập nhật mật khẩu mới
        u.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(u);
    }

    public String refresh(String refreshToken) {
        UUID tokenUuid = UUID.fromString(refreshToken);
        Optional<RefreshToken> opt = refreshRepo.findByToken(tokenUuid);
        if (opt.isEmpty()) {
            throw new RuntimeException("Invalid refresh token");
        }

        RefreshToken rt = opt.get();
        if (rt.getExpiresAt().isBefore(Instant.now())) {
            refreshRepo.delete(rt);
            throw new RuntimeException("Refresh token expired");
        }

        Optional<User> uOpt = userRepo.findById(rt.getUserId());
        if (uOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User u = uOpt.get();
        List<String> roles = List.of("ROLE_" + u.getRole().name());
        return jwtUtils.generateJwtToken(u.getUsername(), roles);
    }
}