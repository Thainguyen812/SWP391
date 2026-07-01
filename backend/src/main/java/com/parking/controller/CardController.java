package com.parking.controller;

import com.parking.model.Card;
import com.parking.service.CardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cards")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')") // Chặn quyền USER thường truy cập (Trả về 403)
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    // 1. GET /api/v1/cards -> Xem danh sách thẻ RFID vật lý
    @GetMapping
    public ResponseEntity<List<Card>> getAllCards() {
        List<Card> cards = cardService.getAllCards();
        return ResponseEntity.ok(cards);
    }

    // 2. POST /api/v1/cards -> Khai báo thêm thẻ mới vào DB
    // Request Body truyền dạng JSON đơn giản: { "cardCode": "RFID123456" }
    @PostMapping
    public ResponseEntity<?> createCard(@RequestBody Map<String, String> request) {
        String cardCode = request.get("cardCode");
        if (cardCode == null || cardCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mã cardCode không được để trống!");
        }
        try {
            Card newCard = cardService.createCard(cardCode);
            return ResponseEntity.status(HttpStatus.CREATED).body(newCard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. PUT /api/v1/cards/{id}/status -> Khóa thẻ hoặc thay đổi trạng thái thẻ
    // Request Body truyền dạng JSON: { "status": "LOCKED" } hoặc "AVAILABLE", "IN_USE", "BLACKLISTED"
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCardStatus(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        String statusStr = request.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().body("Trạng thái status không được để trống!");
        }
        try {
            Card.CardStatus status = Card.CardStatus.valueOf(statusStr.toUpperCase());
            Card updatedCard = cardService.updateCardStatus(id, status);
            return ResponseEntity.ok(updatedCard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ! Chỉ chấp nhận: AVAILABLE, IN_USE, LOST, BLACKLISTED");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}