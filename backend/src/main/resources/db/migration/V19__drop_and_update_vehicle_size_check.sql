-- Flyway Migration V19: Update vehicles_vehicle_size_check constraint to include modern vehicle sizes
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_vehicle_size_check;
ALTER TABLE pricing_rules DROP CONSTRAINT IF EXISTS pricing_rules_vehicle_size_check;

-- Add updated check constraint allowing all modern vehicle sizes
ALTER TABLE vehicles ADD CONSTRAINT vehicles_vehicle_size_check 
CHECK (vehicle_size IN ('SEDAN_HATCHBACK', 'SUV_CUV_MPV', 'LARGE_VAN_MINIBUS', 'EV_CAR', 'FAMILY_CAR', 'MINIBUS_16', 'VAN_TRUCK', 'MOTORBIKE', 'ELECTRIC'));
