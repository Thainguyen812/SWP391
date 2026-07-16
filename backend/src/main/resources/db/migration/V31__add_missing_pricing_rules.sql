-- Flyway Migration V31: Add missing pricing rules
ALTER TABLE pricing_rules ALTER COLUMN vehicle_size TYPE VARCHAR(50);

-- Thêm các bảng giá còn thiếu cho các loại xe mới (nếu chưa có)
INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'SEDAN_HATCHBACK', 15000, 10000, 100000, 50000, 20000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'SEDAN_HATCHBACK');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'SUV_CUV_MPV', 20000, 15000, 150000, 50000, 20000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'SUV_CUV_MPV');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'LARGE_VAN_MINIBUS', 30000, 20000, 200000, 50000, 30000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'LARGE_VAN_MINIBUS');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'EV_CAR', 20000, 15000, 150000, 50000, 20000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'EV_CAR');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'MOTORBIKE', 5000, 2000, 30000, 30000, 20000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'MOTORBIKE');

INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from, is_active)
SELECT 'ELECTRIC', 5000, 2000, 30000, 30000, 20000, '2000-01-01', true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicle_size = 'ELECTRIC');
