package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.Zone;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sync-zones")
public class SyncController {

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private ParkingSessionRepository parkingSessionRepository;

    @GetMapping
    @Transactional
    public String syncZoneOccupancy() {
        List<Zone> allZones = zoneRepository.findAll();
        for (Zone zone : allZones) {
            long actualActive = parkingSessionRepository.findAll().stream()
                .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE 
                             && zone.getId().equals(s.getAssignedZoneId()))
                .count();
            
            zone.setCurrentOccupied((int) actualActive);
            zoneRepository.save(zone);
        }
        return "Sync successful!";
    }
}
