-- V3__seed_parking_sessions.sql
-- Thêm dữ liệu mẫu (Mock data) cho bảng parking_sessions để kiểm thử hiển thị "Nhật ký Cổng Trực tiếp" trên Staff Dashboard

DO $$
DECLARE
    zone_f1_id UUID;
    zone_f2_id UUID;
BEGIN
    -- Lấy ID của Zone F1 và F2 để làm dữ liệu mẫu
    SELECT id INTO zone_f1_id FROM zones WHERE zone_code = 'F1' LIMIT 1;
    SELECT id INTO zone_f2_id FROM zones WHERE zone_code = 'F2' LIMIT 1;

    -- Thêm 4 bản ghi tương ứng với dữ liệu giả lập
    INSERT INTO parking_sessions (
        id, license_plate, assigned_zone_id, check_in_time, check_out_time, 
        session_status, is_vip, is_suspicious, suspicious_reason, created_at, updated_at
    ) VALUES 
    (
        gen_random_uuid(), '51A-123.45', zone_f1_id, 
        CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL, 
        'ACTIVE', TRUE, FALSE, NULL, 
        CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'
    ),
    (
        gen_random_uuid(), '30E-882.11', zone_f2_id, 
        CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 
        'COMPLETED', FALSE, FALSE, NULL, 
        CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    ),
    (
        gen_random_uuid(), '-- KHÔNG RÕ --', zone_f1_id, 
        CURRENT_TIMESTAMP - INTERVAL '10 minutes', NULL, 
        'ACTIVE', FALSE, TRUE, 'Lỗi nhận diện biển số tại cổng', 
        CURRENT_TIMESTAMP - INTERVAL '10 minutes', CURRENT_TIMESTAMP - INTERVAL '10 minutes'
    ),
    (
        gen_random_uuid(), '51K-998.02', zone_f1_id, 
        CURRENT_TIMESTAMP - INTERVAL '2 minutes', NULL, 
        'ACTIVE', FALSE, FALSE, NULL, 
        CURRENT_TIMESTAMP - INTERVAL '2 minutes', CURRENT_TIMESTAMP - INTERVAL '2 minutes'
    );
END $$;
