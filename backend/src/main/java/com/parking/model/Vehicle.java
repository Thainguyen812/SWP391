package com.parking.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "license_plate", unique = true, nullable = false)
    private String licensePlate;

    @Column(name = "vehicle_size", nullable = false)
    private String vehicleSize;

    private String color;
    private String colorRgb;
    private String bodyShape;
    private String brand;

    @Column(name = "registration_doc_url", columnDefinition = "TEXT")
    private String registrationDocUrl;

    @Column(name = "registration_photo_url", columnDefinition = "TEXT")
    private String registrationPhotoUrl;

    @Column(name = "violation_count", nullable = false)
    private int violationCount = 0;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    @Column(name = "fuel_type", nullable = false)
    private String fuelType = "GASOLINE";

    @Column(name = "is_locked", nullable = false)
    private boolean isLocked = false;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getVehicleSize() { return vehicleSize; }
    public void setVehicleSize(String vehicleSize) { this.vehicleSize = vehicleSize; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getColorRgb() { return colorRgb; }
    public void setColorRgb(String colorRgb) { this.colorRgb = colorRgb; }
    public String getBodyShape() { return bodyShape; }
    public void setBodyShape(String bodyShape) { this.bodyShape = bodyShape; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getRegistrationDocUrl() { return registrationDocUrl; }
    public void setRegistrationDocUrl(String registrationDocUrl) { this.registrationDocUrl = registrationDocUrl; }
    public String getRegistrationPhotoUrl() { return registrationPhotoUrl; }
    public void setRegistrationPhotoUrl(String registrationPhotoUrl) { this.registrationPhotoUrl = registrationPhotoUrl; }
    public int getViolationCount() { return violationCount; }
    public void setViolationCount(int violationCount) { this.violationCount = violationCount; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
