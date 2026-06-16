package com.parking.service;

import com.parking.dto.BlacklistCardRequest;
import com.parking.exception.ApiExceptions;
import com.parking.model.BlacklistEntry; // Sử dụng Entity mới
import com.parking.model.ParkingSession;
import com.parking.repository.BlacklistRepository; // Sử dụng Repository mới
import com.parking.repository.ParkingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BlacklistCardService {

    private final BlacklistRepository blacklistedCardRepository;
    private final ParkingSessionRepository parkingSessionRepository;

    public BlacklistCardService(BlacklistRepository blacklistedCardRepository,
            ParkingSessionRepository parkingSessionRepository) {
        this.blacklistedCardRepository = blacklistedCardRepository;
        this.parkingSessionRepository = parkingSessionRepository;
    }

    public UUID getCardIdByActiveLicensePlate(String plate) {
        // Chuẩn hóa chuỗi biển số xe nhập vào (bỏ khoảng trắng, viết hoa)
        String cleanPlate = plate.trim().toUpperCase();

        // Tìm phiên gửi xe đang ACTIVE của biển số này trong bãi
        ParkingSession activeSession = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(cleanPlate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.BadRequestException(
                        "Không tìm thấy chiếc xe biển số " + cleanPlate + " đang có mặt trong bãi xe!"));

        return activeSession.getCardId();
    }

    // Đổi kiểu trả về và kiểu khai báo sang BlacklistEntry
    // BỔ SUNG @Transactional CHO HÀM CREATE ĐỂ BẢO VỆ DỮ LIỆU
    @Transactional
    public BlacklistEntry create(BlacklistCardRequest request) {
        if (blacklistedCardRepository.existsByCardId(request.getCardId())) {
            throw new ApiExceptions.ConflictException("Card is already blacklisted");
        }

        ParkingSession session = parkingSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ApiExceptions.BadRequestException(
                        "Không tìm thấy phiên gửi xe tương ứng với yêu cầu này!"));

        if (session.getSessionStatus() == ParkingSession.SessionStatus.COMPLETED) {
            throw new ApiExceptions.ConflictException("Phiên gửi xe này đã được xác nhận hoàn tất trước đó rồi!");
        }

        // 3. Đóng phiên gửi xe vãng lai, cập nhật thời gian ra thực tế và Staff xử lý
        // sự cố
        session.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
        session.setCheckOutTime(Instant.now());

        // Sửa hàm lỗi: Dùng setOverrideByStaff để ghi nhận ID nhân viên xử lý tại bốt
        session.setOverrideByStaff(request.getBlacklistedBy());
        if (request.getNotes() != null) {
            session.setOverrideReason(request.getNotes()); // Lưu luôn lý do vào phiên xe
        }

        parkingSessionRepository.save(session);

        BlacklistEntry blacklistEntry = new BlacklistEntry();
        blacklistEntry.setId(UUID.randomUUID());
        blacklistEntry.setCardId(request.getCardId());
        blacklistEntry.setSessionId(request.getSessionId());
        blacklistEntry.setReason(request.getReason());
        blacklistEntry.setBlacklistedBy(request.getBlacklistedBy());
        blacklistEntry.setNotes(request.getNotes());
        blacklistEntry.setBlacklistedAt(Instant.now());

        return blacklistedCardRepository.save(blacklistEntry);
    }

    // Đổi kiểu danh sách trả về sang BlacklistEntry
    public List<BlacklistEntry> findAll() {
        return blacklistedCardRepository.findAll();
    }

    public boolean isCardBlacklisted(UUID cardId) {
        return blacklistedCardRepository.existsByCardId(cardId);
    }

    public void delete(UUID id) {
        blacklistedCardRepository.deleteById(id);
    }

    @Transactional
    public BlacklistEntry processLostCardByPlate(String plate, BlacklistCardRequest request) {
        // 1. Chuẩn hóa biển số để tìm đúng xe trong bãi
        String cleanPlate = plate.trim().toUpperCase();

        // 2. Tìm phiên xe ACTIVE (Nếu không tìm thấy, hệ thống báo lỗi 400 ngay)
        ParkingSession activeSession = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(cleanPlate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.BadRequestException(
                        "Không tìm thấy chiếc xe biển số " + cleanPlate + " đang có mặt trong bãi xe!"));

        // 3. Tự động đắp ID từ Database vào request (Triệt tiêu lỗi null ID)
        request.setCardId(activeSession.getCardId());
        request.setSessionId(activeSession.getId());

        // 4. Kiểm tra ID nhân viên (Hệ thống yêu cầu truyền ID từ Client để hỗ trợ
        // nhiều nhân viên)
        if (request.getBlacklistedBy() == null) {
            throw new ApiExceptions.BadRequestException("Thiếu ID nhân viên thực hiện xử lý sự cố!");
        }

        // 5. Chuẩn hóa lý do (Reason) đúng theo Check Constraint của Database
        // Bắt buộc phải là: 'LOST', 'STOLEN', 'DAMAGED', hoặc 'FRAUDULENT'
        String rawReason = (request.getReason() != null) ? request.getReason().trim().toUpperCase() : "LOST";

        if (rawReason.contains("STOLEN")) {
            request.setReason("STOLEN");
        } else if (rawReason.contains("DAMAGED")) {
            request.setReason("DAMAGED");
        } else if (rawReason.contains("FRAUDULENT")) {
            request.setReason("FRAUDULENT");
        } else {
            request.setReason("LOST"); // Mặc định nếu không khớp hoặc để trống
        }

        // 6. Tự tạo ghi chú nếu chưa có
        if (request.getNotes() == null || request.getNotes().isEmpty()) {
            request.setNotes("Hệ thống tự động xử lý báo mất thẻ cho xe: " + cleanPlate);
        }

        // 7. Gọi hàm create đã được tối ưu để lưu xuống DB
        return this.create(request);
    }

    public ParkingSession getActiveSessionByLicensePlate(String plate) {
        String cleanPlate = plate.trim().toUpperCase();
        return parkingSessionRepository
                .findByLicensePlateAndSessionStatus(cleanPlate, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ApiExceptions.BadRequestException(
                        "Không tìm thấy chiếc xe biển số " + cleanPlate + " đang có mặt trong bãi xe!"));
    }
}