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
import com.parking.model.ParkingSession;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.SecurityAlertRepository;
import com.parking.model.SecurityAlert;
import com.parking.service.DemoVehicleDataset;

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
private final ParkingSessionRepository sessionRepo;
private final SecurityAlertRepository securityAlertRepository;

public VehicleController(
        VehicleRepository repo,
        UserRepository userRepo,
        VipSubscriptionRepository vipSubscriptionRepository,
        ParkingSessionRepository sessionRepo,
        SecurityAlertRepository securityAlertRepository) {

this.repo = repo;
this.userRepo = userRepo;
this.vipSubscriptionRepository = vipSubscriptionRepository;
this.sessionRepo = sessionRepo;
this.securityAlertRepository = securityAlertRepository;
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
            String normalizedPlate = DemoVehicleDataset.normalizePlate(v.getLicensePlate());
            Optional<DemoVehicleDataset.Profile> profileOpt = DemoVehicleDataset.findByPlate(normalizedPlate);
            String resolvedType = DemoVehicleDataset.resolveVehicleType(normalizedPlate, v.getVehicleSize());
            String resolvedFuelType = DemoVehicleDataset.resolveFuelType(normalizedPlate, v.getFuelType());
            String resolvedImageUrl = DemoVehicleDataset.resolveImageUrl(normalizedPlate, "DRIVER_CARD", v.getRegistrationPhotoUrl());
            map.put("id", v.getId());
            map.put("plate", normalizedPlate);
            map.put("name", v.getBrand() != null ? v.getBrand() : "Xe của tôi");
            map.put("name", profileOpt.map(DemoVehicleDataset.Profile::model)
                    .orElse(v.getBrand() != null ? v.getBrand() : "Xe cua toi"));
            map.put("type", resolvedType);
            map.put("bodyShape", profileOpt.map(DemoVehicleDataset.Profile::bodyShape).orElse(v.getBodyShape()));
            map.put("fuelType", resolvedFuelType);
            map.put("imageUrl", resolvedImageUrl);
            map.put("zoneCode", DemoVehicleDataset.resolveZoneCode(normalizedPlate, resolvedType));
            map.put("color", profileOpt.map(DemoVehicleDataset.Profile::color).orElse(v.getColor()));
            map.put("colorRgb", profileOpt.map(DemoVehicleDataset.Profile::colorRgb).orElse(v.getColorRgb()));
            map.put("isLocked", v.isLocked());
            map.put("isActive", v.isActive());
            map.put("registrationDocUrl", profileOpt.map(DemoVehicleDataset.Profile::registrationDocUrl).orElse(v.getRegistrationDocUrl()));
            map.put("registrationPhotoUrl", profileOpt.map(DemoVehicleDataset.Profile::registrationPhotoUrl).orElse(resolvedImageUrl));
            map.put("identityDocUrl", profileOpt.map(DemoVehicleDataset.Profile::identityDocUrl).orElse(null));
            map.put("createdAt", v.getCreatedAt() != null ? v.getCreatedAt().toString() : null);
            
            // Add VIP subscription details
            List<com.parking.model.VipSubscription> subs = vipSubscriptionRepository.findByVehicleIdOrderByCreatedAtDesc(v.getId());
            if (subs != null && !subs.isEmpty()) {
                com.parking.model.VipSubscription latestSub = subs.get(0);
                map.put("subscriptionId", latestSub.getId().toString());
                map.put("subscriptionStatus", latestSub.getStatus().name());
                
                String typeStr = "Thẻ Tháng VIP";
                if ("DAILY".equals(latestSub.getSubscriptionType()) || "DAY".equals(latestSub.getSubscriptionType())) {
                    typeStr = "Vé Ngày";
                } else if ("QUARTERLY".equals(latestSub.getSubscriptionType())) {
                    typeStr = "Thẻ 3 Tháng VIP";
                } else if ("HALF_YEARLY".equals(latestSub.getSubscriptionType())) {
                    typeStr = "Thẻ 6 Tháng VIP";
                } else if ("YEARLY".equals(latestSub.getSubscriptionType())) {
                    typeStr = "Thẻ Năm VIP";
                }
                map.put("subscriptionType", typeStr);
                map.put("subscriptionExpiry", latestSub.getEndDate() != null ? latestSub.getEndDate().toString() : null);
            } else {
                map.put("subscriptionId", null);
                map.put("subscriptionStatus", null);
                map.put("subscriptionType", null);
                map.put("subscriptionExpiry", null);
            }
            
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
        String normalizedPlate = DemoVehicleDataset.normalizePlate(request.getLicensePlate());
        Optional<DemoVehicleDataset.Profile> profileOpt = DemoVehicleDataset.findByPlate(normalizedPlate);
        String resolvedVehicleType = DemoVehicleDataset.resolveVehicleType(normalizedPlate, request.getVehicleSize());
        String resolvedFuelType = DemoVehicleDataset.resolveFuelType(normalizedPlate, request.getFuelType());
        String resolvedBrand = profileOpt.map(DemoVehicleDataset.Profile::model).orElse(request.getBrand());
        validateBrand(resolvedBrand);
    
        // KTRA XEM BIỂN SỐ XE NÀY ĐÃ DC ĐĂNG KÝ CHƯA 
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String username = authentication.getName();

    User owner = userRepo
            .findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException("User không tồn tại"));

    if (repo.findByLicensePlate(normalizedPlate).isPresent()) {
        throw new RuntimeException("Biển số xe đã được đăng ký.");
}                
    Vehicle vehicle = new Vehicle();

    vehicle.setId(UUID.randomUUID());

    vehicle.setOwnerId(owner.getId());

    vehicle.setLicensePlate(normalizedPlate);

    vehicle.setVehicleSize(resolvedVehicleType);

    vehicle.setColor(profileOpt.map(DemoVehicleDataset.Profile::color).orElse(request.getColor()));

    vehicle.setColorRgb(profileOpt.map(DemoVehicleDataset.Profile::colorRgb).orElse(request.getColorRgb()));

    String safeBodyShape = request.getBodyShape();
    if (safeBodyShape == null || safeBodyShape.trim().isEmpty() || safeBodyShape.contains(" ")) {
        safeBodyShape = request.getVehicleSize() != null ? request.getVehicleSize() : "SEDAN_HATCHBACK";
    }
    vehicle.setBodyShape(profileOpt.map(DemoVehicleDataset.Profile::bodyShape).orElse(safeBodyShape));

    vehicle.setBrand(resolvedBrand);
    vehicle.setFuelType(resolvedFuelType);
    vehicle.setRegistrationDocUrl(profileOpt.map(DemoVehicleDataset.Profile::registrationDocUrl)
            .orElse(request.getRegistrationDocUrl()));
    vehicle.setRegistrationPhotoUrl(profileOpt.map(DemoVehicleDataset.Profile::registrationPhotoUrl)
            .orElse(DemoVehicleDataset.resolveImageUrl(normalizedPlate, "DRIVER_CARD", request.getRegistrationPhotoUrl())));

    vehicle.setViolationCount(0);

    vehicle.setActive(false);

    vehicle.setCreatedAt(Instant.now());

    vehicle.setUpdatedAt(Instant.now());

    Vehicle saved = repo.save(vehicle);

    return saved;
}

    private Optional<Vehicle> findVehicleByIdOrPlate(String idOrPlate) {
        if (idOrPlate == null || idOrPlate.isBlank()) return Optional.empty();
        try {
            UUID uuid = UUID.fromString(idOrPlate.trim());
            Optional<Vehicle> byId = repo.findById(uuid);
            if (byId.isPresent()) return byId;
        } catch (IllegalArgumentException ignored) {}
        String normalized = DemoVehicleDataset.normalizePlate(idOrPlate);
        return repo.findByLicensePlate(normalized);
    }

    //SỬA THÔNG TIN XE 
    @PutMapping("/{id}") // chỉ sửa dc những thông tin của vehicle bên post
    public ResponseEntity<Vehicle> update(
        @PathVariable String id,
        @Valid @RequestBody VehicleRegistrationRequest request) {

    Optional<Vehicle> targetOpt = findVehicleByIdOrPlate(id);
    if (targetOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
    }
    Vehicle existing = targetOpt.get();
    
    String normalizedPlate = DemoVehicleDataset.normalizePlate(request.getLicensePlate());
    Optional<DemoVehicleDataset.Profile> profileOpt = DemoVehicleDataset.findByPlate(normalizedPlate);
    String resolvedVehicleType = DemoVehicleDataset.resolveVehicleType(normalizedPlate, request.getVehicleSize());
    String resolvedFuelType = DemoVehicleDataset.resolveFuelType(normalizedPlate, request.getFuelType());
    String resolvedBrand = profileOpt.map(DemoVehicleDataset.Profile::model).orElse(request.getBrand());
    validateBrand(resolvedBrand);
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
        repo.findByLicensePlate(normalizedPlate);

    if (duplicate.isPresent()
        && !duplicate.get().getId().equals(existing.getId())) {

    throw new RuntimeException("Biển số xe đã tồn tại.");
    }    
    existing.setLicensePlate(normalizedPlate);
    existing.setVehicleSize(resolvedVehicleType);
    existing.setColor(profileOpt.map(DemoVehicleDataset.Profile::color).orElse(request.getColor()));
    existing.setColorRgb(profileOpt.map(DemoVehicleDataset.Profile::colorRgb).orElse(request.getColorRgb()));
    existing.setBodyShape(profileOpt.map(DemoVehicleDataset.Profile::bodyShape).orElse(request.getBodyShape()));
    existing.setBrand(resolvedBrand);
    existing.setFuelType(resolvedFuelType);
    existing.setRegistrationDocUrl(profileOpt.map(DemoVehicleDataset.Profile::registrationDocUrl)
            .orElse(request.getRegistrationDocUrl()));
    existing.setRegistrationPhotoUrl(profileOpt.map(DemoVehicleDataset.Profile::registrationPhotoUrl)
            .orElse(DemoVehicleDataset.resolveImageUrl(normalizedPlate, "DRIVER_CARD", request.getRegistrationPhotoUrl())));

    existing.setUpdatedAt(Instant.now());

    return ResponseEntity.ok(repo.save(existing));
}

//LẤY THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP
@DeleteMapping("/{id}")
public ResponseEntity<?> delete(@PathVariable String id){
    Optional<Vehicle> targetOpt = findVehicleByIdOrPlate(id);
    if (targetOpt.isEmpty()) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa phương tiện thành công!"));
    }
    Vehicle vehicle = targetOpt.get();

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String username = authentication.getName();

    User currentUser = userRepo
            .findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException("User không tồn tại."));
    
    // KIỂM TRA NGƯỜI ĐĂNG NHẬP CÓ PHẢI CHỦ XE KHÔNG (CHỈ GIỚI HẠN DRIVER)
    if (currentUser.getRole() == User.Role.DRIVER && !vehicle.getOwnerId().equals(currentUser.getId())) {
        return ResponseEntity.status(403).body(Map.of("success", false, "message", "Bạn không có quyền xóa xe này."));
    }

    // 1. KIỂM TRA XEM XE CÓ GÓI VIP ĐANG ACTIVE HOẶC CHỜ DUYỆT KHÔNG (CHẶN XÓA THEO CHUẨN DOANH NGHIỆP)
    List<com.parking.model.VipSubscription> existingSubs = vipSubscriptionRepository.findByVehicleId(vehicle.getId());
    boolean hasActiveVip = existingSubs.stream().anyMatch(sub -> 
        sub.getStatus() == com.parking.model.VipSubscription.Status.ACTIVE || 
        sub.getStatus() == com.parking.model.VipSubscription.Status.PENDING_APPROVAL
    );

    if (hasActiveVip) {
        return ResponseEntity.badRequest().body(Map.of(
            "success", false, 
            "message", "Không thể xóa phương tiện vì xe đang có gói Vé tháng VIP đang hoạt động hoặc chờ duyệt. Vui lòng liên hệ Ban quản lý bãi xe!"
        ));
    }

    // 2. NẾU LÀ XE THƯỜNG / VIP ĐÃ HẾT HẠN: CASCADE DELETE DỌN DẸP SẠCH BẢNG VIP_SUBSCRIPTIONS
    if (!existingSubs.isEmpty()) {
        vipSubscriptionRepository.deleteAll(existingSubs);
    }

    repo.delete(vehicle);

    return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa phương tiện thành công!"));
}

    @PostMapping("/lock")
    public ResponseEntity<?> lockVehicle(@RequestBody VehicleLockRequest request) {
        boolean isLocked = request.getIsLocked() != null && request.getIsLocked();
        System.out.println("[LOCK_VEHICLE] Plate: " + request.getPlate() + ", isLocked: " + isLocked);

        Optional<Vehicle> optVehicle = repo.findByLicensePlate(request.getPlate());
        if (optVehicle.isPresent()) {
            Vehicle v = optVehicle.get();
            System.out.println("[LOCK_VEHICLE] Found vehicle: " + v.getId());

            // Chỉ cho phép khóa xe nếu xe đó đã đăng ký VIP và gói cước đang ACTIVE
            Optional<com.parking.model.VipSubscription> vipSub = vipSubscriptionRepository
                    .findByVehicleIdAndStatus(v.getId(), com.parking.model.VipSubscription.Status.ACTIVE);
            if (vipSub.isEmpty()) {
                System.out.println("[LOCK_VEHICLE] No active VIP subscription for vehicle: " + v.getId());
                return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "Chỉ phương tiện có gói VIP đang hoạt động mới được sử dụng tính năng khóa xe!"));
            }

            v.setLocked(isLocked);
            repo.save(v);
            System.out.println("[LOCK_VEHICLE] Saved vehicle locked status: " + isLocked);

            // 1. Create or resolve Security Alert logs
            if (isLocked) {
                SecurityAlert alert = new SecurityAlert();
                alert.setAlertType("KHÓA CHỐNG TRỘM");
                alert.setLicensePlate(v.getLicensePlate());
                alert.setReason("Tài xế vừa bật khóa an ninh từ xa qua App");
                alert.setIsActionable(false);
                securityAlertRepository.save(alert);
            } else {
                List<SecurityAlert> activeAlerts = securityAlertRepository.findByIsResolvedFalseOrderByCreatedAtDesc().stream()
                        .filter(a -> "KHÓA CHỐNG TRỘM".equals(a.getAlertType()) 
                                && v.getLicensePlate().equals(a.getLicensePlate()))
                        .toList();
                for (SecurityAlert a : activeAlerts) {
                    a.setIsResolved(true);
                    a.setResolvedAt(java.time.LocalDateTime.now());
                    securityAlertRepository.save(a);
                }
            }

            // 2. Cập nhật cả session gửi xe hoạt động (nếu có)
            List<ParkingSession> activeSessions = sessionRepo.findByVehicleIdAndSessionStatusIn(
                    v.getId(),
                    List.of(ParkingSession.SessionStatus.ACTIVE, ParkingSession.SessionStatus.PASSED_CONFIRMED));
            if (!activeSessions.isEmpty()) {
                for (ParkingSession session : activeSessions) {
                    session.setIsLocked(isLocked);
                    sessionRepo.save(session);
                    System.out.println("[LOCK_VEHICLE] Updated session: " + session.getId() + " to locked: " + isLocked);
                }
            }
        } else {
            System.out.println("[LOCK_VEHICLE] Vehicle not found for plate: " + request.getPlate());
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "Không tìm thấy phương tiện với biển số " + request.getPlate()));
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
