package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
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
    public ResponseEntity<?> refresh(@RequestBody java.util.Map<String, String> requestBody) { // ◄ SỬA CHỖ NÀY: Nhận
                                                                                               // dạng Map JSON

        // Bước A: Lấy chuỗi mã hóa refreshToken từ trong gói dữ liệu JSON mà Frontend
        // gửi lên
        String clientRefreshToken = requestBody.get("refreshToken");

        // Bước B: Kiểm tra xem Frontend có gửi lên chuỗi rỗng hoặc thiếu thẻ không
        if (clientRefreshToken == null || clientRefreshToken.isEmpty()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body("Lỗi: Thiếu Refresh Token trong Request!");
        }

        // Bước C: Gọi hàm ở Bước 2 (JwtUtils) để kiểm tra xem chiếc thẻ này có hợp lệ
        // không
        boolean isTokenValid = jwtUtils.validateJwtToken(clientRefreshToken);

        if (isTokenValid) {
            // Bước D: Nếu thẻ xịn, tiến hành bóc lớp vỏ mã hóa để rút cái tên Username ẩn
            // bên trong ra
            String username = jwtUtils.getUserNameFromJwtToken(clientRefreshToken);

            // Bước E: Lấy danh sách quyền (Roles) của User này ra để nhét vào Access Token
            // mới
            java.util.List<String> roles = jwtUtils.getRolesFromToken(clientRefreshToken);

            // Bước F: Tiến hành "Đổi thẻ mới" - Cấp một chuỗi Access Token mới tinh có hạn
            // 15 phút cho người dùng
            String newAccessToken = jwtUtils.generateAccessToken(username, roles);

            // Bước G: Đóng gói Access Token mới và giữ lại Refresh Token cũ vào đối tượng
            // LoginResponse đúng chuẩn của DEV 2
            LoginResponse responseData = new LoginResponse(newAccessToken, clientRefreshToken);

            // Trả về mã 200 OK kèm theo gói dữ liệu phản hồi sạch sẽ cho Frontend
            return ResponseEntity.ok(responseData);
        }

        return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                .body("Lỗi: Refresh Token không hợp lệ hoặc đã hết hạn! Vui lòng Đăng nhập lại.");
    }
}
