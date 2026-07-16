package com.parking.controller;

import com.parking.model.Transaction;
import com.parking.model.ParkingSession;
import com.parking.repository.TransactionRepository;
import com.parking.repository.ParkingSessionRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    @PreAuthorize("hasRole('MANAGER')")
    public Map<String, Object> getSummary(@RequestParam(required = false) String month) {
        List<Transaction> transactions = transactionRepo.findAll();
        double total = transactions.stream()
                .mapToDouble(t -> t.getTotalAmount() != null ? t.getTotalAmount().doubleValue() : 0.0)
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("today", Map.of("value", String.format("%.1fK", total / 1000), "trend", "+5.2% so với hôm qua",
                "isPositive", true));
        response.put("thisMonth", Map.of("value", String.format("%.1fM", total * 30 / 1000000), "trend",
                "+2.1% so với tháng trước", "isPositive", true));
        response.put("projectedYear",
                Map.of("value", String.format("%.1fB", total * 365 / 1000000000), "subtitle", "Đạt 85% KPI"));
        return response;
    }

    @GetMapping("/charts")
    @PreAuthorize("hasRole('MANAGER')")
    public Map<String, Object> getCharts(@RequestParam(required = false) String month) {

        // Lấy doanh thu theo ngày
        List<Object[]> rows = transactionRepo.getRevenueByDay();

        List<Map<String, Object>> barData = new ArrayList<>();

        for (Object[] row : rows) {

            Map<String, Object> item = new HashMap<>();

            item.put("date", row[0].toString());
            item.put("revenue", row[1]);

            barData.add(item);
        }

        BigDecimal totalRevenue = transactionRepo.sumTotalRevenueByStatus(
                Transaction.PaymentStatus.SUCCESS);

        // Tạm giữ biểu đồ tròn
        List<Map<String, Object>> pieData = Arrays.asList(
                Map.of("type", "Ô tô", "value", 60),
                Map.of("type", "Xe máy", "value", 40));

        // Tổng doanh thu thật
        Map<String, Object> response = new HashMap<>();
        response.put("barData", barData);
        response.put("pieData", pieData);
        response.put("totalVehicleRevenue", totalRevenue);
        return response;
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public Map<String, Object> getTransactions(@RequestParam(defaultValue = "1") int page) {
        List<Map<String, Object>> items = new ArrayList<>();
        List<Transaction> transactions = transactionRepo.findAll(org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Direction.DESC, "processedAt"));
        for (Transaction t : transactions) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", t.getId().toString().substring(0, 8));
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    @Transactional
    public Map<String, Object> mockTransaction(@RequestBody Map<String, Object> payload) {
        String plate = Optional.ofNullable(payload.get("plate"))
                .map(Object::toString)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu biển số xe cần thanh toán"));

        ParkingSession session = sessionRepo
                .findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE)
                .or(() -> sessionRepo.findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.LOST_CARD))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Không tìm thấy phiên ACTIVE/LOST_CARD của xe " + plate));

        BigDecimal totalAmount = BigDecimal.ZERO;
        if (payload.get("amount") != null) {
            String amountText = payload.get("amount").toString()
                    .replace("VND", "")
                    .replace("vnd", "")
                    .replace("đ", "")
                    .replace(",", "")
                    .trim();
            if (!amountText.isEmpty()) {
                totalAmount = new BigDecimal(amountText);
            }
        }
        BigDecimal lostCardPenalty = BigDecimal.ZERO;
        if (payload.get("lostCardPenalty") != null) {
            String penaltyText = payload.get("lostCardPenalty").toString()
                    .replace("VND", "")
                    .replace("vnd", "")
                    .replace("đ", "")
                    .replace(",", "")
                    .trim();
            if (!penaltyText.isEmpty()) {
                lostCardPenalty = new BigDecimal(penaltyText);
            }
        }
        BigDecimal parkingFee = totalAmount.subtract(lostCardPenalty);
        if (parkingFee.signum() < 0) {
            parkingFee = BigDecimal.ZERO;
        }

        session.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
        session.setCheckOutTime(java.time.Instant.now());
        sessionRepo.save(session);

        Transaction transaction = transactionRepo.findBySessionId(session.getId())
                .orElseGet(() -> {
                    Transaction created = new Transaction();
                    created.setId(UUID.randomUUID());
                    created.setSessionId(session.getId());
                    return created;
                });

        transaction.setParkingFee(parkingFee);
        transaction.setLostCardPenalty(lostCardPenalty);
        transaction.setViolationPenalty(BigDecimal.ZERO);
        transaction.setTotalAmount(totalAmount);
        transaction.setPaymentMethod(Transaction.PaymentMethod.CASH);
        transaction.setPaymentStatus(Transaction.PaymentStatus.SUCCESS);
        transaction.setProcessedAt(java.time.Instant.now());
        transaction.setIsMobileCheckout(false);

        Transaction saved = transactionRepo.save(transaction);
        return Map.of("success", true, "transactionId", saved.getId());
    }

    @GetMapping("/shift-stats")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public Map<String, Object> getShiftStats() {
        List<Transaction> transactions = transactionRepo.findAll();
        // Lấy các giao dịch trong ngày hôm nay (giả lập ca hiện tại)
        java.time.LocalDate today = java.time.LocalDate.now();
        List<Transaction> shiftTxns = transactions.stream()
                .filter(t -> t.getProcessedAt() != null
                        && t.getProcessedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(today))
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
