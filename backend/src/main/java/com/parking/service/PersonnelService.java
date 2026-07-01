package com.parking.service;

import com.parking.dto.RegisterRequest;
import com.parking.model.User;

public interface PersonnelService {
    User createPersonnel(RegisterRequest request);
}