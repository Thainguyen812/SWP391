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
        for (User u : userRepo.findAll()) {
            if ("VIP".equals(u.getRole().name())) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId().toString());
            map.put("name", u.getFullName() != null ? u.getFullName() : u.getUsername());
            map.put("role", u.getRole() != null ? u.getRole().name() : "STAFF");
            map.put("shift", "Ca trực");
            map.put("status", u.getStatus() != null ? u.getStatus().name() : "ACTIVE");
            result.add(map);
        }
        return result;
    }

    @GetMapping("/shifts/today")
    public List<Map<String, Object>> getShiftsToday() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ShiftHistory s : shiftRepo.findAllByOrderByStartTimeDesc()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId().toString());
            map.put("shiftName", s.getShiftType() != null ? s.getShiftType() : "CA");
            map.put("assignedStaff", s.getStaffName());
            map.put("time", s.getStartTime() != null ? s.getStartTime().toString() : "");
            map.put("status", s.getStatus() != null ? s.getStatus() : "HOÀN THÀNH");
            result.add(map);
        }
        return result;
    }

    @GetMapping("/handover/latest")
    public Map<String, Object> getLatestHandover() {
        List<ShiftHistory> shifts = shiftRepo.findAllByOrderByStartTimeDesc();
        Map<String, Object> result = new HashMap<>();
        if (!shifts.isEmpty()) {
            ShiftHistory latest = shifts.get(0);
            result.put("time", latest.getStartTime() != null ? latest.getStartTime().toString() : "N/A");
            result.put("fromStaff", latest.getStaffName());
            result.put("toStaff", latest.getStaffName());
            result.put("status", latest.getStatus());
        }
        return result;
    }
}
