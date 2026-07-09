package com.parking.controller;

import com.parking.dto.VipRegistrationRequest;
import com.parking.model.User;
import com.parking.model.VipSubscription;
import com.parking.dto.VipSubscriptionResponseDTO;
import com.parking.repository.UserRepository;
import com.parking.service.ParkingService;
import com.parking.service.VipService;
import com.parking.service.VNPayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/vip", "/api/vip"})
public class VipController {

    private final VipService vipService;
    private final ParkingService parkingService;
    private final UserRepository userRepository;
    private final VNPayService vnpayService;

    public VipController(VipService vipService, ParkingService parkingService, UserRepository userRepository,VNPayService vnpayService) {
        this.vipService = vipService;
        this.parkingService = parkingService;
        this.userRepository = userRepository;
        this.vnpayService = vnpayService;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')") // Chỉ quản lý được xem danh sách chờ
    public List<VipSubscriptionResponseDTO> getPending() {
        return vipService.getPending();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('MANAGER')")
    public List<VipSubscription> getAll() {
        return vipService.getAll();
    }



   @PostMapping("/register")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<?> register(@RequestBody VipRegistrationRequest request, 
                                      Principal principal, 
                                      HttpServletRequest servletRequest) {
        if (principal != null) {
            User user = userRepository.findByUsername(principal.getName()).orElse(null);
            if (user != null) {
                request.setOwnerId(user.getId());
            }
        }
        
        try {
            VipSubscription subscription = vipService.register(request);
            String ipAddress = servletRequest.getRemoteAddr();
            long amount = subscription.getFeeAmount() != null ? subscription.getFeeAmount().longValue() : 500000;
            
            // Bước D: Gọi VNPayService để tạo Link thanh toán
            String paymentUrl = vnpayService.createPaymentUrl(
                subscription.getId().toString(), 
                amount, 
                ipAddress
            );
            
            // Bước E: Trả link về cho Frontend
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi trong quá trình tạo link thanh toán VNPay: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> approveVip(@PathVariable UUID id, Principal principal) {
        String username = principal.getName();
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.parking.exception.ApiExceptions.NotFoundException(
                        "Không tìm thấy thông tin quản lý"));

        parkingService.approveVipSubscription(id, "ACTIVE", null, manager.getId());
        return ResponseEntity.ok("Phê duyệt hồ sơ đăng ký VIP thành công!");
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> rejectVip(@PathVariable UUID id, @RequestBody RejectRequest req, Principal principal) {
        String username = principal.getName();
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.parking.exception.ApiExceptions.NotFoundException(
                        "Không tìm thấy thông tin quản lý"));

        parkingService.approveVipSubscription(id, "REJECTED", req.getReason(), manager.getId());
        return ResponseEntity.ok("Từ chối hồ sơ đăng ký VIP thành công!");
    }

    public static class RejectRequest {
        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
