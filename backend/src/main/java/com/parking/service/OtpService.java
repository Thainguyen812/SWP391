package com.parking.service;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private static class OtpData {
        private final String code;
        private final Instant expiryTime;

        public OtpData(String code, Instant expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }

        public String getCode() { return code; }
        public Instant getExpiryTime() { return expiryTime; }
    }

    private final Map<String, OtpData> otpMap = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @org.springframework.beans.factory.annotation.Value("${spring.mail.password:}")
    private String mailPassword;

    public String generateOtp(String email) {
        // Tạo mã OTP 6 chữ số
        String code = String.format("%06d", random.nextInt(1000000));
        // Thời gian hết hạn là 5 phút sau
        Instant expiryTime = Instant.now().plusSeconds(300);
        
        otpMap.put(email.trim().toLowerCase(), new OtpData(code, expiryTime));
        return code;
    }

    public boolean verifyOtp(String email, String inputCode) {
        System.out.println("🔍 verifyOtp called for email: [" + email + "], inputCode: [" + inputCode + "], mailPassword: [" + mailPassword + "]");
        if (email == null || inputCode == null) {
            return false;
        }

        // Cho phép mã test 123456 nếu chưa cấu hình mật khẩu email thật
        if ("123456".equals(inputCode.trim()) && (mailPassword == null || mailPassword.trim().isEmpty() || "DIEN_MAT_KHAU_UNG_DUNG_TAI_DAY".equals(mailPassword.trim()))) {
            return true;
        }

        String key = email.trim().toLowerCase();
        OtpData otpData = otpMap.get(key);

        
        if (otpData == null) {
            return false;
        }
        
        // Kiểm tra hết hạn
        if (otpData.getExpiryTime().isBefore(Instant.now())) {
            otpMap.remove(key);
            return false;
        }
        
        // So khớp mã
        boolean isMatch = otpData.getCode().equals(inputCode.trim());
        if (isMatch) {
            // Xóa mã sau khi xác thực thành công để tránh dùng lại
            otpMap.remove(key);
        }
        return isMatch;
    }
}
