package com.parking.service;

import com.parking.model.ParkingSession;
import com.parking.model.Transaction;
import com.parking.model.Zone;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.TransactionRepository;
import com.parking.repository.ZoneRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TrafficSimulatorTask {

    private final ParkingSessionRepository sessionRepo;
    private final TransactionRepository transactionRepo;
    private final ZoneRepository zoneRepo;

    public TrafficSimulatorTask(ParkingSessionRepository sessionRepo, TransactionRepository transactionRepo, ZoneRepository zoneRepo) {
        this.sessionRepo = sessionRepo;
        this.transactionRepo = transactionRepo;
        this.zoneRepo = zoneRepo;
    }

    private final List<String> IN_GATES = Arrays.asList("CỔNG VÀO 1", "CỔNG VÀO 2", "CỔNG VÀO 3");
    private final List<String> OUT_GATES = Arrays.asList("CỔNG RA 1", "CỔNG RA 2", "CỔNG RA 3");

    @Scheduled(fixedDelay = 5000)
    public void simulateTraffic() {
        try {
            // Logic Check-in: Clear entry gates that have been occupied for > 10s
            Instant threshold = Instant.now().minus(10, ChronoUnit.SECONDS);
            List<ParkingSession> processingIns = sessionRepo.findAll().stream()
                .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE && s.getEntryGate() != null)
                .collect(Collectors.toList());

            for (ParkingSession s : processingIns) {
                if (s.getCheckInTime() != null && s.getCheckInTime().isBefore(threshold)) {
                    s.setEntryGate(null); // Clear the gate, vehicle is now fully inside
                    sessionRepo.save(s);
                }
            }

            // Logic Check-out: Clear exit gates and complete sessions
            List<ParkingSession> processingOuts = sessionRepo.findAll().stream()
                .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE && s.getExitGate() != null)
                .collect(Collectors.toList());

            for (ParkingSession s : processingOuts) {
                if (s.getCheckOutTime() != null && s.getCheckOutTime().isBefore(threshold)) {
                    s.setSessionStatus(ParkingSession.SessionStatus.COMPLETED);
                    s.setExitGate(null); // Clear the exit gate, vehicle left
                    sessionRepo.save(s);
                    
                    Transaction t = new Transaction();
                    t.setId(UUID.randomUUID());
                    t.setSessionId(s.getId());
                    t.setTotalAmount(new BigDecimal("15000"));
                    t.setPaymentMethod(Transaction.PaymentMethod.CASH);
                    t.setPaymentStatus(Transaction.PaymentStatus.SUCCESS);
                    t.setProcessedAt(Instant.now());
                    t.setIsMobileCheckout(false);
                    transactionRepo.save(t);
                }
            }

            // Randomly check in a new vehicle to an EMPTY entry gate
            if (Math.random() > 0.5) {
                List<String> occupiedInGates = processingIns.stream().map(ParkingSession::getEntryGate).collect(Collectors.toList());
                List<String> emptyInGates = IN_GATES.stream().filter(g -> !occupiedInGates.contains(g)).collect(Collectors.toList());
                
                if (!emptyInGates.isEmpty()) {
                    String selectedGate = emptyInGates.get((int) (Math.random() * emptyInGates.size()));
                    
                    ParkingSession session = new ParkingSession();
                    session.setId(UUID.randomUUID());
                    String[] prefixes = {"51A", "51F", "51G", "51H", "51K", "29A", "30E", "30G"};
                    String prefix = prefixes[(int)(Math.random() * prefixes.length)];
                    int number = 10000 + (int)(Math.random() * 90000);
                    session.setLicensePlate(prefix + "-" + number + ".SIM");
                    session.setCheckInTime(Instant.now());
                    session.setSessionStatus(ParkingSession.SessionStatus.ACTIVE);
                    session.setEntryGate(selectedGate);
                    
                    List<Zone> zones = zoneRepo.findAll();
                    if (!zones.isEmpty()) {
                        session.setAssignedZoneId(zones.get(0).getId());
                    } else {
                        return; // Cannot simulate without zones
                    }
                    
                    if (Math.random() < 0.1) {
                        session.setIsSuspicious(true);
                        session.setSuspiciousReason("Cảnh báo AI: Dấu hiệu bất thường (Mô phỏng)");
                    }
                    sessionRepo.save(session);
                }
            }

            // Randomly start checking out an existing vehicle
            if (Math.random() > 0.6) {
                List<String> occupiedOutGates = processingOuts.stream().map(ParkingSession::getExitGate).collect(Collectors.toList());
                List<String> emptyOutGates = OUT_GATES.stream().filter(g -> !occupiedOutGates.contains(g)).collect(Collectors.toList());
                
                if (!emptyOutGates.isEmpty()) {
                    List<ParkingSession> insideVehicles = sessionRepo.findAll().stream()
                        .filter(s -> s.getSessionStatus() == ParkingSession.SessionStatus.ACTIVE 
                                  && s.getEntryGate() == null 
                                  && s.getExitGate() == null)
                        .collect(Collectors.toList());
                        
                    if (!insideVehicles.isEmpty()) {
                        ParkingSession session = insideVehicles.get((int) (Math.random() * insideVehicles.size()));
                        String selectedGate = emptyOutGates.get((int) (Math.random() * emptyOutGates.size()));
                        session.setExitGate(selectedGate);
                        session.setCheckOutTime(Instant.now()); 
                        sessionRepo.save(session);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Simulation Error: " + e.getMessage());
        }
    }
}
