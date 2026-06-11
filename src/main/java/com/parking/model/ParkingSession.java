package com.parking.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "parking_sessions")
public class ParkingSession {
    @Id
    @Column(length = 36)
    private String id;

    private String licensePlate;

    @Column(length = 36)
    private String vehicleId;

    @Column(length = 36)
    private String cardId;

    private String detectedEtcCode;

    private Instant checkInTime;
    private Instant checkOutTime;

    @Column(length = 36)
    private String assignedZoneId;

    @Enumerated(EnumType.STRING)
    private SessionStatus sessionStatus;

    private Boolean isVip = false;
    private Boolean isLocked = false;
    private String aiCheckInImage;
    @Column(length = 36)
    private String mobileCheckoutStaffId;
    private String mobileCheckoutLocation;
    @Column(length = 36)
    private String overrideByStaff;

    public enum SessionStatus { ACTIVE, COMPLETED, PASSED_CONFIRMED, LOST_CARD }

    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }
    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }
    public String getDetectedEtcCode() { return detectedEtcCode; }
    public void setDetectedEtcCode(String detectedEtcCode) { this.detectedEtcCode = detectedEtcCode; }
    public Instant getCheckInTime() { return checkInTime; }
    public void setCheckInTime(Instant checkInTime) { this.checkInTime = checkInTime; }
    public Instant getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(Instant checkOutTime) { this.checkOutTime = checkOutTime; }
    public String getAssignedZoneId() { return assignedZoneId; }
    public void setAssignedZoneId(String assignedZoneId) { this.assignedZoneId = assignedZoneId; }
    public SessionStatus getSessionStatus() { return sessionStatus; }
    public void setSessionStatus(SessionStatus sessionStatus) { this.sessionStatus = sessionStatus; }
    public Boolean getIsVip() { return isVip; }
    public void setIsVip(Boolean isVip) { this.isVip = isVip; }
    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
    public String getAiCheckInImage() { return aiCheckInImage; }
    public void setAiCheckInImage(String aiCheckInImage) { this.aiCheckInImage = aiCheckInImage; }
    public String getMobileCheckoutStaffId() { return mobileCheckoutStaffId; }
    public void setMobileCheckoutStaffId(String mobileCheckoutStaffId) { this.mobileCheckoutStaffId = mobileCheckoutStaffId; }
    public String getMobileCheckoutLocation() { return mobileCheckoutLocation; }
    public void setMobileCheckoutLocation(String mobileCheckoutLocation) { this.mobileCheckoutLocation = mobileCheckoutLocation; }
    public String getOverrideByStaff() { return overrideByStaff; }
    public void setOverrideByStaff(String overrideByStaff) { this.overrideByStaff = overrideByStaff; }
}
