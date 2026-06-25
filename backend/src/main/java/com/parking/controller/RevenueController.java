package com.parking.controller;

import com.parking.model.Transaction;
import com.parking.model.ParkingSession;
import com.parking.repository.TransactionRepository;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {
    
    private final TransactionRepository transactionRepo;
    private final ParkingSessionRepository sessionRepo;

    public RevenueController(TransactionRepository transactionRepo, ParkingSessionRepository sessionRepo) {
        this.transactionRepo = transactionRepo;
        this.sessionRepo = sessionRepo;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam(required = false) String month) {
        List<Transaction> transactions = transactionRepo.findAll();
        double total = transactions.stream()
            .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
            .sum();
            
        Map<String, Object> response = new HashMap<>();
        response.put("today", Map.of("value", String.format("%.1fK", total / 1000), "trend", "+5.2% so với hôm qua", "isPositive", true));
        response.put("thisMonth", Map.of("value", String.format("%.1fM", total * 30 / 1000000), "trend", "+2.1% so với tháng trước", "isPositive", true));
        response.put("projectedYear", Map.of("value", String.format("%.1fB", total * 365 / 1000000000), "subtitle", "Đạt 85% KPI"));
        return response;
    }

    @GetMapping("/charts")
    public Map<String, Object> getCharts(@RequestParam(required = false) String month) {
        List<Map<String, Object>> barData = Arrays.asList(
            Map.of("date", "Hôm nay", "revenue", 50000),
            Map.of("date", "Hôm qua", "revenue", 45000),
            Map.of("date", "Hôm kia", "revenue", 60000)
        );
        List<Map<String, Object>> pieData = Arrays.asList(
            Map.of("type", "Ô tô", "value", 60),
            Map.of("type", "Xe máy", "value", 40)
        );
        Map<String, Object> response = new HashMap<>();
        response.put("barData", barData);
        response.put("pieData", pieData);
        response.put("totalVehicleRevenue", "125K");
        return response;
    }

    @GetMapping("/transactions")
    public Map<String, Object> getTransactions(@RequestParam(defaultValue = "1") int page) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (Transaction t : transactionRepo.findAll()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", t.getId().toString().substring(0,8));
            item.put("time", t.getProcessedAt() != null ? t.getProcessedAt().toString() : "Hôm nay");
            
            // Fetch associated ParkingSession for plate and type
            Optional<ParkingSession> session = sessionRepo.findById(t.getSessionId());
            if (session.isPresent()) {
                item.put("plate", session.get().getLicensePlate());
                item.put("type", session.get().getIsVip() != null && session.get().getIsVip() ? "VIP" : "Vãng lai");
            } else {
                item.put("plate", "---");
                item.put("type", "Phương tiện");
            }
            
            item.put("amount", t.getTotalAmount() != null ? t.getTotalAmount().toString() + "đ" : "0đ");
            item.put("method", t.getPaymentMethod() != null ? t.getPaymentMethod().name() : "TIỀN MẶT");
            item.put("status", t.getPaymentStatus() != null ? t.getPaymentStatus().name() : "THÀNH CÔNG");
            items.add(item);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("total", items.size());
        response.put("items", items);
        return response;
    }
}
