DO $$ 
DECLARE 
    i INT; 
    random_plate VARCHAR(20); 
    user_id UUID := '486ad0d5-e99e-49ec-85e4-412b2d64f8e0';
BEGIN 
    FOR i IN 1..30 LOOP 
        random_plate := (FLOOR(RANDOM() * 90 + 10)::TEXT) || CHR(FLOOR(RANDOM() * 26 + 65)::INT) || '-' || (FLOOR(RANDOM() * 90000 + 10000)::TEXT); 
        INSERT INTO vehicles (id, owner_id, license_plate, vehicle_size, color, brand, is_locked) 
        VALUES (gen_random_uuid(), user_id, random_plate, 'SEDAN_HATCHBACK', 'Black', 'Toyota', false) 
        ON CONFLICT (license_plate) DO NOTHING; 
    END LOOP; 
END $$;
