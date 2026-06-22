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
        return result;
    }

    @PutMapping("/system")
    public Map<String, Object> updateSystemSettings(@RequestBody Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            SystemSetting setting = settingRepo.findBySettingKey(entry.getKey());
            if (setting == null) {
                setting = new SystemSetting();
                setting.setId(UUID.randomUUID());
                setting.setSettingKey(entry.getKey());
            }
            setting.setSettingValue(entry.getValue());
            setting.setUpdatedAt(java.time.LocalDateTime.now());
            settingRepo.save(setting);
        }
        return Map.of("success", true, "message", "Cập nhật cài đặt thành công");
    }
}
