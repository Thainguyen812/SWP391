package com.parking.service.impl;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;
import com.parking.exception.ApiExceptions;
import com.parking.model.BlacklistEntry;
import com.parking.model.ParkingSession;
import com.parking.model.VipSubscription;
import com.parking.model.Zone;
import com.parking.model.Vehicle;
import com.parking.repository.BlacklistRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.ZoneRepository;
import com.parking.service.ParkingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ParkingServiceImpl implements ParkingService {

    private final BlacklistRepository blacklistRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ZoneRepository zoneRepository;
    private final VipSubscriptionRepository vipSubscriptionRepository;
    private final VehicleRepository vehicleRepository;

    public ParkingServiceImpl(BlacklistRepository blacklistRepository,
                              ParkingSessionRepository parkingSessionRepository,
                              ZoneRepository zoneRepository,
                              VipSubscriptionRepository vipSubscriptionRepository,
                              VehicleRepository vehicleRepository) {
        this.blacklistRepository = blacklistRepository;
        this.parkingSessionRepository = parkingSessionRepository;
        this.zoneRepository = zoneRepository;
        this.vipSubscriptionRepository = vipSubscriptionRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @Transactional
    public CheckInResponse aiCheckIn(AiCheckInRequest request) {
        String plate = request.getPlate();
        Double confidence = request.getConfidence_score() != null ? request.getConfidence_score() : 0.0;

        // Blacklist check: attempt to resolve vehicle and check card blacklist
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            java.util.UUID vehicleUuid = vehicle.getId();
            try {
                Optional<BlacklistEntry> black = blacklistRepository.findByCardId(vehicleUuid);
                if (black.isPresent()) {
                    throw new ApiExceptions.ForbiddenException("License plate is associated with a blacklisted card");
                }
            } catch (Exception ignore) {
                // ignore lookup errors and continue strict flow
            }
        }
        // Duplicate active session check
        Optional<ParkingSession> existing = parkingSessionRepository.findByLicensePlateAndSessionStatus(plate, ParkingSession.SessionStatus.ACTIVE);
        if (existing.isPresent()) {
            throw new ApiExceptions.ConflictException("Active parking session already exists for this vehicle");
        }

        // Confidence threshold
        if (confidence < 70.0) {
            throw new ApiExceptions.BadRequestException("Ảnh mờ, yêu cầu tài xế chuyển sang dùng quét mã QR Động vào bãi");
        }

        // Find matching zone
        List<Zone> candidates = zoneRepository.findByAllowedSizesContaining(request.getVehicle_type());
        Zone chosen = null;
        for (Zone z : candidates) {
            if (z.getTotalSlots() - z.getCurrentOccupied() > 0) {
                chosen = z;
                break;
            }
        }
        if (chosen == null) {
            throw new ApiExceptions.BadRequestException("No available zone for vehicle type");
        }

        // Increment occupancy
        chosen.setCurrentOccupied(chosen.getCurrentOccupied() + 1);
        zoneRepository.save(chosen);

        // VIP check: resolve vehicle then lookup subscription by vehicle id
        boolean isVip = false;
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            java.util.UUID vehicleUuid = vehicle.getId();
            Optional<VipSubscription> vip = vipSubscriptionRepository.findByVehicleIdAndStatus(vehicleUuid, VipSubscription.Status.ACTIVE);
            if (vip.isPresent()) isVip = true;
        }

        // Create session
        ParkingSession ps = new ParkingSession();
        ps.setId(UUID.randomUUID());
        ps.setLicensePlate(plate);
        ps.setCheckInTime(Instant.now());
        ps.setAssignedZoneId(chosen.getId());
        ps.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
        ps.setIsVip(isVip);
        // store image url if provided
        ps.setMobileCheckoutPhoto(request.getImage_url());

        parkingSessionRepository.save(ps);

        return new CheckInResponse(ps.getId().toString(), chosen.getCode(), "OK");
    }
}
