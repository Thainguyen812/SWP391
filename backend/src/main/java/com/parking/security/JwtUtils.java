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

    // ten duong link
    @Value("${app.jwtSecret}")
    private String jwtSecret;

    // thời gian sống của access token là 15 phút (15*60*1000 mili giây)
    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    // thời gian sống của refresh token là 7 ngày (7*24*60*60*1000 mili giây)
    @Value("${app.refreshExpirationSec}")
    private long refreshExpiration;

    // hàm này dùng để tạo khóa bí mật cho việc ký và xác thực jwt
    private Key getSignKey() {
        // chuyển chuôi jwt thành mảng byte sử dụng mã hóa UTF_8 ==> tính nhất quán và
        // dc mã hóa đúng cách
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        // tạo ra đối tượng key từ mảng byte sử dụng thuật toán HS256 để đảm bảo tính
        // bảo mật và toàn vẹn của token
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 1. tạo access token (chứa username và roles)
    public String generateJwtToken(String username, List<String> roles) {

        Date now = new Date();
        Date expireDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(username) // đặt chủ đề của token là username
                .claim("roles", roles) // thêm danh sách quyền hạn
                .setIssuedAt(now) // đặt thời gian phát hành token
                .setExpiration(expireDate) // đặt thời gian hết hạn token
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // ký token bằng khóa bí mật và thuật toán HS256
                .compact(); // tổng hợp lại và tạo chuỗi Jwt hoàn chỉnh
    }

    // 2. Tạo Refresh Token (Chỉ cần chứa Username, sống lâu hơn)
    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

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
                .setSigningKey(getSignKey()) // Đưa Khóa bí mật vào để đối chiếu (Nếu chữ ký sai hoặc bị sửa đổi, hàm
                                             // sẽ báo lỗi ngay tại đây)
                .build() // Xây dựng hoàn chỉnh bộ Parser
                .parseClaimsJws(token)// Truyền chuỗi Token vào để bóc tách các lớp mã hóa
                .getBody();// Lấy ra phần thân chứa dữ liệu (Phần Payload/Claims)

        return claims.getSubject(); // Trả về thông tin Subject (Username) đã lưu bên trong
    }

    // 4. Lấy danh sách roles từ token
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey()) // Dùng khóa bí mật để xác thực xem token có bị ai sửa đổi lén lút hay
                                             // không
                .build()
                .parseClaimsJws(token)
                .getBody();

        // Đọc ô dữ liệu tên là "roles" đã nhét vào lúc tạo, ép kiểu nó về dạng
        // List<String> và trả ra ngoài
        return claims.get("roles", List.class);
    }

    // 5. Kiểm tra token hợp lệ không
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
