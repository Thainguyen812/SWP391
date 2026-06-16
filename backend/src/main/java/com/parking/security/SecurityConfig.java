package com.parking.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity // Kích hoạt tính năng bảo mật cho ứng dụng Web
@EnableMethodSecurity // QUAN TRỌNG: Kích hoạt Phân quyền tầng Method (để bạn dùng được @PreAuthorize
                      // ở Bước 7)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // Giữ nguyên Constructor injection của DEV 2 giao để nạp máy quét thẻ
    // JwtAuthFilter vào
    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Cấu hình CORS cho phép gọi từ các origin Frontend được chỉ định
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 1. Tắt CSRF bằng cú pháp Lambda mới (Spring Boot 3 bắt buộc)
                .csrf(csrf -> csrf.disable())

                // 2. Cấu hình Session Stateless (Không lưu trạng thái phiên làm việc trên
                // Server)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 3. Cấu hình các cổng API ra vào
                .authorizeHttpRequests(auth -> auth
                        // Giữ nguyên các đường dẫn công khai (Cho phép vào thẳng không cần Token)
                        // Bao gồm cả OpenAPI / Swagger UI
                        .requestMatchers(
                                "/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/blacklisted-cards/**" // 🔥 PHƯỚC THÊM DÒNG NÀY VÀO ĐÂY NHA!
                        ).permitAll()

                        // Tất cả các request còn lại đều phải quẹt thẻ thành công
                        .anyRequest().authenticated());

        // 4. Chèn máy quét thẻ JwtAuthFilter của bạn vào chạy trước bộ lọc mặc định của
        // Spring
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Giữ nguyên công cụ băm mật khẩu BCrypt độ mạnh 10 của DEV 2
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
