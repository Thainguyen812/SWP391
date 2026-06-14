package com.parking;

import com.parking.security.SecurityConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(SecurityConfig.class) // 🔥 ÉP BUỘC: Bắt Spring Boot phải nuốt file SecurityConfig này vào chạy
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}