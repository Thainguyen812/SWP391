// driver dk vip trước 

package com.parking.dto;

import java.util.UUID;

public class VipRegistrationRequest {

    private String licensePlate;
    private UUID ownerId;
    private String subscriptionType;
    private String documentPhotos;

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getSubscriptionType() {
        return subscriptionType;
    }

    public void setSubscriptionType(String subscriptionType) {
        this.subscriptionType = subscriptionType;
    }

    public String getDocumentPhotos() {
        return documentPhotos;
    }

    public void setDocumentPhotos(String documentPhotos) {
        this.documentPhotos = documentPhotos;
    }
}