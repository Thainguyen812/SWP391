package com.parking.controller;

import com.parking.model.User;
import com.parking.model.VipSubscription;
import com.parking.model.BlacklistEntry;
import com.parking.model.Vehicle;
import com.parking.repository.UserRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.repository.BlacklistRepository;
import com.parking.repository.VehicleRepository;
import org.springframework.web.bind.annotation.*;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    
    private final UserRepository userRepo;
    private final VipSubscriptionRepository vipRepo;
    private final BlacklistRepository blacklistRepo;
    private final VehicleRepository vehicleRepo;

    public CustomerController(UserRepository userRepo, 
                              VipSubscriptionRepository vipRepo, 
                              BlacklistRepository blacklistRepo,
                              VehicleRepository vehicleRepo) {
        this.userRepo = userRepo;
        this.vipRepo = vipRepo;
        this.blacklistRepo = blacklistRepo;
        this.vehicleRepo = vehicleRepo;
    }

    @GetMapping("/stats")
    public Map<String, Object> getCustomerStats() {
        long vipCount = vipRepo.countByStatus(VipSubscription.Status.ACTIVE);
        Map<String, Object> result = new HashMap<>();
        result.put("activeMonthly", vipCount);
        result.put("activeBlacklist", blacklistRepo.count());
        return result;
    }

    @GetMapping("/blacklist")
    public List<Map<String, Object>> getBlacklist() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (BlacklistEntry entry : blacklistRepo.findAll()) {
            Map<String, Object> map = new HashMap<>();
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
    public List<Map<String, Object>> getBlacklistHistory() {
        return new ArrayList<>();
    }

    @GetMapping
    public List<Map<String, Object>> getCustomersList() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<User> drivers = userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.DRIVER)
                .toList();

        for (User u : drivers) {
            List<Vehicle> vehicles = vehicleRepo.findByOwnerId(u.getId());
            if (vehicles.isEmpty()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId().toString());
                map.put("name", u.getFullName() != null ? u.getFullName() : u.getUsername());
                map.put("phone", u.getPhone() != null ? u.getPhone() : "N/A");
                map.put("plate", "N/A");
                map.put("type", "Tháng");
                map.put("status", "ACTIVE");
                map.put("expireDate", "N/A");
                map.put("subscriptionId", null);
                map.put("photos_urls", new ArrayList<>());
                result.add(map);
            } else {
                for (Vehicle v : vehicles) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId().toString());
                    map.put("name", u.getFullName() != null ? u.getFullName() : u.getUsername());
                    map.put("phone", u.getPhone() != null ? u.getPhone() : "N/A");
                    map.put("plate", v.getLicensePlate());
                    
                    List<VipSubscription> subs = vipRepo.findByVehicleIdOrderByCreatedAtDesc(v.getId());
                    if (!subs.isEmpty()) {
                        VipSubscription sub = subs.get(0);
                        map.put("type", "VIP");
                        
                        String statusStr = "ACTIVE";
                        if (sub.getStatus() == VipSubscription.Status.PENDING_APPROVAL) {
                            statusStr = "PENDING";
                        } else if (sub.getStatus() == VipSubscription.Status.REJECTED) {
                            statusStr = "REJECTED";
                        } else if (sub.getStatus() == VipSubscription.Status.EXPIRED) {
                            statusStr = "EXPIRED";
                        }
                        
                        map.put("status", statusStr);
                        
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.systemDefault());
                        map.put("expireDate", sub.getEndDate() != null ? formatter.format(sub.getEndDate()) : "N/A");
                        map.put("subscriptionId", sub.getId().toString());
                        
                        List<String> photosList = new ArrayList<>();
                        if (sub.getDocumentPhotos() != null) {
                            try {
                                extractUrls(sub.getDocumentPhotos(), photosList);
                            } catch (Exception e) {}
                        }
                        if (photosList.isEmpty()) {
                            photosList.add("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80");
                            photosList.add("https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80");
                        }
                        map.put("photos_urls", photosList);
                    } else {
                        map.put("type", "Tháng");
                        map.put("status", "ACTIVE");
                        map.put("expireDate", "N/A");
                        map.put("subscriptionId", null);
                        map.put("photos_urls", new ArrayList<>());
                    }
                    result.add(map);
                }
            }
        }
        return result;
    }

    private void extractUrls(String json, List<String> photosList) {
        int idx = 0;
        while ((idx = json.indexOf("http", idx)) != -1) {
            int end = json.indexOf("\"", idx);
            if (end == -1) end = json.indexOf("'", idx);
            if (end != -1) {
                photosList.add(json.substring(idx, end));
                idx = end;
            } else {
                idx += 4;
            }
        }
    }
}
