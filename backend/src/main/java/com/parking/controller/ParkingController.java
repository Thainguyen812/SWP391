package com.parking.controller;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;
import com.parking.dto.CongestionCheckoutRequest;
import com.parking.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.parking.dto.VisitorCheckInRequest;// TASK 5
import com.parking.dto.CongestionCheckoutRequest; // task 7 

// phần 1 / check out task 5
import java.util.UUID;
import com.parking.model.Transaction;
//

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

        public String getDetectedPlate() {
            return detectedPlate;
        }

        public void setDetectedPlate(String detectedPlate) {
            this.detectedPlate = detectedPlate;
        }

        public String getQrToken() {
            return qrToken;
        }

        public void setQrToken(String qrToken) {
            this.qrToken = qrToken;
        }
    }

    // CHECK IN VISITOR
    @PostMapping("/check-in/visitor")
    public ResponseEntity<CheckInResponse> visitorCheckIn(@RequestBody VisitorCheckInRequest request) {
        CheckInResponse response = parkingService.visitorCheckIn(request); // gọi qua serviceyml
        return ResponseEntity.status(201).body(response);
    }

    // phần 1 / check out VISITOR task 5
    @PostMapping("/checkout/{cardId}")
    public ResponseEntity<Transaction> checkout(
            @PathVariable UUID cardId) {
        return ResponseEntity.ok(
                parkingService.checkoutCard(cardId));
    }

    @PostMapping("/congestion/checkout") // check out lưu động 
    public ResponseEntity<Transaction> congestionCheckout(
            @RequestBody CongestionCheckoutRequest request) {
        return ResponseEntity.ok(
                parkingService.congestionCheckout(request)); //nhảy qua serviceyml để xử lý 
    }
}
