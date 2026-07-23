package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.model.Vehicle;
import com.parking.model.Transaction;
import com.parking.model.Zone;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.TransactionRepository;
import com.parking.repository.ZoneRepository;
import com.parking.repository.CardRepository;
import com.parking.service.PendingGateVehicleService;
import com.parking.service.ParkingService;
import com.parking.service.DemoVehicleDataset;
import com.parking.dto.ParkingSessionDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Instant;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/sessions")
public class ParkingSessionController {
    private final ParkingSessionRepository repo;
    private final VehicleRepository vehicleRepo;
    private final ZoneRepository zoneRepo;
    private final CardRepository cardRepo;
    private final TransactionRepository transactionRepo;
    private final ParkingService parkingService;
    private final PendingGateVehicleService pendingGateVehicleService;

    public ParkingSessionController(ParkingSessionRepository repo, VehicleRepository vehicleRepo,
            ZoneRepository zoneRepo, CardRepository cardRepo, TransactionRepository transactionRepo, ParkingService parkingService,
            PendingGateVehicleService pendingGateVehicleService) {
        this.repo = repo;
        this.vehicleRepo = vehicleRepo;
        this.zoneRepo = zoneRepo;
        this.cardRepo = cardRepo;
        this.transactionRepo = transactionRepo;
        this.parkingService = parkingService;
        this.pendingGateVehicleService = pendingGateVehicleService;
    }

    private Zone choosePendingZone(String vehicleType, String seed) {
        String resolvedType = DemoVehicleDataset.resolveVehicleType(seed, vehicleType);
        String preferredZoneCode = DemoVehicleDataset.resolveZoneCode(seed, resolvedType);
        List<Zone> preferredZones = zoneRepo.findAll().stream()
                .filter(zone -> zone.getCode() != null && zone.getCode().equalsIgnoreCase(preferredZoneCode))
                .collect(Collectors.toList());
        List<Zone> candidates = !preferredZones.isEmpty()
                ? preferredZones
                : zoneRepo.findByAllowedSizesContaining(resolvedType);
        List<Zone> availableCandidates = candidates.stream()
                .filter(z -> z.getTotalSlots() - z.getCurrentOccupied() > 0)
                .collect(Collectors.toList());
        List<Zone> selectableZones = !availableCandidates.isEmpty() ? availableCandidates : candidates;

        if (selectableZones.isEmpty()) {
            selectableZones = zoneRepo.findAll();
        }
        if (selectableZones.isEmpty()) {
            return null;
        }

        int index = Math.floorMod((seed != null ? seed : resolvedType).hashCode(), selectableZones.size());
        return selectableZones.get(index);
    }

    private void applyDemoMetadata(ParkingSessionDto dto, ParkingSession session, Vehicle vehicle) {
        String plate = dto.getLicensePlate();
        if (plate == null && session != null) {
            plate = session.getLicensePlate();
        }
        String normalizedPlate = DemoVehicleDataset.normalizePlate(plate);
        if (!normalizedPlate.isBlank()) {
            dto.setLicensePlate(normalizedPlate);
        }

        Optional<DemoVehicleDataset.Profile> profileOpt = DemoVehicleDataset.findByPlate(normalizedPlate);
        String fallbackType = vehicle != null ? vehicle.getVehicleSize() : dto.getVehicleType();
        String resolvedType = DemoVehicleDataset.resolveVehicleType(normalizedPlate, fallbackType);
        String fallbackFuel = vehicle != null ? vehicle.getFuelType() : dto.getFuelType();
        String resolvedFuel = DemoVehicleDataset.resolveFuelType(normalizedPlate, fallbackFuel);

        dto.setVehicleType(resolvedType);
        dto.setFuelType(resolvedFuel);
        dto.setImageUrl(DemoVehicleDataset.resolveImageUrl(normalizedPlate, "SESSION_DTO",
                session != null ? session.getMobileCheckoutPhoto() : dto.getImageUrl()));

        profileOpt.ifPresent(profile -> {
            dto.setVehicleBrand(profile.brand());
            dto.setVehicleModel(profile.model());
            dto.setVehicleColor(profile.color());
            dto.setRegistrationDocUrl(profile.registrationDocUrl());
            dto.setRegistrationPhotoUrl(profile.registrationPhotoUrl());
            dto.setIdentityDocUrl(profile.identityDocUrl());
        });

        if (vehicle != null) {
            if (dto.getVehicleBrand() == null) {
                dto.setVehicleBrand(vehicle.getBrand());
            }
            if (dto.getVehicleColor() == null) {
                dto.setVehicleColor(vehicle.getColor());
            }
            if (dto.getVehicleModel() == null) {
                dto.setVehicleModel(vehicle.getBrand());
            }
            if (dto.getRegistrationDocUrl() == null) {
                dto.setRegistrationDocUrl(vehicle.getRegistrationDocUrl());
            }
            if (dto.getRegistrationPhotoUrl() == null) {
                dto.setRegistrationPhotoUrl(vehicle.getRegistrationPhotoUrl());
            }
        }

        if (dto.getAssignedZoneCode() == null || dto.getAssignedZoneCode().isBlank()) {
            dto.setAssignedZoneCode(DemoVehicleDataset.resolveZoneCode(normalizedPlate, resolvedType));
        }
    }

    private ParkingSessionDto convertToDto(ParkingSession session) {
        Vehicle vehicle = null;
        if (session.getLicensePlate() != null) {
            vehicle = vehicleRepo.findByLicensePlate(session.getLicensePlate()).orElse(null);
        }
        ParkingSessionDto dto = new ParkingSessionDto(session, vehicle);
        if (session.getAssignedZoneId() != null) {
            zoneRepo.findById(session.getAssignedZoneId()).ifPresent(z -> {
                dto.setAssignedZoneCode(z.getCode());
            });
        }
        if (session.getCardId() != null) {
            cardRepo.findById(session.getCardId()).ifPresent(card -> dto.setCardCode(card.getCardCode()));
        }
        applyDemoMetadata(dto, session, vehicle);
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public List<ParkingSessionDto> all() {
        List<ParkingSession> sessions = repo.findAll();
        List<String> plates = sessions.stream()
                .map(ParkingSession::getLicensePlate)
                .filter(plate -> plate != null)
                .distinct()
                .collect(Collectors.toList());

        java.util.Map<String, Vehicle> vehicleMap = new java.util.HashMap<>();
        if (!plates.isEmpty()) {
            vehicleRepo.findAll().stream()
                    .filter(v -> plates.contains(v.getLicensePlate()))
                    .forEach(v -> vehicleMap.put(v.getLicensePlate(), v));
        }

        java.util.Map<UUID, Zone> zoneMap = new java.util.HashMap<>();
        zoneRepo.findAll().forEach(z -> zoneMap.put(z.getId(), z));

        List<ParkingSessionDto> result = sessions.stream().map(session -> {
            Vehicle vehicle = null;
            if (session.getLicensePlate() != null) {
                vehicle = vehicleMap.get(session.getLicensePlate());
            }
            ParkingSessionDto dto = new ParkingSessionDto(session, vehicle);
            if (session.getAssignedZoneId() != null) {
                Zone z = zoneMap.get(session.getAssignedZoneId());
                if (z != null) {
                    dto.setAssignedZoneCode(z.getCode());
                }
            }
            if (session.getCardId() != null) {
                cardRepo.findById(session.getCardId()).ifPresent(card -> dto.setCardCode(card.getCardCode()));
            }
            applyDemoMetadata(dto, session, vehicle);
            return dto;
        }).collect(Collectors.toList());

        pendingGateVehicleService.findAll().forEach(pending -> {
            ParkingSessionDto dto = new ParkingSessionDto(
                    pending.getId(),
                    pending.getLicensePlate(),
                    pending.getDetectedAt(),
                    ParkingSession.SessionStatus.ACTIVE.name(),
                    pending.getEntryGate(),
                    pending.isVip(),
                    pending.isSuspicious(),
                    pending.getSuspiciousReason()
            );
            dto.setVehicleType(pending.getVehicleType());
            if (pending.getAssignedZoneId() != null || pending.getAssignedZoneCode() != null) {
                dto.setAssignedZoneId(pending.getAssignedZoneId());
                dto.setAssignedZoneCode(pending.getAssignedZoneCode());
            } else {
                Zone chosen = choosePendingZone(pending.getVehicleType(), pending.getLicensePlate());
                if (chosen != null) {
                    dto.setAssignedZoneCode(chosen.getCode());
                    dto.setAssignedZoneId(chosen.getId());
                } else {
                    dto.setAssignedZoneCode("F1");
                }
            }
            applyDemoMetadata(dto, null, null);
            result.add(dto);
        });

        return result;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionDto> get(@PathVariable UUID id) {
        Optional<ParkingSession> s = repo.findById(id);
        return s.map(this::convertToDto).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. Tạo thủ công phiên đỗ xe (Khóa chặt cho cấp quản lý để chống gian lận)
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ParkingSession create(@RequestBody ParkingSession s) {
        return repo.save(s);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSession> update(@PathVariable UUID id, @RequestBody ParkingSession s) {
        return repo.findById(id).map(existing -> {
            s.setId(existing.getId());
            return ResponseEntity.ok(repo.save(s));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 5. Xóa lịch sử phiên đỗ xe (Tác vụ tối nguy hiểm, chỉ ADMIN được làm)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Phê duyệt cưỡng chế mở barrier cho xe vào bốt (Dành cho nhân viên vận hành
    // trực ca)
    @PostMapping("/approve-entry")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<?> approveEntry(@RequestBody java.util.Map<String, String> payload) {
        String plate = payload.get("plate");
        try {
            Optional<PendingGateVehicleService.PendingEntry> pendingEntry = pendingGateVehicleService.removeByPlate(plate);
            if (pendingEntry.isPresent()) {
                parkingService.approvePendingEntry(pendingEntry.get());
            } else {
                parkingService.approveEntry(plate);
            }
            return ResponseEntity.ok(java.util.Collections.singletonMap("success", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/approve-exit")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<?> approveExit(@RequestBody java.util.Map<String, String> payload) {
        String plate = payload.get("plate");
        try {
            parkingService.approveExit(plate);
            return ResponseEntity.ok(java.util.Collections.singletonMap("success", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 7. Xem thống kê lưu lượng xe trong ngày (Chỉ dành cho Manager và Admin xem
    // báo cáo)
    @GetMapping("/daily-volume")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getDailyVolume() {
        List<ParkingSession> all = repo.findAll();
        long volume = all.size();
        return ResponseEntity.ok(java.util.Map.of("volume", volume));
    }
}
