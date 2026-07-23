package com.parking.controller;

import com.parking.model.SecurityPolicy;
import com.parking.model.SecurityAlert;
import com.parking.model.RbacPermission;
import com.parking.repository.SecurityPolicyRepository;
import com.parking.repository.SecurityAlertRepository;
import com.parking.repository.RbacPermissionRepository;

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
    private final RbacPermissionRepository rbacRepo;

    public SecurityController(SecurityPolicyRepository policyRepo, SecurityAlertRepository alertRepo, RbacPermissionRepository rbacRepo) {
        this.policyRepo = policyRepo;
        this.alertRepo = alertRepo;
        this.rbacRepo = rbacRepo;
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
    @GetMapping({ "/stats" })
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
    @GetMapping("/rbac")
    public List<Map<String, Object>> getRbacPermissions() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<RbacPermission> permissions = rbacRepo.findAll();
        
        if (permissions.isEmpty()) {
            // Seed defaults if empty
            String[][] defaults = {
                {"dashboard", "Tổng quan hệ thống (Dashboard)"},
                {"customers", "Quản lý Khách hàng & Thẻ"},
                {"personnel", "Quản lý Nhân sự & Phân ca"},
                {"revenue", "Báo cáo Doanh thu"},
                {"monitoring", "Giám sát Bãi xe (Camera)"},
                {"security", "An ninh & Phân quyền"},
                {"logs", "Nhật ký Hệ thống"},
                {"settings", "Cài đặt Hệ thống"}
            };
            for (String[] def : defaults) {
                RbacPermission p = new RbacPermission(UUID.randomUUID(), def[0], def[1], true, def[0].equals("monitoring") || def[0].equals("customers"));
                permissions.add(rbacRepo.save(p));
            }
        }
        
        for (RbacPermission p : permissions) {
            Map<String, Object> map = new HashMap<>();
            map.put("key", p.getModuleKey());
            map.put("module", p.getModuleName());
            map.put("manager", p.isManagerAccess());
            map.put("staff", p.isStaffAccess());
            result.add(map);
        }
        return result;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/rbac")
    public Map<String, Object> updateRbac(@RequestBody List<Map<String, Object>> rbacConfig) {
        for (Map<String, Object> config : rbacConfig) {
            String key = (String) config.get("key");
            boolean manager = (Boolean) config.get("manager");
            boolean staff = (Boolean) config.get("staff");
            
            // Find existing permission
            List<RbacPermission> all = rbacRepo.findAll();
            for (RbacPermission p : all) {
                if (p.getModuleKey().equals(key)) {
                    p.setManagerAccess(manager);
                    p.setStaffAccess(staff);
                    rbacRepo.save(p);
                    break;
                }
            }
        }
        return Map.of("success", true, "message", "Cập nhật phân quyền thành công");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/logs")
    public List<Map<String, Object>> getSecurityLogs() {
        return Arrays.asList(
                Map.of("id", "1", "action", "Login Failed", "user", "admin", "time", "10:05", "ip", "192.168.1.5", "type", "warning", "content", "Đăng nhập thất bại quá 5 lần"),
                Map.of("id", "2", "action", "Policy Changed", "user", "manager", "time", "09:30", "ip", "192.168.1.10", "type", "info", "content", "Thay đổi chính sách bảo mật")
        );
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
