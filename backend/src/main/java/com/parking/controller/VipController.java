package com.parking.controller;

import com.parking.dto.VipRegistrationRequest;
import com.parking.model.User;
import com.parking.model.VipSubscription;
import com.parking.repository.UserRepository;
import com.parking.service.ParkingService;
import com.parking.service.VipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/vip", "/api/vip"})
public class VipController {

    private final VipService vipService;
    private final ParkingService parkingService;
    private final UserRepository userRepository;

    public VipController(VipService vipService, ParkingService parkingService, UserRepository userRepository) {
        this.vipService = vipService;
        this.parkingService = parkingService;
        this.userRepository = userRepository;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')") // Chỉ quản lý được xem danh sách chờ
    public List<VipSubscription> getPending() {
        return vipService.getPending();
    }



    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public VipSubscription register(@RequestBody VipRegistrationRequest request) {
        return vipService.register(request);
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
