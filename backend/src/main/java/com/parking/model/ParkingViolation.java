package com.parking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_violations")
@Data
public class ParkingViolation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Liên kết với phiên xe (Bắt buộc)
    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    // Loại vi phạm (Bắt buộc, ví dụ: 'EV_ZONE_MISUSE')
    @Column(name = "violation_type", nullable = false)
    private String violationType = "EV_ZONE_MISUSE";

    // Ảnh bằng chứng (JSONB)
    @Column(name = "photo_urls", columnDefinition = "jsonb")
    private String photoUrls = "[]";

    // Người/Hệ thống phát hiện (Bắt buộc)
    @Column(name = "detected_by", nullable = false)
    private UUID detectedBy;

    // Thời gian phát hiện (Đổi từ createdAt)
    @Column(name = "detected_at")
    private Instant detectedAt;

    // Các trường kiểm soát phạt
    @Column(name = "is_first_violation")
    private boolean isFirstViolation = true;

    @Column(name = "penalty_applied")
    private boolean penaltyApplied = false;

    @Column(name = "penalty_amount")
    private BigDecimal penaltyAmount = BigDecimal.ZERO;

    // Lưu giữ slotId để tra cứu nhanh nếu cần
    @Column(name = "slot_id")
    private UUID slotId;

    @Column(name = "status")
    private String status = "PENDING"; // PENDING, PROCESSED
}