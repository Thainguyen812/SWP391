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
    private final com.parking.repository.VehicleRepository vehicleRepo;
    private final com.parking.repository.VipSubscriptionRepository vipSubRepo;

    public RevenueController(TransactionRepository transactionRepo, ParkingSessionRepository sessionRepo, com.parking.repository.VehicleRepository vehicleRepo, com.parking.repository.VipSubscriptionRepository vipSubRepo) {
        this.transactionRepo = transactionRepo;
        this.sessionRepo = sessionRepo;
        this.vehicleRepo = vehicleRepo;
        this.vipSubRepo = vipSubRepo;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Map<String, Object> getSummary(@RequestParam(required = false) String month, @RequestParam(required = false) String date) {
        List<Transaction> successTransactions = successfulTransactions();
        List<com.parking.model.VipSubscription> activeVipSubs = vipSubRepo.findByStatus(com.parking.model.VipSubscription.Status.ACTIVE);

        LocalDate today = date != null && !date.isEmpty() ? LocalDate.parse(date) : LocalDate.now(APP_ZONE);
        YearMonth currentMonth = month != null && !month.isEmpty() ? YearMonth.parse(month) : YearMonth.from(today);

        BigDecimal todayTotal = sum(successTransactions.stream()
                .filter(t -> today.equals(transactionDate(t)))
                .toList());
        BigDecimal monthTotal = sum(successTransactions.stream()
                .filter(t -> currentMonth.equals(transactionMonth(t)))
                .toList());
        BigDecimal yearTotal = sum(successTransactions.stream()
                .filter(t -> transactionDate(t) != null && transactionDate(t).getYear() == today.getYear())
                .toList());

        // Cộng thêm doanh thu từ các gói VIP Active trong CSDL
        for (com.parking.model.VipSubscription sub : activeVipSubs) {
            BigDecimal subFee = sub.getFeeAmount() != null ? sub.getFeeAmount() : BigDecimal.valueOf(1400000);
            Instant tInstant = sub.getApprovedAt() != null ? sub.getApprovedAt() : sub.getCreatedAt();
            LocalDate subDate = tInstant != null ? tInstant.atZone(APP_ZONE).toLocalDate() : today;
            YearMonth subMonth = YearMonth.from(subDate);

            if (today.equals(subDate)) {
                todayTotal = todayTotal.add(subFee);
            }
            if (currentMonth.equals(subMonth)) {
                monthTotal = monthTotal.add(subFee);
            }
            if (subDate.getYear() == today.getYear()) {
                yearTotal = yearTotal.add(subFee);
            }
        }

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
    public Map<String, Object> getCharts(@RequestParam(required = false) String month, @RequestParam(required = false) String dateParam) {
        List<Transaction> successTransactions = successfulTransactions();
        List<com.parking.model.VipSubscription> activeVipSubs = vipSubRepo.findByStatus(com.parking.model.VipSubscription.Status.ACTIVE);

        LocalDate today = dateParam != null && !dateParam.isEmpty() ? LocalDate.parse(dateParam) : LocalDate.now(APP_ZONE);
        LocalDate start = today.minusDays(13);

        Map<LocalDate, BigDecimal> byDate = new LinkedHashMap<>();
        Map<LocalDate, Integer> countByDate = new LinkedHashMap<>();
        for (LocalDate day = start; !day.isAfter(today); day = day.plusDays(1)) {
            byDate.put(day, BigDecimal.ZERO);
            countByDate.put(day, 0);
        }

        for (Transaction transaction : successTransactions) {
            LocalDate date = transactionDate(transaction);
            if (date != null && !date.isBefore(start) && !date.isAfter(today)) {
                byDate.put(date, byDate.get(date).add(amount(transaction)));
                countByDate.put(date, countByDate.get(date) + 1);
            }
        }

        BigDecimal vipTotalRevenue = BigDecimal.ZERO;
        for (com.parking.model.VipSubscription sub : activeVipSubs) {
            BigDecimal subFee = sub.getFeeAmount() != null ? sub.getFeeAmount() : BigDecimal.valueOf(1400000);
            vipTotalRevenue = vipTotalRevenue.add(subFee);

            Instant tInstant = sub.getApprovedAt() != null ? sub.getApprovedAt() : sub.getCreatedAt();
            LocalDate subDate = tInstant != null ? tInstant.atZone(APP_ZONE).toLocalDate() : today;
            if (byDate.containsKey(subDate)) {
                byDate.put(subDate, byDate.get(subDate).add(subFee));
                countByDate.put(subDate, countByDate.get(subDate) + 1);
            }
        }

        List<Map<String, Object>> barData = new ArrayList<>();
        byDate.forEach((date, value) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", DATE_LABEL.format(date));
            item.put("date", DATE_LABEL.format(date));
            item.put("value", value);
            item.put("revenue", value);
            item.put("count", countByDate.get(date));
            barData.add(item);
        });

        Map<String, BigDecimal> byTicketType = new LinkedHashMap<>();
        BigDecimal vangLaiTotal = sum(successTransactions);
        byTicketType.put("Vãng lai", vangLaiTotal);
        byTicketType.put("VIP", vipTotalRevenue);

        BigDecimal totalRevenue = vangLaiTotal.add(vipTotalRevenue);
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
            
            Instant inTimeInstant = sessionOpt.map(ParkingSession::getCheckInTime).orElse(null);
            Instant outTimeInstant = transaction.getProcessedAt();
            
            item.put("inTime", inTimeInstant != null ? DATE_TIME_LABEL.format(inTimeInstant) : "--:--");
            item.put("outTime", outTimeInstant != null ? DATE_TIME_LABEL.format(outTimeInstant) : (transaction.getProcessedAt() != null ? DATE_TIME_LABEL.format(transaction.getProcessedAt()) : "--:--"));
            item.put("time", outTimeInstant != null ? DATE_TIME_LABEL.format(outTimeInstant) : (inTimeInstant != null ? DATE_TIME_LABEL.format(inTimeInstant) : "--:--"));
            item.put("rawTimestamp", outTimeInstant != null ? outTimeInstant.toEpochMilli() : 0);
            
            if (inTimeInstant != null && outTimeInstant != null) {
                long mins = java.time.Duration.between(inTimeInstant, outTimeInstant).toMinutes();
                long hours = mins / 60;
                long remMins = mins % 60;
                item.put("duration", hours + "h " + remMins + "m");
            } else {
                item.put("duration", "1h 30m");
            }

            String plate = sessionOpt.map(ParkingSession::getLicensePlate).orElse("---");
            item.put("plate", plate);
            
            String vehicleTypeStr = "SEDAN_HATCHBACK";
            if (!"---".equals(plate)) {
                java.util.Optional<com.parking.model.Vehicle> vOpt = vehicleRepo.findByLicensePlate(plate);
                if (vOpt.isPresent() && vOpt.get().getBodyShape() != null) {
                    vehicleTypeStr = vOpt.get().getBodyShape();
                }
            }
            item.put("type", sessionOpt
                    .map(session -> Boolean.TRUE.equals(session.getIsVip()) ? "VIP" : "Vãng lai")
                    .orElse("Vãng lai"));
            item.put("vehicleType", vehicleTypeStr);
            item.put("amount", formatMoney(amount(transaction)));
            item.put("rawAmount", amount(transaction));
            item.put("method", paymentMethodLabel(transaction.getPaymentMethod()));
            item.put("rawMethod", transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().name() : "CASH");
            item.put("status", "Thành công");
            item.put("statusCode", "SUCCESS");
            items.add(item);
        }

        // Bổ sung các bản ghi doanh thu Đăng ký Thẻ Tháng VIP Active vào bảng lịch sử giao dịch
        List<com.parking.model.VipSubscription> activeVipSubs = vipSubRepo.findByStatus(com.parking.model.VipSubscription.Status.ACTIVE);
        for (com.parking.model.VipSubscription sub : activeVipSubs) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", "#VIP-" + sub.getId().toString().substring(0, 8).toUpperCase());
            Instant tInstant = sub.getApprovedAt() != null ? sub.getApprovedAt() : sub.getCreatedAt();
            String tStr = tInstant != null ? DATE_TIME_LABEL.format(tInstant) : "--:--";
            item.put("inTime", tStr);
            item.put("outTime", tStr);
            item.put("time", tStr);
            item.put("rawTimestamp", tInstant != null ? tInstant.toEpochMilli() : 0);
            item.put("duration", "Đăng ký VIP");

            String plate = "---";
            Optional<com.parking.model.Vehicle> vOpt = vehicleRepo.findById(sub.getVehicleId());
            if (vOpt.isPresent()) plate = vOpt.get().getLicensePlate();
            item.put("plate", plate);
            item.put("type", "Đăng ký Thẻ VIP");
            item.put("vehicleType", "VIP");

            BigDecimal amt = sub.getFeeAmount() != null ? sub.getFeeAmount() : BigDecimal.valueOf(1400000);
            item.put("amount", formatMoney(amt));
            item.put("rawAmount", amt);
            item.put("method", "VNPAY / Ví");
            item.put("rawMethod", "VNPAY_SANDBOX");
            item.put("status", "Thành công");
            item.put("statusCode", "SUCCESS");
            items.add(item);
        }

        items.sort((a, b) -> Long.compare((long) b.get("rawTimestamp"), (long) a.get("rawTimestamp")));

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
            return "Chuyển khoản VietQR / Banking";
        }
        return switch (method) {
            case CASH -> "Tiền mặt";
            case VNPAY_SANDBOX -> "VNPAY Sandbox";
            case MOMO_SANDBOX -> "MoMo Sandbox";
            case QR_BANK -> "Chuyển khoản VietQR / Banking";
        };
    }
}
