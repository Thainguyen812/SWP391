package com.parking.repository;

import com.parking.model.VipSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface VipSubscriptionRepository extends JpaRepository<VipSubscription, UUID> {
    List<VipSubscription> findAllByVehicleIdAndStatus(UUID vehicleId, VipSubscription.Status status);

    default Optional<VipSubscription> findByVehicleIdAndStatus(UUID vehicleId, VipSubscription.Status status) {
        List<VipSubscription> list = findAllByVehicleIdAndStatus(vehicleId, status);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    List<VipSubscription> findByVehicleIdOrderByCreatedAtDesc(UUID vehicleId);

    List<VipSubscription> findByVehicleId(UUID vehicleId);
    List<VipSubscription> findByVehicleIdIn(List<UUID> vehicleIds);

    List<VipSubscription> findByStatus(
            VipSubscription.Status status);

    long countByStatus(VipSubscription.Status status);
}
