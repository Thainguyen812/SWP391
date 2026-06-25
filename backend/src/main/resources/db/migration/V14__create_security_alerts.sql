CREATE TABLE security_alerts (
    id UUID PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    is_actionable BOOLEAN DEFAULT TRUE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

INSERT INTO security_alerts (id, alert_type, license_plate, reason, is_actionable, is_resolved, created_at) VALUES 
(gen_random_uuid(), 'BIỂN SỐ ĐEN', '30G-123.45', 'Nghi phạm trộm cắp', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '2 minutes'),
(gen_random_uuid(), 'PHÁT HIỆN SAI KHU VỰC', '29C-445.11', 'Xe tải hạng nhẹ (Không có đặc quyền VIP)', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
(gen_random_uuid(), 'KÍCH HOẠT CHỐNG TRỘM', '51H-889.02', 'Phát hiện chấn động mạnh và âm thanh báo động', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours');
