package com.parking.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class PendingGateVehicleService {
    private final ConcurrentMap<String, PendingEntry> byPlate = new ConcurrentHashMap<>();

    public boolean add(PendingEntry entry) {
        if (entry == null || entry.getLicensePlate() == null || entry.getEntryGate() == null) {
            return false;
        }
        if (isGateOccupied(entry.getEntryGate())) {
            return false;
        }
        return byPlate.putIfAbsent(entry.getLicensePlate(), entry) == null;
    }

    public List<PendingEntry> findAll() {
        return new ArrayList<>(byPlate.values());
    }

    public Optional<PendingEntry> removeByPlate(String plate) {
        if (plate == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(byPlate.remove(plate));
    }

    public boolean isGateOccupied(String gate) {
        if (gate == null) {
            return false;
        }
        return byPlate.values().stream().anyMatch(entry -> gate.equalsIgnoreCase(entry.getEntryGate()));
    }

    public static class PendingEntry {
        private final UUID id;
        private final String licensePlate;
        private final String entryGate;
        private final boolean vip;
        private final boolean suspicious;
        private final String suspiciousReason;
        private final String vehicleType;
        private final Instant detectedAt;

        public PendingEntry(UUID id, String licensePlate, String entryGate, boolean vip,
                boolean suspicious, String suspiciousReason, String vehicleType, Instant detectedAt) {
            this.id = id;
            this.licensePlate = licensePlate;
            this.entryGate = entryGate;
            this.vip = vip;
            this.suspicious = suspicious;
            this.suspiciousReason = suspiciousReason;
            this.vehicleType = vehicleType;
            this.detectedAt = detectedAt;
        }

        public UUID getId() { return id; }
        public String getLicensePlate() { return licensePlate; }
        public String getEntryGate() { return entryGate; }
        public boolean isVip() { return vip; }
        public boolean isSuspicious() { return suspicious; }
        public String getSuspiciousReason() { return suspiciousReason; }
        public String getVehicleType() { return vehicleType; }
        public Instant getDetectedAt() { return detectedAt; }
    }
}
