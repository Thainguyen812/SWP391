package com.parking.repository;

import com.parking.model.BlacklistedPlate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlacklistedPlateRepository extends JpaRepository<BlacklistedPlate, String> {

    Optional<BlacklistedPlate> findByLicensePlate(String licensePlate);

    boolean existsByLicensePlate(String licensePlate);
}