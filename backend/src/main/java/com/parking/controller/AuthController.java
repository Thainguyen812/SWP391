package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.security.JwtUtils;
import com.parking.service.AuthService;
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

    // Việc này giúp gỡ bỏ hoàn toàn cú ép kiểu cưỡng bức lỏng lẻo dễ gây sập
    // (Crash) hệ thống ở hàm refresh.
    private final UserDetailsService userDetailsService;

    // Cập nhật Constructor để Spring tự động nạp cả 3 dependency vào khi khởi chạy
    public AuthController(AuthService authService, JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    // 1. API ĐĂNG NHẬP: Giữ nguyên gọi qua Service vì liên quan đến kiểm tra mật
    // khẩu dưới DB và băm mã
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // 2. API ĐĂNG KÝ: Giữ nguyên gọi qua Service để lưu User mới vào DB
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.status(201).body(authService.register(req));
    }

    // 3. API REFRESH TOKEN: Cấp lại Access Token mới khi thẻ cũ hết hạn 15 phút
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> requestBody) {

        String clientRefreshToken = requestBody.get("refreshToken");

        // Kiểm tra đầu vào xem Frontend có gửi kèm token gia hạn lên không
        if (clientRefreshToken == null || clientRefreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi: Thiếu Refresh Token trong Request!");
        }

        // Kiểm tra tính toàn vẹn và hạn sử dụng của Refresh Token (Xác thực chữ ký)
        if (jwtUtils.validateJwtToken(clientRefreshToken)) {

            // Lấy username từ ruột của Refresh Token cũ ra
            String username = jwtUtils.getUserNameFromJwtToken(clientRefreshToken);

            // 🔥 SỬA QUẢ BOM 2: Gọi an toàn qua thực thể userDetailsService đã được tiêm ở
            // trên,
            // lấy ra dữ liệu thực tế đang nằm dưới Database (Tránh lỗi ClassCastException).
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Chuyển đổi danh sách quyền hạn (Authorities) từ DB sang dạng mảng String
            // thuần túy List<String>
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .toList();

            // 🔥 SỬA QUẢ BOM 1: Khi tạo Access Token mới, bắt buộc phải truyền kèm danh
            // sách roles
            // vừa bóc ra từ DB vào hàm. Tránh việc sinh ra token rỗng không có quyền khiến
            // Camera AI bị lỗi 403.
            String newAccessToken = jwtUtils.generateJwtToken(username, roles);

            // Đóng gói cặp bài trùng token mới trả về cho Frontend tiếp tục sử dụng bãi đỗ
            // xe
            LoginResponse responseData = new LoginResponse(newAccessToken, clientRefreshToken);
            return ResponseEntity.ok(responseData);
        }

        // Trả về 401 nếu token gia hạn gửi lên là hàng fake hoặc đã quá hạn 7 ngày
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Lỗi: Refresh Token không hợp lệ hoặc đã hết hạn! Vui lòng Đăng nhập lại.");
    }
}