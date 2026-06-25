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

    public ParkingSessionController(ParkingSessionRepository repo, VehicleRepository vehicleRepo, ZoneRepository zoneRepo, TransactionRepository transactionRepo) {
        this.repo = repo;
        this.vehicleRepo = vehicleRepo;
        this.zoneRepo = zoneRepo;
        this.transactionRepo = transactionRepo;
    }

    @PostMapping("/simulate-traffic")
    public ResponseEntity<?> simulateTraffic() {
        boolean isCheckIn = Math.random() > 0.4;
        
        if (isCheckIn) {
            ParkingSession session = new ParkingSession();
            session.setId(UUID.randomUUID());
            String[] prefixes = {"51A", "51F", "51G", "51H", "51K", "29A", "30E", "30G"};
            String prefix = prefixes[(int)(Math.random() * prefixes.length)];
            int number = 10000 + (int)(Math.random() * 90000);
            session.setLicensePlate(prefix + "-" + number + ".SIM");
            session.setCheckInTime(Instant.now());
            session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
            
            if (Math.random() < 0.1) {
                session.setIsSuspicious(true);
                session.setSuspiciousReason("Cảnh báo: Xe có dấu hiệu vi phạm (Mô phỏng)");
            }
            
            List<Zone> zones = zoneRepo.findAll();
            if (!zones.isEmpty()) {
                session.setAssignedZoneId(zones.get((int)(Math.random() * zones.size())).getId());
            } else {
                session.setAssignedZoneId(UUID.randomUUID());
            }
            
            repo.save(session);
            return ResponseEntity.ok(java.util.Map.of("action", "CHECK_IN", "plate", session.getLicensePlate()));
        } else {
            List<ParkingSession> activeSessions = repo.findAll().stream()
                .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE && s.getLicensePlate().endsWith(".SIM"))
                .collect(Collectors.toList());
                
            if (!activeSessions.isEmpty()) {
                ParkingSession session = activeSessions.get((int)(Math.random() * activeSessions.length));
                session.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
                session.setCheckOutTime(Instant.now());
                repo.save(session);
                
                Transaction t = new Transaction();
                t.setId(UUID.randomUUID());
                t.setSessionId(session.getId());
                t.setTotalAmount(new BigDecimal("15000"));
                t.setPaymentMethod(Transaction.PaymentMethod.CASH);
                t.setPaymentStatus(Transaction.PaymentStatus.SUCCESS);
                t.setProcessedAt(Instant.now());
                t.setIsMobileCheckout(false);
                transactionRepo.save(t);
                
                return ResponseEntity.ok(java.util.Map.of("action", "CHECK_OUT", "plate", session.getLicensePlate()));
            }
            return ResponseEntity.ok(java.util.Map.of("action", "NONE", "message", "No simulated active sessions to checkout"));
        }
    }

    private ParkingSessionDto convertToDto(ParkingSession session) {
        Vehicle vehicle = null;
        if (session.getLicensePlate() != null) {
            vehicle = vehicleRepo.findByLicensePlate(session.getLicensePlate()).orElse(null);
        }
        return new ParkingSessionDto(session, vehicle);
    }

    @GetMapping
    public List<ParkingSessionDto> all() {
        return repo.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingSessionDto> get(@PathVariable UUID id){
        Optional<ParkingSession> s = repo.findById(id);
        return s.map(this::convertToDto).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ParkingSession create(@RequestBody ParkingSession s){ return repo.save(s); }

    @PutMapping("/{id}")
    public ResponseEntity<ParkingSession> update(@PathVariable UUID id, @RequestBody ParkingSession s){
        return repo.findById(id).map(existing -> {
            s.setId(existing.getId());
            return ResponseEntity.ok(repo.save(s));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/daily-volume")
    public ResponseEntity<?> getDailyVolume() {
        java.time.LocalDate today = java.time.LocalDate.now();
        long count = repo.findAll().stream()
            .filter(s -> s.getCheckInTime() != null && s.getCheckInTime().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(today))
            .count();
        return ResponseEntity.ok(java.util.Map.of("volume", count));
    }
}
