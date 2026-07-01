package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.Vehicle;
import com.parking.model.Transaction;
import com.parking.model.Zone;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.TransactionRepository;
import com.parking.repository.ZoneRepository;
import com.parking.dto.ParkingSessionDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Instant;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/sessions")
public class ParkingSessionController {
    private final ParkingSessionRepository repo;
    private final VehicleRepository vehicleRepo;
    private final ZoneRepository zoneRepo;
    private final TransactionRepository transactionRepo;

    public ParkingSessionController(ParkingSessionRepository repo, VehicleRepository vehicleRepo,
            ZoneRepository zoneRepo, TransactionRepository transactionRepo) {
        this.repo = repo;
        this.vehicleRepo = vehicleRepo;
        this.zoneRepo = zoneRepo;
        this.transactionRepo = transactionRepo;
    }

    private ParkingSessionDto convertToDto(ParkingSession session) {
        Vehicle vehicle = null;
        if (session.getLicensePlate() != null) {
            vehicle = vehicleRepo.findByLicensePlate(session.getLicensePlate()).orElse(null);
        }
        return new ParkingSessionDto(session, vehicle);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public List<ParkingSessionDto> all() {
        List<ParkingSession> sessions = repo.findAll();
        List<String> plates = sessions.stream()
                .map(ParkingSession::getLicensePlate)
                .filter(plate -> plate != null)
                .distinct()
                .collect(Collectors.toList());

        java.util.Map<String, Vehicle> vehicleMap = new java.util.HashMap<>();
        if (!plates.isEmpty()) {
            vehicleRepo.findAll().stream()
                    .filter(v -> plates.contains(v.getLicensePlate()))
                    .forEach(v -> vehicleMap.put(v.getLicensePlate(), v));
        }

        return sessions.stream().map(session -> {
            Vehicle vehicle = null;
            if (session.getLicensePlate() != null) {
                vehicle = vehicleMap.get(session.getLicensePlate());
            }
            return new ParkingSessionDto(session, vehicle);
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionDto> get(@PathVariable UUID id) {
        Optional<ParkingSession> s = repo.findById(id);
        return s.map(this::convertToDto).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. Tạo thủ công phiên đỗ xe (Khóa chặt cho cấp quản lý để chống gian lận)
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ParkingSession create(@RequestBody ParkingSession s) {
        return repo.save(s);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSession> update(@PathVariable UUID id, @RequestBody ParkingSession s) {
        return repo.findById(id).map(existing -> {
            s.setId(existing.getId());
            return ResponseEntity.ok(repo.save(s));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 5. Xóa lịch sử phiên đỗ xe (Tác vụ tối nguy hiểm, chỉ ADMIN được làm)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Phê duyệt cưỡng chế mở barrier cho xe vào bốt (Dành cho nhân viên vận hành
    // trực ca)
    @PostMapping("/approve-entry")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<?> approveEntry(@RequestBody java.util.Map<String, String> payload) {
        String plate = payload.get("plate");
        Optional<ParkingSession> s = repo.findByLicensePlateAndSessionStatus(plate,
                ParkingSession.SessionStatus.ACTIVE);
        if (s.isPresent()) {
            ParkingSession session = s.get();
            session.setEntryGate(null); // Clear the entry gate, car goes inside
            repo.save(session);
            return ResponseEntity.ok(java.util.Collections.singletonMap("success", true));
        }
        return ResponseEntity.badRequest().body("Session not found");
    }

    // 7. Xem thống kê lưu lượng xe trong ngày (Chỉ dành cho Manager và Admin xem
    // báo cáo)
    @GetMapping("/daily-volume")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> getDailyVolume() {
        java.time.LocalDate today = java.time.LocalDate.now();
        long inToday = repo.findAll().stream()
                .filter(s -> s.getCheckInTime() != null
                        && s.getCheckInTime().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(today))
                .count();
        long outToday = repo.findAll().stream()
                .filter(s -> s.getCheckOutTime() != null
                        && s.getCheckOutTime().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(today))
                .count();

        long totalVolume = inToday + outToday;

        return ResponseEntity.ok(java.util.Map.of("volume", totalVolume));
    }
}
