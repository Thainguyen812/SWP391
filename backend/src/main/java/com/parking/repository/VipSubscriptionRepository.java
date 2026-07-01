package com.parking.repository;

import com.parking.model.VipSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface VipSubscriptionRepository extends JpaRepository<VipSubscription, UUID> {
    Optional<VipSubscription> findByVehicleIdAndStatus(UUID vehicleId, VipSubscription.Status status);

    List<VipSubscription> findByStatus( // đăng ký vip
            VipSubscription.Status status);

    long countByStatus(VipSubscription.Status status);
}
