package com.parking.service;

import com.parking.model.ParkingSession;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class VehicleSecurityService {

    private final ParkingSessionRepository parkingSessionRepository;

    public VehicleSecurityService(ParkingSessionRepository parkingSessionRepository) {
        this.parkingSessionRepository = parkingSessionRepository;
    }

    public ParkingSession updateLockStatus(UUID vehicleId, Boolean locked) {
        int updatedRows = parkingSessionRepository.updateLockStatusByVehicleId(
                vehicleId,
                ParkingSession.SessionStatus.ACTIVE,
                locked
        );

        if (updatedRows == 0) {
            throw new RuntimeException("Active parking session not found");
        }

        return parkingSessionRepository
                .findByVehicleIdAndSessionStatus(vehicleId, ParkingSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Active parking session not found"));
    }
}