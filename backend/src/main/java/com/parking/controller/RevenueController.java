package com.parking.controller;

import com.parking.model.Transaction;
import com.parking.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

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
                LocalDate today = LocalDate.now(ZoneId.systemDefault());

                // Doanh thu hôm nay (Thật)
                double todayTotal = transactions.stream()
                                .filter(t -> t.getProcessedAt() != null &&
                                                LocalDate.ofInstant(t.getProcessedAt(), ZoneId.systemDefault())
                                                                .isEqual(today))
                                .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
                                .sum();

                // Doanh thu tháng này (Thật)
                double thisMonthTotal = transactions.stream()
                                .filter(t -> t.getProcessedAt() != null &&
                                                LocalDate.ofInstant(t.getProcessedAt(), ZoneId.systemDefault())
                                                                .getMonth() == today.getMonth()
                                                &&
                                                LocalDate.ofInstant(t.getProcessedAt(), ZoneId.systemDefault())
                                                                .getYear() == today.getYear())
                                .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
                                .sum();

                // Tổng doanh thu từ trước đến nay
                double overallTotal = transactions.stream()
                                .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
                                .sum();

                Map<String, Object> response = new HashMap<>();
                response.put("today", Map.of("value", String.format("%.1fK", todayTotal / 1000), "trend",
                                "+5.2% so với hôm qua", "isPositive", true));
                response.put("thisMonth", Map.of("value", String.format("%.1fM", thisMonthTotal / 1000000), "trend",
                                "+2.1% so với tháng trước", "isPositive", true));
                response.put("projectedYear", Map.of("value", String.format("%.1fB", overallTotal / 1000000000),
                                "subtitle", "Tổng doanh thu thực tế"));
                return response;
        }

        @GetMapping("/charts")
        public Map<String, Object> getCharts(@RequestParam(required = false) String month) {
                List<Transaction> transactions = transactionRepo.findAll();
                LocalDate today = LocalDate.now(ZoneId.systemDefault());

                // 1. Tính toán doanh thu thật cho 3 ngày gần nhất để vẽ biểu đồ cột
                double rToday = transactions.stream()
                                .filter(t -> t.getProcessedAt() != null && LocalDate
                                                .ofInstant(t.getProcessedAt(), ZoneId.systemDefault()).isEqual(today))
                                .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
                                .sum();

                double rYesterday = transactions.stream()
                                .filter(t -> t.getProcessedAt() != null
                                                && LocalDate.ofInstant(t.getProcessedAt(), ZoneId.systemDefault())
                                                                .isEqual(today.minusDays(1)))
                                .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
                                .sum();

                double rTwoDaysAgo = transactions.stream()
                                .filter(t -> t.getProcessedAt() != null
                                                && LocalDate.ofInstant(t.getProcessedAt(), ZoneId.systemDefault())
                                                                .isEqual(today.minusDays(2)))
                                .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
                                .sum();

                List<Map<String, Object>> barData = Arrays.asList(
                                Map.of("date", "Hôm nay", "revenue", rToday),
                                Map.of("date", "Hôm qua", "revenue", rYesterday),
                                Map.of("date", "Hôm kia", "revenue", rTwoDaysAgo));

                // 2. Thống kê tỷ lệ loại hình thanh toán thực tế (Hoặc loại xe) từ database để
                // vẽ biểu đồ tròn
                long cashCount = transactions.stream()
                                .filter(t -> t.getPaymentMethod() != null && t.getPaymentMethod().name().equals("CASH"))
                                .count();
                long digitalCount = transactions.stream().filter(
                                t -> t.getPaymentMethod() != null && !t.getPaymentMethod().name().equals("CASH"))
                                .count();

                // Tránh chia cho 0 nếu chưa có giao dịch
                long totalCount = cashCount + digitalCount == 0 ? 1 : cashCount + digitalCount;

                List<Map<String, Object>> pieData = Arrays.asList(
                                Map.of("type", "Tiền mặt", "value", (cashCount * 100) / totalCount),
                                Map.of("type", "Chuyển khoản/Ví", "value", (digitalCount * 100) / totalCount));

                Map<String, Object> response = new HashMap<>();
                response.put("barData", barData);
                response.put("pieData", pieData);
                response.put("totalVehicleRevenue", String.format("%.1fK", rToday / 1000));
                return response;
        }
}