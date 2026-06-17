package com.parking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_violations")
@Data
public class ParkingViolation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private UUID slotId;
    private String reason;
    private Instant createdAt;
    private String status; // Ví dụ: 'PENDING', 'PROCESSED'
}