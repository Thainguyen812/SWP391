package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.security.JwtUtils;
import com.parking.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtUtils jwtUtils; // Tiêm trực tiếp JwtUtils vào đây để tự mình xử lý Token, không thèm viết tắt
                                     // qua Service

    public AuthController(AuthService authService, JwtUtils jwtUtils) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
    }

    // 1. API ĐĂNG NHẬP: Giữ nguyên gọi qua Service của DEV 2 vì liên quan đến kiểm
    // tra mật khẩu dưới DB
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // 2. API ĐĂNG KÝ: Giữ nguyên gọi qua Service của DEV 2 để lưu User mới vào DB
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.status(201).body(authService.register(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody java.util.Map<String, String> requestBody) {

        String clientRefreshToken = requestBody.get("refreshToken");

        if (clientRefreshToken == null || clientRefreshToken.isEmpty()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body("Lỗi: Thiếu Refresh Token trong Request!");
        }

        try {
            String newAccessToken = authService.refresh(clientRefreshToken);
            LoginResponse responseData = new LoginResponse(newAccessToken, clientRefreshToken);
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body("Lỗi: Refresh Token không hợp lệ hoặc đã hết hạn! Vui lòng Đăng nhập lại. Chi tiết: " + e.getMessage());
        }
    }

}
