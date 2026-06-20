package com.parking.service;

import com.parking.model.VipSubscription;

import java.util.List;
import java.util.UUID;

public interface VipService {

    List<VipSubscription> getPending();

    VipSubscription approve(UUID id);

    VipSubscription reject(UUID id);
}