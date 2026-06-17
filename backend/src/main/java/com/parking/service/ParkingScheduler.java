package com.parking.service;

import com.parking.model.ParkingSlot;
import com.parking.model.ParkingViolation;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ParkingViolationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ParkingScheduler {

    private final ParkingSlotRepository slotRepository;
    private final ParkingViolationRepository violationRepository;

    public ParkingScheduler(ParkingSlotRepository slotRepository, ParkingViolationRepository violationRepository) {
        this.slotRepository = slotRepository;
        this.violationRepository = violationRepository;
    }

    // Chạy mỗi 60 giây để dễ test (khi nào nộp bài thì sửa thành 900000)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkEVChargingViolations() {
        // Lấy thời điểm 15 phút trước
        Instant limitTime = Instant.now().minus(15, ChronoUnit.MINUTES);

        // Truy vấn danh sách vi phạm
        List<ParkingSlot> violations = slotRepository.findViolatingSlots(limitTime);

        for (ParkingSlot slot : violations) {
            ParkingViolation violation = new ParkingViolation();
            violation.setSlotId(slot.getId());
            violation.setReason("Đỗ xe tại vị trí sạc nhưng không sạc quá 15 phút.");
            violation.setCreatedAt(Instant.now());
            violation.setStatus("PENDING");

            violationRepository.save(violation);
        }
    }
}