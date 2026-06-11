package com.parking.service;

import com.parking.model.Vehicle;
import com.parking.repository.VehicleRepository;
import org.springframework.stereotype.Service;

@Service
public class VehicleSecurityService {

    private final VehicleRepository vehicleRepository;

    public VehicleSecurityService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public Vehicle updateLockStatus(String vehicleId, Boolean locked) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setIsLocked(locked);

        return vehicleRepository.save(vehicle);
    }
}