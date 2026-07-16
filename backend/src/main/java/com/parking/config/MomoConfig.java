package com.parking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MomoConfig {

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    // Manual Getters để các file khác gọi lấy dữ liệu
    public String getPartnerCode() { return partnerCode; }
    public String getAccessKey() { return accessKey; }
    public String getSecretKey() { return secretKey; }
    public String getEndpoint() { return endpoint; }
    public String getRedirectUrl() { return redirectUrl; }
    public String getIpnUrl() { return ipnUrl; }
}