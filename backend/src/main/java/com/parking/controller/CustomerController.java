package com.parking.controller;

import com.parking.model.BlacklistEntry;
import com.parking.model.ParkingSession;
import com.parking.model.User;
import com.parking.model.Vehicle;
import com.parking.model.VipSubscription;
import com.parking.repository.BlacklistRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.VipSubscriptionRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final UserRepository userRepo;
    private final VipSubscriptionRepository vipRepo;
    private final BlacklistRepository blacklistRepo;
    private final VehicleRepository vehicleRepo;
    private final ParkingSessionRepository parkingSessionRepo;
    private final PasswordEncoder passwordEncoder;

    public CustomerController(UserRepository userRepo,
            VipSubscriptionRepository vipRepo,
            BlacklistRepository blacklistRepo,
            VehicleRepository vehicleRepo,
            ParkingSessionRepository parkingSessionRepo,
            PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.vipRepo = vipRepo;
        this.blacklistRepo = blacklistRepo;
        this.vehicleRepo = vehicleRepo;
        this.parkingSessionRepo = parkingSessionRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Map<String, Object> getCustomerStats() {
        // Tổng số khách hàng (DRIVER)
        long totalDrivers = userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.DRIVER)
                .count();

        // VIP đang hoạt động
        long vipCount = vipRepo.countByStatus(VipSubscription.Status.ACTIVE);

        // VIP hết hạn (cần gia hạn)
        long expiredVip = vipRepo.countByStatus(VipSubscription.Status.EXPIRED);

        // Khách vãng lai đang trong bãi
        long activeVisitorSessions = parkingSessionRepo.findAll().stream()
                .filter(session -> session.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE)
                .filter(session -> !Boolean.TRUE.equals(session.getIsVip()))
                .count();

        // Khách thuê tháng = đăng ký xe nhưng không phải VIP
        long registeredVehicles = vehicleRepo.findAll().stream()
                .filter(Vehicle::isActive)
                .count();

        Map<String, Object> total = new java.util.LinkedHashMap<>();
        total.put("value", totalDrivers);
        total.put("trend", "Tổng tài khoản đăng ký");
        total.put("isPositive", true);

        Map<String, Object> monthly = new java.util.LinkedHashMap<>();
        monthly.put("value", registeredVehicles);
        monthly.put("sub", "Xe đã đăng ký trong hệ thống");

        Map<String, Object> vip = new java.util.LinkedHashMap<>();
        vip.put("value", vipCount);
        vip.put("sub", "Đang hoạt động");

        Map<String, Object> expired = new java.util.LinkedHashMap<>();
        expired.put("value", expiredVip);
        expired.put("sub", "Cần gia hạn");

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("total", total);
        result.put("monthly", monthly);
        result.put("vip", vip);
        result.put("expired", expired);
        // Keep backward-compat flat keys
        result.put("activeMonthly", vipCount);
        result.put("activeBlacklist", blacklistRepo.count());
        result.put("activeVisitors", activeVisitorSessions);
        return result;
    }

    @GetMapping("/blacklist")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getBlacklist() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (BlacklistEntry entry : blacklistRepo.findAll()) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", entry.getId().toString());
            map.put("cardId", entry.getCardId() != null ? entry.getCardId().toString() : null);
            map.put("sessionId", entry.getSessionId() != null ? entry.getSessionId().toString() : null);
            map.put("reason", entry.getReason());
            map.put("notes", entry.getNotes());
            map.put("blacklistedAt", entry.getBlacklistedAt() != null ? entry.getBlacklistedAt().toString() : null);
            result.add(map);
        }
        return result;
    }

    @GetMapping("/blacklist/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getBlacklistHistory() {
        return new ArrayList<>();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public org.springframework.http.ResponseEntity<Map<String, String>> addCustomer(
            @org.springframework.web.bind.annotation.RequestBody Map<String, Object> payload) {

        String name = (String) payload.get("name");
        String phone = (String) payload.get("phone");
        String plate = (String) payload.get("plate");
        String type = (String) payload.get("type");
        String email = (String) payload.get("email");

        // Validate required fields
        if (name == null || name.isBlank()) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("message", "Ten khach hang khong duoc de trong");
            return org.springframework.http.ResponseEntity.badRequest().body(err);
        }
        if (plate == null || plate.isBlank()) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("message", "Bien so xe khong duoc de trong");
            return org.springframework.http.ResponseEntity.badRequest().body(err);
        }
        if (email == null || email.isBlank()) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("message", "Email dang nhap khong duoc de trong");
            return org.springframework.http.ResponseEntity.badRequest().body(err);
        }

        if (userRepo.findByEmail(email).isPresent()) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("message", "Email da duoc su dung tren he thong");
            return org.springframework.http.ResponseEntity.badRequest().body(err);
        }

        if (vehicleRepo.findByLicensePlate(plate).isPresent()) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("message", "Bien so xe da ton tai trong he thong");
            return org.springframework.http.ResponseEntity.badRequest().body(err);
        }

        User newUser = new User();
        newUser.setId(java.util.UUID.randomUUID());
        newUser.setUsername(name.replaceAll("\\s+", "").toLowerCase() + System.currentTimeMillis());
        newUser.setFullName(name);
        newUser.setPhone(phone);
        newUser.setEmail(email);
        newUser.setRole(User.Role.DRIVER);
        newUser.setStatus(User.Status.ACTIVE);
        
        String randomPassword = java.util.UUID.randomUUID().toString().substring(0, 8);
        newUser.setPasswordHash(passwordEncoder.encode(randomPassword));
        userRepo.save(newUser);

        Vehicle vehicle = new Vehicle();
        vehicle.setId(java.util.UUID.randomUUID());
        vehicle.setOwnerId(newUser.getId());
        vehicle.setLicensePlate(plate);
        vehicle.setActive(true);
        vehicleRepo.save(vehicle);

        if ("VIP".equals(type) || "Thang".equals(type)) {
            VipSubscription vip = new VipSubscription();
            vip.setId(java.util.UUID.randomUUID());
            vip.setVehicleId(vehicle.getId());
            String status = (String) payload.get("status");
            if ("PENDING".equals(status)) {
                vip.setStatus(VipSubscription.Status.PENDING_APPROVAL);
            } else {
                vip.setStatus(VipSubscription.Status.ACTIVE);
            }
            vip.setCreatedAt(java.time.Instant.now());
            // Parse expiry date from frontend (YYYY-MM-DD) or default to +1 month
            String expiryStr = (String) payload.get("expiry");
            if (expiryStr != null && !expiryStr.isBlank()) {
                try {
                    vip.setEndDate(java.time.LocalDate.parse(expiryStr));
                } catch (Exception e) {
                    vip.setEndDate(java.time.Instant.now().atZone(ZoneId.systemDefault()).plusMonths(1).toLocalDate());
                }
            } else {
                vip.setEndDate(java.time.Instant.now().atZone(ZoneId.systemDefault()).plusMonths(1).toLocalDate());
            }
            vipRepo.save(vip);
        }

        Map<String, String> res = new LinkedHashMap<>();
        res.put("message", "Them khach hang thanh cong");
        return org.springframework.http.ResponseEntity.ok(res);
    }

    @PostMapping("/renew/{subscriptionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public org.springframework.http.ResponseEntity<Map<String, String>> renewCustomer(@org.springframework.web.bind.annotation.PathVariable UUID subscriptionId) {
        java.util.Optional<VipSubscription> vipOpt = vipRepo.findById(subscriptionId);
        if (vipOpt.isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "Khong tim thay the VIP"));
        }
        VipSubscription vip = vipOpt.get();
        if (vip.getEndDate() != null) {
            vip.setEndDate(vip.getEndDate().plusMonths(1)); // Renew for 1 month
        } else {
            vip.setEndDate(java.time.LocalDate.now().plusMonths(1));
        }
        vip.setStatus(VipSubscription.Status.ACTIVE);
        vipRepo.save(vip);
        return org.springframework.http.ResponseEntity.ok(Map.of("message", "Gia han the thanh cong"));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public org.springframework.http.ResponseEntity<Map<String, String>> updateCustomer(
            @org.springframework.web.bind.annotation.PathVariable UUID id,
            @org.springframework.web.bind.annotation.RequestBody Map<String, Object> payload) {
        
        java.util.Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "Khong tim thay khach hang"));
        }
        User user = userOpt.get();

        String name = (String) payload.get("name");
        String phone = (String) payload.get("phone");
        String plate = (String) payload.get("plate");

        if (name != null && !name.isBlank()) {
            user.setFullName(name);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        userRepo.save(user);

        if (plate != null && !plate.isBlank()) {
            List<Vehicle> vehicles = vehicleRepo.findByOwnerIdIn(List.of(id));
            if (!vehicles.isEmpty()) {
                Vehicle v = vehicles.get(0);
                // Check if new plate already exists for a DIFFERENT vehicle
                java.util.Optional<Vehicle> existing = vehicleRepo.findByLicensePlate(plate);
                if (existing.isPresent() && !existing.get().getId().equals(v.getId())) {
                    return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "Bien so xe da ton tai trong he thong"));
                }
                v.setLicensePlate(plate);
                vehicleRepo.save(v);
            }
        }
        
        return org.springframework.http.ResponseEntity.ok(Map.of("message", "Cap nhat khach hang thanh cong"));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public org.springframework.http.ResponseEntity<List<Map<String, Object>>> getCustomerHistory(
            @org.springframework.web.bind.annotation.PathVariable UUID id) {
        
        List<Vehicle> vehicles = vehicleRepo.findByOwnerIdIn(List.of(id));
        if (vehicles.isEmpty()) {
            return org.springframework.http.ResponseEntity.ok(new ArrayList<>());
        }
        
        List<String> plates = vehicles.stream().map(Vehicle::getLicensePlate).toList();
        List<ParkingSession> sessions = parkingSessionRepo.findAll().stream()
                .filter(s -> plates.contains(s.getLicensePlate()))
                .sorted(Comparator.comparing(ParkingSession::getCheckInTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(50)
                .toList();
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (ParkingSession session : sessions) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sessionId", session.getId().toString());
            map.put("plate", session.getLicensePlate());
            map.put("checkInTime", session.getCheckInTime() != null ? session.getCheckInTime().toString() : null);
            map.put("checkOutTime", session.getCheckOutTime() != null ? session.getCheckOutTime().toString() : null);
            map.put("fee", 0); // Need to fetch from Transaction if required later
            map.put("status", session.getSessionStatus() != null ? session.getSessionStatus().toString() : null);
            result.add(map);
        }
        
        return org.springframework.http.ResponseEntity.ok(result);
    }

    @GetMapping("/pending-vips")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getPendingVips() {
        List<VipSubscription> pendingVips = vipRepo.findByStatus(VipSubscription.Status.PENDING_APPROVAL);
        List<UUID> vehicleIds = pendingVips.stream().map(VipSubscription::getVehicleId).toList();
        List<Vehicle> vehicles = vehicleIds.isEmpty() ? new ArrayList<>() : vehicleRepo.findAllById(vehicleIds);
        List<UUID> ownerIds = vehicles.stream().map(Vehicle::getOwnerId).toList();
        List<User> owners = ownerIds.isEmpty() ? new ArrayList<>() : userRepo.findAllById(ownerIds);
        
        java.util.Map<UUID, User> ownerMap = owners.stream().collect(java.util.stream.Collectors.toMap(User::getId, u -> u));
        java.util.Map<UUID, Vehicle> vehicleMap = vehicles.stream().collect(java.util.stream.Collectors.toMap(Vehicle::getId, v -> v));

        List<Map<String, Object>> result = new ArrayList<>();
        for (VipSubscription vip : pendingVips) {
            Vehicle v = vehicleMap.get(vip.getVehicleId());
            if (v != null) {
                User u = ownerMap.get(v.getOwnerId());
                if (u != null) {
                    Map<String, Object> row = baseCustomerRow(u, v);
                    applyVipInfo(row, vip);
                    result.add(row);
                }
            }
        }
        return result;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getCustomersList() {
        Map<String, Map<String, Object>> byPlate = new LinkedHashMap<>();

        List<User> drivers = userRepo.findAll().stream()
                .filter(user -> user.getRole() == User.Role.DRIVER)
                .sorted(Comparator.comparing(this::displayName))
                .toList();

        List<UUID> driverIds = drivers.stream().map(User::getId).toList();
        List<Vehicle> allVehicles = vehicleRepo.findByOwnerIdIn(driverIds);
        java.util.Map<UUID, List<Vehicle>> vehiclesByOwner = allVehicles.stream().collect(java.util.stream.Collectors.groupingBy(Vehicle::getOwnerId));

        List<UUID> vehicleIds = allVehicles.stream().map(Vehicle::getId).toList();
        List<VipSubscription> allVips = vehicleIds.isEmpty() ? new ArrayList<>() : vipRepo.findByVehicleIdIn(vehicleIds);
        java.util.Map<UUID, List<VipSubscription>> vipsByVehicle = allVips.stream()
                .sorted(Comparator.comparing(VipSubscription::getCreatedAt).reversed())
                .collect(java.util.stream.Collectors.groupingBy(VipSubscription::getVehicleId));

        for (User user : drivers) {
            List<Vehicle> vehicles = vehiclesByOwner.getOrDefault(user.getId(), new ArrayList<>());
            if (vehicles.isEmpty()) {
                Map<String, Object> row = baseCustomerRow(user, null);
                row.put("type", "Driver");
                row.put("status", statusCode(user.getStatus()));
                row.put("statusLabel", statusLabel(statusCode(user.getStatus())));
                row.put("expireDate", "N/A");
                byPlate.put(user.getId().toString(), row);
                continue;
            }

            for (Vehicle vehicle : vehicles) {
                Map<String, Object> row = baseCustomerRow(user, vehicle);
                List<VipSubscription> subscriptions = vipsByVehicle.getOrDefault(vehicle.getId(), new ArrayList<>());
                if (!subscriptions.isEmpty()) {
                    applyVipInfo(row, subscriptions.get(0));
                } else {
                    row.put("type", "Registered");
                    row.put("status", vehicle.isActive() ? "ACTIVE" : "INACTIVE");
                    row.put("statusLabel", statusLabel((String) row.get("status")));
                    row.put("expireDate", "N/A");
                    row.put("subscriptionId", null);
                    row.put("photos_urls", new ArrayList<>());
                }
                byPlate.put(vehicle.getLicensePlate(), row);
            }
        }

        for (ParkingSession session : parkingSessionRepo.findAll()) {
            if (session.getSessionStatus() != ParkingSession.SessionStatus.ACTIVE) {
                continue;
            }
            String plate = session.getLicensePlate();
            Map<String, Object> row = byPlate.getOrDefault(plate, new LinkedHashMap<>());
            if (row.isEmpty()) {
                row.put("id", session.getId().toString());
                row.put("name", Boolean.TRUE.equals(session.getIsVip()) ? "Khách VIP" : "Khách vãng lai");
                row.put("phone", "-");
                row.put("plate", plate);
                row.put("type", Boolean.TRUE.equals(session.getIsVip()) ? "VIP" : "Guest");
                row.put("expireDate", "N/A");
                row.put("subscriptionId", null);
                row.put("photos_urls", new ArrayList<>());
            }
            row.put("status", "IN_PARK");
            row.put("statusLabel", "Đang trong bãi");
            row.put("sessionId", session.getId().toString());
            row.put("checkInTime", session.getCheckInTime());
            byPlate.put(plate, row);
        }

        return byPlate.values().stream()
                .sorted(Comparator.comparing(row -> !"IN_PARK".equals(row.get("status"))))
                .toList();
    }

    private Map<String, Object> baseCustomerRow(User user, Vehicle vehicle) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", user.getId().toString());
        row.put("name", displayName(user));
        row.put("phone", user.getPhone() != null ? user.getPhone() : "N/A");
        row.put("plate", vehicle != null ? vehicle.getLicensePlate() : "N/A");
        row.put("vehicleSize", vehicle != null ? vehicle.getVehicleSize() : null);
        row.put("fuelType", vehicle != null ? vehicle.getFuelType() : null);
        return row;
    }

    private void applyVipInfo(Map<String, Object> row, VipSubscription subscription) {
        row.put("type", "VIP");
        row.put("status", switch (subscription.getStatus()) {
            case PENDING_APPROVAL -> "PENDING";
            case ACTIVE -> "ACTIVE";
            case REJECTED -> "REJECTED";
            case EXPIRED -> "EXPIRED";
            case CANCELLED -> "CANCELLED";
        });
        row.put("statusLabel", statusLabel((String) row.get("status")));
        row.put("expireDate", subscription.getEndDate() != null
                ? subscription.getEndDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "N/A");
        row.put("subscriptionId", subscription.getId().toString());

        List<String> photos = new ArrayList<>();
        String rawPhotos = subscription.getDocumentPhotos();
        if (rawPhotos != null && !rawPhotos.isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> photoMap = mapper.readValue(rawPhotos, Map.class);
                // Order: 1. Cà vẹt, 2. CCCD, 3. Ảnh xe
                String[] keys = {"registrationPaper", "identityCard", "frontPhoto"};
                for (String key : keys) {
                    Object val = photoMap.get(key);
                    if (val != null && !val.toString().isBlank()) {
                        photos.add(val.toString());
                    }
                }
                if (photos.isEmpty()) {
                    for (Object val : photoMap.values()) {
                        if (val != null && val.toString().startsWith("http")) {
                            photos.add(val.toString());
                        }
                    }
                }
            } catch (Exception e) {
                extractUrls(rawPhotos, photos);
            }
        }
        row.put("photos_urls", photos);
    }

    private String statusCode(User.Status status) {
        if (status == null) {
            return "ACTIVE";
        }
        return switch (status) {
            case ACTIVE -> "ACTIVE";
            case INACTIVE -> "INACTIVE";
            case SUSPENDED -> "SUSPENDED";
        };
    }

    private String statusLabel(String status) {
        if (status == null) {
            return "Không xác định";
        }
        return switch (status) {
            case "ACTIVE" -> "Hoạt động";
            case "INACTIVE" -> "Ngưng hoạt động";
            case "SUSPENDED" -> "Tạm khóa";
            case "PENDING" -> "Chờ duyệt";
            case "REJECTED" -> "Đã từ chối";
            case "EXPIRED" -> "Đã hết hạn";
            case "CANCELLED" -> "Đã hủy";
            case "IN_PARK" -> "Đang trong bãi";
            default -> status;
        };
    }

    private String displayName(User user) {
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        return user.getUsername() != null ? user.getUsername() : user.getEmail();
    }

    private void extractUrls(String json, List<String> photosList) {
        int idx = 0;
        while ((idx = json.indexOf("http", idx)) != -1) {
            int end = json.indexOf("\"", idx);
            if (end == -1) {
                end = json.indexOf("'", idx);
            }
            if (end != -1) {
                photosList.add(json.substring(idx, end));
                idx = end + 1;
            } else {
                idx += 4;
            }
        }
    }
}
