package com.parking.service;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;

public interface ParkingService {
    CheckInResponse aiCheckIn(AiCheckInRequest request);
    void verifyExitQr(String detectedPlate, String qrToken);
}
