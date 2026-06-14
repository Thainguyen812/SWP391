package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.security.JwtUtils;
import com.parking.service.AuthService;
import org.springframework.beans.factory.annotation.Qualifier; // Thêm import này
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    // Sử dụng @Qualifier để chỉ định đích danh Spring nạp customUserDetailsService
    // vào đây
    public AuthController(
            AuthService authService,
            JwtUtils jwtUtils,
            @Qualifier("customUserDetailsService") UserDetailsService userDetailsService) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
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

        if (jwtUtils.validateJwtToken(clientRefreshToken)) {
            String username = jwtUtils.getUserNameFromJwtToken(clientRefreshToken);

            // Chạy an toàn qua customUserDetailsService đã được chỉ định rõ ở trên
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .toList();

            String newAccessToken = jwtUtils.generateJwtToken(username, roles);

            LoginResponse responseData = new LoginResponse(newAccessToken, clientRefreshToken);
            return ResponseEntity.ok(responseData);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Lỗi: Refresh Token không hợp lệ hoặc đã hết hạn! Vui lòng Đăng nhập lại.");
    }
}