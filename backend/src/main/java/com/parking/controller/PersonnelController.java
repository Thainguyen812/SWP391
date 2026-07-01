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
            if ("VIP".equals(u.getRole().name()))
                continue;
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
<<<<<<< Updated upstream
        for (ShiftHistory s : shiftRepo.findAllByOrderByStartTimeDesc()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId().toString());
            map.put("shiftName", s.getShiftType() != null ? s.getShiftType() : "CA");
            map.put("assignedStaff", s.getStaffName());
            map.put("time", s.getStartTime() != null ? s.getStartTime().toString() : "");
            map.put("status", s.getStatus() != null ? s.getStatus() : "HOÀN THÀNH");
            result.add(map);
        }
=======
        Map<String, Object> s1 = new HashMap<>();
        s1.put("location", "C?ng vào 1");
        s1.put("morning", "Nguy?n Van An");
        s1.put("afternoon", "Tr?n Th? Bình");
        Map<String, Object> s2 = new HashMap<>();
        s2.put("location", "Cổng ra 1");
        s2.put("morning", "Ph?m Ð?c Duy");
        s2.put("afternoon", "Trống ca");
        s2.put("isWarning", true);
        Map<String, Object> s3 = new HashMap<>();
        s3.put("location", "Tuần tra hầm B1");
        s3.put("morning", "Hoàng Y?n");
        s3.put("afternoon", "Lê Van Cu?ng");
        result.add(s1);
        result.add(s2);
        result.add(s3);
>>>>>>> Stashed changes
        return result;
    }

    @GetMapping("/handover/latest")
    public Map<String, Object> getLatestHandover() {
        List<ShiftHistory> shifts = shiftRepo.findAllByOrderByStartTimeDesc();
        Map<String, Object> result = new HashMap<>();
<<<<<<< Updated upstream
        if (!shifts.isEmpty()) {
            ShiftHistory latest = shifts.get(0);
            result.put("time", latest.getStartTime() != null ? latest.getStartTime().toString() : "N/A");
            result.put("fromStaff", latest.getStaffName());
            result.put("toStaff", latest.getStaffName());
            result.put("status", latest.getStatus());
        }
=======
        result.put("time", "Hôm nay, 06:05");

        Map<String, Object> from = new HashMap<>();
        from.put("shift", "CA ÐÊM");
        from.put("name", "Nguy?n Van An");
        from.put("id", "NVA_123");

        Map<String, Object> to = new HashMap<>();
        to.put("shift", "CA SÁNG");
        to.put("name", "Tr?n Th? Bình");
        to.put("id", "TTB_456");

        result.put("from", from);
        result.put("to", to);
        result.put("notes", Arrays.asList("H? th?ng barrier ho?t d?ng t?t", "Tiền mặt: 1,500,000 VND"));
>>>>>>> Stashed changes
        return result;
    }
}
