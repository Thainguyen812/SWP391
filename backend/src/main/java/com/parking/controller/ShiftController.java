package com.parking.controller;

import com.parking.model.ShiftHistory;
import com.parking.dto.HandoverRequest;
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
    public ResponseEntity<ShiftHistory> handoverShift(@RequestBody HandoverRequest request) {
        // Find current active shift and end it
        List<ShiftHistory> allShifts = shiftRepo.findAll();
        for (ShiftHistory s : allShifts) {
            if (s.getIsCurrent() != null && s.getIsCurrent()) {
                s.setIsCurrent(false);
                s.setEndTime(LocalDateTime.now());
                s.setStatus("HOÀN THÀNH");
                s.setSystemRevenue(request.getSystemRevenue());
                s.setSystemCash(request.getSystemCash());
                s.setSystemTransfer(request.getSystemTransfer());
                s.setDeclaredCash(request.getDeclaredCash());
                s.setVehiclesHandled(request.getVehiclesHandled());
                s.setNextStaffId(request.getNextStaffId());
                shiftRepo.save(s);
            }
        }

        // Create new shift
        ShiftHistory newShift = new ShiftHistory();
        newShift.setStaffName(request.getNextStaffName());
        newShift.setShiftType(request.getNextShiftType() != null ? request.getNextShiftType() : "Sáng");
        newShift.setStartTime(LocalDateTime.now());
        newShift.setIsCurrent(true);
        newShift.setStatus("ĐANG TRỰC");
        newShift.setVehiclesHandled(0);
        ShiftHistory saved = shiftRepo.save(newShift);
        return ResponseEntity.ok(saved);
    }
}
