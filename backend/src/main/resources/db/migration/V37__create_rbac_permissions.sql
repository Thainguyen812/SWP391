CREATE TABLE rbac_permissions (
    id UUID PRIMARY KEY,
    module_key VARCHAR(255) NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    manager_access BOOLEAN NOT NULL DEFAULT FALSE,
    staff_access BOOLEAN NOT NULL DEFAULT FALSE
);

-- Seed initial data based on standard UI modules
INSERT INTO rbac_permissions (id, module_key, module_name, manager_access, staff_access) VALUES 
(gen_random_uuid(), 'dashboard', 'Bảng điều khiển', true, false),
(gen_random_uuid(), 'revenue', 'Quản lý doanh thu', true, false),
(gen_random_uuid(), 'customers', 'Quản lý khách hàng', true, false),
(gen_random_uuid(), 'monitoring', 'Giám sát hệ thống', true, false),
(gen_random_uuid(), 'security', 'Bảo mật', true, false),
(gen_random_uuid(), 'logs', 'Nhật ký hệ thống', true, false),
(gen_random_uuid(), 'settings', 'Cài đặt', true, false),
(gen_random_uuid(), 'personnel', 'Quản lý nhân sự', true, false),
(gen_random_uuid(), 'transactions', 'Tra cứu giao dịch', true, false),
(gen_random_uuid(), 'support', 'Hỗ trợ khách hàng', true, false);
