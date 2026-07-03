-- Flyway Migration V24: Rename B2 to G, align zone properties, and seed missing G & B1 slots

-- Rename B2 to G and align attributes
UPDATE zones
SET zone_code = 'G',
    zone_name = 'Tầng G — Xe Khách 12-16 Chỗ',
    allowed_sizes = '["LARGE_VAN_MINIBUS"]'::jsonb
WHERE zone_code = 'B2';

-- Update B1 name & configuration
UPDATE zones
SET zone_name = 'Tầng B1 — Khu Xe Van & Xe Tải Nhỏ',
    allowed_sizes = '["LARGE_VAN_MINIBUS"]'::jsonb
WHERE zone_code = 'B1';

-- Update F1 and F2 names
UPDATE zones
SET zone_name = 'Tầng 1 — Khu Xe Gia Đình 4-5 Chỗ'
WHERE zone_code = 'F1';

UPDATE zones
SET zone_name = 'Tầng 2 — Khu Xe 7-9 Chỗ'
WHERE zone_code = 'F2';

-- Seed G and B1 physical slots
DO $$
DECLARE
    g_zone_id UUID;
    b1_zone_id UUID;
    i INT;
    slot_num VARCHAR(20);
    sensor_id VARCHAR(50);
BEGIN
    SELECT id INTO g_zone_id FROM zones WHERE zone_code = 'G' LIMIT 1;
    SELECT id INTO b1_zone_id FROM zones WHERE zone_code = 'B1' LIMIT 1;

    -- Seed 10 slots for G
    IF g_zone_id IS NOT NULL THEN
        FOR i IN 1..10 LOOP
            slot_num := 'G-' || lpad(i::text, 2, '0');
            sensor_id := 'SN-G-' || lpad(i::text, 2, '0');
            INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
            VALUES (g_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
            ON CONFLICT (zone_id, slot_number) DO NOTHING;
        END LOOP;
    END IF;

    -- Seed 10 slots for B1
    IF b1_zone_id IS NOT NULL THEN
        FOR i IN 1..10 LOOP
            slot_num := 'B1-' || lpad(i::text, 2, '0');
            sensor_id := 'SN-B1-' || lpad(i::text, 2, '0');
            INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
            VALUES (b1_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
            ON CONFLICT (zone_id, slot_number) DO NOTHING;
        END LOOP;
    END IF;
END $$;
