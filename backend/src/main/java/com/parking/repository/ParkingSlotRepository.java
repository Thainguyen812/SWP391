package com.parking.repository;

import com.parking.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, UUID> {

    // CHỈNH SỬA: Dùng slotStatus và evChargerId khớp với Entity mới
    // Lưu ý: Kiểm tra evChargerId IS NOT NULL để xác định đó là ô có trụ sạc
    @Query("SELECT s FROM ParkingSlot s WHERE s.slotStatus = 'OCCUPIED' " +
            "AND s.evChargerId IS NOT NULL " +
            "AND s.lastUpdated <= :timeLimit")
    List<ParkingSlot> findViolatingSlots(@Param("timeLimit") Instant timeLimit);

    // Thêm vào ParkingSlotRepository.java
    Optional<ParkingSlot> findFirstBySlotTypeAndSlotStatus(String slotType, String slotStatus);

    Optional<ParkingSlot> findFirstByZoneIdAndSlotStatusAndSlotType(UUID zoneId, String slotStatus, String slotType);

    Optional<ParkingSlot> findFirstByZoneIdAndSlotStatus(UUID zoneId, String slotStatus);

    Optional<ParkingSlot> findFirstBySlotStatus(String slotStatus);

    @Query("SELECT s FROM ParkingSlot s WHERE s.zoneId = :zoneId AND s.slotStatus = 'AVAILABLE' AND (s.evChargerId IS NULL AND (s.slotType IS NULL OR s.slotType != 'EV'))")
    Optional<ParkingSlot> findAvailableNonEvSlotInZone(@Param("zoneId") UUID zoneId);

    @Query("SELECT s FROM ParkingSlot s WHERE s.slotStatus = 'AVAILABLE' AND (s.evChargerId IS NULL AND (s.slotType IS NULL OR s.slotType != 'EV'))")
    Optional<ParkingSlot> findAvailableNonEvSlotAnywhere();

    @Query("SELECT s FROM ParkingSlot s WHERE s.zoneId = :zoneId AND s.slotStatus = 'AVAILABLE' AND (s.evChargerId IS NOT NULL OR s.slotType = 'EV')")
    Optional<ParkingSlot> findAvailableEvSlotInZone(@Param("zoneId") UUID zoneId);
}