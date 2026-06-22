CREATE TABLE system_settings (
    id UUID PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_policies (
    id UUID PRIMARY KEY,
    policy_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
    id UUID PRIMARY KEY,
    branch_name VARCHAR(255) UNIQUE NOT NULL,
    location TEXT NOT NULL,
    manager_id UUID REFERENCES users(id),
    total_capacity INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- Seed Data
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
(gen_random_uuid(), 'system_name', 'Smart Parking Pro', 'Tên h? th?ng'),
(gen_random_uuid(), 'maintenance_mode', 'false', 'Ch? d? b?o trì');

INSERT INTO security_policies (id, policy_name, description, is_active) VALUES
(gen_random_uuid(), 'require_mfa', 'Yêu c?u xác th?c 2 bu?c cho Admin', true),
(gen_random_uuid(), 'password_expiry', 'M?t kh?u h?t h?n sau 90 ngày', false);

INSERT INTO branches (id, branch_name, location, total_capacity) VALUES
(gen_random_uuid(), 'HQ - Tr? s? chính', 'Qu?n 1, TP.HCM', 1500),
(gen_random_uuid(), 'Chi nhánh Gò V?p', 'Qu?n Gò V?p, TP.HCM', 600);
