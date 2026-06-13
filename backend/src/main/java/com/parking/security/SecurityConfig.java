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
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 0. Cấu hình CORS cho phép gọi từ http://localhost:5173
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 1. Tắt CSRF bằng cú pháp Lambda mới (Spring Boot 3 bắt buộc)
                .csrf(csrf -> csrf.disable())

                // 2. Cấu hình Session Stateless (Không lưu trạng thái phiên làm việc trên
                // Server)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 3. Cấu hình các cổng API ra vào
                .authorizeHttpRequests(auth -> auth
<<<<<<< Updated upstream
                        // Giữ nguyên các đường dẫn công khai của DEV 2 (Cho phép vào thẳng không cần
                        // Token)
                        .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                        .permitAll()

                        // Tất cả các request còn lại (bao gồm API Check-out của bạn) đều phải quẹt thẻ
                        // thành công
                        .anyRequest().authenticated());

        // 4. Chèn máy quét thẻ JwtAuthFilter của bạn vào chạy trước bộ lọc mặc định của
        // Spring
=======
                        // Giữ nguyên các đường dẫn công khai (Cho phép vào thẳng không cần Token)
                        // Bao gồm cả OpenAPI / Swagger UI
                        .requestMatchers(
                                "/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Tất cả các request còn lại đều phải quẹt thẻ thành công
                        .anyRequest().authenticated());

        // 4. Chèn máy quét thẻ JwtAuthFilter của bạn vào chạy trước bộ lọc mặc định của Spring
>>>>>>> Stashed changes
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Giữ nguyên công cụ băm mật khẩu BCrypt độ mạnh 10 của DEV 2
        return new BCryptPasswordEncoder(10);
    }
}
