package com.parking.service;

import com.parking.repository.BlacklistedPlateRepository;
import org.springframework.stereotype.Service;

@Service
public class BlacklistService {

    private final BlacklistedPlateRepository blacklistedPlateRepository;

    public BlacklistService(BlacklistedPlateRepository blacklistedPlateRepository) {
        this.blacklistedPlateRepository = blacklistedPlateRepository;
    }

    public boolean isPlateBlacklisted(String licensePlate) {
        return blacklistedPlateRepository.existsByLicensePlate(licensePlate);
    }

    public void validatePlateNotBlacklisted(String licensePlate) {
        boolean isBlacklisted = isPlateBlacklisted(licensePlate);

        if (isBlacklisted) {
            throw new RuntimeException("Vehicle plate is blacklisted");
        }
    }
}  