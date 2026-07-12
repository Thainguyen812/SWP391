package com.parking.repository;

import com.parking.model.ParkingViolation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ParkingViolationRepository extends JpaRepository<ParkingViolation, UUID> {
    boolean existsBySessionIdAndViolationType(UUID sessionId, String violationType);

    @Query("SELECT COUNT(v) FROM ParkingViolation v, ParkingSession s WHERE v.sessionId = s.id AND s.vehicleId = :vehicleId")
    long countByVehicleId(@Param("vehicleId") UUID vehicleId);

    List<ParkingViolation> findBySessionIdAndStatus(UUID sessionId, String status);
}
