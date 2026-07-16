package com.parking.controller;

import com.parking.model.VipSubscription;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.MomoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/momo")
public class MomoController {

    private final MomoService momoService;
    private final VipSubscriptionRepository vipRepo;

    public MomoController(MomoService momoService, VipSubscriptionRepository vipRepo) {
        this.momoService = momoService;
        this.vipRepo = vipRepo;
    }

    // 1. API gọi tạo link thanh toán MoMo (Frontend sẽ gọi API này)
    @PostMapping("/create-payment/{subscriptionId}")
    public ResponseEntity<?> createPayment(@PathVariable UUID subscriptionId) {
        Map<String, String> response = momoService.createPaymentUrl(subscriptionId);
        return ResponseEntity.ok(response);
    }

    // 2. API Callback (IPN Webhook) nhận kết quả ngầm trả về từ hệ thống MoMo
    // Lưu ý: API này CẦN được permitAll() tự do trong SecurityConfig công khai để MoMo có thể kết nối thành công.
    @PostMapping("/momo-ipn")
    public ResponseEntity<?> receiveMomoIPN(@RequestBody Map<String, Object> requestParams) {
        try {
            // MoMo Sandbox báo trạng thái giao dịch qua trường resultCode (Số 0 nghĩa là thành công hoàn toàn)
            Integer resultCode = (Integer) requestParams.get("resultCode");
            String orderIdStr = (String) requestParams.get("orderId"); 

            if (orderIdStr != null) {
                UUID subscriptionId = UUID.fromString(orderIdStr);
                Optional<VipSubscription> vipOpt = vipRepo.findById(subscriptionId);

                if (vipOpt.isPresent()) {
                    VipSubscription vip = vipOpt.get();

                    if (vip.getStatus() != VipSubscription.Status.PENDING_APPROVAL) {
                        if (resultCode != null && resultCode == 0) {
                            vip.setPaymentStatus("SUCCESS");
                            vip.setStatus(VipSubscription.Status.PENDING_APPROVAL); // Đẩy qua trạng thái chờ Admin duyệt
                        } else {
                            vip.setPaymentStatus("FAILED");
                        }
                        vip.setUpdatedAt(java.time.Instant.now());
                        vipRepo.save(vip);
                    }
                }
            }
            // Trả về mã HTTP 204 No Content cho máy chủ MoMo xác nhận đã hứng dữ liệu thành công
            return ResponseEntity.noContent().build(); 
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
