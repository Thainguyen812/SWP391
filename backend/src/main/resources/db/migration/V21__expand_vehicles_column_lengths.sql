-- Flyway Migration V21: Expand vehicles column lengths to prevent 'value too long for type character varying'
ALTER TABLE vehicles ALTER COLUMN vehicle_size TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN body_shape TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN fuel_type TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN license_plate TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN color TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN color_rgb TYPE VARCHAR(20);
