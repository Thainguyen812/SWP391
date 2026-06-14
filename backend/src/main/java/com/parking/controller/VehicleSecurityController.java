package com.parking.controller;

import com.parking.dto.VehicleLockRequest;
import com.parking.model.ParkingSession;
import com.parking.service.VehicleSecurityService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleSecurityController {

    private final VehicleSecurityService vehicleSecurityService;

    public VehicleSecurityController(VehicleSecurityService vehicleSecurityService) {
        this.vehicleSecurityService = vehicleSecurityService;
    }

    @PostMapping("/{vehicleId}/lock")
    public ParkingSession updateLockStatus(
            @PathVariable UUID vehicleId,
            @RequestBody VehicleLockRequest request
    ) {
        return vehicleSecurityService.updateLockStatus(vehicleId, request.getLocked());
    }
}