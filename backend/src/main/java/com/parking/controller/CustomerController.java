package com.parking.controller;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    
    private final UserRepository userRepo;

    public CustomerController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/stats")
    public Map<String, Object> getCustomerStats() {
        long vipCount = userRepo.findAll().stream().filter(u -> "VIP".equals(u.getRole().name())).count();
        Map<String, Object> result = new HashMap<>();
        result.put("activeMonthly", vipCount);
        result.put("activeBlacklist", 0);
        return result;
    }

    @GetMapping("/blacklist")
    public List<Map<String, Object>> getBlacklist() {
        return new ArrayList<>(); // To be implemented with BlacklistCard table
    }

    @GetMapping("/blacklist/history")
    public List<Map<String, Object>> getBlacklistHistory() {
        return new ArrayList<>();
    }
}
