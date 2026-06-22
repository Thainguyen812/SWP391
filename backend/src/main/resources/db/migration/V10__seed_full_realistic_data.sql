-- Seed Users (Personnel)
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, status) VALUES
(gen_random_uuid(), 'nv_an', 'hash1', 'Nguyen Van An', 'an.nv@parking.com', '0901234567', 'STAFF', 'ACTIVE'),
(gen_random_uuid(), 'nv_binh', 'hash2', 'Tran Thi Binh', 'binh.tt@parking.com', '0902345678', 'STAFF', 'ACTIVE'),
(gen_random_uuid(), 'nv_cuong', 'hash3', 'Le Van Cuong', 'cuong.lv@parking.com', '0903456789', 'STAFF', 'ACTIVE'),
(gen_random_uuid(), 'nv_dung', 'hash4', 'Pham Thi Dung', 'dung.pt@parking.com', '0904567890', 'STAFF', 'INACTIVE'),
(gen_random_uuid(), 'vip_khanh', 'hash5', 'Hoang Khanh (VIP)', 'khanh.vip@company.com', '0981234567', 'DRIVER', 'ACTIVE'),
(gen_random_uuid(), 'vip_linh', 'hash6', 'Ngo Linh (VIP)', 'linh.vip@company.com', '0982345678', 'DRIVER', 'ACTIVE');

-- Seed Shift History
INSERT INTO shift_history (staff_name, shift_type, start_time, end_time, vehicles_handled, status, is_current) VALUES
('Nguyen Van An', 'Morning', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '8 hours', 150, 'COMPLETED', false),
('Tran Thi Binh', 'Afternoon', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '16 hours', 210, 'COMPLETED', false),
('Le Van Cuong', 'Night', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '16 hours', CURRENT_TIMESTAMP - INTERVAL '1 day', 80, 'COMPLETED', false),
('Nguyen Van An', 'Morning', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '8 hours', 165, 'COMPLETED', false),
('Tran Thi Binh', 'Afternoon', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '16 hours', 190, 'COMPLETED', false),
('Le Van Cuong', 'Night', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '16 hours', CURRENT_TIMESTAMP, 95, 'COMPLETED', false),
('Nguyen Van An', 'Morning', CURRENT_TIMESTAMP, NULL, 45, 'ACTIVE', true);

-- Create some dummy Parking Sessions for Transactions
INSERT INTO parking_sessions (id, license_plate, assigned_zone_id, session_status) VALUES
('11111111-1111-1111-1111-111111111111', '29A-12345', (SELECT id FROM zones WHERE zone_code = 'B1' LIMIT 1), 'COMPLETED'),
('22222222-2222-2222-2222-222222222222', '30B-67890', (SELECT id FROM zones WHERE zone_code = 'F1' LIMIT 1), 'COMPLETED'),
('33333333-3333-3333-3333-333333333333', '51C-11223', (SELECT id FROM zones WHERE zone_code = 'B1' LIMIT 1), 'COMPLETED'),
('44444444-4444-4444-4444-444444444444', '60D-44556', (SELECT id FROM zones WHERE zone_code = 'F1' LIMIT 1), 'COMPLETED'),
('55555555-5555-5555-5555-555555555555', '99E-77889', (SELECT id FROM zones WHERE zone_code = 'B1' LIMIT 1), 'COMPLETED'),
('66666666-6666-6666-6666-666666666666', '12F-99001', (SELECT id FROM zones WHERE zone_code = 'F1' LIMIT 1), 'COMPLETED'),
('77777777-7777-7777-7777-777777777777', '34G-22334', (SELECT id FROM zones WHERE zone_code = 'B1' LIMIT 1), 'COMPLETED');

-- Seed Transactions
INSERT INTO transactions (id, session_id, total_amount, payment_method, payment_status, processed_at) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 15000, 'CASH', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 30000, 'QR_BANK', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '1.5 hours'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 15000, 'MOMO_SANDBOX', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 50000, 'CASH', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 20000, 'QR_BANK', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 15000, 'CASH', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 100000, 'MOMO_SANDBOX', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '5 minutes');

-- Seed Support Tickets (Logs)
INSERT INTO support_tickets (ticket_code, issue_description, status, created_at, resolved_at) VALUES
('TK-001', 'Barrier is stuck at Gate A', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1.9 days'),
('TK-002', 'Camera B1 offline', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '0.8 days'),
('TK-003', 'Customer lost parking ticket', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '4.5 hours'),
('TK-004', 'Payment terminal network issue', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL);