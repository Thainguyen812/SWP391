package com.parking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_slots")
@Data
public class ParkingSlot {
    @Id
    private UUID id;

    @Column(name = "zone_id", nullable = false)
    private UUID zoneId;

    @Column(name = "slot_number", nullable = false)
    private String slotNumber;

    @Column(name = "slot_type", nullable = false)
    private String slotType = "NORMAL";

    @Column(name = "sensor_mock_id")
    private String sensorMockId;

    // Sửa từ status -> slot_status
    @Column(name = "slot_status", nullable = false)
    private String slotStatus;

    // Sửa từ chargerStatus -> ev_charger_id
    // Dùng kiểu UUID để tham chiếu tới bảng trụ sạc (mock)
    @Column(name = "ev_charger_id")
    private String evChargerId;

    @Column(name = "last_updated")
    private Instant lastUpdated;
}