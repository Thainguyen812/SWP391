package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.time.Instant;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final ParkingSessionRepository sessionRepo;

    public LogController(ParkingSessionRepository sessionRepo) {
        this.sessionRepo = sessionRepo;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Map<String, Object> getLogs(@RequestParam(defaultValue = "1") int page,
                                       @RequestParam(required = false) String type) {
        
        List<Map<String, Object>> items = new ArrayList<>();
        
        // Return system logs matching Logs_Main.jsx structure
        String[] events = {"SECURITY", "SYSTEM", "AUTH", "CONFIG"};
        String[] actions = {"Đăng nhập hệ thống", "Thay đổi cấu hình giá", "Cập nhật quyền", "Thêm người dùng", "Đăng nhập thất bại"};
        String[] users = {"admin", "manager_1", "system", "staff_01"};
        String[] roles = {"ADMIN", "MANAGER", "SYSTEM", "STAFF"};
        String[] locations = {"Văn phòng", "Phòng Server", "Cổng 1", "Remote"};
        String[] statuses = {"Thành công", "Thất bại", "Cảnh báo"};

        for (int i = 0; i < 15; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", UUID.randomUUID().toString());
            item.put("timestamp", Instant.now().minusSeconds((long) (Math.random() * 86400 * 7)).toString());
            
            int randIndex = (int) (Math.random() * 4);
            item.put("eventType", events[randIndex]);
            item.put("user", users[randIndex]);
            item.put("role", roles[randIndex]);
            item.put("action", actions[(int) (Math.random() * actions.length)]);
            item.put("location", locations[(int) (Math.random() * locations.length)]);
            item.put("ipAddress", "192.168.1." + (int) (Math.random() * 255));
            item.put("status", statuses[(int) (Math.random() * statuses.length)]);
            
            items.add(item);
        }

        // Sort by timestamp desc
        items.sort((a, b) -> ((String) b.get("timestamp")).compareTo((String) a.get("timestamp")));

        Map<String, Object> response = new HashMap<>();
        response.put("total", items.size());
        response.put("data", items);
        return response;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", 1250);
        stats.put("errorCount", 12);
        stats.put("warningCount", 45);
        return stats;
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportLogs(@RequestParam(required = false) String keyword,
                                             @RequestParam(required = false) String eventType) {
        StringBuilder csv = new StringBuilder();
        csv.append("Biển số,Loại xe,Loại khách,Cổng,Hành động,Thời gian,Trạng thái\n");
        
        List<ParkingSession> sessions = sessionRepo.findTop10ByOrderByUpdatedAtDesc();
        for (ParkingSession s : sessions) {
            csv.append(s.getLicensePlate() != null ? s.getLicensePlate() : "").append(",");
            csv.append("Xe ").append(s.getIsVip() != null && s.getIsVip() ? "VIP" : "Vãng lai").append(",");
            csv.append(s.getIsVip() != null && s.getIsVip() ? "VIP" : "VÃNG LAI").append(",");
            csv.append("Cổng chính").append(",");
            csv.append(s.getSessionStatus() == com.parking.model.ParkingSession.SessionStatus.ACTIVE ? "Vào" : "Ra").append(",");
            csv.append(s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : "").append(",");
            csv.append(s.getSessionStatus() != null ? s.getSessionStatus().name() : "").append("\n");
        }
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=logs.csv");
        headers.add("Content-Type", "text/csv; charset=UTF-8");
        
        return new ResponseEntity<>(csv.toString(), headers, org.springframework.http.HttpStatus.OK);
    }
}
