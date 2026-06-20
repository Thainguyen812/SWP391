package com.parking.service.impl;

import com.parking.model.VipSubscription;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.VipService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class VipServiceImpl implements VipService {

    private final VipSubscriptionRepository repo;

    public VipServiceImpl(VipSubscriptionRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<VipSubscription> getPending() {
        return repo.findByStatus(
                VipSubscription.Status.PENDING_APPROVAL);
    }

    @Override
    public VipSubscription approve(UUID id) {

        VipSubscription vip = repo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đơn VIP"));

        vip.setStatus(
                VipSubscription.Status.ACTIVE);

        return repo.save(vip);
    }

    @Override
    public VipSubscription reject(UUID id) {

        VipSubscription vip = repo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đơn VIP"));

        vip.setStatus(
                VipSubscription.Status.REJECTED);

        return repo.save(vip);
    }
}