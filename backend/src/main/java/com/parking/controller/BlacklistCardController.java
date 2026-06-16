package com.parking.controller;

import com.parking.dto.BlacklistCardRequest;
import com.parking.model.BlacklistEntry;
import com.parking.model.ParkingSession;
import com.parking.service.BlacklistCardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blacklisted-cards")
public class BlacklistCardController {

    private final BlacklistCardService blacklistCardService;

    public BlacklistCardController(BlacklistCardService blacklistCardService) {
        this.blacklistCardService = blacklistCardService;
    }

    @PostMapping
    public BlacklistEntry create(@RequestBody BlacklistCardRequest request) {
        return blacklistCardService.create(request);
    }

    @GetMapping
    public List<BlacklistEntry> findAll() {
        return blacklistCardService.findAll();
    }

    // =====================================================================
    // ENDPOINT: Tra cứu biển số để tự động khóa thẻ xe tương ứng
    // =====================================================================
    @PostMapping("/block-by-plate")
    public BlacklistEntry blockCardByLicensePlate(
            @RequestParam String plate,
            @RequestParam String reason,
            @RequestParam UUID staffId) {

        // Bước A: Gọi hàm bạn vừa viết trong Service để tìm ngược ra Card ID đang nằm
        // trong bãi
        UUID detectedCardId = blacklistCardService.getCardIdByActiveLicensePlate(plate);

        // Bước B: Đóng gói thông tin lại thành một Request hoàn chỉnh để tái sử dụng
        // hàm create()
        // Cần ép kiểu hoặc đảm bảo tìm đúng Session đang ACTIVE của biển số này
        ParkingSession activeSession = blacklistCardService.getActiveSessionByLicensePlate(plate);
        String cleanPlate = plate.trim().toUpperCase();

        BlacklistCardRequest request = new BlacklistCardRequest();
        request.setCardId(activeSession.getCardId());
        request.setSessionId(activeSession.getId());
        request.setReason(reason);
        request.setBlacklistedBy(staffId);
        request.setNotes(
                "Hệ thống tự động khóa qua chức năng báo mất cho xe có biển số: " + cleanPlate);

        // Bước C: Gọi hàm tạo bản ghi blacklist
        return blacklistCardService.create(request);
    }
    // =====================================================================

    @GetMapping("/check/{cardId}")
    public boolean check(@PathVariable UUID cardId) {
        return blacklistCardService.isCardBlacklisted(cardId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        blacklistCardService.delete(id);
    }
}