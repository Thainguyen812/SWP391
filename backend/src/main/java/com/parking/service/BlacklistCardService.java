package com.parking.service;

import com.parking.dto.BlacklistCardRequest;
import com.parking.exception.ApiExceptions;
import com.parking.model.BlacklistedCard;
import com.parking.model.ParkingSession;
import com.parking.repository.BlacklistedCardRepository;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BlacklistCardService {

    private final BlacklistedCardRepository blacklistedCardRepository;
    private final ParkingSessionRepository parkingSessionRepository;

    public BlacklistCardService(BlacklistedCardRepository blacklistedCardRepository,
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

        // Trả về mã thẻ xe (cardId) đang nằm trong phiên gửi xe đó
        // (Lưu ý: Bạn hãy check xem trong Entity ParkingSession của Thái đã khai báo
        // trường cardId/getCardId() chưa nhé)
        return activeSession.getCardId();
    }

    public BlacklistedCard create(BlacklistCardRequest request) {
        if (blacklistedCardRepository.existsByCardId(request.getCardId())) {
            throw new RuntimeException("Card is already blacklisted");
        }

        BlacklistedCard blacklistedCard = new BlacklistedCard();
        blacklistedCard.setId(UUID.randomUUID());
        blacklistedCard.setCardId(request.getCardId());
        blacklistedCard.setSessionId(request.getSessionId());
        blacklistedCard.setReason(request.getReason());
        blacklistedCard.setBlacklistedBy(request.getBlacklistedBy());
        blacklistedCard.setNotes(request.getNotes());
        blacklistedCard.setBlacklistedAt(Instant.now());

        return blacklistedCardRepository.save(blacklistedCard);
    }

    public List<BlacklistedCard> findAll() {
        return blacklistedCardRepository.findAll();
    }

    public boolean isCardBlacklisted(UUID cardId) {
        return blacklistedCardRepository.existsByCardId(cardId);
    }

    public void delete(UUID id) {
        blacklistedCardRepository.deleteById(id);
    }
}