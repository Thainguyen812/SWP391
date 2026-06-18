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

    // MẢNH GHÉP CÒN THIẾU: Tìm phiên xe đang ACTIVE tại ô đỗ cụ thể
    // Đây là phương thức Scheduler dùng để liên kết vi phạm với phiên xe
    Optional<ParkingSession> findByParkedSlotIdAndSessionStatus(UUID parkedSlotId,
            ParkingSession.SessionStatus sessionStatus);
}