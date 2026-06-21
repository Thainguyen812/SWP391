DO $$
DECLARE
    zone_a_id UUID;
    zone_b_id UUID;
BEGIN
    -- Sửa lại từ 'F1'/'F2' thành 'ZONE-A'/'ZONE-B'
    SELECT id INTO zone_a_id FROM zones WHERE zone_code = 'ZONE-A' LIMIT 1;
    SELECT id INTO zone_b_id FROM zones WHERE zone_code = 'ZONE-B' LIMIT 1;

    -- Thêm các bản ghi, sử dụng các biến vừa tìm được
    INSERT INTO parking_sessions (
        id, license_plate, assigned_zone_id, check_in_time, check_out_time, 
        session_status, is_vip, is_suspicious, suspicious_reason, created_at, updated_at
    ) VALUES 
    (gen_random_uuid(), '51A-123.45', zone_a_id, CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL, 'ACTIVE', TRUE, FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '30E-882.11', zone_b_id, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'COMPLETED', FALSE, FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '51K-998.02', zone_a_id, CURRENT_TIMESTAMP - INTERVAL '2 minutes', NULL, 'ACTIVE', FALSE, FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
END $$;