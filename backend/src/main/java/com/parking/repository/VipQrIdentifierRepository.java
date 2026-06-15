package com.parking.repository;

import com.parking.model.VipQrIdentifier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface VipQrIdentifierRepository extends JpaRepository<VipQrIdentifier, UUID> {
    Optional<VipQrIdentifier> findByQrToken(String qrToken);
}
