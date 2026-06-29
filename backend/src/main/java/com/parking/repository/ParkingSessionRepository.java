package com.parking.repository;

import com.parking.model.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {
    // --- HEAD ---
    Optional<ParkingSession> findByLicensePlateAndSessionStatus(String licensePlate,
            ParkingSession.SessionStatus sessionStatus);

    java.util.List<ParkingSession> findByVehicleIdAndSessionStatusIn(java.util.UUID vehicleId,
            java.util.Collection<ParkingSession.SessionStatus> sessionStatuses);

    long countBySessionStatus(ParkingSession.SessionStatus sessionStatus);

    java.util.List<ParkingSession> findByIsSuspiciousTrue();

    long countBySessionStatusAndIsVipTrue(ParkingSession.SessionStatus sessionStatus);

    java.util.List<ParkingSession> findTop10ByOrderByUpdatedAtDesc();

    // Queries cho Staff Features
    org.springframework.data.domain.Page<ParkingSession> findByLicensePlateContainingIgnoreCase(String licensePlate,
            org.springframework.data.domain.Pageable pageable);

    java.util.List<ParkingSession> findByIsSuspiciousTrueAndSessionStatus(ParkingSession.SessionStatus sessionStatus);

    java.util.List<ParkingSession> findByLicensePlateContainingIgnoreCaseAndSessionStatus(String licensePlate,
            ParkingSession.SessionStatus sessionStatus);

    // --- origin/main ---
    // Tìm theo ID thẻ
    Optional<ParkingSession> findByCardIdAndSessionStatus(UUID cardId, ParkingSession.SessionStatus sessionStatus);

    Optional<ParkingSession> findByParkedSlotIdAndSessionStatus(UUID parkedSlotId,
            ParkingSession.SessionStatus sessionStatus);

    // Tìm phiên xe theo thẻ và danh sách trạng thái
    List<ParkingSession> findByCardIdAndSessionStatusIn(UUID cardId, Collection<ParkingSession.SessionStatus> statuses);

    @org.springframework.data.jpa.repository.Query("SELECT ps FROM ParkingSession ps WHERE ps.sessionStatus = 'ACTIVE' AND ps.licensePlate LIKE %:digits")
    List<ParkingSession> findActiveSessionsByPlateEndingWith(
            @org.springframework.data.repository.query.Param("digits") String digits);

    // 🟢 VÁ LỖI N+1: Dùng JOIN FETCH để gom sạch dữ liệu trong đúng 1 câu SQL
    // =====================================================================
    @org.springframework.data.jpa.repository.Query("SELECT ps FROM ParkingSession ps LEFT JOIN FETCH ps.vehicle")
    List<ParkingSession> findAllWithVehicle();
}
