package com.parking.controller;

import com.parking.service.ParkingService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/parking")
@Profile({ "dev", "test" })
@PreAuthorize("hasRole('ADMIN')") // 2. THÊM DÒNG NÀY: Khóa cứng toàn bộ các hành động dọn dẹp chỉ cho ADMIN
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
