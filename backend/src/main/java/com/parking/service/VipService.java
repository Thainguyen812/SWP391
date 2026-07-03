package com.parking.service;

import com.parking.model.VipSubscription;
import com.parking.dto.VipSubscriptionResponseDTO;

import java.util.List;
import java.util.UUID;

import com.parking.dto.VipRegistrationRequest;

public interface VipService {

    List<VipSubscriptionResponseDTO> getPending();

    List<VipSubscription> getAll();

    VipSubscription register(
            VipRegistrationRequest request);
}