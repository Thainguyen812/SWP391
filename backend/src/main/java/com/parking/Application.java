package com.parking;

import com.parking.security.SecurityConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@Import(SecurityConfig.class) // ÉP BUỘC: Bắt Spring Boot phải nuốt file SecurityConfig này vào chạy
@EnableScheduling
public class Application {
    @jakarta.annotation.PostConstruct
    public void init() {
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}