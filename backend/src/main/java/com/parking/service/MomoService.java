package com.parking.service;

import java.util.Map;
import java.util.UUID;

public interface MomoService {
    // Hàm tạo link thanh toán dựa vào ID đơn đăng ký VIP
    Map<String, String> createPaymentUrl(UUID subscriptionId);
}