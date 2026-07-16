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

    @Query(value = "SELECT COUNT(v.id) FROM parking_violations v INNER JOIN parking_sessions s ON v.session_id = s.id WHERE s.vehicle_id = :vehicleId", nativeQuery = true)
    long countByVehicleId(@Param("vehicleId") UUID vehicleId);

    @Query(value = "SELECT COUNT(v.id) FROM parking_violations v INNER JOIN parking_sessions s ON v.session_id = s.id WHERE s.license_plate = :licensePlate", nativeQuery = true)
    long countByLicensePlate(@Param("licensePlate") String licensePlate);

    List<ParkingViolation> findBySessionIdAndStatus(UUID sessionId, String status);
}
