-- ================================================================
-- DATABASE SCHEMA: PARKING BUILDING MANAGEMENT SYSTEM
-- Version: 4.0 FINAL | PostgreSQL 
-- Updates: REMOVE ETC | RE-ADD DYNAMIC QR MULTI-FACTOR AUTH (MFA)
--           Vehicle Fingerprint | Flow 3 revised (Same Lane Exit)
-- Covers: Flow 1–7 (SRS Dynamic QR Compliance)
-- ================================================================

-- ================================================================
-- CLEANUP (chạy khi reset database)
-- ================================================================
DROP FUNCTION IF EXISTS calculate_parking_fee(VARCHAR, TIMESTAMP, TIMESTAMP); 
DROP TABLE IF EXISTS audit_logs         CASCADE;
DROP TABLE IF EXISTS parking_violations  CASCADE;
DROP TABLE IF EXISTS ai_scan_logs        CASCADE;
DROP TABLE IF EXISTS blacklisted_cards   CASCADE;
DROP TABLE IF EXISTS transactions        CASCADE;
DROP TABLE IF EXISTS pricing_rules       CASCADE;
DROP TABLE IF EXISTS vip_subscriptions   CASCADE;
DROP TABLE IF EXISTS parking_sessions    CASCADE;
DROP TABLE IF EXISTS parking_slots       CASCADE;
DROP TABLE IF EXISTS zones               CASCADE;
DROP TABLE IF EXISTS cards               CASCADE;
DROP TABLE IF EXISTS vip_qr_identifiers  CASCADE;
DROP TABLE IF EXISTS refresh_tokens      CASCADE;
DROP TABLE IF EXISTS vehicles            CASCADE;
DROP TABLE IF EXISTS users               CASCADE;

-- ================================================================
-- 1. BẢNG: users
-- Quản lý tất cả tài khoản + phân quyền RBAC
-- ================================================================
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,           -- bcrypt cost >= 10
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(15),
    role            VARCHAR(10) NOT NULL
                    CHECK (role IN ('ADMIN','MANAGER','STAFF','DRIVER')),
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),

    -- FCM token cho Push Notification Anti-theft (Flow 6)
    fcm_token       VARCHAR(255),

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at   TIMESTAMP
);

CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

COMMENT ON COLUMN users.fcm_token IS 'Firebase Cloud Messaging token — gửi Push Notification cho Driver VIP khi Anti-theft trigger (Flow 6)';
COMMENT ON COLUMN users.role IS 'ADMIN: Quản trị viên | MANAGER: Quản lý bãi | STAFF: NV vận hành | DRIVER: Tài xế';

-- ================================================================
-- 2. BẢNG: refresh_tokens
-- JWT Refresh Token management (7 ngày)
-- ================================================================
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    token       UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    expires_at  TIMESTAMP   NOT NULL,               -- NOW() + 7 days
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_rt_token ON refresh_tokens(token);
CREATE INDEX idx_rt_user  ON refresh_tokens(user_id);

COMMENT ON TABLE refresh_tokens IS 'Logout: DELETE WHERE user_id = ?. Access Token: JWT 15 phút. Refresh Token: UUID 7 ngày.';

-- ================================================================
-- 3. BẢNG: vehicles
-- Quản lý phương tiện + Vehicle Fingerprint (chống biển giả và tráo xe)
-- ================================================================
CREATE TABLE vehicles (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id             UUID        NOT NULL,
    license_plate       VARCHAR(20) NOT NULL UNIQUE,   -- Format: 51A-12345
    vehicle_size        VARCHAR(15) NOT NULL
                        CHECK (vehicle_size IN ('VAN_TRUCK','MINIBUS_16','FAMILY_CAR')),

    -- Thông tin mô tả ngoại quan (Vehicle Fingerprint — chống Vehicle Swap Attack)
    color               VARCHAR(30),                   -- Tên màu (VD: "Đen")
    color_rgb           VARCHAR(7),                    -- Hex chính xác (VD: "#1C1C1C")
    body_shape          VARCHAR(20)
                        CHECK (body_shape IN ('SEDAN','SUV','VAN','TRUCK','MINIBUS','OTHER')),
    brand               VARCHAR(50),

    -- Tài liệu minh chứng
    registration_doc_url VARCHAR(255),                 -- URL ảnh Cà vẹt (S3/MinIO)
    registration_photo_url VARCHAR(255),               -- Ảnh xe thực tế góc trước (đăng ký VIP)

    -- Tracking hành vi
    violation_count     INT         NOT NULL DEFAULT 0, -- Số lần vi phạm vị trí đỗ (Flow 7)
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_plate  ON vehicles(license_plate);
CREATE INDEX idx_vehicles_owner  ON vehicles(owner_id);
CREATE INDEX idx_vehicles_size   ON vehicles(vehicle_size);

COMMENT ON COLUMN vehicles.color_rgb     IS 'Hex color so sánh với AI Camera khi checkout VIP — kết hợp đối soát chống tráo xe';
COMMENT ON COLUMN vehicles.body_shape    IS 'Dáng xe để Fingerprint Check khi đối soát xuất bãi';
COMMENT ON COLUMN vehicles.violation_count IS 'Lần đầu vi phạm đỗ sai vị trí: chỉ cảnh báo LED. Từ lần 2: phụ thu tiền phạt (Flow 7)';

-- ================================================================
-- 4. BẢNG: vip_qr_identifiers
-- Cốt lõi xác thực 2 lớp làn VIP - Quản lý token mã QR động chu kỳ 5 phút (300 giây)
-- Cập nhật đồng bộ thời gian 5 phút đồng bộ với Business Rules
-- ================================================================
CREATE TABLE vip_qr_identifiers (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID        NOT NULL,
    qr_token        VARCHAR(255) NOT NULL UNIQUE,      -- Token được mã hóa ngẫu nhiên/JWT sinh ra từ App
    purpose         VARCHAR(15) NOT NULL
                    CHECK (purpose IN ('CHECK_IN','CHECK_OUT')), -- Gắn rõ mục đích tránh dùng sai luồng
    expired_at      TIMESTAMP   NOT NULL,              -- Thời gian hết hạn (Thời gian tạo + 5 phút / 300 giây)
    is_used         BOOLEAN     NOT NULL DEFAULT FALSE, -- Cơ chế single-use bảo mật
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qr_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX idx_qr_token   ON vip_qr_identifiers(qr_token);
CREATE INDEX idx_qr_vehicle ON vip_qr_identifiers(vehicle_id);

COMMENT ON TABLE vip_qr_identifiers IS 'Bảng quản lý Token mã QR động bảo mật chu kỳ 5 phút (300 giây). Single-use và không thể tái sử dụng.';

-- ================================================================
-- 5. BẢNG: cards
-- Thẻ tạm vật lý — CHỈ dùng cho đối tượng khách vãng lai
-- VIP TUYỆT ĐỐI không sử dụng thẻ vật lý
-- ================================================================
CREATE TABLE cards (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    card_code       VARCHAR(20) NOT NULL UNIQUE,   -- Mã số in mã hóa trên chip thẻ RFID
    status          VARCHAR(15) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE','IN_USE','LOST','BLACKLISTED')),
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_code   ON cards(card_code);
CREATE INDEX idx_cards_status ON cards(status);

COMMENT ON TABLE cards IS 'Thẻ tạm dành riêng cho luồng vãng lai. Tuần hoàn kho thẻ sau khi hoàn tất thu hồi.';

-- ================================================================
-- 6. BẢNG: zones
-- Cấu hình phân khu tầng đỗ xe + Ràng buộc allowed_sizes loại xe
-- Tối ưu allowed_sizes sang định dạng JSONB để tăng tốc truy vấn mảng hiệu năng cao
-- ================================================================
CREATE TABLE zones (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name           VARCHAR(80) NOT NULL,       -- VD: "Tầng B2 — Xe Tải & Van"
    zone_code           VARCHAR(10) NOT NULL UNIQUE, -- VD: "B1", "B2", "F1", "F2"
    allowed_sizes       JSONB       NOT NULL,        -- JSONB Array cấu hình: ["FAMILY_CAR","MINIBUS_16"]
    total_slots         INT         NOT NULL CHECK (total_slots > 0),
    current_occupied    INT         NOT NULL DEFAULT 0 CHECK (current_occupied >= 0),
    has_ev_charger      BOOLEAN     NOT NULL DEFAULT FALSE, -- Có khu vực sạc điện (Giám sát Flow 7)
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_zone_occupied CHECK (current_occupied <= total_slots)
);

COMMENT ON COLUMN zones.allowed_sizes   IS 'JSONB Array quy định loại xe được đỗ. Khớp với biến vehicle_size khi điều phối luồng cổng vào.';
COMMENT ON COLUMN zones.current_occupied IS 'Đồng bộ thời gian thực qua tầng Cache Redis. Tăng khi vào, giảm khi xe ra.';

-- ================================================================
-- 7. BẢNG: parking_slots
-- Ô đỗ xe chi tiết — Mock API kết nối mạng lưới cảm biến ô đỗ
-- ================================================================
CREATE TABLE parking_slots (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id         UUID        NOT NULL,
    slot_number     VARCHAR(10) NOT NULL,           -- VD: "A01", "F2-B15"
    slot_type       VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                    CHECK (slot_type IN ('NORMAL','EV','DISABLED')),
    slot_status     VARCHAR(15) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (slot_status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    sensor_mock_id  VARCHAR(50),                    -- ID cổng giả lập cảm biến siêu âm hình học
    ev_charger_id   VARCHAR(50),                    -- ID trụ sạc mock phục vụ Flow 7 kiểm toán trạng thái sạc
    last_updated    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_slot_zone    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    CONSTRAINT uq_slot_number  UNIQUE (zone_id, slot_number)
);

CREATE INDEX idx_slot_zone_status ON parking_slots(zone_id, slot_status);

COMMENT ON COLUMN parking_slots.ev_charger_id IS 'Mock API kết nối trụ sạc: trả dữ liệu trạng thái sạc is_charging=TRUE/FALSE để bắt lỗi đỗ sai khu vực.';

-- ================================================================
-- 8. BẢNG: parking_sessions *** BẢNG CỐT LÕI HỆ THỐNG ***
-- Quản lý toàn bộ vòng đời phiên đỗ phương tiện trong hầm tòa nhà
-- Tối ưu hóa các trường ảnh hồ sơ sang JSONB
-- ================================================================
CREATE TABLE parking_sessions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Định danh phương tiện và phân tách luồng đối tượng
    license_plate       VARCHAR(20) NOT NULL,
    is_vip              BOOLEAN     NOT NULL DEFAULT FALSE,
    vehicle_id          UUID,       -- NULL nếu khách vãng lai
    card_id             UUID,       -- NULL nếu xe thuộc diện VIP thành viên

    -- Lưu vết liên kết mã QR động đã xác thực thành công (Làn VIP)
    validated_qr_id     UUID,       -- NULL đối với xe vãng lai hoặc luồng vào chuẩn của VIP

    -- Phân phối không gian đỗ xe
    assigned_zone_id    UUID        NOT NULL,
    parked_slot_id      UUID,       -- Gắn ô đỗ cụ thể từ cảm biến

    -- Nhật ký mốc thời gian hành trình
    check_in_time       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time      TIMESTAMP,  -- NULL khi xe còn lưu trú trong bãi

    -- Trạng thái điều hành phiên
    session_status      VARCHAR(25) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (session_status IN (
                            'ACTIVE',           -- Xe đang nằm trong hầm
                            'COMPLETED',        -- Đã nghiệm thu thanh toán xuất bãi thành công
                            'PASSED_CONFIRMED', -- [Flow 3] Đã đóng tiền lưu động di động dưới hầm
                            'LOST_CARD'         -- [Flow 4] Đang đóng băng xử lý sự cố mất thẻ
                        )),

    -- Tính năng an ninh bảo mật cấp cao (VIP Anti-theft Flow 6)
    is_locked           BOOLEAN     NOT NULL DEFAULT FALSE, -- Chủ xe gạt nút Khóa xe trên App

    -- Hệ thống AI giám sát chống tráo đổi xe (Vehicle Fingerprint Mismatch)
    is_suspicious       BOOLEAN     NOT NULL DEFAULT FALSE,
    suspicious_reason   VARCHAR(100),

    -- Nhân viên ghi đè (Override trường hợp biển số bẩn/mờ ngoại cảnh)
    override_by_staff   UUID,
    override_reason     TEXT,

    -- [Flow 3] Thu tiền lưu động giải tỏa kẹt xe cao điểm hầm
    mobile_checkout_staff_id    UUID,
    mobile_checkout_location    VARCHAR(100),       -- Tọa độ GPS định vị của Staff
    mobile_checkout_at          TIMESTAMP,
    mobile_checkout_photo       VARCHAR(255),       -- Ảnh minh chứng hoàn tất giao dịch trên S3

    -- [Flow 4] Ảnh chụp hồ sơ đối soát khi báo cáo mất thẻ
    lost_card_proof_photos  JSONB,                  -- Tối ưu sang JSONB: Lưu mảng dạng URL: CCCD, Cà vẹt, mặt tài xế

    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ps_vehicle    FOREIGN KEY (vehicle_id)            REFERENCES vehicles(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_card       FOREIGN KEY (card_id)               REFERENCES cards(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_zone       FOREIGN KEY (assigned_zone_id)      REFERENCES zones(id),
    CONSTRAINT fk_ps_slot       FOREIGN KEY (parked_slot_id)        REFERENCES parking_slots(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_override   FOREIGN KEY (override_by_staff)     REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_mobile     FOREIGN KEY (mobile_checkout_staff_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_qr         FOREIGN KEY (validated_qr_id)       REFERENCES vip_qr_identifiers(id) ON DELETE SET NULL
);

CREATE INDEX idx_ps_plate   ON parking_sessions(license_plate);
CREATE INDEX idx_ps_status  ON parking_sessions(session_status);
CREATE INDEX idx_ps_vip     ON parking_sessions(is_vip);

-- ================================================================
-- 9. BẢNG: vip_subscriptions
-- Hồ sơ và hợp đồng quản lý trạng thái gói cước vé tháng thành viên
-- Tối ưu document_photos sang JSONB phục vụ trích xuất ảnh siêu tốc
-- ================================================================
CREATE TABLE vip_subscriptions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id          UUID        NOT NULL,
    subscription_type   VARCHAR(10) NOT NULL CHECK (subscription_type IN ('MONTHLY','QUARTERLY','YEARLY')),
    start_date          DATE        NOT NULL,
    end_date            DATE        NOT NULL,
    status              VARCHAR(25) NOT NULL DEFAULT 'PENDING_APPROVAL'
                        CHECK (status IN ('PENDING_APPROVAL','ACTIVE','EXPIRED','REJECTED','CANCELLED')),

    -- Bộ hồ sơ ảnh đối soát thủ công trực tuyến từ Manager
    document_photos     JSONB,       -- Tối ưu sang JSONB: {"ca_vet":"url","cmnd":"url","vehicle_front":"url"}

    -- Thao tác duyệt hồ sơ của Ban quản lý
    approved_by         UUID,       
    approved_at         TIMESTAMP,
    rejection_reason    TEXT,

    -- Tích hợp kết nối Webhook cổng thanh toán VNPay Sandbox
    fee_amount          DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(20) NOT NULL CHECK (payment_method IN ('VNPAY_SANDBOX','MOMO_SANDBOX','BANK_TRANSFER')),
    payment_reference   VARCHAR(100),               -- Mã giao dịch đối soát IPN từ bên thứ 3
    payment_status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','SUCCESS','FAILED')),

    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_approved FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sub_vehicle ON vip_subscriptions(vehicle_id);
CREATE INDEX idx_sub_status  ON vip_subscriptions(status);

-- ================================================================
-- 10. BẢNG: transactions
-- Biên lai hóa đơn tài chính gắn liền với từng phiên đỗ xe
-- Xóa bỏ ràng buộc NOT NULL của processed_by để phục vụ luồng xử lý Webhook tự động
-- ================================================================
CREATE TABLE transactions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID        NOT NULL UNIQUE,   -- Ràng buộc nghiêm ngặt 1:1 bảo toàn ACID

    -- Biểu phí tổng hợp chi tiết cấu thành hóa đơn
    parking_fee             DECIMAL(10,2) NOT NULL DEFAULT 0,
    lost_card_penalty       DECIMAL(10,2) NOT NULL DEFAULT 0,   -- Phạt mất thẻ vật lý (Flow 4)
    violation_penalty       DECIMAL(10,2) NOT NULL DEFAULT 0,   -- Phạt đỗ sai khu điện sạc (Flow 7)
    total_amount            DECIMAL(10,2) NOT NULL,

    -- Quản lý trạng thái thanh toán
    payment_method      VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH','VNPAY_SANDBOX','MOMO_SANDBOX','QR_BANK')),
    payment_status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    payment_reference   VARCHAR(100),

    -- Kiểm toán tác nhân xử lý (NULL thể hiện hệ thống tự động xử lý thanh toán qua Webhook IPN)
    processed_by        UUID,          -- Khóa ngoại liên kết bảng users, gỡ bỏ NOT NULL
    
    -- [Flow 3 Revised] Đánh dấu hóa đơn hoàn tất di động thực địa dưới hầm
    is_mobile_checkout  BOOLEAN     NOT NULL DEFAULT FALSE,
    mobile_gps_location VARCHAR(100),                  
    mobile_photo_proof  VARCHAR(255),                  -- Ảnh chụp biên lai/tiền mặt bắt buộc phục vụ đối soát

    receipt_url         VARCHAR(255),                  -- Đường dẫn tệp hóa đơn điện tử phục vụ khách hàng
    processed_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_txn_session   FOREIGN KEY (session_id)   REFERENCES parking_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_staff     FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE INDEX idx_txn_session   ON transactions(session_id);
CREATE INDEX idx_txn_date      ON transactions(processed_at);

COMMENT ON COLUMN transactions.parking_fee IS 'Mặc định bằng 0đ đối với đối tượng xe VIP có trạng thái gói cước SUBSCRIPTION hoạt động hợp lệ.';

-- ================================================================
-- 11. BẢNG: pricing_rules
-- Biểu phí cấu hình kinh doanh linh hoạt của Ban quản lý bãi xe
-- Chuẩn hóa tên trường trường từ vehicle_type thành vehicle_size để đồng bộ với các bảng khác
-- ================================================================
CREATE TABLE pricing_rules (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_size            VARCHAR(15) NOT NULL CHECK (vehicle_size IN ('VAN_TRUCK','MINIBUS_16','FAMILY_CAR')),
    first_hour_fee          DECIMAL(10,2) NOT NULL,
    additional_hour_fee     DECIMAL(10,2) NOT NULL,
    max_daily_fee           DECIMAL(10,2) NOT NULL,
    lost_card_penalty       DECIMAL(10,2) NOT NULL DEFAULT 50000,
    ev_violation_penalty    DECIMAL(10,2) NOT NULL DEFAULT 20000,   
    is_active               BOOLEAN     NOT NULL DEFAULT TRUE,
    effective_from          DATE        NOT NULL,
    effective_to            DATE,       -- NULL thể hiện biểu phí đang có hiệu lực cao nhất hiện hành
    created_by              UUID,

    CONSTRAINT fk_pr_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ================================================================
-- 12. BẢNG: blacklisted_cards
-- Danh sách đen phong tỏa thẻ tạm vật lý báo mất (Flow 4)
-- ================================================================
CREATE TABLE blacklisted_cards (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id         UUID        NOT NULL UNIQUE,    
    session_id      UUID,                           -- Phiên gửi xe xảy ra sự cố mất thẻ
    reason          VARCHAR(15) NOT NULL CHECK (reason IN ('LOST','STOLEN','DAMAGED','FRAUDULENT')),
    blacklisted_by  UUID        NOT NULL,
    blacklisted_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes           TEXT,

    CONSTRAINT fk_bl_card    FOREIGN KEY (card_id)       REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_bl_session FOREIGN KEY (session_id)    REFERENCES parking_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_bl_staff   FOREIGN KEY (blacklisted_by) REFERENCES users(id)
);

COMMENT ON TABLE blacklisted_cards IS 'Khóa vĩnh viễn thẻ RFID khỏi hệ thống tuần hoàn, chặn đứng lỗ hổng gian lận nhặt lại thẻ cũ để vượt bốt.';

-- ================================================================
-- 13. BẢNG: ai_scan_logs
-- Log toàn diện lịch sử camera quét nhận diện — Phục vụ hậu kiểm lý lịch xe
-- ================================================================
CREATE TABLE ai_scan_logs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID,
    scan_location       VARCHAR(25) NOT NULL
                        CHECK (scan_location IN (
                            'MAIN_ENTRANCE',    
                            'VIP_EXIT',         
                            'CASUAL_EXIT'
                        )),
    scan_type           VARCHAR(25) NOT NULL DEFAULT 'STANDARD'
                        CHECK (scan_type IN (
                            'STANDARD',         -- Quét thông thường tại làn vãng lai
                            'CHECK_IN_FP',      -- Ghi hình trích xuất fingerprint ngoại quan cổng vào
                            'CHECK_OUT_FP',     -- Trích xuất đối soát fingerprint ngoại quan cổng ra
                            'ANTI_THEFT',       -- Ghi nhận bằng chứng đột nhập khi cờ khóa bật
                            'SUSPICIOUS'        
                        )),
    camera_id           VARCHAR(50) NOT NULL,

    -- Dữ liệu nhận diện trích xuất từ mô-đun thuật toán AI giả lập
    image_url           VARCHAR(255) NOT NULL,      -- Đường dẫn ảnh lưu hũ dữ liệu S3 (chu kỳ 30 ngày)
    detected_plate      VARCHAR(20) NOT NULL,
    confidence_score    DECIMAL(5,2) NOT NULL,      -- Thước đo độ tin cậy. < 70% kích hoạt fallback quét QR
    detected_vehicle_type VARCHAR(15),
    detected_color      VARCHAR(30),                
    detected_color_rgb  VARCHAR(7),                 
    detected_shape      VARCHAR(20),                

    -- Kết quả chấm điểm so khớp thông số Fingerprint chống tráo xe làn ra VIP
    match_score         DECIMAL(5,2),               -- % trùng khớp đặc trưng hình học giữa làn vào/ra
    color_diff          DECIMAL(5,2),               -- Độ lệch phổ màu RGB (> 30 tự động Hold barie)
    shape_match         BOOLEAN,                    

    -- Ghi nhận đối soát quét mã QR động tại bốt làn VIP
    scanned_qr_token    VARCHAR(255),               -- Chuỗi token giải mã nhận diện từ thiết bị đầu quét QR
    qr_match            BOOLEAN,                    -- Xác nhận tính chính chủ tài khoản sở hữu xe

    -- Thao tác xử lý ghi đè thủ công từ Staff bốt trực
    is_overridden       BOOLEAN     NOT NULL DEFAULT FALSE,
    override_plate      VARCHAR(20),
    override_by         UUID,
    override_reason     TEXT,

    is_evidence         BOOLEAN     NOT NULL DEFAULT FALSE, -- Cờ bảo lưu vĩnh viễn tệp ảnh phục vụ kiểm toán vi phạm
    scanned_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_scan_session  FOREIGN KEY (session_id)  REFERENCES parking_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_scan_override FOREIGN KEY (override_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_scan_plate      ON ai_scan_logs(detected_plate);
CREATE INDEX idx_scan_at         ON ai_scan_logs(scanned_at);

-- ================================================================
-- 14. BẢNG: parking_violations
-- Ghi nhận xử lý vi phạm chiếm dụng vị trí đỗ sai khu sạc điện (Flow 7)
-- Tối ưu photo_urls sang JSONB để quản lý mảng bằng chứng hình ảnh tối ưu nhất
-- ================================================================
CREATE TABLE parking_violations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL,
    slot_id         UUID        NOT NULL,
    violation_type  VARCHAR(25) NOT NULL CHECK (violation_type IN ('EV_ZONE_MISUSE','DISABLED_ZONE_MISUSE','DOUBLE_PARKING')),
    photo_urls      JSONB       NOT NULL,           -- Tối ưu sang JSONB: Mảng ảnh chụp bằng chứng thực địa do Staff chụp tải lên
    detected_by     UUID        NOT NULL,           
    is_first_violation BOOLEAN  NOT NULL DEFAULT TRUE, -- TRUE: chỉ hiển thị dòng nhắc nhở; FALSE: tính phạt tiền
    penalty_applied BOOLEAN     NOT NULL DEFAULT FALSE,
    penalty_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    detected_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vio_session FOREIGN KEY (session_id)  REFERENCES parking_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_vio_slot    FOREIGN KEY (slot_id)     REFERENCES parking_slots(id),
    CONSTRAINT fk_vio_staff   FOREIGN KEY (detected_by) REFERENCES users(id)
);

-- ================================================================
-- 15. BẢNG: audit_logs
-- Nhật ký hệ thống bất biến — Ghi vết 100% hành vi can thiệp nhạy cảm
-- Tối ưu old_value và new_value sang JSONB để dễ dàng INDEX dữ liệu kiểm toán hành vi nâng cao
-- ================================================================
CREATE TABLE audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,                           -- NULL nếu do thuật toán lõi hệ thống tự động trigger
    action_type     VARCHAR(40) NOT NULL CHECK (action_type IN (
        -- Phân hệ định danh bảo mật
        'LOGIN', 'LOGOUT',
        -- Phân hệ can thiệp dữ liệu lõi
        'OVERRIDE_AI', 'REMOTE_OPEN_BARRIER', 'STAFF_HELD_VEHICLE',
        -- Phân hệ nghiệp vụ vé tháng VIP
        'APPROVE_VIP', 'REJECT_VIP',
        -- Phân hệ kho thẻ vật lý
        'BLACKLIST_CARD',
        -- Phân hệ nghiệm thu hóa đơn tài chính
        'MANUAL_CHECKOUT', 'MOBILE_CHECKOUT', 'LOST_CARD_HANDLED', 'UPDATE_PRICING',
        -- Phân hệ xử lý hành vi vi phạm vị trí
        'RECORD_VIOLATION',
        -- Phân hệ bảo mật xác thực hai lớp mã QR động (Re-add)
        'QR_CODE_CHECK_IN', 'QR_CODE_CHECK_OUT', 'QR_CODE_EXPIRED', 'QR_CODE_MISMATCH', 'QR_TIMEOUT_ALERT',
        -- Phân hệ kịch bản an ninh chống trộm đột nhập
        'ANTI_THEFT_TRIGGERED', 'SUSPICIOUS_EARLY_EXIT', 'FINGERPRINT_MISMATCH', 'COLOR_MISMATCH', 'OWNER_UNLOCKED_REMOTE', 'STAFF_OVERRIDE_SUSPICIOUS'
    )),
    entity_type     VARCHAR(50),                    -- Tên bảng chịu sự tác động sửa đổi dữ liệu
    entity_id       UUID,
    old_value       JSONB,                          -- Tối ưu sang JSONB: Trạng thái dữ liệu thô cũ trước khi can thiệp
    new_value       JSONB,                          -- Tối ưu sang JSONB: Trạng thái dữ liệu mới cập nhật
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(255),
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_action  ON audit_logs(action_type);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

COMMENT ON TABLE audit_logs IS 'Kho lưu trữ nhật ký hệ thống bất biến chu kỳ 2 năm. Tuyệt đối không thiết kế Endpoint REST API chỉnh sửa/Xóa bảng này.';

-- ================================================================
-- DATA SEEDING (Dữ liệu nền tảng ban đầu)
-- ================================================================
INSERT INTO users (username, password_hash, full_name, email, role)
VALUES ('admin', '$2b$10$CHANGE_THIS_HASH_IN_PRODUCTION', 'System Administrator', 'admin@parking.com', 'ADMIN');

INSERT INTO zones (zone_name, zone_code, allowed_sizes, total_slots, has_ev_charger) VALUES
    ('Tầng B2 — Xe Tải & Van',       'B2', '["VAN_TRUCK"]',             50,  FALSE),
    ('Tầng B1 — Xe 16 Chỗ',          'B1', '["MINIBUS_16"]',            30,  FALSE),
    ('Tầng F1 — Xe Gia Đình',         'F1', '["FAMILY_CAR"]',            100, FALSE),
    ('Tầng F2 — Xe Gia Đình (EV)',    'F2', '["FAMILY_CAR"]',            80,  TRUE);

-- Cập nhật đồng bộ tên cột vehicle_size theo định nghĩa bảng mới
INSERT INTO pricing_rules (vehicle_size, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from) VALUES
    ('FAMILY_CAR',  15000, 10000, 100000, 50000, 20000, CURRENT_DATE),
    ('MINIBUS_16',  20000, 15000, 150000, 50000, 30000, CURRENT_DATE),
    ('VAN_TRUCK',   25000, 20000, 200000, 50000, 30000, CURRENT_DATE);

DO $$
DECLARE i INT;
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO cards (card_code, status)
        VALUES (LPAD(i::TEXT, 6, '0'), 'AVAILABLE');
    END LOOP;
END $$;

-- ================================================================
-- VIEWS HỮU ÍCH PHỤC VỤ DASHBOARD ĐIỀU HÀNH
-- ================================================================

-- View giám sát danh sách toàn bộ xe đang lưu đỗ trong hầm tòa nhà
CREATE OR REPLACE VIEW v_active_sessions AS
SELECT
    ps.id, ps.license_plate, ps.is_vip, ps.is_locked,
    ps.session_status, ps.check_in_time, ps.validated_qr_id,
    ps.is_suspicious, ps.suspicious_reason,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ps.check_in_time))/3600.0, 2) AS hours_parked,
    z.zone_name, z.zone_code,
    v.vehicle_size, v.color, v.body_shape
FROM parking_sessions ps
LEFT JOIN zones z ON ps.assigned_zone_id = z.id
LEFT JOIN vehicles v ON ps.vehicle_id = v.id
WHERE ps.session_status IN ('ACTIVE','PASSED_CONFIRMED');

-- View thống kê báo cáo doanh thu kinh doanh bãi xe theo ngày
CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT
    DATE(processed_at)              AS revenue_date,
    COUNT(*)                        AS transaction_count,
    SUM(parking_fee)                AS parking_revenue,
    SUM(lost_card_penalty)          AS penalty_revenue,
    SUM(violation_penalty)          AS violation_revenue,
    SUM(total_amount)               AS total_revenue,
    SUM(CASE WHEN is_mobile_checkout THEN total_amount ELSE 0 END) AS mobile_revenue
FROM transactions
WHERE payment_status = 'SUCCESS'
GROUP BY DATE(processed_at)
ORDER BY revenue_date DESC;

-- ================================================================
-- FUNCTION: Hàm tính toán biểu phí gửi xe tự động theo block giờ
-- Đồng bộ hóa logic tìm kiếm theo trường vehicle_size mới cấu hình
-- ================================================================
CREATE OR REPLACE FUNCTION calculate_parking_fee(
    p_vehicle_size  VARCHAR,
    p_check_in      TIMESTAMP,
    p_check_out     TIMESTAMP
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_hours DECIMAL(10,2);
    v_rule  pricing_rules%ROWTYPE;
    v_fee   DECIMAL(10,2);
BEGIN
    SELECT * INTO v_rule
    FROM pricing_rules
    WHERE vehicle_size = p_vehicle_size
      AND is_active = TRUE
      AND effective_from <= CURRENT_DATE
      AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    ORDER BY effective_from DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy biểu giá phù hợp cho phân loại phương tiện: %', p_vehicle_size;
    END IF;

    v_hours := CEIL(EXTRACT(EPOCH FROM (p_check_out - p_check_in)) / 3600.0);

    IF v_hours <= 1 THEN
        v_fee := v_rule.first_hour_fee;
    ELSE
        v_fee := v_rule.first_hour_fee + (v_hours - 1) * v_rule.additional_hour_fee;
    END IF;

    RETURN LEAST(v_fee, v_rule.max_daily_fee);
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TOÀN BỘ GHI CHÚ VÀ QUY TẮC NGHIỆP VỤ CỨNG (BUSINESS RULES) LÕI
-- ================================================================

/*
=== FLOW 3 — CONGESTION RELIEF (Giải tỏa kẹt xe cao điểm) ===
- Kịch bản xử lý ùn tắc: Xe vãng lai sau khi hoàn tất thủ tục thanh toán lưu động di động dưới hầm cho Staff
  (parking_sessions.session_status chuyển sang 'PASSED_CONFIRMED', transactions.is_mobile_checkout=TRUE) 
  bắt buộc phải di chuyển tịnh tiến thẳng ra ngoài bằng ĐÚNG LÀN VÃNG LAI tại bốt cổng ra.
- Tuyệt đối không điều hướng rẽ cắt mặt sang làn VIP tự động để tránh gây hỗn loạn giao thông giao cắt hình học hạ tầng bãi đỗ.
- Khi tới bốt trực, Staff thực hiện quẹt thẻ tạm vật lý, hệ thống quét phát hiện trạng thái PASSED_CONFIRMED == TRUE 
  will lập tức hiển thị trạng thái xanh "ĐÃ THANH TOÁN LƯU ĐỘNG" và tự động kích nổ lệnh nhấc thanh chắn Barie giải phóng xe 
  ngay lập tức mà không thu thêm tiền lần 2. Staff tiến hành thu hồi thẻ tạm cất vào hộp lưu trữ tuần hoàn.

=== VIP MULTI-FACTOR AUTH (Xác thực hai lớp làn VIP bằng mã QR động) ===
- Toàn bộ phương tiện thuộc diện Thành viên VIP đăng ký gói cước vé tháng hoạt động (ACTIVE) trong hệ thống 
  sẽ nói KHÔNG với thẻ từ vật lý cơ học. Cổng ra làn VIP thiết lập bắt buộc cơ chế an ninh hai lớp nghiêm ngặt (MFA) để xả xe.
- Luồng xuất bãi chuẩn: Khi xe tiến vào làn ra VIP riêng biệt, hệ thống đồng thời triển khai:
  1. AI Camera: Tiến hành quét nhận diện ký tự biển số xe (license_plate) để đối chiếu lịch sử phiên đỗ ACTIVE tương ứng trong DB.
  2. Đầu quét bốt trực: Tài xế bắt buộc phải mở ứng dụng di động chính chủ App Driver, kích hoạt widget "Sinh mã QR xuất bãi" và đưa màn hình 
     điện thoại vào thiết bị quét QR tại bốt. Mã QR động mã hóa này có thời hạn vòng đời hiệu lực tồn tại nghiêm ngặt trong chu kỳ 5 phút và chỉ có giá trị áp dụng một lần duy nhất (Single-use).
- Backend kiểm toán song song 4 điều kiện cứng để nhấc thanh chắn:
  (1) Biển số xe thuộc diện VIP trạng thái ACTIVE trong cơ sở dữ liệu.
  (2) Mã Token giải mã từ đầu quét mã QR động trùng khớp hoàn toàn với tài khoản sở hữu xe đó, mã nằm trong thời hạn hiệu lực (NOW <= expired_at) và chưa từng bị sử dụng (is_used == FALSE).
  (3) Tồn tại phiên gửi xe trạng thái ACTIVE trong hầm bãi.
  (4) Cờ cấu hình bảo vệ chống trộm gạt tắt (is_locked == FALSE).
- Ràng buộc Timeout 60 giây (BR-EXIT-02): Nếu phương tiện VIP tiến vào làn ra, AI Camera quét nhận diện thành công biển số xe của VIP nhưng tài xế cố tình trì hoãn không thực hiện đưa điện thoại quét mã QR xuất bãi trong vòng mốc thời gian trần quá 1 phút (60 giây), hoặc quét mã QR báo lỗi (Hết hạn/Lệch tài khoản chính chủ), thanh chắn Barie giữ nguyên trạng thái đóng băng khóa cứng, bảng LED ngoài cổng nhấp nháy chuyển đỏ hiện dòng văn bản cảnh báo: "BẮT BUỘC QUÉT QR XUẤT BÃI TRÊN APP DRIVER", đồng thời phát tín hiệu còi hú cảnh báo đỏ khẩn cấp sang giao diện giám sát của Staff.
- Fallback cổng vào: Trường hợp thiết bị AI Camera gặp sự cố kỹ thuật hoặc mờ biển số do tác động ngoại cảnh thời tiết (Độ tin cậy của thuật toán Confidence < 70%), hệ thống cho phép Tài xế quét mã QR Động Vào Bãi (Check-in QR) sinh ra trực tiếp trên App Driver để giải mã, đối soát tài khoản chính chủ, khởi tạo ParkingSession và ra lệnh nhấc thanh chắn xả cổng vào hầm an toàn.

=== VEHICLE SWAP ATTACK PREVENTION (Chống tráo đổi phương tiện làn VIP) ===
- Khi xe VIP tiến hành Checkout quét mã QR động tại làn ra, hệ thống tự động kích hoạt thuật toán đối soát so sánh đặc trưng Fingerprint ngoại quan của xe:
  - Check 1: Bắt buộc tồn tại phiên đỗ ACTIVE tương thích ký tự biển số trong lòng hầm bãi (Không có lập tức REJECT).
  - Check 2: Kiểm tra ngưỡng thời gian lưu trú (Nếu mốc thời gian gửi xe < 10 phút lập tức kích hoạt cờ nghi vấn is_suspicious = TRUE + HOLD Barie).
  - Check 3: Chấm điểm so sánh phổ màu RGB trích xuất từ camera AI (Độ lệch diff > 30 tự động bật cờ is_suspicious = TRUE + HOLD Barie).
  - Check 4: So khớp hình học cấu trúc dáng xe (Body Shape Mismatch tự động bật cờ is_suspicious = TRUE + HOLD Barie).
  - Check 5: Đối soát kiểm toán Token giải mã từ mã QR động xuất bãi (Lệch tài khoản/Token giả mạo tự động bật cờ is_suspicious = TRUE + HOLD Barie).
- Khi trạng thái cờ phát hiện dấu hiệu gian lận tráo xe bật lên (is_suspicious == TRUE), hệ thống đóng băng cứng thanh chắn Barie, phát lệnh báo động khẩn cấp tại bốt trực, màn hình giao diện PC của Staff lập tức hiển thị song song ảnh chụp camera ngoại quan xe lúc check-in vào và check-out ra (Side-by-side Visual Confirm) để nhân viên giám sát bằng mắt thường trước khi quyết định bấm nút Override xả xe.

=== FLOW 7 — EV ZONE VIOLATION (Cảnh báo và xử lý vi phạm vị trí khu sạc điện) ===
- Thuật toán tự động phát hiện vi phạm: Mạng lưới cảm biến ô đỗ báo trạng thái đã bị phương tiện chiếm dụng (parking_slots.slot_status = 'OCCUPIED'), nhưng API kết nối từ trụ sạc xe điện trả dữ liệu trạng thái 'Không thực hiện sạc' (is_charging == FALSE) liên tục vượt quá ngưỡng mốc thời gian trần 15 phút.
- Xử lý vi phạm lần đầu (vehicles.violation_count == 0): Hệ thống chỉ thiết lập ghi nhận lịch sử (is_first_violation = TRUE), hiển thị dòng văn bản nhắc nhở trên bảng hiển thị LED ngoài cổng bốt trực khi xe thực hiện xuất bãi, hoàn toàn không phạt tiền.
- Xử lý vi phạm từ lần thứ 2 trở đi (vehicles.violation_count > 0): Hệ thống tự động cấu hình tính toán cộng thêm khoản phí phạt phụ thu vi phạm vị trí đỗ (pricing_rules.ev_violation_penalty) vào trực tiếp tổng hóa đơn giao dịch thanh toán (transactions.violation_penalty), bắt buộc tài xế phải hoàn tất đóng khoản phí phạt này mới phát lệnh nhấc Barie.
*/

-- END OF SCHEMA v4.0 COMPLIANT