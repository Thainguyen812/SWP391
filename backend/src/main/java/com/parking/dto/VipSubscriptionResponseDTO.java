package com.parking.dto;

import java.time.LocalDate;
import java.util.UUID;
import java.util.Map;

public class VipSubscriptionResponseDTO {
    private String id;
    private String vehicle_plate;
    private String type;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate startDate;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate endDate;
    private String status;
    private Map<String, Object> document_photos;
    private String approved_by;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getVehicle_plate() { return vehicle_plate; }
    public void setVehicle_plate(String vehicle_plate) { this.vehicle_plate = vehicle_plate; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Map<String, Object> getDocument_photos() { return document_photos; }
    public void setDocument_photos(Map<String, Object> document_photos) { this.document_photos = document_photos; }
    
    public String getApproved_by() { return approved_by; }
    public void setApproved_by(String approved_by) { this.approved_by = approved_by; }
}
