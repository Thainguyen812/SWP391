package com.parking.controller;

import com.parking.model.User;
import com.parking.model.VipSubscription;
import com.parking.model.BlacklistEntry;
import com.parking.repository.UserRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.repository.BlacklistRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    
    private final UserRepository userRepo;
    private final VipSubscriptionRepository vipRepo;
    private final BlacklistRepository blacklistRepo;

    public CustomerController(UserRepository userRepo, VipSubscriptionRepository vipRepo, BlacklistRepository blacklistRepo) {
        this.userRepo = userRepo;
        this.vipRepo = vipRepo;
        this.blacklistRepo = blacklistRepo;
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
}
