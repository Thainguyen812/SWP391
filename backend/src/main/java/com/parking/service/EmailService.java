package com.parking.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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
}
