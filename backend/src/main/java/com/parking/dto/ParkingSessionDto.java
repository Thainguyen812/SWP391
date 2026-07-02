package com.parking.dto;

import com.parking.model.ParkingSession;
import com.parking.model.Vehicle;
import java.time.Instant;
import java.util.UUID;

public class ParkingSessionDto {
    private UUID id;
    private String licensePlate;
    private UUID assignedZoneId;
    private String assignedZoneCode;
    private UUID cardId;
    private Instant checkInTime;
    private Instant checkOutTime;
    private String sessionStatus;
    private String entryGate;
    private String exitGate;
    private Boolean isVip;
    private Boolean isSuspicious;
    private Boolean isPending = false;
    private String suspiciousReason;
    
    // Additional fields for UI
    private String vehicleBrand;
    private String vehicleColor;
    private String vehicleModel;

    public ParkingSessionDto(ParkingSession session, Vehicle vehicle) {
        this.id = session.getId();
        this.licensePlate = session.getLicensePlate();
        this.assignedZoneId = session.getAssignedZoneId();
        this.cardId = session.getCardId();
        this.checkInTime = session.getCheckInTime();
        this.checkOutTime = session.getCheckOutTime();
        this.sessionStatus = session.getSessionStatus() != null ? session.getSessionStatus().name() : null;
        this.entryGate = session.getEntryGate();
        this.exitGate = session.getExitGate();
        this.isVip = session.getIsVip();
        this.isSuspicious = session.getIsSuspicious();
        this.isPending = false;
        this.suspiciousReason = session.getSuspiciousReason();

        if (vehicle != null) {
            this.vehicleBrand = vehicle.getBrand();
            this.vehicleColor = vehicle.getColor();
            this.vehicleModel = (vehicle.getBrand() != null ? vehicle.getBrand() : "") + " " + (vehicle.getBodyShape() != null ? vehicle.getBodyShape() : "");
        }
    }

    public ParkingSessionDto(UUID id, String licensePlate, Instant checkInTime, String sessionStatus,
            String entryGate, Boolean isVip, Boolean isSuspicious, String suspiciousReason) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.checkInTime = checkInTime;
        this.sessionStatus = sessionStatus;
        this.entryGate = entryGate;
        this.isVip = isVip;
        this.isSuspicious = isSuspicious;
        this.isPending = true;
        this.suspiciousReason = suspiciousReason;
    }

    public UUID getId() { return id; }
    public String getLicensePlate() { return licensePlate; }
    public UUID getAssignedZoneId() { return assignedZoneId; }
    public String getAssignedZoneCode() { return assignedZoneCode; }
    public void setAssignedZoneCode(String assignedZoneCode) { this.assignedZoneCode = assignedZoneCode; }
    public UUID getCardId() { return cardId; }
    public Instant getCheckInTime() { return checkInTime; }
    public Instant getCheckOutTime() { return checkOutTime; }
    public String getSessionStatus() { return sessionStatus; }
    public String getEntryGate() { return entryGate; }
    public String getExitGate() { return exitGate; }
    public Boolean getIsVip() { return isVip; }
    public Boolean getIsSuspicious() { return isSuspicious; }
    public Boolean getIsPending() { return isPending; }
    public String getSuspiciousReason() { return suspiciousReason; }
    public String getVehicleBrand() { return vehicleBrand; }
    public String getVehicleColor() { return vehicleColor; }
    public String getVehicleModel() { return vehicleModel; }
}
