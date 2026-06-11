package com.parking.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pricing_rules")
public class PricingRule {

    @Id
    @Column(length = 36)
    private String id;

    @Enumerated(EnumType.STRING)
    private Vehicle.VehicleType vehicleType;

    private BigDecimal firstHourFee;

    private BigDecimal additionalHourFee;

    private BigDecimal maxDailyFee;

    private BigDecimal lostCardPenalty;

    private BigDecimal parkingViolationPenalty;

    private Instant effectiveFrom;

    private Instant effectiveTo;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Vehicle.VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(Vehicle.VehicleType vehicleType) {
        this.vehicleType = vehicleType;
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

    public BigDecimal getParkingViolationPenalty() {
        return parkingViolationPenalty;
    }

    public void setParkingViolationPenalty(BigDecimal parkingViolationPenalty) {
        this.parkingViolationPenalty = parkingViolationPenalty;
    }

    public Instant getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(Instant effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public Instant getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(Instant effectiveTo) {
        this.effectiveTo = effectiveTo;
    }
}