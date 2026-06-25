package com.parking.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtils {

    // Khóa bí mật dùng để ký token
    @Value("${app.jwtSecret}")
    private String jwtSecret;

    // Thời gian sống của access token (thường là 15 phút: 15 * 60 * 1000 mili giây)
    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    // Thời gian sống của refresh token (nếu trong properties tính bằng giây thì
    // nhân thêm 1000)
    @Value("${app.refreshExpirationSec}")
    private long refreshExpiration;

    // Hàm này dùng để tạo khóa bí mật cho việc ký và xác thực jwt
    private Key getSignKey() {
        // Chuyển chuỗi jwt thành mảng byte sử dụng mã hóa UTF_8 để đồng bộ cấu trúc
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        // Tạo ra đối tượng key từ mảng byte sử dụng thuật toán HMAC-SHA để đảm bảo tính
        // bảo mật
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 1. Tạo Access Token (Chứa đầy đủ thông tin username và danh sách roles)
    public String generateJwtToken(String username, List<String> roles) {
        Date now = new Date();
        Date expireDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(username) // Đặt chủ đề của token là username
                .claim("roles", roles) // Nhét danh sách quyền vào claim để bóc tách phân quyền ở Filter
                .setIssuedAt(now) // Đặt thời gian phát hành token
                .setExpiration(expireDate) // Đặt thời gian hết hạn token
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // Ký token bằng khóa bí mật và thuật toán HS256
                .compact(); // Tổng hợp lại và tạo chuỗi Jwt hoàn chỉnh
    }

    // 2. Tạo Refresh Token (Chỉ cần chứa Username, thời gian sống lâu hơn)
    public String generateRefreshToken(String username) {
        Date now = new Date();
        // Ép kiểu ép số chuẩn chỉnh đề phòng biến refreshExpiration nhận vào đơn vị
        // giây (nhân 1000để ra mili giây)
        long expirationTimeMs = refreshExpiration < 1000000000L ? (refreshExpiration * 1000) : refreshExpiration;
        Date expiryDate = new Date(now.getTime() + expirationTimeMs);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 3. Lấy Username từ trong Token ra
    public String getUserNameFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder() // Khởi tạo bộ giải mã Token
                .setSigningKey(getSignKey()) // Đưa Khóa bí mật vào để đối chiếu (Sai chữ ký quăng exception ngay)
                .build() // Xây dựng hoàn chỉnh bộ Parser
                .parseClaimsJws(token) // Truyền chuỗi Token vào để bóc tách các lớp mã hóa
                .getBody(); // Lấy ra phần thân chứa dữ liệu (Phần Payload/Claims)

        return claims.getSubject(); // Trả về thông tin Subject (Username) đã lưu bên trong
    }

    // 4. Lấy danh sách roles từ token để tiến hành phân quyền endpoints
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        Object roles = claims.get("roles");
        if (roles instanceof List<?>) {
            return (List<String>) roles;
        }
        return List.of(); // Trả về rỗng nếu không tìm thấy role
    }

    // 5. Kiểm tra tính hợp lệ của token (Hết hạn, sai định dạng, trống...)
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.err.println("Token không hợp lệ (Invalid JWT token)");
        } catch (ExpiredJwtException e) {
            System.err.println("Token đã hết hạn (Expired JWT token)");
        } catch (UnsupportedJwtException e) {
            System.err.println("Token không được hỗ trợ (Unsupported JWT token)");
        } catch (IllegalArgumentException e) {
            System.err.println("Chuỗi Claims trống (JWT claims string is empty)");
        } catch (Exception e) {
            System.err.println("Lỗi xác thực token: " + e.getMessage());
        }
        return false;
    }
}