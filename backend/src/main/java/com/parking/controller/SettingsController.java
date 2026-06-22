package com.parking.controller;

import com.parking.model.SystemSetting;
import com.parking.repository.SystemSettingRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    
    private final SystemSettingRepository settingRepo;

    public SettingsController(SystemSettingRepository settingRepo) {
        this.settingRepo = settingRepo;
    }

    @GetMapping("/system")
    public Map<String, Object> getSystemSettings() {
        Map<String, Object> result = new HashMap<>();
        for (SystemSetting s : settingRepo.findAll()) {
            result.put(s.getSettingKey(), s.getSettingValue());
        }
        if (result.isEmpty()) {
            result.put("system_name", "Smart Parking Pro");
            result.put("maintenance_mode", "false");
        }
        return result;
    }

    @PutMapping("/system")
    public Map<String, Object> updateSystemSettings(@RequestBody Map<String, String> settings) {
        // Dummy update
        return Map.of("success", true, "message", "C?p nh?t cài d?t thành công");
    }
}
