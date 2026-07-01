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
<<<<<<< Updated upstream
        for (SystemSetting s : settingRepo.findAll()) {
            result.put(s.getSettingKey(), s.getSettingValue());
        }
=======

        Map<String, Object> camera = new HashMap<>();
        camera.put("status", "online");
        Map<String, Object> lanVao = new HashMap<>();
        lanVao.put("ip", "192.168.1.101");
        lanVao.put("confidence", 85);
        lanVao.put("nightMode", true);
        Map<String, Object> lanRa = new HashMap<>();
        lanRa.put("ip", "192.168.1.102");
        lanRa.put("confidence", 90);
        lanRa.put("nightMode", true);
        camera.put("lanVao", lanVao);
        camera.put("lanRa", lanRa);

        Map<String, Object> barrier = new HashMap<>();
        barrier.put("speed", "3.0s");
        barrier.put("autoCloseDelay", 5);
        barrier.put("antiCrash", true);

        Map<String, Object> sensors = new HashMap<>();
        Map<String, Object> loopIn = new HashMap<>();
        loopIn.put("active", true);
        loopIn.put("frequency", "medium");
        Map<String, Object> loopOut = new HashMap<>();
        loopOut.put("active", true);
        loopOut.put("frequency", "low");
        sensors.put("loopIn", loopIn);
        sensors.put("loopOut", loopOut);

        Map<String, Object> network = new HashMap<>();
        network.put("ipServer", "192.168.1.100");
        network.put("subnetMask", "255.255.255.0");
        network.put("gateway", "192.168.1.1");

        Map<String, Object> firmware = new HashMap<>();
        firmware.put("currentVersion", "v2.4.1-build890");
        firmware.put("lastUpdated", "12/10/2023 14:30");
        firmware.put("hasUpdate", true);
        firmware.put("newVersion", "v2.5.0");
        firmware.put("updateNotes", "Bao gom cai thien thuat toan LPR ban dem.");

        result.put("camera", camera);
        result.put("barrier", barrier);
        result.put("sensors", sensors);
        result.put("network", network);
        result.put("firmware", firmware);
        result.put("totalGates", 6);

>>>>>>> Stashed changes
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
