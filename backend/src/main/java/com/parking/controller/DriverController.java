package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.VipQrIdentifier;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VipQrIdentifierRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.parking.model.User;
import com.parking.model.Vehicle;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import org.springframework.security.core.Authentication;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/driver")
public class DriverController {

    private final VipQrIdentifierRepository qrRepo;
    private final ParkingSessionRepository sessionRepo;
    private final ParkingService parkingService;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final VipSubscriptionRepository vipSubscriptionRepository;

    public DriverController(
            VipQrIdentifierRepository qrRepo,
            ParkingSessionRepository sessionRepo,
            ParkingService parkingService,
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            VipSubscriptionRepository vipSubscriptionRepository) {

        this.qrRepo = qrRepo;
        this.sessionRepo = sessionRepo;
        this.parkingService = parkingService;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.vipSubscriptionRepository = vipSubscriptionRepository;
    }

    @PostMapping("/qr/generate")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<VipQrIdentifier> generateQr(@RequestBody GenerateQrRequest req) {
        VipQrIdentifier qr = new VipQrIdentifier();
        qr.setId(UUID.randomUUID());
        qr.setVehicleId(req.getVehicleId());
        qr.setQrToken(UUID.randomUUID().toString());
        qr.setPurpose(req.getPurpose() != null ? req.getPurpose() : "CHECK_OUT");
        qr.setExpiredAt(Instant.now().plusSeconds(300)); // 5 minutes
        qr.setUsed(false);
        qr.setCreatedAt(Instant.now());

        qrRepo.save(qr);
        return ResponseEntity.status(201).body(qr);
    }

    // 2. Khóa xe chống trộm: Tài xế VIP tự khóa xe họ, hoặc MANAGER hỗ trợ khóa từ
    // xa qua tổng đài
    @PutMapping("/vehicle/lock")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<?> lockVehicle(@RequestBody LockVehicleRequest req) {
        // Chỉ cho phép khóa xe nếu xe đó đã đăng ký VIP và gói cước đang ACTIVE
        Optional<com.parking.model.VipSubscription> vipSub = vipSubscriptionRepository
                .findByVehicleIdAndStatus(req.getVehicleId(), com.parking.model.VipSubscription.Status.ACTIVE);
        if (vipSub.isEmpty()) {
            return ResponseEntity.badRequest().body("Chỉ phương tiện có gói VIP đang hoạt động mới được sử dụng tính năng khóa xe!");
        }

        List<ParkingSession> activeSessions = sessionRepo.findByVehicleIdAndSessionStatusIn(
                req.getVehicleId(),
                List.of(ParkingSession.SessionStatus.ACTIVE, ParkingSession.SessionStatus.PASSED_CONFIRMED));

        if (activeSessions.isEmpty()) {
            return ResponseEntity.status(404).body("Không tìm thấy phiên gửi xe hoạt động cho phương tiện này!");
        }

        for (ParkingSession session : activeSessions) {
            session.setIsLocked(req.getLockStatus());
            sessionRepo.save(session);
        }

        return ResponseEntity.ok("Cập nhật trạng thái khóa chống trộm thành công!");
    }

    // 3. Xem trạng thái xe: Chỉ tài xế VIP kiểm tra tình trạng xe của mình
    @GetMapping("/vehicle/{vehicleId}/status")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<java.util.Map<String, Object>> getVehicleStatus(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(parkingService.getVehicleStatus(vehicleId));
    }

    // Helper DTOs
    public static class GenerateQrRequest {
        private UUID vehicleId;
        private String purpose;

        public UUID getVehicleId() {
            return vehicleId;
        }

        public void setVehicleId(UUID vehicleId) {
            this.vehicleId = vehicleId;
        }

        public String getPurpose() {
            return purpose;
        }

        public void setPurpose(String purpose) {
            this.purpose = purpose;
        }
    }

    public static class LockVehicleRequest {
        private UUID vehicleId;
        private Boolean lockStatus;

        public UUID getVehicleId() {
            return vehicleId;
        }

        public void setVehicleId(UUID vehicleId) {
            this.vehicleId = vehicleId;
        }

        public Boolean getLockStatus() {
            return lockStatus;
        }

        public void setLockStatus(Boolean lockStatus) {
            this.lockStatus = lockStatus;
        }
    }

    //API lấy danh sách xe của chính chủ
    @GetMapping("/vehicles")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<Vehicle>> getMyVehicles(Authentication authentication) {

        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Vehicle> vehicles = vehicleRepository.findByOwnerId(currentUser.getId());

        return ResponseEntity.ok(vehicles);
    }

}
