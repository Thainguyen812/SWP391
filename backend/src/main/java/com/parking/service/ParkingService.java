package com.parking.service;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;

// phần 1 / check out task 5
import com.parking.dto.VisitorCheckInRequest;
import com.parking.dto.CongestionCheckoutRequest; // task 7 
import com.parking.dto.FloorEntryVerificationRequest;
import com.parking.dto.FloorEntryVerificationResponse;

import com.parking.model.Transaction;
import java.util.List;
import java.util.UUID;

public interface ParkingService {
    CheckInResponse aiCheckIn(AiCheckInRequest request);
    CheckInResponse approveEntry(String plate);
    CheckInResponse approvePendingEntry(PendingGateVehicleService.PendingEntry pendingEntry);
    void verifyExitQr(String detectedPlate, String qrToken);
    
    CheckInResponse visitorCheckIn(VisitorCheckInRequest request);//task 5 check in vãn lai
    Transaction checkoutCard(UUID cardId); //task 5 check out vãn lai
    Transaction checkoutCardByCode(String cardCode);

    Transaction congestionCheckout( // check out lưu động vãn lai 
    CongestionCheckoutRequest request
    );

    Transaction confirmCheckout(UUID transactionId); // confirm check out

    void cleanupTestData();

    java.util.Map<String, Object> getParkingFee(UUID cardId);
    List<java.util.Map<String, Object>> findCarByDigits(String digits);
    List<java.util.Map<String, Object>> getMonitoringMap();
    java.util.Map<String, Object> getVehicleStatus(UUID vehicleId);
    void approveVipSubscription(UUID id, String status, String rejectionReason, UUID managerId);
    FloorEntryVerificationResponse verifyFloorEntry(FloorEntryVerificationRequest request);
}
