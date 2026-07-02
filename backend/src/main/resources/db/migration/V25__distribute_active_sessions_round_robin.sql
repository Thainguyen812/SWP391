-- Flyway Migration V25: Distribute active sessions evenly across all zones (round-robin)

DO $$
DECLARE
    rec RECORD;
    zone_ids UUID[];
    num_zones INT;
    idx INT := 1;
BEGIN
    -- Collect all zone UUIDs into an array sorted by zone_code (B1, F1, F2, G)
    SELECT array_agg(id) INTO zone_ids 
    FROM (
        SELECT id FROM zones ORDER BY zone_code
    ) t;
    
    num_zones := array_length(zone_ids, 1);
    
    -- Loop through all active sessions in order to distribute them evenly
    FOR rec IN (
        SELECT id FROM parking_sessions WHERE check_out_time IS NULL ORDER BY license_plate
    ) LOOP
        UPDATE parking_sessions 
        SET assigned_zone_id = zone_ids[idx]
        WHERE id = rec.id;
        
        -- Increment and wrap around index
        idx := idx + 1;
        IF idx > num_zones THEN
            idx := 1;
        END IF;
    END LOOP;
END $$;
