package com.parking.controller;

import com.parking.model.VipSubscription;
import com.parking.service.VipService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.parking.dto.VipRegistrationRequest;


@RestController
@RequestMapping("/api/v1/vip")
public class VipController {

    private final VipService vipService;

    public VipController(VipService vipService) {
        this.vipService = vipService;
    }

    @GetMapping("/pending")
    public List<VipSubscription> getPending() {
        return vipService.getPending();
    }

    @PutMapping("/{id}/approve")
    public VipSubscription approve(
            @PathVariable UUID id) {

        return vipService.approve(id);
    }

    @PutMapping("/{id}/reject")
    public VipSubscription reject(
            @PathVariable UUID id) {

        return vipService.reject(id);
    }

    @PostMapping("/register")
    public VipSubscription register(
            @RequestBody VipRegistrationRequest request) {

        return vipService.register(request);
    }

}