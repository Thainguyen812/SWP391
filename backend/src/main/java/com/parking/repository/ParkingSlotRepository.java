package com.parking.repository;

import com.parking.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, UUID> {

    // Query này dùng để tìm xe đỗ quá 15 phút tại vị trí sạc mà không sạc
    @Query("SELECT s FROM ParkingSlot s WHERE s.status = 'OCCUPIED' " +
            "AND s.chargerStatus = 'NOT_CHARGING' " +
            "AND s.lastUpdated <= :timeLimit")
    List<ParkingSlot> findViolatingSlots(@Param("timeLimit") Instant timeLimit);
}