package com.parking.service;

import com.parking.model.*;
import com.parking.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class ParkingScheduler {

    private final ParkingSlotRepository slotRepository;
    private final ParkingViolationRepository violationRepository;
    private final ParkingSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public ParkingScheduler(ParkingSlotRepository slotRepository,
            ParkingViolationRepository violationRepository,
            ParkingSessionRepository sessionRepository,
            UserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.violationRepository = violationRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkEVChargingViolations() {
        // 1. Lấy ID Admin để gán vào trường detectedBy (làm 1 lần duy nhất)
        UUID adminId = userRepository.findByUsername("admin")
                .map(User::getId)
                .orElse(null);

        if (adminId == null)
            return; // Nếu chưa có admin thì không chạy logic vi phạm

        // 2. Lấy thời điểm 15 phút trước
        Instant limitTime = Instant.now().minus(15, ChronoUnit.MINUTES);

        // 3. Truy vấn các ô sạc đang vi phạm
        List<ParkingSlot> violations = slotRepository.findViolatingSlots(limitTime);

        for (ParkingSlot slot : violations) {
            // 4. Tìm phiên xe ACTIVE tại ô đỗ đó
            sessionRepository.findByParkedSlotIdAndSessionStatus(slot.getId(), ParkingSession.SessionStatus.ACTIVE)
                    .ifPresent(session -> {
                        // 5. Tạo và lưu bản ghi vi phạm đầy đủ thông tin
                        ParkingViolation violation = new ParkingViolation();
                        violation.setSessionId(session.getId());
                        violation.setSlotId(slot.getId());
                        violation.setDetectedBy(adminId);
                        violation.setDetectedAt(Instant.now());
                        violation.setViolationType("EV_ZONE_MISUSE");
                        violation.setReason("Đỗ xe tại vị trí sạc nhưng không sạc quá 15 phút.");
                        violation.setStatus("PENDING");

                        violationRepository.save(violation);
                    });
        }
    }
}