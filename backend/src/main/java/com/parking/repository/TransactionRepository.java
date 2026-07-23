package com.parking.repository;

import com.parking.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import java.util.List;

// phần 1 / check out task 5

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findBySessionId(UUID sessionId);

    @Query(value = "SELECT calculate_parking_fee(CAST(:vehicleSize AS varchar), CAST(:checkIn AS timestamp), CAST(:checkOut AS timestamp))", nativeQuery = true)
    BigDecimal calculateParkingFee(@Param("vehicleSize") String vehicleSize,
            @Param("checkIn") Instant checkIn,
            @Param("checkOut") Instant checkOut);

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM Transaction t WHERE t.paymentStatus = :status")
    BigDecimal sumTotalRevenueByStatus(@Param("status") Transaction.PaymentStatus status);

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM Transaction t WHERE t.paymentStatus = :status AND DATE(t.processedAt) = DATE(:date)")
    BigDecimal sumTotalRevenueByStatusAndDate(@Param("status") Transaction.PaymentStatus status, @Param("date") Instant date);

    @Query(value = """
            SELECT
                DATE(processed_at) AS revenue_date,
                SUM(total_amount) AS revenue
            FROM transactions
            WHERE payment_status = 'SUCCESS'
            GROUP BY DATE(processed_at)
            ORDER BY DATE(processed_at)
            """, nativeQuery = true)
    List<Object[]> getRevenueByDay();
}