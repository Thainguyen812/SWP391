package com.parking.controller;

import com.parking.dto.CreateViolationRequest;
import com.parking.model.ParkingViolation;
import com.parking.service.ParkingViolationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/violations")
public class ParkingViolationController {

    private final ParkingViolationService parkingViolationService;

    public ParkingViolationController(
            ParkingViolationService parkingViolationService) {
        this.parkingViolationService = parkingViolationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ParkingViolation> createViolation(
            @Valid @RequestBody CreateViolationRequest request,
            Authentication authentication) {

        ParkingViolation violation =
                parkingViolationService.createViolation(
                        request,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(violation);
    }
}