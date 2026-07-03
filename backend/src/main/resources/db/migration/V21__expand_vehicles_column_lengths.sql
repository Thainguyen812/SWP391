-- Flyway Migration V21: Expand vehicles column lengths & update body_shape check constraint
DROP VIEW IF EXISTS v_active_sessions CASCADE;

ALTER TABLE vehicles ALTER COLUMN vehicle_size TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN body_shape TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN fuel_type TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN license_plate TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN color TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN color_rgb TYPE VARCHAR(20);

ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_body_shape_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_body_shape_check CHECK (
    body_shape IN (
        'SEDAN_HATCHBACK', 'SUV_CUV_MPV', 'LARGE_VAN_MINIBUS', 'EV_CAR',
        'SEDAN', 'SUV', 'VAN', 'TRUCK', 'MINIBUS', 'OTHER', 'ELECTRIC',
        'FAMILY_CAR', 'MINIBUS_16', 'VAN_TRUCK', 'MOTORBIKE'
    ) OR body_shape IS NULL
);

CREATE OR REPLACE VIEW v_active_sessions AS
SELECT
    ps.id, ps.license_plate, ps.is_vip, ps.is_locked,
    ps.session_status, ps.check_in_time, ps.validated_qr_id,
    ps.is_suspicious, ps.suspicious_reason,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ps.check_in_time))/3600.0, 2) AS hours_parked,
    z.zone_name, z.zone_code,
    v.vehicle_size, v.color, v.body_shape
FROM parking_sessions ps
LEFT JOIN zones z ON ps.assigned_zone_id = z.id
LEFT JOIN vehicles v ON ps.vehicle_id = v.id
WHERE ps.session_status IN ('ACTIVE','PASSED_CONFIRMED');
