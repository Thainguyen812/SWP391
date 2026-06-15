package com.parking.service;

import com.parking.dto.BlacklistCardRequest;
import com.parking.exception.ApiExceptions;
import com.parking.model.BlacklistEntry; // Sử dụng Entity mới
import com.parking.model.ParkingSession;
import com.parking.repository.BlacklistRepository; // Sử dụng Repository mới
import com.parking.repository.ParkingSessionRepository;
import org.springframework.stereotype.Service;

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
    public BlacklistEntry create(BlacklistCardRequest request) {
        if (blacklistedCardRepository.existsByCardId(request.getCardId())) {
            throw new ApiExceptions.ConflictException("Card is already blacklisted");
        }

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
}