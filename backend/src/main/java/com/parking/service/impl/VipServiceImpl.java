package com.parking.service.impl;

import com.parking.dto.VipRegistrationRequest;
import com.parking.model.VipSubscription;
import com.parking.repository.VehicleRepository;
import com.parking.repository.SystemSettingRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.VipService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class VipServiceImpl implements VipService {

        private final VipSubscriptionRepository repo;
        private final VehicleRepository vehicleRepository;
        private final SystemSettingRepository systemSettingRepository;

        public VipServiceImpl(VipSubscriptionRepository repo, 
                              VehicleRepository vehicleRepository,
                              SystemSettingRepository systemSettingRepository) {
                this.repo = repo;
                this.vehicleRepository = vehicleRepository;
                this.systemSettingRepository = systemSettingRepository;
        }

        @Override
        public List<VipSubscription> getPending() {
                List<VipSubscription> list = repo.findByStatus(VipSubscription.Status.PENDING_APPROVAL);
                for (VipSubscription sub : list) {
                        vehicleRepository.findById(sub.getVehicleId()).ifPresent(v -> {
                                sub.setLicensePlate(v.getLicensePlate());
                        });
                }
                return list;
        }

        @Override
        public List<VipSubscription> getAll() {
                List<VipSubscription> list = repo.findAll();
                for (VipSubscription sub : list) {
                        vehicleRepository.findById(sub.getVehicleId()).ifPresent(v -> {
                                sub.setLicensePlate(v.getLicensePlate());
                        });
                }
                return list;
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
                vip.setStatus(("DAILY".equals(request.getSubscriptionType()) || "DAY".equals(request.getSubscriptionType())) ? VipSubscription.Status.ACTIVE : VipSubscription.Status.PENDING_APPROVAL);

                String regDoc = vehicle.getRegistrationDocUrl() != null ? vehicle.getRegistrationDocUrl() : "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80";
                String regPhoto = vehicle.getRegistrationPhotoUrl() != null ? vehicle.getRegistrationPhotoUrl() : "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80";
                vip.setDocumentPhotos(String.format(
                    "{\"registrationPaper\":\"%s\",\"identityCard\":\"%s\",\"frontPhoto\":\"%s\"}",
                    regDoc,
                    regPhoto,
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80"
                ));

                java.time.LocalDate startDate = java.time.LocalDate.now();
                vip.setStartDate(startDate);

                // Tính toán endDate và feeAmount dựa vào subscriptionType và vehicleSize
                String size = vehicle.getVehicleSize() != null ? vehicle.getVehicleSize().toUpperCase() : "SEDAN_HATCHBACK";
                String type = request.getSubscriptionType() != null ? request.getSubscriptionType().toUpperCase() : "MONTHLY";

                // 1. Calculate endDate based on subscription type
                if ("DAILY".equals(type) || "DAY".equals(type)) {
                        vip.setEndDate(startDate.plusDays(1));
                } else if ("MONTHLY".equals(type)) {
                        vip.setEndDate(startDate.plusDays(30));
                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                        vip.setEndDate(startDate.plusDays(90));
                } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                        vip.setEndDate(startDate.plusDays(180));
                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                        vip.setEndDate(startDate.plusDays(365));
                } else {
                        vip.setEndDate(startDate.plusDays(30));
                }

                // 2. Resolve fee amount (Dynamic from DB with fallback)
                java.math.BigDecimal feeAmount = null;
                String settingKey = "vip_price_" + size.toLowerCase() + "_" + type.toLowerCase();
                com.parking.model.SystemSetting setting = systemSettingRepository.findBySettingKey(settingKey);
                if (setting != null) {
                        try {
                                feeAmount = new java.math.BigDecimal(setting.getSettingValue());
                        } catch (Exception e) {
                                // fallback
                        }
                }

                if (feeAmount == null) {
                        long fallbackFee = 0;
                        if ("SUV_CUV_MPV".equals(size)) {
                                if ("DAILY".equals(type) || "DAY".equals(type)) {
                                        fallbackFee = 70000;
                                } else if ("MONTHLY".equals(type)) {
                                        fallbackFee = 1400000;
                                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                        fallbackFee = 3800000;
                                } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                        fallbackFee = 7000000;
                                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                        fallbackFee = 12500000;
                                }
                        } else if ("LARGE_VAN_MINIBUS".equals(size)) {
                                if ("DAILY".equals(type) || "DAY".equals(type)) {
                                        fallbackFee = 100000;
                                } else if ("MONTHLY".equals(type)) {
                                        fallbackFee = 2000000;
                                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                        fallbackFee = 5400000;
                                } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                        fallbackFee = 10000000;
                                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                        fallbackFee = 18000000;
                                }
                        } else { // SEDAN_HATCHBACK or other
                                if ("DAILY".equals(type) || "DAY".equals(type)) {
                                        fallbackFee = 50000;
                                } else if ("MONTHLY".equals(type)) {
                                        fallbackFee = 1000000;
                                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                        fallbackFee = 2700000;
                                } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                        fallbackFee = 5000000;
                                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                        fallbackFee = 9000000;
                                }
                        }
                        feeAmount = new java.math.BigDecimal(fallbackFee);
                }
                vip.setFeeAmount(feeAmount);

                vip.setPaymentMethod("BANK_TRANSFER");
                vip.setPaymentStatus(("DAILY".equals(request.getSubscriptionType()) || "DAY".equals(request.getSubscriptionType())) ? "PAID" : "PENDING");
                vip.setCreatedAt(java.time.Instant.now());
                vip.setUpdatedAt(java.time.Instant.now());

                return repo.save(vip);
        }

}