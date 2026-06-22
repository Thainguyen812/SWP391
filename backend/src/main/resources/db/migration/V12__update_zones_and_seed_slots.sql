-- Update zone names, codes, and allowed_sizes
UPDATE zones
SET zone_name = 'Tầng B1 — Xe Van & Xe Tải Nhỏ',
    allowed_sizes = '["LARGE_VAN_MINIBUS"]'::jsonb
WHERE zone_code = 'B1';

UPDATE zones
SET zone_code = 'G',
    zone_name = 'Tầng G — Xe 12-16 Chỗ',
    allowed_sizes = '["LARGE_VAN_MINIBUS"]'::jsonb
WHERE zone_code = 'B2';

UPDATE zones
SET zone_name = 'Tầng 1 — Xe Gia Đình 4-5 Chỗ',
    allowed_sizes = '["SEDAN_HATCHBACK", "EV_CAR"]'::jsonb
WHERE zone_code = 'F1';

UPDATE zones
SET zone_name = 'Tầng 2 — Xe 7-9 Chỗ',
    allowed_sizes = '["SUV_CUV_MPV", "EV_CAR"]'::jsonb
WHERE zone_code = 'F2';

-- Seed parking slots
DO $$
DECLARE
    g_zone_id UUID;
    b1_zone_id UUID;
    f1_zone_id UUID;
    f2_zone_id UUID;
    i INT;
    slot_num VARCHAR(10);
    sensor_id VARCHAR(50);
    ev_id VARCHAR(50);
BEGIN
    -- Lấy zone_id của từng tầng
    SELECT id INTO g_zone_id FROM zones WHERE zone_code = 'G';
    SELECT id INTO b1_zone_id FROM zones WHERE zone_code = 'B1';
    SELECT id INTO f1_zone_id FROM zones WHERE zone_code = 'F1';
    SELECT id INTO f2_zone_id FROM zones WHERE zone_code = 'F2';

    -- Tạo 5 ô đỗ cho tầng G
    FOR i IN 1..5 LOOP
        slot_num := 'G-' || lpad(i::text, 2, '0');
        sensor_id := 'SN-G-' || lpad(i::text, 2, '0');
        INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
        VALUES (g_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
        ON CONFLICT (zone_id, slot_number) DO NOTHING;
    END LOOP;

    -- Tạo 5 ô đỗ cho tầng B1
    FOR i IN 1..5 LOOP
        slot_num := 'B1-' || lpad(i::text, 2, '0');
        sensor_id := 'SN-B1-' || lpad(i::text, 2, '0');
        INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
        VALUES (b1_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
        ON CONFLICT (zone_id, slot_number) DO NOTHING;
    END LOOP;

    -- Tạo 15 ô đỗ cho tầng 1 (F1)
    FOR i IN 1..15 LOOP
        slot_num := 'F1-' || lpad(i::text, 2, '0');
        sensor_id := 'SN-F1-' || lpad(i::text, 2, '0');
        IF i <= 10 THEN
            INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
            VALUES (f1_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
            ON CONFLICT (zone_id, slot_number) DO NOTHING;
        ELSE
            ev_id := 'EV-F1-' || lpad(i::text, 2, '0');
            INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id, ev_charger_id)
            VALUES (f1_zone_id, slot_num, 'EV', 'AVAILABLE', sensor_id, ev_id)
            ON CONFLICT (zone_id, slot_number) DO NOTHING;
        END IF;
    END LOOP;

    -- Tạo 15 ô đỗ cho tầng 2 (F2)
    FOR i IN 1..15 LOOP
        slot_num := 'F2-' || lpad(i::text, 2, '0');
        sensor_id := 'SN-F2-' || lpad(i::text, 2, '0');
        IF i <= 10 THEN
            INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
            VALUES (f2_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
            ON CONFLICT (zone_id, slot_number) DO NOTHING;
        ELSE
            ev_id := 'EV-F2-' || lpad(i::text, 2, '0');
            INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id, ev_charger_id)
            VALUES (f2_zone_id, slot_num, 'EV', 'AVAILABLE', sensor_id, ev_id)
            ON CONFLICT (zone_id, slot_number) DO NOTHING;
        END IF;
    END LOOP;
END $$;
