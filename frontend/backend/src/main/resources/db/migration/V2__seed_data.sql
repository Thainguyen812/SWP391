-- ================================================================
-- DATABASE SEED DATA: STEP 1 MIGRATION
-- Password for all accounts: 123456 (BCrypt cost=10)
-- ================================================================

-- 1. Cập nhật mật khẩu tài khoản admin có sẵn trong V1
UPDATE users
SET password_hash = '$2b$10$YPQevyRLpSTgHbgFQG7ltu/1odkDSWXjyP9tw1hmTJCdN0CTsv3zK'
WHERE username = 'admin';

-- 2. Thêm các tài khoản User mẫu (Manager, Staff, Driver VIP, Driver Casual)
INSERT INTO users (id, username, password_hash, full_name, email, role, status)
VALUES 
    ('a0000000-0000-0000-0000-000000000002', 'manager', '$2b$10$YPQevyRLpSTgHbgFQG7ltu/1odkDSWXjyP9tw1hmTJCdN0CTsv3zK', 'Parking Manager', 'manager@parking.com', 'MANAGER', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000003', 'staff', '$2b$10$YPQevyRLpSTgHbgFQG7ltu/1odkDSWXjyP9tw1hmTJCdN0CTsv3zK', 'Operations Staff', 'staff@parking.com', 'STAFF', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000004', 'driver_vip', '$2b$10$YPQevyRLpSTgHbgFQG7ltu/1odkDSWXjyP9tw1hmTJCdN0CTsv3zK', 'VIP Driver', 'driver_vip@parking.com', 'DRIVER', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000005', 'driver_casual', '$2b$10$YPQevyRLpSTgHbgFQG7ltu/1odkDSWXjyP9tw1hmTJCdN0CTsv3zK', 'Casual Driver', 'driver_casual@parking.com', 'DRIVER', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 3. Thêm phương tiện (Vehicles)
INSERT INTO vehicles (id, owner_id, license_plate, vehicle_size, color, color_rgb, body_shape, brand, is_active)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', '30A-99999', 'FAMILY_CAR', 'Đen', '#1C1C1C', 'SEDAN', 'VinFast', TRUE),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', '29A-11111', 'FAMILY_CAR', 'Trắng', '#FFFFFF', 'SUV', 'Toyota', TRUE),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', '30E-22222', 'MINIBUS_16', 'Bạc', '#C0C0C0', 'MINIBUS', 'Ford', TRUE)
ON CONFLICT (license_plate) DO NOTHING;

-- 4. Thêm Đăng ký VIP (VipSubscription)
INSERT INTO vip_subscriptions (id, vehicle_id, subscription_type, start_date, end_date, status, fee_amount, payment_method, payment_status)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'MONTHLY', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 1200000.00, 'BANK_TRANSFER', 'SUCCESS')
ON CONFLICT (id) DO NOTHING;
