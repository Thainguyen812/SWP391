package com.parking.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/logs")
public class LogController {
    
    @GetMapping
    public Map<String, Object> getLogs(@RequestParam(defaultValue = "1") int page) {
        List<Map<String, Object>> items = Arrays.asList(
            Map.of("id", "L1", "time", "14:00", "action", "System Startup", "user", "SYSTEM", "details", "Started successfully"),
            Map.of("id", "L2", "time", "14:05", "action", "User Login", "user", "manager", "details", "IP 192.168.1.5")
        );
        Map<String, Object> result = new HashMap<>();
        result.put("total", 2);
        result.put("items", items);
        return result;
    }
}
