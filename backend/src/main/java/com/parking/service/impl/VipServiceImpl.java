package com.parking.service.impl;

import com.parking.dto.VipRegistrationRequest;
import com.parking.model.VipSubscription;
import com.parking.repository.VehicleRepository;
import com.parking.repository.SystemSettingRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.VipService;
import com.parking.dto.VipSubscriptionResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
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
        public List<VipSubscriptionResponseDTO> getPending() {
                List<VipSubscription> pendingList = repo.findByStatus(VipSubscription.Status.PENDING_APPROVAL)
                        .stream()
                        .filter(vip -> "SUCCESS".equalsIgnoreCase(vip.getPaymentStatus()) || "PAID".equalsIgnoreCase(vip.getPaymentStatus()))
                        .toList();
                List<VipSubscriptionResponseDTO> responseList = new ArrayList<>();
                ObjectMapper mapper = new ObjectMapper();

                for (VipSubscription vip : pendingList) {
                        VipSubscriptionResponseDTO dto = new VipSubscriptionResponseDTO();
                        dto.setId(vip.getId().toString());
                        dto.setType(vip.getSubscriptionType());
                        dto.setStartDate(vip.getStartDate());
                        dto.setEndDate(vip.getEndDate());
                        dto.setStatus(vip.getStatus().name());
                        dto.setApproved_by(vip.getApprovedBy() != null ? vip.getApprovedBy().toString() : null);

                        if (vip.getDocumentPhotos() != null && !vip.getDocumentPhotos().isEmpty()) {
                                try {
                                        Map<String, Object> photos = mapper.readValue(vip.getDocumentPhotos(), Map.class);
                                        dto.setDocument_photos(photos);
                                } catch (Exception e) {
                                        // Ignore parsing error
                                }
                        }

                        vehicleRepository.findById(vip.getVehicleId()).ifPresent(vehicle -> {
                                dto.setVehicle_plate(vehicle.getLicensePlate());
                        });

                        responseList.add(dto);
                }
                return responseList;
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

                com.parking.model.Vehicle vehicle = vehicleRepository.findByLicensePlate(request.getLicensePlate())
                        .orElseGet(() -> {
                            // Auto create mock vehicle for demo if missing
                            com.parking.model.Vehicle newV = new com.parking.model.Vehicle();
                            newV.setId(UUID.randomUUID());
                            newV.setLicensePlate(request.getLicensePlate());
                            newV.setOwnerId(request.getOwnerId() != null ? request.getOwnerId() : UUID.randomUUID());
                            newV.setVehicleSize("SEDAN_HATCHBACK");

                            newV.setCreatedAt(java.time.Instant.now()); 
                            newV.setUpdatedAt(java.time.Instant.now());

                            return vehicleRepository.save(newV);
                        });

                VipSubscription vip = new VipSubscription();

                vip.setId(UUID.randomUUID());
                vip.setVehicleId(vehicle.getId());
                vip.setSubscriptionType(request.getSubscriptionType());
                vip.setDocumentPhotos(request.getDocumentPhotos());
                vip.setStatus(("DAILY".equals(request.getSubscriptionType()) || "DAY".equals(request.getSubscriptionType())) ? VipSubscription.Status.ACTIVE : VipSubscription.Status.REJECTED);

                java.time.LocalDate startDate = java.time.LocalDate.now();
                List<VipSubscription> existingSubs = repo.findByVehicleId(vehicle.getId());
                for (VipSubscription sub : existingSubs) {
                    if (sub.getStatus() == VipSubscription.Status.ACTIVE || sub.getStatus() == VipSubscription.Status.PENDING_APPROVAL) {
                        if (sub.getEndDate() != null && sub.getEndDate().isAfter(startDate)) {
                            startDate = sub.getEndDate();
                        }
                    }
                }
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
                        } else if ("LARGE_VAN_MINIBUS".equals(size) || "VAN_TRUCK".equals(size) || "MINIBUS_16".equals(size)) {
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

                String pm = request.getPaymentMethod();
                if ("WALLET".equalsIgnoreCase(pm) || "VAPAY_WALLET".equalsIgnoreCase(pm)) {
                    vip.setPaymentMethod("WALLET");
                } else if (pm != null && pm.toUpperCase().contains("SANDBOX")) {
                    vip.setPaymentMethod("VNPAY_SANDBOX");
                } else {
                    vip.setPaymentMethod("VNPAY");
                }
                vip.setPaymentStatus("SUCCESS");
                vip.setStatus(VipSubscription.Status.PENDING_APPROVAL);

                vip.setCreatedAt(java.time.Instant.now());
                vip.setUpdatedAt(java.time.Instant.now());

                return repo.save(vip);
        }

}