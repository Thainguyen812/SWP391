package com.parking.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Async
    public void sendOtpEmail(String toEmail, String otpCode) {
        String subject = "Mã xác thực OTP - UrbanPark";
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;\">" +
                "  <h2 style=\"color: #2563eb; margin-bottom: 20px;\">Mã Xác Thực OTP - UrbanPark</h2>" +
                "  <p>Chào bạn,</p>" +
                "  <p>Bạn đang thực hiện yêu cầu xác thực tài khoản trên hệ thống bãi đỗ xe thông minh <strong>UrbanPark</strong>.</p>" +
                "  <p>Mã OTP của bạn là:</p>" +
                "  <div style=\"font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b; background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;\">" +
                "    <strong>" + otpCode + "</strong>" +
                "  </div>" +
                "  <p style=\"color: #64748b; font-size: 14px;\">Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>" +
                "  <hr style=\"border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;\" />" +
                "  <p style=\"color: #94a3b8; font-size: 12px; text-align: center;\">Đây là email tự động từ hệ thống UrbanPark. Vui lòng không phản hồi email này.</p>" +
                "</div>";

        System.out.println("=================================================");
        System.out.println("🔑 [MÃ OTP ĐƯỢC PHÁT HÀNH]: " + otpCode + " gửi tới " + toEmail);
        System.out.println("=================================================");

        // 1. Ưu tiên gửi qua Brevo API nếu có cấu hình (Gửi được tới mọi hòm thư không cần domain riêng)
        if (brevoApiKey != null && !brevoApiKey.trim().isEmpty()) {
            boolean success = sendViaBrevo(toEmail, subject, htmlContent);
            if (success) return;
            System.out.println("⚠️ Brevo gửi lỗi (ví dụ tài khoản chưa kích hoạt), tự động chuyển sang kênh dự phòng Resend...");
        }

        // 2. Tiếp theo gửi qua Resend API nếu có cấu hình (Chỉ gửi được tới email chính chủ tài khoản free)
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            boolean success = sendViaResend(toEmail, subject, htmlContent);
            if (success) return;
            System.out.println("⚠️ Resend gửi lỗi, tự động chuyển sang kênh dự phòng SMTP...");
        }

        // 3. Ngược lại, fallback về JavaMailSender (MailDev local hoặc SMTP thông thường)
        sendViaSmtp(toEmail, subject, htmlContent);
    }

    private void sendViaSmtp(String toEmail, String subject, String htmlContent) {
        boolean isLocalDev = "maildev".equalsIgnoreCase(mailHost) || "localhost".equalsIgnoreCase(mailHost) || "127.0.0.1".equals(mailHost);

        if (!isLocalDev && (mailSender == null || mailFrom == null || mailFrom.trim().isEmpty() || mailPassword == null || mailPassword.trim().isEmpty() || "DIEN_MAT_KHAU_UNG_DUNG_TAI_DAY".equals(mailPassword.trim()))) {
            System.err.println("⚠️ CẢNH BÁO: Gmail chưa được cấu hình hoàn chỉnh (thiếu MAIL_USERNAME hoặc MAIL_PASSWORD thật). Mã OTP chỉ được in ra console.");
            return;
        }

        String fromAddress = (mailFrom == null || mailFrom.trim().isEmpty()) ? "no-reply@urbanpark.com" : mailFrom;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(new jakarta.mail.internet.InternetAddress(fromAddress, "UrbanPark System", "UTF-8"));
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Đã gửi email xác thực OTP thành công tới " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ LỖI GỬI EMAIL: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private boolean sendViaBrevo(String toEmail, String subject, String htmlContent) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("accept", "application/json");
            headers.set("api-key", brevoApiKey.trim());

            Map<String, Object> body = new HashMap<>();
            
            // Sender info
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "UrbanPark System");
            sender.put("email", (mailFrom != null && !mailFrom.trim().isEmpty()) ? mailFrom.trim() : "thai050812@gmail.com");
            body.put("sender", sender);

            // Recipients list
            java.util.List<Map<String, String>> toList = new java.util.ArrayList<>();
            Map<String, String> to = new HashMap<>();
            to.put("email", toEmail);
            toList.add(to);
            body.put("to", toList);

            body.put("subject", subject);
            body.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Đã gửi email xác thực OTP thành công qua Brevo API tới " + toEmail);
                return true;
            } else {
                System.err.println("❌ LỖI GỬI EMAIL QUA BREVO: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ LỖI KẾT NỐI API BREVO: " + e.getMessage());
        }
        return false;
    }

    private boolean sendViaResend(String toEmail, String subject, String htmlContent) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + resendApiKey.trim());

            Map<String, Object> body = new HashMap<>();
            // Sử dụng email gửi mặc định của Resend cho tài khoản miễn phí
            body.put("from", "UrbanPark <onboarding@resend.dev>");
            body.put("to", toEmail);
            body.put("subject", subject);
            body.put("html", htmlContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://api.resend.com/emails", entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Đã gửi email xác thực OTP thành công qua Resend API tới " + toEmail);
                return true;
            } else {
                System.err.println("❌ LỖI GỬI EMAIL QUA RESEND: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ LỖI KẾT NỐI API RESEND: " + e.getMessage());
        }
        return false;
    }
}
