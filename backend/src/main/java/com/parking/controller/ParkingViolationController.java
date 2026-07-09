package com.parking.controller;

import com.parking.model.ParkingViolation;
import com.parking.service.ParkingViolationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/violations")
public class ParkingViolationController {

    private final ParkingViolationService violationService;

    public ParkingViolationController(ParkingViolationService violationService) {
        this.violationService = violationService;
    }

    // 1. API cho Bảo vệ (Staff) tạo báo cáo
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<ParkingViolation> create(@RequestBody ViolationRequest req) {
        ParkingViolation created = violationService.createViolation(
                req.getSessionId(),
                req.getViolationType(),
                req.getPhotoUrls(),
                req.getDetectedBy(),
                req.getSlotId(),
                req.getNotes()
        );
        return ResponseEntity.ok(created);
    }

    // 2. API cho Admin/Manager lấy danh sách
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<ParkingViolation>> getAll() {
        return ResponseEntity.ok(violationService.getAllViolations());
    }

    // 3. API cho Admin/Manager xử lý trạng thái
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ParkingViolation> resolve(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(violationService.resolveViolation(id, status));
    }

    // DTO hứng data gửi lên từ Frontend phù hợp với Entity mới
    public static class ViolationRequest {
        private UUID sessionId;
        private String violationType;
        private String photoUrls;
        private UUID detectedBy;
        private UUID slotId;
        private String notes;

        // Getters & Setters
        public UUID getSessionId() { return sessionId; }
        public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
        public String getViolationType() { return violationType; }
        public void setViolationType(String violationType) { this.violationType = violationType; }
        public String getPhotoUrls() { return photoUrls; }
        public void setPhotoUrls(String photoUrls) { this.photoUrls = photoUrls; }
        public UUID getDetectedBy() { return detectedBy; }
        public void setDetectedBy(UUID detectedBy) { this.detectedBy = detectedBy; }
        public UUID getSlotId() { return slotId; }
        public void setSlotId(UUID slotId) { this.slotId = slotId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}