package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.Zone;
import com.parking.model.Transaction;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.ZoneRepository;
import com.parking.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ParkingSessionRepository sessionRepo;
    private final ZoneRepository zoneRepo;
    private final UserRepository userRepo;
    private final TransactionRepository transactionRepo;

    public DashboardController(ParkingSessionRepository sessionRepo, ZoneRepository zoneRepo, UserRepository userRepo, TransactionRepository transactionRepo) {
        this.sessionRepo = sessionRepo;
        this.zoneRepo = zoneRepo;
        this.userRepo = userRepo;
        this.transactionRepo = transactionRepo;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> response = new HashMap<>();

        // Active sessions
        long activeCount = sessionRepo.countBySessionStatus(ParkingSession.SessionStatus.ACTIVE);
        
        // Suspicious sessions
        long suspiciousCount = sessionRepo.findByIsSuspiciousTrue().size();

        // Occupancy Rate
        List<Zone> zones = zoneRepo.findAll();
        int totalSlots = zones.stream().mapToInt(Zone::getTotalSlots).sum();
        int currentOccupied = zones.stream().mapToInt(Zone::getCurrentOccupied).sum();
        
        double occupancyRateVal = totalSlots == 0 ? 0 : (double) currentOccupied / totalSlots * 100;
        String occupancyTrend = (occupancyRateVal >= 80 && occupancyRateVal <= 90) ? "Tối ưu: 80-90%" : 
                               (occupancyRateVal > 90 ? "Cảnh báo quá tải" : "Đang trống nhiều");

        BigDecimal rawRevenue = transactionRepo.sumTotalRevenueByStatus(Transaction.PaymentStatus.SUCCESS);
        double millionVnd = rawRevenue == null ? 0.0 : rawRevenue.doubleValue() / 1_000_000.0;

        Map<String, Object> totalRevenue = new HashMap<>();
        totalRevenue.put("value", String.format(Locale.US, "%.1f", millionVnd));
        totalRevenue.put("unit", "Tr");
        totalRevenue.put("trend", "+12% so với hôm qua");
        totalRevenue.put("isPositive", true);

        Map<String, Object> activeSessions = new HashMap<>();
        activeSessions.put("value", String.valueOf(activeCount));
        activeSessions.put("trend", "Đang trong bãi");
        activeSessions.put("progress", totalSlots == 0 ? 0 : (int)((double)activeCount / totalSlots * 100));

        Map<String, Object> occupancyRate = new HashMap<>();
        occupancyRate.put("value", String.format("%.0f%%", occupancyRateVal));
        occupancyRate.put("trend", occupancyTrend);
        occupancyRate.put("isOptimal", occupancyRateVal <= 90);

        Map<String, Object> issues = new HashMap<>();
        issues.put("value", String.format("%02d", suspiciousCount));
        issues.put("trend", "Xem chi tiết");
        issues.put("isWarning", suspiciousCount > 0);

        response.put("totalRevenue", totalRevenue);
        response.put("activeSessions", activeSessions);
        response.put("occupancyRate", occupancyRate);
        response.put("issues", issues);

        return response;
    }

    @GetMapping("/top-staff")
    public List<Map<String, Object>> getTopStaff() {
        // Tạm thời lấy danh sách mock user, nhưng có thể map tên từ DB nếu muốn
        return Arrays.asList(
            Map.of("id", 1, "name", "Nguyễn Thị Thu Ngân", "location", "Cổng Ra 01", "count", 342, "rank", 1, "initial", "N"),
            Map.of("id", 2, "name", "Trần Văn Bảo Vệ", "location", "Tuần tra Khu B", "count", 315, "rank", 2, "initial", "T")
        );
    }

    @GetMapping("/alerts")
    public List<Map<String, Object>> getAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        List<ParkingSession> suspicious = sessionRepo.findByIsSuspiciousTrue();
        int idCounter = 1;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM").withZone(ZoneId.systemDefault());

        for (ParkingSession s : suspicious) {
            Map<String, Object> alert = new HashMap<>();
            alert.put("id", idCounter++);
            alert.put("title", "Nghi ngờ gian lận: " + s.getLicensePlate());
            alert.put("description", s.getSuspiciousReason() != null ? s.getSuspiciousReason() : "Hệ thống phát hiện bất thường");
            alert.put("time", s.getCreatedAt() != null ? formatter.format(s.getCreatedAt()) : "VỪA XONG");
            alert.put("actionText", "Xử lý ngay");
            alert.put("type", "error");
            alerts.add(alert);
        }
        
        if (alerts.isEmpty()) {
            Map<String, Object> defaultAlert = new HashMap<>();
            defaultAlert.put("id", idCounter++);
            defaultAlert.put("title", "Hệ thống hoạt động bình thường");
            defaultAlert.put("description", "Không có cảnh báo an ninh nào.");
            defaultAlert.put("time", "HIỆN TẠI");
            defaultAlert.put("actionText", null);
            defaultAlert.put("type", "success");
            alerts.add(defaultAlert);
        }

        return alerts;
    }
}
