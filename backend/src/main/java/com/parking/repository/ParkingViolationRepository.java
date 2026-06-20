package com.parking.repository;

import com.parking.model.ParkingViolation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ParkingViolationRepository extends JpaRepository<ParkingViolation, UUID> {
    // Có sẵn các phương thức cơ bản như save(), findById()
}