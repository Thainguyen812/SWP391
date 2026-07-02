-- Flyway Migration V20: Link RFID cards to all existing seed parking sessions with NULL card_id
DO $$
DECLARE
    rec RECORD;
    avail_card_id UUID;
BEGIN
    FOR rec IN 
        SELECT id FROM parking_sessions WHERE (is_vip IS FALSE OR is_vip IS NULL) AND card_id IS NULL
    LOOP
        SELECT id INTO avail_card_id FROM cards WHERE status = 'AVAILABLE' LIMIT 1;
        
        IF avail_card_id IS NULL THEN
            avail_card_id := gen_random_uuid();
            INSERT INTO cards (id, card_code, status, created_at, updated_at)
            VALUES (avail_card_id, '00' || FLOOR(1000 + RANDOM() * 9000)::text, 'IN_USE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        ELSE
            UPDATE cards SET status = 'IN_USE', updated_at = CURRENT_TIMESTAMP WHERE id = avail_card_id;
        END IF;

        UPDATE parking_sessions SET card_id = avail_card_id WHERE id = rec.id;
    END LOOP;
END $$;
