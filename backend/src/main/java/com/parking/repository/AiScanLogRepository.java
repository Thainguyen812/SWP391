package com.parking.repository;

import com.parking.model.AiScanLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AiScanLogRepository extends JpaRepository<AiScanLog, UUID> {
    List<AiScanLog> findByDetectedPlateOrderByScannedAtDesc(String detectedPlate);
}
