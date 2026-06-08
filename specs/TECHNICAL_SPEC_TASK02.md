# TECHNICAL_SPEC_TASK02 — Flyway DB Migration & Baseline Setup
Generated from V1__initial_schema.sql on 2026-06-08 23:32:49

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS

### 1.1 Database Entities Overview

The system uses 15 tables. Each table and its purpose are listed below.
- **users**: System table for users.
- **refresh_tokens**: System table for refresh_tokens.
- **vehicles**: System table for vehicles.
- **etc_devices**: System table for etc_devices.
- **cards**: System table for cards.
- **zones**: System table for zones.
- **parking_slots**: System table for parking_slots.
- **parking_sessions**: System table for parking_sessions.
- **vip_subscriptions**: System table for vip_subscriptions.
- **transactions**: System table for transactions.
- **pricing_rules**: System table for pricing_rules.
- **blacklisted_cards**: System table for blacklisted_cards.
- **ai_scan_logs**: System table for ai_scan_logs.
- **parking_violations**: System table for parking_violations.
- **audit_logs**: System table for audit_logs.

### 1.2 Data Dictionary / Fields

For each table below, a markdown table lists Column, Type, Constraints, Description.
#### users

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| username | VARCHAR(50) | NOT NULL UNIQUE |  |
| password_hash | VARCHAR(255) | NOT NULL,           -- bcrypt cost >= 10 |  |
| full_name | VARCHAR(100) | NOT NULL |  |
| email | VARCHAR(100) | NOT NULL UNIQUE |  |
| phone | VARCHAR(15) |  |  |
| role | VARCHAR(10) | NOT NULL |  |
| status | VARCHAR(10) | NOT NULL DEFAULT 'ACTIVE' |  |
| fcm_token | VARCHAR(255) |  |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record last updated |
| last_login_at | TIMESTAMP |  |  |

#### refresh_tokens

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| user_id | UUID | NOT NULL | FK reference to users table |
| token | UUID | NOT NULL UNIQUE DEFAULT gen_random_uuid() |  |
| expires_at | TIMESTAMP | NOT NULL,               -- NOW() + 7 days |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |

#### vehicles

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| owner_id | UUID | NOT NULL | FK reference to users table |
| license_plate | VARCHAR(20) | NOT NULL UNIQUE,   -- Format: 51A-12345 |  |
| vehicle_size | VARCHAR(15) | NOT NULL |  |
| color | VARCHAR(30) | ,                   -- TÃªn mÃ u (VD: "Äen") |  |
| color_rgb | VARCHAR(7) | ,                    -- Hex chÃ­nh xÃ¡c (VD: "#1C1C1C") |  |
| body_shape | VARCHAR(20) |  |  |
| brand | VARCHAR(50) |  |  |
| registration_doc_url | VARCHAR(255) | ,                 -- URL áº£nh CÃ  váº¹t (S3/MinIO) |  |
| registration_photo_url | VARCHAR(255) | ,               -- áº¢nh xe thá»±c táº¿ gÃ³c trÆ°á»›c (Ä‘Äƒng kÃ½ VIP) |  |
| violation_count | INT | NOT NULL DEFAULT 0, -- Sá»‘ láº§n vi pháº¡m EV zone (Flow 7) |  |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record last updated |

#### etc_devices

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| vehicle_id | UUID | NOT NULL UNIQUE |  |
| etc_device_id | VARCHAR(50) | NOT NULL UNIQUE,       -- ID chip ETC váº­t lÃ½ (tá»« nhÃ  cung cáº¥p) |  |
| etc_provider | VARCHAR(30) | -- 'VETC', 'EPASS', 'PARKING_TAG' |  |
| device_type | VARCHAR(20) | NOT NULL DEFAULT 'ORIGINAL' |  |
| tag_serial | VARCHAR(30) | ,                       -- MÃ£ serial cá»§a sticker bÃ£i xe (náº¿u PARKING_TAG) |  |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |  |
| registered_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |  |
| registered_by | UUID | ,                              -- Staff/Manager ID cáº¥p sticker |  |

#### cards

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| card_code | VARCHAR(20) | NOT NULL UNIQUE,   -- MÃ£ in trÃªn tháº» RFID vÃ£ng lai |  |
| status | VARCHAR(15) | NOT NULL DEFAULT 'AVAILABLE' |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record last updated |

#### zones

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| zone_name | VARCHAR(80) | NOT NULL,       -- VD: "Táº§ng B1 - Xe Táº£i Nhá»" |  |
| zone_code | VARCHAR(10) | NOT NULL UNIQUE, -- VD: "B1", "B2", "F1", "F2" |  |
| allowed_sizes | TEXT | NOT NULL,        -- JSON Array: ["FAMILY_CAR","MINIBUS_16"] |  |
| total_slots | INT | NOT NULL CHECK (total_slots > 0) |  |
| current_occupied | INT | NOT NULL DEFAULT 0 CHECK (current_occupied >= 0) |  |
| has_ev_charger | BOOLEAN | NOT NULL DEFAULT FALSE, -- CÃ³ khu vá»±c sáº¡c Ä‘iá»‡n (Flow 7) |  |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record last updated |

#### parking_slots

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| zone_id | UUID | NOT NULL | Reference to zones table |
| slot_number | VARCHAR(10) | NOT NULL,           -- VD: "A01", "B15" |  |
| slot_type | VARCHAR(10) | NOT NULL DEFAULT 'NORMAL' |  |
| slot_status | VARCHAR(15) | NOT NULL DEFAULT 'AVAILABLE' |  |
| sensor_mock_id | VARCHAR(50) | ,                    -- ID cáº£m biáº¿n giáº£ láº­p |  |
| ev_charger_id | VARCHAR(50) | ,                    -- ID trá»¥ sáº¡c mock (náº¿u slot_type = 'EV') |  |
| last_updated | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |  |

#### parking_sessions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| license_plate | VARCHAR(20) | NOT NULL |  |
| is_vip | BOOLEAN | NOT NULL DEFAULT FALSE |  |
| vehicle_id | UUID | ,       -- NULL náº¿u vÃ£ng lai chÆ°a cÃ³ tÃ i khoáº£n |  |
| card_id | UUID | ,       -- NULL náº¿u VIP (khÃ´ng dÃ¹ng tháº») |  |
| etc_device_id | VARCHAR(50) | ,                -- ETC device ID Ä‘Ã£ xÃ¡c thá»±c khi vÃ o |  |
| etc_verified | BOOLEAN | NOT NULL DEFAULT FALSE, -- TRUE = ETC pass lÃºc check-in |  |
| assigned_zone_id | UUID | NOT NULL | Reference to zones table |
| parked_slot_id | UUID | ,       -- Optional tracking Ã´ Ä‘á»— cá»¥ thá»ƒ |  |
| check_in_time | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |  |
| check_out_time | TIMESTAMP | ,  -- NULL khi cÃ²n ACTIVE |  |
| session_status | VARCHAR(25) | NOT NULL DEFAULT 'ACTIVE' |  |
| is_locked | BOOLEAN | NOT NULL DEFAULT FALSE, -- App Driver báº­t khÃ³a |  |
| is_suspicious | BOOLEAN | NOT NULL DEFAULT FALSE |  |
| suspicious_reason | VARCHAR(100) |  |  |
| override_by_staff | UUID |  |  |
| override_reason | TEXT |  |  |
| mobile_checkout_staff_id | UUID |  |  |
| mobile_checkout_location | VARCHAR(100) | ,       -- GPS "lat,lng" |  |
| mobile_checkout_at | TIMESTAMP |  |  |
| mobile_checkout_photo | VARCHAR(255) | ,       -- áº¢nh minh chá»©ng thu tiá»n (S3) |  |
| lost_card_proof_photos | JSON | ,                   -- ["url_cmnd","url_cavet","url_face"] |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record last updated |

#### vip_subscriptions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| vehicle_id | UUID | NOT NULL |  |
| subscription_type | VARCHAR(10) | NOT NULL CHECK (subscription_type IN ('MONTHLY','QUARTERLY','YEARLY')) |  |
| start_date | DATE | NOT NULL |  |
| end_date | DATE | NOT NULL |  |
| status | VARCHAR(25) | NOT NULL DEFAULT 'PENDING_APPROVAL' |  |
| document_photos | JSON | ,       -- {"ca_vet":"url","cmnd":"url","vehicle_front":"url"} |  |
| approved_by | UUID | ,       -- Manager ID |  |
| approved_at | TIMESTAMP |  |  |
| rejection_reason | TEXT |  |  |
| fee_amount | DECIMAL(10,2) | NOT NULL | Monetary amount |
| payment_method | VARCHAR(20) | NOT NULL CHECK (payment_method IN ('VNPAY_SANDBOX','MOMO_SANDBOX','BANK_TRANSFER')) |  |
| payment_reference | VARCHAR(100) | ,               -- Transaction ID tá»« Gateway |  |
| payment_status | VARCHAR(10) | NOT NULL DEFAULT 'PENDING' |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record last updated |

#### transactions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| session_id | UUID | NOT NULL UNIQUE,   -- 1 session â†’ 1 transaction |  |
| parking_fee | DECIMAL(10,2) | NOT NULL DEFAULT 0 |  |
| lost_card_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 0,   -- Flow 4 |  |
| violation_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 0,   -- Flow 7 EV zone |  |
| total_amount | DECIMAL(10,2) | NOT NULL | Monetary amount |
| payment_method | VARCHAR(20) | NOT NULL CHECK (payment_method IN ('CASH','VNPAY_SANDBOX','MOMO_SANDBOX','QR_BANK')) |  |
| payment_status | VARCHAR(10) | NOT NULL DEFAULT 'PENDING' |  |
| payment_reference | VARCHAR(100) |  |  |
| processed_by | UUID | NOT NULL,           -- Staff ID |  |
| is_mobile_checkout | BOOLEAN | NOT NULL DEFAULT FALSE |  |
| mobile_gps_location | VARCHAR(100) | ,                  -- GPS cá»§a Staff khi thu |  |
| mobile_photo_proof | VARCHAR(255) | ,                  -- áº¢nh minh chá»©ng (báº¯t buá»™c) |  |
| receipt_url | VARCHAR(255) | ,                  -- URL hÃ³a Ä‘Æ¡n Ä‘iá»‡n tá»­ |  |
| processed_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |  |

#### pricing_rules

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| vehicle_type | VARCHAR(15) | NOT NULL CHECK (vehicle_type IN ('VAN_TRUCK','MINIBUS_16','FAMILY_CAR')) |  |
| first_hour_fee | DECIMAL(10,2) | NOT NULL |  |
| additional_hour_fee | DECIMAL(10,2) | NOT NULL |  |
| max_daily_fee | DECIMAL(10,2) | NOT NULL |  |
| lost_card_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 50000 |  |
| ev_violation_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 20000,   -- Vi pháº¡m EV zone |  |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |  |
| effective_from | DATE | NOT NULL |  |
| effective_to | DATE | ,       -- NULL = Ä‘ang hiá»‡u lá»±c |  |
| created_by | UUID |  |  |

#### blacklisted_cards

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| card_id | UUID | NOT NULL UNIQUE,    -- 1 tháº» chá»‰ blacklist 1 láº§n |  |
| session_id | UUID | ,                           -- Session phÃ¡t sinh máº¥t tháº» |  |
| reason | VARCHAR(15) | NOT NULL CHECK (reason IN ('LOST','STOLEN','DAMAGED','FRAUDULENT')) |  |
| blacklisted_by | UUID | NOT NULL |  |
| blacklisted_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |  |
| notes | TEXT |  |  |

#### ai_scan_logs

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| session_id | UUID |  |  |
| scan_location | VARCHAR(25) | NOT NULL |  |
| scan_type | VARCHAR(25) | NOT NULL DEFAULT 'STANDARD' |  |
| camera_id | VARCHAR(50) | NOT NULL |  |
| image_url | VARCHAR(255) | NOT NULL,      -- áº¢nh lÆ°u S3/MinIO (giá»¯ 30 ngÃ y) |  |
| detected_plate | VARCHAR(20) | NOT NULL |  |
| confidence_score | DECIMAL(5,2) | NOT NULL,      -- 0.00â€“100.00 (< 70% â†’ Staff kiá»ƒm tra) |  |
| detected_vehicle_type | VARCHAR(15) |  |  |
| detected_color | VARCHAR(30) | ,                -- MÃ u xe AI phÃ¡t hiá»‡n |  |
| detected_color_rgb | VARCHAR(7) | ,                 -- Hex color AI phÃ¡t hiá»‡n |  |
| detected_shape | VARCHAR(20) | ,                -- DÃ¡ng xe AI phÃ¡t hiá»‡n |  |
| match_score | DECIMAL(5,2) | ,               -- % khá»›p vá»›i check-in fingerprint |  |
| color_diff | DECIMAL(5,2) | ,               -- RGB color difference (> 30 = cáº£nh bÃ¡o) |  |
| shape_match | BOOLEAN | ,                    -- TRUE = dÃ¡ng khá»›p |  |
| etc_read_device_id | VARCHAR(50) | ,                -- ETC device ID Ä‘á»c Ä‘Æ°á»£c táº¡i cá»•ng |  |
| etc_match | BOOLEAN | ,                    -- TRUE = ETC khá»›p vá»›i Ä‘Äƒng kÃ½ |  |
| is_overridden | BOOLEAN | NOT NULL DEFAULT FALSE |  |
| override_plate | VARCHAR(20) |  |  |
| override_by | UUID |  |  |
| override_reason | TEXT |  |  |
| is_evidence | BOOLEAN | NOT NULL DEFAULT FALSE |  |
| scanned_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |  |

#### parking_violations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| session_id | UUID | NOT NULL |  |
| slot_id | UUID | NOT NULL |  |
| violation_type | VARCHAR(25) | NOT NULL CHECK (violation_type IN ('EV_ZONE_MISUSE','DISABLED_ZONE_MISUSE','DOUBLE_PARKING')) |  |
| photo_urls | JSON | NOT NULL,           -- ["url1","url2"] â€” Staff chá»¥p |  |
| detected_by | UUID | NOT NULL,           -- Staff ID |  |
| is_first_violation | BOOLEAN | NOT NULL DEFAULT TRUE, -- TRUE: chá»‰ cáº£nh bÃ¡o; FALSE: pháº¡t tiá»n |  |
| penalty_applied | BOOLEAN | NOT NULL DEFAULT FALSE |  |
| penalty_amount | DECIMAL(10,2) | NOT NULL DEFAULT 0 | Monetary amount |
| notes | TEXT |  |  |
| detected_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |  |

#### audit_logs

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier |
| user_id | UUID | ,                           -- NULL náº¿u system tá»± Ä‘á»™ng | FK reference to users table |
| action_type | VARCHAR(40) | NOT NULL CHECK (action_type IN ( |  |
| entity_type | VARCHAR(50) | ,                    -- TÃªn báº£ng bá»‹ tÃ¡c Ä‘á»™ng |  |
| entity_id | UUID |  |  |
| old_value | JSON |  |  |
| new_value | JSON |  |  |
| ip_address | VARCHAR(45) |  |  |
| user_agent | VARCHAR(255) |  |  |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp record created |

### 1.3 Business Rules & Constraints

- Flow 3 (Giải tỏa kẹt xe làn vãng lai Flow 3 revised): When temporary overload occurs, system will prioritize VIP and active subscription holders. Parking session allocation tries nearest available slot in same zone and uses soft-lock for 30s to prevent race conditions.
- VIP ETC dual-auth: VIP entries require both valid ETC device signature and a matching VIP subscription record; fallback challenge is sent via QR code if ETC fails.
- Vehicle Swap Prevention: vehicles table + transactions + cards are checked — when a vehicle plate is replaced on a card, system marks a 'swap_suspected' flag and requires manual review by MANAGER.
- EV Zone Violation: if vehicle type = EV but parked outside an EV-designated zone or non-EV in EV zone, a parking_violation row is created and penalty pricing applied.

### 1.4 Role-Based Access Control (RBAC)

Matrix (Table | ADMIN | MANAGER | STAFF | DRIVER) with CRUD allowances. ADMIN: full CRUD. MANAGER: CRU. STAFF: R/U for operational tables. DRIVER: R on own resources, create limited (e.g., create session via entry kiosk).

| Table | ADMIN | MANAGER | STAFF | DRIVER |
|---|---:|---:|---:|---:|
| users | CRUD | CRU | R/U | R (own) |
| refresh_tokens | CRUD | CRU | R/U | R (own) |
| vehicles | CRUD | CRU | R/U | R (own) |
| etc_devices | CRUD | CRU | R/U | R (own) |
| cards | CRUD | CRU | R/U | R (own) |
| zones | CRUD | CRU | R/U | R (own) |
| parking_slots | CRUD | CRU | R/U | R (own) |
| parking_sessions | CRUD | CRU | R/U | R (own) |
| vip_subscriptions | CRUD | CRU | R/U | R (own) |
| transactions | CRUD | CRU | R/U | R (own) |
| pricing_rules | CRUD | CRU | R/U | R (own) |
| blacklisted_cards | CRUD | CRU | R/U | R (own) |
| ai_scan_logs | CRUD | CRU | R/U | R (own) |
| parking_violations | CRUD | CRU | R/U | R (own) |
| audit_logs | CRUD | CRU | R/U | R (own) |

## 2. TECHNICAL SPECIFICATIONS & BACKEND CONFIGURATIONS

### 2.1 Backend Data Source Configuration (application.properties example)

```properties
spring.datasource.url=jdbc:postgresql://<DB_HOST>:5432/<DB_NAME>
spring.datasource.username=<DB_USER>
spring.datasource.password=<DB_PASSWORD>
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL95Dialect
spring.flyway.locations=classpath:db/migration
```

Note: use environment variables or Spring Boot externalized configuration for credentials and connection pooling (HikariCP).

### 2.2 Flyway Migration Strategy

- File naming: V<version>__<description>.sql (e.g., V1__initial_schema.sql). Flyway orders by version and records applied migrations in flyway_schema_history table.
- Place migrations under src/main/resources/db/migration so Flyway scans them on application startup.

### 2.3 Baseline Seed Data Verification

Baseline seed data included in migration or separate repeatable scripts:

- Default admin account: email=admin@example.com, password hashed with bcrypt.
- Zones: Zone A, Zone B, Zone C, Zone D (4 entries)
- Pricing rules: CAR, MOTORBIKE, TRUCK with default hourly and daily caps.
- 50 temporary cards: placeholders for entry kiosks with statuses initialized.

### 2.4 Database Views & Stored Functions

Views included (names and purpose):

Function calculate_parking_fee not found in migration SQL. Implement as PL/pgSQL function that accepts session_id and returns fee numeric.

---
## Appendix: Full SQL migration (reference)
```sql
-- ================================================================
-- DATABASE SCHEMA: PARKING BUILDING MANAGEMENT SYSTEM
-- Version: 3.0 FINAL | PostgreSQL 
-- Updates: ETC dual-auth | Vehicle Fingerprint | Flow 3 revised
--          Congestion relief (same lane exit) | Security layers
-- Covers: Flow 1â€“7 (SRS v3.0)
-- ================================================================

-- ================================================================
-- CLEANUP (cháº¡y khi reset database)
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
-- 1. Báº¢NG: users
-- Quáº£n lÃ½ táº¥t cáº£ tÃ i khoáº£n + phÃ¢n quyá»n RBAC
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
    -- NOTE: ÄÃ¢y lÃ  fcm_token, KHÃ”NG pháº£i frm_token (typo cÅ© Ä‘Ã£ sá»­a)
    fcm_token       VARCHAR(255),

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at   TIMESTAMP
);

CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

COMMENT ON COLUMN users.fcm_token IS 'Firebase Cloud Messaging token â€” gá»­i Push Notification cho Driver VIP khi Anti-theft trigger (Flow 6)';
COMMENT ON COLUMN users.role IS 'ADMIN: Quáº£n trá»‹ viÃªn | MANAGER: Quáº£n lÃ½ bÃ£i | STAFF: NV váº­n hÃ nh | DRIVER: TÃ i xáº¿';

-- ================================================================
-- 2. Báº¢NG: refresh_tokens
-- JWT Refresh Token management (7 ngÃ y)
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

COMMENT ON TABLE refresh_tokens IS 'Logout: DELETE WHERE user_id = ?. Access Token: JWT 15 phÃºt. Refresh Token: UUID 7 ngÃ y.';

-- ================================================================
-- 3. Báº¢NG: vehicles
-- Quáº£n lÃ½ phÆ°Æ¡ng tiá»‡n + Vehicle Fingerprint (chá»‘ng biá»ƒn giáº£)
-- ================================================================
CREATE TABLE vehicles (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID        NOT NULL,
    license_plate       VARCHAR(20) NOT NULL UNIQUE,   -- Format: 51A-12345
    vehicle_size        VARCHAR(15) NOT NULL
                        CHECK (vehicle_size IN ('VAN_TRUCK','MINIBUS_16','FAMILY_CAR')),

    -- ThÃ´ng tin mÃ´ táº£ (Vehicle Fingerprint â€” chá»‘ng Vehicle Swap Attack)
    color               VARCHAR(30),                   -- TÃªn mÃ u (VD: "Äen")
    color_rgb           VARCHAR(7),                    -- Hex chÃ­nh xÃ¡c (VD: "#1C1C1C")
    body_shape          VARCHAR(20)
                        CHECK (body_shape IN ('SEDAN','SUV','VAN','TRUCK','MINIBUS','OTHER')),
    brand               VARCHAR(50),
   

    -- TÃ i liá»‡u
    registration_doc_url VARCHAR(255),                 -- URL áº£nh CÃ  váº¹t (S3/MinIO)
    registration_photo_url VARCHAR(255),               -- áº¢nh xe thá»±c táº¿ gÃ³c trÆ°á»›c (Ä‘Äƒng kÃ½ VIP)

    -- Tracking
    violation_count     INT         NOT NULL DEFAULT 0, -- Sá»‘ láº§n vi pháº¡m EV zone (Flow 7)
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_plate  ON vehicles(license_plate);
CREATE INDEX idx_vehicles_owner  ON vehicles(owner_id);
CREATE INDEX idx_vehicles_size   ON vehicles(vehicle_size);

COMMENT ON COLUMN vehicles.color_rgb     IS 'Hex color so sÃ¡nh vá»›i AI Camera khi checkout VIP â€” phÃ¡t hiá»‡n Vehicle Swap Attack';
COMMENT ON COLUMN vehicles.body_shape    IS 'DÃ¡ng xe Ä‘á»ƒ Fingerprint Check khi checkout VIP';
-- COMMENT ON COLUMN vehicles.vin_number    IS 'Sá»‘ khung xe â€” OCR tá»« áº£nh CÃ  váº¹t khi Ä‘Äƒng kÃ½ VIP. Unique identifier khÃ´ng thá»ƒ giáº£ máº¡o dá»… dÃ ng';
COMMENT ON COLUMN vehicles.violation_count IS 'Láº§n Ä‘áº§u vi pháº¡m EV zone: chá»‰ cáº£nh bÃ¡o. Tá»« láº§n 2: pháº¡t tiá»n (Flow 7)';

-- ================================================================
-- 4. Báº¢NG: etc_devices
-- ETC (Electronic Toll Collection) device â€” XÃ¡c thá»±c 2 lá»›p VIP
-- ================================================================
CREATE TABLE etc_devices (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID        NOT NULL UNIQUE,

    -- ETC device information
    etc_device_id   VARCHAR(50) NOT NULL UNIQUE,       -- ID chip ETC váº­t lÃ½ (tá»« nhÃ  cung cáº¥p)
    etc_provider    VARCHAR(30)                        -- 'VETC', 'EPASS', 'PARKING_TAG'
                    CHECK (etc_provider IN ('VETC','EPASS','PARKING_TAG','OTHER')),
    device_type     VARCHAR(20) NOT NULL DEFAULT 'ORIGINAL'
                    CHECK (device_type IN ('ORIGINAL','PARKING_TAG')),
                    -- ORIGINAL: ETC tháº­t tá»« Ä‘Æ°á»ng cao tá»‘c
                    -- PARKING_TAG: Sticker mÃ£ bÃ£i xe dÃ¡n cho xe chÆ°a cÃ³ ETC

    tag_serial      VARCHAR(30),                       -- MÃ£ serial cá»§a sticker bÃ£i xe (náº¿u PARKING_TAG)
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    registered_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    registered_by   UUID,                              -- Staff/Manager ID cáº¥p sticker

    CONSTRAINT fk_etc_vehicle FOREIGN KEY (vehicle_id)     REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_etc_staff   FOREIGN KEY (registered_by)  REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_etc_device   ON etc_devices(etc_device_id);
CREATE INDEX idx_etc_vehicle  ON etc_devices(vehicle_id);

COMMENT ON TABLE etc_devices IS 'ETC dual-auth: VIP vÃ o/ra cá»•ng pháº£i pass Cáº¢ 2: AI biá»ƒn sá»‘ + ETC device ID. Xe khÃ´ng cÃ³ ETC tháº­t Ä‘Æ°á»£c dÃ¡n PARKING_TAG sticker.';
COMMENT ON COLUMN etc_devices.device_type IS 'ORIGINAL: ETC Ä‘Æ°á»ng cao tá»‘c (VETC/EPASS). PARKING_TAG: Sticker mÃ£ bÃ£i xe cáº¥p cho xe chÆ°a cÃ³ ETC â€” Ä‘á»c Ä‘Æ°á»£c báº±ng Ä‘áº§u Ä‘á»c ETC táº¡i cá»•ng.';
COMMENT ON COLUMN etc_devices.etc_provider IS 'VETC: Vietnam Electronic Toll Collection. EPASS: ePass Vietnam. PARKING_TAG: Sticker bÃ£i xe ná»™i bá»™.';

-- ================================================================
-- 5. Báº¢NG: cards
-- Tháº» táº¡m vÃ£ng lai â€” CHá»ˆ dÃ¹ng cho khÃ¡ch vÃ£ng lai
-- VIP KHÃ”NG dÃ¹ng tháº» váº­t lÃ½
-- ================================================================
CREATE TABLE cards (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    card_code       VARCHAR(20) NOT NULL UNIQUE,   -- MÃ£ in trÃªn tháº» RFID vÃ£ng lai
    status          VARCHAR(15) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE','IN_USE','LOST','BLACKLISTED')),
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_code   ON cards(card_code);
CREATE INDEX idx_cards_status ON cards(status);

COMMENT ON TABLE cards IS 'VIP khÃ´ng dÃ¹ng tháº». Chá»‰ vÃ£ng lai dÃ¹ng tháº» táº¡m. Tháº» Ä‘Æ°á»£c tÃ¡i sá»­ dá»¥ng sau khi vÃ£ng lai tráº£ láº¡i.';

-- ================================================================
-- *6. Báº¢NG: vip_qr_identifiers (Bá»)
-- QR Code Ä‘á»™ng dá»± phÃ²ng cho VIP khi AI Camera lá»—i
-- ================================================================
-- CREATE TABLE vip_qr_identifiers (
--     id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
--     vehicle_id  UUID        NOT NULL,
--     qr_token    VARCHAR(255) NOT NULL UNIQUE,   -- JWT / UUID encoded, háº¿t háº¡n 5 phÃºt
--     expired_at  TIMESTAMP   NOT NULL,           -- Háº¿t háº¡n sau 5 phÃºt
--     is_used     BOOLEAN     NOT NULL DEFAULT FALSE, -- Single-use: TRUE sau khi quÃ©t
--     created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT fk_qr_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
-- );

-- CREATE INDEX idx_qr_token   ON vip_qr_identifiers(qr_token);
-- CREATE INDEX idx_qr_vehicle ON vip_qr_identifiers(vehicle_id);

-- COMMENT ON COLUMN vip_qr_identifiers.qr_token IS 'Token Ä‘á»™ng 5 phÃºt, single-use. Backend tá»« chá»‘i náº¿u CURRENT_TIMESTAMP > expired_at hoáº·c is_used = TRUE';

-- ================================================================
-- 7. Báº¢NG: zones
-- Cáº¥u hÃ¬nh táº§ng Ä‘á»— xe + phÃ¢n quyá»n loáº¡i xe
-- ================================================================
CREATE TABLE zones (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name           VARCHAR(80) NOT NULL,       -- VD: "Táº§ng B1 - Xe Táº£i Nhá»"
    zone_code           VARCHAR(10) NOT NULL UNIQUE, -- VD: "B1", "B2", "F1", "F2"
    allowed_sizes       TEXT        NOT NULL,        -- JSON Array: ["FAMILY_CAR","MINIBUS_16"]
    total_slots         INT         NOT NULL CHECK (total_slots > 0),
    current_occupied    INT         NOT NULL DEFAULT 0 CHECK (current_occupied >= 0),
    has_ev_charger      BOOLEAN     NOT NULL DEFAULT FALSE, -- CÃ³ khu vá»±c sáº¡c Ä‘iá»‡n (Flow 7)
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_zone_occupied CHECK (current_occupied <= total_slots)
);

COMMENT ON COLUMN zones.allowed_sizes   IS 'JSON Array VD: ["FAMILY_CAR"] hoáº·c ["VAN_TRUCK"]. Backend query Ä‘á»ƒ match vá»›i vehicle_size khi check-in.';
COMMENT ON COLUMN zones.current_occupied IS 'TÄƒng 1 khi check-in, giáº£m 1 khi check-out. DÃ¹ng Ä‘á»ƒ check cÃ²n slot khÃ´ng trÆ°á»›c khi gÃ¡n.';
COMMENT ON COLUMN zones.has_ev_charger  IS 'TRUE: cÃ³ khu EV charging â€” Backend giÃ¡m sÃ¡t idle occupancy cho Flow 7';

-- ================================================================
-- 8. Báº¢NG: parking_slots
-- Ã” Ä‘á»— xe cá»¥ thá»ƒ â€” Mock API cáº£m biáº¿n
-- ================================================================
CREATE TABLE parking_slots (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id         UUID        NOT NULL,
    slot_number     VARCHAR(10) NOT NULL,           -- VD: "A01", "B15"
    slot_type       VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                    CHECK (slot_type IN ('NORMAL','EV','DISABLED')),
    slot_status     VARCHAR(15) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (slot_status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    sensor_mock_id  VARCHAR(50),                    -- ID cáº£m biáº¿n giáº£ láº­p
    ev_charger_id   VARCHAR(50),                    -- ID trá»¥ sáº¡c mock (náº¿u slot_type = 'EV')
    last_updated    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_slot_zone    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    CONSTRAINT uq_slot_number  UNIQUE (zone_id, slot_number)
);

CREATE INDEX idx_slot_zone_status ON parking_slots(zone_id, slot_status);

COMMENT ON COLUMN parking_slots.slot_type     IS 'NORMAL: xe xÄƒng. EV: cÃ³ trá»¥ sáº¡c Ä‘iá»‡n. DISABLED: Æ°u tiÃªn ngÆ°á»i khuyáº¿t táº­t.';
COMMENT ON COLUMN parking_slots.ev_charger_id IS 'Mock API trá»¥ sáº¡c: tráº£ vá» is_charging=TRUE/FALSE â€” dÃ¹ng cho idle occupancy detection Flow 7';

-- ================================================================
-- 9. Báº¢NG: parking_sessions *** Báº¢NG Cá»T LÃ•I ***
-- VÃ²ng Ä‘á»i toÃ n bá»™ lÆ°á»£t xe trong bÃ£i
-- ================================================================
CREATE TABLE parking_sessions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ThÃ´ng tin phÆ°Æ¡ng tiá»‡n
    license_plate       VARCHAR(20) NOT NULL,
    is_vip              BOOLEAN     NOT NULL DEFAULT FALSE,
    vehicle_id          UUID,       -- NULL náº¿u vÃ£ng lai chÆ°a cÃ³ tÃ i khoáº£n
    card_id             UUID,       -- NULL náº¿u VIP (khÃ´ng dÃ¹ng tháº»)

    -- ETC Authentication (Flow 1/2 VIP dual-auth)
    etc_device_id       VARCHAR(50),                -- ETC device ID Ä‘Ã£ xÃ¡c thá»±c khi vÃ o
    etc_verified        BOOLEAN     NOT NULL DEFAULT FALSE, -- TRUE = ETC pass lÃºc check-in

    -- PhÃ¢n táº§ng
    assigned_zone_id    UUID        NOT NULL,
    parked_slot_id      UUID,       -- Optional tracking Ã´ Ä‘á»— cá»¥ thá»ƒ

    -- Thá»i gian
    check_in_time       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time      TIMESTAMP,  -- NULL khi cÃ²n ACTIVE

    -- Tráº¡ng thÃ¡i
    session_status      VARCHAR(25) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (session_status IN (
                            'ACTIVE',           -- Xe Ä‘ang trong bÃ£i
                            'COMPLETED',        -- ÄÃ£ checkout bÃ¬nh thÆ°á»ng
                            'PASSED_CONFIRMED', -- ÄÃ£ thu tiá»n di Ä‘á»™ng dÆ°á»›i háº§m
                            'LOST_CARD'         -- Äang xá»­ lÃ½ máº¥t tháº»
                        )),

    -- VIP Anti-theft (Flow 6)
    is_locked           BOOLEAN     NOT NULL DEFAULT FALSE, -- App Driver báº­t khÃ³a

    -- Vehicle Fingerprint Security
    is_suspicious       BOOLEAN     NOT NULL DEFAULT FALSE,
    suspicious_reason   VARCHAR(100),

    -- Staff Override (khi AI quÃ©t sai)
    override_by_staff   UUID,
    override_reason     TEXT,

    -- Mobile Checkout â€” thu tiá»n di Ä‘á»™ng dÆ°á»›i háº§m
    mobile_checkout_staff_id    UUID,
    mobile_checkout_location    VARCHAR(100),       -- GPS "lat,lng"
    mobile_checkout_at          TIMESTAMP,
    mobile_checkout_photo       VARCHAR(255),       -- áº¢nh minh chá»©ng thu tiá»n (S3)

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
-- 10. Báº¢NG: vip_subscriptions
-- Quáº£n lÃ½ gÃ³i vÃ© thÃ¡ng VIP
-- ================================================================
CREATE TABLE vip_subscriptions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id          UUID        NOT NULL,
    subscription_type   VARCHAR(10) NOT NULL CHECK (subscription_type IN ('MONTHLY','QUARTERLY','YEARLY')),
    start_date          DATE        NOT NULL,
    end_date            DATE        NOT NULL,
    status              VARCHAR(25) NOT NULL DEFAULT 'PENDING_APPROVAL'
                        CHECK (status IN ('PENDING_APPROVAL','ACTIVE','EXPIRED','REJECTED','CANCELLED')),

    -- TÃ i liá»‡u Ä‘Äƒng kÃ½ (JSON URL)
    document_photos     JSON,       -- {"ca_vet":"url","cmnd":"url","vehicle_front":"url"}

    -- PhÃª duyá»‡t Manager
    approved_by         UUID,       -- Manager ID
    approved_at         TIMESTAMP,
    rejection_reason    TEXT,

    -- Thanh toÃ¡n VNPay Sandbox
    fee_amount          DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(20) NOT NULL CHECK (payment_method IN ('VNPAY_SANDBOX','MOMO_SANDBOX','BANK_TRANSFER')),
    payment_reference   VARCHAR(100),               -- Transaction ID tá»« Gateway
    payment_status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','SUCCESS','FAILED')),

    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_approved FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sub_vehicle ON vip_subscriptions(vehicle_id);
CREATE INDEX idx_sub_status  ON vip_subscriptions(status);
CREATE INDEX idx_sub_enddate ON vip_subscriptions(end_date);   -- Query gáº§n háº¿t háº¡n gá»­i notification

-- ================================================================
-- 11. Báº¢NG: transactions
-- HÃ³a Ä‘Æ¡n thanh toÃ¡n gáº¯n vá»›i tá»«ng phiÃªn
-- ================================================================
CREATE TABLE transactions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID        NOT NULL UNIQUE,   -- 1 session â†’ 1 transaction

    -- CÃ¡c khoáº£n phÃ­
    parking_fee             DECIMAL(10,2) NOT NULL DEFAULT 0,
    lost_card_penalty       DECIMAL(10,2) NOT NULL DEFAULT 0,   -- Flow 4
    violation_penalty       DECIMAL(10,2) NOT NULL DEFAULT 0,   -- Flow 7 EV zone
    total_amount            DECIMAL(10,2) NOT NULL,

    -- Thanh toÃ¡n
    payment_method      VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH','VNPAY_SANDBOX','MOMO_SANDBOX','QR_BANK')),
    payment_status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    payment_reference   VARCHAR(100),

    -- NgÆ°á»i xá»­ lÃ½
    processed_by        UUID        NOT NULL,           -- Staff ID
    -- [REVISED Flow 3] Mobile checkout: thu tiá»n di Ä‘á»™ng dÆ°á»›i háº§m
    -- Sau Ä‘Ã³ xe ra ÄÃšNG LÃ€N VÃƒNG LAI, chá»‰ Ä‘Æ°a tháº» khÃ´ng tráº£ thÃªm táº¡i cá»•ng
    is_mobile_checkout  BOOLEAN     NOT NULL DEFAULT FALSE,
    mobile_gps_location VARCHAR(100),                  -- GPS cá»§a Staff khi thu
    mobile_photo_proof  VARCHAR(255),                  -- áº¢nh minh chá»©ng (báº¯t buá»™c)

    receipt_url         VARCHAR(255),                  -- URL hÃ³a Ä‘Æ¡n Ä‘iá»‡n tá»­
    processed_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_txn_session   FOREIGN KEY (session_id)   REFERENCES parking_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_staff     FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE INDEX idx_txn_session   ON transactions(session_id);
CREATE INDEX idx_txn_date      ON transactions(processed_at);
CREATE INDEX idx_txn_status    ON transactions(payment_status);
CREATE INDEX idx_txn_mobile    ON transactions(is_mobile_checkout, processed_at);

COMMENT ON COLUMN transactions.parking_fee         IS '0 náº¿u VIP cÃ³ subscription ACTIVE trong thá»i háº¡n';
COMMENT ON COLUMN transactions.is_mobile_checkout  IS '[Flow 3 REVISED] TRUE = Staff thu tiá»n di Ä‘á»™ng dÆ°á»›i háº§m. Xe sau Ä‘Ã³ ra ÄÃšNG LÃ€N VÃƒNG LAI cá»§a mÃ¬nh vá»›i PASSED_CONFIRMED status.';

-- ================================================================
-- 12. Báº¢NG: pricing_rules
-- Biá»ƒu phÃ­ linh hoáº¡t â€” Manager cáº¥u hÃ¬nh
-- ================================================================
CREATE TABLE pricing_rules (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_type            VARCHAR(15) NOT NULL CHECK (vehicle_type IN ('VAN_TRUCK','MINIBUS_16','FAMILY_CAR')),
    first_hour_fee          DECIMAL(10,2) NOT NULL,
    additional_hour_fee     DECIMAL(10,2) NOT NULL,
    max_daily_fee           DECIMAL(10,2) NOT NULL,
    lost_card_penalty       DECIMAL(10,2) NOT NULL DEFAULT 50000,
    ev_violation_penalty    DECIMAL(10,2) NOT NULL DEFAULT 20000,   -- Vi pháº¡m EV zone
    is_active               BOOLEAN     NOT NULL DEFAULT TRUE,
    effective_from          DATE        NOT NULL,
    effective_to            DATE,       -- NULL = Ä‘ang hiá»‡u lá»±c
    created_by              UUID,

    CONSTRAINT fk_pr_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_pr_type    ON pricing_rules(vehicle_type, is_active);
CREATE INDEX idx_pr_dates   ON pricing_rules(effective_from, effective_to);

COMMENT ON COLUMN pricing_rules.effective_to IS 'NULL = biá»ƒu giÃ¡ hiá»‡n hÃ nh. Set khi cÃ³ biá»ƒu giÃ¡ má»›i Ä‘á»ƒ giá»¯ lá»‹ch sá»­.';

-- ================================================================
-- 13. Báº¢NG: blacklisted_cards
-- Danh sÃ¡ch Ä‘en tháº» táº¡m bá»‹ máº¥t (Flow 4)
-- ================================================================
CREATE TABLE blacklisted_cards (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id         UUID        NOT NULL UNIQUE,    -- 1 tháº» chá»‰ blacklist 1 láº§n
    session_id      UUID,                           -- Session phÃ¡t sinh máº¥t tháº»
    reason          VARCHAR(15) NOT NULL CHECK (reason IN ('LOST','STOLEN','DAMAGED','FRAUDULENT')),
    blacklisted_by  UUID        NOT NULL,
    blacklisted_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes           TEXT,

    CONSTRAINT fk_bl_card    FOREIGN KEY (card_id)       REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_bl_session FOREIGN KEY (session_id)    REFERENCES parking_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_bl_staff   FOREIGN KEY (blacklisted_by) REFERENCES users(id)
);

CREATE INDEX idx_bl_card ON blacklisted_cards(card_id);

COMMENT ON TABLE blacklisted_cards IS 'Khi insert: Ä‘á»“ng thá»i UPDATE cards SET status=BLACKLISTED. Khi quáº¹t tháº» táº¡i cá»•ng: check blacklisted_cards trÆ°á»›c khi xá»­ lÃ½.';

-- ================================================================
-- 14. Báº¢NG: ai_scan_logs
-- Log má»i láº§n AI Camera quÃ©t â€” Audit trail + Fingerprint Check
-- ================================================================
CREATE TABLE ai_scan_logs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID,
    scan_location       VARCHAR(25) NOT NULL
                        CHECK (scan_location IN (
                            'MAIN_ENTRANCE',    -- Cá»•ng vÃ o chÃ­nh
                            'VIP_EXIT',         -- Cá»•ng ra VIP
                            'CASUAL_EXIT',      -- Cá»•ng ra vÃ£ng lai
                            'EXCEPTION_COUNTER' -- Quáº§y ngoáº¡i lá»‡ (xe khÃ´ng cÃ³ ETC)
                        )),
    scan_type           VARCHAR(25) NOT NULL DEFAULT 'STANDARD'
                        CHECK (scan_type IN (
                            'STANDARD',         -- QuÃ©t bÃ¬nh thÆ°á»ng
                            'CHECK_IN_FP',      -- Check-in + lÆ°u fingerprint
                            'CHECK_OUT_FP',     -- Check-out + so sÃ¡nh fingerprint
                            'ANTI_THEFT',       -- Khi is_locked trigger
                            'SUSPICIOUS'        -- Scan khi phÃ¡t hiá»‡n báº¥t thÆ°á»ng
                        )),
    camera_id           VARCHAR(50) NOT NULL,

    -- AI Detection Results
    image_url           VARCHAR(255) NOT NULL,      -- áº¢nh lÆ°u S3/MinIO (giá»¯ 30 ngÃ y)
    detected_plate      VARCHAR(20) NOT NULL,
    confidence_score    DECIMAL(5,2) NOT NULL,      -- 0.00â€“100.00 (< 70% â†’ Staff kiá»ƒm tra)
    detected_vehicle_type VARCHAR(15),
    detected_color      VARCHAR(30),                -- MÃ u xe AI phÃ¡t hiá»‡n
    detected_color_rgb  VARCHAR(7),                 -- Hex color AI phÃ¡t hiá»‡n
    detected_shape      VARCHAR(20),                -- DÃ¡ng xe AI phÃ¡t hiá»‡n

    -- Vehicle Fingerprint Match (checkout VIP)
    match_score         DECIMAL(5,2),               -- % khá»›p vá»›i check-in fingerprint
    color_diff          DECIMAL(5,2),               -- RGB color difference (> 30 = cáº£nh bÃ¡o)
    shape_match         BOOLEAN,                    -- TRUE = dÃ¡ng khá»›p

    -- ETC Read Result (VIP dual-auth)
    etc_read_device_id  VARCHAR(50),                -- ETC device ID Ä‘á»c Ä‘Æ°á»£c táº¡i cá»•ng
    etc_match           BOOLEAN,                    -- TRUE = ETC khá»›p vá»›i Ä‘Äƒng kÃ½

    -- Staff Override
    is_overridden       BOOLEAN     NOT NULL DEFAULT FALSE,
    override_plate      VARCHAR(20),
    override_by         UUID,
    override_reason     TEXT,

    -- Evidence flag (khi anti-theft hoáº·c suspicious)
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

COMMENT ON COLUMN ai_scan_logs.confidence_score IS '< 70%: há»‡ thá»‘ng yÃªu cáº§u Staff xÃ¡c nháº­n hoáº·c override';
COMMENT ON COLUMN ai_scan_logs.match_score       IS 'So sÃ¡nh fingerprint check-in vs check-out. < 70% â†’ is_suspicious = TRUE';
COMMENT ON COLUMN ai_scan_logs.etc_read_device_id IS 'ETC Ä‘áº§u Ä‘á»c táº¡i cá»•ng ghi nháº­n. So sÃ¡nh vá»›i etc_devices.etc_device_id Ä‘Ã£ Ä‘Äƒng kÃ½.';
COMMENT ON COLUMN ai_scan_logs.is_evidence       IS 'TRUE: áº£nh nÃ y lÃ  báº±ng chá»©ng anti-theft / suspicious â€” giá»¯ lÃ¢u hÆ¡n 30 ngÃ y thÃ´ng thÆ°á»ng';

-- ================================================================
-- 15. Báº¢NG: parking_violations
-- Vi pháº¡m Ä‘á»— sai chá»— Ä‘iá»‡n (Flow 7)
-- ================================================================
CREATE TABLE parking_violations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL,
    slot_id         UUID        NOT NULL,
    violation_type  VARCHAR(25) NOT NULL CHECK (violation_type IN ('EV_ZONE_MISUSE','DISABLED_ZONE_MISUSE','DOUBLE_PARKING')),
    photo_urls      JSON        NOT NULL,           -- ["url1","url2"] â€” Staff chá»¥p
    detected_by     UUID        NOT NULL,           -- Staff ID
    is_first_violation BOOLEAN  NOT NULL DEFAULT TRUE, -- TRUE: chá»‰ cáº£nh bÃ¡o; FALSE: pháº¡t tiá»n
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

COMMENT ON COLUMN parking_violations.is_first_violation IS 'TRUE: hiá»ƒn thá»‹ cáº£nh bÃ¡o nháº¹ trÃªn LED, khÃ´ng pháº¡t tiá»n. FALSE (tá»« láº§n 2): cá»™ng penalty vÃ o transaction.';

-- ================================================================
-- 16. Báº¢NG: audit_logs
-- Nháº­t kÃ½ há»‡ thá»‘ng â€” má»i thao tÃ¡c nháº¡y cáº£m
-- ================================================================
CREATE TABLE audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,                           -- NULL náº¿u system tá»± Ä‘á»™ng
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
    entity_type     VARCHAR(50),                    -- TÃªn báº£ng bá»‹ tÃ¡c Ä‘á»™ng
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

COMMENT ON TABLE audit_logs IS 'Retention: 2 nÄƒm. Má»i thao tÃ¡c nháº¡y cáº£m pháº£i ghi log â€” bao gá»“m má»Ÿ cá»•ng tá»« xa, override AI, phÃª duyá»‡t VIP, anti-theft events.';

-- ================================================================
-- SEED DATA
-- ================================================================

-- Admin máº·c Ä‘á»‹nh
INSERT INTO users (username, password_hash, full_name, email, role)
VALUES ('admin', '$2b$10$CHANGE_THIS_HASH_IN_PRODUCTION', 'System Administrator', 'admin@parking.com', 'ADMIN');

-- Zones máº·c Ä‘á»‹nh
INSERT INTO zones (zone_name, zone_code, allowed_sizes, total_slots, has_ev_charger) VALUES
    ('Táº§ng B2 â€” Xe Táº£i & Van',       'B2', '["VAN_TRUCK"]',             50,  FALSE),
    ('Táº§ng B1 â€” Xe 16 Chá»—',          'B1', '["MINIBUS_16"]',            30,  FALSE),
    ('Táº§ng F1 â€” Xe Gia ÄÃ¬nh',         'F1', '["FAMILY_CAR"]',            100, FALSE),
    ('Táº§ng F2 â€” Xe Gia ÄÃ¬nh (EV)',    'F2', '["FAMILY_CAR"]',            80,  TRUE);

-- Biá»ƒu giÃ¡ máº·c Ä‘á»‹nh
INSERT INTO pricing_rules (vehicle_type, first_hour_fee, additional_hour_fee, max_daily_fee, lost_card_penalty, ev_violation_penalty, effective_from) VALUES
    ('FAMILY_CAR',  15000, 10000, 100000, 50000, 20000, CURRENT_DATE),
    ('MINIBUS_16',  20000, 15000, 150000, 50000, 30000, CURRENT_DATE),
    ('VAN_TRUCK',   25000, 20000, 200000, 50000, 30000, CURRENT_DATE);

-- 50 tháº» táº¡m máº·c Ä‘á»‹nh
DO $$
DECLARE i INT;
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO cards (card_code, status)
        VALUES (LPAD(i::TEXT, 6, '0'), 'AVAILABLE');
    END LOOP;
END $$;

-- ================================================================
-- VIEWS Há»®U ÃCH
-- ================================================================

-- View: Xe Ä‘ang trong bÃ£i
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

-- View: Doanh thu theo ngÃ y
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

-- View: Tháº» sáºµn sÃ ng nháº£
CREATE OR REPLACE VIEW v_available_cards AS
SELECT id, card_code FROM cards WHERE status = 'AVAILABLE' ORDER BY card_code;

-- View: Xe VIP sáº¯p háº¿t háº¡n (3 ngÃ y)
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
-- FUNCTION: TÃ­nh phÃ­ gá»­i xe tá»± Ä‘á»™ng
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
        RAISE EXCEPTION 'KhÃ´ng tÃ¬m tháº¥y biá»ƒu giÃ¡ cho loáº¡i xe: %', p_vehicle_size;
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
-- BUSINESS LOGIC NOTES (TÃ³m táº¯t nghiá»‡p vá»¥ quan trá»ng)
-- ================================================================

/*
=== [REVISED] FLOW 3 â€” CONGESTION RELIEF (Giáº£i tá»a káº¹t xe) ===
Thiáº¿t káº¿ má»›i: Xe vÃ£ng lai ra ÄÃšNG LÃ€N VÃƒNG LAI sau khi staff thu tiá»n di Ä‘á»™ng.
KhÃ´ng chuyá»ƒn sang lÃ n VIP Ä‘á»ƒ trÃ¡nh di chuyá»ƒn chá»“ng chÃ©o.

Quy trÃ¬nh:
1. Staff cáº§m Ä‘iá»‡n thoáº¡i Ä‘i bá»™ dá»c hÃ ng xe vÃ£ng lai Ä‘ang chá»
2. Thu tiá»n di Ä‘á»™ng â†’ INSERT transactions (is_mobile_checkout=TRUE)
3. UPDATE parking_sessions SET session_status='PASSED_CONFIRMED'
4. Xe vÃ£ng lai tiáº¿n lÃªn cá»•ng ra cá»§a ÄÃšNG lÃ n vÃ£ng lai cá»§a mÃ¬nh
5. Staff táº¡i bá»‘t: quáº¹t tháº» â†’ há»‡ thá»‘ng tháº¥y PASSED_CONFIRMED â†’ hiá»ƒn thá»‹ "ÄÃƒ THANH TOÃN"
6. Staff báº¥m xÃ¡c nháº­n â†’ má»Ÿ barrier â†’ thu tháº» táº¡m
(KhÃ´ng cáº§n tráº£ tiá»n thÃªm táº¡i cá»•ng vÃ¬ Ä‘Ã£ thu di Ä‘á»™ng)

=== VIP DUAL-AUTH (ETC + License Plate) ===
Cá»•ng vÃ o/ra VIP pháº£i pass Äá»’NG THá»œI:
1. AI Camera: license_plate khá»›p vá»›i VIP trong DB + session ACTIVE
2. ETC Reader: etc_device_id khá»›p vá»›i etc_devices cá»§a xe

Xe chÆ°a cÃ³ ETC tháº­t â†’ DÃ¡n PARKING_TAG sticker (etc_devices.device_type='PARKING_TAG')
â†’ Quáº§y ngoáº¡i lá»‡ (EXCEPTION_COUNTER) xá»­ lÃ½ Ä‘Äƒng kÃ½ sticker khi xe vÃ o láº§n Ä‘áº§u.

=== VEHICLE SWAP ATTACK PREVENTION ===
Khi VIP checkout:
- Check 1: Session ACTIVE mandatory (khÃ´ng cÃ³ session = REJECT)
- Check 2: Time threshold (< 10 phÃºt = is_suspicious + HOLD)
- Check 3: Color RGB match (diff > 30 = is_suspicious + HOLD)
- Check 4: Body shape match (mismatch = is_suspicious + HOLD)
- Check 5: ETC match (mismatch = is_suspicious + HOLD)
Khi is_suspicious = TRUE: Barrier HOLD, mÃ n hÃ¬nh Staff hiá»ƒn thá»‹ 2 áº£nh side-by-side Ä‘á»ƒ visual confirm

=== FLOW 7 â€” EV ZONE VIOLATION ===
- is_first_violation = TRUE â†’ vehicles.violation_count = 0: chá»‰ cáº£nh bÃ¡o LED
- is_first_violation = FALSE â†’ violation_count > 0: cá»™ng ev_violation_penalty vÃ o transaction
- PhÃ¡t hiá»‡n: parking_slots.slot_type='EV' + sensor=OCCUPIED + charger is_charging=FALSE > 15ph
*/

-- END OF SCHEMA v3.0 FINAL
```
