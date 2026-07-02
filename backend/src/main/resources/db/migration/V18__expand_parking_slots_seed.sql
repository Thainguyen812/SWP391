-- Flyway Migration V18: Expand physical parking slots and reset slot statuses for seamless testing
DO $$
DECLARE
    g_zone_id UUID;
    b1_zone_id UUID;
    f1_zone_id UUID;
    f2_zone_id UUID;
    i INT;
    slot_num VARCHAR(20);
    sensor_id VARCHAR(50);
    ev_id VARCHAR(50);
BEGIN
    SELECT id INTO g_zone_id FROM zones WHERE zone_code = 'G' LIMIT 1;
    SELECT id INTO b1_zone_id FROM zones WHERE zone_code = 'B1' LIMIT 1;
    SELECT id INTO f1_zone_id FROM zones WHERE zone_code = 'F1' LIMIT 1;
    SELECT id INTO f2_zone_id FROM zones WHERE zone_code = 'F2' LIMIT 1;

    -- Sync zone occupancy counters
    UPDATE zones SET current_occupied = 0 WHERE id IN (g_zone_id, b1_zone_id, f1_zone_id, f2_zone_id);

    -- Reset all slots to AVAILABLE if they don't belong to an ACTIVE parking session
    UPDATE parking_slots 
    SET slot_status = 'AVAILABLE'
    WHERE id NOT IN (
        SELECT parked_slot_id FROM parking_sessions WHERE session_status = 'ACTIVE' AND parked_slot_id IS NOT NULL
    );

    -- Expand 50 physical slots for F1 (Sedan / Hatchback)
    IF f1_zone_id IS NOT NULL THEN
        FOR i IN 1..50 LOOP
            slot_num := 'F1-' || lpad(i::text, 2, '0');
            sensor_id := 'SN-F1-' || lpad(i::text, 2, '0');
            IF i > 40 THEN
                ev_id := 'EV-F1-' || lpad(i::text, 2, '0');
                INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id, ev_charger_id)
                VALUES (f1_zone_id, slot_num, 'EV', 'AVAILABLE', sensor_id, ev_id)
                ON CONFLICT (zone_id, slot_number) DO UPDATE SET slot_status = 'AVAILABLE';
            ELSE
                INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
                VALUES (f1_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
                ON CONFLICT (zone_id, slot_number) DO UPDATE SET slot_status = 'AVAILABLE';
            END IF;
        END LOOP;
    END IF;

    -- Expand 50 physical slots for F2 (SUV / CUV / MPV)
    IF f2_zone_id IS NOT NULL THEN
        FOR i IN 1..50 LOOP
            slot_num := 'F2-' || lpad(i::text, 2, '0');
            sensor_id := 'SN-F2-' || lpad(i::text, 2, '0');
            IF i > 40 THEN
                ev_id := 'EV-F2-' || lpad(i::text, 2, '0');
                INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id, ev_charger_id)
                VALUES (f2_zone_id, slot_num, 'EV', 'AVAILABLE', sensor_id, ev_id)
                ON CONFLICT (zone_id, slot_number) DO UPDATE SET slot_status = 'AVAILABLE';
            ELSE
                INSERT INTO parking_slots (zone_id, slot_number, slot_type, slot_status, sensor_mock_id)
                VALUES (f2_zone_id, slot_num, 'NORMAL', 'AVAILABLE', sensor_id)
                ON CONFLICT (zone_id, slot_number) DO UPDATE SET slot_status = 'AVAILABLE';
            END IF;
        END LOOP;
    END IF;
END $$;
