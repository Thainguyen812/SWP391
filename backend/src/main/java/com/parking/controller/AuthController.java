package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.dto.SendOtpRequest;
import com.parking.dto.ResetPasswordRequest;
import com.parking.security.JwtUtils;
import com.parking.service.AuthService;
import com.parking.service.OtpService;
import com.parking.service.EmailService;
import org.springframework.beans.factory.annotation.Qualifier; // Thêm import này
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final UserRepository userRepo;

    public AuthController(
            AuthService authService,
            JwtUtils jwtUtils,
            @Qualifier("customUserDetailsService") UserDetailsService userDetailsService,
            OtpService otpService,
            EmailService emailService,
            UserRepository userRepo) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.userRepo = userRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
        }
        
        String username = auth.getName();
        User user = userRepo.findByUsername(username).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không tìm thấy user");
        }
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId().toString());
        userData.put("name", user.getFullName());
        userData.put("username", user.getUsername());
        userData.put("role", user.getRole().toString());
        userData.put("station", "Cổng chính (Auto)"); // Giả lập station nếu user chưa có field này
        userData.put("shift", "Ca trực chung");       // Giả lập shift nếu user chưa có field này
        userData.put("avatar", "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.getUsername());
        
        return ResponseEntity.ok(userData);
    }

    // 1. API ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // 2. API ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.status(201).body(authService.register(req));
    }

    // 3. API REFRESH TOKEN
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> requestBody) {
        String clientRefreshToken = requestBody.get("refreshToken");

        if (clientRefreshToken == null || clientRefreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi: Thiếu Refresh Token trong Request!");
        }

        try {
            String newAccessToken = authService.refresh(clientRefreshToken);
            LoginResponse responseData = new LoginResponse(newAccessToken, clientRefreshToken, null);
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body("Lỗi: Refresh Token không hợp lệ hoặc đã hết hạn! Vui lòng Đăng nhập lại. Chi tiết: " + e.getMessage());
        }
    }

    // 4. API GỬI OTP QUA EMAIL
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email không được để trống!"));
        }
        String otp = otpService.generateOtp(req.getEmail());
        emailService.sendOtpEmail(req.getEmail(), otp);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã gửi mã xác thực tới email của bạn. Vui lòng kiểm tra!"));
    }

    // 5. API XÁC THỰC OTP ĐỘC LẬP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Thiếu email hoặc mã OTP!"));
        }
        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Mã OTP hợp lệ!"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Mã OTP không chính xác hoặc đã hết hạn!"));
        }
    }

    // 6. API ĐẶT LẠI MẬT KHẨU BẰNG OTP EMAIL
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        try {
            authService.resetPassword(req);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đặt lại mật khẩu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}