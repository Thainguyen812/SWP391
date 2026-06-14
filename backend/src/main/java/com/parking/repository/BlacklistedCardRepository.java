package com.parking.repository;

import com.parking.model.BlacklistedCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BlacklistedCardRepository extends JpaRepository<BlacklistedCard, UUID> {
    boolean existsByCardId(UUID cardId);
    Optional<BlacklistedCard> findByCardId(UUID cardId);
}