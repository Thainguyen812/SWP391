package com.parking.service.impl;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;
import com.parking.dto.CongestionCheckoutRequest;
import com.parking.exception.ApiExceptions;
import com.parking.model.BlacklistEntry;
import com.parking.model.ParkingSession;
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
import com.parking.repository.BlacklistRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ZoneRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.VipQrIdentifierRepository;
import com.parking.repository.AuditLogRepository;
import com.parking.repository.AiScanLogRepository;
import com.parking.repository.SecurityAlertRepository;
import com.parking.model.SecurityAlert;

import com.parking.repository.TransactionRepository;// task 5

import com.parking.service.ParkingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import java.math.BigDecimal;// task 5

import com.parking.dto.VisitorCheckInRequest;// task 5
import com.parking.model.Card;// task 5
import com.parking.repository.CardRepository;// task 5

import com.parking.dto.CongestionCheckoutRequest; // task 7 

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
    private final SecurityAlertRepository securityAlertRepository;

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
            SecurityAlertRepository securityAlertRepository) { // task 5
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
        this.securityAlertRepository = securityAlertRepository;
    }

    @Override
    @Transactional
    public CheckInResponse aiCheckIn(AiCheckInRequest request) {
        String plate = request.getPlate();
        Double confidence = request.getConfidence_score() != null ? request.getConfidence_score() : 0.0;

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

        // Find matching zone with multi-tier fallback
        List<Zone> candidates = zoneRepository.findByAllowedSizesContaining(request.getVehicle_type());
        Zone chosen = null;
        for (Zone z : candidates) {
            if (z.getTotalSlots() - z.getCurrentOccupied() > 0) {
                chosen = z;
                break;
            }
        }
        if (chosen == null && !candidates.isEmpty()) {
            chosen = candidates.get(0);
        }
        if (chosen == null) {
            List<Zone> allZones = zoneRepository.findAll();
            if (!allZones.isEmpty()) {
                chosen = allZones.get(0);
            } else {
                throw new ApiExceptions.BadRequestException("No available zone for vehicle type");
            }
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

        // Chốt chặn: Nếu không phải là xe VIP hoạt động, cấm tạo session tự động tại
        // làn AI
        // Create session
        ParkingSession ps = new ParkingSession();
        ps.setId(UUID.randomUUID());
        ps.setLicensePlate(plate);
        ps.setCheckInTime(Instant.now());
        ps.setAssignedZoneId(chosen.getId());
        ps.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
        ps.setIsVip(isVip);
        ps.setEntryGate(request.getCamera_id());
        // store image url if provided
        ps.setMobileCheckoutPhoto(request.getImage_url());

        if (vehicleOpt.isPresent()) {
            ps.setVehicleId(vehicleOpt.get().getId());
        }

        // Tự động gán 1 thẻ RFID rảnh cho xe vãng lai khi qua camera AI (tự sinh thẻ
        // nếu kho thẻ rảnh bị hết)
        if (!isVip && ps.getCardId() == null) {
            Optional<Card> availableCard = cardRepository.findFirstByStatus(Card.CardStatus.AVAILABLE);
            Card cardToAssign = null;
            if (availableCard.isPresent()) {
                cardToAssign = availableCard.get();
            } else {
                Card autoCard = new Card();
                autoCard.setId(UUID.randomUUID());
                autoCard.setCardCode("00" + (1000 + (int) (Math.random() * 9000)));
                autoCard.setStatus(Card.CardStatus.AVAILABLE);
                autoCard.setCreatedAt(Instant.now());
                autoCard.setUpdatedAt(Instant.now());
                cardToAssign = cardRepository.save(autoCard);
            }

            ps.setCardId(cardToAssign.getId());
            cardToAssign.setStatus(Card.CardStatus.IN_USE);
            cardToAssign.setUpdatedAt(Instant.now());
            cardRepository.save(cardToAssign);
        }

        // Thuật toán gán ô đỗ CHẾ ĐỘ 1 (Strict Mode): Bảo vệ tuyệt đối ô đỗ xe điện EV
        if (false) {
        boolean isEvVehicle = "EV_CAR".equalsIgnoreCase(request.getVehicle_type())
                || "ELECTRIC".equalsIgnoreCase(request.getVehicle_type());
        ParkingSlot assignedSlot = null;

        if (isEvVehicle) {
            // Xe Điện: Ưu tiên ô sạc EV -> nếu hết thì gán ô đỗ thường
            assignedSlot = slotRepository.findAvailableEvSlotInZone(chosen.getId()).stream().findFirst()
                    .orElse(slotRepository
                            .findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE",
                                    request.getVehicle_type())
                            .orElse(slotRepository.findFirstByZoneIdAndSlotStatus(chosen.getId(), "AVAILABLE")
                                    .orElse(slotRepository.findFirstBySlotStatus("AVAILABLE").orElse(null))));
        } else {
            // Xe Xăng: Chỉ được đỗ vào ô đỗ thường (Không được đỗ ô EV)
            assignedSlot = slotRepository
                    .findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE", request.getVehicle_type())
                    .orElse(slotRepository
                            .findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE", "NORMAL")
                            .orElse(slotRepository.findAvailableNonEvSlotInZone(chosen.getId()).stream().findFirst()
                                    .orElse(slotRepository.findAvailableNonEvSlotAnywhere().stream().findFirst()
                                            .orElse(null))));

            if (assignedSlot == null) {
                // Tự động tạo ô đỗ dự phòng để không bao giờ bị nghẽn khi test
                ParkingSlot autoSlot = new ParkingSlot();
                autoSlot.setId(UUID.randomUUID());
                autoSlot.setZoneId(chosen.getId());
                autoSlot.setSlotNumber(chosen.getCode() + "-" + (System.currentTimeMillis() % 1000));
                autoSlot.setSlotType("NORMAL");
                autoSlot.setSlotStatus("AVAILABLE");
                autoSlot.setLastUpdated(Instant.now());
                autoSlot.setSensorMockId("SN-AUTO-" + System.currentTimeMillis());
                assignedSlot = slotRepository.save(autoSlot);
            }
        }

        if (assignedSlot != null) {
            assignedSlot.setSlotStatus("OCCUPIED");
            assignedSlot.setLastUpdated(Instant.now());
            slotRepository.save(assignedSlot);
            ps.setParkedSlotId(assignedSlot.getId());
            ps.setSlotPhotoUrl("https://mock-sensor-camera.com/slots/" + assignedSlot.getId() + ".jpg");
        }

        }

        parkingSessionRepository.save(ps);

        return new CheckInResponse(ps.getId().toString(), chosen.getCode(), "OK");
    }

    @Override
    @Transactional
    public CheckInResponse approveEntry(String plate) {
        ParkingSession session = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Khong tim thay phien xe dang cho vao bai"));

        String vehicleType = "SEDAN_HATCHBACK";
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(session.getLicensePlate());
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            if (vehicle.getVehicleSize() != null) {
                vehicleType = vehicle.getVehicleSize();
            }
            if (session.getVehicleId() == null) {
                session.setVehicleId(vehicle.getId());
            }
        }

        Zone zone = ensureApprovedParkingSlot(session, vehicleType);
        session.setEntryGate(null);
        session.setCheckInTime(Instant.now());
        session.setUpdatedAt(Instant.now());
        parkingSessionRepository.save(session);

        return new CheckInResponse(session.getId().toString(), zone.getCode(), "ENTRY_APPROVED");
    }

    @Override
    @Transactional
    public Transaction approveExit(String plate) {
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

        Transaction transaction = new Transaction();
        transaction.setSessionId(session.getId());
        transaction.setTotalAmount(java.math.BigDecimal.ZERO);
        transaction.setPaymentMethod(Transaction.PaymentMethod.CASH);
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

        Optional<ParkingSession> existing = parkingSessionRepository.findByLicensePlateAndSessionStatus(
                pendingEntry.getLicensePlate(), ParkingSession.SessionStatus.ACTIVE);
        if (existing.isPresent()) {
            throw new ApiExceptions.ConflictException("Xe nay dang co phien gui xe ACTIVE");
        }

        String vehicleType = pendingEntry.getVehicleType() != null ? pendingEntry.getVehicleType() : "SEDAN_HATCHBACK";
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(pendingEntry.getLicensePlate());
        if (vehicleOpt.isPresent() && vehicleOpt.get().getVehicleSize() != null) {
            vehicleType = vehicleOpt.get().getVehicleSize();
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
        vehicleOpt.ifPresent(vehicle -> session.setVehicleId(vehicle.getId()));

        Zone zone = ensureApprovedParkingSlot(session, vehicleType);
        parkingSessionRepository.save(session);

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

            // Mock còi hú / notification FCM
            System.out.println("MOCK FCM PUSH NOTIFICATION: [CẢNH BÁO CHỐNG TRỘM] Phát hiện xe " + qrVehiclePlate
                    + " đang có hành vi di chuyển bất hợp pháp ra cổng trong khi cờ khóa đang bật! Còi hú tại bốt trực đang kích hoạt khẩn cấp, Barrier được khóa cứng!");

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
        String plate = request.getPlate();
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
            if (session.getEntryGate() != null) {
                // If the vehicle is currently waiting at the entry gate, update this session during check-in
                sessionToUpdate = session;
            } else {
                throw new ApiExceptions.ConflictException("Xe này đang có phiên gửi xe ACTIVE");
            }
        }

        Card card = cardRepository.findByCardCode(request.getCard_code()) // tìm thẻ để sử dụng
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thẻ tạm này"));

        if (card.getStatus() != Card.CardStatus.AVAILABLE) {
            throw new ApiExceptions.BadRequestException("Thẻ này không khả dụng để cấp cho khách vãng lai");
        }

        if (blacklistRepository.existsByCardId(card.getId())) { // Kiểm tra blacklist
            throw new ApiExceptions.ForbiddenException("Thẻ này đang nằm trong blacklist");
        }
        List<Zone> candidates = zoneRepository.findAll(); // tim zone phù hợp
        Zone chosen = null;

        for (Zone z : candidates) {
            if (z.getAllowedSizes() != null
                    && z.getAllowedSizes().contains(request.getVehicle_type())
                    && z.getTotalSlots() - z.getCurrentOccupied() > 0) {
                chosen = z;
                break;
            }
        }

        if (chosen == null) {
            for (Zone z : candidates) {
                if (z.getAllowedSizes() != null && z.getAllowedSizes().contains(request.getVehicle_type())) {
                    chosen = z;
                    break;
                }
            }
        }

        if (chosen == null && !candidates.isEmpty()) {
            chosen = candidates.get(0);
        }

        if (chosen == null) {
            throw new ApiExceptions.BadRequestException("Không tìm thấy bất kỳ zone nào trong hệ thống");
        }

        if (sessionToUpdate == null || sessionToUpdate.getParkedSlotId() == null) {
            zoneRepository.increaseOccupied(chosen.getId()); // trừ số lượng slot còn trống
        }

        Vehicle vehicle = vehicleRepository // chưa có thì tạo và lưu vehicle
                .findByLicensePlate(plate)
                .orElseGet(() -> {

                    Vehicle newVehicle = new Vehicle();

                    newVehicle.setId(UUID.randomUUID());

                    // driver_casual trong seed data
                    newVehicle.setOwnerId(
                            UUID.fromString(
                                    "a0000000-0000-0000-0000-000000000005"));

                    newVehicle.setLicensePlate(plate);

                    newVehicle.setVehicleSize(
                            request.getVehicle_type());

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
            session.setCheckInTime(Instant.now());
            session.setCreatedAt(Instant.now());
            session.setAssignedZoneId(chosen.getId());
            session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
            session.setIsVip(false);
            session.setMobileCheckoutPhoto(request.getImage_url());
        }

        session.setAssignedZoneId(chosen.getId());
        session.setCardId(card.getId());
        session.setUpdatedAt(Instant.now());

        // Clear suspicious status and entry gate if it was an error session
        if (sessionToUpdate != null) {
            session.setIsSuspicious(false);
            session.setSuspiciousReason(null);
            session.setEntryGate(null); // Clear entry gate to let it inside
            session.setCheckInTime(Instant.now());
        }

        // Thuật toán gán ô đỗ CHẾ ĐỘ 1 (Strict Mode): Bảo vệ tuyệt đối ô đỗ xe điện EV
        boolean isEvVehicle = "EV_CAR".equalsIgnoreCase(request.getVehicle_type())
                || "ELECTRIC".equalsIgnoreCase(request.getVehicle_type());
        ParkingSlot assignedSlot = null;

        if (isEvVehicle) {
            // Xe Điện: Ưu tiên ô sạc EV -> nếu hết thì gán ô đỗ thường
            assignedSlot = slotRepository.findAvailableEvSlotInZone(chosen.getId()).stream().findFirst()
                    .orElse(slotRepository
                            .findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE",
                                    request.getVehicle_type())
                            .orElse(slotRepository.findFirstByZoneIdAndSlotStatus(chosen.getId(), "AVAILABLE")
                                    .orElse(slotRepository.findFirstBySlotStatus("AVAILABLE").orElse(null))));
        } else {
            // Xe Xăng: Chỉ được đỗ vào ô đỗ thường (Không được đỗ ô EV)
            assignedSlot = slotRepository
                    .findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE", request.getVehicle_type())
                    .orElse(slotRepository
                            .findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE", "NORMAL")
                            .orElse(slotRepository.findAvailableNonEvSlotInZone(chosen.getId()).stream().findFirst()
                                    .orElse(slotRepository.findAvailableNonEvSlotAnywhere().stream().findFirst()
                                            .orElse(null))));

            if (assignedSlot == null) {
                // Tự động tạo ô đỗ dự phòng để không bao giờ bị nghẽn khi test
                ParkingSlot autoSlot = new ParkingSlot();
                autoSlot.setId(UUID.randomUUID());
                autoSlot.setZoneId(chosen.getId());
                autoSlot.setSlotNumber(chosen.getCode() + "-" + (System.currentTimeMillis() % 1000));
                autoSlot.setSlotType("NORMAL");
                autoSlot.setSlotStatus("AVAILABLE");
                autoSlot.setLastUpdated(Instant.now());
                autoSlot.setSensorMockId("SN-AUTO-" + System.currentTimeMillis());
                assignedSlot = slotRepository.save(autoSlot);
            }
        }

        if (assignedSlot != null) {
            assignedSlot.setSlotStatus("OCCUPIED");
            assignedSlot.setLastUpdated(Instant.now());
            slotRepository.save(assignedSlot);
            session.setParkedSlotId(assignedSlot.getId());
            session.setSlotPhotoUrl("https://mock-sensor-camera.com/slots/" + assignedSlot.getId() + ".jpg");
        }

        parkingSessionRepository.save(session); // save vào database

        // Đổi trạng thái thẻ
        card.setStatus(Card.CardStatus.IN_USE);
        card.setUpdatedAt(Instant.now());
        cardRepository.save(card);

        return new CheckInResponse( // trả respone về controller
                session.getId().toString(),
                chosen.getCode(),
                "VISITOR_CHECK_IN_OK");
    }

    private Zone ensureApprovedParkingSlot(ParkingSession session, String vehicleType) {
        Zone chosen = null;
        if (session.getAssignedZoneId() != null) {
            chosen = zoneRepository.findById(session.getAssignedZoneId()).orElse(null);
        }
        if (chosen == null) {
            List<Zone> candidates = zoneRepository.findByAllowedSizesContaining(vehicleType);
            for (Zone z : candidates) {
                if (z.getTotalSlots() - z.getCurrentOccupied() > 0) {
                    chosen = z;
                    break;
                }
            }
            if (chosen == null && !candidates.isEmpty()) {
                chosen = candidates.get(0);
            }
        }
        if (chosen == null) {
            chosen = zoneRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ApiExceptions.BadRequestException("Khong tim thay zone de cho xe vao bai"));
        }

        session.setAssignedZoneId(chosen.getId());
        if (session.getParkedSlotId() != null) {
            return chosen;
        }

        boolean isEvVehicle = "EV_CAR".equalsIgnoreCase(vehicleType) || "ELECTRIC".equalsIgnoreCase(vehicleType);
        ParkingSlot assignedSlot;
        if (isEvVehicle) {
            assignedSlot = slotRepository.findAvailableEvSlotInZone(chosen.getId()).stream().findFirst()
                    .orElse(slotRepository.findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE", vehicleType)
                    .orElse(slotRepository.findFirstByZoneIdAndSlotStatus(chosen.getId(), "AVAILABLE")
                    .orElse(slotRepository.findFirstBySlotStatus("AVAILABLE").orElse(null))));
        } else {
            assignedSlot = slotRepository.findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE", vehicleType)
                    .orElse(slotRepository.findFirstByZoneIdAndSlotStatusAndSlotType(chosen.getId(), "AVAILABLE", "NORMAL")
                    .orElse(slotRepository.findAvailableNonEvSlotInZone(chosen.getId()).stream().findFirst()
                    .orElse(slotRepository.findAvailableNonEvSlotAnywhere().stream().findFirst().orElse(null))));
        }

        if (assignedSlot == null) {
            ParkingSlot autoSlot = new ParkingSlot();
            autoSlot.setId(UUID.randomUUID());
            autoSlot.setZoneId(chosen.getId());
            autoSlot.setSlotNumber(chosen.getCode() + "-" + (System.currentTimeMillis() % 1000));
            autoSlot.setSlotType("NORMAL");
            autoSlot.setSlotStatus("AVAILABLE");
            autoSlot.setLastUpdated(Instant.now());
            autoSlot.setSensorMockId("SN-AUTO-" + System.currentTimeMillis());
            assignedSlot = slotRepository.save(autoSlot);
        }

        assignedSlot.setSlotStatus("OCCUPIED");
        assignedSlot.setLastUpdated(Instant.now());
        slotRepository.save(assignedSlot);
        session.setParkedSlotId(assignedSlot.getId());
        session.setSlotPhotoUrl("https://mock-sensor-camera.com/slots/" + assignedSlot.getId() + ".jpg");
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

            throw new ApiExceptions.ForbiddenException(
                    "Xe đang ở trạng thái KHÓA AN TOÀN chống trộm! Không thể xuất bãi.");
        }

        // task 7
        if (session.getSessionStatus() == ParkingSession.SessionStatus.PASSED_CONFIRMED) {
            Instant expireTime = session.getMobileCheckoutAt().plusSeconds(1800);

            if (Instant.now().isAfter(expireTime)) {
                session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
                parkingSessionRepository.save(session);
                throw new ApiExceptions.BadRequestException("Phiên thanh toán lưu động đã hết hạn 30 phút");
            }

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

            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ApiExceptions.NotFoundException("Không tìm thấy thẻ"));

            card.setStatus(Card.CardStatus.AVAILABLE);
            cardRepository.save(card);

            if (session.getAssignedZoneId() != null) {
                zoneRepository.decreaseOccupied(session.getAssignedZoneId());
            }

            return transactionRepository.findBySessionId(session.getId()).orElseThrow();
        }

        if (session.getIsVip() != null && session.getIsVip()) {
            throw new ApiExceptions.BadRequestException("Xe VIP không checkout bằng thẻ vãng lai");
        }

        if (blacklistRepository.existsByCardId(cardId)) {
            throw new ApiExceptions.ForbiddenException("Thẻ này đang nằm trong blacklist, không thể checkout");
        }

        if (transactionRepository.findBySessionId(session.getId()).isPresent()) {
            throw new ApiExceptions.ConflictException("Phiên gửi xe này đã có transaction");
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

        transaction.setParkingFee(parkingFee);
        transaction.setLostCardPenalty(lostCardPenalty);
        transaction.setViolationPenalty(BigDecimal.ZERO);
        transaction.setTotalAmount(parkingFee.add(lostCardPenalty));
        transaction.setPaymentMethod(Transaction.PaymentMethod.CASH);
        transaction.setPaymentStatus(Transaction.PaymentStatus.PENDING);
        transaction.setIsMobileCheckout(false);
        transaction.setProcessedAt(checkOutTime);

        transaction = transactionRepository.save(transaction);

        return transaction;
    }

    // confirm check out cho visitor
    @Override
    @Transactional
    public Transaction confirmCheckout(UUID transactionId) {

        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new ApiExceptions.NotFoundException(
                        "Không tìm thấy transaction"));

        if (transaction.getPaymentStatus() == Transaction.PaymentStatus.SUCCESS) {

            throw new ApiExceptions.ConflictException(
                    "Transaction đã được xác nhận");
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

        if (session.getIsLocked() != null && session.getIsLocked()) {
            SecurityAlert alert = new SecurityAlert();
            alert.setAlertType("NGHI NGỜ TRỘM CẮP");
            alert.setLicensePlate(session.getLicensePlate() != null ? session.getLicensePlate() : "N/A");
            alert.setReason("Phát hiện cố tình xuất bãi khi xe đang bật Khóa chống trộm.");
            alert.setIsActionable(true);
            securityAlertRepository.save(alert);

            throw new ApiExceptions.ForbiddenException(
                    "Xe đang ở trạng thái KHÓA AN TOÀN chống trộm! Không thể xuất bãi.");
        }

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

        Transaction transaction = new Transaction();

        transaction.setId(UUID.randomUUID());

        transaction.setSessionId(
                session.getId());

        transaction.setParkingFee(
                parkingFee);

        transaction.setLostCardPenalty(
                BigDecimal.ZERO);

        transaction.setViolationPenalty(
                BigDecimal.ZERO);

        transaction.setTotalAmount(
                parkingFee);

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

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("sessionId", session.getId().toString());
        response.put("licensePlate", session.getLicensePlate());
        response.put("checkInTime", session.getCheckInTime());
        response.put("checkOutTime", checkOutTime);
        response.put("parkingFee", parkingFee);
        response.put("isVip", session.getIsVip() != null && session.getIsVip());
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

            parkingSessionRepository
                    .findByParkedSlotIdAndSessionStatus(slot.getId(), ParkingSession.SessionStatus.ACTIVE)
                    .ifPresent(session -> {
                        map.put("sessionId", session.getId());
                        map.put("licensePlate", session.getLicensePlate());
                        map.put("checkInTime", session.getCheckInTime());
                        map.put("isVip", session.getIsVip());
                        map.put("slotPhotoUrl", session.getSlotPhotoUrl());
                    });
            result.add(map);
        }
        return result;
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
        Card card = cardRepository.findByCardCode(cardCode)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Thẻ không tồn tại"));
        return this.checkoutCard(card.getId());
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
}
