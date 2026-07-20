-- Final demo alignment for floor routing and pricing.
-- Source of truth:
-- F1: SEDAN_HATCHBACK, F2: SUV_CUV_MPV, B1: VAN_TRUCK, G: MINIBUS_16.

ALTER TABLE pricing_rules ALTER COLUMN vehicle_size TYPE VARCHAR(50);

INSERT INTO pricing_rules (
    vehicle_size,
    first_hour_fee,
    additional_hour_fee,
    max_daily_fee,
    lost_card_penalty,
    ev_violation_penalty,
    effective_from,
    is_active
)
SELECT 'VAN_TRUCK', 25000, 20000, 200000, 50000, 30000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'VAN_TRUCK');

INSERT INTO pricing_rules (
    vehicle_size,
    first_hour_fee,
    additional_hour_fee,
    max_daily_fee,
    lost_card_penalty,
    ev_violation_penalty,
    effective_from,
    is_active
)
SELECT 'MINIBUS_16', 30000, 20000, 200000, 50000, 30000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'MINIBUS_16');

UPDATE pricing_rules
SET is_active = true,
    effective_from = DATE '2000-01-01'
WHERE vehicle_size IN ('SEDAN_HATCHBACK', 'SUV_CUV_MPV', 'VAN_TRUCK', 'MINIBUS_16');

UPDATE zones
SET zone_name = 'Tầng F1 - Xe 4-5 chỗ',
    allowed_sizes = '["SEDAN_HATCHBACK"]'::jsonb,
    total_slots = 100,
    has_ev_charger = false,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'F1';

UPDATE zones
SET zone_name = 'Tầng F2 - Xe 7-9 chỗ',
    allowed_sizes = '["SUV_CUV_MPV"]'::jsonb,
    total_slots = 80,
    has_ev_charger = false,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'F2';

UPDATE zones
SET zone_name = 'Tầng B1 - Xe van và xe tải nhỏ',
    allowed_sizes = '["VAN_TRUCK"]'::jsonb,
    total_slots = 30,
    has_ev_charger = false,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'B1';

UPDATE zones
SET zone_name = 'Tầng G - Xe khách 12-16 chỗ',
    allowed_sizes = '["MINIBUS_16"]'::jsonb,
    total_slots = 50,
    has_ev_charger = false,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'G';

UPDATE zones z
SET current_occupied = COALESCE((
    SELECT COUNT(*)
    FROM parking_sessions ps
    WHERE ps.assigned_zone_id = z.id
      AND ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
), 0)
WHERE z.zone_code IN ('F1', 'F2', 'B1', 'G');
