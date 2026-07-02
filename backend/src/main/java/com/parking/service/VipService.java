package com.parking.service;

import com.parking.model.VipSubscription;

import java.util.List;
import java.util.UUID;

import com.parking.dto.VipRegistrationRequest;

public interface VipService {

    List<VipSubscription> getPending();

    VipSubscription register(
            VipRegistrationRequest request);
}