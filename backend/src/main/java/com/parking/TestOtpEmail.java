package com.parking;

import com.parking.service.OtpService;
import com.parking.service.EmailService;
import java.lang.reflect.Field;

public class TestOtpEmail {
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("🧪 BẮT ĐẦU KIỂM THỬ KHỬ LỖI GỬI EMAIL VÀ OTP...");
        System.out.println("=================================================");
        
        // 1. Nạp file .env
        loadEnv();
        
        String mailUsername = System.getProperty("MAIL_USERNAME");
        String mailPassword = System.getProperty("MAIL_PASSWORD");
        System.out.println("👉 Cấu hình nạp từ .env: MAIL_USERNAME = " + mailUsername);
        System.out.println("👉 Cấu hình nạp từ .env: MAIL_PASSWORD = " + (mailPassword == null ? "null" : "Mật khẩu dài " + mailPassword.length() + " ký tự"));

        try {
            // 2. Khởi tạo OtpService
            OtpService otpService = new OtpService();
            setField(otpService, "mailPassword", mailPassword);
            
            // 3. Khởi tạo EmailService
            EmailService emailService = new EmailService();
            setField(emailService, "mailFrom", mailUsername);
            setField(emailService, "mailPassword", mailPassword);

            // 4. Test generate OTP
            System.out.println("\n[BƯỚC 1]: THỬ NGHIỆM TẠO MÃ OTP");
            String testEmail = "phuongbui10022005@gmail.com";
            String generatedOtp = otpService.generateOtp(testEmail);
            System.out.println("✅ Đã tạo mã OTP cho " + testEmail + ": " + generatedOtp);

            // 5. Test gửi OTP qua EmailService
            System.out.println("\n[BƯỚC 2]: GỬI OTP (Kiểm tra xem có bypass khi cấu hình trống/giả không)");
            emailService.sendOtpEmail(testEmail, generatedOtp);
            
            // 6. Test verify OTP (chính xác)
            System.out.println("\n[BƯỚC 3]: XÁC THỰC MÃ OTP THẬT");
            boolean verifyReal = otpService.verifyOtp(testEmail, generatedOtp);
            System.out.println("👉 Kết quả xác thực mã thực tế (" + generatedOtp + "): " + (verifyReal ? "THÀNH CÔNG (Hợp lệ ✅)" : "THẤT BẠI (Không hợp lệ ❌)"));

            // 7. Test verify OTP mock (123456)
            System.out.println("\n[BƯỚC 4]: XÁC THỰC MÃ OTP TEST MẶC ĐỊNH (123456)");
            // Cần tạo lại otp vì verifyOtp thành công sẽ xóa otp cũ
            otpService.generateOtp(testEmail);
            boolean verifyMock = otpService.verifyOtp(testEmail, "123456");
            System.out.println("👉 Kết quả xác thực mã test '123456': " + (verifyMock ? "THÀNH CÔNG (Hợp lệ ✅ - Cơ chế bypass hoạt động hoàn hảo!)" : "THẤT BẠI (Không hợp lệ ❌)"));
            
        } catch (Exception e) {
            System.err.println("❌ Có lỗi xảy ra trong quá trình test:");
            e.printStackTrace();
        }
        System.out.println("\n=================================================");
        System.out.println("🧪 HOÀN TẤT KIỂM THỬ.");
        System.out.println("=================================================");
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
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
                        System.setProperty(key, value);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading env: " + e.getMessage());
        }
    }
}
