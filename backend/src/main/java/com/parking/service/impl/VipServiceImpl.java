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
        public VipSubscription reject(UUID id) {
                VipSubscription vip = repo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn VIP"));
                vip.setStatus(VipSubscription.Status.REJECTED);
                vip.setUpdatedAt(java.time.Instant.now());
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
                vip.setVehicleId(request.getVehicleId());
                vip.setSubscriptionType(request.getSubscriptionType());
                vip.setStatus(VipSubscription.Status.PENDING_APPROVAL);

                java.time.LocalDate startDate = java.time.LocalDate.now();
                vip.setStartDate(startDate);

                // Tính toán endDate dựa vào subscriptionType
                String type = request.getSubscriptionType() != null ? request.getSubscriptionType().toUpperCase() : "MONTHLY";
                if ("MONTHLY".equals(type)) {
                        vip.setEndDate(startDate.plusMonths(1));
                        vip.setFeeAmount(new java.math.BigDecimal("1200000"));
                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                        vip.setEndDate(startDate.plusMonths(3));
                        vip.setFeeAmount(new java.math.BigDecimal("3500000"));
                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                        vip.setEndDate(startDate.plusYears(1));
                        vip.setFeeAmount(new java.math.BigDecimal("12000000"));
                } else {
                        vip.setEndDate(startDate.plusMonths(1));
                        vip.setFeeAmount(java.math.BigDecimal.ZERO);
                }

                vip.setPaymentMethod("BANK_TRANSFER");
                vip.setPaymentStatus("PENDING");
                vip.setCreatedAt(java.time.Instant.now());
                vip.setUpdatedAt(java.time.Instant.now());

                return repo.save(vip);
        }

}