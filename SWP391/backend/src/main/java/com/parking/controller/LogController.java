package com.parking.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @GetMapping
    public Map<String, Object> getLogs(@RequestParam(defaultValue = "1") int page,
                                       @RequestParam(required = false) String type) {
        Map<String, Object> response = new HashMap<>();
        response.put("total", 0);
        response.put("items", new ArrayList<>());
        return response;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", 1250);
        stats.put("errorCount", 12);
        stats.put("warningCount", 45);
        return stats;
    }
}
