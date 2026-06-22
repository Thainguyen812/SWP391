-- 1. Thêm cột fuel_type vào bảng vehicles để phân loại động cơ
ALTER TABLE vehicles ADD COLUMN fuel_type VARCHAR(10) DEFAULT 'GASOLINE';
ALTER TABLE vehicles ADD CONSTRAINT chk_fuel_type CHECK (fuel_type IN ('GASOLINE', 'ELECTRIC'));

-- 2. Thêm cột slot_photo_url vào bảng parking_sessions để lưu ảnh chụp xe tại ô đỗ
ALTER TABLE parking_sessions ADD COLUMN slot_photo_url VARCHAR(512) DEFAULT NULL;
