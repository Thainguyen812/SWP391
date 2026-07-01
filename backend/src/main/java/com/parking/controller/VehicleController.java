package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import com.parking.dto.VehicleRegistrationRequest;
import com.parking.model.User;
import com.parking.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleRepository repo;

    @Autowired
    private UserRepository userRepo;
    public VehicleController(VehicleRepository repo){ this.repo = repo; }

    @GetMapping
    public java.util.Map<String, Object> all() { 
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> ownerOpt = userRepo.findByUsername(username);
        List<Map<String, Object>> mapped = new java.util.ArrayList<>();
        
        if (ownerOpt.isPresent()) {
            for (Vehicle v : repo.findByOwnerId(ownerOpt.get().getId())) {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", v.getId());
                map.put("plate", v.getLicensePlate());
                map.put("name", v.getBrand() != null ? v.getBrand() : "Xe của tôi");
                map.put("type", v.getVehicleSize());
                map.put("isLocked", v.isLocked());
                mapped.add(map);
            }
        }
        return java.util.Map.of("success", true, "data", mapped);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> get(@PathVariable UUID id){ // SỬA THÀNH UUID
        Optional<Vehicle> v = repo.findById(id);
        return v.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vehicle create(@Valid @RequestBody VehicleRegistrationRequest request) {
        // 1. Đọc thông tin từ Spring Security (giải mã token JWT của tài xế đang đăng nhập)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        // 2. Tìm User tương ứng dưới DB
        User owner = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        // 3. Kiểm tra trùng biển số
        if (repo.findByLicensePlate(request.getLicensePlate()).isPresent()) {
            throw new RuntimeException("Biển số xe đã được đăng ký.");
        }                
        Vehicle vehicle = new Vehicle();
        vehicle.setId(UUID.randomUUID());
        
        // 4. TỰ ĐỘNG GÁN CHỦ XE LÀ NGƯỜI ĐANG ĐĂNG NHẬP 
        vehicle.setOwnerId(owner.getId()); // <=== ĐÃ XỬ LÝ Ở ĐÂY!
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setVehicleSize(request.getVehicleSize());
        vehicle.setColor(request.getColor());
        vehicle.setColorRgb(request.getColorRgb());
        vehicle.setBodyShape(request.getBodyShape());
        vehicle.setBrand(request.getBrand());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setViolationCount(0);
        vehicle.setActive(true);
        vehicle.setCreatedAt(Instant.now());
        vehicle.setUpdatedAt(Instant.now());
        return repo.save(vehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable UUID id, @RequestBody Vehicle vehicle){ // SỬA THÀNH UUID
        return repo.findById(id).map(existing -> {
            vehicle.setId(existing.getId());
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
        public String getPlate() { return plate; }
        public void setPlate(String plate) { this.plate = plate; }
        public Boolean getIsLocked() { return isLocked; }
        public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
    }
}
// Trigger VS Code Build
