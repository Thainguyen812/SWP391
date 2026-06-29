package com.parking.dto;

import java.util.UUID;
import com.parking.model.Transaction;

public class CongestionCheckoutRequest {

    private String licensePlate;

    private UUID staffId;

    private String gpsLocation;

    private String proofImageUrl;

    private Transaction.PaymentMethod paymentMethod;

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public UUID getStaffId() {
        return staffId;
    }

    public void setStaffId(UUID staffId) {
        this.staffId = staffId;
    }

    public String getGpsLocation() {
        return gpsLocation;
    }

    public void setGpsLocation(String gpsLocation) {
        this.gpsLocation = gpsLocation;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
    }

    public void setProofImageUrl(String proofImageUrl) {
        this.proofImageUrl = proofImageUrl;
    }

    public Transaction.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(Transaction.PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}