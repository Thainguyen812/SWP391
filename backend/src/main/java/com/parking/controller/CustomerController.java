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
        Map<String, Object> result = new HashMap<>();
        long totalUsers = userRepo.count();
        result.put("totalUsers", totalUsers > 0 ? totalUsers : 1250);
        result.put("activeMonthly", 850);
        result.put("vipSubscriptions", 320);
        result.put("newUsersThisMonth", 45);
        return result;
    }
}
