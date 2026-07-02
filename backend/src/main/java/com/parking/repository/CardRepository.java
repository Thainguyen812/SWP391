package com.parking.repository;

import com.parking.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

    // phần 1 / check out task 5

public interface CardRepository extends JpaRepository<Card, UUID> {

    Optional<Card> findByCardCode(String cardCode);

    Optional<Card> findFirstByStatus(Card.CardStatus status);

}