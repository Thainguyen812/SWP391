package com.parking.controller;

import com.parking.dto.BlacklistCardRequest;
import com.parking.model.BlacklistEntry;
import com.parking.model.ParkingSession;
import com.parking.service.BlacklistCardService;
<<<<<<< Updated upstream
import org.springframework.security.core.Authentication; // Nhớ import thư viện này
=======

import org.springframework.security.access.prepost.PreAuthorize;
>>>>>>> Stashed changes
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blacklisted-cards")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
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
    // ENDPOINT: Tra cứu biển số để tự động khóa thẻ xe tương ứng (Đã Fix Bảo Mật)
    // =====================================================================
    @PostMapping("/block-by-plate")
    public BlacklistEntry blockCardByLicensePlate(
            @RequestParam String plate,
            @RequestParam String reason,
            Authentication authentication) { // <-- 1. ĐÃ THAY ĐỔI: Bỏ staffId, thêm Authentication ở đây

        // 2. Lấy username của nhân viên đang thao tác trực tiếp từ hệ thống bảo mật
        String currentStaffUsername = authentication.getName();

        // 3. Đóng gói các thông tin cơ bản vào DTO (Chừa trường BlacklistedBy ra để
        // Service tự tìm ID xịn)
        BlacklistCardRequest request = new BlacklistCardRequest();
        request.setReason(reason);

        // 4. Truyền thêm currentStaffUsername sang cho hàm Service xử lý tìm ID thật
        // trong DB
        return blacklistCardService.processLostCardByPlate(plate, request, currentStaffUsername);
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