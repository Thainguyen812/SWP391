package com.parking.controller;

import com.parking.dto.RegisterRequest;
import com.parking.model.User;
import com.parking.repository.UserRepository;
import com.parking.repository.ShiftHistoryRepository;
import com.parking.service.PersonnelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/personnel")
public class PersonnelController {

    private final UserRepository userRepo;
    private final ShiftHistoryRepository shiftRepo;
    private final PersonnelService personnelService; // Nạp thêm Service mới vào đây

    // Cập nhật lại Constructor để Spring Boot tự động inject cả 3 thành phần
    public PersonnelController(UserRepository userRepo, ShiftHistoryRepository shiftRepo, PersonnelService personnelService) {
        this.userRepo = userRepo;
        this.shiftRepo = shiftRepo;
        this.personnelService = personnelService;
    }

    // ==========================================
    // API MỚI THÊM: POST /api/personnel/add
    // ==========================================
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')") // Chỉ Admin/Manager mới có quyền tạo nhân viên
    public ResponseEntity<?> addPersonnel(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getPassword() == null || request.getRole() == null) {
            return ResponseEntity.badRequest().body("Các trường username, password và role không được để trống!");
        }

        try {
            User savedUser = personnelService.createPersonnel(request);
            savedUser.setPassword("[PROTECTED]"); // Giấu mật khẩu đã mã hóa trước khi trả về client
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // CÁC API CŨ CỦA BẠN (GIỮ NGUYÊN HOÀN TOÀN)
    // ==========================================
    @GetMapping("/list")
    public List<Map<String, Object>> getPersonnelList() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : userRepo.findAll()) {
            if ("VIP".equals(u.getRole().name())) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId().toString());
            map.put("name", u.getFullName() != null ? u.getFullName() : u.getUsername());
            map.put("role", u.getRole() != null ? u.getRole().name() : "STAFF");
            map.put("status", u.getStatus() != null ? u.getStatus().name().toLowerCase() : "active");
            map.put("time", "06:00 - 14:00");
            map.put("phone", u.getPhone() != null ? u.getPhone() : "...0000");
            map.put("avatar", "https://i.pravatar.cc/150?u=" + u.getUsername());
            result.add(map);
        }
        return result;
    }

    @GetMapping("/shifts/today")
    public List<Map<String, Object>> getShiftsToday() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Object> s1 = new HashMap<>();
        s1.put("location", "Cổng vào 1");
        s1.put("morning", "Nguyễn Văn An");
        s1.put("afternoon", "Trần Thị Bình");

        Map<String, Object> s2 = new HashMap<>();
        s2.put("location", "Cổng ra 1");
        s2.put("morning", "Phạm Đức Duy");
        s2.put("afternoon", "Trống ca");
        s2.put("isWarning", true);

        Map<String, Object> s3 = new HashMap<>();
        s3.put("location", "Tuần tra hầm B1");
        s3.put("morning", "Hoàng Yến");
        s3.put("afternoon", "Lê Văn Cường");

        result.add(s1);
        result.add(s2);
        result.add(s3);
        return result;
    }

    @GetMapping("/handover/latest")
    public Map<String, Object> getLatestHandover() {
        Map<String, Object> result = new HashMap<>();
        result.put("time", "Hôm nay, 06:05");

        Map<String, Object> from = new HashMap<>();
        from.put("shift", "CA ĐÊM");
        from.put("name", "Nguyễn Văn An");
        from.put("id", "NVA_123");

        Map<String, Object> to = new HashMap<>();
        to.put("shift", "CA SÁNG");
        to.put("name", "Trần Thị Bình");
        to.put("id", "TTB_456");

        result.put("from", from);
        result.put("to", to);
        result.put("notes", Arrays.asList("Hệ thống barrier hoạt động tốt", "Tiền mặt: 1,500,000 VND"));
        return result;
    }
}