-- ================================================================
-- DATABASE SCHEMA: PARKING BUILDING MANAGEMENT SYSTEM
-- Version: 3.0 FINAL | PostgreSQL 
-- Updates: ETC dual-auth | Vehicle Fingerprint | Flow 3 revised
--          Congestion relief (same lane exit) | Security layers
-- Covers: Flow 1–7 (SRS v3.0)
-- ================================================================

-- ================================================================
-- CLEANUP (chạy khi reset database)
-- ================================================================
DROP FUNCTION IF EXISTS calculate_parking_fee(VARCHAR, TIMESTAMP, TIMESTAMP); 
DROP TABLE IF EXISTS vip_qr_identifiers CASCADE;
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
DROP TABLE IF EXISTS etc_devices         CASCADE;
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
    -- NOTE: Đây là fcm_token, KHÔNG phải frm_token (typo cũ đã sửa)
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
-- Quản lý phương tiện + Vehicle Fingerprint (chống biển giả)
-- ================================================================
CREATE TABLE vehicles (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID        NOT NULL,
    license_plate       VARCHAR(20) NOT NULL UNIQUE,   -- Format: 51A-12345
    vehicle_size        VARCHAR(15) NOT NULL
                        CHECK (vehicle_size IN ('VAN_TRUCK','MINIBUS_16','FAMILY_CAR')),

    -- Thông tin mô tả (Vehicle Fingerprint — chống Vehicle Swap Attack)
    color               VARCHAR(30),                   -- Tên màu (VD: "Đen")
    color_rgb           VARCHAR(7),                    -- Hex chính xác (VD: "#1C1C1C")
    body_shape          VARCHAR(20)
                        CHECK (body_shape IN ('SEDAN','SUV','VAN','TRUCK','MINIBUS','OTHER')),
    brand               VARCHAR(50),
   

    -- Tài liệu
    registration_doc_url VARCHAR(255),                 -- URL ảnh Cà vẹt (S3/MinIO)
    registration_photo_url VARCHAR(255),               -- Ảnh xe thực tế góc trước (đăng ký VIP)

    -- Tracking
    violation_count     INT         NOT NULL DEFAULT 0, -- Số lần vi phạm EV zone (Flow 7)
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_plate  ON vehicles(license_plate);
CREATE INDEX idx_vehicles_owner  ON vehicles(owner_id);
CREATE INDEX idx_vehicles_size   ON vehicles(vehicle_size);

COMMENT ON COLUMN vehicles.color_rgb     IS 'Hex color so sánh với AI Camera khi checkout VIP — phát hiện Vehicle Swap Attack';
COMMENT ON COLUMN vehicles.body_shape    IS 'Dáng xe để Fingerprint Check khi checkout VIP';
-- COMMENT ON COLUMN vehicles.vin_number    IS 'Số khung xe — OCR từ ảnh Cà vẹt khi đăng ký VIP. Unique identifier không thể giả mạo dễ dàng';
COMMENT ON COLUMN vehicles.violation_count IS 'Lần đầu vi phạm EV zone: chỉ cảnh báo. Từ lần 2: phạt tiền (Flow 7)';

-- ================================================================
-- 4. BẢNG: etc_devices
-- ETC (Electronic Toll Collection) device — Xác thực 2 lớp VIP
-- ================================================================
CREATE TABLE etc_devices (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID        NOT NULL UNIQUE,

    -- ETC device information
    etc_device_id   VARCHAR(50) NOT NULL UNIQUE,       -- ID chip ETC vật lý (từ nhà cung cấp)
    etc_provider    VARCHAR(30)                        -- 'VETC', 'EPASS', 'PARKING_TAG'
                    CHECK (etc_provider IN ('VETC','EPASS','PARKING_TAG','OTHER')),
    device_type     VARCHAR(20) NOT NULL DEFAULT 'ORIGINAL'
                    CHECK (device_type IN ('ORIGINAL','PARKING_TAG')),
                    -- ORIGINAL: ETC thật từ đường cao tốc
                    -- PARKING_TAG: Sticker mã bãi xe dán cho xe chưa có ETC

    tag_serial      VARCHAR(30),                       -- Mã serial của sticker bãi xe (nếu PARKING_TAG)
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    registered_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    registered_by   UUID,                              -- Staff/Manager ID cấp sticker

    CONSTRAINT fk_etc_vehicle FOREIGN KEY (vehicle_id)     REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_etc_staff   FOREIGN KEY (registered_by)  REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_etc_device   ON etc_devices(etc_device_id);
CREATE INDEX idx_etc_vehicle  ON etc_devices(vehicle_id);

COMMENT ON TABLE etc_devices IS 'ETC dual-auth: VIP vào/ra cổng phải pass CẢ 2: AI biển số + ETC device ID. Xe không có ETC thật được dán PARKING_TAG sticker.';
COMMENT ON COLUMN etc_devices.device_type IS 'ORIGINAL: ETC đường cao tốc (VETC/EPASS). PARKING_TAG: Sticker mã bãi xe cấp cho xe chưa có ETC — đọc được bằng đầu đọc ETC tại cổng.';
COMMENT ON COLUMN etc_devices.etc_provider IS 'VETC: Vietnam Electronic Toll Collection. EPASS: ePass Vietnam. PARKING_TAG: Sticker bãi xe nội bộ.';

-- ================================================================
-- 5. BẢNG: cards
-- Thẻ tạm vãng lai — CHỈ dùng cho khách vãng lai
-- VIP KHÔNG dùng thẻ vật lý
-- ================================================================
CREATE TABLE cards (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    card_code       VARCHAR(20) NOT NULL UNIQUE,   -- Mã in trên thẻ RFID vãng lai
    status          VARCHAR(15) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE','IN_USE','LOST','BLACKLISTED')),
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_code   ON cards(card_code);
CREATE INDEX idx_cards_status ON cards(status);

COMMENT ON TABLE cards IS 'VIP không dùng thẻ. Chỉ vãng lai dùng thẻ tạm. Thẻ được tái sử dụng sau khi vãng lai trả lại.';

-- ================================================================
-- *6. BẢNG: vip_qr_identifiers (Bỏ)
-- QR Code động dự phòng cho VIP khi AI Camera lỗi
-- ================================================================
-- CREATE TABLE vip_qr_identifiers (
--     id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
--     vehicle_id  UUID        NOT NULL,
--     qr_token    VARCHAR(255) NOT NULL UNIQUE,   -- JWT / UUID encoded, hết hạn 5 phút
--     expired_at  TIMESTAMP   NOT NULL,           -- Hết hạn sau 5 phút
--     is_used     BOOLEAN     NOT NULL DEFAULT FALSE, -- Single-use: TRUE sau khi quét
--     created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT fk_qr_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
-- );

-- CREATE INDEX idx_qr_token   ON vip_qr_identifiers(qr_token);
-- CREATE INDEX idx_qr_vehicle ON vip_qr_identifiers(vehicle_id);

-- COMMENT ON COLUMN vip_qr_identifiers.qr_token IS 'Token động 5 phút, single-use. Backend từ chối nếu CURRENT_TIMESTAMP > expired_at hoặc is_used = TRUE';

-- ================================================================
-- 7. BẢNG: zones
-- Cấu hình tầng đỗ xe + phân quyền loại xe
-- ================================================================
CREATE TABLE zones (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name           VARCHAR(80) NOT NULL,       -- VD: "Tầng B1 - Xe Tải Nhỏ"
    zone_code           VARCHAR(10) NOT NULL UNIQUE, -- VD: "B1", "B2", "F1", "F2"
    allowed_sizes       TEXT        NOT NULL,        -- JSON Array: ["FAMILY_CAR","MINIBUS_16"]
    total_slots         INT         NOT NULL CHECK (total_slots > 0),
    current_occupied    INT         NOT NULL DEFAULT 0 CHECK (current_occupied >= 0),
    has_ev_charger      BOOLEAN     NOT NULL DEFAULT FALSE, -- Có khu vực sạc điện (Flow 7)
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_zone_occupied CHECK (current_occupied <= total_slots)
);

COMMENT ON COLUMN zones.allowed_sizes   IS 'JSON Array VD: ["FAMILY_CAR"] hoặc ["VAN_TRUCK"]. Backend query để match với vehicle_size khi check-in.';
COMMENT ON COLUMN zones.current_occupied IS 'Tăng 1 khi check-in, giảm 1 khi check-out. Dùng để check còn slot không trước khi gán.';
COMMENT ON COLUMN zones.has_ev_charger  IS 'TRUE: có khu EV charging — Backend giám sát idle occupancy cho Flow 7';

-- ================================================================
-- 8. BẢNG: parking_slots
-- Ô đỗ xe cụ thể — Mock API cảm biến
-- ================================================================
CREATE TABLE parking_slots (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id         UUID        NOT NULL,
    slot_number     VARCHAR(10) NOT NULL,           -- VD: "A01", "B15"
    slot_type       VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                    CHECK (slot_type IN ('NORMAL','EV','DISABLED')),
    slot_status     VARCHAR(15) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (slot_status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    sensor_mock_id  VARCHAR(50),                    -- ID cảm biến giả lập
    ev_charger_id   VARCHAR(50),                    -- ID trụ sạc mock (nếu slot_type = 'EV')
    last_updated    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_slot_zone    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    CONSTRAINT uq_slot_number  UNIQUE (zone_id, slot_number)
);

CREATE INDEX idx_slot_zone_status ON parking_slots(zone_id, slot_status);

COMMENT ON COLUMN parking_slots.slot_type     IS 'NORMAL: xe xăng. EV: có trụ sạc điện. DISABLED: ưu tiên người khuyết tật.';
COMMENT ON COLUMN parking_slots.ev_charger_id IS 'Mock API trụ sạc: trả về is_charging=TRUE/FALSE — dùng cho idle occupancy detection Flow 7';

-- ================================================================
-- 9. BẢNG: parking_sessions *** BẢNG CỐT LÕI ***
-- Vòng đời toàn bộ lượt xe trong bãi
-- ================================================================
CREATE TABLE parking_sessions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Thông tin phương tiện
    license_plate       VARCHAR(20) NOT NULL,
    is_vip              BOOLEAN     NOT NULL DEFAULT FALSE,
    vehicle_id          UUID,       -- NULL nếu vãng lai chưa có tài khoản
    card_id             UUID,       -- NULL nếu VIP (không dùng thẻ)

    -- ETC Authentication (Flow 1/2 VIP dual-auth)
    etc_device_id       VARCHAR(50),                -- ETC device ID đã xác thực khi vào
    etc_verified        BOOLEAN     NOT NULL DEFAULT FALSE, -- TRUE = ETC pass lúc check-in

    -- Phân tầng
    assigned_zone_id    UUID        NOT NULL,
    parked_slot_id      UUID,       -- Optional tracking ô đỗ cụ thể

    -- Thời gian
    check_in_time       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time      TIMESTAMP,  -- NULL khi còn ACTIVE

    -- Trạng thái
    session_status      VARCHAR(25) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (session_status IN (
                            'ACTIVE',           -- Xe đang trong bãi
                            'COMPLETED',        -- Đã checkout bình thường
                            'PASSED_CONFIRMED', -- Đã thu tiền di động dưới hầm
                            'LOST_CARD'         -- Đang xử lý mất thẻ
                        )),

    -- VIP Anti-theft (Flow 6)
    is_locked           BOOLEAN     NOT NULL DEFAULT FALSE, -- App Driver bật khóa

    -- Vehicle Fingerprint Security
    is_suspicious       BOOLEAN     NOT NULL DEFAULT FALSE,
    suspicious_reason   VARCHAR(100),

    -- Staff Override (khi AI quét sai)
    override_by_staff   UUID,
    override_reason     TEXT,

    -- Mobile Checkout — thu tiền di động dưới hầm
    mobile_checkout_staff_id    UUID,
    mobile_checkout_location    VARCHAR(100),       -- GPS "lat,lng"
    mobile_checkout_at          TIMESTAMP,
    mobile_checkout_photo       VARCHAR(255),       -- Ảnh minh chứng thu tiền (S3)

    -- Flow 4: Lost Card
    lost_card_proof_photos  JSON,                   -- ["url_cmnd","url_cavet","url_face"]

    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ps_vehicle    FOREIGN KEY (vehicle_id)            REFERENCES vehicles(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_card       FOREIGN KEY (card_id)               REFERENCES cards(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_zone       FOREIGN KEY (assigned_zone_id)      REFERENCES zones(id),
    CONSTRAINT fk_ps_slot       FOREIGN KEY (parked_slot_id)        REFERENCES parking_slots(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_override   FOREIGN KEY (override_by_staff)     REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_mobile     FOREIGN KEY (mobile_checkout_staff_id) REFERENCES users(id) ON DELETE SET NULL

);

-- ================================================================
-- 10. BẢNG: vip_subscriptions
-- Quản lý gói vé tháng VIP
-- ================================================================
CREATE TABLE vip_subscriptions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id          UUID        NOT NULL,
    subscription_type   VARCHAR(10) NOT NULL CHECK (subscription_type IN ('MONTHLY','QUARTERLY','YEARLY')),
    start_date          DATE        NOT NULL,
    end_date            DATE        NOT NULL,
    status              VARCHAR(25) NOT NULL DEFAULT 'PENDING_APPROVAL'
                        CHECK (status IN ('PENDING_APPROVAL','ACTIVE','EXPIRED','REJECTED','CANCELLED')),

    -- Tài liệu đăng ký (JSON URL)
    document_photos     JSON,       -- {"ca_vet":"url","cmnd":"url","vehicle_front":"url"}

    -- Phê duyệt Manager
    approved_by         UUID,       -- Manager ID
    approved_at         TIMESTAMP,
    rejection_reason    TEXT,

    -- Thanh toán VNPay Sandbox
    fee_amount          DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(20) NOT NULL CHECK (payment_method IN ('VNPAY_SANDBOX','MOMO_SANDBOX','BANK_TRANSFER')),
    payment_reference   VARCHAR(100),               -- Transaction ID từ Gateway
    payment_status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','SUCCESS','FAILED')),

    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_approved FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sub_vehicle ON vip_subscriptions(vehicle_id);
CREATE INDEX idx_sub_status  ON vip_subscriptions(status);
CREATE INDEX idx_sub_enddate ON vip_subscriptions(end_date);   -- Query gần hết hạn gửi notification

-- ================================================================
-- 11. BẢNG: transactions
-- Hóa đơn thanh toán gắn với từng phiên
-- ================================================================
CREATE TABLE transactions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID        NOT NULL UNIQUE,   -- 1 session → 1 transaction

    -- Các khoản phí
    parking_fee             DECIMAL(10,2) NOT NULL DEFAULT 0,
    lost_card_penalty       DECIMAL(10,2) NOT NULL DEFAULT 0,   -- Flow 4
    violation_penalty       DECIMAL(10,2) NOT NULL DEFAULT 0,   -- Flow 7 EV zone
    total_amount            DECIMAL(10,2) NOT NULL,

    -- Thanh toán
    payment_method      VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH','VNPAY_SANDBOX','MOMO_SANDBOX','QR_BANK')),
    payment_status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    payment_reference   VARCHAR(100),

    -- Người xử lý
    processed_by        UUID        NOT NULL,           -- Staff ID
    -- [REVISED Flow 3] Mobile checkout: thu tiền di động dưới hầm
    -- Sau đó xe ra ĐÚNG LÀN VÃNG LAI, chỉ đưa thẻ không trả thêm tại cổng
    is_mobile_checkout  BOOLEAN     NOT NULL DEFAULT FALSE,
    mobile_gps_location VARCHAR(100),                  -- GPS của Staff khi thu
    mobile_photo_proof  VARCHAR(255),                  -- Ảnh minh chứng (bắt buộc)

    receipt_url         VARCHAR(255),                  -- URL hóa đơn điện tử
    processed_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_txn_session   FOREIGN KEY (session_id)   REFERENCES parking_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_staff     FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE INDEX idx_txn_session   ON transactions(session_id);
CREATE INDEX idx_txn_date      ON transactions(processed_at);
CREATE INDEX idx_txn_status    ON transactions(payment_status);
CREATE INDEX idx_txn_mobile    ON transactions(is_mobile_checkout, processed_at);

COMMENT ON COLUMN transactions.parking_fee         IS '0 nếu VIP có subscription ACTIVE trong thời hạn';
COMMENT ON COLUMN transactions.is_mobile_checkout  IS '[Flow 3 REVISED] TRUE = Staff thu tiền di động dưới hầm. Xe sau đó ra ĐÚNG LÀN VÃNG LAI của mình với PASSED_CONFIRMED status.';

-- ================================================================
-- 12. BẢNG: pricing_rules
-- Biểu phí linh hoạt — Manager cấu hình
-- ================================================================
CREATE TABLE pricing_rules (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_type            VARCHAR(15) NOT NULL CHECK (vehicle_type IN ('VAN_TRUCK','MINIBUS_16','FAMILY_CAR')),
    first_hour_fee          DECIMAL(10,2) NOT NULL,
    additional_hour_fee     DECIMAL(10,2) NOT NULL,
    max_daily_fee           DECIMAL(10,2) NOT NULL,
    lost_card_penalty       DECIMAL(10,2) NOT NULL DEFAULT 50000,
    ev_violation_penalty    DECIMAL(10,2) NOT NULL DEFAULT 20000,   -- Vi phạm EV zone
    is_active               BOOLEAN     NOT NULL DEFAULT TRUE,
    effective_from          DATE        NOT NULL,
    effective_to            DATE,       -- NULL = đang hiệu lực
    created_by              UUID,

    CONSTRAINT fk_pr_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_pr_type    ON pricing_rules(vehicle_type, is_active);
CREATE INDEX idx_pr_dates   ON pricing_rules(effective_from, effective_to);

COMMENT ON COLUMN pricing_rules.effective_to IS 'NULL = biểu giá hiện hành. Set khi có biểu giá mới để giữ lịch sử.';

-- ================================================================
-- 13. BẢNG: blacklisted_cards
-- Danh sách đen thẻ tạm bị mất (Flow 4)
-- ================================================================
CREATE TABLE blacklisted_cards (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id         UUID        NOT NULL UNIQUE,    -- 1 thẻ chỉ blacklist 1 lần
    session_id      UUID,                           -- Session phát sinh mất thẻ
    reason          VARCHAR(15) NOT NULL CHECK (reason IN ('LOST','STOLEN','DAMAGED','FRAUDULENT')),
    blacklisted_by  UUID        NOT NULL,
    blacklisted_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes           TEXT,

    CONSTRAINT fk_bl_card    FOREIGN KEY (card_id)       REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_bl_session FOREIGN KEY (session_id)    REFERENCES parking_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_bl_staff   FOREIGN KEY (blacklisted_by) REFERENCES users(id)
);

CREATE INDEX idx_bl_card ON blacklisted_cards(card_id);

COMMENT ON TABLE blacklisted_cards IS 'Khi insert: đồng thời UPDATE cards SET status=BLACKLISTED. Khi quẹt thẻ tại cổng: check blacklisted_cards trước khi xử lý.';

-- ================================================================
-- 14. BẢNG: ai_scan_logs
-- Log mọi lần AI Camera quét — Audit trail + Fingerprint Check
-- ================================================================
CREATE TABLE ai_scan_logs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID,
    scan_location       VARCHAR(25) NOT NULL
                        CHECK (scan_location IN (
                            'MAIN_ENTRANCE',    -- Cổng vào chính
                            'VIP_EXIT',         -- Cổng ra VIP
                            'CASUAL_EXIT',      -- Cổng ra vãng lai
                            'EXCEPTION_COUNTER' -- Quầy ngoại lệ (xe không có ETC)
                        )),
    scan_type           VARCHAR(25) NOT NULL DEFAULT 'STANDARD'
                        CHECK (scan_type IN (
                            'STANDARD',         -- Quét bình thường
                            'CHECK_IN_FP',      -- Check-in + lưu fingerprint
                            'CHECK_OUT_FP',     -- Check-out + so sánh fingerprint
                            'ANTI_THEFT',       -- Khi is_locked trigger
                            'SUSPICIOUS'        -- Scan khi phát hiện bất thường
                        )),
    camera_id           VARCHAR(50) NOT NULL,

    -- AI Detection Results
    image_url           VARCHAR(255) NOT NULL,      -- Ảnh lưu S3/MinIO (giữ 30 ngày)
    detected_plate      VARCHAR(20) NOT NULL,
    confidence_score    DECIMAL(5,2) NOT NULL,      -- 0.00–100.00 (< 70% → Staff kiểm tra)
    detected_vehicle_type VARCHAR(15),
    detected_color      VARCHAR(30),                -- Màu xe AI phát hiện
    detected_color_rgb  VARCHAR(7),                 -- Hex color AI phát hiện
    detected_shape      VARCHAR(20),                -- Dáng xe AI phát hiện

    -- Vehicle Fingerprint Match (checkout VIP)
    match_score         DECIMAL(5,2),               -- % khớp với check-in fingerprint
    color_diff          DECIMAL(5,2),               -- RGB color difference (> 30 = cảnh báo)
    shape_match         BOOLEAN,                    -- TRUE = dáng khớp

    -- ETC Read Result (VIP dual-auth)
    etc_read_device_id  VARCHAR(50),                -- ETC device ID đọc được tại cổng
    etc_match           BOOLEAN,                    -- TRUE = ETC khớp với đăng ký

    -- Staff Override
    is_overridden       BOOLEAN     NOT NULL DEFAULT FALSE,
    override_plate      VARCHAR(20),
    override_by         UUID,
    override_reason     TEXT,

    -- Evidence flag (khi anti-theft hoặc suspicious)
    is_evidence         BOOLEAN     NOT NULL DEFAULT FALSE,

    scanned_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_scan_session  FOREIGN KEY (session_id)  REFERENCES parking_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_scan_override FOREIGN KEY (override_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_scan_session    ON ai_scan_logs(session_id);
CREATE INDEX idx_scan_plate      ON ai_scan_logs(detected_plate);
CREATE INDEX idx_scan_confidence ON ai_scan_logs(confidence_score);
CREATE INDEX idx_scan_at         ON ai_scan_logs(scanned_at);
CREATE INDEX idx_scan_evidence   ON ai_scan_logs(is_evidence) WHERE is_evidence = TRUE;

COMMENT ON COLUMN ai_scan_logs.confidence_score IS '< 70%: hệ thống yêu cầu Staff xác nhận hoặc override';
COMMENT ON COLUMN ai_scan_logs.match_score       IS 'So sánh fingerprint check-in vs check-out. < 70% → is_suspicious = TRUE';
COMMENT ON COLUMN ai_scan_logs.etc_read_device_id IS 'ETC đầu đọc tại cổng ghi nhận. So sánh với etc_devices.etc_device_id đã đăng ký.';
COMMENT ON COLUMN ai_scan_logs.is_evidence       IS 'TRUE: ảnh này là bằng chứng anti-theft / suspicious — giữ lâu hơn 30 ngày thông thường';

-- ================================================================
-- 15. BẢNG: parking_violations
-- Vi phạm đỗ sai chỗ điện (Flow 7)
-- ================================================================
CREATE TABLE parking_violations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL,
    slot_id         UUID        NOT NULL,
    violation_type  VARCHAR(25) NOT NULL CHECK (violation_type IN ('EV_ZONE_MISUSE','DISABLED_ZONE_MISUSE','DOUBLE_PARKING')),
    photo_urls      JSON        NOT NULL,           -- ["url1","url2"] — Staff chụp
    detected_by     UUID        NOT NULL,           -- Staff ID
    is_first_violation BOOLEAN  NOT NULL DEFAULT TRUE, -- TRUE: chỉ cảnh báo; FALSE: phạt tiền
    penalty_applied BOOLEAN     NOT NULL DEFAULT FALSE,
    penalty_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    detected_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vio_session FOREIGN KEY (session_id)  REFERENCES parking_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_vio_slot    FOREIGN KEY (slot_id)     REFERENCES parking_slots(id),
    CONSTRAINT fk_vio_staff   FOREIGN KEY (detected_by) REFERENCES users(id)
);

CREATE INDEX idx_vio_session ON parking_violations(session_id);
CREATE INDEX idx_vio_date    ON parking_violations(detected_at);

COMMENT ON COLUMN parking_violations.is_first_violation IS 'TRUE: hiển thị cảnh báo nhẹ trên LED, không phạt tiền. FALSE (từ lần 2): cộng penalty vào transaction.';

-- ================================================================
-- 16. BẢNG: audit_logs
-- Nhật ký hệ thống — mọi thao tác nhạy cảm
-- ================================================================
CREATE TABLE audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,                           -- NULL nếu system tự động
    action_type     VARCHAR(40) NOT NULL CHECK (action_type IN (
        -- Auth
        'LOGIN', 'LOGOUT',
        -- AI & Override
        'OVERRIDE_AI',
        -- Gate Control
        'REMOTE_OPEN_BARRIER', 'STAFF_HELD_VEHICLE',
        -- VIP
        'APPROVE_VIP', 'REJECT_VIP',
        -- Card
        'BLACKLIST_CARD',
        -- Checkout
        'MANUAL_CHECKOUT', 'MOBILE_CHECKOUT',
        -- Lost Card
        'LOST_CARD_HANDLED',
        -- Pricing
        'UPDATE_PRICING',
        -- Violation
        'RECORD_VIOLATION',
        -- ETC
        'REGISTER_ETC_DEVICE', 'ISSUE_PARKING_TAG',
        -- Security Events
        'ANTI_THEFT_TRIGGERED',
        'SUSPICIOUS_EARLY_EXIT',
        'FINGERPRINT_MISMATCH',
        'COLOR_MISMATCH',
        'ETC_MISMATCH',
        'PLATE_MISMATCH_CHECKOUT',
        'OWNER_UNLOCKED_REMOTE',
        'STAFF_OVERRIDE_SUSPICIOUS',
        'AUTO_LOCK_TRIGGERED'
    )),
    entity_type     VARCHAR(50),                    -- Tên bảng bị tác động
    entity_id       UUID,
    old_value       JSON,
    new_value       JSON,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(255),
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user    ON audit_logs(user_id);
CREATE INDEX idx_audit_action  ON audit_logs(action_type);
CREATE INDEX idx_audit_entity  ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

COMMENT ON TABLE audit_logs IS 'Retention: 2 năm. Mọi thao tác nhạy cảm phải ghi log — bao gồm mở cổng từ xa, override AI, phê duyệt VIP, anti-theft events.';

-- ================================================================
-- SEED DATA
-- ================================================================

-- Admin mặc định
INSERT INTO users (username, password_hash, full_name, email, role)
VALUES ('admin', '$2b$10$CHANGE_THIS_HASH_IN_PRODUCTION', 'System Administrator', 'admin@parking.com', 'ADMIN');

-- Zones mặc định
INSERT INTO zones (zone_name, zone_code, allowed_sizes, total_slots, has_ev_charger) VALUES
    ('Tầng B2 — Xe Tải & Van',       'B2', '["VAN_TRUCK"]',             50,  FALSE),
    ('Tầng B1 — Xe 16 Chỗ',          'B1', '["MINIBUS_16"]',            30,  FALSE),
    ('Tầng F1 — Xe Gia Đình',         'F1', '["FAMILY_CAR"]',            100, FALSE),
    ('Tầng F2 — Xe Gia Đình (EV)',    'F2', '["FAMILY_CAR"]',            80,  TRUE);

-- Biểu giá mặc định
INSERT INTO pricing_rules (vehicle_type, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from) VALUES
    ('FAMILY_CAR',  15000, 10000, 100000, 50000, 20000, CURRENT_DATE),
    ('MINIBUS_16',  20000, 15000, 150000, 50000, 30000, CURRENT_DATE),
    ('VAN_TRUCK',   25000, 20000, 200000, 50000, 30000, CURRENT_DATE);

-- 50 thẻ tạm mặc định
DO $$
DECLARE i INT;
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO cards (card_code, status)
        VALUES (LPAD(i::TEXT, 6, '0'), 'AVAILABLE');
    END LOOP;
END $$;

-- ================================================================
-- VIEWS HỮU ÍCH
-- ================================================================

-- View: Xe đang trong bãi
CREATE OR REPLACE VIEW v_active_sessions AS
SELECT
    ps.id, ps.license_plate, ps.is_vip, ps.is_locked,
    ps.session_status, ps.check_in_time, ps.etc_verified,
    ps.is_suspicious, ps.suspicious_reason,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ps.check_in_time))/3600.0, 2) AS hours_parked,
    z.zone_name, z.zone_code,
    v.vehicle_size, v.color, v.body_shape
FROM parking_sessions ps
LEFT JOIN zones z ON ps.assigned_zone_id = z.id
LEFT JOIN vehicles v ON ps.vehicle_id = v.id
WHERE ps.session_status IN ('ACTIVE','PASSED_CONFIRMED');

-- View: Doanh thu theo ngày
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

-- View: Thẻ sẵn sàng nhả
CREATE OR REPLACE VIEW v_available_cards AS
SELECT id, card_code FROM cards WHERE status = 'AVAILABLE' ORDER BY card_code;

-- View: Xe VIP sắp hết hạn (3 ngày)
CREATE OR REPLACE VIEW v_expiring_vip AS
SELECT
    vs.id, v.license_plate, u.phone, u.fcm_token, u.email,
    vs.end_date, (vs.end_date - CURRENT_DATE) AS days_remaining
FROM vip_subscriptions vs
JOIN vehicles v ON vs.vehicle_id = v.id
JOIN users u ON v.owner_id = u.id
WHERE vs.status = 'ACTIVE'
  AND vs.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days';

-- ================================================================
-- FUNCTION: Tính phí gửi xe tự động
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
    WHERE vehicle_type = p_vehicle_size
      AND is_active = TRUE
      AND effective_from <= CURRENT_DATE
      AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    ORDER BY effective_from DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy biểu giá cho loại xe: %', p_vehicle_size;
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
-- BUSINESS LOGIC NOTES (Tóm tắt nghiệp vụ quan trọng)
-- ================================================================

/*
=== [REVISED] FLOW 3 — CONGESTION RELIEF (Giải tỏa kẹt xe) ===
Thiết kế mới: Xe vãng lai ra ĐÚNG LÀN VÃNG LAI sau khi staff thu tiền di động.
Không chuyển sang làn VIP để tránh di chuyển chồng chéo.

Quy trình:
1. Staff cầm điện thoại đi bộ dọc hàng xe vãng lai đang chờ
2. Thu tiền di động → INSERT transactions (is_mobile_checkout=TRUE)
3. UPDATE parking_sessions SET session_status='PASSED_CONFIRMED'
4. Xe vãng lai tiến lên cổng ra của ĐÚNG làn vãng lai của mình
5. Staff tại bốt: quẹt thẻ → hệ thống thấy PASSED_CONFIRMED → hiển thị "ĐÃ THANH TOÁN"
6. Staff bấm xác nhận → mở barrier → thu thẻ tạm
(Không cần trả tiền thêm tại cổng vì đã thu di động)

=== VIP DUAL-AUTH (ETC + License Plate) ===
Cổng vào/ra VIP phải pass ĐỒNG THỜI:
1. AI Camera: license_plate khớp với VIP trong DB + session ACTIVE
2. ETC Reader: etc_device_id khớp với etc_devices của xe

Xe chưa có ETC thật → Dán PARKING_TAG sticker (etc_devices.device_type='PARKING_TAG')
→ Quầy ngoại lệ (EXCEPTION_COUNTER) xử lý đăng ký sticker khi xe vào lần đầu.

=== VEHICLE SWAP ATTACK PREVENTION ===
Khi VIP checkout:
- Check 1: Session ACTIVE mandatory (không có session = REJECT)
- Check 2: Time threshold (< 10 phút = is_suspicious + HOLD)
- Check 3: Color RGB match (diff > 30 = is_suspicious + HOLD)
- Check 4: Body shape match (mismatch = is_suspicious + HOLD)
- Check 5: ETC match (mismatch = is_suspicious + HOLD)
Khi is_suspicious = TRUE: Barrier HOLD, màn hình Staff hiển thị 2 ảnh side-by-side để visual confirm

=== FLOW 7 — EV ZONE VIOLATION ===
- is_first_violation = TRUE → vehicles.violation_count = 0: chỉ cảnh báo LED
- is_first_violation = FALSE → violation_count > 0: cộng ev_violation_penalty vào transaction
- Phát hiện: parking_slots.slot_type='EV' + sensor=OCCUPIED + charger is_charging=FALSE > 15ph
*/

-- END OF SCHEMA v3.0 FINAL