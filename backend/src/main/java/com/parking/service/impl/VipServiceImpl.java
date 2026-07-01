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

                // Cập nhật ngày gia hạn bắt đầu và kết thúc dựa trên thời gian thực lúc duyệt
                java.time.LocalDate startDate = java.time.LocalDate.now();
                vip.setStartDate(startDate);
                String type = vip.getSubscriptionType() != null ? vip.getSubscriptionType().toUpperCase() : "MONTHLY";
                if ("MONTHLY".equals(type)) {
                        vip.setEndDate(startDate.plusMonths(1));
                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                        vip.setEndDate(startDate.plusMonths(3));
                } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                        vip.setEndDate(startDate.plusMonths(6));
                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                        vip.setEndDate(startDate.plusYears(1));
                } else {
                        vip.setEndDate(startDate.plusMonths(1));
                }

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

                com.parking.model.Vehicle vehicle = vehicleRepository.findById(
                                request.getVehicleId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

                VipSubscription vip = new VipSubscription();

                vip.setId(UUID.randomUUID());
                vip.setVehicleId(request.getVehicleId());
                vip.setSubscriptionType(request.getSubscriptionType());
                vip.setStatus(VipSubscription.Status.PENDING_APPROVAL);

                java.time.LocalDate startDate = java.time.LocalDate.now();
                vip.setStartDate(startDate);

                // Tính toán endDate và feeAmount dựa vào subscriptionType và vehicleSize
                String size = vehicle.getVehicleSize() != null ? vehicle.getVehicleSize().toUpperCase() : "SEDAN_HATCHBACK";
                String type = request.getSubscriptionType() != null ? request.getSubscriptionType().toUpperCase() : "MONTHLY";

                long fee = 0;
                if ("SUV_CUV_MPV".equals(size)) {
                        if ("MONTHLY".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(1));
                                fee = 1400000;
                        } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(3));
                                fee = 3800000;
                        } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(6));
                                fee = 7000000;
                        } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                vip.setEndDate(startDate.plusYears(1));
                                fee = 12500000;
                        } else {
                                vip.setEndDate(startDate.plusMonths(1));
                        }
                } else if ("LARGE_VAN_MINIBUS".equals(size)) {
                        if ("MONTHLY".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(1));
                                fee = 2000000;
                        } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(3));
                                fee = 5400000;
                        } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(6));
                                fee = 10000000;
                        } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                vip.setEndDate(startDate.plusYears(1));
                                fee = 18000000;
                        } else {
                                vip.setEndDate(startDate.plusMonths(1));
                        }
                } else { // SEDAN_HATCHBACK or other
                        if ("MONTHLY".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(1));
                                fee = 1000000;
                        } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(3));
                                fee = 2700000;
                        } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                vip.setEndDate(startDate.plusMonths(6));
                                fee = 5000000;
                        } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                vip.setEndDate(startDate.plusYears(1));
                                fee = 9000000;
                        } else {
                                vip.setEndDate(startDate.plusMonths(1));
                        }
                }
                vip.setFeeAmount(new java.math.BigDecimal(fee));

                vip.setPaymentMethod("BANK_TRANSFER");
                vip.setPaymentStatus("PENDING");
                vip.setCreatedAt(java.time.Instant.now());
                vip.setUpdatedAt(java.time.Instant.now());

                return repo.save(vip);
        }

}