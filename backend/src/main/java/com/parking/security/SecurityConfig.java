package com.parking.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // 1. Các API công khai hoàn toàn công cộng
                        .requestMatchers(
                                "/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/v1/parking/find-car",
                                "/api/payment/vnpay-ipn",
                                "/api/v1/payment/vnpay-ipn",
                                "/api/v1/momo/momo-ipn")
                        .permitAll()

                        // 2. Phân vùng API chỉ dành riêng cho ADMIN
                        .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/security/alerts/**").hasAnyRole("ADMIN", "MANAGER", "STAFF")
                        .requestMatchers("/api/security/**").hasRole("ADMIN")

                        // 3. Phân vùng API chỉ dành cho ADMIN (logs và cấu hình hệ thống)
                        .requestMatchers("/api/logs/**").hasRole("ADMIN")
                        // ADMIN: toàn quyền settings | MANAGER/STAFF: chỉ được đọc (GET) để hiển thị giá tiền
                        .requestMatchers(HttpMethod.GET, "/api/settings/**").hasAnyRole("ADMIN", "MANAGER", "STAFF")
                        .requestMatchers("/api/settings/**").hasRole("ADMIN")

                        // 4. Phân vùng API dành cho Quản lý (MANAGER)
                        .requestMatchers("/api/revenue/shift-stats", "/api/revenue/transactions",
                                "/api/revenue/transactions/**")
                        .hasAnyRole("ADMIN", "MANAGER", "STAFF")
                        .requestMatchers("/api/revenue/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "MANAGER")

                        // 5. Phân vùng API dùng chung cho lực lượng vận hành (STAFF và MANAGER)
                        .requestMatchers("/api/blacklisted-cards/**").hasAnyRole("ADMIN", "STAFF", "MANAGER")
                        .requestMatchers("/api/tickets/**").hasAnyRole("ADMIN", "STAFF", "MANAGER")
                        .requestMatchers("/api/shifts/**", "/api/personnel/**").hasAnyRole("ADMIN", "STAFF", "MANAGER")
                        .requestMatchers("/api/monitoring/**").hasAnyRole("ADMIN", "STAFF", "MANAGER")
                        .requestMatchers("/api/camera/**").hasAnyRole("ADMIN", "STAFF", "MANAGER")
                        .requestMatchers("/api/sessions/daily-volume").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers("/api/sessions/**").hasAnyRole("STAFF", "MANAGER", "ADMIN")
                        .requestMatchers("/api/gate/**").hasAnyRole("ADMIN", "STAFF", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/branches").authenticated() // Đăng nhập là xem được
                        .requestMatchers(HttpMethod.POST, "/api/branches").hasRole("ADMIN") // Chỉ Admin được tạo

                        // 5. Toàn bộ các API còn lại (bao gồm /api/v1/parking/** và /api/vehicles/**)
                        // Sẽ được kiểm soát chi tiết bằng @PreAuthorize tại Controller
                        .anyRequest().authenticated());

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
        // Mở rộng CORS cho phép tất cả các nguồn kết nối (cần thiết cho deploy demo
        // Cloud)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
