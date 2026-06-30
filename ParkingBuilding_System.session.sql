-- =========================================================================
-- PARKING BUILDING SYSTEM - COMPREHENSIVE SEED DATA
-- Purpose: Mock data for testing all system functionalities, Edge cases, 
-- Manager Dashboard, AI Camera simulations, and Staff operations.
-- =========================================================================

-- 1. CLEANUP (WARNING: This will wipe existing data in these tables)
TRUNCATE TABLE parking_sessions CASCADE;
TRUNCATE TABLE blacklisted_cards CASCADE;
TRUNCATE TABLE vip_subscriptions CASCADE;
TRUNCATE TABLE vehicles CASCADE;
TRUNCATE TABLE zones CASCADE;
TRUNCATE TABLE users CASCADE;

-- 2. USERS (Mật khẩu mặc định cho tất cả: 'password')
-- Admin: 00000000-0000-0000-0000-000000000001
-- Manager: 00000000-0000-0000-0000-000000000002
-- Staff 1: 00000000-0000-0000-0000-000000000003
-- Driver 1: 00000000-0000-0000-0000-000000000005
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, status, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGKK.H1N9s6W8.9C7P.O', 'Hệ thống Quản trị', 'admin@urbanpark.com', '0901234567', 'ADMIN', 'ACTIVE', NOW()),
('00000000-0000-0000-0000-000000000002', 'manager1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGKK.H1N9s6W8.9C7P.O', 'John Manager', 'manager@urbanpark.com', '0912345678', 'MANAGER', 'ACTIVE', NOW()),
('00000000-0000-0000-0000-000000000003', 'staff1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGKK.H1N9s6W8.9C7P.O', 'Nguyễn Thị Thu Ngân', 'staff1@urbanpark.com', '0923456789', 'STAFF', 'ACTIVE', NOW()),
('00000000-0000-0000-0000-000000000004', 'staff2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGKK.H1N9s6W8.9C7P.O', 'Trần Văn Bảo Vệ', 'staff2@urbanpark.com', '0934567890', 'STAFF', 'INACTIVE', NOW()),
('00000000-0000-0000-0000-000000000005', 'driver1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGKK.H1N9s6W8.9C7P.O', 'Khách hàng A', 'driverA@gmail.com', '0945678901', 'DRIVER', 'ACTIVE', NOW()),
('00000000-0000-0000-0000-000000000006', 'driver2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGKK.H1N9s6W8.9C7P.O', 'Khách hàng B', 'driverB@gmail.com', '0956789012', 'DRIVER', 'ACTIVE', NOW());


-- 3. ZONES (Khu vực đỗ xe)
INSERT INTO zones (id, zone_name, zone_code, allowed_sizes, total_slots, current_occupied, has_ev_charger) VALUES
('10000000-0000-0000-0000-000000000001', 'Tầng 1 (Khu VIP & Xe Điện)', 'ZONE-A', '["SEDAN", "SUV", "LUXURY"]', 50, 10, true),
('10000000-0000-0000-0000-000000000002', 'Tầng Hầm 1 (Ô tô Phổ thông)', 'ZONE-B', '["SEDAN", "SUV", "HATCHBACK"]', 150, 45, false),
('10000000-0000-0000-0000-000000000003', 'Tầng Hầm 2 (Xe Máy)', 'ZONE-C', '["MOTORCYCLE"]', 300, 120, false);


-- 4. VEHICLES (Phương tiện đã đăng ký)
INSERT INTO vehicles (id, owner_id, license_plate, vehicle_size, color, brand, violation_count, is_active, created_at, updated_at) VALUES

('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '29A-999.99', 'SUV', 'Black', 'Mercedes', 0, true, NOW(), NOW()),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', '51G-555.55', 'HATCHBACK', 'Red', 'Hyundai', 1, true, NOW(), NOW()),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', '14A-111.11', 'SEDAN', 'Blue', 'Honda', 0, true, NOW(), NOW());


-- 5. VIP SUBSCRIPTIONS (Đăng ký vé tháng / VIP)
INSERT INTO vip_subscriptions (id, vehicle_id, subscription_type, start_date, end_date, status) VALUES
-- Xe 1: Gói đang hoạt động
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'MONTHLY_CAR', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'ACTIVE'),
-- Xe 2: Gói đã hết hạn (Sẽ bị từ chối vào cổng nếu quẹt thẻ TV)
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'QUARTERLY_CAR', CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE - INTERVAL '10 days', 'EXPIRED'),
-- Xe 3: Chờ duyệt (Để Manager test chức năng phê duyệt)
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'MONTHLY_CAR', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'PENDING_APPROVAL');


-- 6. BLACKLISTED CARDS (Danh sách đen - Trộm cắp, phá hoại)
-- ID thẻ mô phỏng
INSERT INTO blacklisted_cards (id, card_id, reason, blacklisted_by, blacklisted_at, notes) VALUES
('40000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'Trộm cắp thẻ đỗ xe', '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days', 'Phát hiện qua camera an ninh cổng 2');


-- 7. PARKING SESSIONS (Các phiên giao dịch xe ra/vào)
-- Xe VIP đang đỗ (ACTIVE)
INSERT INTO parking_sessions (id, license_plate, assigned_zone_id, check_in_time, session_status, is_vip, is_suspicious, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000001', '30G-123.45', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 hours', 'ACTIVE', true, false, NOW(), NOW());

-- Xe vãng lai đã thanh toán và ra khỏi bãi (COMPLETED)
INSERT INTO parking_sessions (id, license_plate, assigned_zone_id, check_in_time, check_out_time, session_status, is_vip, is_suspicious, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000002', '51G-555.55', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 2 hours', 'COMPLETED', false, false, NOW(), NOW());

-- Xe nghi ngờ gian lận (SUSPICIOUS) - Đang chờ Staff giải quyết
INSERT INTO parking_sessions (id, license_plate, assigned_zone_id, check_in_time, session_status, is_vip, is_suspicious, suspicious_reason, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000003', '99A-999.99', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 hour', 'ACTIVE', false, true, 'Biển số LPR không khớp với thẻ RFID (Thẻ: 12A-123.45)', NOW(), NOW());

-- Xe báo mất thẻ (LOST_CARD)
INSERT INTO parking_sessions (id, license_plate, assigned_zone_id, check_in_time, session_status, is_vip, is_suspicious, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000004', '14A-111.11', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days', 'LOST_CARD', false, false, NOW(), NOW());

-- Vài giao dịch hoàn thành khác để Dashboard có dữ liệu biểu đồ
INSERT INTO parking_sessions (id, license_plate, assigned_zone_id, check_in_time, check_out_time, session_status, is_vip, is_suspicious, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000005', '30F-123.12', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days 8 hours', NOW() - INTERVAL '2 days 1 hours', 'COMPLETED', false, false, NOW(), NOW()),
('50000000-0000-0000-0000-000000000006', '29B-456.78', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days 2 hours', 'COMPLETED', false, false, NOW(), NOW());

-- Lời nhắn
-- Chạy xong script này, bạn có thể đăng nhập bằng các tài khoản:
-- 1. manager1 / password (Xem Báo cáo Thống kê)
-- 2. staff1 / password (Kiểm tra Giám sát và Thanh toán)
-- 3. driver1 / password (Kiểm tra Mobile App / PWA)
