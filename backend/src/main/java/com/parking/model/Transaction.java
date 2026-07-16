package com.parking.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

    // phần 1 / check out task 5

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    private UUID id;

    @Column(name = "session_id", nullable = false, unique = true)
    private UUID sessionId;

    @Column(name = "parking_fee", nullable = false)
    private BigDecimal parkingFee = BigDecimal.ZERO;

    @Column(name = "lost_card_penalty", nullable = false)
    private BigDecimal lostCardPenalty = BigDecimal.ZERO;

    @Column(name = "violation_penalty", nullable = false)
    private BigDecimal violationPenalty = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "processed_by")
    private UUID processedBy;

    @Column(name = "is_mobile_checkout", nullable = false)
    private Boolean isMobileCheckout = false;

    @Column(name = "mobile_gps_location")
    private String mobileGpsLocation;

    @Column(name = "mobile_photo_proof")
    private String mobilePhotoProof;

    @Column(name = "receipt_url")
    private String receiptUrl;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Transient
    private Instant mobileCheckoutExpiresAt;

    @Transient
    private Boolean mobileCheckoutGraceExpired = false;

    @Transient
    private BigDecimal mobileCheckoutOverstayPenalty = BigDecimal.ZERO;

    public enum PaymentMethod {
        CASH, VNPAY_SANDBOX, MOMO_SANDBOX, QR_BANK
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public BigDecimal getParkingFee() {
        return parkingFee;
    }

    public void setParkingFee(BigDecimal parkingFee) {
        this.parkingFee = parkingFee;
    }

    public BigDecimal getLostCardPenalty() {
        return lostCardPenalty;
    }

    public void setLostCardPenalty(BigDecimal lostCardPenalty) {
        this.lostCardPenalty = lostCardPenalty;
    }

    public BigDecimal getViolationPenalty() {
        return violationPenalty;
    }

    public void setViolationPenalty(BigDecimal violationPenalty) {
        this.violationPenalty = violationPenalty;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public UUID getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(UUID processedBy) {
        this.processedBy = processedBy;
    }

    public Boolean getIsMobileCheckout() {
        return isMobileCheckout;
    }

    public void setIsMobileCheckout(Boolean isMobileCheckout) {
        this.isMobileCheckout = isMobileCheckout;
    }

    public String getMobileGpsLocation() {
        return mobileGpsLocation;
    }

    public void setMobileGpsLocation(String mobileGpsLocation) {
        this.mobileGpsLocation = mobileGpsLocation;
    }

    public String getMobilePhotoProof() {
        return mobilePhotoProof;
    }

    public void setMobilePhotoProof(String mobilePhotoProof) {
        this.mobilePhotoProof = mobilePhotoProof;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public Instant getMobileCheckoutExpiresAt() {
        return mobileCheckoutExpiresAt;
    }

    public void setMobileCheckoutExpiresAt(Instant mobileCheckoutExpiresAt) {
        this.mobileCheckoutExpiresAt = mobileCheckoutExpiresAt;
    }

    public Boolean getMobileCheckoutGraceExpired() {
        return mobileCheckoutGraceExpired;
    }

    public void setMobileCheckoutGraceExpired(Boolean mobileCheckoutGraceExpired) {
        this.mobileCheckoutGraceExpired = mobileCheckoutGraceExpired;
    }

    public BigDecimal getMobileCheckoutOverstayPenalty() {
        return mobileCheckoutOverstayPenalty;
    }

    public void setMobileCheckoutOverstayPenalty(BigDecimal mobileCheckoutOverstayPenalty) {
        this.mobileCheckoutOverstayPenalty = mobileCheckoutOverstayPenalty;
    }
}
