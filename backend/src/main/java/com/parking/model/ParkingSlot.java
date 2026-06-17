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

    // Sửa từ status -> slot_status
    @Column(name = "slot_status", nullable = false)
    private String slotStatus;

    // Sửa từ chargerStatus -> ev_charger_id
    // Dùng kiểu UUID để tham chiếu tới bảng trụ sạc (mock)
    @Column(name = "ev_charger_id")
    private UUID evChargerId;

    @Column(name = "last_updated")
    private Instant lastUpdated;
}