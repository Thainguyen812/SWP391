package com.parking.repository;

import com.parking.model.BlacklistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface BlacklistRepository extends JpaRepository<BlacklistEntry, UUID> {
    boolean existsByCardId(UUID cardId);

    Optional<BlacklistEntry> findByCardId(UUID cardId);
}
