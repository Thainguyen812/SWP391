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
        List<Transaction> transactions = transactionRepo.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "processedAt"));
        for (Transaction t : transactions) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", t.getId().toString().substring(0,8));
            item.put("time", t.getProcessedAt() != null ? t.getProcessedAt().toString() : "Hôm nay");
            
            // Fetch associated ParkingSession for plate and type
            if (t.getSessionId() != null) {
                Optional<ParkingSession> session = sessionRepo.findById(t.getSessionId());
                if (session.isPresent()) {
                    item.put("plate", session.get().getLicensePlate());
                    item.put("type", session.get().getIsVip() != null && session.get().getIsVip() ? "VIP" : "Vãng lai");
                    if (session.get().getCheckInTime() != null) {
                        item.put("inTime", session.get().getCheckInTime().toString());
                    }
                    if (session.get().getCheckOutTime() != null) {
                        item.put("outTime", session.get().getCheckOutTime().toString());
                    }
                } else {
                    item.put("plate", "---");
                    item.put("type", "Phương tiện");
                }
            } else {
                item.put("plate", "---");
                item.put("type", "Khách vãng lai");
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

    @PostMapping("/transactions/mock")
    public Map<String, Object> mockTransaction(@RequestBody Map<String, Object> payload) {
        Transaction t = new Transaction();
        t.setPaymentMethod(Transaction.PaymentMethod.CASH);
        t.setPaymentStatus(Transaction.PaymentStatus.SUCCESS);
        t.setProcessedAt(java.time.Instant.now());
        t.setIsMobileCheckout(false);
        try {
            if (payload.get("amount") != null) {
                t.setTotalAmount(new java.math.BigDecimal(payload.get("amount").toString().replace(",", "").replace(".", "")));
            }
            if (payload.get("plate") != null) {
                String plate = payload.get("plate").toString();
                // Find session and check it out
                Optional<ParkingSession> activeSession = sessionRepo.findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE);
                if (activeSession.isPresent()) {
                    ParkingSession s = activeSession.get();
                    s.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
                    s.setCheckOutTime(java.time.Instant.now());
                    sessionRepo.save(s);
                    t.setSessionId(s.getId());
                } else {
                    // Create dummy session so transaction has a valid session_id
                    ParkingSession dummy = new ParkingSession();
                    dummy.setId(java.util.UUID.randomUUID());
                    dummy.setLicensePlate(plate);
                    dummy.setCheckInTime(java.time.Instant.now().minusSeconds(3600));
                    dummy.setCheckOutTime(java.time.Instant.now());
                    dummy.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
                    sessionRepo.save(dummy);
                    t.setSessionId(dummy.getId());
                }
            }
            t.setId(java.util.UUID.randomUUID());
        } catch (Exception e) {
            e.printStackTrace();
        }
        transactionRepo.save(t);
        return Map.of("success", true);
    }

    @GetMapping("/shift-stats")
    public Map<String, Object> getShiftStats() {
        List<Transaction> transactions = transactionRepo.findAll();
        // Lấy các giao dịch trong ngày hôm nay (giả lập ca hiện tại)
        java.time.LocalDate today = java.time.LocalDate.now();
        List<Transaction> shiftTxns = transactions.stream()
            .filter(t -> t.getProcessedAt() != null && t.getProcessedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(today))
            .toList();

        double revenue = 0;
        double cash = 0;
        double transfer = 0;

        for (Transaction t : shiftTxns) {
            double amount = t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0;
            revenue += amount;
            if (Transaction.PaymentMethod.CASH.equals(t.getPaymentMethod())) {
                cash += amount;
            } else {
                transfer += amount;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("revenue", revenue);
        response.put("cash", cash);
        response.put("transfer", transfer);
        response.put("transactions", shiftTxns.size());
        
        return response;
    }
}
