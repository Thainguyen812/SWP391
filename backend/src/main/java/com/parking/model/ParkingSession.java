package com.parking.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "parking_sessions")
public class ParkingSession {

    // này là mã của phiên gửi xe 
    @Id
    @Column(length = 36)
    private String id;

    // Biển số xe của phiên gửi xe
    private String licensePlate;

    // Xe thuộc bảng vehicles
    @Column(length = 36)
    private String vehicleId;

    // Thẻ tạm cho khách vãng lai
    @Column(length = 36)
    private String cardId;

    private Instant checkInTime;
    private Instant checkOutTime;

    // Thời hạn 30 phút sau khi staff thu tiền lưu động
    private Instant passedConfirmedUntil;

    @Column(length = 36)
    private String assignedZoneId;

    @Enumerated(EnumType.STRING)
    private SessionStatus sessionStatus;

    // true = xe VIP/member, false = khách vãng lai
    private Boolean isVip = false;

    // Khóa chống trộm tại thời điểm tạo session
    private Boolean isLocked = false;

    // Ảnh AI chụp lúc vào bãi
    private String aiCheckInImage;

    // Staff thu tiền lưu động dưới hầm
    @Column(length = 36)
    private String mobileCheckoutStaffId;

    // Tọa độ/vị trí thu tiền lưu động
    private String mobileCheckoutLocation;

    // Staff override AI/cổng nếu có
    @Column(length = 36)
    private String overrideByStaff;

    public enum SessionStatus {
        ACTIVE,
        COMPLETED,
        PASSED_CONFIRMED,
        LOST_CARD
    }

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

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getCardId() {
        return cardId;
    }

    public void setCardId(String cardId) {
        this.cardId = cardId;
    }

    public Instant getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(Instant checkInTime) {
        this.checkInTime = checkInTime;
    }

    public Instant getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(Instant checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public Instant getPassedConfirmedUntil() {
        return passedConfirmedUntil;
    }

    public void setPassedConfirmedUntil(Instant passedConfirmedUntil) {
        this.passedConfirmedUntil = passedConfirmedUntil;
    }

    public String getAssignedZoneId() {
        return assignedZoneId;
    }

    public void setAssignedZoneId(String assignedZoneId) {
        this.assignedZoneId = assignedZoneId;
    }

    public SessionStatus getSessionStatus() {
        return sessionStatus;
    }

    public void setSessionStatus(SessionStatus sessionStatus) {
        this.sessionStatus = sessionStatus;
    }

    public Boolean getIsVip() {
        return isVip;
    }

    public void setIsVip(Boolean vip) {
        isVip = vip;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean locked) {
        isLocked = locked;
    }

    public String getAiCheckInImage() {
        return aiCheckInImage;
    }

    public void setAiCheckInImage(String aiCheckInImage) {
        this.aiCheckInImage = aiCheckInImage;
    }

    public String getMobileCheckoutStaffId() {
        return mobileCheckoutStaffId;
    }

    public void setMobileCheckoutStaffId(String mobileCheckoutStaffId) {
        this.mobileCheckoutStaffId = mobileCheckoutStaffId;
    }

    public String getMobileCheckoutLocation() {
        return mobileCheckoutLocation;
    }

    public void setMobileCheckoutLocation(String mobileCheckoutLocation) {
        this.mobileCheckoutLocation = mobileCheckoutLocation;
    }

    public String getOverrideByStaff() {
        return overrideByStaff;
    }

    public void setOverrideByStaff(String overrideByStaff) {
        this.overrideByStaff = overrideByStaff;
    }
}