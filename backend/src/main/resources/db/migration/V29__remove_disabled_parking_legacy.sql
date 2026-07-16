-- Remove legacy disabled-parking concepts. The project now models only normal/EV slots
-- and the active violation types are EV misuse and double parking.

UPDATE parking_slots
SET slot_type = 'NORMAL'
WHERE slot_type = 'DISABLED';

DELETE FROM parking_violations
WHERE violation_type = 'DISABLED_ZONE_MISUSE';

DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'parking_slots'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%DISABLED%'
    LOOP
        EXECUTE format('ALTER TABLE parking_slots DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END $$;

ALTER TABLE parking_slots
ADD CONSTRAINT chk_parking_slots_slot_type_no_disabled
CHECK (slot_type IN ('NORMAL', 'EV'));

DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'parking_violations'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%DISABLED_ZONE_MISUSE%'
    LOOP
        EXECUTE format('ALTER TABLE parking_violations DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END $$;

ALTER TABLE parking_violations
ADD CONSTRAINT chk_parking_violations_type_no_disabled
CHECK (violation_type IN ('EV_ZONE_MISUSE', 'DOUBLE_PARKING'));
