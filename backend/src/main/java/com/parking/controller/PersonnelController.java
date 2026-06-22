package com.parking.controller;

import com.parking.model.User;
import com.parking.model.ShiftHistory;
import com.parking.repository.UserRepository;
import com.parking.repository.ShiftHistoryRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/personnel")
public class PersonnelController {
    
    private final UserRepository userRepo;
    private final ShiftHistoryRepository shiftRepo;

    public PersonnelController(UserRepository userRepo, ShiftHistoryRepository shiftRepo) {
        this.userRepo = userRepo;
        this.shiftRepo = shiftRepo;
    }

    @GetMapping("/list")
    public List<Map<String, Object>> getPersonnelList() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<User> users = userRepo.findAll();
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId().toString());
            map.put("name", u.getFullName() != null ? u.getFullName() : u.getUsername());
            map.put("role", u.getRole() != null ? u.getRole().name() : "STAFF");
            map.put("shift", "Ca Sáng");
            map.put("status", "Ðang làm vi?c");
            result.add(map);
        }
        if (result.isEmpty()) {
            result.add(Map.of("id", "NV001", "name", "Nguy?n Van A", "role", "B?o v?", "shift", "Ca Sáng", "status", "Ðang làm vi?c"));
        }
        return result;
    }

    @GetMapping("/shifts/today")
    public List<Map<String, Object>> getShiftsToday() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<ShiftHistory> shifts = shiftRepo.findAll();
        for (ShiftHistory s : shifts) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId().toString());
            map.put("shiftName", s.getShiftType() != null ? s.getShiftType().name() : "CA SÁNG");
            map.put("assignedStaff", "Nhân viên");
            map.put("time", s.getStartTime() != null ? s.getStartTime().toString() : "06:00 - 14:00");
            map.put("status", s.getEndTime() == null ? "Ðang tr?c" : "Ðã xong");
            result.add(map);
        }
        if (result.isEmpty()) {
            result.add(Map.of("id", "S1", "shiftName", "Ca Sáng", "assignedStaff", "Nguy?n Van A", "time", "06:00 - 14:00", "status", "Ðang tr?c"));
        }
        return result;
    }

    @GetMapping("/handover/latest")
    public Map<String, Object> getLatestHandover() {
        Map<String, Object> result = new HashMap<>();
        result.put("time", "14:05 Hôm nay");
        result.put("fromStaff", "Nguy?n Van A");
        result.put("toStaff", "Tr?n Th? B");
        result.put("status", "Hoàn t?t");
        return result;
    }
}
