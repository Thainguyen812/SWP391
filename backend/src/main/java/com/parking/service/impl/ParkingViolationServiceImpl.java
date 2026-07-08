package com.parking.service.impl;

import com.parking.model.ParkingViolation;
import com.parking.repository.ParkingViolationRepository; 
import com.parking.service.ParkingViolationService;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ParkingViolationServiceImpl implements ParkingViolationService {

    private final ParkingViolationRepository violationRepo;

    public ParkingViolationServiceImpl(ParkingViolationRepository violationRepo) {
        this.violationRepo = violationRepo;
    }

    @Override
    public ParkingViolation createViolation(UUID sessionId, String violationType, String photoUrls, UUID detectedBy, UUID slotId, String notes) {
        ParkingViolation violation = new ParkingViolation();
        violation.setId(UUID.randomUUID());
        violation.setSessionId(sessionId);
        violation.setViolationType(violationType != null ? violationType : "EV_ZONE_MISUSE");
        violation.setPhotoUrls(photoUrls != null ? photoUrls : "[]");
        violation.setDetectedBy(detectedBy);
        violation.setSlotId(slotId);
        violation.setNotes(notes);
        
        violation.setDetectedAt(Instant.now());
        violation.setStatus("PENDING"); // Mặc định là PENDING theo Entity của bạn

        return violationRepo.save(violation);
    }

    @Override
    public List<ParkingViolation> getAllViolations() {
        return violationRepo.findAll();
    }

    @Override
    public ParkingViolation resolveViolation(UUID id, String status) {
        ParkingViolation violation = violationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vi phạm với ID: " + id));
        
        violation.setStatus(status); 
        return violationRepo.save(violation);
    }
}