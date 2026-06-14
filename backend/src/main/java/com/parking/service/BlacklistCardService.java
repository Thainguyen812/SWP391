package com.parking.service;

import com.parking.dto.BlacklistCardRequest;
import com.parking.model.BlacklistedCard;
import com.parking.repository.BlacklistedCardRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BlacklistCardService {

    private final BlacklistedCardRepository blacklistedCardRepository;

    public BlacklistCardService(BlacklistedCardRepository blacklistedCardRepository) {
        this.blacklistedCardRepository = blacklistedCardRepository;
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