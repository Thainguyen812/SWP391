package com.parking.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "blacklisted_plates")
public class BlacklistedPlate {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 20)
    private String licensePlate;

    private String reason;

    @Column(length = 36)
    private String blacklistedBy;

    private Instant blacklistedAt = Instant.now();

    private String notes;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getBlacklistedBy() {
        return blacklistedBy;
    }

    public void setBlacklistedBy(String blacklistedBy) {
        this.blacklistedBy = blacklistedBy;
    }

    public Instant getBlacklistedAt() {
        return blacklistedAt;
    }

    public void setBlacklistedAt(Instant blacklistedAt) {
        this.blacklistedAt = blacklistedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}