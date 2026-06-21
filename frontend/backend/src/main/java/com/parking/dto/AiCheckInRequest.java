package com.parking.dto;

public class AiCheckInRequest {
    private String plate;
    private String vehicle_type;
    private String image_url;
    private String camera_id;
    private Double confidence_score;

    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }
    public String getVehicle_type() { return vehicle_type; }
    public void setVehicle_type(String vehicle_type) { this.vehicle_type = vehicle_type; }
    public String getImage_url() { return image_url; }
    public void setImage_url(String image_url) { this.image_url = image_url; }
    public String getCamera_id() { return camera_id; }
    public void setCamera_id(String camera_id) { this.camera_id = camera_id; }
    public Double getConfidence_score() { return confidence_score; }
    public void setConfidence_score(Double confidence_score) { this.confidence_score = confidence_score; }
}
