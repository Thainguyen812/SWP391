package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.Transaction;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.TransactionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {

    private static final ZoneId APP_ZONE = ZoneId.systemDefault();
    private static final DateTimeFormatter DATE_LABEL = DateTimeFormatter.ofPattern("dd/MM");
    private static final DateTimeFormatter DATE_TIME_LABEL = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")
            .withZone(APP_ZONE);

    private final TransactionRepository transactionRepo;
    private final ParkingSessionRepository sessionRepo;

    public RevenueController(TransactionRepository transactionRepo, ParkingSessionRepository sessionRepo) {
        this.transactionRepo = transactionRepo;
        this.sessionRepo = sessionRepo;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Map<String, Object> getSummary(@RequestParam(required = false) String month) {
        List<Transaction> successTransactions = successfulTransactions();
        LocalDate today = LocalDate.now(APP_ZONE);
        YearMonth currentMonth = YearMonth.from(today);

        BigDecimal todayTotal = sum(successTransactions.stream()
                .filter(t -> today.equals(transactionDate(t)))
                .toList());
        BigDecimal monthTotal = sum(successTransactions.stream()
                .filter(t -> currentMonth.equals(transactionMonth(t)))
                .toList());
        BigDecimal yearTotal = sum(successTransactions.stream()
                .filter(t -> transactionDate(t) != null && transactionDate(t).getYear() == today.getYear())
                .toList());

        Map<String, Object> response = new HashMap<>();
        response.put("today", Map.of(
                "value", compactMoney(todayTotal),
                "trend", "Doanh thu hôm nay",
                "isPositive", true));
        response.put("thisMonth", Map.of(
                "value", compactMoney(monthTotal),
                "trend", "Tháng " + today.getMonthValue() + "/" + today.getYear(),
                "isPositive", true));
        response.put("projectedYear", Map.of(
                "value", compactMoney(yearTotal),
                "subtitle", "Doanh thu thực tế năm " + today.getYear()));
        return response;
    }

    @GetMapping("/charts")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Map<String, Object> getCharts(@RequestParam(required = false) String month) {
        List<Transaction> successTransactions = successfulTransactions();
        LocalDate today = LocalDate.now(APP_ZONE);
        LocalDate start = today.minusDays(13);

        Map<LocalDate, BigDecimal> byDate = new LinkedHashMap<>();
        for (LocalDate day = start; !day.isAfter(today); day = day.plusDays(1)) {
            byDate.put(day, BigDecimal.ZERO);
        }
        for (Transaction transaction : successTransactions) {
            LocalDate date = transactionDate(transaction);
            if (date != null && !date.isBefore(start) && !date.isAfter(today)) {
                byDate.put(date, byDate.get(date).add(amount(transaction)));
            }
        }

        List<Map<String, Object>> barData = new ArrayList<>();
        byDate.forEach((date, value) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", DATE_LABEL.format(date));
            item.put("date", DATE_LABEL.format(date));
            item.put("value", value);
            item.put("revenue", value);
            barData.add(item);
        });

        Map<String, BigDecimal> byTicketType = new LinkedHashMap<>();
        byTicketType.put("Vãng lai", BigDecimal.ZERO);
        byTicketType.put("VIP", BigDecimal.ZERO);
        for (Transaction transaction : successTransactions) {
            String type = sessionRepo.findById(transaction.getSessionId())
                    .map(session -> Boolean.TRUE.equals(session.getIsVip()) ? "VIP" : "Vãng lai")
                    .orElse("Vãng lai");
            byTicketType.put(type, byTicketType.getOrDefault(type, BigDecimal.ZERO).add(amount(transaction)));
        }

        BigDecimal totalRevenue = sum(successTransactions);
        List<Map<String, Object>> pieData = new ArrayList<>();
        String[] colors = { "#1677ff", "#10b981" };
        int colorIndex = 0;
        for (Map.Entry<String, BigDecimal> entry : byTicketType.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", entry.getKey());
            item.put("type", entry.getKey());
            item.put("value", entry.getValue());
            item.put("color", colors[colorIndex++ % colors.length]);
            item.put("percent", totalRevenue.signum() == 0 ? 0
                    : entry.getValue().multiply(BigDecimal.valueOf(100)).divide(totalRevenue, 0, java.math.RoundingMode.HALF_UP));
            pieData.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("barData", barData);
        response.put("pieData", pieData);
        response.put("totalVehicleRevenue", totalRevenue);
        return response;
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public Map<String, Object> getTransactions(@RequestParam(defaultValue = "1") int page) {
        List<Transaction> transactions = transactionRepo
                .findAll(Sort.by(Sort.Direction.DESC, "processedAt"))
                .stream()
                .filter(t -> Transaction.PaymentStatus.SUCCESS.equals(t.getPaymentStatus()))
                .sorted(Comparator.comparing(Transaction::getProcessedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<Map<String, Object>> items = new ArrayList<>();
        for (Transaction transaction : transactions) {
            Optional<ParkingSession> sessionOpt = sessionRepo.findById(transaction.getSessionId());
            Map<String, Object> item = new HashMap<>();
            item.put("id", "#TRX-" + transaction.getId().toString().substring(0, 8).toUpperCase());
            item.put("time", transaction.getProcessedAt() != null
                    ? DATE_TIME_LABEL.format(transaction.getProcessedAt())
                    : "Chưa ghi nhận");
            item.put("plate", sessionOpt.map(ParkingSession::getLicensePlate).orElse("---"));
            item.put("type", sessionOpt
                    .map(session -> Boolean.TRUE.equals(session.getIsVip()) ? "Vé tháng (VIP)" : "Ô tô - Vãng lai")
                    .orElse("Phương tiện"));
            item.put("amount", formatMoney(amount(transaction)));
            item.put("method", paymentMethodLabel(transaction.getPaymentMethod()));
            item.put("status", "Thành công");
            item.put("statusCode", "SUCCESS");
            items.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("total", items.size());
        response.put("items", items);
        return response;
    }

    @GetMapping("/shift-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public Map<String, Object> getShiftStats() {
        LocalDate today = LocalDate.now(APP_ZONE);
        List<Transaction> shiftTransactions = successfulTransactions().stream()
                .filter(t -> today.equals(transactionDate(t)))
                .toList();

        BigDecimal cash = sum(shiftTransactions.stream()
                .filter(t -> Transaction.PaymentMethod.CASH.equals(t.getPaymentMethod()))
                .toList());
        BigDecimal transfer = sum(shiftTransactions.stream()
                .filter(t -> !Transaction.PaymentMethod.CASH.equals(t.getPaymentMethod()))
                .toList());
        BigDecimal revenue = cash.add(transfer);

        Map<String, Object> response = new HashMap<>();
        response.put("revenue", revenue);
        response.put("cash", cash);
        response.put("transfer", transfer);
        response.put("transactions", shiftTransactions.size());
        return response;
    }

    private List<Transaction> successfulTransactions() {
        return transactionRepo.findAll().stream()
                .filter(t -> Transaction.PaymentStatus.SUCCESS.equals(t.getPaymentStatus()))
                .toList();
    }

    private BigDecimal sum(List<Transaction> transactions) {
        return transactions.stream()
                .map(this::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal amount(Transaction transaction) {
        return transaction.getTotalAmount() != null ? transaction.getTotalAmount() : BigDecimal.ZERO;
    }

    private LocalDate transactionDate(Transaction transaction) {
        Instant processedAt = transaction.getProcessedAt();
        return processedAt == null ? null : processedAt.atZone(APP_ZONE).toLocalDate();
    }

    private YearMonth transactionMonth(Transaction transaction) {
        LocalDate date = transactionDate(transaction);
        return date == null ? null : YearMonth.from(date);
    }

    private String compactMoney(BigDecimal amount) {
        long value = amount.longValue();
        if (value >= 1_000_000_000L) {
            return String.format("%.1fB", value / 1_000_000_000.0);
        }
        if (value >= 1_000_000L) {
            return String.format("%.1fM", value / 1_000_000.0);
        }
        if (value >= 1_000L) {
            return String.format("%.1fK", value / 1_000.0);
        }
        return value + "đ";
    }

    private String formatMoney(BigDecimal amount) {
        return String.format("%,d", amount.longValue()).replace(',', '.') + "đ";
    }

    private String paymentMethodLabel(Transaction.PaymentMethod method) {
        if (method == null) {
            return "Không xác định";
        }
        return switch (method) {
            case CASH -> "Tiền mặt";
            case VNPAY_SANDBOX -> "VNPAY Sandbox";
            case MOMO_SANDBOX -> "MoMo Sandbox";
            case QR_BANK -> "VietQR";
        };
    }
}
