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

    @GetMapping
    public List<Map<String, Object>> getBranches() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Branch b : branchRepo.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId().toString());
            map.put("name", b.getBranchName());
            map.put("location", b.getLocation());
            map.put("manager", "Manager");
            map.put("capacity", b.getTotalCapacity());
            map.put("status", b.getStatus() != null ? b.getStatus() : "ACTIVE");
            result.add(map);
        }
        return result;
    }

    @PostMapping
    public Map<String, Object> createBranch(@RequestBody Map<String, Object> branchData) {
        Branch b = new Branch();
        b.setId(UUID.randomUUID());
        b.setBranchName((String) branchData.get("name"));
        b.setLocation((String) branchData.get("location"));
        if (branchData.get("capacity") != null) {
            b.setTotalCapacity(Integer.parseInt(branchData.get("capacity").toString()));
        }
        branchRepo.save(b);
        return Map.of("success", true, "message", "Thêm cơ sở thành công", "data", branchData);
    }
}
