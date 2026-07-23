package com.parking.service;

import com.parking.model.SecurityAlert;
import com.parking.model.ParkingSession;
import com.parking.model.Transaction;
import com.parking.model.Zone;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.SecurityAlertRepository;
import com.parking.repository.TransactionRepository;
import com.parking.repository.ZoneRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TrafficSimulatorTask {

    private final ParkingSessionRepository sessionRepo;
    private final TransactionRepository transactionRepo;
    private final ZoneRepository zoneRepo;
    private final SecurityAlertRepository alertRepo;
    private final PendingGateVehicleService pendingGateVehicleService;

    public TrafficSimulatorTask(ParkingSessionRepository sessionRepo, TransactionRepository transactionRepo, ZoneRepository zoneRepo,
            SecurityAlertRepository alertRepo, PendingGateVehicleService pendingGateVehicleService) {
        this.sessionRepo = sessionRepo;
        this.transactionRepo = transactionRepo;
        this.zoneRepo = zoneRepo;
        this.alertRepo = alertRepo;
        this.pendingGateVehicleService = pendingGateVehicleService;
    }

    private final List<String> IN_GATES = Arrays.asList("L-VÀO 1", "L-VÀO 2", "L-VÀO 3");
    private final List<String> OUT_GATES = Arrays.asList("L-RA 1", "L-RA 2", "L-RA 3");

    private static final double VIP_ENTRY_RATIO = 0.40;

    @Scheduled(fixedDelay = 45000)
    public void simulateTraffic() {
        try {
            // Logic Check-in: Clear entry gates that have been occupied for > 90s
            Instant threshold = Instant.now().minus(90, ChronoUnit.SECONDS);
            List<ParkingSession> allSessions = sessionRepo.findAll();
            List<PendingGateVehicleService.PendingEntry> processingIns = pendingGateVehicleService.findAll();

            // AUTOMATIC CHECK-IN COMMENTED OUT - wait for manual staff approval
            /*
            for (ParkingSession s : processingIns) {
                if (s.getCheckInTime() != null && s.getCheckInTime().isBefore(threshold)) {
                    s.setEntryGate(null); // Clear the gate, vehicle is now fully inside
                    sessionRepo.save(s);
                }
            }
            */

            // Logic Check-out: Find cars at exit gates
            List<ParkingSession> processingOuts = allSessions.stream()
                .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE && s.getExitGate() != null)
                .collect(Collectors.toList());

            // AUTOMATIC CHECK-OUT COMMENTED OUT - wait for manual staff payment
            /*
            for (ParkingSession s : processingOuts) {
                if (s.getCheckOutTime() != null && s.getCheckOutTime().isBefore(threshold)) {
                    s.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
                    s.setExitGate(null); // Clear the exit gate, vehicle left
                    sessionRepo.save(s);
                    
                    Transaction t = new Transaction();
                    t.setId(UUID.randomUUID());
                    t.setSessionId(s.getId());
                    long hours = java.time.Duration.between(s.getCheckInTime(), Instant.now()).toHours();
                    long fee = 30000;
                    if (hours > 2) {
                        fee += (hours - 2) * 10000;
                    }
                    if (s.getIsVip() != null && s.getIsVip()) {
                        fee = 0;
                    }
                    t.setTotalAmount(new BigDecimal(String.valueOf(fee)));
                    t.setPaymentMethod(Transaction.PaymentMethod.CASH);
                    t.setPaymentStatus(Transaction.PaymentStatus.SUCCESS);
                    t.setProcessedAt(Instant.now());
                    t.setIsMobileCheckout(false);
                    transactionRepo.save(t);
                }
            }
            */

            // Every 45s, simulate one new random vehicle for each empty entry gate.
            List<String> occupiedInGates = processingIns.stream()
                .map(PendingGateVehicleService.PendingEntry::getEntryGate)
                .collect(Collectors.toList());
            List<String> emptyInGates = IN_GATES.stream().filter(g -> !occupiedInGates.contains(g)).collect(Collectors.toList());

            if (!emptyInGates.isEmpty()) {
                List<String> unavailablePlates = new ArrayList<>();
                processingIns.forEach(p -> unavailablePlates.add(DemoVehicleDataset.normalizePlate(p.getLicensePlate())));
                allSessions.stream()
                        .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE || s.getSessionStatus() == ParkingSession.SessionStatus.PASSED_CONFIRMED)
                        .forEach(s -> unavailablePlates.add(DemoVehicleDataset.normalizePlate(s.getLicensePlate())));

                List<DemoVehicleDataset.Profile> availableVisitors = DemoVehicleDataset.profiles().stream()
                        .filter(profile -> !profile.vip())
                        .filter(profile -> !unavailablePlates.contains(DemoVehicleDataset.normalizePlate(profile.plate())))
                        .collect(Collectors.toCollection(ArrayList::new));
                List<DemoVehicleDataset.Profile> availableVips = DemoVehicleDataset.profiles().stream()
                        .filter(DemoVehicleDataset.Profile::vip)
                        .filter(profile -> !unavailablePlates.contains(DemoVehicleDataset.normalizePlate(profile.plate())))
                        .collect(Collectors.toCollection(ArrayList::new));
                
                // Fallback: If all specific profiles are currently inside, allow completed profiles to cycle back
                if (availableVisitors.isEmpty()) {
                    availableVisitors = DemoVehicleDataset.profiles().stream()
                            .filter(profile -> !profile.vip())
                            .collect(Collectors.toCollection(ArrayList::new));
                }
                if (availableVips.isEmpty()) {
                    availableVips = DemoVehicleDataset.profiles().stream()
                            .filter(DemoVehicleDataset.Profile::vip)
                            .collect(Collectors.toCollection(ArrayList::new));
                }

                java.util.Collections.shuffle(availableVisitors);
                java.util.Collections.shuffle(availableVips);

                int visitorIndex = 0;
                int vipIndex = 0;
                int generatedTotal = 0;
                java.util.Collections.shuffle(emptyInGates);
                int vipQuota = emptyInGates.size() == 1
                        ? (Math.random() < VIP_ENTRY_RATIO ? 1 : 0)
                        : Math.max(1, (int) Math.round(emptyInGates.size() * VIP_ENTRY_RATIO));
                int generatedVipCount = 0;
                for (String selectedGate : emptyInGates) {
                    boolean shouldGenerateVip = generatedVipCount < vipQuota;
                    DemoVehicleDataset.Profile profile = null;
                    if (shouldGenerateVip && vipIndex < availableVips.size()) {
                        profile = availableVips.get(vipIndex++);
                        generatedVipCount++;
                    } else if (visitorIndex < availableVisitors.size()) {
                        profile = availableVisitors.get(visitorIndex++);
                    } else if (vipIndex < availableVips.size()) {
                        profile = availableVips.get(vipIndex++);
                        generatedVipCount++;
                    }

                    if (profile == null) {
                        continue;
                    }

                    ParkingSession session = new ParkingSession();
                    session.setId(UUID.randomUUID());
                    session.setLicensePlate(profile.plate());
                    session.setCheckInTime(Instant.now());
                    session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
                    session.setEntryGate(selectedGate);
                    session.setIsVip(profile.vip());

                    String resolvedVehicleType = profile.vehicleType();
                    String preferredZoneCode = profile.zoneCode();
                    List<Zone> candidates = zoneRepo.findAll().stream()
                            .filter(z -> z.getCode() != null && z.getCode().equalsIgnoreCase(preferredZoneCode))
                            .collect(Collectors.toList());
                    if (candidates.isEmpty()) {
                        candidates = zoneRepo.findByAllowedSizesContaining(resolvedVehicleType);
                    }
                    Zone chosen = null;
                    if (!candidates.isEmpty()) {
                        List<Zone> availableCandidates = candidates.stream()
                                .filter(z -> z.getTotalSlots() - z.getCurrentOccupied() > 0)
                                .collect(Collectors.toList());
                        List<Zone> selectableZones = !availableCandidates.isEmpty() ? availableCandidates : candidates;
                        chosen = selectableZones.get((int) (Math.random() * selectableZones.size()));
                    } else {
                        List<Zone> allZones = zoneRepo.findAll();
                        if (!allZones.isEmpty()) {
                            chosen = allZones.get((int) (Math.random() * allZones.size()));
                        }
                    }

                    if (chosen != null) {
                        session.setAssignedZoneId(chosen.getId());
                    } else {
                        return; // Cannot simulate without zones
                    }

                    if (Math.random() < 0.1) {
                        session.setIsSuspicious(true);
                        session.setSuspiciousReason("Cảnh báo AI: Dấu hiệu bất thường (Mô phỏng)");

                        SecurityAlert alert = new SecurityAlert();
                        alert.setAlertType("AI_WARNING");
                        alert.setLicensePlate(session.getLicensePlate());
                        alert.setReason("Phát hiện biển số giả mạo hoặc bất thường (Mô phỏng)");
                        alert.setIsActionable(true);
                        alert.setIsResolved(false);
                        alertRepo.save(alert);
                    }
                    boolean added = pendingGateVehicleService.add(new PendingGateVehicleService.PendingEntry(
                        session.getId(),
                        session.getLicensePlate(),
                        session.getEntryGate(),
                        Boolean.TRUE.equals(session.getIsVip()),
                        Boolean.TRUE.equals(session.getIsSuspicious()),
                        session.getSuspiciousReason(),
                        resolvedVehicleType,
                        session.getCheckInTime(),
                        chosen.getId(),
                        chosen.getCode()
                    ));
                    if (added) {
                        generatedTotal++;
                    }
                }
            }

            // Every 45s, move one eligible parked vehicle to each empty exit gate.
            Instant exitEligibilityThreshold = Instant.now().minus(30, ChronoUnit.SECONDS);
            List<String> occupiedOutGates = processingOuts.stream().map(ParkingSession::getExitGate).collect(Collectors.toList());
            List<String> emptyOutGates = OUT_GATES.stream().filter(g -> !occupiedOutGates.contains(g)).collect(Collectors.toList());

            if (!emptyOutGates.isEmpty()) {
                List<ParkingSession> insideVehicles = allSessions.stream()
                    .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE
                              && s.getExitGate() == null)
                    .filter(s -> s.getEntryGate() == null
                              || s.getCardId() != null
                              || Boolean.TRUE.equals(s.getIsVip()))
                    .filter(s -> s.getCheckInTime() != null && s.getCheckInTime().isBefore(exitEligibilityThreshold))
                    .filter(s -> processingIns.stream()
                            .noneMatch(p -> p.getLicensePlate().equalsIgnoreCase(s.getLicensePlate())))
                    .collect(Collectors.toList());

                java.util.Collections.shuffle(insideVehicles);
                int vehicleIndex = 0;
                for (String selectedGate : emptyOutGates) {
                    if (vehicleIndex >= insideVehicles.size()) {
                        break;
                    }
                    ParkingSession session = insideVehicles.get(vehicleIndex++);
                    session.setExitGate(selectedGate);
                    session.setCheckOutTime(Instant.now());
                    sessionRepo.save(session);
                }
            }
        } catch (Exception e) {
            System.err.println("Simulation Error: " + e.getMessage());
        }
    }
}
