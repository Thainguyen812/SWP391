package com.parking.controller;

import com.parking.model.SecurityPolicy;
import com.parking.model.SecurityAlert;
import com.parking.repository.SecurityPolicyRepository;
import com.parking.repository.SecurityAlertRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/security")
// Bỏ khóa cứng class-level để mở cho method-level
// @PreAuthorize("hasRole('ADMIN')") 
public class SecurityController {

    private final SecurityPolicyRepository policyRepo;
    private final SecurityAlertRepository alertRepo;

    public SecurityController(SecurityPolicyRepository policyRepo, SecurityAlertRepository alertRepo) {
        this.policyRepo = policyRepo;
        this.alertRepo = alertRepo;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/policies")
    public List<Map<String, Object>> getPolicies() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (SecurityPolicy p : policyRepo.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId().toString());
            map.put("name", p.getPolicyName());
            map.put("description", p.getDescription());
            map.put("status", p.getIsActive() != null && p.getIsActive() ? "Active" : "Inactive");
            result.add(map);
        }
        return result;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/policies")
    public Map<String, Object> updatePolicies(@RequestBody List<Map<String, Object>> policies) {
        for (Map<String, Object> pol : policies) {
            String name = (String) pol.get("name");
            String status = (String) pol.get("status");
            SecurityPolicy p = policyRepo.findByPolicyName(name);
            if (p == null) {
                p = new SecurityPolicy();
                p.setId(UUID.randomUUID());
                p.setPolicyName(name);
                p.setDescription((String) pol.get("description"));
            }
            p.setIsActive("Active".equalsIgnoreCase(status) || "true".equalsIgnoreCase(status));
            p.setUpdatedAt(java.time.LocalDateTime.now());
            policyRepo.save(p);
        }
        return Map.of("success", true, "message", "Cập nhật chính sách thành công");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({ "/stats", "/rbac-stats" })
    public Map<String, Object> getSecurityStats() {
        Map<String, Object> result = new HashMap<>();
        result.put("adminCount", 2);
        result.put("managerCount", 5);
        result.put("staffCount", 25);
        result.put("driverCount", 1200);
        result.put("recentChanges", 15);
        return result;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/logs")
    public List<Map<String, Object>> getSecurityLogs() {
        return Arrays.asList(
                Map.of("id", "1", "action", "Login Failed", "user", "admin", "time", "10:05", "ip", "192.168.1.5"),
                Map.of("id", "2", "action", "Policy Changed", "user", "manager", "time", "09:30", "ip",
                        "192.168.1.10"));
    }

    //hiện cảnh bảo trên hệ thống
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    @GetMapping("/alerts")
    public List<Map<String, Object>> getSecurityAlerts() {
        List<SecurityAlert> alerts = alertRepo.findByIsResolvedFalseOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (SecurityAlert a : alerts) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId().toString());
            map.put("type", a.getAlertType());
            map.put("plate", a.getLicensePlate());
            map.put("reason", a.getReason());
            map.put("actionable", a.getIsActionable());

            // Format time string based on how old it is to match mock behavior
            long minutes = java.time.Duration.between(a.getCreatedAt(), java.time.LocalDateTime.now()).toMinutes();
            String timeStr = minutes < 5 ? "Vừa xong" : minutes + " phút trước";
            map.put("time", timeStr);

            result.add(map);
        }
        return result;
    }
    // cập nhật trạng thái đã xử lý cho các cảnh báo 
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    @PutMapping("/alerts/{id}/resolve")
    public Map<String, Object> resolveSecurityAlert(@PathVariable UUID id) {

        SecurityAlert alert = alertRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cảnh báo an ninh"));

        if (Boolean.TRUE.equals(alert.getIsResolved())) {
            return Map.of(
                    "success", false,
                    "message", "Cảnh báo đã được xử lý trước đó");
        }

        alert.setIsResolved(true);
        alert.setResolvedAt(LocalDateTime.now());

        alertRepo.save(alert);

        return Map.of(
                "success", true,
                "message", "Đã xử lý cảnh báo an ninh thành công");
    }
}
