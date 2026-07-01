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

    public GateController(VehicleRepository vehicleRepo, ParkingSessionRepository sessionRepo) {
        this.vehicleRepo = vehicleRepo;
        this.sessionRepo = sessionRepo;
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
            } else if (request.qrToken != null && !request.qrToken.isEmpty()) {
                // Mock logic for dashboard check-in: If qrToken is present and no session exists, we assume it's a QR Check-in
            }
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

