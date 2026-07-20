-- Assessment 3 demo reset script.
-- Run this in pgAdmin before demo when you want a clean parking lot.
-- Scope:
--   1) Clears live sessions and demo-plate sessions.
--   2) Resets sample cards 000001..000120 to AVAILABLE.
--   3) Seeds deterministic demo vehicles/VIP subscriptions.
--   4) Aligns zones/pricing with the final floor-routing rules.

BEGIN;

CREATE TEMP TABLE demo_vehicle_seed (
    license_plate VARCHAR(50) PRIMARY KEY,
    model VARCHAR(100),
    brand VARCHAR(80),
    vehicle_size VARCHAR(50),
    fuel_type VARCHAR(50),
    is_vip BOOLEAN,
    color VARCHAR(30),
    color_rgb VARCHAR(7),
    body_shape VARCHAR(50),
    zone_code VARCHAR(10),
    image_url VARCHAR(255)
) ON COMMIT DROP;

INSERT INTO demo_vehicle_seed VALUES
('30H-12312', 'Toyota Vios', 'Toyota', 'SEDAN_HATCHBACK', 'GASOLINE', true, 'Vang', '#F7C600', 'SEDAN_HATCHBACK', 'F1', '/images/vios.png'),
('30H-12314', 'Toyota Raize', 'Toyota', 'SEDAN_HATCHBACK', 'GASOLINE', false, 'Xanh nhat', '#8BC6FF', 'SEDAN_HATCHBACK', 'F1', '/images/raize.png'),
('30G-68788.SIM', 'Hyundai Accent', 'Hyundai', 'SEDAN_HATCHBACK', 'GASOLINE', false, 'Trang', '#FFFFFF', 'SEDAN_HATCHBACK', 'F1', '/images/accent.png'),
('29A-47440.SIM', 'Kia Morning', 'Kia', 'SEDAN_HATCHBACK', 'GASOLINE', false, 'Xanh bac', '#D5E7FF', 'SEDAN_HATCHBACK', 'F1', '/images/morning.png'),
('51H-61444.SIM', 'Mazda 3', 'Mazda', 'SEDAN_HATCHBACK', 'GASOLINE', false, 'Den', '#1F2937', 'SEDAN_HATCHBACK', 'F1', '/images/mazda3.png'),
('65A-56432', 'VinFast VF e34', 'VinFast', 'SEDAN_HATCHBACK', 'ELECTRIC', false, 'Trang', '#FFFFFF', 'SEDAN_HATCHBACK', 'F1', '/images/vfe34.png'),
('30E-44840.SIM', 'VinFast VF 5', 'VinFast', 'SEDAN_HATCHBACK', 'ELECTRIC', false, 'Xanh', '#0EA5E9', 'SEDAN_HATCHBACK', 'F1', '/images/vf5.png'),
('51F-35072.SIM', 'Tesla Model 3', 'Tesla', 'SEDAN_HATCHBACK', 'ELECTRIC', false, 'Do', '#EF4444', 'SEDAN_HATCHBACK', 'F1', '/images/tesla_model_3.png'),

('65A-09231', 'Toyota Camry', 'Toyota', 'SUV_CUV_MPV', 'GASOLINE', true, 'Trang', '#FFFFFF', 'SUV_CUV_MPV', 'F2', '/images/camry.png'),
('65H-98765', 'Ford Everest', 'Ford', 'SUV_CUV_MPV', 'GASOLINE', false, 'Trang', '#FFFFFF', 'SUV_CUV_MPV', 'F2', '/images/everest.png'),
('51A-28454.SIM', 'Hyundai Santa Fe', 'Hyundai', 'SUV_CUV_MPV', 'GASOLINE', false, 'Trang', '#FFFFFF', 'SUV_CUV_MPV', 'F2', '/images/santafe.png'),
('51K-87908.SIM', 'Kia Sorento', 'Kia', 'SUV_CUV_MPV', 'GASOLINE', false, 'Den', '#111827', 'SUV_CUV_MPV', 'F2', '/images/sorento.png'),
('30E-75058.SIM', 'VinFast VF 9', 'VinFast', 'SUV_CUV_MPV', 'ELECTRIC', false, 'Xanh dam', '#0F172A', 'SUV_CUV_MPV', 'F2', '/images/vf9.png'),
('59A-55555', 'Honda CR-V', 'Honda', 'SUV_CUV_MPV', 'GASOLINE', false, 'Trang', '#FFFFFF', 'SUV_CUV_MPV', 'F2', '/images/crv.png'),

('51H-13579', 'Ford Transit', 'Ford', 'VAN_TRUCK', 'GASOLINE', true, 'Trang', '#FFFFFF', 'VAN_TRUCK', 'B1', '/images/transit.png'),
('51H-14963.SIM', 'Ford Transit Van', 'Ford', 'VAN_TRUCK', 'GASOLINE', false, 'Trang', '#FFFFFF', 'VAN_TRUCK', 'B1', '/images/transit_van.png'),
('51G-63567.SIM', 'Hyundai Porter', 'Hyundai', 'VAN_TRUCK', 'GASOLINE', false, 'Bac', '#94A3B8', 'VAN_TRUCK', 'B1', '/images/porter.png'),
('29A-52992.SIM', 'Kia Carnival Cargo', 'Kia', 'VAN_TRUCK', 'GASOLINE', false, 'Den', '#0F172A', 'VAN_TRUCK', 'B1', '/images/carnival.png'),

('51K-29673.SIM', 'Toyota Granvia', 'Toyota', 'MINIBUS_16', 'GASOLINE', true, 'Trang', '#FFFFFF', 'MINIBUS_16', 'G', '/images/granvia.png'),
('51K-95013.SIM', 'Mercedes Sprinter', 'Mercedes', 'MINIBUS_16', 'GASOLINE', false, 'Trang', '#FFFFFF', 'MINIBUS_16', 'G', '/images/sprinter.png'),
('51F-43244.SIM', 'Ford Transit 16 cho', 'Ford', 'MINIBUS_16', 'GASOLINE', false, 'Trang', '#FFFFFF', 'MINIBUS_16', 'G', '/images/transit_16.png'),
('30E-31770.SIM', 'VinFast Minibus EV', 'VinFast', 'MINIBUS_16', 'ELECTRIC', true, 'Xanh', '#0EA5E9', 'MINIBUS_16', 'G', '/images/minibus_ev.png');

INSERT INTO users (username, password_hash, full_name, email, phone, role, status)
SELECT 'demo_driver', '$2b$10$YPQevyRLpSTgHbgFQG7ltu/1odkDSWXjyP9tw1hmTJCdN0CTsv3zK', 'Demo Driver', 'demo.driver@urbanpark.local', '0900000001', 'DRIVER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'demo_driver' OR email = 'demo.driver@urbanpark.local'
);

INSERT INTO users (username, password_hash, full_name, email, phone, role, status)
SELECT 'demo_manager', '$2b$10$YPQevyRLpSTgHbgFQG7ltu/1odkDSWXjyP9tw1hmTJCdN0CTsv3zK', 'Demo Manager', 'demo.manager@urbanpark.local', '0900000002', 'MANAGER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'demo_manager' OR email = 'demo.manager@urbanpark.local'
);

WITH live_or_demo_sessions AS (
    SELECT ps.id, ps.card_id
    FROM parking_sessions ps
    WHERE ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
       OR EXISTS (
           SELECT 1
           FROM demo_vehicle_seed d
           WHERE UPPER(REPLACE(ps.license_plate, ' ', '')) = UPPER(REPLACE(d.license_plate, ' ', ''))
       )
)
DELETE FROM parking_violations pv
WHERE pv.session_id IN (SELECT id FROM live_or_demo_sessions);

WITH live_or_demo_sessions AS (
    SELECT ps.id, ps.card_id
    FROM parking_sessions ps
    WHERE ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
       OR EXISTS (
           SELECT 1
           FROM demo_vehicle_seed d
           WHERE UPPER(REPLACE(ps.license_plate, ' ', '')) = UPPER(REPLACE(d.license_plate, ' ', ''))
       )
)
DELETE FROM transactions t
WHERE t.session_id IN (SELECT id FROM live_or_demo_sessions);

WITH live_or_demo_sessions AS (
    SELECT ps.id, ps.card_id
    FROM parking_sessions ps
    WHERE ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
       OR EXISTS (
           SELECT 1
           FROM demo_vehicle_seed d
           WHERE UPPER(REPLACE(ps.license_plate, ' ', '')) = UPPER(REPLACE(d.license_plate, ' ', ''))
       )
)
DELETE FROM blacklisted_cards bc
WHERE bc.session_id IN (SELECT id FROM live_or_demo_sessions)
   OR bc.card_id IN (SELECT card_id FROM live_or_demo_sessions WHERE card_id IS NOT NULL);

WITH live_or_demo_sessions AS (
    SELECT ps.id
    FROM parking_sessions ps
    WHERE ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
       OR EXISTS (
           SELECT 1
           FROM demo_vehicle_seed d
           WHERE UPPER(REPLACE(ps.license_plate, ' ', '')) = UPPER(REPLACE(d.license_plate, ' ', ''))
       )
)
DELETE FROM ai_scan_logs l
WHERE l.session_id IN (SELECT id FROM live_or_demo_sessions)
   OR EXISTS (
       SELECT 1
       FROM demo_vehicle_seed d
       WHERE UPPER(REPLACE(l.detected_plate, ' ', '')) = UPPER(REPLACE(d.license_plate, ' ', ''))
   );

DELETE FROM parking_sessions ps
WHERE ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
   OR EXISTS (
       SELECT 1
       FROM demo_vehicle_seed d
       WHERE UPPER(REPLACE(ps.license_plate, ' ', '')) = UPPER(REPLACE(d.license_plate, ' ', ''))
   );

UPDATE parking_slots
SET slot_status = 'AVAILABLE',
    sensor_mock_id = COALESCE(sensor_mock_id, 'SN-' || slot_number),
    last_updated = CURRENT_TIMESTAMP
WHERE slot_status <> 'AVAILABLE';

INSERT INTO cards (card_code, status, created_at, updated_at)
SELECT LPAD(i::TEXT, 6, '0'), 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM generate_series(1, 120) AS s(i)
ON CONFLICT (card_code) DO UPDATE
SET status = 'AVAILABLE',
    updated_at = CURRENT_TIMESTAMP;

WITH owner AS (
    SELECT id
    FROM users
    WHERE role = 'DRIVER'
    ORDER BY CASE WHEN username = 'demo_driver' THEN 0 ELSE 1 END, created_at
    LIMIT 1
)
INSERT INTO vehicles (
    owner_id,
    license_plate,
    vehicle_size,
    color,
    color_rgb,
    body_shape,
    brand,
    registration_doc_url,
    registration_photo_url,
    violation_count,
    is_active,
    fuel_type,
    is_locked,
    created_at,
    updated_at
)
SELECT
    owner.id,
    d.license_plate,
    d.vehicle_size,
    d.color,
    d.color_rgb,
    d.body_shape,
    d.model,
    '/images/' || regexp_replace(upper(d.license_plate), '[^A-Z0-9]+', '_', 'g') || '_registration.svg',
    d.image_url,
    0,
    true,
    d.fuel_type,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM demo_vehicle_seed d
CROSS JOIN owner
ON CONFLICT (license_plate) DO UPDATE
SET vehicle_size = EXCLUDED.vehicle_size,
    color = EXCLUDED.color,
    color_rgb = EXCLUDED.color_rgb,
    body_shape = EXCLUDED.body_shape,
    brand = EXCLUDED.brand,
    registration_doc_url = EXCLUDED.registration_doc_url,
    registration_photo_url = EXCLUDED.registration_photo_url,
    violation_count = 0,
    is_active = true,
    fuel_type = EXCLUDED.fuel_type,
    is_locked = false,
    updated_at = CURRENT_TIMESTAMP;

WITH approver AS (
    SELECT id
    FROM users
    WHERE role IN ('MANAGER', 'ADMIN')
    ORDER BY CASE WHEN username = 'demo_manager' THEN 0 ELSE 1 END, created_at
    LIMIT 1
),
vip_vehicles AS (
    SELECT v.id AS vehicle_id, d.license_plate, d.image_url
    FROM vehicles v
    JOIN demo_vehicle_seed d ON UPPER(REPLACE(v.license_plate, ' ', '')) = UPPER(REPLACE(d.license_plate, ' ', ''))
    WHERE d.is_vip = true
)
INSERT INTO vip_subscriptions (
    vehicle_id,
    subscription_type,
    start_date,
    end_date,
    status,
    document_photos,
    approved_by,
    approved_at,
    fee_amount,
    payment_method,
    payment_reference,
    payment_status,
    created_at,
    updated_at
)
SELECT
    vv.vehicle_id,
    'MONTHLY',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '30 days',
    'ACTIVE',
    jsonb_build_object(
        'registrationDocUrl', '/images/' || regexp_replace(upper(vv.license_plate), '[^A-Z0-9]+', '_', 'g') || '_registration.svg',
        'registrationPhotoUrl', vv.image_url,
        'identityDocUrl', '/images/' || regexp_replace(upper(vv.license_plate), '[^A-Z0-9]+', '_', 'g') || '_identity.svg'
    ),
    approver.id,
    CURRENT_TIMESTAMP,
    1000000,
    'VNPAY_SANDBOX',
    'DEMO-VIP-' || regexp_replace(upper(vv.license_plate), '[^A-Z0-9]+', '', 'g'),
    'SUCCESS',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM vip_vehicles vv
CROSS JOIN approver
WHERE NOT EXISTS (
    SELECT 1
    FROM vip_subscriptions existing
    WHERE existing.vehicle_id = vv.vehicle_id
      AND existing.status = 'ACTIVE'
);

UPDATE zones
SET zone_name = CASE zone_code
        WHEN 'F1' THEN 'Tầng F1 - Xe 4-5 chỗ'
        WHEN 'F2' THEN 'Tầng F2 - Xe 7-9 chỗ'
        WHEN 'B1' THEN 'Tầng B1 - Xe van và xe tải nhỏ'
        WHEN 'G' THEN 'Tầng G - Xe khách 12-16 chỗ'
        ELSE zone_name
    END,
    allowed_sizes = CASE zone_code
        WHEN 'F1' THEN '["SEDAN_HATCHBACK"]'::jsonb
        WHEN 'F2' THEN '["SUV_CUV_MPV"]'::jsonb
        WHEN 'B1' THEN '["VAN_TRUCK"]'::jsonb
        WHEN 'G' THEN '["MINIBUS_16"]'::jsonb
        ELSE allowed_sizes
    END,
    current_occupied = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code IN ('F1', 'F2', 'B1', 'G');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'SEDAN_HATCHBACK', 15000, 10000, 100000, 50000, 20000, DATE '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'SEDAN_HATCHBACK');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'SUV_CUV_MPV', 20000, 15000, 150000, 50000, 20000, DATE '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'SUV_CUV_MPV');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'VAN_TRUCK', 25000, 20000, 200000, 50000, 30000, DATE '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'VAN_TRUCK');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'MINIBUS_16', 30000, 20000, 200000, 50000, 30000, DATE '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'MINIBUS_16');

COMMIT;

SELECT 'Demo dataset reset completed' AS status;
