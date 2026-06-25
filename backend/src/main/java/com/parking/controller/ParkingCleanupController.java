package com.parking.controller;

import com.parking.service.ParkingService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/parking")
// @Profile({"dev", "test"})
public class ParkingCleanupController {

    private final ParkingService parkingService;

    public ParkingCleanupController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping("/cleanup")
    public ResponseEntity<?> cleanup() {
        parkingService.cleanupTestData();
        return ResponseEntity.ok("CLEANUP_SUCCESS");
    }
}
