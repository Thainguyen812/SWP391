package com.parking.repository;

import com.parking.model.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {

    Optional<ParkingSession> findByLicensePlateAndSessionStatus(
            String licensePlate,
            ParkingSession.SessionStatus sessionStatus
    );

    Optional<ParkingSession> findByVehicleIdAndSessionStatus(
            UUID vehicleId,
            ParkingSession.SessionStatus sessionStatus
    );

    @Modifying
    @Transactional
    @Query("UPDATE ParkingSession p SET p.isLocked = :locked WHERE p.vehicleId = :vehicleId AND p.sessionStatus = :status")
    int updateLockStatusByVehicleId(
            UUID vehicleId,
            ParkingSession.SessionStatus status,
            Boolean locked
    );
}