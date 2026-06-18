package com.parking.service.impl;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;
import com.parking.exception.ApiExceptions;
import com.parking.model.BlacklistEntry;
import com.parking.model.ParkingSession;
import com.parking.model.VipSubscription;
import com.parking.model.Zone;
import com.parking.model.Vehicle;
import com.parking.model.VipQrIdentifier;
import com.parking.model.AuditLog;
import com.parking.model.AiScanLog;

import com.parking.model.Transaction; // task 5

import com.parking.repository.BlacklistRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.ZoneRepository;
import com.parking.repository.VipQrIdentifierRepository;
import com.parking.repository.AuditLogRepository;
import com.parking.repository.AiScanLogRepository;

import com.parking.repository.TransactionRepository;// task 5

import com.parking.service.ParkingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import java.math.BigDecimal;// task 5

import com.parking.dto.VisitorCheckInRequest;// task 5
import com.parking.model.Card;// task 5
import com.parking.repository.CardRepository;// task 5

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    public ParkingServiceImpl(BlacklistRepository blacklistRepository,
            ParkingSessionRepository parkingSessionRepository,
            ZoneRepository zoneRepository,
            VipSubscriptionRepository vipSubscriptionRepository,
            VehicleRepository vehicleRepository,
            VipQrIdentifierRepository vipQrIdentifierRepository,
            AuditLogRepository auditLogRepository,
            AiScanLogRepository aiScanLogRepository,
            TransactionRepository transactionRepository, // task 5
            CardRepository cardRepository) { // task 5
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

        // Find matching zone
        List<Zone> candidates = zoneRepository.findByAllowedSizesContaining(request.getVehicle_type());
        Zone chosen = null;
        for (Zone z : candidates) {
            if (z.getTotalSlots() - z.getCurrentOccupied() > 0) {
                chosen = z;
                break;
            }
        }
        if (chosen == null) {
            throw new ApiExceptions.BadRequestException("No available zone for vehicle type");
        }

        // Increment occupancy
        chosen.setCurrentOccupied(chosen.getCurrentOccupied() + 1);
        zoneRepository.save(chosen);

        // VIP check: resolve vehicle then lookup subscription by vehicle id
        boolean isVip = false;
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            java.util.UUID vehicleUuid = vehicle.getId();
            Optional<VipSubscription> vip = vipSubscriptionRepository.findByVehicleIdAndStatus(vehicleUuid,
                    VipSubscription.Status.ACTIVE);
            if (vip.isPresent())
                isVip = true;
        }

        // Create session
        ParkingSession ps = new ParkingSession();
        ps.setId(UUID.randomUUID());
        ps.setLicensePlate(plate);
        ps.setCheckInTime(Instant.now());
        ps.setAssignedZoneId(chosen.getId());
        ps.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
        ps.setIsVip(isVip);
        // store image url if provided
        ps.setMobileCheckoutPhoto(request.getImage_url());

        if (vehicleOpt.isPresent()) {
            ps.setVehicleId(vehicleOpt.get().getId());
        }

        parkingSessionRepository.save(ps);

        return new CheckInResponse(ps.getId().toString(), chosen.getCode(), "OK");
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

        Optional<ParkingSession> existing = parkingSessionRepository.findByLicensePlateAndSessionStatus( // kiểm tra xe
                                                                                                         // có phiên gửi
                                                                                                         // xe chưa
                plate,
                ParkingSession.SessionStatus.ACTIVE);

        if (existing.isPresent()) {
            throw new ApiExceptions.ConflictException("Xe này đang có phiên gửi xe ACTIVE");
        }

        Card card = cardRepository.findByCardCode(request.getCard_code()) // tìm thẻ để sử dung
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
            throw new ApiExceptions.BadRequestException("Không còn zone phù hợp cho loại xe này");
        }

        zoneRepository.increaseOccupied(chosen.getId()); // trừ số lượng slot còn trống 

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

        // Tao parking session 
        ParkingSession session = new ParkingSession();
        session.setId(UUID.randomUUID());
        session.setLicensePlate(plate);
        session.setCardId(card.getId());
        session.setVehicleId(vehicle.getId());
        session.setCheckInTime(Instant.now());
        session.setCreatedAt(Instant.now());
        session.setUpdatedAt(Instant.now());
        session.setAssignedZoneId(chosen.getId());
        session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
        session.setIsVip(false);
        session.setMobileCheckoutPhoto(request.getImage_url());

        parkingSessionRepository.save(session); // save vào database

        //Đổi trạng thái thẻ
        card.setStatus(Card.CardStatus.IN_USE);
        card.setUpdatedAt(Instant.now());
        cardRepository.save(card);

        return new CheckInResponse( // trả respone về controller
                session.getId().toString(),
                chosen.getCode(),
                "VISITOR_CHECK_IN_OK");
    }

    // task5 check out
    @Override
    @Transactional
    public Transaction checkoutCard(UUID cardId) {
        ParkingSession session = parkingSessionRepository.findByCardIdAndSessionStatus(
                cardId,
                ParkingSession.SessionStatus.ACTIVE).orElseThrow(
                        () -> new ApiExceptions.NotFoundException("Không tìm thấy phiên gửi xe ACTIVE cho thẻ này"));

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

        BigDecimal parkingFee = transactionRepository.calculateParkingFee( // gọi transaction để tính phí
                vehicle.getVehicleSize(),
                session.getCheckInTime(),
                checkOutTime);

        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID());
        transaction.setSessionId(session.getId());
        transaction.setParkingFee(parkingFee);
        transaction.setLostCardPenalty(BigDecimal.ZERO);
        transaction.setViolationPenalty(BigDecimal.ZERO);
        transaction.setTotalAmount(parkingFee);
        transaction.setPaymentMethod(Transaction.PaymentMethod.CASH);
        transaction.setPaymentStatus(Transaction.PaymentStatus.PENDING);
        transaction.setIsMobileCheckout(false);
        transaction.setProcessedAt(checkOutTime);

        transaction = transactionRepository.save(transaction);
        session.setSessionStatus(
        ParkingSession.SessionStatus.COMPLETED);              
        session.setCheckOutTime(checkOutTime);
        parkingSessionRepository.save(session);

        Card card = cardRepository.findById(cardId) 
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
    

}
