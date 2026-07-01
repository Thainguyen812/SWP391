package com.parking.service;

import com.parking.model.Card;
import java.util.List;
import java.util.UUID;

public interface CardService {
    List<Card> getAllCards();
    Card createCard(String cardCode);
    Card updateCardStatus(UUID id, Card.CardStatus status);
}