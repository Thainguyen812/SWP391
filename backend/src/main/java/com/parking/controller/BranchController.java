package com.parking.controller;

import com.parking.model.Branch;
import com.parking.repository.BranchRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/branches")
public class BranchController {
    
    private final BranchRepository branchRepo;

    public BranchController(BranchRepository branchRepo) {
        this.branchRepo = branchRepo;
    }

    @PostMapping
    public Map<String, Object> createBranch(@RequestBody Map<String, Object> branchData) {
        // Dummy create
        return Map.of("success", true, "message", "Thêm co s? thành công", "data", branchData);
    }
}
