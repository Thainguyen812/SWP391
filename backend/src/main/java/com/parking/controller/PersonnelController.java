package com.parking.controller;

import com.parking.dto.RegisterRequest;
import com.parking.model.ShiftHistory;
import com.parking.model.User;
import com.parking.repository.ShiftHistoryRepository;
import com.parking.repository.UserRepository;
import com.parking.service.PersonnelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personnel")
public class PersonnelController {

    private static final DateTimeFormatter TIME_LABEL = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
    private static final String[] LOCATIONS = {
            "Cổng vào 1",
            "Cổng ra 1",
            "Cổng ra 2 (VIP)",
            "Tuần tra hầm B1"
    };

    private final UserRepository userRepo;
    private final ShiftHistoryRepository shiftRepo;
    private final PersonnelService personnelService;

    public PersonnelController(UserRepository userRepo, ShiftHistoryRepository shiftRepo,
            PersonnelService personnelService) {
        this.userRepo = userRepo;
        this.shiftRepo = shiftRepo;
        this.personnelService = personnelService;
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> addPersonnel(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getPassword() == null || request.getRole() == null) {
            return ResponseEntity.badRequest().body("Username, password và role không được để trống.");
        }

        try {
            User savedUser = personnelService.createPersonnel(request);
            savedUser.setPasswordHash("[PROTECTED]");
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getPersonnelList() {
        List<User> staffUsers = operationsUsers();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < staffUsers.size(); i++) {
            User user = staffUsers.get(i);
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId().toString());
            map.put("name", displayName(user));
            map.put("role", roleLabel(user.getRole()));
            map.put("roleCode", user.getRole() != null ? user.getRole().name() : "STAFF");
            map.put("status", user.getStatus() == User.Status.ACTIVE ? "active" : "inactive");
            map.put("statusLabel", user.getStatus() == User.Status.ACTIVE ? "Đang trực" : "Nghỉ phép");
            map.put("time", shiftWindow(i));
            map.put("phone", user.getPhone() != null ? user.getPhone() : user.getEmail());
            map.put("avatar", "https://i.pravatar.cc/150?u=" + user.getUsername());
            map.put("location", LOCATIONS[i % LOCATIONS.length]);
            result.add(map);
        }
        return result;
    }

    @GetMapping("/shifts/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getShiftsToday() {
        List<User> staffUsers = operationsUsers();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < LOCATIONS.length; i++) {
            Map<String, Object> row = new HashMap<>();
            String morning = nameAt(staffUsers, i);
            String afternoon = nameAt(staffUsers, i + LOCATIONS.length);
            row.put("location", LOCATIONS[i]);
            row.put("morning", morning);
            row.put("afternoon", afternoon);
            row.put("isWarning", "Trống ca".equals(morning) || "Trống ca".equals(afternoon));
            result.add(row);
        }
        return result;
    }

    @GetMapping("/handover/latest")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Map<String, Object> getLatestHandover() {
        List<ShiftHistory> histories = shiftRepo.findAllByOrderByStartTimeDesc();
        List<User> staffUsers = operationsUsers();

        Map<String, Object> result = new HashMap<>();
        if (!histories.isEmpty()) {
            ShiftHistory latest = histories.get(0);
            result.put("time", latest.getStartTime() != null ? latest.getStartTime().format(TIME_LABEL) : "Chưa ghi nhận");
            result.put("from", personBlock(latest.getShiftType(), latest.getStaffName(), "SHIFT_" + latest.getId()));
            result.put("to", personBlock("CA TIẾP THEO", resolveNextStaffName(latest.getNextStaffId(), staffUsers),
                    latest.getNextStaffId() != null ? latest.getNextStaffId() : "N/A"));

            List<String> notes = new ArrayList<>();
            notes.add("Xe xử lý trong ca: " + (latest.getVehiclesHandled() != null ? latest.getVehiclesHandled() : 0));
            notes.add("Doanh thu hệ thống: " + money(latest.getSystemRevenue()));
            if (latest.getStatus() != null) {
                notes.add("Trạng thái: " + latest.getStatus());
            }
            result.put("notes", notes);
            return result;
        }

        result.put("time", LocalDateTime.now().format(TIME_LABEL));
        result.put("from", personBlock("CA TRƯỚC", nameAt(staffUsers, 0), "AUTO_PREV"));
        result.put("to", personBlock("CA HIỆN TẠI", nameAt(staffUsers, 1), "AUTO_CURRENT"));
        result.put("notes", List.of("Chưa có bản ghi bàn giao ca trong DB.", "Dữ liệu nhân sự đang lấy từ bảng users."));
        return result;
    }

    private List<User> operationsUsers() {
        return userRepo.findAll().stream()
                .filter(user -> user.getRole() == User.Role.ADMIN
                        || user.getRole() == User.Role.MANAGER
                        || user.getRole() == User.Role.STAFF)
                .sorted(Comparator.comparing(this::displayName))
                .toList();
    }

    private String nameAt(List<User> users, int index) {
        return index >= 0 && index < users.size() ? displayName(users.get(index)) : "Trống ca";
    }

    private String displayName(User user) {
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        return user.getUsername() != null ? user.getUsername() : user.getEmail();
    }

    private String roleLabel(User.Role role) {
        if (role == null) {
            return "Nhân viên";
        }
        return switch (role) {
            case ADMIN -> "Quản trị hệ thống";
            case MANAGER -> "Quản lý bãi xe";
            case STAFF -> "Nhân viên cổng";
            case DRIVER -> "Tài xế";
        };
    }

    private String shiftWindow(int index) {
        int mod = index % 3;
        if (mod == 0) {
            return "06:00 - 14:00";
        }
        if (mod == 1) {
            return "14:00 - 22:00";
        }
        return "22:00 - 06:00";
    }

    private Map<String, Object> personBlock(String shift, String name, String id) {
        Map<String, Object> block = new HashMap<>();
        block.put("shift", shift != null ? shift : "CA");
        block.put("name", name != null ? name : "Trống ca");
        block.put("id", id != null ? id : "N/A");
        return block;
    }

    private String resolveNextStaffName(String nextStaffId, List<User> staffUsers) {
        if (nextStaffId == null || nextStaffId.isBlank()) {
            return nameAt(staffUsers, 1);
        }
        return staffUsers.stream()
                .filter(user -> user.getId().toString().equals(nextStaffId))
                .findFirst()
                .map(this::displayName)
                .orElse(nextStaffId);
    }

    private String money(Double value) {
        if (value == null) {
            return "0đ";
        }
        return String.format("%,.0f", value).replace(',', '.') + "đ";
    }
}
