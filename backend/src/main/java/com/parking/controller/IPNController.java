package com.parking.controller;

import com.parking.model.VipSubscription;
import com.parking.repository.VipSubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/payment", "/api/payment"})
public class IPNController {

    private final VipSubscriptionRepository vipRepo;
    private final String vnp_HashSecret = "W5QQCZ0C958UEDBFXCA439X0ET0XKM5A"; // Trùng với Service nhé

    public IPNController(VipSubscriptionRepository vipRepo) {
        this.vipRepo = vipRepo;
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<?> receiveIPN(@RequestParam Map<String, String> requestParams) {
        try {
            // 1. Xác thực chữ ký bảo mật (Secure Hash) từ VNPay gửi sang để tránh bị hack giả mạo dữ liệu
            String vnp_SecureHash = requestParams.get("vnp_SecureHash");
            requestParams.remove("vnp_SecureHash");
            requestParams.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(requestParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = requestParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }
            String calculatedHash = hmacSHA512(vnp_HashSecret, hashData.toString());

            // Kiểm tra xem chữ ký trùng khớp không
            if (!calculatedHash.equals(vnp_SecureHash)) {
                return ResponseEntity.ok("{\"RspCode\":\"97\",\"Message\":\"Invalid Signature\"}");
            }

            // 2. Lấy thông tin đơn hàng từ VNPay gửi về
            String orderIdStr = requestParams.get("vnp_TxnRef"); // Đây chính là ID của VipSubscription hoặc TOPUP
            String vnp_ResponseCode = requestParams.get("vnp_ResponseCode"); // Mã trạng thái thanh toán

            if (orderIdStr != null && orderIdStr.startsWith("TOPUP-")) {
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            }

            UUID subscriptionId = UUID.fromString(orderIdStr);
            Optional<VipSubscription> vipOpt = vipRepo.findById(subscriptionId);

            if (vipOpt.isPresent()) {
                VipSubscription vip = vipOpt.get();

                if (!"SUCCESS".equals(vip.getPaymentStatus())) {
                    
                    if ("00".equals(vnp_ResponseCode)) {
                        // "00" có nghĩa là người dùng đã thanh toán thành công tiền cho VNPay
                        vip.setPaymentStatus("SUCCESS");
                        // Chuyển trạng thái gói VIP sang PENDING_APPROVAL (Chờ Admin duyệt cà vẹt)
                        vip.setStatus(VipSubscription.Status.PENDING_APPROVAL); 
                    } else {
                        // Thanh toán thất bại hoặc người dùng hủy đơn
                        vip.setPaymentStatus("FAILED");
                    }
                    
                    vip.setUpdatedAt(java.time.Instant.now());
                    vipRepo.save(vip); // Lưu lại vào Database
                }
                
                // Trả về đúng định dạng VNPay yêu cầu để xác nhận đã xử lý IPN thành công
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            } else {
                return ResponseEntity.ok("{\"RspCode\":\"01\",\"Message\":\"Order Not Found\"}");
            }

        } catch (Exception e) {
            return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown Error\"}");
        }
    }

    private String hmacSHA512(final String key, final String data) {
        try {
            final javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }
}