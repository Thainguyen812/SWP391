package com.parking.repository;

import com.parking.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findAllByLicensePlate(String licensePlate);

    default Optional<Vehicle> findByLicensePlate(String licensePlate) {
        List<Vehicle> list = findAllByLicensePlate(licensePlate);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    List<Vehicle> findByOwnerId(UUID ownerId);
}
