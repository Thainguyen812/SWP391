package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.Vehicle;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.dto.ParkingSessionDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
public class ParkingSessionController {
    private final ParkingSessionRepository repo;
    private final VehicleRepository vehicleRepo;

    public ParkingSessionController(ParkingSessionRepository repo, VehicleRepository vehicleRepo) {
        this.repo = repo;
        this.vehicleRepo = vehicleRepo;
    }

    // 🟢 ĐÃ FIX LỖI ĐỎ: Tìm trực tiếp bằng vehicleId có sẵn trong Entity
    private ParkingSessionDto convertToDto(ParkingSession session) {
        Vehicle vehicle = null;

        // 1. Kiểm tra nếu có vehicleId thì tìm bằng ID (Luôn nhanh nhất)
        if (session.getVehicleId() != null) {
            vehicle = vehicleRepo.findById(session.getVehicleId()).orElse(null);
        }

        // 2. Dự phòng: Nếu không tìm thấy bằng ID thì mới tìm theo Biển số xe
        if (vehicle == null && session.getLicensePlate() != null) {
            vehicle = vehicleRepo.findByLicensePlate(session.getLicensePlate()).orElse(null);
        }
        return new ParkingSessionDto(session, vehicle);
    }

    @GetMapping
    public List<ParkingSessionDto> all() {
        return repo.findAllWithVehicle().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingSessionDto> get(@PathVariable UUID id) {
        Optional<ParkingSession> s = repo.findById(id);
        return s.map(this::convertToDto).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ParkingSession create(@RequestBody ParkingSession s) {
        return repo.save(s);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParkingSession> update(@PathVariable UUID id, @RequestBody ParkingSession s) {
        return repo.findById(id).map(existing -> {
            s.setId(existing.getId());
            return ResponseEntity.ok(repo.save(s));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
