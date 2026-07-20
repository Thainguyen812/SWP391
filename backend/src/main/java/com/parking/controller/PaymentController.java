package com.parking.controller;

import com.parking.service.VNPayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/payment", "/api/payment"})
public class PaymentController {

    private final VNPayService vnpayService;

    public PaymentController(VNPayService vnpayService) {
        this.vnpayService = vnpayService;
    }

    @PostMapping("/create-url")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<?> createPaymentUrl(@RequestBody Map<String, Object> request, HttpServletRequest servletRequest) {
        try {
            long amount = ((Number) request.get("amount")).longValue();
            String orderId = "TOPUP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String ipAddress = servletRequest.getRemoteAddr();

            // Resolve dynamic return URL from client headers (Origin / Referer)
            String origin = servletRequest.getHeader("Origin");
            if (origin == null || origin.isEmpty()) {
                origin = servletRequest.getHeader("Referer");
            }
            String customReturnUrl = null;
            if (origin != null && !origin.isEmpty()) {
                // Remove trailing slash if exists
                if (origin.endsWith("/")) {
                    origin = origin.substring(0, origin.length() - 1);
                }
                // If it contains paths (like Referer), strip down to domain + port
                if (origin.startsWith("http://") || origin.startsWith("https://")) {
                    int firstSlashAfterProto = origin.indexOf("/", 8);
                    if (firstSlashAfterProto != -1) {
                        origin = origin.substring(0, firstSlashAfterProto);
                    }
                }
                customReturnUrl = origin + "/payment-success";
            }

            String paymentUrl = vnpayService.createPaymentUrl(orderId, amount, ipAddress, customReturnUrl);

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo link thanh toán: " + e.getMessage());
        }
    }
}
