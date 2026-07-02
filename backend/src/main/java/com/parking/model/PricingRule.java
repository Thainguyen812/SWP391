package com.parking.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pricing_rules")
public class PricingRule {

    @Id
    private UUID id;

    @Column(name = "vehicle_size")
    private String vehicleSize;

    @Column(name = "first_hour_fee")
    private BigDecimal firstHourFee;

    @Column(name = "additional_hour_fee")
    private BigDecimal additionalHourFee;

    @Column(name = "max_daily_fee")
    private BigDecimal maxDailyFee;

    @Column(name = "lost_card_penalty")
    private BigDecimal lostCardPenalty;

    @Column(name = "ev_violation_penalty")
    private BigDecimal evViolationPenalty;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getVehicleSize() {
        return vehicleSize;
    }

    public void setVehicleSize(String vehicleSize) {
        this.vehicleSize = vehicleSize;
    }

    public BigDecimal getFirstHourFee() {
        return firstHourFee;
    }

    public void setFirstHourFee(BigDecimal firstHourFee) {
        this.firstHourFee = firstHourFee;
    }

    public BigDecimal getAdditionalHourFee() {
        return additionalHourFee;
    }

    public void setAdditionalHourFee(BigDecimal additionalHourFee) {
        this.additionalHourFee = additionalHourFee;
    }

    public BigDecimal getMaxDailyFee() {
        return maxDailyFee;
    }

    public void setMaxDailyFee(BigDecimal maxDailyFee) {
        this.maxDailyFee = maxDailyFee;
    }

    public BigDecimal getLostCardPenalty() {
        return lostCardPenalty;
    }

    public void setLostCardPenalty(BigDecimal lostCardPenalty) {
        this.lostCardPenalty = lostCardPenalty;
    }

    public BigDecimal getEvViolationPenalty() {
        return evViolationPenalty;
    }

    public void setEvViolationPenalty(BigDecimal evViolationPenalty) {
        this.evViolationPenalty = evViolationPenalty;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }
}