package com.parking.service;

import com.parking.model.*;
import com.parking.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ParkingScheduler {

    private final ParkingSlotRepository slotRepository;
    private final ParkingViolationRepository violationRepository;
    private final ParkingSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final AuditLogRepository auditLogRepository;

    public ParkingScheduler(ParkingSlotRepository slotRepository,
            ParkingViolationRepository violationRepository,
            ParkingSessionRepository sessionRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            AuditLogRepository auditLogRepository) {
        this.slotRepository = slotRepository;
        this.violationRepository = violationRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkEVChargingViolations() {
        UUID tempAdminId = userRepository.findByUsername("admin")
                .map(User::getId)
                .orElse(null);

        if (tempAdminId == null) {
            // Fallback to a hardcoded Admin UUID if admin user is not in DB
            tempAdminId = UUID.fromString("a0000000-0000-0000-0000-000000000002");
        }
        final UUID adminId = tempAdminId;

        // 2. Lấy thời điểm 15 phút trước
        Instant limitTime = Instant.now().minus(15, ChronoUnit.MINUTES);

        // 3. Quét các ô sạc đang OCCUPIED
        List<ParkingSlot> evSlots = slotRepository.findAll().stream()
                .filter(s -> "OCCUPIED".equals(s.getSlotStatus()) && s.getEvChargerId() != null)
                .toList();

        for (ParkingSlot slot : evSlots) {
            // Tìm phiên xe ACTIVE tại ô đỗ đó
            sessionRepository.findByParkedSlotIdAndSessionStatus(slot.getId(), ParkingSession.SessionStatus.ACTIVE)
                    .ifPresent(session -> {
                        // Kiểm tra xem đã ghi nhận vi phạm cho phiên này chưa
                        if (violationRepository.existsBySessionIdAndViolationType(session.getId(), "EV_ZONE_MISUSE")) {
                            return;
                        }

                        // Tìm xe để xác định loại động cơ (GASOLINE vs ELECTRIC)
                        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(session.getLicensePlate());
                        if (vehicleOpt.isPresent()) {
                            Vehicle vehicle = vehicleOpt.get();
                            boolean isViolation = false;
                            String notes = "";

                            if ("GASOLINE".equals(vehicle.getFuelType())) {
                                // Xe xăng chiếm ô sạc: Vi phạm ngay lập tức!
                                isViolation = true;
                                notes = "Động cơ GASOLINE chiếm dụng vị trí sạc xe điện.";
                            } else if ("ELECTRIC".equals(vehicle.getFuelType())) {
                                // Xe điện đỗ nhưng không sạc > 15 phút (dựa vào lastUpdated của slot)
                                if (slot.getLastUpdated() != null && slot.getLastUpdated().isBefore(limitTime)) {
                                    isViolation = true;
                                    notes = "Đỗ xe điện tại vị trí sạc nhưng không sạc quá 15 phút.";
                                }
                            }

                            if (isViolation) {
                                final UUID finalAdminId = adminId;
                                final String finalNotes = notes;
                                long historyViolations = violationRepository.countByVehicleId(vehicle.getId());
                                boolean firstViolation = historyViolations == 0;
                                // 1. Lưu bản ghi vi phạm vào DB
                                ParkingViolation violation = new ParkingViolation();
                                violation.setSessionId(session.getId());
                                violation.setSlotId(slot.getId());
                                violation.setDetectedBy(finalAdminId);
                                violation.setDetectedAt(Instant.now());
                                violation.setViolationType("EV_ZONE_MISUSE");
                                violation.setNotes(finalNotes);
                                violation.setStatus("PENDING");
                                violation.setFirstViolation(firstViolation);

                                violationRepository.save(violation);

                                if (firstViolation) {
                                    vehicle.setViolationCount(1);
                                } else {
                                    vehicle.setViolationCount(vehicle.getViolationCount() + 1);
                                }
                                vehicleRepository.save(vehicle);

                                // 2. Ghi nhận hành động vào audit log
                                AuditLog audit = new AuditLog();
                                audit.setId(UUID.randomUUID());
                                audit.setUserId(finalAdminId);
                                audit.setActionType("EV_ZONE_MISUSE");
                                audit.setEntityType("parking_sessions");
                                audit.setEntityId(session.getId());
                                audit.setNewValue("{\"violationType\":\"EV_ZONE_MISUSE\",\"notes\":\"" + finalNotes + "\"}");
                                audit.setCreatedAt(Instant.now());

                                auditLogRepository.save(audit);
                            }
                        }
                    });
        }
    }
}
