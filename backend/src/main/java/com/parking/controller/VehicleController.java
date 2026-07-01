package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
public class VehicleController {
    private final VehicleRepository repo;

    public VehicleController(VehicleRepository repo) {
        this.repo = repo;
    }

    @GetMapping
<<<<<<< Updated upstream
    public List<Vehicle> all() {
        return repo.findAll();
=======
    public java.util.Map<String, Object> all() {
        List<Map<String, Object>> mapped = new java.util.ArrayList<>();
        for (Vehicle v : repo.findAll()) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", v.getId());
            map.put("plate", v.getLicensePlate());
            map.put("name", v.getBrand() != null ? v.getBrand() : "Xe của tôi");
            map.put("type", v.getVehicleSize());
            map.put("isLocked", v.isLocked());
            mapped.add(map);
        }
        return java.util.Map.of("success", true, "data", mapped);
>>>>>>> Stashed changes
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> get(@PathVariable UUID id) { // SỬA THÀNH UUID
        Optional<Vehicle> v = repo.findById(id);
        return v.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle) {
        return repo.save(vehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable UUID id, @RequestBody Vehicle vehicle) { // SỬA THÀNH UUID
        return repo.findById(id).map(existing -> {
            vehicle.setId(existing.getId());
            return ResponseEntity.ok(repo.save(vehicle));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
<<<<<<< Updated upstream
=======
    @PreAuthorize("hasRole('MANAGER')")
>>>>>>> Stashed changes
    public ResponseEntity<Void> delete(@PathVariable UUID id) { // SỬA THÀNH UUID
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
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
