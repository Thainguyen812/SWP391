package com.parking.service;

import com.parking.model.ParkingViolation;
import java.util.List;
import java.util.UUID;

public interface ParkingViolationService {

    ParkingViolation createViolation(UUID sessionId, String violationType, String photoUrls, UUID detectedBy, UUID slotId, String notes);

    List<ParkingViolation> getAllViolations();

    ParkingViolation resolveViolation(UUID id, String status);
}