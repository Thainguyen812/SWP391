package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import java.security.Principal;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleRepository repo;
    private final UserRepository userRepo;

    public VehicleController(VehicleRepository repo, UserRepository userRepo){ 
        this.repo = repo; 
        this.userRepo = userRepo;
    }

    @GetMapping
    public List<Vehicle> all(Principal principal){ 
        if (principal == null) {
            return repo.findAll();
        }
        String username = principal.getName();
        Optional<User> u = userRepo.findByUsername(username);
        if (u.isPresent()) {
            return repo.findByOwnerId(u.get().getId());
        }
        return List.of();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> get(@PathVariable UUID id){ // SỬA THÀNH UUID
        Optional<Vehicle> v = repo.findById(id);
        return v.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle){ 
        if (vehicle.getCreatedAt() == null) {
            vehicle.setCreatedAt(java.time.Instant.now());
        }
        if (vehicle.getUpdatedAt() == null) {
            vehicle.setUpdatedAt(java.time.Instant.now());
        }
        return repo.save(vehicle); 
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable String id, @RequestBody Vehicle vehicle){
        UUID uuid = null;
        try {
            uuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            // ID is not a valid UUID (e.g. mock ID "veh-1")
        }

        Optional<Vehicle> existingOpt = Optional.empty();
        if (uuid != null) {
            existingOpt = repo.findById(uuid);
        }
        
        if (existingOpt.isEmpty() && vehicle.getLicensePlate() != null) {
            existingOpt = repo.findByLicensePlate(vehicle.getLicensePlate());
        }

        return existingOpt.map(existing -> {
            vehicle.setId(existing.getId());
            if (vehicle.getCreatedAt() == null) {
                vehicle.setCreatedAt(existing.getCreatedAt() != null ? existing.getCreatedAt() : java.time.Instant.now());
            }
            vehicle.setUpdatedAt(java.time.Instant.now());
            return ResponseEntity.ok(repo.save(vehicle));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){ // SỬA THÀNH UUID
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lock")
    public ResponseEntity<?> lockVehicle(@RequestBody VehicleLockRequest request) {
        boolean isLocked = request.getIsLocked() != null && request.getIsLocked();
        String msg = isLocked ? "Kich hoat radar khoa banh thanh cong cho xe " + request.getPlate() + "!" 
                              : "Da mo khoa an ninh cho xe " + request.getPlate() + ". Xe co the xuat bai!";
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", msg));
    }

    public static class VehicleLockRequest {
        private String plate;
        private Boolean isLocked;
        public String getPlate() { return plate; }
        public void setPlate(String plate) { this.plate = plate; }
        public Boolean getIsLocked() { return isLocked; }
        public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
    }
}
// Trigger VS Code Build
