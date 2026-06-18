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

        // 1. Đóng gói các thông tin cơ bản vào DTO
        BlacklistCardRequest request = new BlacklistCardRequest();
        request.setReason(reason);
        request.setBlacklistedBy(staffId);

        // 2. Chỉ gọi đúng 1 hàm Service duy nhất
        // Mọi logic tìm kiếm phiên xe, chuẩn hóa dữ liệu, set ID, set trạng thái
        // LOST_CARD
        // đều đã được xử lý bên trong processLostCardByPlate
        return blacklistCardService.processLostCardByPlate(plate, request);
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