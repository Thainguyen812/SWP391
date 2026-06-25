package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final ParkingSessionRepository sessionRepo;

    public LogController(ParkingSessionRepository sessionRepo) {
        this.sessionRepo = sessionRepo;
    }

    @GetMapping
    public Map<String, Object> getLogs(@RequestParam(defaultValue = "1") int page,
                                       @RequestParam(required = false) String type) {
        
        List<Map<String, Object>> items = new ArrayList<>();
        List<ParkingSession> sessions = sessionRepo.findTop10ByOrderByUpdatedAtDesc();
        
        for (ParkingSession s : sessions) {
            Map<String, Object> item = new HashMap<>();
            item.put("plate", s.getLicensePlate());
            item.put("model", "Xe " + (s.getIsVip() != null && s.getIsVip() ? "VIP" : "Vãng lai"));
            item.put("type", s.getIsVip() != null && s.getIsVip() ? "VIP" : "VÉ NGÀY");
            item.put("gate", "Cổng chính");
            
            boolean isCheckOut = s.getCheckOutTime() != null;
            item.put("action", isCheckOut ? "Ra bãi" : "Vào bãi");
            item.put("time", isCheckOut ? s.getCheckOutTime().toString() : (s.getCheckInTime() != null ? s.getCheckInTime().toString() : "Vừa xong"));
            
            // Generate a deterministic random image based on license plate length or hash
            String[] images = {
                "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=600&q=80"
            };
            int imgIndex = s.getLicensePlate() != null ? Math.abs(s.getLicensePlate().hashCode()) % images.length : 0;
            item.put("image", images[imgIndex]);

            if (s.getIsSuspicious() != null && s.getIsSuspicious()) {
                item.put("status", "Cảnh Báo");
                item.put("statusColor", "bg-red-100 text-red-600");
                item.put("actionColor", "text-red-500");
                item.put("typeColor", "text-red-600");
            } else {
                item.put("status", "Thành Công");
                item.put("statusColor", "bg-emerald-100 text-emerald-700");
                item.put("actionColor", "text-slate-500");
                item.put("typeColor", s.getIsVip() != null && s.getIsVip() ? "text-purple-600" : "text-blue-600");
            }
            items.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("total", items.size());
        response.put("items", items);
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
}
