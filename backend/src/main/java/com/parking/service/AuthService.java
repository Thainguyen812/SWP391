package com.parking.service;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
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

    public AuthService(UserRepository userRepo, RefreshTokenRepository refreshRepo, PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils) {
        this.userRepo = userRepo;
        this.refreshRepo = refreshRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
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

    public LoginResponse login(LoginRequest req) {
        try {
            // 1. Kiểm tra username tồn tại dưới DB
            Optional<User> uOpt = userRepo.findByUsername(req.getUsername());
            if (uOpt.isEmpty()) {
                throw new RuntimeException("❌ LỖI: Không tìm thấy Username '" + req.getUsername() + "' dưới Database!");
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
            String access = jwtUtils.generateJwtToken(u.getUsername(), java.util.List.of("ROLE_" + u.getRole().name()));

            // 4. Tạo cấu trúc Refresh Token
            UUID refreshUuid = UUID.randomUUID();
            RefreshToken rt = new RefreshToken();
            rt.setId(UUID.randomUUID());
            rt.setUserId(u.getId());
            rt.setToken(refreshUuid);
            rt.setExpiresAt(java.time.Instant.now().plusSeconds(7 * 24 * 3600));

            // 5. Lưu Refresh Token vào Database
            refreshRepo.save(rt);

            // Truyền u vào constructor LoginResponse để Frontend nhận được thông tin User
            return new LoginResponse(access, refreshUuid.toString(), u);

        } catch (Exception e) {
            System.err.println("=================================================");
            System.err.println("❌ PHÁT HIỆN LỖI HỆ THỐNG TẠI HÀM LOGIN:");
            System.err.println("=================================================");
            e.printStackTrace();
            throw e;
        }
    }

    public LoginResponse register(RegisterRequest req) {
        try {
            User u = new User();
            u.setId(UUID.randomUUID());
            u.setUsername(req.getUsername());
            u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            u.setFullName(req.getFullName());
            u.setEmail(req.getEmail());
            u.setPhone(req.getPhone());
            if (req.getRole() != null && req.getRole().equalsIgnoreCase("STAFF")) {
                u.setRole(User.Role.STAFF);
            } else {
                u.setRole(User.Role.DRIVER); // Mặc định đăng ký mới là tài xế (Driver)
            }
            u.setStatus(User.Status.ACTIVE);
            u.setCreatedAt(Instant.now());
            userRepo.save(u);

            // Tự động đăng nhập luôn sau khi đăng ký thành công
            LoginRequest lr = new LoginRequest();
            lr.setUsername(req.getUsername());
            lr.setPassword(req.getPassword());
            return login(lr);
        } catch (Exception e) {
            throw new RuntimeException("Register failed: " + e.getMessage(), e);
        }
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