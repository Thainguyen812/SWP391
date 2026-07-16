-- Normalize floor assignment rules for the final demo flow.
-- Vehicle fuel type is handled separately from vehicle size, so EV_CAR must not
-- appear as an allowed floor size.

UPDATE zones
SET zone_name = 'Tầng F1 - Xe 4-5 chỗ',
    allowed_sizes = '["SEDAN_HATCHBACK"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'F1';

UPDATE zones
SET zone_name = 'Tầng F2 - Xe 7-9 chỗ',
    allowed_sizes = '["SUV_CUV_MPV"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'F2';

UPDATE zones
SET zone_name = 'Tầng B1 - Xe van và xe tải nhỏ',
    allowed_sizes = '["LARGE_VAN_MINIBUS"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'B1';

UPDATE zones
SET zone_name = 'Tầng G - Xe khách 12-16 chỗ',
    allowed_sizes = '["LARGE_VAN_MINIBUS"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE zone_code = 'G';
