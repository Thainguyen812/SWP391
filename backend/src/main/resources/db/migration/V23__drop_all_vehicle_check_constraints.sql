-- Flyway Migration V23: Drop all restrictive CHECK constraints on vehicles table
-- This allows any UI vehicle type string (Vietnamese labels or Enum codes) without DB violation.

ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_body_shape_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_vehicle_size_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS chk_fuel_type;
