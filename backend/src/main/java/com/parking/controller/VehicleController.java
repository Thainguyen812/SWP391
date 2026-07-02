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
import com.parking.repository.VipSubscriptionRepository;

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
private final VipSubscriptionRepository vipSubscriptionRepository;

public VehicleController(
        VehicleRepository repo,
        UserRepository userRepo,
        VipSubscriptionRepository vipSubscriptionRepository) {

this.repo = repo;
this.userRepo = userRepo;
this.vipSubscriptionRepository = vipSubscriptionRepository;
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



    private void validateBrand(String brand) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new RuntimeException("Tên xe không được để trống.");
        }
        
        // 1. Kiểm tra không dấu (no accents)
        if (!brand.matches("^[a-zA-Z0-9\\s-]+$")) {
            throw new RuntimeException("Tên xe không được phép chứa dấu tiếng Việt hoặc ký tự đặc biệt.");
        }
        
        // 2. Kiểm tra hãng xe hợp lệ trên thị trường
        String upper = brand.toUpperCase();
        java.util.List<String> validBrands = java.util.List.of(
            "TOYOTA", "HONDA", "VINFAST", "MAZDA", "MERCEDES", "BMW", "HYUNDAI", "KIA", "FORD", 
            "AUDI", "LEXUS", "PORSCHE", "MITSUBISHI", "CHEVROLET", "NISSAN", "SUZUKI", "PEUGEOT", 
            "VOLVO", "LAND", "JAGUAR", "TESLA", "VOLKSWAGEN", "SUBARU", "MG", "BYD", "JEEP", 
            "ROLLS", "BENTLEY", "MINI", "FIAT", "FERRARI", "LAMBORGHINI", "ASTON", "MASERATI"
        );
        
        boolean isValid = false;
        for (String vb : validBrands) {
            if (upper.contains(vb)) {
                isValid = true;
                break;
            }
        }
        
        if (!isValid) {
            throw new RuntimeException("Hãng xe/Dòng xe không tồn tại trên thị trường hoặc không hợp lệ.");
        }
    }

    //ĐĂNG KÝ XE MỚI 
    @PostMapping
    public Vehicle create(@Valid @RequestBody VehicleRegistrationRequest request) {
        validateBrand(request.getBrand());
    
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
    vehicle.setRegistrationDocUrl(request.getRegistrationDocUrl());
    vehicle.setRegistrationPhotoUrl(request.getRegistrationPhotoUrl());

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
        validateBrand(request.getBrand());
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
        existing.setRegistrationDocUrl(request.getRegistrationDocUrl());
        existing.setRegistrationPhotoUrl(request.getRegistrationPhotoUrl());

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

            // Chỉ cho phép khóa xe nếu xe đó đã đăng ký VIP và gói cước đang ACTIVE
            Optional<com.parking.model.VipSubscription> vipSub = vipSubscriptionRepository
                    .findByVehicleIdAndStatus(v.getId(), com.parking.model.VipSubscription.Status.ACTIVE);
            if (vipSub.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "Chỉ phương tiện có gói VIP đang hoạt động mới được sử dụng tính năng khóa xe!"));
            }

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
