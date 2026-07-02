// driver dk vip trước 

package com.parking.dto;

import java.util.UUID;

public class VipRegistrationRequest {

    private UUID vehicleId;
    private String subscriptionType;
    private String documentPhotos;

    public UUID getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(UUID vehicleId) {
        this.vehicleId = vehicleId;
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