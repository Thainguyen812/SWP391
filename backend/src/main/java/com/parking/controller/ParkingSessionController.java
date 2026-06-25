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
