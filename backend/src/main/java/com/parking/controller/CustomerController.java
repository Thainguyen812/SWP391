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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private static final DateTimeFormatter DATE_LABEL = DateTimeFormatter.ofPattern("dd/MM/yyyy")
            .withZone(ZoneId.systemDefault());

    private final UserRepository userRepo;
    private final VipSubscriptionRepository vipRepo;
    private final BlacklistRepository blacklistRepo;
    private final VehicleRepository vehicleRepo;
    private final ParkingSessionRepository parkingSessionRepo;

    public CustomerController(UserRepository userRepo,
            VipSubscriptionRepository vipRepo,
            BlacklistRepository blacklistRepo,
            VehicleRepository vehicleRepo,
            ParkingSessionRepository parkingSessionRepo) {
        this.userRepo = userRepo;
        this.vipRepo = vipRepo;
        this.blacklistRepo = blacklistRepo;
        this.vehicleRepo = vehicleRepo;
        this.parkingSessionRepo = parkingSessionRepo;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Map<String, Object> getCustomerStats() {
        long vipCount = vipRepo.countByStatus(VipSubscription.Status.ACTIVE);
        long activeVisitorSessions = parkingSessionRepo.findAll().stream()
                .filter(session -> session.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE)
                .filter(session -> !Boolean.TRUE.equals(session.getIsVip()))
                .count();

        return Map.of(
                "activeMonthly", vipCount,
                "activeBlacklist", blacklistRepo.count(),
                "activeVisitors", activeVisitorSessions);
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

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getCustomersList() {
        Map<String, Map<String, Object>> byPlate = new LinkedHashMap<>();

        List<User> drivers = userRepo.findAll().stream()
                .filter(user -> user.getRole() == User.Role.DRIVER)
                .sorted(Comparator.comparing(this::displayName))
                .toList();

        for (User user : drivers) {
            List<Vehicle> vehicles = vehicleRepo.findByOwnerId(user.getId());
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
                List<VipSubscription> subscriptions = vipRepo.findByVehicleIdOrderByCreatedAtDesc(vehicle.getId());
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
        if (subscription.getDocumentPhotos() != null) {
            extractUrls(subscription.getDocumentPhotos(), photos);
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
