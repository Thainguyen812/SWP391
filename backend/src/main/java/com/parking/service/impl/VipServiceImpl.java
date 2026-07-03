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
                List<VipSubscription> pendingList = repo.findByStatus(VipSubscription.Status.PENDING_APPROVAL);
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
                            return vehicleRepository.save(newV);
                        });

                VipSubscription vip = new VipSubscription();

                vip.setId(UUID.randomUUID());
                vip.setVehicleId(vehicle.getId());
                vip.setSubscriptionType(request.getSubscriptionType());
                vip.setDocumentPhotos(request.getDocumentPhotos());
                vip.setStatus(VipSubscription.Status.PENDING_APPROVAL);

                java.time.LocalDate startDate = java.time.LocalDate.now();
                vip.setStartDate(startDate);

                // Tính toán endDate và feeAmount dựa vào subscriptionType và vehicleSize
                String size = vehicle.getVehicleSize() != null ? vehicle.getVehicleSize().toUpperCase() : "SEDAN_HATCHBACK";
                String type = request.getSubscriptionType() != null ? request.getSubscriptionType().toUpperCase() : "MONTHLY";

                // 1. Calculate endDate based on subscription type
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
                                if ("MONTHLY".equals(type)) {
                                        fallbackFee = 1400000;
                                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                        fallbackFee = 3800000;
                                } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                        fallbackFee = 7000000;
                                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                        fallbackFee = 12500000;
                                }
                        } else if ("LARGE_VAN_MINIBUS".equals(size)) {
                                if ("MONTHLY".equals(type)) {
                                        fallbackFee = 2000000;
                                } else if ("QUARTERLY".equals(type) || "QUATERLY".equals(type)) {
                                        fallbackFee = 5400000;
                                } else if ("HALF_YEARLY".equals(type) || "6_MONTHS".equals(type) || "6_MONTH".equals(type)) {
                                        fallbackFee = 10000000;
                                } else if ("YEARLY".equals(type) || "YEAR".equals(type)) {
                                        fallbackFee = 18000000;
                                }
                        } else { // SEDAN_HATCHBACK or other
                                if ("MONTHLY".equals(type)) {
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
                vip.setPaymentStatus("PENDING");
                vip.setCreatedAt(java.time.Instant.now());
                vip.setUpdatedAt(java.time.Instant.now());

                return repo.save(vip);
        }

}