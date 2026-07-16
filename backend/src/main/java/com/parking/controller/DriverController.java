package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.VipQrIdentifier;
import com.parking.dto.FcmTokenRequest;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VipQrIdentifierRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.exception.ApiExceptions;
import com.parking.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.Map;

import com.parking.model.User;
import com.parking.model.Vehicle;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.TransactionRepository;
import com.parking.repository.SecurityAlertRepository;
import com.parking.model.Transaction;
import com.parking.model.SecurityAlert;
import com.parking.model.VipSubscription;
import org.springframework.security.core.Authentication;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/driver")
public class DriverController {

    private final VipQrIdentifierRepository qrRepo;
    private final ParkingSessionRepository sessionRepo;
    private final ParkingService parkingService;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final VipSubscriptionRepository vipSubscriptionRepository;
    private final TransactionRepository transactionRepository;
    private final SecurityAlertRepository securityAlertRepository;

    public DriverController(
            VipQrIdentifierRepository qrRepo,
            ParkingSessionRepository sessionRepo,
            ParkingService parkingService,
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            VipSubscriptionRepository vipSubscriptionRepository,
            TransactionRepository transactionRepository,
            SecurityAlertRepository securityAlertRepository) {

        this.qrRepo = qrRepo;
        this.sessionRepo = sessionRepo;
        this.parkingService = parkingService;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.vipSubscriptionRepository = vipSubscriptionRepository;
        this.transactionRepository = transactionRepository;
        this.securityAlertRepository = securityAlertRepository;
    }

    @PostMapping("/qr/generate")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<VipQrIdentifier> generateQr(@RequestBody GenerateQrRequest req) {
        VipQrIdentifier qr = new VipQrIdentifier();
        qr.setId(UUID.randomUUID());
        qr.setVehicleId(req.getVehicleId());
        qr.setQrToken(UUID.randomUUID().toString());
        qr.setPurpose(req.getPurpose() != null ? req.getPurpose() : "CHECK_OUT");
        qr.setExpiredAt(Instant.now().plusSeconds(300)); // 5 minutes
        qr.setUsed(false);
        qr.setCreatedAt(Instant.now());

        qrRepo.save(qr);
        return ResponseEntity.status(201).body(qr);
    }

    // 2. Khóa xe chống trộm: Tài xế VIP tự khóa xe họ, hoặc MANAGER hỗ trợ khóa từ
    // xa qua tổng đài
    @PutMapping("/vehicle/lock")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<?> lockVehicle(@RequestBody LockVehicleRequest req) {
        // Chỉ cho phép khóa xe nếu xe đó đã đăng ký VIP và gói cước đang ACTIVE
        Optional<com.parking.model.VipSubscription> vipSub = vipSubscriptionRepository
                .findByVehicleIdAndStatus(req.getVehicleId(), com.parking.model.VipSubscription.Status.ACTIVE);
        if (vipSub.isEmpty()) {
            return ResponseEntity.badRequest().body("Chỉ phương tiện có gói VIP đang hoạt động mới được sử dụng tính năng khóa xe!");
        }

        Optional<Vehicle> optVehicle = vehicleRepository.findById(req.getVehicleId());
        if (optVehicle.isEmpty()) {
            return ResponseEntity.status(404).body("Không tìm thấy phương tiện này trong hệ thống!");
        }
        Vehicle vehicle = optVehicle.get();
        boolean isLocked = req.getLockStatus() != null && req.getLockStatus();

        // 1. Đồng bộ hóa khóa trên thực thể Vehicle
        vehicle.setLocked(isLocked);
        vehicleRepository.save(vehicle);

        // 2. Tạo hoặc giải quyết cảnh báo an ninh KHÓA CHỐNG TRỘM
        if (isLocked) {
            SecurityAlert alert = new SecurityAlert();
            alert.setAlertType("KHÓA CHỐNG TRỘM");
            alert.setLicensePlate(vehicle.getLicensePlate());
            alert.setReason("Tài xế vừa bật khóa an ninh từ xa qua App");
            alert.setIsActionable(false);
            securityAlertRepository.save(alert);
        } else {
            List<SecurityAlert> activeAlerts = securityAlertRepository.findByIsResolvedFalseOrderByCreatedAtDesc().stream()
                    .filter(a -> "KHÓA CHỐNG TRỘM".equals(a.getAlertType()) 
                            && vehicle.getLicensePlate().equals(a.getLicensePlate()))
                    .toList();
            for (SecurityAlert a : activeAlerts) {
                a.setIsResolved(true);
                a.setResolvedAt(java.time.LocalDateTime.now());
                securityAlertRepository.save(a);
            }
        }

        // 3. Cập nhật các phiên gửi xe đang hoạt động (active)
        List<ParkingSession> activeSessions = sessionRepo.findByVehicleIdAndSessionStatusIn(
                req.getVehicleId(),
                List.of(ParkingSession.SessionStatus.ACTIVE, ParkingSession.SessionStatus.PASSED_CONFIRMED));

        if (!activeSessions.isEmpty()) {
            for (ParkingSession session : activeSessions) {
                session.setIsLocked(isLocked);
                sessionRepo.save(session);
            }
        }

        return ResponseEntity.ok("Cập nhật trạng thái khóa chống trộm thành công!");
    }

    // 3. Xem trạng thái xe: Chỉ tài xế VIP kiểm tra tình trạng xe của mình
    @GetMapping("/vehicle/{vehicleId}/status")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER')")
    public ResponseEntity<java.util.Map<String, Object>> getVehicleStatus(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(parkingService.getVehicleStatus(vehicleId));
    }

    @PutMapping("/fcm-token")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> updateFcmToken(
            @RequestBody FcmTokenRequest request,
            Authentication authentication) {
        if (request == null || request.getFcmToken() == null || request.getFcmToken().trim().isEmpty()) {
            throw new ApiExceptions.BadRequestException("FCM token khong duoc de trong");
        }

        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay tai khoan driver"));

        currentUser.setFcmToken(request.getFcmToken().trim());
        userRepository.save(currentUser);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Da cap nhat FCM token cho driver",
                "userId", currentUser.getId()));
    }

    // Helper DTOs
    public static class GenerateQrRequest {
        private UUID vehicleId;
        private String purpose;

        public UUID getVehicleId() {
            return vehicleId;
        }

        public void setVehicleId(UUID vehicleId) {
            this.vehicleId = vehicleId;
        }

        public String getPurpose() {
            return purpose;
        }

        public void setPurpose(String purpose) {
            this.purpose = purpose;
        }
    }

    public static class LockVehicleRequest {
        private UUID vehicleId;
        private Boolean lockStatus;

        public UUID getVehicleId() {
            return vehicleId;
        }

        public void setVehicleId(UUID vehicleId) {
            this.vehicleId = vehicleId;
        }

        public Boolean getLockStatus() {
            return lockStatus;
        }

        public void setLockStatus(Boolean lockStatus) {
            this.lockStatus = lockStatus;
        }
    }

    //API lấy danh sách xe của chính chủ
    @GetMapping("/vehicles")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<Vehicle>> getMyVehicles(Authentication authentication) {

        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Vehicle> vehicles = vehicleRepository.findByOwnerId(currentUser.getId());

        return ResponseEntity.ok(vehicles);
    }

    // API lấy lịch sử giao dịch (VIP subscriptions + Check-out transactions) cho tất cả xe của Driver
    @GetMapping("/billing-history")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<java.util.Map<String, Object>>> getBillingHistory(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Vehicle> vehicles = vehicleRepository.findByOwnerId(currentUser.getId());
        List<java.util.Map<String, Object>> history = new java.util.ArrayList<>();

        for (Vehicle v : vehicles) {
            // 1. Lấy thông tin các gói VIP đã đăng ký của xe
            List<VipSubscription> subs = vipSubscriptionRepository.findByVehicleId(v.getId());
            for (VipSubscription sub : subs) {
                java.util.Map<String, Object> item = new java.util.HashMap<>();
                item.put("id", sub.getId().toString().substring(0, 8).toUpperCase());
                
                String dateStr = sub.getCreatedAt() != null 
                    ? java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                        .withZone(java.time.ZoneId.systemDefault())
                        .format(sub.getCreatedAt())
                    : "01/07/2026 00:00:00";
                item.put("date", dateStr);
                
                String packName = "Thẻ Tháng VIP";
                if ("DAILY".equals(sub.getSubscriptionType()) || "DAY".equals(sub.getSubscriptionType())) packName = "Vé Ngày";
                else if ("QUARTERLY".equals(sub.getSubscriptionType())) packName = "Thẻ 3 Tháng VIP";
                else if ("HALF_YEARLY".equals(sub.getSubscriptionType())) packName = "Thẻ 6 Tháng VIP";
                else if ("YEARLY".equals(sub.getSubscriptionType())) packName = "Thẻ 1 Năm VIP";
                
                item.put("type", "Đăng kí " + packName);
                item.put("plate", v.getLicensePlate());
                
                String feeVal = sub.getFeeAmount() != null ? sub.getFeeAmount().toString() : "0";
                if (feeVal.contains(".")) {
                    feeVal = feeVal.substring(0, feeVal.indexOf("."));
                }
                try {
                    long feeLong = Long.parseLong(feeVal);
                    if (feeLong == 0) {
                        if ("DAILY".equals(sub.getSubscriptionType()) || "DAY".equals(sub.getSubscriptionType())) feeLong = 70000;
                        else if ("QUARTERLY".equals(sub.getSubscriptionType())) feeLong = 3800000;
                        else if ("HALF_YEARLY".equals(sub.getSubscriptionType())) feeLong = 7000000;
                        else if ("YEARLY".equals(sub.getSubscriptionType())) feeLong = 12500000;
                        else feeLong = 1400000;
                    }
                    feeVal = String.format("%,d", feeLong).replace(',', '.') + "₫";
                } catch (Exception e) {
                    feeVal = feeVal + "₫";
                }
                
                item.put("fee", "-" + feeVal);
                item.put("isEntry", false);
                
                String statusStr = "Đang xử lý";
                if (sub.getStatus() == VipSubscription.Status.ACTIVE) {
                    statusStr = "Thành công";
                } else if (sub.getStatus() == VipSubscription.Status.REJECTED) {
                    statusStr = "Thất bại";
                }
                item.put("status", statusStr);
                history.add(item);
            }
            
            // 2. Lấy thông tin các lần trả phí gửi xe (Check-out) của xe
            List<ParkingSession> sessions = sessionRepo.findByLicensePlate(v.getLicensePlate());
            for (ParkingSession session : sessions) {
                Optional<Transaction> txOpt = transactionRepository.findBySessionId(session.getId());
                if (txOpt.isPresent()) {
                    Transaction tx = txOpt.get();
                    java.util.Map<String, Object> item = new java.util.HashMap<>();
                    item.put("id", tx.getId().toString().substring(0, 8).toUpperCase());
                    
                    String dateStr = tx.getProcessedAt() != null
                        ? java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                            .withZone(java.time.ZoneId.systemDefault())
                            .format(tx.getProcessedAt())
                        : "01/07/2026 00:00:00";
                    item.put("date", dateStr);
                    item.put("type", "Gửi xe");
                    item.put("plate", v.getLicensePlate());
                    
                    String feeVal = tx.getTotalAmount() != null ? tx.getTotalAmount().toString() : "0";
                    if (feeVal.contains(".")) {
                        feeVal = feeVal.substring(0, feeVal.indexOf("."));
                    }
                    try {
                        long feeLong = Long.parseLong(feeVal);
                        feeVal = String.format("%,d", feeLong).replace(',', '.') + "₫";
                    } catch (Exception e) {
                        feeVal = feeVal + "₫";
                    }
                    
                    item.put("fee", "-" + feeVal);
                    item.put("isEntry", false);
                    item.put("status", tx.getPaymentStatus() == Transaction.PaymentStatus.SUCCESS ? "Thành công" : "Đang xử lý");
                    history.add(item);
                }
            }
        }
        
        // Sắp xếp lịch sử giao dịch theo thời gian mới nhất
        history.sort((a, b) -> {
            String dateA = (String) a.get("date");
            String dateB = (String) b.get("date");
            
            // Format is dd/MM/yyyy HH:mm:ss -> parse for proper comparison
            try {
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
                return sdf.parse(dateB).compareTo(sdf.parse(dateA));
            } catch (Exception e) {
                return dateB.compareTo(dateA);
            }
        });
        
        return ResponseEntity.ok(history);
    }

}
