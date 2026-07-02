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

import com.parking.dto.VehicleRegistrationRequest;
import com.parking.model.User;
import com.parking.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Principal;
import java.time.Instant;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {


private final VehicleRepository repo;
private final UserRepository userRepo;

public VehicleController(
        VehicleRepository repo,
        UserRepository userRepo) {

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
            map.put("bodyShape", v.getBodyShape());
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



    //ĐĂNG KÝ XE MỚI 
    @PostMapping
    public Vehicle create(@Valid @RequestBody VehicleRegistrationRequest request) {
    
        // KTRA XEM BIỂN SỐ XE NÀY ĐÃ DC ĐĂNG KÝ CHƯA 
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String username = authentication.getName();

    User owner = userRepo
            .findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException("User không tồn tại"));

    if (repo.findByLicensePlate(request.getLicensePlate()).isPresent()) {
        throw new RuntimeException("Biển số xe đã được đăng ký.");
}                
    Vehicle vehicle = new Vehicle();

    vehicle.setId(UUID.randomUUID());

    vehicle.setOwnerId(owner.getId());

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

//SỬA THÔNG TIN XE 
    @PutMapping("/{id}") // chỉ sửa dc những thông tin của vehicle bên post
    public ResponseEntity<Vehicle> update(
        @PathVariable UUID id,
        @Valid @RequestBody VehicleRegistrationRequest request) {

    return repo.findById(id).map(existing -> {
    // ktra xem có đúng tk đăng nhập đang sửa xe của họ ko , ko thì ko cho
        Authentication authentication =
        SecurityContextHolder.getContext().getAuthentication();

    String username = authentication.getName();

    User currentUser = userRepo
        .findByUsername(username)
        .orElseThrow(() ->
                new RuntimeException("User không tồn tại."));

        if (currentUser.getRole() == User.Role.DRIVER && !existing.getOwnerId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền sửa xe này.");
        }        
    
        // Kiểm tra biển số xe đã tồn tại chưa
    Optional<Vehicle> duplicate =
        repo.findByLicensePlate(request.getLicensePlate());

    if (duplicate.isPresent()
        && !duplicate.get().getId().equals(existing.getId())) {

    throw new RuntimeException("Biển số xe đã tồn tại.");
    }    
        existing.setLicensePlate(request.getLicensePlate());
        existing.setVehicleSize(request.getVehicleSize());
        existing.setColor(request.getColor());
        existing.setColorRgb(request.getColorRgb());
        existing.setBodyShape(request.getBodyShape());
        existing.setBrand(request.getBrand());
        existing.setFuelType(request.getFuelType());

        existing.setUpdatedAt(Instant.now());

        return ResponseEntity.ok(repo.save(existing));

    }).orElseGet(() -> ResponseEntity.notFound().build());
}
//LẤY THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP
@DeleteMapping("/{id}")
public ResponseEntity<?> delete(@PathVariable UUID id){
    return repo.findById(id).map(vehicle -> {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

User currentUser = userRepo
        .findByUsername(username)
        .orElseThrow(() ->
                new RuntimeException("User không tồn tại."));
        
        // KIỂM TRA NGƯỜI ĐĂNG NHẬP CÓ PHẢI CHỦ XE KHÔNG (CHỈ GIỚI HẠN DRIVER)
        if (currentUser.getRole() == User.Role.DRIVER && !vehicle.getOwnerId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa xe này.");
        }

        repo.delete(vehicle);


        return ResponseEntity.noContent().build();

    }).orElseGet(() -> ResponseEntity.notFound().build());
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
