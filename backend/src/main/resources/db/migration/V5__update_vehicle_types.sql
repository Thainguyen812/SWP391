-- Xóa tất cả các CHECK constraint trên bảng vehicles và pricing_rules để tránh lỗi
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'vehicles'::regclass AND contype = 'c') LOOP
        EXECUTE 'ALTER TABLE vehicles DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
    FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'pricing_rules'::regclass AND contype = 'c') LOOP
        EXECUTE 'ALTER TABLE pricing_rules DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Tạm thời xóa view
DROP VIEW IF EXISTS v_active_sessions;

-- Mở rộng độ dài cột vehicle_size
ALTER TABLE vehicles ALTER COLUMN vehicle_size TYPE VARCHAR(50);
ALTER TABLE pricing_rules ALTER COLUMN vehicle_size TYPE VARCHAR(50);

-- Tạo lại view sau khi thay đổi kiểu dữ liệu
CREATE OR REPLACE VIEW v_active_sessions AS
SELECT
    ps.id, ps.license_plate, ps.is_vip, ps.is_locked,
    ps.session_status, ps.check_in_time, ps.validated_qr_id,
    ps.is_suspicious, ps.suspicious_reason,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ps.check_in_time))/3600.0, 2) AS hours_parked,
    z.zone_name, z.zone_code,
    v.vehicle_size, v.color, v.body_shape
FROM parking_sessions ps
LEFT JOIN zones z ON ps.assigned_zone_id = z.id
LEFT JOIN vehicles v ON ps.vehicle_id = v.id
WHERE ps.session_status IN ('ACTIVE','PASSED_CONFIRMED');

-- Cập nhật lại Allowed Sizes cho các Tầng (Zones)
UPDATE zones SET allowed_sizes = '["LARGE_VAN_MINIBUS"]' WHERE zone_code = 'B2';
UPDATE zones SET allowed_sizes = '["SUV_CUV_MPV"]' WHERE zone_code = 'B1';
UPDATE zones SET allowed_sizes = '["SEDAN_HATCHBACK"]' WHERE zone_code = 'F1';
UPDATE zones SET allowed_sizes = '["EV_CAR"]' WHERE zone_code = 'F2';

-- Xóa bảng giá cũ
DELETE FROM pricing_rules;

-- Thêm bảng giá mới cho 4 loại xe
INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from) VALUES
    ('SEDAN_HATCHBACK',  15000, 10000, 100000, 50000, 20000, CURRENT_DATE),
    ('SUV_CUV_MPV',      20000, 15000, 150000, 50000, 20000, CURRENT_DATE),
    ('EV_CAR',           20000, 15000, 150000, 50000, 20000, CURRENT_DATE),
    ('LARGE_VAN_MINIBUS',30000, 20000, 200000, 50000, 30000, CURRENT_DATE);
