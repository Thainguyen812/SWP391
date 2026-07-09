package com.parking.controller;

import com.parking.dto.CreateViolationRequest;
import com.parking.model.ParkingViolation;
import com.parking.service.ParkingViolationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/violations")
public class ParkingViolationController {

    private final ParkingViolationService violationService;

    public ParkingViolationController(
            ParkingViolationService violationService) {
        this.violationService = violationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<ParkingViolation> createViolation(
            @RequestBody CreateViolationRequest request,
            Authentication authentication) {

        ParkingViolation created =
                violationService.createViolation(
                        request,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ParkingViolation>> getAllViolations() {
        return ResponseEntity.ok(
                violationService.getAllViolations()
        );
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ParkingViolation> resolveViolation(
            @PathVariable UUID id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                violationService.resolveViolation(id, status)
        );
    }
}