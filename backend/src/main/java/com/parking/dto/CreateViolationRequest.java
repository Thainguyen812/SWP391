package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CreateViolationRequest {

    @NotBlank(message = "Biển số xe không được để trống")
    private String licensePlate;

    @NotBlank(message = "Loại vi phạm không được để trống")
    private String violationType;
    //EV_ZONE_MISUSE, DOUBLE_PARKING ( 2 loại dc dùng hiện tại)
    
    private String notes;

    private List<String> photoUrls;

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getViolationType() {
        return violationType;
    }

    public void setViolationType(String violationType) {
        this.violationType = violationType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<String> getPhotoUrls() {
        return photoUrls;
    }

    public void setPhotoUrls(List<String> photoUrls) {
        this.photoUrls = photoUrls;
    }
}