package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.model.ParkingSession;
import com.parking.repository.VehicleRepository;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.parking.repository.VipSubscriptionRepository;
import com.parking.repository.ZoneRepository;
import com.parking.service.DemoVehicleDataset;
import com.parking.service.ParkingService;
import com.parking.service.PendingGateVehicleService;
import com.parking.model.Transaction;

@RestController
@RequestMapping("/api/gate")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
public class GateController {

    private final VehicleRepository vehicleRepo;
    private final ParkingSessionRepository sessionRepo;
    private final VipSubscriptionRepository vipSubscriptionRepository;
    private final ZoneRepository zoneRepo;
    private final ParkingService parkingService;
    private final PendingGateVehicleService pendingGateVehicleService;

    public GateController(VehicleRepository vehicleRepo, 
                          ParkingSessionRepository sessionRepo,
                          VipSubscriptionRepository vipSubscriptionRepository,
                          ZoneRepository zoneRepo,
                          ParkingService parkingService,
                          PendingGateVehicleService pendingGateVehicleService) {
        this.vehicleRepo = vehicleRepo;
        this.sessionRepo = sessionRepo;
        this.vipSubscriptionRepository = vipSubscriptionRepository;
        this.zoneRepo = zoneRepo;
        this.parkingService = parkingService;
        this.pendingGateVehicleService = pendingGateVehicleService;
    }

    public static class GateScanRequest {
        public String plate;
        public String cardCode;
        public String qrToken;
        public String gate;
        public String vehicleType;
        public String fuelType;
        public String imageUrl;
        public String direction;
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanGate(@RequestBody GateScanRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Anti-theft logic
        String normalizedPlate = DemoVehicleDataset.normalizePlate(request.plate);

        if (!normalizedPlate.isEmpty()) {
            Optional<Vehicle> optVehicle = vehicleRepo.findByLicensePlate(normalizedPlate);
            if (optVehicle.isPresent() && optVehicle.get().isLocked()) {
                response.put("success", false);
                response.put("error", "VEHICLE_LOCKED");
                Map<String, Object> vehicleData = new HashMap<>();
                vehicleData.put("plate", normalizedPlate);
                Map<String, Object> dataMap = new HashMap<>();
                dataMap.put("vehicle", vehicleData);
                response.put("data", dataMap);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        }

        try {
            // Determine Direction (Entrance vs Exit)
            boolean isEntrance = true;
            if (request.direction != null && !request.direction.trim().isEmpty()) {
                String direction = request.direction.trim().toUpperCase();
                isEntrance = !direction.equals("EXIT") && !direction.equals("OUT") && !direction.equals("RA");
            } else if (request.gate != null) {
                String gateLower = request.gate.toLowerCase();
                if (gateLower.contains("ra") || gateLower.contains("out") || gateLower.contains("exit")) {
                    isEntrance = false;
                }
            }

            if (isEntrance) {
                // Entrance Gate Logic
                boolean isVip = false;
                Optional<Vehicle> optVehicle = Optional.empty();
                if (!normalizedPlate.isEmpty()) {
                    String plateStr = normalizedPlate;
                    optVehicle = vehicleRepo.findByLicensePlate(plateStr);
                    if (optVehicle.isPresent()) {
                        Vehicle vehicle = optVehicle.get();
                        Optional<com.parking.model.VipSubscription> vipSub = vipSubscriptionRepository
                                .findByVehicleIdAndStatus(vehicle.getId(), com.parking.model.VipSubscription.Status.ACTIVE);
                        if (vipSub.isPresent()) {
                            java.time.LocalDate today = java.time.LocalDate.now();
                            isVip = !today.isBefore(vipSub.get().getStartDate())
                                    && !today.isAfter(vipSub.get().getEndDate());
                        }
                    }
                    if (!isVip) {
                        Optional<ParkingSession> activeSessionOpt = sessionRepo.findByLicensePlateAndSessionStatus(plateStr, ParkingSession.SessionStatus.ACTIVE);
                        if (activeSessionOpt.isPresent() && Boolean.TRUE.equals(activeSessionOpt.get().getIsVip())) {
                            isVip = true;
                        }
                    }
                }

                String fallbackVehicleType = optVehicle.isPresent() ? optVehicle.get().getVehicleSize() : request.vehicleType;
                String resolvedVehicleType = DemoVehicleDataset.resolveVehicleType(normalizedPlate, fallbackVehicleType);
                String resolvedFuelType = DemoVehicleDataset.resolveFuelType(
                        normalizedPlate,
                        optVehicle.isPresent() ? optVehicle.get().getFuelType() : request.fuelType);
                String resolvedImageUrl = DemoVehicleDataset.resolveImageUrl(
                        normalizedPlate,
                        "GATE_SCAN",
                        request.imageUrl);

                if (isVip) {
                    // Case A: VIP Check-in
                    String plateStr = normalizedPlate;
                    Optional<ParkingSession> existingVipSession = sessionRepo.findByLicensePlateAndSessionStatus(plateStr, ParkingSession.SessionStatus.ACTIVE);

                    if (existingVipSession.isPresent() && existingVipSession.get().getEntryGate() != null) {
                        // VIP already waiting at gate — approve directly (clear entry gate)
                        ParkingSession session = existingVipSession.get();
                        session.setIsVip(true);
                        sessionRepo.save(session);
                        com.parking.dto.CheckInResponse checkInResponse = parkingService.approveEntry(plateStr);

                        String zoneCode = "F1";
                        if (session.getAssignedZoneId() != null) {
                            Optional<com.parking.model.Zone> zoneOpt = zoneRepo.findById(session.getAssignedZoneId());
                            if (zoneOpt.isPresent()) zoneCode = zoneOpt.get().getCode();
                        }

                        response.put("success", true);
                        response.put("message", "VIP Check-in thành công tại " + request.gate);
                        Map<String, Object> vehicleData = new HashMap<>();
                        vehicleData.put("plate", plateStr);
                        Map<String, Object> dataMap = new HashMap<>();
                        dataMap.put("vehicle", vehicleData);
                        dataMap.put("sessionId", checkInResponse.getSession_id());
                        dataMap.put("assignedZoneCode", checkInResponse.getAssigned_zone_code() != null ? checkInResponse.getAssigned_zone_code() : zoneCode);
                        response.put("data", dataMap);
                    } else {
                        // No existing session — create new VIP session via AI service
                        com.parking.dto.AiCheckInRequest aiReq = new com.parking.dto.AiCheckInRequest();
                        aiReq.setPlate(plateStr);
                        aiReq.setConfidence_score(95.0);
                        aiReq.setCamera_id(request.gate);
                        aiReq.setImage_url(resolvedImageUrl);
                        aiReq.setVehicle_type(resolvedVehicleType);

                        com.parking.dto.CheckInResponse checkInResponse = parkingService.aiCheckIn(aiReq);

                        response.put("success", true);
                        response.put("message", "VIP Check-in thành công tại " + request.gate);
                        Map<String, Object> vehicleData = new HashMap<>();
                        vehicleData.put("plate", plateStr);
                        Map<String, Object> dataMap = new HashMap<>();
                        dataMap.put("vehicle", vehicleData);
                        dataMap.put("sessionId", checkInResponse.getSession_id());
                        dataMap.put("assignedZoneCode", checkInResponse.getAssigned_zone_code());
                        response.put("data", dataMap);
                    }
                } else {
                    // Case B: Visitor Check-in
                    if (request.cardCode == null || request.cardCode.trim().isEmpty()) {
                        throw new IllegalArgumentException("Yêu cầu mã thẻ cho khách vãng lai");
                    }
                    com.parking.dto.VisitorCheckInRequest visitorReq = new com.parking.dto.VisitorCheckInRequest();
                    String plateStr = !normalizedPlate.isEmpty() ? normalizedPlate : "UNKNOWN_PLATE";
                    visitorReq.setPlate(plateStr);
                    visitorReq.setCard_code(request.cardCode.trim());
                    visitorReq.setImage_url(resolvedImageUrl);
                    visitorReq.setVehicle_type(resolvedVehicleType);
                    visitorReq.setFuel_type(resolvedFuelType);
                    visitorReq.setGate(request.gate);

                    com.parking.dto.CheckInResponse checkInResponse = parkingService.visitorCheckIn(visitorReq);
                    pendingGateVehicleService.removeByPlate(plateStr);

                    response.put("success", true);
                    response.put("message", "Visitor Check-in thành công tại " + request.gate);

                    Map<String, Object> vehicleData = new HashMap<>();
                    vehicleData.put("plate", plateStr);
                    Map<String, Object> dataMap = new HashMap<>();
                    dataMap.put("vehicle", vehicleData);
                    dataMap.put("sessionId", checkInResponse.getSession_id());
                    dataMap.put("assignedZoneCode", checkInResponse.getAssigned_zone_code());
                    response.put("data", dataMap);
                }
            } else {
                // Exit Gate Logic
                if (request.qrToken != null && !request.qrToken.trim().isEmpty()) {
                    // Case A: VIP QR Exit
                    parkingService.verifyExitQr(normalizedPlate, request.qrToken.trim());
                    response.put("success", true);
                    response.put("message", "VIP QR Exit thành công tại " + request.gate);

                    Map<String, Object> vehicleData = new HashMap<>();
                    vehicleData.put("plate", normalizedPlate);
                    Map<String, Object> dataMap = new HashMap<>();
                    dataMap.put("vehicle", vehicleData);
                    response.put("data", dataMap);
                } else if (request.cardCode != null && !request.cardCode.trim().isEmpty()) {
                    // Case B: Visitor Checkout
                    Transaction transaction = parkingService.checkoutCardByCode(request.cardCode.trim());
                    response.put("success", true);
                    response.put("message", "Visitor Checkout thành công tại " + request.gate);

                    Map<String, Object> vehicleData = new HashMap<>();
                    vehicleData.put("plate", normalizedPlate);
                    Map<String, Object> dataMap = new HashMap<>();
                    dataMap.put("vehicle", vehicleData);
                    
                    Map<String, Object> transData = new HashMap<>();
                    transData.put("id", transaction.getId());
                    transData.put("feeAmount", transaction.getTotalAmount());
                    dataMap.put("transaction", transData);
                    
                    response.put("data", dataMap);
                } else {
                    throw new IllegalArgumentException("Yêu cầu mã QR VIP hoặc mã thẻ vãng lai để xuất bãi");
                }
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearGateLogs() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
