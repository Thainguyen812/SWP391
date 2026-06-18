package com.parking.repository;

import com.parking.model.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {

    // Tìm theo biển số
    Optional<ParkingSession> findByLicensePlateAndSessionStatus(String licensePlate,
            ParkingSession.SessionStatus sessionStatus);

    // Tìm theo danh sách trạng thái
    List<ParkingSession> findByVehicleIdAndSessionStatusIn(UUID vehicleId,
            Collection<ParkingSession.SessionStatus> sessionStatuses);

    // Tìm theo ID thẻ
    Optional<ParkingSession> findByCardIdAndSessionStatus(UUID cardId, ParkingSession.SessionStatus sessionStatus);

    // Tìm phiên xe đang ACTIVE tại ô đỗ cụ thể (Dành cho Scheduler)
    Optional<ParkingSession> findByParkedSlotIdAndSessionStatus(UUID parkedSlotId,
            ParkingSession.SessionStatus sessionStatus);

    // Tìm phiên xe theo thẻ và danh sách trạng thái 
    List<ParkingSession> findByCardIdAndSessionStatusIn(
            UUID cardId,
            Collection<ParkingSession.SessionStatus> statuses
    );
}