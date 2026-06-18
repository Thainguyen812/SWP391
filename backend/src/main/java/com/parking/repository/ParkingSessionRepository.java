package com.parking.repository;

import com.parking.model.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {
    Optional<ParkingSession> findByLicensePlateAndSessionStatus(String licensePlate, ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findByVehicleIdAndSessionStatusIn(java.util.UUID vehicleId, java.util.Collection<ParkingSession.SessionStatus> sessionStatuses);
    
    long countBySessionStatus(ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findByIsSuspiciousTrue();
    long countBySessionStatusAndIsVipTrue(ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findTop10ByOrderByUpdatedAtDesc();
}
