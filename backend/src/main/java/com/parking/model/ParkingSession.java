package com.parking.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_sessions")
public class ParkingSession {
    @Id
    private UUID id;

    @Column(name = "license_plate", nullable = false)
    private String licensePlate;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "card_id")
    private UUID cardId;

    @Column(name = "validated_qr_id")
    private UUID validatedQrId;

    @Column(name = "assigned_zone_id", nullable = false)
    private UUID assignedZoneId;

    @Column(name = "parked_slot_id")
    private UUID parkedSlotId;

    @Column(name = "check_in_time", nullable = false)
    private Instant checkInTime;

    @Column(name = "check_out_time")
    private Instant checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_status")
    private SessionStatus sessionStatus;

    private Boolean isVip = false;
    private Boolean isLocked = false;
    private Boolean isSuspicious = false;
    private String suspiciousReason;

    @Column(name = "override_by_staff")
    private UUID overrideByStaff;

    @Column(name = "override_reason")
    private String overrideReason;

    @Column(name = "mobile_checkout_staff_id")
    private UUID mobileCheckoutStaffId;

    @Column(name = "mobile_checkout_location")
    private String mobileCheckoutLocation;

    @Column(name = "mobile_checkout_at")
    private Instant mobileCheckoutAt;

    @Column(name = "mobile_checkout_photo")
    private String mobileCheckoutPhoto;

    @Column(name = "lost_card_proof_photos")
    private String lostCardProofPhotos;

    @Column(name = "slot_photo_url")
    private String slotPhotoUrl;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum SessionStatus { ACTIVE, COMPLETED, PASSED_CONFIRMED, LOST_CARD }

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }
    public UUID getCardId() { return cardId; }
    public void setCardId(UUID cardId) { this.cardId = cardId; }
    public UUID getValidatedQrId() { return validatedQrId; }
    public void setValidatedQrId(UUID validatedQrId) { this.validatedQrId = validatedQrId; }
    public UUID getAssignedZoneId() { return assignedZoneId; }
    public void setAssignedZoneId(UUID assignedZoneId) { this.assignedZoneId = assignedZoneId; }
    public UUID getParkedSlotId() { return parkedSlotId; }
    public void setParkedSlotId(UUID parkedSlotId) { this.parkedSlotId = parkedSlotId; }
    public Instant getCheckInTime() { return checkInTime; }
    public void setCheckInTime(Instant checkInTime) { this.checkInTime = checkInTime; }
    public Instant getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(Instant checkOutTime) { this.checkOutTime = checkOutTime; }
    public SessionStatus getSessionStatus() { return sessionStatus; }
    public void setSessionStatus(SessionStatus sessionStatus) { this.sessionStatus = sessionStatus; }
    public Boolean getIsVip() { return isVip; }
    public void setIsVip(Boolean isVip) { this.isVip = isVip; }
    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
    public Boolean getIsSuspicious() { return isSuspicious; }
    public void setIsSuspicious(Boolean isSuspicious) { this.isSuspicious = isSuspicious; }
    public String getSuspiciousReason() { return suspiciousReason; }
    public void setSuspiciousReason(String suspiciousReason) { this.suspiciousReason = suspiciousReason; }
    public UUID getOverrideByStaff() { return overrideByStaff; }
    public void setOverrideByStaff(UUID overrideByStaff) { this.overrideByStaff = overrideByStaff; }
    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
    public UUID getMobileCheckoutStaffId() { return mobileCheckoutStaffId; }
    public void setMobileCheckoutStaffId(UUID mobileCheckoutStaffId) { this.mobileCheckoutStaffId = mobileCheckoutStaffId; }
    public String getMobileCheckoutLocation() { return mobileCheckoutLocation; }
    public void setMobileCheckoutLocation(String mobileCheckoutLocation) { this.mobileCheckoutLocation = mobileCheckoutLocation; }
    public Instant getMobileCheckoutAt() { return mobileCheckoutAt; }
    public void setMobileCheckoutAt(Instant mobileCheckoutAt) { this.mobileCheckoutAt = mobileCheckoutAt; }
    public String getMobileCheckoutPhoto() { return mobileCheckoutPhoto; }
    public void setMobileCheckoutPhoto(String mobileCheckoutPhoto) { this.mobileCheckoutPhoto = mobileCheckoutPhoto; }
    public String getLostCardProofPhotos() { return lostCardProofPhotos; }
    public void setLostCardProofPhotos(String lostCardProofPhotos) { this.lostCardProofPhotos = lostCardProofPhotos; }
    public String getSlotPhotoUrl() { return slotPhotoUrl; }
    public void setSlotPhotoUrl(String slotPhotoUrl) { this.slotPhotoUrl = slotPhotoUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
