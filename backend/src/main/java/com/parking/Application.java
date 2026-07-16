package com.parking;

import com.parking.security.SecurityConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@Import(SecurityConfig.class) // ÉP BUỘC: Bắt Spring Boot phải nuốt file SecurityConfig này vào chạy
@EnableScheduling
@EnableAsync
public class Application {
    @jakarta.annotation.PostConstruct
    public void init() {
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(Application.class, args);
    }

    private static void loadEnv() {
        try {
            java.nio.file.Path envPath = java.nio.file.Paths.get(".env");
            if (!java.nio.file.Files.exists(envPath)) {
                envPath = java.nio.file.Paths.get("../.env");
            }
            if (java.nio.file.Files.exists(envPath)) {
                java.util.List<String> lines = java.nio.file.Files.readAllLines(envPath);
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;  
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
                System.out.println("✅ [ENV] Đã tự động nạp cấu hình từ file: " + envPath.toAbsolutePath());
            } else {
                System.out.println("⚠️ [ENV] Không tìm thấy file .env để nạp tự động.");
            }
        } catch (java.io.IOException e) {
            System.err.println("❌ [ENV] Lỗi khi đọc file .env: " + e.getMessage());
        }
    }
}  