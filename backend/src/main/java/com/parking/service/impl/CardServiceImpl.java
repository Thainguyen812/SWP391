package com.parking.service.impl;

import com.parking.model.Card;
import com.parking.repository.CardRepository;
import com.parking.service.CardService;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;

    public CardServiceImpl(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Override
    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }

    @Override
    public Card createCard(String cardCode) {
        // Kiểm tra xem mã thẻ đã tồn tại trong hệ thống chưa
        if (cardRepository.findByCardCode(cardCode).isPresent()) {
            throw new RuntimeException("Mã thẻ RFID này đã tồn tại trên hệ thống!");
        }

        Card card = new Card();
        card.setId(UUID.randomUUID()); // Tự động sinh ID ngẫu nhiên loại UUID
        card.setCardCode(cardCode);
        card.setStatus(Card.CardStatus.AVAILABLE); // Mặc định thẻ mới khai báo sẽ ở trạng thái sẵn sàng sử dụng
        card.setCreatedAt(Instant.now());
        card.setUpdatedAt(Instant.now());

        return cardRepository.save(card);
    }

    @Override
    public Card updateCardStatus(UUID id, Card.CardStatus status) {
        // Tìm thẻ theo ID, nếu không thấy thì báo lỗi
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thẻ với ID: " + id));

        card.setStatus(status);
        card.setUpdatedAt(Instant.now());
        
        return cardRepository.save(card);
    }
}