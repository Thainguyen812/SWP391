package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VehicleRegistrationRequest {

    @NotBlank(message = "License plate is required")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{1,2}[-]?([0-9]{4,5}|[0-9]{3}\\.[0-9]{2})$", message = "Biển số xe không đúng định dạng (Ví dụ: 30G-123.45 hoặc 30A-99999)")
    private String licensePlate;

    @NotBlank(message = "Vehicle size is required")
    private String vehicleSize;

    @NotBlank(message = "Color is required")
    private String color;

    private String colorRgb;

    private String bodyShape;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Fuel type is required")
    private String fuelType;

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getVehicleSize() {
        return vehicleSize;
    }

    public void setVehicleSize(String vehicleSize) {
        this.vehicleSize = vehicleSize;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getColorRgb() {
        return colorRgb;
    }

    public void setColorRgb(String colorRgb) {
        this.colorRgb = colorRgb;
    }

    public String getBodyShape() {
        return bodyShape;
    }

    public void setBodyShape(String bodyShape) {
        this.bodyShape = bodyShape;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }
}