package com.parking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/gate")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GateController {

    public static class GateScanRequest {
        public String plate;
        public String cardCode;
        public String qrToken;
        public String gate;
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanGate(@RequestBody GateScanRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.plate != null && request.plate.equals("LOCKED-PLATE")) {
            response.put("success", false);
            response.put("error", "VEHICLE_LOCKED");
            Map<String, Object> vehicleData = new HashMap<>();
            vehicleData.put("plate", request.plate);
            Map<String, Object> dataMap = new HashMap<>();
            dataMap.put("vehicle", vehicleData);
            response.put("data", dataMap);
            return ResponseEntity.ok(response);
        }

        response.put("success", true);
        response.put("message", "Quét " + (request.plate != null && !request.plate.isEmpty() ? request.plate : "thẻ/QR") + " thành công t?i " + request.gate);
        
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
