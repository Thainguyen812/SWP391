package com.parking.repository;

import com.parking.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

// phần 1 / check out task 5

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findBySessionId(UUID sessionId);

    @Query(value = "SELECT calculate_parking_fee(CAST(:vehicleSize AS varchar), CAST(:checkIn AS timestamp), CAST(:checkOut AS timestamp))", nativeQuery = true)
    BigDecimal calculateParkingFee(@Param("vehicleSize") String vehicleSize,
            @Param("checkIn") Instant checkIn,
            @Param("checkOut") Instant checkOut);
}