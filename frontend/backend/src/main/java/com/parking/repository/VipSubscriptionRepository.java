package com.parking.repository;

import com.parking.model.VipSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface VipSubscriptionRepository extends JpaRepository<VipSubscription, UUID> {
    Optional<VipSubscription> findByVehicleIdAndStatus(UUID vehicleId, VipSubscription.Status status);
}
