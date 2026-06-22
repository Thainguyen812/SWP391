package com.parking.controller;

import com.parking.model.Transaction;
import com.parking.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {
    
    private final TransactionRepository transactionRepo;

    public RevenueController(TransactionRepository transactionRepo) {
        this.transactionRepo = transactionRepo;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam(required = false) String month) {
        List<Transaction> transactions = transactionRepo.findAll();
        double total = transactions.stream()
            .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
            .sum();
            
        Map<String, Object> response = new HashMap<>();
        response.put("today", Map.of("value", String.format("%.1fM", total > 0 ? total / 1000000 : 18.4), "trend", "+12.5% so với hôm qua", "isPositive", true));
        response.put("thisMonth", Map.of("value", "452M", "trend", "-2.1% so với tháng trước", "isPositive", false));
        response.put("projectedYear", Map.of("value", "5.4B", "subtitle", "Đạt 92% KPI"));
        return response;
    }

    @GetMapping("/charts")
    public Map<String, Object> getCharts(@RequestParam(required = false) String month) {
        List<Map<String, Object>> barData = Arrays.asList(
            Map.of("date", "01/05", "revenue", 1200000),
            Map.of("date", "05/05", "revenue", 1500000),
            Map.of("date", "10/05", "revenue", 1100000)
        );
        List<Map<String, Object>> pieData = Arrays.asList(
            Map.of("type", "Ô tô", "value", 65),
            Map.of("type", "Xe máy", "value", 35)
        );
        Map<String, Object> response = new HashMap<>();
        response.put("barData", barData);
        response.put("pieData", pieData);
        response.put("totalVehicleRevenue", "18.4M");
        return response;
    }

    @GetMapping("/transactions")
    public Map<String, Object> getTransactions(@RequestParam(defaultValue = "1") int page) {
        List<Map<String, Object>> items = new ArrayList<>();
        int idCounter = 1;
        for (Transaction t : transactionRepo.findAll()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", "#TRX-" + (8900 + idCounter++));
            item.put("time", t.getProcessedAt() != null ? t.getProcessedAt().toString() : "Hôm nay");
            item.put("plate", "---");
            item.put("type", "Ô tô");
            item.put("amount", t.getTotalAmount() != null ? t.getTotalAmount().toString() + "đ" : "0đ");
            item.put("method", t.getPaymentMethod() != null ? t.getPaymentMethod().name() : "TIỀN MẶT");
            item.put("status", t.getPaymentStatus() != null ? t.getPaymentStatus().name() : "THÀNH CÔNG");
            items.add(item);
        }
        if (items.isEmpty()) {
            items.add(Map.of("id", "#TRX-8924", "time", "14:32:05 Hôm nay", "plate", "30G-123.45", "type", "Ô tô", "amount", "25,000đ", "method", "VNPAY", "status", "SUCCESS"));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("total", items.size());
        response.put("items", items);
        return response;
    }
}
