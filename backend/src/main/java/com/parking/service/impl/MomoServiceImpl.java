package com.parking.service.impl;

import com.parking.config.MomoConfig;
import com.parking.model.VipSubscription;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.MomoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class MomoServiceImpl implements MomoService {

    private final VipSubscriptionRepository vipRepo;
    private final MomoConfig momoConfig; // Thêm biến này vào
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Inject cả repo và config qua Constructor
    public MomoServiceImpl(VipSubscriptionRepository vipRepo, MomoConfig momoConfig) {
        this.vipRepo = vipRepo;
        this.momoConfig = momoConfig;
    }

    @Override
    public Map<String, String> createPaymentUrl(UUID subscriptionId) {
        try {
            VipSubscription vip = vipRepo.findById(subscriptionId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đăng ký VIP"));

            String orderId = subscriptionId.toString();
            String requestId = UUID.randomUUID().toString();
            String orderInfo = "Thanh toán gói VIP bãi xe: " + vip.getSubscriptionType();
            String amount = vip.getFeeAmount().longValue() + "";
            String requestType = "captureWallet";
            String extraData = ""; 

            // 1. Đổi các biến tĩnh cũ thành gọi qua hàm get của momoConfig
            String rawHash = "accessKey=" + momoConfig.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + momoConfig.getIpnUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + momoConfig.getPartnerCode() +
                    "&redirectUrl=" + momoConfig.getRedirectUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            // 2. Băm chuỗi dữ liệu thô
            String signature = hmacSHA256(momoConfig.getSecretKey(), rawHash);

            // 3. Đóng gói dữ liệu Body gửi sang MoMo
            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", momoConfig.getPartnerCode());
            body.put("partnerName", "Bãi Xe Thông Minh FPTU");
            body.put("storeId", "FPTUParking");
            body.put("requestId", requestId);
            body.put("amount", Long.parseLong(amount));
            body.put("orderId", orderId);
            body.put("orderInfo", orderInfo);
            body.put("redirectUrl", momoConfig.getRedirectUrl());
            body.put("ipnUrl", momoConfig.getIpnUrl());
            body.put("lang", "vi");
            body.put("extraData", extraData);
            body.put("requestType", requestType);
            body.put("signature", signature);

            String jsonBody = objectMapper.writeValueAsString(body);

            // 4. Thực hiện lệnh gọi HTTP POST Request
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(momoConfig.getEndpoint()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            // 5. Đọc phản hồi trả về
            Map<String, Object> result = objectMapper.readValue(response.body(), Map.class);
            String payUrl = (String) result.get("payUrl");

            Map<String, String> responseData = new HashMap<>();
            responseData.put("paymentUrl", payUrl);

            return responseData;

        } catch (Exception e) {
            throw new RuntimeException("Quá trình kết nối tạo link MoMo thất bại: " + e.getMessage());
        }
    }

    private String hmacSHA256(String key, String data) {
        try {
            javax.crypto.Mac sha256_HMAC = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secret_key = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] raw = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}