package com.parking.service.impl;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;
import com.parking.dto.CongestionCheckoutRequest;
import com.parking.exception.ApiExceptions;
import com.parking.model.BlacklistEntry;
import com.parking.model.ParkingSession;
import com.parking.model.ParkingViolation;
import com.parking.model.VipSubscription;
import com.parking.model.Zone;
import com.parking.model.Vehicle;
import com.parking.model.VipQrIdentifier;
import com.parking.model.AuditLog;
import com.parking.model.AiScanLog;
import com.parking.model.ParkingSlot;
import com.parking.repository.ParkingSlotRepository;
import com.parking.model.User;
import com.parking.repository.UserRepository;
import com.parking.model.Transaction; // task 5
import com.parking.dto.FloorEntryVerificationRequest;
import com.parking.dto.FloorEntryVerificationResponse;
import com.parking.dto.SlotOccupancyRequest;
import com.parking.repository.BlacklistRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingViolationRepository;
import com.parking.repository.ZoneRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.VipQrIdentifierRepository;
import com.parking.repository.AuditLogRepository;
import com.parking.repository.AiScanLogRepository;
import com.parking.repository.SecurityAlertRepository;
import com.parking.model.SecurityAlert;

import com.parking.repository.TransactionRepository;// task 5

import com.parking.service.FCMService;
import com.parking.service.DemoVehicleDataset;
import com.parking.service.ParkingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Duration;

import java.math.BigDecimal;// task 5

import com.parking.dto.VisitorCheckInRequest;// task 5
import com.parking.model.Card;// task 5
import com.parking.repository.CardRepository;// task 5

import java.util.List;
import java.util.Optional;
import java.util.UUID;

//tính tiền
import com.parking.model.PricingRule;
import com.parking.repository.PricingRuleRepository;

@Service
public class ParkingServiceImpl implements ParkingService {

    private final BlacklistRepository blacklistRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ZoneRepository zoneRepository;
    private final VipSubscriptionRepository vipSubscriptionRepository;
    private final VehicleRepository vehicleRepository;
    private final VipQrIdentifierRepository vipQrIdentifierRepository;
    private final AuditLogRepository auditLogRepository;
    private final AiScanLogRepository aiScanLogRepository;

    private final TransactionRepository transactionRepository;// task 5
    private final CardRepository cardRepository;// task 5
    private final ParkingSlotRepository slotRepository;
    private final UserRepository userRepository;

    private final PricingRuleRepository pricingRuleRepository;
    private final ParkingViolationRepository parkingViolationRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final FCMService fcmService;

    public ParkingServiceImpl(BlacklistRepository blacklistRepository,
            ParkingSessionRepository parkingSessionRepository,
            ZoneRepository zoneRepository,
            VipSubscriptionRepository vipSubscriptionRepository,
            VehicleRepository vehicleRepository,
            VipQrIdentifierRepository vipQrIdentifierRepository,
            AuditLogRepository auditLogRepository,
            AiScanLogRepository aiScanLogRepository,
            TransactionRepository transactionRepository, // task 5
            CardRepository cardRepository,
            ParkingSlotRepository slotRepository,
            UserRepository userRepository,
            PricingRuleRepository pricingRuleRepository,
            ParkingViolationRepository parkingViolationRepository,
            SecurityAlertRepository securityAlertRepository,
            FCMService fcmService) { // task 5
        this.blacklistRepository = blacklistRepository;
        this.parkingSessionRepository = parkingSessionRepository;
        this.zoneRepository = zoneRepository;
        this.vipSubscriptionRepository = vipSubscriptionRepository;
        this.vehicleRepository = vehicleRepository;
        this.vipQrIdentifierRepository = vipQrIdentifierRepository;
        this.auditLogRepository = auditLogRepository;
        this.aiScanLogRepository = aiScanLogRepository;
        this.transactionRepository = transactionRepository; // task 5
        this.cardRepository = cardRepository; // task 5
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.parkingViolationRepository = parkingViolationRepository;
        this.securityAlertRepository = securityAlertRepository;
        this.fcmService = fcmService;
    }

    @Override
    @Transactional
    public CheckInResponse aiCheckIn(AiCheckInRequest request) {
        String plate = request.getPlate() != null ? request.getPlate().trim().toUpperCase() : "";
        Double confidence = request.getConfidence_score() != null ? request.getConfidence_score() : 0.0;

        if (plate.isBlank()) {
            throw new ApiExceptions.BadRequestException("Yêu cầu biển số để xác thực VIP bằng AI");
        }

        // Duplicate active session check
        Optional<ParkingSession> existing = parkingSessionRepository.findByLicensePlateAndSessionStatus(plate,
                ParkingSession.SessionStatus.ACTIVE);
        if (existing.isPresent()) {
            throw new ApiExceptions.ConflictException("Active parking session already exists for this vehicle");
        }

        // Confidence threshold
        if (confidence < 70.0) {
            throw new ApiExceptions.BadRequestException(
                "Ảnh mờ, yêu cầu tài xế chuyển sang dùng quét mã QR Động vào bãi");
        }

        // VIP check: resolve vehicle then lookup subscription by vehicle id
        boolean isVip = false;
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            java.util.UUID vehicleUuid = vehicle.getId();
            Optional<VipSubscription> vip = vipSubscriptionRepository.findByVehicleIdAndStatus(vehicleUuid,
                    VipSubscription.Status.ACTIVE);
            if (vip.isPresent()) {
                // Kiểm tra xem subscription còn hạn sử dụng không
                java.time.LocalDate today = java.time.LocalDate.now();
                if (!today.isBefore(vip.get().getStartDate()) && !today.isAfter(vip.get().getEndDate())) {
                    isVip = true;
                }
            }
        }

        // Chốt chặn: AI/LPR chỉ được tự tạo session cho VIP đang hoạt động.
        // Khách vãng lai phải được staff cấp/quẹt thẻ ở form check-in.
        if (!isVip) {
            throw new ApiExceptions.BadRequestException(
                    "Xe không phải VIP đang hoạt động. Khách vãng lai cần quẹt thẻ tạm tại làn staff.");
        }

        String targetVehicleType = normalizeVehicleSize(
                DemoVehicleDataset.resolveVehicleType(plate, request.getVehicle_type()));
        Zone chosen = chooseZoneForPlate(plate, targetVehicleType);
        String evidenceImageUrl = DemoVehicleDataset.resolveImageUrl(plate, "ENTRY_LPR", request.getImage_url());

        // Create session
        ParkingSession ps = new ParkingSession();
        ps.setId(UUID.randomUUID());
        ps.setLicensePlate(plate);
        ps.setCheckInTime(Instant.now());
        ps.setAssignedZoneId(chosen.getId());
        ps.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
        ps.setIsVip(true);
        ps.setEntryGate(null);
        // store image url if provided
        ps.setMobileCheckoutPhoto(evidenceImageUrl);

        if (vehicleOpt.isPresent()) {
            ps.setVehicleId(vehicleOpt.get().getId());
            ps.setIsLocked(vehicleOpt.get().isLocked());
        }

        zoneRepository.increaseOccupied(chosen.getId());

        parkingSessionRepository.save(ps);
        saveAiScanLog(ps, "ENTRY_GATE", "VIP_ENTRY_LPR", request.getCamera_id(), evidenceImageUrl,
                targetVehicleType, confidence, true);

        return new CheckInResponse(ps.getId().toString(), chosen.getCode(), "OK");
    }

    @Override
    @Transactional
    public CheckInResponse approveEntry(String plate) {
        ParkingSession session = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay phien xe dang cho vao bai"));

        if (session.getEntryGate() == null || session.getEntryGate().isBlank()) {
            throw new ApiExceptions.BadRequestException("Xe nay da vao bai, khong con nam o cong cho duyet");
        }

        if (!Boolean.TRUE.equals(session.getIsVip()) && session.getCardId() == null) {
            throw new ApiExceptions.BadRequestException("Khach vang lai phai quet the tam truoc khi vao bai");
        }

        String vehicleType = DemoVehicleDataset.resolveVehicleType(session.getLicensePlate(), "SEDAN_HATCHBACK");
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(session.getLicensePlate());
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            if (vehicle.getVehicleSize() != null) {
                vehicleType = DemoVehicleDataset.resolveVehicleType(session.getLicensePlate(), vehicle.getVehicleSize());
            }
            if (session.getVehicleId() == null) {
                session.setVehicleId(vehicle.getId());
            }
            session.setIsLocked(vehicle.isLocked());
        }

        Zone zone = ensureApprovedZone(session, vehicleType);
        String entryGateForLog = session.getEntryGate();
        session.setEntryGate(null);
        session.setCheckInTime(Instant.now());
        session.setUpdatedAt(Instant.now());
        parkingSessionRepository.save(session);
        saveAiScanLog(session, "ENTRY_GATE", "ENTRY_APPROVAL", entryGateForLog,
                DemoVehicleDataset.resolveImageUrl(session.getLicensePlate(), "ENTRY_APPROVAL", session.getMobileCheckoutPhoto()),
                vehicleType, 99.0, true);

        return new CheckInResponse(session.getId().toString(), zone.getCode(), "ENTRY_APPROVED");
    }

    @Override
    @Transactional
    public Transaction approveExit(String plate, String paymentMethodStr) {
        ParkingSession session = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay phien xe dang hoat dong"));

        if (session.getIsLocked() != null && session.getIsLocked()) {
            SecurityAlert alert = new SecurityAlert();
            alert.setAlertType("NGHI NGỜ TRỘM CẮP");
            alert.setLicensePlate(session.getLicensePlate() != null ? session.getLicensePlate() : "N/A");
            alert.setReason("Phát hiện cố tình xuất bãi khi xe đang bật Khóa chống trộm.");
            alert.setIsActionable(true);
            securityAlertRepository.save(alert);
            sendAntiTheftPush(session);

            throw new ApiExceptions.ForbiddenException(
                    "Xe đang ở trạng thái KHÓA AN TOÀN chống trộm! Không thể xuất bãi.");
        }

        if (session.getIsVip() == null || !session.getIsVip()) {
            throw new ApiExceptions.BadRequestException("Chỉ có xe VIP mới được phê duyệt mở cổng thủ công khi ra");
        }

        session.setCheckOutTime(Instant.now());
        session.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);

        if (session.getParkedSlotId() != null) {
            slotRepository.findById(session.getParkedSlotId()).ifPresent(slot -> {
                slot.setSlotStatus("AVAILABLE");
                slotRepository.save(slot);
            });
            session.setParkedSlotId(null);
        }

        Zone zone = zoneRepository.findById(session.getAssignedZoneId())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay Zone"));
        if (zone.getCurrentOccupied() > 0) {
            zone.setCurrentOccupied(zone.getCurrentOccupied() - 1);
            zoneRepository.save(zone);
        }

        parkingSessionRepository.save(session);
        saveAiScanLog(session, "EXIT_GATE", "VIP_EXIT_APPROVAL", session.getExitGate(),
                DemoVehicleDataset.resolveImageUrl(session.getLicensePlate(), "VIP_EXIT_APPROVAL", session.getMobileCheckoutPhoto()),
                DemoVehicleDataset.resolveVehicleType(session.getLicensePlate(), null), 99.0, true);

        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID());
        transaction.setSessionId(session.getId());
        transaction.setParkingFee(BigDecimal.ZERO);
        transaction.setLostCardPenalty(BigDecimal.ZERO);
        transaction.setViolationPenalty(BigDecimal.ZERO);
        transaction.setTotalAmount(java.math.BigDecimal.ZERO);
        
        Transaction.PaymentMethod method = Transaction.PaymentMethod.CASH;
        if (paymentMethodStr != null && !paymentMethodStr.isBlank()) {
            try {
                method = Transaction.PaymentMethod.valueOf(paymentMethodStr.toUpperCase());
            } catch (Exception e) {
                if ("QR".equalsIgnoreCase(paymentMethodStr) || "VIETQR".equalsIgnoreCase(paymentMethodStr) || "QR_BANK".equalsIgnoreCase(paymentMethodStr)) {
                    method = Transaction.PaymentMethod.QR_BANK;
                } else if ("CARD".equalsIgnoreCase(paymentMethodStr) || "WALLET".equalsIgnoreCase(paymentMethodStr)) {
                    method = Transaction.PaymentMethod.QR_BANK;
                }
            }
        }
        
        transaction.setPaymentMethod(method);
        transaction.setPaymentStatus(Transaction.PaymentStatus.SUCCESS);
        transaction.setProcessedAt(Instant.now());
        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public CheckInResponse approvePendingEntry(com.parking.service.PendingGateVehicleService.PendingEntry pendingEntry) {
        if (pendingEntry == null) {
            throw new ApiExceptions.NotFoundException("Khong tim thay xe dang cho vao cong");
        }

        if (!pendingEntry.isVip()) {
            throw new ApiExceptions.BadRequestException("Khach vang lai phai quet the tam tai lan staff truoc khi vao bai");
        }

        Optional<ParkingSession> existing = parkingSessionRepository.findByLicensePlateAndSessionStatus(
                pendingEntry.getLicensePlate(), ParkingSession.SessionStatus.ACTIVE);
        if (existing.isPresent()) {
            throw new ApiExceptions.ConflictException("Xe nay dang co phien gui xe ACTIVE");
        }

        String vehicleType = DemoVehicleDataset.resolveVehicleType(
                pendingEntry.getLicensePlate(),
                pendingEntry.getVehicleType() != null ? pendingEntry.getVehicleType() : "SEDAN_HATCHBACK");
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(pendingEntry.getLicensePlate());
        if (vehicleOpt.isPresent() && vehicleOpt.get().getVehicleSize() != null) {
            vehicleType = DemoVehicleDataset.resolveVehicleType(pendingEntry.getLicensePlate(), vehicleOpt.get().getVehicleSize());
        }

        ParkingSession session = new ParkingSession();
        session.setId(UUID.randomUUID());
        session.setLicensePlate(pendingEntry.getLicensePlate());
        session.setCheckInTime(Instant.now());
        session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
        session.setIsVip(pendingEntry.isVip());
        session.setIsSuspicious(pendingEntry.isSuspicious());
        session.setSuspiciousReason(pendingEntry.getSuspiciousReason());
        session.setEntryGate(null);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            session.setVehicleId(vehicle.getId());
            session.setIsLocked(vehicle.isLocked());
        }
        if (pendingEntry.getAssignedZoneId() != null) {
            session.setAssignedZoneId(pendingEntry.getAssignedZoneId());
        }

        Zone zone = ensureApprovedZone(session, vehicleType);
        parkingSessionRepository.save(session);
        saveAiScanLog(session, "ENTRY_GATE", "VIP_PENDING_APPROVAL", pendingEntry.getEntryGate(),
                DemoVehicleDataset.resolveImageUrl(session.getLicensePlate(), "VIP_PENDING_APPROVAL", session.getMobileCheckoutPhoto()),
                vehicleType, 99.0, true);

        return new CheckInResponse(session.getId().toString(), zone.getCode(), "ENTRY_APPROVED");
    }

    @Override
    @Transactional
    public void verifyExitQr(String detectedPlate, String qrToken) {
        // 1. Kiểm tra QR động
        VipQrIdentifier qr = vipQrIdentifierRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new ApiExceptions.BadRequestException("Mã QR không tồn tại trong hệ thống!"));

        if (qr.isUsed()) {
            throw new ApiExceptions.BadRequestException("Mã QR này đã được sử dụng trước đó!");
        }

        if (qr.getExpiredAt().isBefore(Instant.now())) {
            throw new ApiExceptions.BadRequestException("Mã QR đã hết hạn sử dụng (quá 5 phút)!");
        }

        // 2. Tìm xe gắn với QR
        Vehicle vehicle = vehicleRepository.findById(qr.getVehicleId())
                .orElseThrow(() -> new ApiExceptions.BadRequestException("Phương tiện liên kết với QR không tồn tại!"));

        // Điều kiện 1: Biển số xe hệ thống quét phải thuộc về xe gắn với QR
        String qrVehiclePlate = vehicle.getLicensePlate();
        if (!qrVehiclePlate.equalsIgnoreCase(detectedPlate)) {
            throw new ApiExceptions.BadRequestException(
                    "Biển số xe quét được từ Camera không trùng khớp với xe của mã QR!");
        }

        // 3. Tìm phiên gửi xe đang ACTIVE của phương tiện
        ParkingSession session = parkingSessionRepository.findByLicensePlateAndSessionStatus(
                qrVehiclePlate,
                ParkingSession.SessionStatus.ACTIVE).orElseThrow(
                        () -> new ApiExceptions.NotFoundException("Không tìm thấy phiên gửi xe hoạt động cho xe này!"));

        // 4. Check khóa chống trộm (Anti-theft)
        if (session.getIsLocked() != null && session.getIsLocked()) {
            // Giữ Barie đóng, ghi Audit Log (action_type = 'ANTI_THEFT_TRIGGERED')
            AuditLog audit = new AuditLog();
            audit.setId(UUID.randomUUID());
            audit.setActionType("ANTI_THEFT_TRIGGERED");
            audit.setEntityType("parking_sessions");
            audit.setEntityId(session.getId());
            audit.setNewValue("{\"is_locked\": true}");
            audit.setCreatedAt(Instant.now());
            auditLogRepository.save(audit);

            SecurityAlert alert = new SecurityAlert();
            alert.setAlertType("NGHI NGỜ TRỘM CẮP");
            alert.setLicensePlate(session.getLicensePlate() != null ? session.getLicensePlate() : qrVehiclePlate);
            alert.setReason("Phát hiện cố tình xuất bãi khi xe đang bật Khóa chống trộm.");
            alert.setIsActionable(true);
            securityAlertRepository.save(alert);

            // Gửi Push Notification thực tế qua FCMService
            String plate = session.getLicensePlate() != null ? session.getLicensePlate() : qrVehiclePlate;
            String fcmToken = null;
            if (plate != null) {
                Optional<com.parking.model.Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
                if (vehicleOpt.isPresent()) {
                    java.util.UUID ownerId = vehicleOpt.get().getOwnerId();
                    if (ownerId != null) {
                        Optional<com.parking.model.User> ownerOpt = userRepository.findById(ownerId);
                        if (ownerOpt.isPresent()) {
                            fcmToken = ownerOpt.get().getFcmToken();
                        }
                    }
                }
            }
            fcmService.sendPushNotification(
                fcmToken != null ? fcmToken : "",
                "[CẢNH BÁO CHỐNG TRỘM]",
                "Phát hiện xe " + (plate != null ? plate : "N/A") + " cố tình di chuyển ra khỏi bãi xe khi đang ở trạng thái KHÓA AN TOÀN!"
            );

            throw new ApiExceptions.ForbiddenException(
                    "Xe đang ở trạng thái KHÓA AN TOÀN chống trộm! Không thể xuất bãi.");
        }

        // 5. Đối soát chống tráo xe (Anti-swap)
        List<AiScanLog> scanLogs = aiScanLogRepository.findByDetectedPlateOrderByScannedAtDesc(detectedPlate);
        if (!scanLogs.isEmpty()) {
            AiScanLog latestLog = scanLogs.get(0);

            // Check body shape
            boolean shapeMismatch = false;
            if (vehicle.getBodyShape() != null && latestLog.getDetectedShape() != null) {
                if (!vehicle.getBodyShape().equalsIgnoreCase(latestLog.getDetectedShape())) {
                    shapeMismatch = true;
                }
            }

            // Check color diff
            boolean colorMismatch = false;
            double colorDiff = 0.0;
            if (vehicle.getColorRgb() != null && latestLog.getDetectedColorRgb() != null) {
                colorDiff = calculateColorDifference(vehicle.getColorRgb(), latestLog.getDetectedColorRgb());
                if (colorDiff > 30.0) {
                    colorMismatch = true;
                }
            }

            if (shapeMismatch || colorMismatch) {
                session.setIsSuspicious(true);
                session.setSuspiciousReason("FINGERPRINT_MISMATCH: " + (shapeMismatch ? "Sai kiểu dáng xe. " : "")
                        + (colorMismatch ? "Độ lệch màu sắc: " + colorDiff : ""));
                parkingSessionRepository.save(session);

                AuditLog audit = new AuditLog();
                audit.setId(UUID.randomUUID());
                audit.setActionType("FINGERPRINT_MISMATCH");
                audit.setEntityType("parking_sessions");
                audit.setEntityId(session.getId());
                audit.setOldValue(
                        "{\"color\":\"" + vehicle.getColorRgb() + "\", \"shape\":\"" + vehicle.getBodyShape() + "\"}");
                audit.setNewValue("{\"color\":\"" + latestLog.getDetectedColorRgb() + "\", \"shape\":\""
                        + latestLog.getDetectedShape() + "\"}");
                audit.setCreatedAt(Instant.now());
                auditLogRepository.save(audit);

                throw new ApiExceptions.ForbiddenException(
                        "LỖI ĐỐI SOÁT NGOẠI QUAN (Anti-swap): Sai lệch đặc trưng hình học/màu sắc của xe so với cổng vào! Barrier được giữ đóng.");
            }
        }

        // 6. Check gói cước VIP (VipSubscription) của xe đó phải đang ở trạng thái
        // 'ACTIVE'
        VipSubscription sub = vipSubscriptionRepository
                .findByVehicleIdAndStatus(vehicle.getId(), VipSubscription.Status.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.BadRequestException("Xe không có gói cước VIP hoạt động!"));

        // Check subscription dates
        java.time.LocalDate today = java.time.LocalDate.now();
        if (sub.getStartDate().isAfter(today) || sub.getEndDate().isBefore(today)) {
            throw new ApiExceptions.BadRequestException(
                    "Gói cước VIP của phương tiện đã hết hạn hoặc chưa đến ngày kích hoạt!");
        }

        // 7. Kết thúc phiên gửi xe (Nghiệm thu thành công)
        qr.setUsed(true);
        vipQrIdentifierRepository.save(qr);

        session.setValidatedQrId(qr.getId());
        session.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
        session.setCheckOutTime(Instant.now());
        session.setSlotPhotoUrl(null);
        if (session.getParkedSlotId() != null) {
            slotRepository.findById(session.getParkedSlotId()).ifPresent(slot -> {
                slot.setSlotStatus("AVAILABLE");
                slot.setLastUpdated(Instant.now());
                slotRepository.save(slot);
            });
        }
        parkingSessionRepository.save(session);

        // Tăng số chỗ trống của Zone đỗ (+1 slot)
        Zone zone = zoneRepository.findById(session.getAssignedZoneId())
                .orElseThrow(
                        () -> new ApiExceptions.BadRequestException("Không tìm thấy tầng đỗ liên kết với phiên gửi!"));

        if (zone.getCurrentOccupied() > 0) {
            zone.setCurrentOccupied(zone.getCurrentOccupied() - 1);
            zoneRepository.save(zone);
        }

        // Ghi Audit Log ('QR_CODE_CHECK_OUT')
        AuditLog audit = new AuditLog();
        audit.setId(UUID.randomUUID());
        audit.setActionType("QR_CODE_CHECK_OUT");
        audit.setEntityType("parking_sessions");
        audit.setEntityId(session.getId());
        audit.setNewValue(
                "{\"session_status\":\"COMPLETED\", \"check_out_time\":\"" + session.getCheckOutTime() + "\"}");
        audit.setCreatedAt(Instant.now());
        auditLogRepository.save(audit);
    }

    private double calculateColorDifference(String hexColor1, String hexColor2) {
        try {
            if (hexColor1.startsWith("#"))
                hexColor1 = hexColor1.substring(1);
            if (hexColor2.startsWith("#"))
                hexColor2 = hexColor2.substring(1);

            int r1 = Integer.parseInt(hexColor1.substring(0, 2), 16);
            int g1 = Integer.parseInt(hexColor1.substring(2, 4), 16);
            int b1 = Integer.parseInt(hexColor1.substring(4, 6), 16);

            int r2 = Integer.parseInt(hexColor2.substring(0, 2), 16);
            int g2 = Integer.parseInt(hexColor2.substring(2, 4), 16);
            int b2 = Integer.parseInt(hexColor2.substring(4, 6), 16);

            return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
        } catch (Exception e) {
            return 0.0;
        }
    }

    // task 5 visitor check in
    @Override
    @Transactional
    public CheckInResponse visitorCheckIn(VisitorCheckInRequest request) {
        String plate = DemoVehicleDataset.normalizePlate(request.getPlate());
        String evidenceImageUrl = DemoVehicleDataset.resolveImageUrl(plate, "VISITOR_ENTRY_LPR", request.getImage_url());
        ParkingSession sessionToUpdate = null;
        // Chốt chặn kiểm tra nếu xe là VIP đang hoạt động thì không được cấp thẻ tạm
        // vãng lai
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            Optional<VipSubscription> vipOpt = vipSubscriptionRepository.findByVehicleIdAndStatus(
                    vehicle.getId(), VipSubscription.Status.ACTIVE);
            if (vipOpt.isPresent()) {
                VipSubscription vip = vipOpt.get();
                java.time.LocalDate today = java.time.LocalDate.now();
                if (!today.isBefore(vip.getStartDate()) && !today.isAfter(vip.getEndDate())) {
                    throw new com.parking.exception.ApiExceptions.BadRequestException(
                            "Phương tiện này đã đăng ký gói VIP đang hoạt động! Vui lòng đi vào làn tự động (AI/QR) hoặc gia hạn.");
                }
            }
        }

        Optional<ParkingSession> existing = parkingSessionRepository.findByLicensePlateAndSessionStatus(
                plate,
                ParkingSession.SessionStatus.ACTIVE);

        if (existing.isPresent()) {
            ParkingSession session = existing.get();
            if (session.getEntryGate() != null && session.getCardId() == null) {
                // If the vehicle is currently waiting at the entry gate, update this session during check-in
                sessionToUpdate = session;
            } else {
                throw new ApiExceptions.ConflictException("Xe này đang có phiên gửi xe ACTIVE");
            }
        }

        String cardCode = request.getCard_code() != null ? request.getCard_code().trim() : "";
        if (cardCode.isBlank()) {
            throw new ApiExceptions.BadRequestException("Khách vãng lai phải có mã thẻ tạm");
        }

        Card card = cardRepository.findByCardCode(cardCode)
                .orElseGet(() -> {
                    Card newCard = new Card();
                    newCard.setId(UUID.randomUUID());
                    newCard.setCardCode(cardCode);
                    newCard.setStatus(Card.CardStatus.AVAILABLE);
                    newCard.setCreatedAt(Instant.now());
                    newCard.setUpdatedAt(Instant.now());
                    return cardRepository.save(newCard);
                });

        if (card.getStatus() != Card.CardStatus.AVAILABLE) {
            throw new ApiExceptions.BadRequestException("Thẻ này không khả dụng để cấp cho khách vãng lai");
        }

        if (blacklistRepository.existsByCardId(card.getId())) { // Kiểm tra blacklist
            throw new ApiExceptions.ForbiddenException("Thẻ này đang nằm trong blacklist");
        }
        String resolvedVehicleType = DemoVehicleDataset.resolveVehicleType(plate, request.getVehicle_type());
        if (vehicleOpt.isPresent()) {
            resolvedVehicleType = DemoVehicleDataset.resolveVehicleType(plate, vehicleOpt.get().getVehicleSize());
        }
        final String targetVehicleType = normalizeVehicleSize(resolvedVehicleType);

        List<Zone> candidates = zoneRepository.findAll(); // tim zone phù hợp
        Zone chosen = null;

        List<Zone> availableCandidates = new java.util.ArrayList<>();
        for (Zone z : candidates) {
            if (allowedVehicleSizeCodes(z).contains(targetVehicleType)
                    && z.getTotalSlots() - z.getCurrentOccupied() > 0) {
                availableCandidates.add(z);
            }
        }
        if (!availableCandidates.isEmpty()) {
            int randomIndex = java.util.concurrent.ThreadLocalRandom.current().nextInt(availableCandidates.size());
            chosen = availableCandidates.get(randomIndex);
        }

        if (chosen == null) {
            List<Zone> matchedCandidates = new java.util.ArrayList<>();
            for (Zone z : candidates) {
                if (allowedVehicleSizeCodes(z).contains(targetVehicleType)) {
                    matchedCandidates.add(z);
                }
            }
            if (!matchedCandidates.isEmpty()) {
                int randomIndex = java.util.concurrent.ThreadLocalRandom.current().nextInt(matchedCandidates.size());
                chosen = matchedCandidates.get(randomIndex);
            }
        }

        if (chosen == null && !candidates.isEmpty()) {
            int randomIndex = java.util.concurrent.ThreadLocalRandom.current().nextInt(candidates.size());
            chosen = candidates.get(randomIndex);
        }

        if (chosen == null) {
            throw new ApiExceptions.BadRequestException("Không tìm thấy bất kỳ zone nào trong hệ thống");
        }

        chosen = chooseZoneForPlate(plate, targetVehicleType);

        if (sessionToUpdate == null || sessionToUpdate.getEntryGate() != null) {
            zoneRepository.increaseOccupied(chosen.getId());
        }

        Vehicle vehicle = vehicleOpt
                .orElseGet(() -> {

                    Vehicle newVehicle = new Vehicle();

                    newVehicle.setId(UUID.randomUUID());

                    // driver_casual trong seed data
                    newVehicle.setOwnerId(
                            UUID.fromString(
                                     "a0000000-0000-0000-0000-000000000005"));

                    newVehicle.setLicensePlate(plate);

                    newVehicle.setVehicleSize(targetVehicleType);

                    DemoVehicleDataset.findByPlate(plate).ifPresent(profile -> {
                        newVehicle.setBrand(profile.model());
                        newVehicle.setColor(profile.color());
                        newVehicle.setColorRgb(profile.colorRgb());
                        newVehicle.setBodyShape(profile.bodyShape());
                        newVehicle.setRegistrationDocUrl(profile.registrationDocUrl());
                        newVehicle.setRegistrationPhotoUrl(profile.registrationPhotoUrl());
                    });
                    if (newVehicle.getBrand() == null) {
                        newVehicle.setBrand(vehicleSizeLabel(targetVehicleType));
                    }
                    if (newVehicle.getBodyShape() == null) {
                        newVehicle.setBodyShape(targetVehicleType);
                    }
                    newVehicle.setFuelType(DemoVehicleDataset.resolveFuelType(plate, request.getFuel_type()));

                    newVehicle.setActive(true);

                    newVehicle.setCreatedAt(Instant.now());

                    newVehicle.setUpdatedAt(Instant.now());

                    return vehicleRepository.save(newVehicle);
                });

        ParkingSession session = sessionToUpdate != null ? sessionToUpdate : new ParkingSession();
        if (sessionToUpdate == null) {
            session.setId(UUID.randomUUID());
            session.setLicensePlate(plate);
            session.setVehicleId(vehicle.getId());
            session.setIsLocked(vehicle.isLocked());
            session.setCheckInTime(Instant.now());
            session.setCreatedAt(Instant.now());
            session.setAssignedZoneId(chosen.getId());
            session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
            session.setIsVip(false);
            session.setMobileCheckoutPhoto(evidenceImageUrl);
            session.setEntryGate(request.getGate());
        }

        session.setAssignedZoneId(chosen.getId());
        session.setCardId(card.getId());
        session.setUpdatedAt(Instant.now());

        // Clear suspicious status and entry gate if it was an error session
        if (sessionToUpdate != null) {
            session.setIsSuspicious(false);
            session.setSuspiciousReason(null);
            session.setCheckInTime(Instant.now());
        }

        parkingSessionRepository.save(session); // save vào database

        // Đổi trạng thái thẻ
        saveAiScanLog(session, "ENTRY_GATE", "VISITOR_ENTRY_LPR", request.getGate(), evidenceImageUrl,
                targetVehicleType, 99.0, true);

        card.setStatus(Card.CardStatus.IN_USE);
        card.setUpdatedAt(Instant.now());
        cardRepository.save(card);

        return new CheckInResponse( // trả respone về controller
                session.getId().toString(),
                chosen.getCode(),
                "VISITOR_CHECK_IN_OK");
    }

    private Zone ensureApprovedZone(ParkingSession session, String vehicleType) {
        Zone chosen = null;
        if (session.getAssignedZoneId() != null) {
            chosen = zoneRepository.findById(session.getAssignedZoneId()).orElse(null);
        }
        if (chosen == null) {
            String targetVehicleType = normalizeVehicleSize(vehicleType);
            List<Zone> candidates = new java.util.ArrayList<>();
            for (Zone z : zoneRepository.findAll()) {
                if (allowedVehicleSizeCodes(z).contains(targetVehicleType)) {
                    candidates.add(z);
                }
            }
            List<Zone> availableCandidates = new java.util.ArrayList<>();
            for (Zone z : candidates) {
                if (z.getTotalSlots() - z.getCurrentOccupied() > 0) {
                    availableCandidates.add(z);
                }
            }
            if (!availableCandidates.isEmpty()) {
                int randomIndex = java.util.concurrent.ThreadLocalRandom.current().nextInt(availableCandidates.size());
                chosen = availableCandidates.get(randomIndex);
            }
            if (chosen == null && !candidates.isEmpty()) {
                int randomIndex = java.util.concurrent.ThreadLocalRandom.current().nextInt(candidates.size());
                chosen = candidates.get(randomIndex);
            }
        }
        if (chosen == null) {
            List<Zone> allZones = zoneRepository.findAll();
            if (!allZones.isEmpty()) {
                int randomIndex = java.util.concurrent.ThreadLocalRandom.current().nextInt(allZones.size());
                chosen = allZones.get(randomIndex);
            } else {
                throw new ApiExceptions.BadRequestException("Khong tim thay zone de cho xe vao bai");
            }
        }

        session.setAssignedZoneId(chosen.getId());
        zoneRepository.increaseOccupied(chosen.getId());

        return chosen;
    }

    // checkout
    @Override
    @Transactional
    public Transaction checkoutCard(UUID cardId) {
        ParkingSession session = parkingSessionRepository
                .findByCardIdAndSessionStatusIn(
                        cardId,
                        java.util.List.of(
                                ParkingSession.SessionStatus.ACTIVE,
                                ParkingSession.SessionStatus.PASSED_CONFIRMED,
                                ParkingSession.SessionStatus.LOST_CARD))
                .stream()
                .findFirst()
                .orElseThrow(
                        () -> new ApiExceptions.NotFoundException(
                                "Không tìm thấy phiên gửi xe hợp lệ"));

        if (session.getIsLocked() != null && session.getIsLocked()) {
            SecurityAlert alert = new SecurityAlert();
            alert.setAlertType("NGHI NGỜ TRỘM CẮP");
            alert.setLicensePlate(session.getLicensePlate() != null ? session.getLicensePlate() : "N/A");
            alert.setReason("Phát hiện cố tình xuất bãi khi xe đang bật Khóa chống trộm.");
            alert.setIsActionable(true);
            securityAlertRepository.save(alert);

            // Gửi Push Notification thực tế qua FCMService
            String plate = session.getLicensePlate();
            String fcmToken = null;
            if (plate != null) {
                Optional<com.parking.model.Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
                if (vehicleOpt.isPresent()) {
                    java.util.UUID ownerId = vehicleOpt.get().getOwnerId();
                    if (ownerId != null) {
                        Optional<com.parking.model.User> ownerOpt = userRepository.findById(ownerId);
                        if (ownerOpt.isPresent()) {
                            fcmToken = ownerOpt.get().getFcmToken();
                        }
                    }
                }
            }
            fcmService.sendPushNotification(
                fcmToken != null ? fcmToken : "",
                "[CẢNH BÁO CHỐNG TRỘM]",
                "Phát hiện xe " + (plate != null ? plate : "N/A") + " cố tình di chuyển ra khỏi bãi xe khi đang ở trạng thái KHÓA AN TOÀN!"
            );

            throw new ApiExceptions.ForbiddenException(
                    "Xe đang ở trạng thái KHÓA AN TOÀN chống trộm! Không thể xuất bãi.");
        }

        // task 7
        if (session.getSessionStatus() == ParkingSession.SessionStatus.PASSED_CONFIRMED) {
            Transaction transaction = transactionRepository.findBySessionId(session.getId())
                    .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay giao dich Mobile POS"));
            return decorateMobileCheckoutWindow(transaction, session, Instant.now());
        }

        if (session.getIsVip() != null && session.getIsVip()) {
            throw new ApiExceptions.BadRequestException("Xe VIP không checkout bằng thẻ vãng lai");
        }

        if (blacklistRepository.existsByCardId(cardId)) {
            throw new ApiExceptions.ForbiddenException("Thẻ này đang nằm trong blacklist, không thể checkout");
        }

        Optional<Transaction> existingTxnOpt = transactionRepository.findBySessionId(session.getId());
        if (existingTxnOpt.isPresent()) {
            Transaction existingTxn = existingTxnOpt.get();
            if (existingTxn.getPaymentStatus() == Transaction.PaymentStatus.PENDING) {
                Vehicle vehicle = vehicleRepository.findByLicensePlate(session.getLicensePlate())
                        .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin xe để tính phí"));

                Instant checkOutTime = Instant.now();
                BigDecimal parkingFee = this.calculateParkingFeeSafe(
                        vehicle.getVehicleSize(),
                        session.getCheckInTime(),
                        checkOutTime);

                BigDecimal lostCardPenalty = BigDecimal.ZERO;
                if (session.getSessionStatus() == ParkingSession.SessionStatus.LOST_CARD) {
                    PricingRule pricingRule = pricingRuleRepository
                            .findFirstByVehicleSizeAndIsActiveTrueOrderByEffectiveFromDesc(vehicle.getVehicleSize())
                            .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy cấu hình bảng giá"));
                    lostCardPenalty = pricingRule.getLostCardPenalty();
                }

                BigDecimal violationPenalty = applyPendingViolationPenalties(session, vehicle, false);

                existingTxn.setParkingFee(parkingFee);
                existingTxn.setLostCardPenalty(lostCardPenalty);
                existingTxn.setViolationPenalty(violationPenalty);
                existingTxn.setTotalAmount(parkingFee.add(lostCardPenalty).add(violationPenalty));
                
                List<ParkingViolation> pendingViolations = parkingViolationRepository.findBySessionIdAndStatus(session.getId(), "PENDING");
                existingTxn.setViolationCount(pendingViolations.size());
                existingTxn.setProcessedAt(checkOutTime);

                return transactionRepository.save(existingTxn);
            } else {
                throw new ApiExceptions.ConflictException("Phiên gửi xe này đã có transaction");
            }
        }

        Vehicle vehicle = vehicleRepository.findByLicensePlate(session.getLicensePlate())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin xe để tính phí"));

        Instant checkOutTime = Instant.now();

        BigDecimal parkingFee = this.calculateParkingFeeSafe(
                vehicle.getVehicleSize(),
                session.getCheckInTime(),
                checkOutTime);

        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID());
        transaction.setSessionId(session.getId());
        BigDecimal lostCardPenalty = BigDecimal.ZERO;

        if (session.getSessionStatus() == ParkingSession.SessionStatus.LOST_CARD) {

            PricingRule pricingRule = pricingRuleRepository
                    .findFirstByVehicleSizeAndIsActiveTrueOrderByEffectiveFromDesc(
                            vehicle.getVehicleSize())
                    .orElseThrow(() -> new ApiExceptions.NotFoundException(
                            "Không tìm thấy cấu hình bảng giá"));

            lostCardPenalty = pricingRule.getLostCardPenalty();
        }

        BigDecimal violationPenalty = applyPendingViolationPenalties(session, vehicle, false);

        transaction.setParkingFee(parkingFee);
        transaction.setLostCardPenalty(lostCardPenalty);
        transaction.setViolationPenalty(violationPenalty);
        transaction.setTotalAmount(parkingFee.add(lostCardPenalty).add(violationPenalty));
        
        List<ParkingViolation> pendingViolations = parkingViolationRepository.findBySessionIdAndStatus(session.getId(), "PENDING");
        transaction.setViolationCount(pendingViolations.size());
        transaction.setPaymentMethod(Transaction.PaymentMethod.CASH);
        transaction.setPaymentStatus(Transaction.PaymentStatus.PENDING);
        transaction.setIsMobileCheckout(false);
        transaction.setProcessedAt(checkOutTime);

        transaction = transactionRepository.save(transaction);

        return transaction;
    }

    private BigDecimal applyPendingViolationPenalties(ParkingSession session, Vehicle vehicle, boolean markProcessed) {
        List<ParkingViolation> pendingViolations = parkingViolationRepository
                .findBySessionIdAndStatus(session.getId(), "PENDING");

        if (pendingViolations.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal evPenaltyRate = new java.math.BigDecimal("100000");
        BigDecimal totalFines = BigDecimal.ZERO;

        for (ParkingViolation violation : pendingViolations) {
            if (violation.isFirstViolation()) {
                violation.setPenaltyAmount(BigDecimal.ZERO);
            } else {
                violation.setPenaltyAmount(evPenaltyRate);
                totalFines = totalFines.add(evPenaltyRate);
            }
            violation.setPenaltyApplied(true);
            if (markProcessed) {
                violation.setStatus("PROCESSED");
            }
        }

        parkingViolationRepository.saveAll(pendingViolations);
        return totalFines;
    }

    private void markPendingViolationsProcessed(UUID sessionId) {
        List<ParkingViolation> pendingViolations = parkingViolationRepository
                .findBySessionIdAndStatus(sessionId, "PENDING");
        if (pendingViolations.isEmpty()) {
            return;
        }
        for (ParkingViolation violation : pendingViolations) {
            violation.setStatus("PROCESSED");
        }
        parkingViolationRepository.saveAll(pendingViolations);
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal calculateMobileCheckoutOverstayPenalty(
            ParkingSession session,
            Instant expireTime,
            Instant checkOutTime) {

        if (expireTime == null || checkOutTime == null || !checkOutTime.isAfter(expireTime)) {
            return BigDecimal.ZERO;
        }

        Vehicle vehicle = vehicleRepository.findByLicensePlate(session.getLicensePlate())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay thong tin xe de tinh phi qua han"));

        return this.calculateParkingFeeByElapsedBlocks(
                vehicle.getVehicleSize(),
                expireTime,
                checkOutTime);
    }

    private BigDecimal calculateParkingFeeByElapsedBlocks(String vehicleSize, Instant checkIn, Instant checkOut) {
        PricingRule pricingRule = pricingRuleRepository
                .findFirstByVehicleSizeAndIsActiveTrueOrderByEffectiveFromDesc(vehicleSize)
                .orElseThrow(() -> new ApiExceptions.NotFoundException(
                        "Khong tim thay bang gia he thong phu hop cho loai xe: " + vehicleSize));

        long seconds = Duration.between(checkIn, checkOut).getSeconds();
        if (seconds <= 0) {
            return BigDecimal.ZERO;
        }

        long totalHours = Math.max(1, (seconds + 3599) / 3600);
        long fullDays = totalHours / 24;
        long remainingHours = totalHours % 24;

        BigDecimal firstHourFee = zeroIfNull(pricingRule.getFirstHourFee());
        BigDecimal additionalHourFee = zeroIfNull(pricingRule.getAdditionalHourFee());
        BigDecimal maxDailyFee = zeroIfNull(pricingRule.getMaxDailyFee());

        BigDecimal total = maxDailyFee.multiply(BigDecimal.valueOf(fullDays));
        if (remainingHours > 0) {
            BigDecimal partialFee = firstHourFee;
            if (remainingHours > 1) {
                partialFee = partialFee.add(additionalHourFee.multiply(BigDecimal.valueOf(remainingHours - 1)));
            }
            if (maxDailyFee.compareTo(BigDecimal.ZERO) > 0) {
                partialFee = partialFee.min(maxDailyFee);
            }
            total = total.add(partialFee);
        }

        return total;
    }

    private Transaction decorateMobileCheckoutWindow(
            Transaction transaction,
            ParkingSession session,
            Instant referenceTime) {

        if (session.getMobileCheckoutAt() == null) {
            transaction.setMobileCheckoutExpiresAt(null);
            transaction.setMobileCheckoutGraceExpired(false);
            transaction.setMobileCheckoutOverstayPenalty(BigDecimal.ZERO);
            return transaction;
        }

        Instant expireTime = session.getMobileCheckoutAt().plusSeconds(1800);
        Instant checkTime = referenceTime != null ? referenceTime : Instant.now();
        BigDecimal overstayPenalty = calculateMobileCheckoutOverstayPenalty(session, expireTime, checkTime);

        transaction.setMobileCheckoutExpiresAt(expireTime);
        transaction.setMobileCheckoutGraceExpired(checkTime.isAfter(expireTime));
        transaction.setMobileCheckoutOverstayPenalty(overstayPenalty);
        return transaction;
    }

    private Transaction completeMobileCheckoutExit(
            Transaction transaction,
            ParkingSession session,
            Instant checkOutTime) {

        Transaction decorated = decorateMobileCheckoutWindow(transaction, session, checkOutTime);
        BigDecimal overstayPenalty = zeroIfNull(decorated.getMobileCheckoutOverstayPenalty());

        if (overstayPenalty.compareTo(BigDecimal.ZERO) > 0) {
            transaction.setViolationPenalty(zeroIfNull(transaction.getViolationPenalty()).add(overstayPenalty));
            transaction.setTotalAmount(zeroIfNull(transaction.getTotalAmount()).add(overstayPenalty));
        }

        transaction.setPaymentStatus(Transaction.PaymentStatus.SUCCESS);
        transaction = transactionRepository.save(transaction);
        transaction.setMobileCheckoutExpiresAt(decorated.getMobileCheckoutExpiresAt());
        transaction.setMobileCheckoutGraceExpired(decorated.getMobileCheckoutGraceExpired());
        transaction.setMobileCheckoutOverstayPenalty(overstayPenalty);

        session.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
        session.setCheckOutTime(checkOutTime);
        session.setSlotPhotoUrl(null);
        if (session.getParkedSlotId() != null) {
            slotRepository.findById(session.getParkedSlotId()).ifPresent(slot -> {
                slot.setSlotStatus("AVAILABLE");
                slot.setLastUpdated(Instant.now());
                slotRepository.save(slot);
            });
        }
        parkingSessionRepository.save(session);
        saveAiScanLog(session, "EXIT_GATE", "MOBILE_POS_EXIT_CONFIRM", session.getExitGate(),
                DemoVehicleDataset.resolveImageUrl(session.getLicensePlate(), "MOBILE_POS_EXIT_CONFIRM", session.getMobileCheckoutPhoto()),
                DemoVehicleDataset.resolveVehicleType(session.getLicensePlate(), null), 99.0, true);

        if (session.getCardId() != null) {
            cardRepository.findById(session.getCardId()).ifPresent(card -> {
                card.setStatus(Card.CardStatus.AVAILABLE);
                cardRepository.save(card);
            });
        }

        if (session.getAssignedZoneId() != null) {
            zoneRepository.decreaseOccupied(session.getAssignedZoneId());
        }

        return transaction;
    }

    // confirm check out cho visitor
    @Override
    @Transactional
    public Transaction confirmCheckout(UUID transactionId, String paymentMethodStr) {

        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new ApiExceptions.NotFoundException(
                        "Không tìm thấy transaction"));

        if (paymentMethodStr != null && !paymentMethodStr.isBlank()) {
            try {
                transaction.setPaymentMethod(Transaction.PaymentMethod.valueOf(paymentMethodStr.toUpperCase()));
            } catch (Exception e) {
                if ("QR".equalsIgnoreCase(paymentMethodStr) || "VIETQR".equalsIgnoreCase(paymentMethodStr) || "QR_BANK".equalsIgnoreCase(paymentMethodStr)) {
                    transaction.setPaymentMethod(Transaction.PaymentMethod.QR_BANK);
                } else if ("CASH".equalsIgnoreCase(paymentMethodStr)) {
                    transaction.setPaymentMethod(Transaction.PaymentMethod.CASH);
                } else if ("MOMO".equalsIgnoreCase(paymentMethodStr) || "MOMO_SANDBOX".equalsIgnoreCase(paymentMethodStr)) {
                    transaction.setPaymentMethod(Transaction.PaymentMethod.MOMO_SANDBOX);
                } else if ("VNPAY".equalsIgnoreCase(paymentMethodStr) || "VNPAY_SANDBOX".equalsIgnoreCase(paymentMethodStr)) {
                    transaction.setPaymentMethod(Transaction.PaymentMethod.VNPAY_SANDBOX);
                }
            }
            transactionRepository.save(transaction);
        }

        if (transaction.getPaymentStatus() == Transaction.PaymentStatus.SUCCESS) {
            if (Boolean.TRUE.equals(transaction.getIsMobileCheckout())) {
                ParkingSession mobileSession = parkingSessionRepository
                        .findById(transaction.getSessionId())
                        .orElseThrow(() -> new ApiExceptions.NotFoundException(
                                "Khong tim thay parking session"));

                if (mobileSession.getSessionStatus() == ParkingSession.SessionStatus.COMPLETED) {
                    Instant referenceTime = mobileSession.getCheckOutTime() != null
                            ? mobileSession.getCheckOutTime()
                            : Instant.now();
                    return decorateMobileCheckoutWindow(transaction, mobileSession, referenceTime);
                }

                if (mobileSession.getSessionStatus() != ParkingSession.SessionStatus.COMPLETED) {
                    return completeMobileCheckoutExit(transaction, mobileSession, Instant.now());
                }
            }

            return transactionRepository.save(transaction);
        }

        transaction.setPaymentStatus(
                Transaction.PaymentStatus.SUCCESS);

        transactionRepository.save(transaction);

        ParkingSession session = parkingSessionRepository
                .findById(transaction.getSessionId())
                .orElseThrow(() -> new ApiExceptions.NotFoundException(
                        "Không tìm thấy parking session"));
        // sủa chỗ này
        session.setSessionStatus(
                ParkingSession.SessionStatus.COMPLETED);

        session.setCheckOutTime(Instant.now());

        session.setSlotPhotoUrl(null);

        if (session.getParkedSlotId() != null) {
            slotRepository.findById(session.getParkedSlotId()).ifPresent(slot -> {
                slot.setSlotStatus("AVAILABLE");
                slot.setLastUpdated(Instant.now());
                slotRepository.save(slot);
            });
        }

        parkingSessionRepository.save(session); //
        saveAiScanLog(session, "EXIT_GATE", "CARD_EXIT_CONFIRM", session.getExitGate(),
                DemoVehicleDataset.resolveImageUrl(session.getLicensePlate(), "CARD_EXIT_CONFIRM", session.getMobileCheckoutPhoto()),
                DemoVehicleDataset.resolveVehicleType(session.getLicensePlate(), null), 99.0, true);

        markPendingViolationsProcessed(session.getId());

        Card card = cardRepository
                .findById(session.getCardId())
                .orElseThrow(() -> new ApiExceptions.NotFoundException(
                        "Không tìm thấy thẻ"));

        card.setStatus(Card.CardStatus.AVAILABLE);

        cardRepository.save(card);

        if (session.getAssignedZoneId() != null) {
            zoneRepository.decreaseOccupied(
                    session.getAssignedZoneId());
        }

        return transaction;
    }

    // task 7 check out lưu động

    @Override
    @Transactional
    public Transaction congestionCheckout(
            CongestionCheckoutRequest request) {

        ParkingSession session = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(
                        request.getLicensePlate(),
                        ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(
                        () -> new ApiExceptions.NotFoundException(
                                "Không tìm thấy phiên gửi xe ACTIVE"));

        if (session.getIsVip() != null
                && session.getIsVip()) {

            throw new ApiExceptions.BadRequestException(
                    "Xe VIP không thuộc luồng congestion checkout");
        }

        if (transactionRepository.findBySessionId(
                session.getId()).isPresent()) {

            throw new ApiExceptions.ConflictException(
                    "Phiên gửi xe này đã có transaction");
        }

        Vehicle vehicle = vehicleRepository
                .findByLicensePlate(
                        session.getLicensePlate())
                .orElseThrow(
                        () -> new ApiExceptions.NotFoundException(
                                "Không tìm thấy thông tin xe"));

        Instant checkoutTime = Instant.now();

        BigDecimal parkingFee = this.calculateParkingFeeSafe(
                vehicle.getVehicleSize(),
                session.getCheckInTime(),
                checkoutTime);

        List<ParkingViolation> pendingViolations = parkingViolationRepository.findBySessionIdAndStatus(session.getId(), "PENDING");
        BigDecimal violationPenalty = applyPendingViolationPenalties(session, vehicle, true);

        Transaction transaction = new Transaction();

        transaction.setId(UUID.randomUUID());

        transaction.setSessionId(
                session.getId());
        transaction.setViolationCount(pendingViolations.size());

        transaction.setParkingFee(
                parkingFee);

        transaction.setLostCardPenalty(
                BigDecimal.ZERO);

        transaction.setViolationPenalty(
                violationPenalty);

        transaction.setTotalAmount(
                parkingFee.add(violationPenalty));

        transaction.setPaymentMethod(
                request.getPaymentMethod());

        transaction.setPaymentStatus(
                Transaction.PaymentStatus.SUCCESS);

        transaction.setIsMobileCheckout(true);

        transaction.setMobileGpsLocation(
                request.getGpsLocation());

        transaction.setMobilePhotoProof(
                request.getProofImageUrl());

        transaction.setProcessedBy(
                request.getStaffId());

        transaction.setProcessedAt(
                checkoutTime);

        transaction = transactionRepository.save(
                transaction);

        session.setMobileCheckoutStaffId(
                request.getStaffId());

        session.setMobileCheckoutLocation(
                request.getGpsLocation());

        session.setMobileCheckoutPhoto(
                request.getProofImageUrl());

        session.setMobileCheckoutAt(
                checkoutTime);

        session.setSessionStatus(
                ParkingSession.SessionStatus.PASSED_CONFIRMED);
        session.setSlotPhotoUrl(null);
        if (session.getParkedSlotId() != null) {
            slotRepository.findById(session.getParkedSlotId()).ifPresent(slot -> {
                slot.setSlotStatus("AVAILABLE");
                slot.setLastUpdated(Instant.now());
                slotRepository.save(slot);
            });
        }

        parkingSessionRepository.save(
                session);
        saveAiScanLog(session, "MOBILE_POS", "MOBILE_POS_PREPAY", "MOBILE_POS",
                DemoVehicleDataset.resolveImageUrl(session.getLicensePlate(), "MOBILE_POS_PREPAY", request.getProofImageUrl()),
                DemoVehicleDataset.resolveVehicleType(session.getLicensePlate(), vehicle.getVehicleSize()), 99.0, true);

        return transaction;
    }

    @Override
    @Transactional
    public void cleanupTestData() {
        List<com.parking.model.ParkingSession> sessions = parkingSessionRepository.findAll();
        for (com.parking.model.ParkingSession ps : sessions) {
            if ("30A-99999".equals(ps.getLicensePlate()) || "29A-88888".equals(ps.getLicensePlate())) {
                if (ps.getSessionStatus() == com.parking.model.ParkingSession.SessionStatus.ACTIVE
                        || ps.getSessionStatus() == com.parking.model.ParkingSession.SessionStatus.PASSED_CONFIRMED) {
                    if (ps.getAssignedZoneId() != null) {
                        zoneRepository.findById(ps.getAssignedZoneId()).ifPresent(zone -> {
                            if (zone.getCurrentOccupied() > 0) {
                                zone.setCurrentOccupied(zone.getCurrentOccupied() - 1);
                                zoneRepository.save(zone);
                            }
                        });
                    }
                }
                parkingSessionRepository.delete(ps);
            }
        }

        cardRepository.findByCardCode("000001").ifPresent(card -> {
            card.setStatus(com.parking.model.Card.CardStatus.AVAILABLE);
            cardRepository.save(card);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getParkingFee(UUID cardId) {
        ParkingSession session = parkingSessionRepository
                .findByCardIdAndSessionStatusIn(
                        cardId,
                        java.util.List.of(
                                ParkingSession.SessionStatus.ACTIVE,
                                ParkingSession.SessionStatus.PASSED_CONFIRMED,
                                ParkingSession.SessionStatus.LOST_CARD))
                .stream()
                .findFirst()
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy phiên gửi xe hợp lệ"));

        Vehicle vehicle = vehicleRepository.findByLicensePlate(session.getLicensePlate())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin xe để tính phí"));

        Instant checkOutTime = Instant.now();
        BigDecimal parkingFee = BigDecimal.ZERO;
        if (session.getIsVip() == null || !session.getIsVip()) {
            parkingFee = this.calculateParkingFeeSafe(
                    vehicle.getVehicleSize(),
                    session.getCheckInTime(),
                    checkOutTime);
        }

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("sessionId", session.getId().toString());
        response.put("cardId", cardId.toString());
        response.put("licensePlate", session.getLicensePlate());
        response.put("checkInTime", session.getCheckInTime());
        response.put("checkOutTime", checkOutTime);
        response.put("parkingFee", parkingFee);
        response.put("isVip", session.getIsVip() != null && session.getIsVip());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getParkingFeeByPlate(String plate) {
        ParkingSession session = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy phiên gửi xe hợp lệ cho biển số này"));

        Vehicle vehicle = vehicleRepository.findByLicensePlate(session.getLicensePlate())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin xe để tính phí"));

        Instant checkOutTime = Instant.now();
        BigDecimal parkingFee = BigDecimal.ZERO;
        if (session.getIsVip() == null || !session.getIsVip()) {
            parkingFee = this.calculateParkingFeeSafe(
                    vehicle.getVehicleSize(),
                    session.getCheckInTime(),
                    checkOutTime);
        }

        Card card = null;
        if (session.getCardId() != null) {
            card = cardRepository.findById(session.getCardId()).orElse(null);
        }

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("sessionId", session.getId().toString());
        response.put("licensePlate", session.getLicensePlate());
        response.put("checkInTime", session.getCheckInTime());
        response.put("checkOutTime", checkOutTime);
        response.put("parkingFee", parkingFee);
        response.put("isVip", session.getIsVip() != null && session.getIsVip());
        response.put("cardCode", card != null ? card.getCardCode() : "");
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> findCarByDigits(String digits) {
        List<ParkingSession> sessions = parkingSessionRepository.findActiveSessionsByPlateEndingWith(digits);
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (ParkingSession ps : sessions) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", ps.getId());
            map.put("licensePlate", ps.getLicensePlate());
            map.put("checkInTime", ps.getCheckInTime());
            map.put("slotPhotoUrl", ps.getSlotPhotoUrl());
            map.put("isVip", ps.getIsVip());

            if (ps.getAssignedZoneId() != null) {
                zoneRepository.findById(ps.getAssignedZoneId()).ifPresent(zone -> {
                    map.put("zoneId", zone.getId());
                    map.put("zoneCode", zone.getCode());
                    map.put("zoneName", zone.getZoneName());
                });
            }
            if (ps.getParkedSlotId() != null) {
                slotRepository.findById(ps.getParkedSlotId()).ifPresent(slot -> {
                    map.put("slotId", slot.getId());
                    map.put("slotNumber", slot.getSlotNumber());
                    map.put("slotType", slot.getSlotType());
                });
            }
            result.add(map);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getMonitoringMap() {
        List<ParkingSlot> slots = slotRepository.findAll();
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (ParkingSlot slot : slots) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", slot.getId());
            map.put("zoneId", slot.getZoneId());
            map.put("slotNumber", slot.getSlotNumber());
            map.put("slotType", slot.getSlotType());
            map.put("slotStatus", slot.getSlotStatus());
            map.put("sensorMockId", slot.getSensorMockId());
            map.put("evChargerId", slot.getEvChargerId());
            map.put("lastUpdated", slot.getLastUpdated());
            zoneRepository.findById(slot.getZoneId()).ifPresent(zone -> {
                map.put("zoneCode", zone.getCode());
                map.put("zoneName", zone.getZoneName());
                map.put("allowedSizes", allowedVehicleSizeCodes(zone));
                map.put("allowedVehicleTypes", formatAllowedVehicleTypes(zone));
            });

            parkingSessionRepository
                    .findByParkedSlotIdAndSessionStatus(slot.getId(), ParkingSession.SessionStatus.ACTIVE)
                    .ifPresent(session -> {
                        map.put("sessionId", session.getId());
                        map.put("licensePlate", session.getLicensePlate());
                        map.put("checkInTime", session.getCheckInTime());
                        map.put("isVip", session.getIsVip());
                        map.put("slotPhotoUrl", session.getSlotPhotoUrl());
                        vehicleRepository.findByLicensePlate(session.getLicensePlate()).ifPresent(vehicle -> {
                            map.put("vehicleType", normalizeVehicleSize(vehicle.getVehicleSize()));
                            map.put("vehicleTypeLabel", vehicleSizeLabel(vehicle.getVehicleSize()));
                            map.put("fuelType", vehicle.getFuelType());
                        });
                    });
            result.add(map);
        }
        return result;
    }

    private Zone chooseZoneForPlate(String plate, String vehicleType) {
        String targetVehicleType = normalizeVehicleSize(DemoVehicleDataset.resolveVehicleType(plate, vehicleType));
        String preferredZoneCode = DemoVehicleDataset.resolveZoneCode(plate, targetVehicleType);

        Optional<Zone> preferred = zoneRepository.findAll().stream()
                .filter(zone -> zone.getCode() != null && zone.getCode().equalsIgnoreCase(preferredZoneCode))
                .filter(zone -> allowedVehicleSizeCodes(zone).contains(targetVehicleType))
                .findFirst();
        if (preferred.isPresent()) {
            return preferred.get();
        }

        List<Zone> candidates = new java.util.ArrayList<>();
        for (Zone zone : zoneRepository.findAll()) {
            if (allowedVehicleSizeCodes(zone).contains(targetVehicleType)) {
                candidates.add(zone);
            }
        }
        if (!candidates.isEmpty()) {
            List<Zone> available = candidates.stream()
                    .filter(zone -> zone.getTotalSlots() - zone.getCurrentOccupied() > 0)
                    .collect(java.util.stream.Collectors.toList());
            List<Zone> pool = !available.isEmpty() ? available : candidates;
            return pool.get(java.util.concurrent.ThreadLocalRandom.current().nextInt(pool.size()));
        }

        return zoneRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ApiExceptions.BadRequestException("Khong tim thay zone de cho xe vao bai"));
    }

    private void saveAiScanLog(ParkingSession session, String scanLocation, String scanType, String cameraId,
            String imageUrl, String vehicleType, Double confidenceScore, boolean evidence) {
        if (session == null || session.getLicensePlate() == null || session.getLicensePlate().isBlank()) {
            return;
        }

        String plate = DemoVehicleDataset.normalizePlate(session.getLicensePlate());
        String resolvedVehicleType = normalizeVehicleSize(DemoVehicleDataset.resolveVehicleType(plate, vehicleType));
        String resolvedImageUrl = DemoVehicleDataset.resolveImageUrl(plate, scanType, imageUrl);
        Optional<DemoVehicleDataset.Profile> profileOpt = DemoVehicleDataset.findByPlate(plate);

        AiScanLog log = new AiScanLog();
        log.setId(UUID.randomUUID());
        log.setSessionId(session.getId());
        log.setScanLocation(scanLocation != null && !scanLocation.isBlank() ? scanLocation : "GATE");
        log.setScanType(scanType != null && !scanType.isBlank() ? scanType : "LPR_SCAN");
        log.setCameraId(cameraId != null && !cameraId.isBlank() ? cameraId : "CAM-DEMO");
        log.setImageUrl(resolvedImageUrl);
        log.setDetectedPlate(plate);
        log.setConfidenceScore(BigDecimal.valueOf(confidenceScore != null ? confidenceScore : 99.0));
        log.setDetectedVehicleType(resolvedVehicleType);
        profileOpt.ifPresent(profile -> {
            log.setDetectedColor(profile.color());
            log.setDetectedColorRgb(profile.colorRgb());
            log.setDetectedShape(profile.bodyShape());
        });
        log.setMatchScore(BigDecimal.valueOf(98.5));
        log.setShapeMatch(true);
        log.setQrMatch(false);
        log.setEvidence(evidence);
        log.setScannedAt(Instant.now());
        aiScanLogRepository.save(log);
    }

    private List<String> allowedVehicleSizeCodes(Zone zone) {
        if (zone == null || zone.getCode() == null) {
            return java.util.List.of("SEDAN_HATCHBACK");
        }
        String code = zone.getCode().trim().toUpperCase();
        return switch (code) {
            case "F1" -> java.util.List.of("SEDAN_HATCHBACK");
            case "F2" -> java.util.List.of("SUV_CUV_MPV");
            case "B1" -> java.util.List.of("VAN_TRUCK");
            case "G" -> java.util.List.of("MINIBUS_16");
            default -> parseAllowedSizeCodes(zone.getAllowedSizes());
        };
    }

    private List<String> parseAllowedSizeCodes(String allowedSizes) {
        if (allowedSizes == null || allowedSizes.isBlank()) {
            return new java.util.ArrayList<>();
        }
        String sanitized = allowedSizes
                .replace("[", "")
                .replace("]", "")
                .replace("\"", "")
                .replace("'", "");
        return java.util.Arrays.stream(sanitized.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(this::normalizeVehicleSize)
                .filter(size -> !"EV_CAR".equals(size))
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    private List<String> formatAllowedVehicleTypes(Zone zone) {
        return allowedVehicleSizeCodes(zone).stream()
                .map(this::vehicleSizeLabel)
                .collect(java.util.stream.Collectors.toList());
    }

    private String normalizeVehicleSize(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase();
        if (normalized.contains("SUV") || normalized.contains("CUV") || normalized.contains("MPV")
                || normalized.contains("7") || normalized.contains("9")) {
            return "SUV_CUV_MPV";
        }
        if (normalized.contains("12") || normalized.contains("16") || normalized.contains("MINIBUS") || normalized.contains("BUS")) {
            return "MINIBUS_16";
        }
        if (normalized.contains("VAN") || normalized.contains("TRUCK") || normalized.contains("TẢI") || normalized.contains("TAI") || normalized.contains("LARGE")) {
            return "VAN_TRUCK";
        }
        if (normalized.contains("EV")) {
            return "SEDAN_HATCHBACK";
        }
        return "SEDAN_HATCHBACK";
    }

    private String vehicleSizeLabel(String value) {
        return switch (normalizeVehicleSize(value)) {
            case "SUV_CUV_MPV" -> "Xe 7-9 chỗ";
            case "VAN_TRUCK" -> "Xe van / Xe tải nhỏ";
            case "MINIBUS_16" -> "Xe khách 12-16 chỗ";
            default -> "Xe 4-5 chỗ";
        };
    }

    private boolean isVehicleAllowedInZone(String vehicleSize, Zone zone) {
        return allowedVehicleSizeCodes(zone).contains(normalizeVehicleSize(vehicleSize));
    }

    private boolean isEvSlot(ParkingSlot slot) {
        String slotType = slot.getSlotType() != null ? slot.getSlotType().trim().toUpperCase() : "";
        return "EV".equals(slotType) || (slot.getEvChargerId() != null && !slot.getEvChargerId().isBlank());
    }

    private boolean isGasolineVehicle(Vehicle vehicle) {
        String fuelType = vehicle != null && vehicle.getFuelType() != null
                ? vehicle.getFuelType().trim().toUpperCase()
                : "GASOLINE";
        return !"ELECTRIC".equals(fuelType);
    }

    private java.util.Map<String, Object> createSensorViolationIfAbsent(
            ParkingSession session,
            Vehicle vehicle,
            ParkingSlot slot,
            String violationType,
            String notes,
            String imageUrl) {
        if (session == null || vehicle == null || slot == null) {
            return null;
        }
        if (parkingViolationRepository.existsBySessionIdAndViolationType(session.getId(), violationType)) {
            return null;
        }

        UUID detectedBy = session.getOverrideByStaff();
        if (detectedBy == null) {
            detectedBy = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == User.Role.STAFF
                            || user.getRole() == User.Role.MANAGER
                            || user.getRole() == User.Role.ADMIN)
                    .map(User::getId)
                    .findFirst()
                    .orElse(null);
        }
        if (detectedBy == null) {
            return null;
        }

        long historyViolations = parkingViolationRepository.countByVehicleId(vehicle.getId());
        boolean firstViolation = historyViolations == 0;

        ParkingViolation violation = new ParkingViolation();
        violation.setSessionId(session.getId());
        violation.setSlotId(slot.getId());
        violation.setViolationType(violationType);
        violation.setDetectedBy(detectedBy);
        violation.setDetectedAt(Instant.now());
        violation.setFirstViolation(firstViolation);
        violation.setPenaltyApplied(false);
        violation.setPenaltyAmount(BigDecimal.ZERO);
        violation.setStatus("PENDING");
        violation.setNotes(notes);
        violation.setPhotoUrls(imageUrl != null && !imageUrl.isBlank()
                ? "[\"" + imageUrl.replace("\"", "") + "\"]"
                : "[]");
        ParkingViolation saved = parkingViolationRepository.save(violation);

        vehicle.setViolationCount(firstViolation ? 1 : vehicle.getViolationCount() + 1);
        vehicleRepository.save(vehicle);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", saved.getId());
        result.put("type", saved.getViolationType());
        result.put("firstViolation", saved.isFirstViolation());
        result.put("penaltyAmount", saved.getPenaltyAmount());
        result.put("notes", saved.getNotes());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getZoneOverview() {
        List<Zone> zones = zoneRepository.findAll();
        List<ParkingSlot> slots = slotRepository.findAll();
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();

        for (Zone zone : zones) {
            long totalSensorSlots = slots.stream()
                    .filter(slot -> zone.getId().equals(slot.getZoneId()))
                    .count();
            long occupiedSensorSlots = slots.stream()
                    .filter(slot -> zone.getId().equals(slot.getZoneId()))
                    .filter(slot -> "OCCUPIED".equalsIgnoreCase(slot.getSlotStatus()))
                    .count();
            long availableSensorSlots = slots.stream()
                    .filter(slot -> zone.getId().equals(slot.getZoneId()))
                    .filter(slot -> !"OCCUPIED".equalsIgnoreCase(slot.getSlotStatus()))
                    .count();
            long onlineSensors = slots.stream()
                    .filter(slot -> zone.getId().equals(slot.getZoneId()))
                    .filter(slot -> slot.getSensorMockId() != null && !slot.getSensorMockId().isBlank())
                    .count();

            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("zoneId", zone.getId());
            map.put("zoneCode", zone.getCode());
            map.put("zoneName", zone.getZoneName());
            map.put("allowedSizes", allowedVehicleSizeCodes(zone));
            map.put("allowedVehicleTypes", formatAllowedVehicleTypes(zone));
            map.put("totalSlots", zone.getTotalSlots());
            map.put("currentOccupied", zone.getCurrentOccupied());
            map.put("availableSlots", Math.max(0, zone.getTotalSlots() - zone.getCurrentOccupied()));
            map.put("sensorTotal", totalSensorSlots);
            map.put("sensorOccupied", occupiedSensorSlots);
            map.put("sensorAvailable", availableSensorSlots);
            map.put("sensorOnline", onlineSensors);
            map.put("sensorStatus", totalSensorSlots == 0 ? "NO_SENSOR"
                    : (onlineSensors == totalSensorSlots ? "ONLINE" : "PARTIAL"));
            result.add(map);
        }

        return result;
    }

    @Override
    @Transactional
    public java.util.Map<String, Object> recordSlotOccupancy(SlotOccupancyRequest request) {
        if (request.getSlotId() == null) {
            throw new ApiExceptions.BadRequestException("Yeu cau slotId de cap nhat cam bien o do");
        }

        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay o do"));
        Zone slotZone = zoneRepository.findById(slot.getZoneId())
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay tang cua o do"));

        boolean occupied = request.getOccupied() == null || request.getOccupied();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("slotId", slot.getId());
        response.put("slotNumber", slot.getSlotNumber());
        response.put("zoneId", slot.getZoneId());

        if (!occupied) {
            parkingSessionRepository
                    .findByParkedSlotIdAndSessionStatus(slot.getId(), ParkingSession.SessionStatus.ACTIVE)
                    .ifPresent(session -> {
                        session.setParkedSlotId(null);
                        session.setSlotPhotoUrl(null);
                        parkingSessionRepository.save(session);
                    });
            slot.setSlotStatus("AVAILABLE");
            slot.setLastUpdated(Instant.now());
            slotRepository.save(slot);
            response.put("slotStatus", slot.getSlotStatus());
            response.put("message", "SENSOR_SLOT_RELEASED");
            return response;
        }

        String plate = request.getLicensePlate() != null ? request.getLicensePlate().trim() : "";
        if (plate.isBlank()) {
            throw new ApiExceptions.BadRequestException("Yeu cau bien so khi sensor bao o do co xe");
        }

        ParkingSession session = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay session ACTIVE cua bien so nay"));
        Vehicle vehicle = vehicleRepository.findByLicensePlate(session.getLicensePlate())
                .orElse(null);

        if (vehicle != null) {
            if (!"ELECTRIC".equalsIgnoreCase(vehicle.getFuelType()) && slotZone.isHasEvCharger()) {
                throw new ApiExceptions.BadRequestException("Khu vực này có trạm sạc chỉ dành riêng cho xe điện (EV). Xe xăng/dầu vui lòng đỗ ở khu vực khác!");
            }

            java.util.List<String> allowedSizes = allowedVehicleSizeCodes(slotZone);
            if (!allowedSizes.contains(vehicle.getVehicleSize())) {
                String vehicleSizeName = "SEDAN_HATCHBACK".equals(vehicle.getVehicleSize()) ? "4-5 chỗ" : 
                                        "SUV_CUV_MPV".equals(vehicle.getVehicleSize()) ? "7-9 chỗ" : 
                                        "MINIBUS_16".equals(vehicle.getVehicleSize()) ? "16 chỗ" : "tải/van";
                
                String zoneSizeName = allowedSizes.contains("SEDAN_HATCHBACK") ? "4-5 chỗ" : 
                                      allowedSizes.contains("SUV_CUV_MPV") ? "7-9 chỗ" : 
                                      allowedSizes.contains("MINIBUS_16") ? "16 chỗ" : "tải/van";
                
                throw new ApiExceptions.BadRequestException("Sai luồng đỗ xe: Xe " + vehicleSizeName + " không được đỗ tại khu vực dành cho xe " + zoneSizeName + "!");
            }
        }

        parkingSessionRepository
                .findByParkedSlotIdAndSessionStatus(slot.getId(), ParkingSession.SessionStatus.ACTIVE)
                .ifPresent(existingAtSlot -> {
                    if (!existingAtSlot.getId().equals(session.getId())) {
                        throw new ApiExceptions.ConflictException("O do nay dang duoc gan cho xe khac");
                    }
                });

        if (session.getParkedSlotId() != null && !session.getParkedSlotId().equals(slot.getId())) {
            slotRepository.findById(session.getParkedSlotId()).ifPresent(previousSlot -> {
                previousSlot.setSlotStatus("AVAILABLE");
                previousSlot.setLastUpdated(Instant.now());
                slotRepository.save(previousSlot);
            });
        }

        slot.setSlotStatus("OCCUPIED");
        slot.setLastUpdated(Instant.now());
        slotRepository.save(slot);

        session.setParkedSlotId(slot.getId());
        session.setSlotPhotoUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank()
                ? request.getImageUrl()
                : "https://mock-sensor-camera.com/slots/" + slot.getId() + ".jpg");
        parkingSessionRepository.save(session);

        boolean zoneMismatch = session.getAssignedZoneId() != null && !session.getAssignedZoneId().equals(slot.getZoneId());
        String effectiveVehicleType = vehicle != null && vehicle.getVehicleSize() != null
                ? vehicle.getVehicleSize()
                : (request.getVehicleType() != null && !request.getVehicleType().isBlank() ? request.getVehicleType() : null);
        boolean vehicleTypeMismatch = !isVehicleAllowedInZone(effectiveVehicleType, slotZone);
        boolean evMisuse = isEvSlot(slot) && isGasolineVehicle(vehicle);
        java.util.List<java.util.Map<String, Object>> createdViolations = new java.util.ArrayList<>();

        if (zoneMismatch || vehicleTypeMismatch) {
            java.util.Map<String, Object> violation = createSensorViolationIfAbsent(
                    session,
                    vehicle,
                    slot,
                    "DOUBLE_PARKING",
                    "Sensor phát hiện xe đỗ sai tầng/khu vực. Biển số " + session.getLicensePlate()
                            + ", loại xe " + vehicleSizeLabel(effectiveVehicleType)
                            + ", khu vực hiện tại " + slotZone.getCode(),
                    request.getImageUrl());
            if (violation != null) {
                createdViolations.add(violation);
            }
        }

        if (evMisuse) {
            java.util.Map<String, Object> violation = createSensorViolationIfAbsent(
                    session,
                    vehicle,
                    slot,
                    "EV_ZONE_MISUSE",
                    "Sensor phát hiện xe xăng/dầu đỗ vào ô sạc điện " + slot.getSlotNumber(),
                    request.getImageUrl());
            if (violation != null) {
                createdViolations.add(violation);
            }
        }

        response.put("sessionId", session.getId());
        response.put("licensePlate", session.getLicensePlate());
        response.put("slotStatus", slot.getSlotStatus());
        response.put("zoneCode", slotZone.getCode());
        response.put("allowedVehicleTypes", formatAllowedVehicleTypes(slotZone));
        response.put("vehicleType", normalizeVehicleSize(effectiveVehicleType));
        response.put("vehicleTypeLabel", vehicleSizeLabel(effectiveVehicleType));
        response.put("fuelType", vehicle != null ? vehicle.getFuelType() : null);
        response.put("zoneMismatch", zoneMismatch || vehicleTypeMismatch);
        response.put("evMisuse", evMisuse);
        response.put("violationCreated", !createdViolations.isEmpty());
        response.put("violations", createdViolations);
        response.put("message", !createdViolations.isEmpty() ? "SENSOR_SLOT_RECORDED_WITH_VIOLATION" : "SENSOR_SLOT_RECORDED");
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getVehicleStatus(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin xe"));

        Optional<ParkingSession> sessionOpt = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(vehicle.getLicensePlate(), ParkingSession.SessionStatus.ACTIVE);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("vehicleId", vehicle.getId());
        response.put("licensePlate", vehicle.getLicensePlate());
        response.put("fuelType", vehicle.getFuelType());
        response.put("vehicleSize", vehicle.getVehicleSize());

        if (sessionOpt.isPresent()) {
            ParkingSession session = sessionOpt.get();
            response.put("isParked", true);
            response.put("sessionId", session.getId());
            response.put("checkInTime", session.getCheckInTime());
            response.put("isLocked", session.getIsLocked() != null && session.getIsLocked());
            response.put("slotPhotoUrl", session.getSlotPhotoUrl());

            if (session.getAssignedZoneId() != null) {
                zoneRepository.findById(session.getAssignedZoneId()).ifPresent(zone -> {
                    response.put("zoneCode", zone.getCode());
                    response.put("zoneName", zone.getZoneName());
                });
            }
            if (session.getParkedSlotId() != null) {
                slotRepository.findById(session.getParkedSlotId()).ifPresent(slot -> {
                    response.put("slotNumber", slot.getSlotNumber());
                    response.put("slotType", slot.getSlotType());
                });
            }
        } else {
            response.put("isParked", false);
            response.put("isLocked", false);
        }

        return response;
    }

    @Override
    @Transactional
    public void approveVipSubscription(UUID id, String status, String rejectionReason, UUID managerId) {
        VipSubscription subscription = vipSubscriptionRepository.findById(id)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy hồ sơ VIP"));

        String oldStatusStr = subscription.getStatus() != null ? subscription.getStatus().name() : "null";

        VipSubscription.Status newStatus = VipSubscription.Status.valueOf(status.toUpperCase());
        subscription.setStatus(newStatus);
        subscription.setApprovedBy(managerId);
        subscription.setApprovedAt(Instant.now());
        if (newStatus == VipSubscription.Status.REJECTED) {
            subscription.setRejectionReason(rejectionReason);
        } else {
            subscription.setRejectionReason(null);

            // Cập nhật ngày gia hạn bắt đầu và kết thúc dựa trên thời gian thực lúc duyệt, có cộng dồn/xếp chồng
            java.time.LocalDate startDate = java.time.LocalDate.now();
            List<VipSubscription> existingSubs = vipSubscriptionRepository.findByVehicleId(subscription.getVehicleId());
            for (VipSubscription sub : existingSubs) {
                // Chỉ so sánh với các gói ACTIVE khác hoặc PENDING_APPROVAL khác không trùng với gói hiện tại đang duyệt
                if (!sub.getId().equals(subscription.getId()) &&
                    (sub.getStatus() == VipSubscription.Status.ACTIVE || sub.getStatus() == VipSubscription.Status.PENDING_APPROVAL)) {
                    if (sub.getEndDate() != null && sub.getEndDate().isAfter(startDate)) {
                        startDate = sub.getEndDate();
                    }
                }
            }
            subscription.setStartDate(startDate);
            String type = subscription.getSubscriptionType() != null ? subscription.getSubscriptionType().toUpperCase()
                    : "MONTHLY";
            if ("DAILY".equals(type) || "DAY".equals(type)) {
                subscription.setEndDate(startDate.plusDays(1));
            } else if ("MONTHLY".equals(type)) {
                subscription.setEndDate(startDate.plusDays(30));
            } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                subscription.setEndDate(startDate.plusDays(90));
            } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                subscription.setEndDate(startDate.plusDays(180));
            } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                subscription.setEndDate(startDate.plusDays(365));
            } else {
                subscription.setEndDate(startDate.plusDays(30));
            }
        }

        vipSubscriptionRepository.save(subscription);

        if (newStatus == VipSubscription.Status.ACTIVE) {
            vehicleRepository.findById(subscription.getVehicleId()).ifPresent(vehicle -> {
                vehicle.setActive(true);
                vehicleRepository.save(vehicle);
            });
        }

        // Ghi nhận vào audit log
        AuditLog audit = new AuditLog();
        audit.setId(UUID.randomUUID());
        audit.setUserId(managerId);
        audit.setActionType(newStatus == VipSubscription.Status.ACTIVE ? "APPROVE_VIP" : "REJECT_VIP");
        audit.setEntityType("VipSubscription");
        audit.setEntityId(subscription.getId());
        audit.setOldValue("{\"status\":\"" + oldStatusStr + "\"}");
        audit.setNewValue("{\"status\":\"" + newStatus.name() + "\",\"rejectionReason\":"
                + (rejectionReason == null ? "null" : "\"" + rejectionReason + "\"") + "}");
        audit.setCreatedAt(Instant.now());

        auditLogRepository.save(audit);
    }

    @Override
    @Transactional
    public Transaction checkoutCardByCode(String cardCode) {
        if (cardCode == null || cardCode.trim().isEmpty()) {
            throw new ApiExceptions.BadRequestException("Mã thẻ hoặc biển số không được trống");
        }
        String cleanCode = cardCode.trim();
        Optional<Card> cardOpt = cardRepository.findByCardCode(cleanCode);
        if (cardOpt.isPresent()) {
            return this.checkoutCard(cardOpt.get().getId());
        }

        Optional<ParkingSession> sessionOpt = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(cleanCode, ParkingSession.SessionStatus.ACTIVE);
        if (sessionOpt.isPresent()) {
            ParkingSession session = sessionOpt.get();
            if (session.getCardId() != null) {
                return this.checkoutCard(session.getCardId());
            }
        }

        throw new ApiExceptions.NotFoundException("Không tìm thấy thẻ hoặc phiên xe đang hoạt động cho: " + cleanCode);
    }

    @Override
    @Transactional(readOnly = true)
    public FloorEntryVerificationResponse verifyFloorEntry(FloorEntryVerificationRequest request) {
        if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
            String licensePlate = request.getLicensePlate().trim();
            Vehicle vehicle = vehicleRepository.findByLicensePlate(licensePlate)
                    .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin xe"));

            vipSubscriptionRepository.findByVehicleIdAndStatus(vehicle.getId(), VipSubscription.Status.ACTIVE)
                    .orElseThrow(
                            () -> new ApiExceptions.BadRequestException("Xe này không đăng ký thẻ VIP hoạt động!"));

            ParkingSession session = parkingSessionRepository
                    .findByLicensePlateAndSessionStatus(licensePlate, ParkingSession.SessionStatus.ACTIVE)
                    .orElseThrow(() -> new ApiExceptions.NotFoundException(
                            "Không tìm thấy phiên gửi xe hoạt động cho xe VIP này"));

            Zone zone = zoneRepository.findById(session.getAssignedZoneId())
                    .orElseThrow(
                            () -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin tầng đỗ đã chỉ định"));

            boolean isMatch = zone.getCode().equalsIgnoreCase(request.getCurrentFloorCode());
            if (isMatch) {
                return new FloorEntryVerificationResponse(true,
                        "Xác nhận đúng tầng! Mở barie vào " + zone.getZoneName(), zone.getCode());
            } else {
                return new FloorEntryVerificationResponse(false, "Sai tầng đỗ! Xe VIP được chỉ định đỗ tại "
                        + zone.getZoneName() + ", không được vào tầng " + request.getCurrentFloorCode(),
                        zone.getCode());
            }
        } else if (request.getCardCode() != null && !request.getCardCode().trim().isEmpty()) {
            String cardCode = request.getCardCode().trim();
            Card card = cardRepository.findByCardCode(cardCode)
                    .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thẻ tạm này"));

            ParkingSession session = parkingSessionRepository
                    .findByCardIdAndSessionStatus(card.getId(), ParkingSession.SessionStatus.ACTIVE)
                    .orElseThrow(() -> new ApiExceptions.NotFoundException(
                            "Không tìm thấy phiên gửi xe hoạt động cho thẻ này"));

            Zone zone = zoneRepository.findById(session.getAssignedZoneId())
                    .orElseThrow(
                            () -> new ApiExceptions.NotFoundException("Không tìm thấy thông tin tầng đỗ đã chỉ định"));

            boolean isMatch = zone.getCode().equalsIgnoreCase(request.getCurrentFloorCode());
            if (isMatch) {
                return new FloorEntryVerificationResponse(true,
                        "Xác nhận đúng tầng! Mở barie vào " + zone.getZoneName(), zone.getCode());
            } else {
                return new FloorEntryVerificationResponse(false, "Sai tầng đỗ! Xe vãng lai được chỉ định đỗ tại "
                        + zone.getZoneName() + ", không được vào tầng " + request.getCurrentFloorCode(),
                        zone.getCode());
            }
        } else {
            throw new ApiExceptions.BadRequestException(
                    "Yêu cầu cung cấp biển số xe VIP hoặc mã thẻ vãng lai để xác thực");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FloorEntryVerificationResponse verifyFloorExit(
            FloorEntryVerificationRequest request) {

        boolean hasPlate = request.getLicensePlate() != null
                && !request.getLicensePlate().trim().isEmpty();

        boolean hasCard = request.getCardCode() != null
                && !request.getCardCode().trim().isEmpty();

        if (!hasPlate && !hasCard) {
            throw new ApiExceptions.BadRequestException(
                    "Phải cung cấp licensePlate hoặc cardCode");
        }

        if (hasPlate && hasCard) {
            throw new ApiExceptions.BadRequestException(
                    "Chỉ được truyền licensePlate hoặc cardCode");
        }

        ParkingSession session;

        // ================= VIP =================

        if (hasPlate) {

            Vehicle vehicle = vehicleRepository
                    .findByLicensePlate(request.getLicensePlate().trim())
                    .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy xe"));

            vipSubscriptionRepository
                    .findByVehicleIdAndStatus(
                            vehicle.getId(),
                            VipSubscription.Status.ACTIVE)
                    .orElseThrow(() -> new ApiExceptions.BadRequestException(
                            "Xe không có gói VIP hoạt động"));

            session = parkingSessionRepository
                    .findByLicensePlateAndSessionStatus(
                            vehicle.getLicensePlate(),
                            ParkingSession.SessionStatus.ACTIVE)
                    .orElseThrow(() -> new ApiExceptions.NotFoundException(
                            "Không có phiên gửi xe ACTIVE"));

        }

        // ================= Visitor =================

        else {

            Card card = cardRepository
                    .findByCardCode(request.getCardCode().trim())
                    .orElseThrow(() -> new ApiExceptions.NotFoundException(
                            "Không tìm thấy thẻ"));

            session = parkingSessionRepository
                    .findByCardIdAndSessionStatus(
                            card.getId(),
                            ParkingSession.SessionStatus.ACTIVE)
                    .orElseThrow(() -> new ApiExceptions.NotFoundException(
                            "Không có phiên gửi xe ACTIVE"));
        }

        if (Boolean.TRUE.equals(session.getIsLocked())) {
            SecurityAlert alert = new SecurityAlert();
            alert.setAlertType("NGHI NGỜ TRỘM CẮP");
            alert.setLicensePlate(session.getLicensePlate() != null ? session.getLicensePlate() : "N/A");
            alert.setReason("Phát hiện cố tình xuất bãi khi xe đang bật Khóa chống trộm.");
            alert.setIsActionable(true);
            securityAlertRepository.save(alert);


            throw new ApiExceptions.ForbiddenException(
                    "Xe đang bị khóa chống trộm.");
        }

        return new FloorEntryVerificationResponse(
                true,
                "Xác nhận rời tầng thành công. Mở barrier.",
                null);
    }
    private BigDecimal calculateParkingFeeSafe(String vehicleSize, Instant checkIn, Instant checkOut) {
        try {
            return transactionRepository.calculateParkingFee(vehicleSize, checkIn, checkOut);
        } catch (org.springframework.dao.DataAccessException e) {
            throw new ApiExceptions.BadRequestException("Không tìm thấy bảng giá hệ thống phù hợp đang kích hoạt cho loại xe: " + vehicleSize);
        }
    }
    private void sendAntiTheftPush(ParkingSession session) {
        String plate = session.getLicensePlate();
        String fcmToken = null;

        if (plate != null && !plate.trim().isEmpty()) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
            if (vehicleOpt.isPresent()) {
                UUID ownerId = vehicleOpt.get().getOwnerId();
                if (ownerId != null) {
                    Optional<User> ownerOpt = userRepository.findById(ownerId);
                    if (ownerOpt.isPresent()) {
                        fcmToken = ownerOpt.get().getFcmToken();
                    }
                }
            }
        }

        fcmService.sendPushNotification(
                fcmToken != null ? fcmToken : "",
                "[CẢNH BÁO CHỐNG TRỘM]",
                "Phát hiện xe " + (plate != null ? plate : "N/A")
                        + " cố tình di chuyển ra khỏi bãi xe khi đang ở trạng thái KHÓA AN TOÀN!");
    }
}
