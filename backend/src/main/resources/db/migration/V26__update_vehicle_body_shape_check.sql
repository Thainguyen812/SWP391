-- Flyway Migration V22: Update vehicles_body_shape_check constraint to allow modern vehicle body shapes
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_body_shape_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_body_shape_check CHECK (
    body_shape IN (
        'SEDAN_HATCHBACK', 'SUV_CUV_MPV', 'LARGE_VAN_MINIBUS', 'EV_CAR',
        'SEDAN', 'SUV', 'VAN', 'TRUCK', 'MINIBUS', 'OTHER', 'ELECTRIC',
        'FAMILY_CAR', 'MINIBUS_16', 'VAN_TRUCK', 'MOTORBIKE'
    ) OR body_shape IS NULL
);
