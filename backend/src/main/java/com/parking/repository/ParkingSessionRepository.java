package com.parking.repository;

import com.parking.model.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {
    // --- HEAD ---
    Optional<ParkingSession> findByLicensePlateAndSessionStatus(String licensePlate, ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findByVehicleIdAndSessionStatusIn(java.util.UUID vehicleId, java.util.Collection<ParkingSession.SessionStatus> sessionStatuses);
    
    long countBySessionStatus(ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findByIsSuspiciousTrue();
    long countBySessionStatusAndIsVipTrue(ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findTop10ByOrderByUpdatedAtDesc();

    // Queries cho Staff Features
    org.springframework.data.domain.Page<ParkingSession> findByLicensePlateContainingIgnoreCase(String licensePlate, org.springframework.data.domain.Pageable pageable);
    java.util.List<ParkingSession> findByIsSuspiciousTrueAndSessionStatus(ParkingSession.SessionStatus sessionStatus);
    java.util.List<ParkingSession> findByLicensePlateContainingIgnoreCaseAndSessionStatus(String licensePlate, ParkingSession.SessionStatus sessionStatus);

    // --- origin/main ---
    // Tìm theo ID thẻ
    Optional<ParkingSession> findByCardIdAndSessionStatus(UUID cardId, ParkingSession.SessionStatus sessionStatus);

    // Tìm phiên xe đang ACTIVE tại ô đỗ cụ thể (Dành cho Scheduler)
    Optional<ParkingSession> findByParkedSlotIdAndSessionStatus(UUID parkedSlotId, ParkingSession.SessionStatus sessionStatus);

    // Tìm phiên xe theo thẻ và danh sách trạng thái 
    List<ParkingSession> findByCardIdAndSessionStatusIn(UUID cardId, Collection<ParkingSession.SessionStatus> statuses);
}
