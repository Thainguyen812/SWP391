package com.parking.repository;

import com.parking.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

    // phần 1 / check out task 5

public interface CardRepository extends JpaRepository<Card, UUID> {

    List<Card> findAllByCardCode(String cardCode);

    default Optional<Card> findByCardCode(String cardCode) {
        List<Card> list = findAllByCardCode(cardCode);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    Optional<Card> findFirstByStatus(Card.CardStatus status);

}