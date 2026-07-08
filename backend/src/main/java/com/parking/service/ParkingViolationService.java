package com.parking.service;

import com.parking.dto.CreateViolationRequest;
import com.parking.model.ParkingViolation;

public interface ParkingViolationService {

    ParkingViolation createViolation(
            CreateViolationRequest request,
            String username
    );
}