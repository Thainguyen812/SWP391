package com.parking.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {
    @Id
    private UUID id;

    @Column(name = "zone_id", nullable = false)
    private UUID zoneId;

    @Column(name = "slot_number", nullable = false)
    private String slotNumber;

    @Column(name = "slot_type", nullable = false)
    private String slotType = "NORMAL";

    @Column(name = "slot_status", nullable = false)
    private String slotStatus;

    @Column(name = "sensor_mock_id")
    private String sensorMockId;

    @Column(name = "ev_charger_id")
    private String evChargerId;

    @Column(name = "last_updated")
    private Instant lastUpdated;

    // Manual Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getZoneId() { return zoneId; }
    public void setZoneId(UUID zoneId) { this.zoneId = zoneId; }

    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }

    public String getSlotType() { return slotType; }
    public void setSlotType(String slotType) { this.slotType = slotType; }

    public String getSlotStatus() { return slotStatus; }
    public void setSlotStatus(String slotStatus) { this.slotStatus = slotStatus; }

    public String getSensorMockId() { return sensorMockId; }
    public void setSensorMockId(String sensorMockId) { this.sensorMockId = sensorMockId; }

    public String getEvChargerId() { return evChargerId; }
    public void setEvChargerId(String evChargerId) { this.evChargerId = evChargerId; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
}