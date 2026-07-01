package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.model.ParkingSession;
import com.parking.repository.VehicleRepository;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/gate")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GateController {

    private final VehicleRepository vehicleRepo;
    private final ParkingSessionRepository sessionRepo;
    private final com.parking.service.ParkingService parkingService;

    public GateController(VehicleRepository vehicleRepo, ParkingSessionRepository sessionRepo, com.parking.service.ParkingService parkingService) {
        this.vehicleRepo = vehicleRepo;
        this.sessionRepo = sessionRepo;
        this.parkingService = parkingService;
    }

    public static class GateScanRequest {
        public String plate;
        public String cardCode;
        public String qrToken;
        public String gate;
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanGate(@RequestBody GateScanRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // Anti-theft logic
        if (request.plate != null && !request.plate.isEmpty()) {
            Optional<Vehicle> optVehicle = vehicleRepo.findByLicensePlate(request.plate);
            if (optVehicle.isPresent() && optVehicle.get().isLocked()) {
                response.put("success", false);
                response.put("error", "VEHICLE_LOCKED");
                Map<String, Object> vehicleData = new HashMap<>();
                vehicleData.put("plate", request.plate);
                Map<String, Object> dataMap = new HashMap<>();
                dataMap.put("vehicle", vehicleData);
                response.put("data", dataMap);
                return ResponseEntity.ok(response);
            }
        }

        // QR Fallback logic: check for active session
        if (request.plate != null && !request.plate.isEmpty()) {
            Optional<ParkingSession> optSession = sessionRepo.findByLicensePlateAndSessionStatus(request.plate, ParkingSession.SessionStatus.ACTIVE);
            if (optSession.isPresent()) {
                ParkingSession session = optSession.get();
                if (Boolean.TRUE.equals(session.getQrFallbackUsed())) {
                    if (request.qrToken == null || request.qrToken.isEmpty()) {
                        response.put("success", false);
                        response.put("error", "QR_FALLBACK_REQUIRED");
                        Map<String, Object> vehicleData = new HashMap<>();
                        vehicleData.put("plate", request.plate);
                        Map<String, Object> dataMap = new HashMap<>();
                        dataMap.put("vehicle", vehicleData);
                        response.put("data", dataMap);
                        return ResponseEntity.ok(response);
                    }
                }
            }
        }

        // Thực hiện gọi Check-in thực tế
        try {
            if (request.cardCode != null && !request.cardCode.isEmpty()) {
                // Có thẻ -> Khách vãng lai Check-in
                com.parking.dto.VisitorCheckInRequest visitorReq = new com.parking.dto.VisitorCheckInRequest();
                visitorReq.setPlate(request.plate);
                visitorReq.setCard_code(request.cardCode);
                visitorReq.setVehicle_type("CAR"); // Default for now
                visitorReq.setGate(request.gate);
                com.parking.dto.CheckInResponse checkInResponse = parkingService.visitorCheckIn(visitorReq);
                
                response.put("success", true);
                response.put("message", "Check-in khách vãng lai thành công");
                response.put("data", checkInResponse);
                return ResponseEntity.ok(response);
                
            } else if (request.plate != null && !request.plate.isEmpty()) {
                // Chỉ có biển số -> AI Camera Check-in cho xe VIP
                com.parking.dto.AiCheckInRequest aiReq = new com.parking.dto.AiCheckInRequest();
                aiReq.setPlate(request.plate);
                aiReq.setVehicle_type("CAR");
                aiReq.setConfidence_score(99.0);
                aiReq.setCamera_id(request.gate);
                com.parking.dto.CheckInResponse checkInResponse = parkingService.aiCheckIn(aiReq);
                
                response.put("success", true);
                response.put("message", "Check-in AI thành công");
                response.put("data", checkInResponse);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }

        response.put("success", true);
        response.put("message", "Quét " + (request.plate != null && !request.plate.isEmpty() ? request.plate : "thẻ/QR") + " thành công tại " + request.gate);
        
        Map<String, Object> vehicleData = new HashMap<>();
        vehicleData.put("plate", request.plate);
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("vehicle", vehicleData);
        response.put("data", dataMap);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearGateLogs() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}

