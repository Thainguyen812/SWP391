package com.parking.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @Column(length = 36)
    private String id;

    @Column(length = 36)
    private String ownerId;

    @Column(unique = true, nullable = false)
    private String licensePlate;

    @Column(unique = true)
    private String etcTagCode;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    private String color;
    private String brand;
    private String registrationDocUrl;
    private Boolean isActive = true;

    public enum VehicleType { CAR_4, CAR_7, VAN_16, TRUCK }

    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getEtcTagCode() { return etcTagCode; }
    public void setEtcTagCode(String etcTagCode) { this.etcTagCode = etcTagCode; }
    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getRegistrationDocUrl() { return registrationDocUrl; }
    public void setRegistrationDocUrl(String registrationDocUrl) { this.registrationDocUrl = registrationDocUrl; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
