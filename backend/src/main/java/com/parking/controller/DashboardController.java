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
    private final com.parking.repository.ShiftHistoryRepository shiftRepo;

    public DashboardController(ParkingSessionRepository sessionRepo, ZoneRepository zoneRepo, UserRepository userRepo, TransactionRepository transactionRepo, com.parking.repository.ShiftHistoryRepository shiftRepo) {
        this.sessionRepo = sessionRepo;
        this.zoneRepo = zoneRepo;
        this.userRepo = userRepo;
        this.transactionRepo = transactionRepo;
        this.shiftRepo = shiftRepo;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam(required = false) String date) {
        Map<String, Object> response = new HashMap<>();

        // Active sessions
        long activeCount = sessionRepo.countBySessionStatusAndEntryGateIsNull(ParkingSession.SessionStatus.ACTIVE);
        
        // Suspicious sessions
        long suspiciousCount = sessionRepo.findByIsSuspiciousTrue().size();

        // Occupancy Rate
        List<Zone> zones = zoneRepo.findAll();
        int totalSlots = zones.stream().mapToInt(Zone::getTotalSlots).sum();
        int currentOccupied = zones.stream().mapToInt(Zone::getCurrentOccupied).sum();
        
        double occupancyRateVal = totalSlots == 0 ? 0 : (double) currentOccupied / totalSlots * 100;
        String occupancyTrend = (occupancyRateVal >= 80 && occupancyRateVal <= 90) ? "Tối ưu: 80-90%" : 
                               (occupancyRateVal > 90 ? "Cảnh báo quá tải" : "Đang trống nhiều");

        BigDecimal rawRevenue;
        if (date != null && !date.isBlank()) {
            java.time.LocalDate parsedDate = java.time.LocalDate.parse(date);
            java.time.Instant startOfDay = parsedDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
            rawRevenue = transactionRepo.sumTotalRevenueByStatusAndDate(Transaction.PaymentStatus.SUCCESS, startOfDay);
        } else {
            rawRevenue = transactionRepo.sumTotalRevenueByStatus(Transaction.PaymentStatus.SUCCESS);
        }
        
        double millionVnd = rawRevenue == null ? 0.0 : rawRevenue.doubleValue() / 1_000_000.0;

        Map<String, Object> totalRevenue = new HashMap<>();
        totalRevenue.put("value", String.format(Locale.US, "%.1f", millionVnd));
        totalRevenue.put("unit", "Tr");
        totalRevenue.put("trend", date != null ? "Doanh thu trong ngày" : "+12% so với hôm qua");
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
    public List<Map<String, Object>> getTopStaff(@RequestParam(required = false) String date) {
        List<com.parking.model.ShiftHistory> allShifts = shiftRepo.findAll();
        
        // Nhóm theo staffName và tính tổng vehiclesHandled
        Map<String, Integer> staffCounts = new HashMap<>();
        for (com.parking.model.ShiftHistory shift : allShifts) {
            String name = shift.getStaffName();
            if (name == null || name.isEmpty() || "Hệ thống".equals(name) || "AUTO_PREV".equals(name) || "N/A".equals(name)) continue;
            int count = shift.getVehiclesHandled() != null ? shift.getVehiclesHandled() : 0;
            staffCounts.put(name, staffCounts.getOrDefault(name, 0) + count);
        }

        List<Map.Entry<String, Integer>> sortedStaff = staffCounts.entrySet().stream()
            .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
            .limit(3)
            .toList();

        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        for (Map.Entry<String, Integer> entry : sortedStaff) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", rank);
            map.put("name", entry.getKey());
            map.put("location", "Ca trực chính"); // Hoặc lấy từ ca gần nhất
            map.put("count", entry.getValue());
            map.put("rank", rank);
            map.put("initial", entry.getKey().substring(0, 1).toUpperCase());
            result.add(map);
            rank++;
        }

        // Fallback
        if (result.isEmpty()) {
            return Arrays.asList(
                Map.of("id", 1, "name", "Chưa có dữ liệu", "location", "-", "count", 0, "rank", 1, "initial", "N")
            );
        }

        return result;
    }

    @GetMapping("/alerts")
    public List<Map<String, Object>> getAlerts(@RequestParam(required = false) String date) {
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
