-- Allow AI/LPR audit logs for the expanded assessment demo flows.
-- Older V1 constraints only allowed three camera locations and generic scan types.

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'ai_scan_logs'::regclass
          AND contype = 'c'
    LOOP
        EXECUTE format('ALTER TABLE ai_scan_logs DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END LOOP;
END $$;

ALTER TABLE ai_scan_logs ALTER COLUMN scan_location TYPE VARCHAR(50);
ALTER TABLE ai_scan_logs ALTER COLUMN scan_type TYPE VARCHAR(50);
ALTER TABLE ai_scan_logs ALTER COLUMN detected_vehicle_type TYPE VARCHAR(50);
ALTER TABLE ai_scan_logs ALTER COLUMN detected_plate TYPE VARCHAR(50);
ALTER TABLE ai_scan_logs ALTER COLUMN image_url TYPE VARCHAR(1024);

ALTER TABLE ai_scan_logs
    ADD CONSTRAINT ai_scan_logs_scan_location_check
    CHECK (scan_location IN (
        'MAIN_ENTRANCE',
        'VIP_EXIT',
        'CASUAL_EXIT',
        'ENTRY_GATE',
        'EXIT_GATE',
        'MOBILE_POS'
    ));

ALTER TABLE ai_scan_logs
    ADD CONSTRAINT ai_scan_logs_scan_type_check
    CHECK (scan_type IN (
        'STANDARD',
        'CHECK_IN_FP',
        'CHECK_OUT_FP',
        'ANTI_THEFT',
        'SUSPICIOUS',
        'VIP_ENTRY_LPR',
        'VISITOR_ENTRY_LPR',
        'ENTRY_APPROVAL',
        'VIP_PENDING_APPROVAL',
        'VIP_EXIT_APPROVAL',
        'CARD_EXIT_CONFIRM',
        'MOBILE_POS_PREPAY',
        'MOBILE_POS_EXIT_CONFIRM'
    ));
