package com.parking.service;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;

    // phần 1 / check out task 5

import com.parking.model.Transaction;
import java.util.UUID;

public interface ParkingService {
    CheckInResponse aiCheckIn(AiCheckInRequest request);
    void verifyExitQr(String detectedPlate, String qrToken);
    Transaction checkoutCard(UUID cardId);
}
