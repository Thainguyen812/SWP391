package com.parking.service;

import com.parking.dto.CreateViolationRequest;
import com.parking.model.ParkingViolation;

import java.util.List;
import java.util.UUID;

public interface ParkingViolationService {

    ParkingViolation createViolation(
            CreateViolationRequest request,
            String username
    );

    List<ParkingViolation> getAllViolations();

    ParkingViolation resolveViolation(UUID id, String status);
}