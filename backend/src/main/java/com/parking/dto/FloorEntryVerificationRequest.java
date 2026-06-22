package com.parking.dto;

public class FloorEntryVerificationRequest {
    private String cardCode;
    private String licensePlate;
    private String currentFloorCode;

    public String getCardCode() {
        return cardCode;
    }

    public void setCardCode(String cardCode) {
        this.cardCode = cardCode;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getCurrentFloorCode() {
        return currentFloorCode;
    }

    public void setCurrentFloorCode(String currentFloorCode) {
        this.currentFloorCode = currentFloorCode;
    }
}
