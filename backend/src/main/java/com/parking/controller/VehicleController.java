package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
    public java.util.Map<String, Object> all(Principal principal){ 
        List<Vehicle> list;
        if (principal == null) {
            list = repo.findAll();
        } else {
            String username = principal.getName();
            Optional<User> u = userRepo.findByUsername(username);
            if (u.isPresent()) {
                list = repo.findByOwnerId(u.get().getId());
            } else {
                list = List.of();
            }
        }

        List<java.util.Map<String, Object>> mapped = new java.util.ArrayList<>();
        for (Vehicle v : list) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", v.getId());
            map.put("plate", v.getLicensePlate());
            map.put("name", v.getBrand() != null ? v.getBrand() : "Xe của tôi");
            map.put("type", v.getVehicleSize());
            map.put("isLocked", v.isLocked());
            mapped.add(map);
        }
        return java.util.Map.of("success", true, "data", mapped);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> get(@PathVariable UUID id) { // SỬA THÀNH UUID
        Optional<Vehicle> v = repo.findById(id);
        return v.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle) {
        if (vehicle.getCreatedAt() == null) {
            vehicle.setCreatedAt(java.time.Instant.now());
        }
        if (vehicle.getUpdatedAt() == null) {
            vehicle.setUpdatedAt(java.time.Instant.now());
        }
        return repo.save(vehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable UUID id, @RequestBody Vehicle vehicle) { // SỬA THÀNH UUID
        Optional<Vehicle> existingOpt = repo.findById(id);
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
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) { // SỬA THÀNH UUID
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lock")
    public ResponseEntity<?> lockVehicle(@RequestBody VehicleLockRequest request) {
        boolean isLocked = request.getIsLocked() != null && request.getIsLocked();

        Optional<Vehicle> optVehicle = repo.findByLicensePlate(request.getPlate());
        if (optVehicle.isPresent()) {
            Vehicle v = optVehicle.get();
            v.setLocked(isLocked);
            repo.save(v);
        }

        String msg = isLocked ? "Kích hoạt radar khóa bánh thành công cho xe " + request.getPlate() + "!"
                : "Đã mở khóa an ninh cho xe " + request.getPlate() + ". Xe có thể xuất bãi!";
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", msg));
    }

    public static class VehicleLockRequest {
        private String plate;
        private Boolean isLocked;

        public String getPlate() {
            return plate;
        }

        public void setPlate(String plate) {
            this.plate = plate;
        }

        public Boolean getIsLocked() {
            return isLocked;
        }

        public void setIsLocked(Boolean isLocked) {
            this.isLocked = isLocked;
        }
    }
}
// Trigger VS Code Build
