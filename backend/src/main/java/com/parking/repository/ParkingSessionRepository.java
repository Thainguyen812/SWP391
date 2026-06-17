package com.parking.repository;

import com.parking.model.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {
    Optional<ParkingSession> findByLicensePlateAndSessionStatus(String licensePlate, ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findByVehicleIdAndSessionStatusIn(java.util.UUID vehicleId, java.util.Collection<ParkingSession.SessionStatus> sessionStatuses);

    // phần 1 / check out task 5
    Optional<ParkingSession> findByCardIdAndSessionStatus(
    UUID cardId,
    ParkingSession.SessionStatus sessionStatus
    //
);
}
