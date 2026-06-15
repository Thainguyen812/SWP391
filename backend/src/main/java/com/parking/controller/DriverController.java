package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.VipQrIdentifier;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VipQrIdentifierRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/driver")
public class DriverController {

    private final VipQrIdentifierRepository qrRepo;
    private final ParkingSessionRepository sessionRepo;

    public DriverController(VipQrIdentifierRepository qrRepo, ParkingSessionRepository sessionRepo) {
        this.qrRepo = qrRepo;
        this.sessionRepo = sessionRepo;
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

    @PutMapping("/vehicle/lock")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> lockVehicle(@RequestBody LockVehicleRequest req) {
        List<ParkingSession> activeSessions = sessionRepo.findByVehicleIdAndSessionStatusIn(
                req.getVehicleId(),
                List.of(ParkingSession.SessionStatus.ACTIVE, ParkingSession.SessionStatus.PASSED_CONFIRMED)
        );

        if (activeSessions.isEmpty()) {
            return ResponseEntity.status(404).body("Không tìm thấy phiên gửi xe hoạt động cho phương tiện này!");
        }

        for (ParkingSession session : activeSessions) {
            session.setIsLocked(req.getLockStatus());
            sessionRepo.save(session);
        }

        return ResponseEntity.ok("Cập nhật trạng thái khóa chống trộm thành công!");
    }

    // Helper DTOs
    public static class GenerateQrRequest {
        private UUID vehicleId;
        private String purpose;

        public UUID getVehicleId() { return vehicleId; }
        public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }
        public String getPurpose() { return purpose; }
        public void setPurpose(String purpose) { this.purpose = purpose; }
    }

    public static class LockVehicleRequest {
        private UUID vehicleId;
        private Boolean lockStatus;

        public UUID getVehicleId() { return vehicleId; }
        public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }
        public Boolean getLockStatus() { return lockStatus; }
        public void setLockStatus(Boolean lockStatus) { this.lockStatus = lockStatus; }
    }
}
