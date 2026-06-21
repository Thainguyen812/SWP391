package com.parking.controller;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;
import com.parking.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/parking")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping("/check-in/ai")
    public ResponseEntity<CheckInResponse> aiCheckIn(@Valid @RequestBody AiCheckInRequest request) {
        CheckInResponse resp = parkingService.aiCheckIn(request);
        return ResponseEntity.status(201).body(resp);
    }

    @PostMapping("/verify-exit-qr")
    public ResponseEntity<?> verifyExitQr(@RequestBody VerifyExitQrRequest request) {
        parkingService.verifyExitQr(request.getDetectedPlate(), request.getQrToken());
        return ResponseEntity.ok("MATCH — VIP QR EXIT");
    }

    public static class VerifyExitQrRequest {
        private String detectedPlate;
        private String qrToken;

        public String getDetectedPlate() { return detectedPlate; }
        public void setDetectedPlate(String detectedPlate) { this.detectedPlate = detectedPlate; }
        public String getQrToken() { return qrToken; }
        public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    }
}
