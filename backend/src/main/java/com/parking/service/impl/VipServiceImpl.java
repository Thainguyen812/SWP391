package com.parking.service.impl;

import com.parking.dto.VipRegistrationRequest;
import com.parking.model.VipSubscription;
import com.parking.repository.VehicleRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.VipService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class VipServiceImpl implements VipService {

        private final VipSubscriptionRepository repo;
        private final VehicleRepository vehicleRepository;

        public VipServiceImpl(VipSubscriptionRepository repo, VehicleRepository vehicleRepository) {
                this.repo = repo;
                this.vehicleRepository = vehicleRepository;
        }

        @Override
        public List<VipSubscription> getPending() {
                return repo.findByStatus(
                                VipSubscription.Status.PENDING_APPROVAL);
        }

        @Override
        public VipSubscription approve(UUID id) {

                VipSubscription vip = repo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn VIP"));

                vip.setStatus(
                                VipSubscription.Status.ACTIVE);

                vip.setPaymentStatus(
                                "SUCCESS");

                vip.setApprovedAt(
                                java.time.Instant.now());

                vip.setUpdatedAt(
                                java.time.Instant.now());

                return repo.save(vip);
        }

        @Override
        public VipSubscription register(
                        VipRegistrationRequest request) {

                vehicleRepository.findById(
                                request.getVehicleId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

                VipSubscription vip = new VipSubscription();

                vip.setId(UUID.randomUUID());

                vip.setVehicleId(
                                request.getVehicleId());

                vip.setSubscriptionType(
                                request.getSubscriptionType());

                vip.setStatus(
                                VipSubscription.Status.PENDING_APPROVAL);

                vip.setStartDate(
                                java.time.LocalDate.now());

                vip.setEndDate(
                                java.time.LocalDate.now().plusMonths(1));

                if ("MONTHLY".equalsIgnoreCase(
                                request.getSubscriptionType())) {

                        vip.setFeeAmount(
                                        new java.math.BigDecimal("1200000"));

                } else if ("YEAR".equalsIgnoreCase(
                                request.getSubscriptionType())) {

                        vip.setFeeAmount(
                                        new java.math.BigDecimal("12000000"));

                } else {

                        vip.setFeeAmount(
                                        java.math.BigDecimal.ZERO);
                }

                vip.setPaymentMethod("BANK_TRANSFER");

                vip.setPaymentStatus("PENDING");

                vip.setCreatedAt(
                                java.time.Instant.now());

                vip.setUpdatedAt(
                                java.time.Instant.now());

                return repo.save(vip);
        }

}