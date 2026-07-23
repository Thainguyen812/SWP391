package com.parking.controller;

import com.parking.dto.RegisterRequest;
import com.parking.model.ShiftHistory;
import com.parking.model.User;
import com.parking.model.WeeklySchedule;
import com.parking.repository.ShiftHistoryRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.WeeklyScheduleRepository;
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
import java.util.Optional;

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
    private final WeeklyScheduleRepository weeklyScheduleRepo;

    public PersonnelController(UserRepository userRepo, ShiftHistoryRepository shiftRepo,
            PersonnelService personnelService, WeeklyScheduleRepository weeklyScheduleRepo) {
        this.userRepo = userRepo;
        this.shiftRepo = shiftRepo;
        this.personnelService = personnelService;
        this.weeklyScheduleRepo = weeklyScheduleRepo;
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

    @org.springframework.web.bind.annotation.DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> deletePersonnel(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        try {
            userRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa nhân viên thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi khi xóa nhân viên"));
        }
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getPersonnelList() {
        List<User> staffUsers = operationsUsers();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < staffUsers.size(); i++) {
            User user = staffUsers.get(i);
            WeeklySchedule ws = getOrGenerateSchedule(user, i);
            String todayShift = getTodayShift(ws);
            boolean isOnDuty = "Ca Sáng".equals(todayShift) || "Ca Chiều".equals(todayShift) || "Ca Đêm".equals(todayShift);
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId().toString());
            map.put("name", displayName(user));
            map.put("role", roleLabel(user.getRole()));
            map.put("roleCode", user.getRole() != null ? user.getRole().name() : "STAFF");
            map.put("status", isOnDuty ? "active" : "inactive");
            map.put("statusLabel", isOnDuty ? "Đang trực" : "Nghỉ phép");
            
            String timeStr = "Nghỉ";
            if ("Ca Sáng".equals(todayShift)) timeStr = "06:00 - 14:00";
            else if ("Ca Chiều".equals(todayShift)) timeStr = "14:00 - 22:00";
            else if ("Ca Đêm".equals(todayShift)) timeStr = "22:00 - 06:00";
            
            map.put("time", timeStr);
            map.put("phone", user.getPhone() != null ? user.getPhone() : user.getEmail());
            
            // Use local SVG placeholder or UI avatars instead of external network images
            String defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e2e8f0'/><text x='50' y='55' font-size='40' text-anchor='middle' alignment-baseline='middle' fill='%2364748b'>" + user.getUsername().substring(0, 1).toUpperCase() + "</text></svg>";
            map.put("avatar", defaultAvatar);
            
            map.put("location", LOCATIONS[i % LOCATIONS.length]);
            result.add(map);
        }
        return result;
    }

    private String getTodayShift(WeeklySchedule schedule) {
        java.time.DayOfWeek day = java.time.LocalDate.now().getDayOfWeek();
        switch (day) {
            case MONDAY: return schedule.getMon();
            case TUESDAY: return schedule.getTue();
            case WEDNESDAY: return schedule.getWed();
            case THURSDAY: return schedule.getThu();
            case FRIDAY: return schedule.getFri();
            case SATURDAY: return schedule.getSat();
            case SUNDAY: return schedule.getSun();
            default: return "Chưa phân ca";
        }
    }

    @GetMapping("/shifts/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getShiftsToday() {
        List<User> staffUsers = operationsUsers();
        Map<java.util.UUID, String> userNames = new HashMap<>();
        for (User u : staffUsers) {
            userNames.put(u.getId(), displayName(u));
        }

        List<String> morningUsers = new ArrayList<>();
        List<String> afternoonUsers = new ArrayList<>();

        for (int i = 0; i < staffUsers.size(); i++) {
            User u = staffUsers.get(i);
            WeeklySchedule s = getOrGenerateSchedule(u, i);
            String todayShift = getTodayShift(s);
            String name = userNames.get(u.getId());
            if (name != null) {
                if ("Ca Sáng".equals(todayShift)) morningUsers.add(name);
                else if ("Ca Chiều".equals(todayShift)) afternoonUsers.add(name);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < LOCATIONS.length; i++) {
            Map<String, Object> row = new HashMap<>();
            String morning = i < morningUsers.size() ? morningUsers.get(i) : "Trống ca";
            String afternoon = i < afternoonUsers.size() ? afternoonUsers.get(i) : "Trống ca";
            row.put("location", LOCATIONS[i]);
            row.put("morning", morning);
            row.put("afternoon", afternoon);
            row.put("isWarning", "Trống ca".equals(morning) || "Trống ca".equals(afternoon));
            result.add(row);
        }
        return result;
    }

    @GetMapping("/shifts/weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getWeeklyShifts() {
        List<User> staffUsers = operationsUsers();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < staffUsers.size(); i++) {
            User user = staffUsers.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("key", user.getId().toString());
            row.put("name", displayName(user));
            
            WeeklySchedule s = getOrGenerateSchedule(user, i);
            row.put("mon", s.getMon());
            row.put("tue", s.getTue());
            row.put("wed", s.getWed());
            row.put("thu", s.getThu());
            row.put("fri", s.getFri());
            row.put("sat", s.getSat());
            row.put("sun", s.getSun());
            result.add(row);
        }
        return result;
    }

    @PostMapping("/shifts/weekly/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateWeeklyShifts(@RequestBody List<com.parking.dto.WeeklyScheduleRequest> requests) {
        for (com.parking.dto.WeeklyScheduleRequest req : requests) {
            WeeklySchedule schedule = weeklyScheduleRepo.findByUserId(req.getUserId())
                    .orElseGet(() -> {
                        WeeklySchedule s = new WeeklySchedule();
                        s.setUserId(req.getUserId());
                        return s;
                    });
            
            schedule.setMon(req.getMon());
            schedule.setTue(req.getTue());
            schedule.setWed(req.getWed());
            schedule.setThu(req.getThu());
            schedule.setFri(req.getFri());
            schedule.setSat(req.getSat());
            schedule.setSun(req.getSun());
            
            weeklyScheduleRepo.save(schedule);
        }
        return ResponseEntity.ok(Map.of("message", "Cập nhật lịch tuần thành công"));
    }

    @PostMapping("/handover")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public org.springframework.http.ResponseEntity<Map<String, String>> submitHandover(@org.springframework.web.bind.annotation.RequestBody Map<String, Object> payload) {
        String currentStaff = (String) payload.get("currentStaff");
        String nextStaffId = (String) payload.get("nextStaffId");
        Double declaredCash = null;
        if (payload.get("declaredCash") != null) {
            declaredCash = Double.valueOf(payload.get("declaredCash").toString());
        }

        ShiftHistory history = new ShiftHistory();
        history.setStaffName(currentStaff != null ? currentStaff : "Unknown Staff");
        history.setShiftType("SHIFT_" + System.currentTimeMillis()); // generate shift code
        history.setStartTime(LocalDateTime.now().minusHours(8));
        history.setEndTime(LocalDateTime.now());
        history.setVehiclesHandled(0);
        history.setStatus("COMPLETED");
        history.setIsCurrent(false);
        history.setDeclaredCash(declaredCash);
        history.setNextStaffId(nextStaffId);

        shiftRepo.save(history);

        Map<String, String> result = new HashMap<>();
        result.put("message", "Bàn giao ca thành công");
        return org.springframework.http.ResponseEntity.ok(result);
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
            result.put("to", personBlock("CA TIẾP THEO", resolveNextStaffName(latest.getNextStaffId(), staffUsers, latest.getStaffName()),
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
                .filter(user -> user.getStatus() == null || user.getStatus() != User.Status.SUSPENDED)
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

    @GetMapping("/handover/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Map<String, Object>> getHandoverHistory() {
        List<ShiftHistory> histories = shiftRepo.findAllByOrderByStartTimeDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (ShiftHistory h : histories) {
            Map<String, Object> map = new HashMap<>();
            map.put("key", h.getId().toString());
            map.put("assignedStaff", h.getStaffName());
            map.put("shiftName", h.getShiftType());
            map.put("time", h.getStartTime() != null ? h.getStartTime().toString() : null);
            map.put("endTime", h.getEndTime() != null ? h.getEndTime().toString() : null);
            map.put("status", h.getStatus());
            map.put("vehiclesHandled", h.getVehiclesHandled());
            map.put("systemRevenue", h.getSystemRevenue());
            map.put("systemCash", h.getSystemCash());
            map.put("declaredCash", h.getDeclaredCash());
            
            Double diff = null;
            if (h.getSystemCash() != null && h.getDeclaredCash() != null) {
                diff = h.getDeclaredCash() - h.getSystemCash();
            }
            map.put("difference", diff);
            
            result.add(map);
        }
        
        return result;
    }

    private String resolveNextStaffName(String nextStaffId, List<User> staffUsers, String currentStaffName) {
        if (nextStaffId == null || nextStaffId.isBlank()) {
            String fallbackName = nameAt(staffUsers, 1);
            if (fallbackName != null && fallbackName.equals(currentStaffName)) {
                return nameAt(staffUsers, 2);
            }
            return fallbackName;
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

    private WeeklySchedule getOrGenerateSchedule(User user, int index) {
        return weeklyScheduleRepo.findByUserId(user.getId()).map(ws -> {
            if ("Nghỉ".equals(ws.getThu()) && "Nghỉ".equals(ws.getFri()) && "Nghỉ".equals(ws.getSat())) {
                String shift = (index % 2 == 0) ? "Ca Sáng" : "Ca Chiều";
                ws.setMon(shift);
                ws.setTue(shift);
                ws.setWed(shift);
                ws.setThu(shift);
                ws.setFri(shift);
                ws.setSat(shift);
                ws.setSun(shift);
                return weeklyScheduleRepo.save(ws);
            }
            return ws;
        }).orElseGet(() -> {
            WeeklySchedule ws = new WeeklySchedule();
            ws.setUserId(user.getId());
            String shift = (index % 2 == 0) ? "Ca Sáng" : "Ca Chiều";
            ws.setMon(shift);
            ws.setTue(shift);
            ws.setWed(shift);
            ws.setThu(shift);
            ws.setFri(shift);
            ws.setSat(shift);
            ws.setSun(shift);
            return weeklyScheduleRepo.save(ws);
        });
    }
}
