package com.parking.controller;

import com.parking.model.ShiftHistory;
import com.parking.repository.ShiftHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
public class ShiftController {

    private final ShiftHistoryRepository shiftRepo;

    public ShiftController(ShiftHistoryRepository shiftRepo) {
        this.shiftRepo = shiftRepo;
    }

    @GetMapping
    public List<ShiftHistory> getAllShifts() {
        return shiftRepo.findAllByOrderByStartTimeDesc();
    }

    @PostMapping("/handover")
    public ResponseEntity<ShiftHistory> handoverShift(@RequestBody ShiftHistory shift) {
        // Find current active shift and end it
        List<ShiftHistory> allShifts = shiftRepo.findAll();
        for (ShiftHistory s : allShifts) {
            if (s.getIsCurrent() != null && s.getIsCurrent()) {
                s.setIsCurrent(false);
                s.setEndTime(LocalDateTime.now());
                s.setStatus("HOÀN THÀNH");
                shiftRepo.save(s);
            }
        }

        // Create new shift
        shift.setStartTime(LocalDateTime.now());
        shift.setIsCurrent(true);
        shift.setStatus("ĐANG TRỰC");
        shift.setVehiclesHandled(0);
        ShiftHistory saved = shiftRepo.save(shift);
        return ResponseEntity.ok(saved);
    }
}
