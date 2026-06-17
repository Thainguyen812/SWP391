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
    private String status; // OCCUPIED, FREE...
    private String chargerStatus; // NOT_CHARGING, CHARGING...
    private Instant lastUpdated;
}