package com.parking.service;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;

// phần 1 / check out task 5
import com.parking.dto.VisitorCheckInRequest;

import com.parking.model.Transaction;
import java.util.UUID;

public interface ParkingService {
    CheckInResponse aiCheckIn(AiCheckInRequest request);
    void verifyExitQr(String detectedPlate, String qrToken);
    
    CheckInResponse visitorCheckIn(VisitorCheckInRequest request);//task 5 check in vãn lai
    Transaction checkoutCard(UUID cardId); //task 5 check out vãn lai
}
