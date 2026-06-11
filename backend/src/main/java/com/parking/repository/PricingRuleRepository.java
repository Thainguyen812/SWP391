package com.parking.repository;

import com.parking.model.PricingRule;
import com.parking.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PricingRuleRepository extends JpaRepository<PricingRule, String> {

    Optional<PricingRule> findByVehicleType(Vehicle.VehicleType vehicleType);
}