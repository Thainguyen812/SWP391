package com.parking.repository;

import com.parking.model.ShiftHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftHistoryRepository extends JpaRepository<ShiftHistory, Long> {
    List<ShiftHistory> findAllByOrderByStartTimeDesc();

    Optional<ShiftHistory> findByIsCurrentTrue();
}
