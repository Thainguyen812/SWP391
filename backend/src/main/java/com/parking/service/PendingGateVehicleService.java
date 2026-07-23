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

    private static String normalizeKey(String str) {
        if (str == null) return "";
        return str.trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
    }

    private static String normalizeGateName(String gate) {
        if (gate == null) return "";
        String g = gate.trim().toUpperCase();
        if (g.startsWith("CỔNG VÀO")) return g.replace("CỔNG VÀO", "L-VÀO");
        if (g.startsWith("CỔNG RA")) return g.replace("CỔNG RA", "L-RA");
        return g;
    }

    public boolean add(PendingEntry entry) {
        if (entry == null || entry.getLicensePlate() == null || entry.getEntryGate() == null) {
            return false;
        }
        String normGate = normalizeGateName(entry.getEntryGate());
        if (isGateOccupied(normGate)) {
            return false;
        }
        return byPlate.putIfAbsent(normalizeKey(entry.getLicensePlate()), entry) == null;
    }

    public List<PendingEntry> findAll() {
        return new ArrayList<>(byPlate.values());
    }

    public Optional<PendingEntry> removeByPlate(String plate) {
        if (plate == null) {
            return Optional.empty();
        }
        String key = normalizeKey(plate);
        PendingEntry removed = byPlate.remove(key);
        if (removed == null) {
            for (String k : byPlate.keySet()) {
                if (k.equals(key) || k.contains(key) || key.contains(k)) {
                    removed = byPlate.remove(k);
                    break;
                }
            }
        }
        return Optional.ofNullable(removed);
    }

    public void removeByGate(String gate) {
        if (gate == null) return;
        String normGate = normalizeGateName(gate);
        byPlate.entrySet().removeIf(e -> normalizeGateName(e.getValue().getEntryGate()).equalsIgnoreCase(normGate));
    }

    public boolean isGateOccupied(String gate) {
        if (gate == null) {
            return false;
        }
        String normGate = normalizeGateName(gate);
        return byPlate.values().stream().anyMatch(entry -> normalizeGateName(entry.getEntryGate()).equalsIgnoreCase(normGate));
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
        private final UUID assignedZoneId;
        private final String assignedZoneCode;

        public PendingEntry(UUID id, String licensePlate, String entryGate, boolean vip,
                boolean suspicious, String suspiciousReason, String vehicleType, Instant detectedAt) {
            this(id, licensePlate, entryGate, vip, suspicious, suspiciousReason, vehicleType, detectedAt, null, null);
        }

        public PendingEntry(UUID id, String licensePlate, String entryGate, boolean vip,
                boolean suspicious, String suspiciousReason, String vehicleType, Instant detectedAt,
                UUID assignedZoneId, String assignedZoneCode) {
            this.id = id;
            this.licensePlate = licensePlate;
            this.entryGate = entryGate;
            this.vip = vip;
            this.suspicious = suspicious;
            this.suspiciousReason = suspiciousReason;
            this.vehicleType = vehicleType;
            this.detectedAt = detectedAt;
            this.assignedZoneId = assignedZoneId;
            this.assignedZoneCode = assignedZoneCode;
        }

        public UUID getId() { return id; }
        public String getLicensePlate() { return licensePlate; }
        public String getEntryGate() { return entryGate; }
        public boolean isVip() { return vip; }
        public boolean isSuspicious() { return suspicious; }
        public String getSuspiciousReason() { return suspiciousReason; }
        public String getVehicleType() { return vehicleType; }
        public Instant getDetectedAt() { return detectedAt; }
        public UUID getAssignedZoneId() { return assignedZoneId; }
        public String getAssignedZoneCode() { return assignedZoneCode; }
    }
}
