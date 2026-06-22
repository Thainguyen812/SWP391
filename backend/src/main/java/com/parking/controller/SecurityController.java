package com.parking.controller;

import com.parking.model.SecurityPolicy;
import com.parking.repository.SecurityPolicyRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/security")
public class SecurityController {
    
    private final SecurityPolicyRepository policyRepo;

    public SecurityController(SecurityPolicyRepository policyRepo) {
        this.policyRepo = policyRepo;
    }

    @GetMapping("/policies")
    public List<Map<String, Object>> getPolicies() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (SecurityPolicy p : policyRepo.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId().toString());
            map.put("name", p.getPolicyName());
            map.put("description", p.getDescription());
            map.put("status", Boolean.TRUE.equals(p.getIsActive()) ? "Active" : "Inactive");
            result.add(map);
        }
        if (result.isEmpty()) {
            result.add(Map.of("id", "P1", "name", "Require MFA", "description", "Yêu c?u xác th?c 2 bu?c cho Admin", "status", "Active"));
        }
        return result;
    }

    @PostMapping("/policies")
    public Map<String, Object> updatePolicies(@RequestBody List<Map<String, Object>> policies) {
        // Dummy update
        return Map.of("success", true, "message", "C?p nh?t chính sách thành công");
    }

    @GetMapping("/rbac-stats")
    public Map<String, Object> getRbacStats() {
        Map<String, Object> result = new HashMap<>();
        result.put("adminCount", 2);
        result.put("managerCount", 5);
        result.put("staffCount", 25);
        return result;
    }

    @GetMapping("/logs")
    public List<Map<String, Object>> getSecurityLogs() {
        return Arrays.asList(
            Map.of("id", "1", "action", "Login Failed", "user", "admin", "time", "10:05", "ip", "192.168.1.5"),
            Map.of("id", "2", "action", "Policy Changed", "user", "manager", "time", "09:30", "ip", "192.168.1.10")
        );
    }
}
