package com.parking.dto;

import com.parking.model.ParkingSession;
import com.parking.model.Vehicle;
import java.time.Instant;
import java.util.UUID;

public class ParkingSessionDto {
    private UUID id;
    private String licensePlate;
    private UUID assignedZoneId;
    private Instant checkInTime;
    private Instant checkOutTime;
    private String sessionStatus;
    private Boolean isVip;
    private Boolean isSuspicious;
    private String suspiciousReason;
    
    // Additional fields for UI
    private String vehicleBrand;
    private String vehicleColor;
    private String vehicleModel;

    public ParkingSessionDto(ParkingSession session, Vehicle vehicle) {
        this.id = session.getId();
        this.licensePlate = session.getLicensePlate();
        this.assignedZoneId = session.getAssignedZoneId();
        this.checkInTime = session.getCheckInTime();
        this.checkOutTime = session.getCheckOutTime();
        this.sessionStatus = session.getSessionStatus() != null ? session.getSessionStatus().name() : null;
        this.isVip = session.getIsVip();
        this.isSuspicious = session.getIsSuspicious();
        this.suspiciousReason = session.getSuspiciousReason();

        if (vehicle != null) {
            this.vehicleBrand = vehicle.getBrand();
            this.vehicleColor = vehicle.getColor();
            this.vehicleModel = (vehicle.getBrand() != null ? vehicle.getBrand() : "") + " " + (vehicle.getBodyShape() != null ? vehicle.getBodyShape() : "");
        }
    }

    public UUID getId() { return id; }
    public String getLicensePlate() { return licensePlate; }
    public UUID getAssignedZoneId() { return assignedZoneId; }
    public Instant getCheckInTime() { return checkInTime; }
    public Instant getCheckOutTime() { return checkOutTime; }
    public String getSessionStatus() { return sessionStatus; }
    public Boolean getIsVip() { return isVip; }
    public Boolean getIsSuspicious() { return isSuspicious; }
    public String getSuspiciousReason() { return suspiciousReason; }
    public String getVehicleBrand() { return vehicleBrand; }
    public String getVehicleColor() { return vehicleColor; }
    public String getVehicleModel() { return vehicleModel; }
}
