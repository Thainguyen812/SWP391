package com.parking.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
public class VehicleRegistrationRequest {

    @NotBlank(message = "Biển số xe không được để trống")
    private String licensePlate;

    private String vehicleSize;
    private String color;
    private String colorRgb;
    private String bodyShape;
    private String brand;
    private String fuelType;
}
