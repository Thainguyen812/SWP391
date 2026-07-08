package com.parking.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dto.CreateViolationRequest;
import com.parking.model.ParkingSession;
import com.parking.model.ParkingViolation;
import com.parking.model.User;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingViolationRepository;
import com.parking.repository.UserRepository;
import com.parking.service.ParkingViolationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class ParkingViolationServiceImpl implements ParkingViolationService {

    private static final Set<String> ALLOWED_VIOLATION_TYPES = Set.of(
            "EV_ZONE_MISUSE",
            "DISABLED_ZONE_MISUSE",
            "DOUBLE_PARKING"
    );

    private final ParkingViolationRepository parkingViolationRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ParkingViolationServiceImpl(
            ParkingViolationRepository parkingViolationRepository,
            ParkingSessionRepository parkingSessionRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.parkingViolationRepository = parkingViolationRepository;
        this.parkingSessionRepository = parkingSessionRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public ParkingViolation createViolation(
            CreateViolationRequest request,
            String username) {

        String licensePlate = request.getLicensePlate().trim().toUpperCase();
        String violationType = request.getViolationType().trim().toUpperCase();

        if (!ALLOWED_VIOLATION_TYPES.contains(violationType)) {
            throw new IllegalArgumentException(
                    "Loại vi phạm không hợp lệ: " + violationType
            );
        }

        User detectedUser = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy người dùng đang đăng nhập"
                        )
                );

        ParkingSession session = parkingSessionRepository
                .findByLicensePlateAndSessionStatus(
                        licensePlate,
                        ParkingSession.SessionStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy phiên đỗ xe ACTIVE cho biển số: "
                                        + licensePlate
                        )
                );

        boolean alreadyExists = parkingViolationRepository
                .existsBySessionIdAndViolationType(
                        session.getId(),
                        violationType
                );

        if (alreadyExists) {
            throw new IllegalArgumentException(
                    "Vi phạm này đã được báo cáo cho phiên đỗ xe hiện tại"
            );
        }

        ParkingViolation violation = new ParkingViolation();

        violation.setSessionId(session.getId());
        // violation.setSlotId(session.getParkedSlotId());
        violation.setViolationType(violationType);
        violation.setDetectedBy(detectedUser.getId());
        violation.setDetectedAt(Instant.now());
        violation.setStatus("PENDING");
        violation.setNotes(request.getNotes());

        violation.setPhotoUrls(
                convertPhotoUrlsToJson(request.getPhotoUrls())
        );

        return parkingViolationRepository.save(violation);
    }

    private String convertPhotoUrlsToJson(List<String> photoUrls) {
        try {
            return objectMapper.writeValueAsString(
                    photoUrls == null ? List.of() : photoUrls
            );
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(
                    "Danh sách ảnh bằng chứng không hợp lệ"
            );
        }
    }
}