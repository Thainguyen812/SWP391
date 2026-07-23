package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.Vehicle;
import com.parking.model.Zone;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.ZoneRepository;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private final ParkingSessionRepository sessionRepo;
    private final ZoneRepository zoneRepo;
    private final VehicleRepository vehicleRepo;

    public MonitoringController(ParkingSessionRepository sessionRepo, ZoneRepository zoneRepo, VehicleRepository vehicleRepo) {
        this.sessionRepo = sessionRepo;
        this.zoneRepo = zoneRepo;
        this.vehicleRepo = vehicleRepo;
    }

    @GetMapping("/status")
    public Map<String, Object> getMonitoringStatus(
            @RequestParam(required = false, defaultValue = "HQ") String branchId,
            @RequestParam(required = false, defaultValue = "B1") String floorId) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Tính tổng sức chứa
        List<Zone> zones = zoneRepo.findAll();
        int totalCapacity = zones.stream().mapToInt(Zone::getTotalSlots).sum();
        
        // Đếm số xe đang đỗ (ACTIVE)
        long currentlyParked = sessionRepo.countBySessionStatusAndEntryGateIsNull(ParkingSession.SessionStatus.ACTIVE);
        
        // Đếm xe VIP đang đỗ
        long vipVehicles = sessionRepo.countBySessionStatusAndIsVipTrueAndEntryGateIsNull(ParkingSession.SessionStatus.ACTIVE);
        
        // Tỷ lệ và chỗ trống
        double parkedPercentage = totalCapacity == 0 ? 0.0 : ((double) currentlyParked / totalCapacity * 100.0);
        long availableSpots = Math.max(0, totalCapacity - currentlyParked);
        
        response.put("totalCapacity", totalCapacity);
        response.put("currentlyParked", currentlyParked);
        response.put("parkedPercentage", parkedPercentage);
        response.put("availableSpots", availableSpots);
        response.put("vipVehicles", vipVehicles);
        
        return response;
    }

    @GetMapping("/activities")
    public List<Map<String, Object>> getRecentActivities(
            @RequestParam(required = false, defaultValue = "HQ") String branchId,
            @RequestParam(required = false, defaultValue = "B1") String floorId) {
        
        List<Map<String, Object>> activities = new ArrayList<>();
        List<ParkingSession> recentSessions = sessionRepo.findTop10ByOrderByUpdatedAtDesc();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());

        for (ParkingSession s : recentSessions) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", s.getId().toString());
            activity.put("plateNumber", s.getLicensePlate() != null ? s.getLicensePlate() : "Không rõ");
            
            // Tìm loại xe
            String vehicleType = "Khác";
            if (s.getVehicleId() != null) {
                Optional<Vehicle> v = vehicleRepo.findById(s.getVehicleId());
                if (v.isPresent() && v.get().getVehicleSize() != null) {
                    vehicleType = v.get().getVehicleSize();
                }
            } else if (s.getLicensePlate() != null) {
                Optional<Vehicle> v = vehicleRepo.findByLicensePlate(s.getLicensePlate());
                if (v.isPresent() && v.get().getVehicleSize() != null) {
                    vehicleType = v.get().getVehicleSize();
                }
            }
            activity.put("vehicleType", vehicleType);
            
            // Xác định Zone/Vị trí
            String location = "Cổng Chính";
            if (s.getAssignedZoneId() != null) {
                Optional<Zone> z = zoneRepo.findById(s.getAssignedZoneId());
                if (z.isPresent()) {
                    location = z.get().getZoneName();
                }
            }
            activity.put("location", location);
            
            activity.put("time", s.getUpdatedAt() != null ? formatter.format(s.getUpdatedAt()) : "Vừa xong");
            
            // Status (Vào / Ra)
            String statusStr = s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE ? "Vào" : "Ra";
            activity.put("status", statusStr);
            
            activity.put("isVip", s.getIsVip() != null && s.getIsVip());
            
            activities.add(activity);
        }
        
        return activities;
    }
}
