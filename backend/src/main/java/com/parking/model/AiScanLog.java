package com.parking.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_scan_logs")
public class AiScanLog {
    @Id
    private UUID id;

    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "scan_location", nullable = false)
    private String scanLocation;

    @Column(name = "scan_type", nullable = false)
    private String scanType;

    @Column(name = "camera_id", nullable = false)
    private String cameraId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "detected_plate", nullable = false)
    private String detectedPlate;

    @Column(name = "confidence_score", nullable = false)
    private BigDecimal confidenceScore;

    @Column(name = "detected_vehicle_type")
    private String detectedVehicleType;

    @Column(name = "detected_color")
    private String detectedColor;

    @Column(name = "detected_color_rgb")
    private String detectedColorRgb;

    @Column(name = "detected_shape")
    private String detectedShape;

    @Column(name = "match_score")
    private BigDecimal matchScore;

    @Column(name = "color_diff")
    private BigDecimal colorDiff;

    @Column(name = "shape_match")
    private Boolean shapeMatch;

    @Column(name = "scanned_qr_token")
    private String scannedQrToken;

    @Column(name = "qr_match")
    private Boolean qrMatch;

    @Column(name = "is_overridden", nullable = false)
    private boolean isOverridden = false;

    @Column(name = "override_plate")
    private String overridePlate;

    @Column(name = "override_by")
    private UUID overrideBy;

    @Column(name = "override_reason")
    private String overrideReason;

    @Column(name = "is_evidence", nullable = false)
    private boolean isEvidence = false;

    @Column(name = "scanned_at")
    private Instant scannedAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getScanLocation() { return scanLocation; }
    public void setScanLocation(String scanLocation) { this.scanLocation = scanLocation; }
    public String getScanType() { return scanType; }
    public void setScanType(String scanType) { this.scanType = scanType; }
    public String getCameraId() { return cameraId; }
    public void setCameraId(String cameraId) { this.cameraId = cameraId; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDetectedPlate() { return detectedPlate; }
    public void setDetectedPlate(String detectedPlate) { this.detectedPlate = detectedPlate; }
    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    public String getDetectedVehicleType() { return detectedVehicleType; }
    public void setDetectedVehicleType(String detectedVehicleType) { this.detectedVehicleType = detectedVehicleType; }
    public String getDetectedColor() { return detectedColor; }
    public void setDetectedColor(String detectedColor) { this.detectedColor = detectedColor; }
    public String getDetectedColorRgb() { return detectedColorRgb; }
    public void setDetectedColorRgb(String detectedColorRgb) { this.detectedColorRgb = detectedColorRgb; }
    public String getDetectedShape() { return detectedShape; }
    public void setDetectedShape(String detectedShape) { this.detectedShape = detectedShape; }
    public BigDecimal getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(BigDecimal matchScore) {
        this.matchScore = matchScore;
    }

    public BigDecimal getColorDiff() {
        return colorDiff;
    }

    public void setColorDiff(BigDecimal colorDiff) {
        this.colorDiff = colorDiff;
    }
    public Boolean getShapeMatch() { return shapeMatch; }
    public void setShapeMatch(Boolean shapeMatch) { this.shapeMatch = shapeMatch; }
    public String getScannedQrToken() { return scannedQrToken; }
    public void setScannedQrToken(String scannedQrToken) { this.scannedQrToken = scannedQrToken; }
    public Boolean getQrMatch() { return qrMatch; }
    public void setQrMatch(Boolean qrMatch) { this.qrMatch = qrMatch; }
    public boolean isOverridden() { return isOverridden; }
    public void setOverridden(boolean overridden) { isOverridden = overridden; }
    public String getOverridePlate() { return overridePlate; }
    public void setOverridePlate(String overridePlate) { this.overridePlate = overridePlate; }
    public UUID getOverrideBy() { return overrideBy; }
    public void setOverrideBy(UUID overrideBy) { this.overrideBy = overrideBy; }
    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
    public boolean isEvidence() { return isEvidence; }
    public void setEvidence(boolean evidence) { isEvidence = evidence; }
    public Instant getScannedAt() { return scannedAt; }
    public void setScannedAt(Instant scannedAt) { this.scannedAt = scannedAt; }
}
