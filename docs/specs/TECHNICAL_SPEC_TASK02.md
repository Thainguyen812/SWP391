# ĐẶC TẢ KỸ THUẬT: TASK 2 - FLYWAY DB MIGRATION & BASELINE SETUP

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS

### 1.1. CRUD Matrix & Database Entities Overview

Hệ thống sử dụng các bảng sau (15 bảng) — mô tả mục đích ngắn gọn:
- **users**: Quản lý dữ liệu liên quan đến tài khoản và phân quyền.
- **refresh_tokens**: Quản lý dữ liệu liên quan đến phiên đăng nhập (JWT).
- **vehicles**: Quản lý dữ liệu liên quan đến phương tiện và thông số ngoại quan (Fingerprint).
- **vip_qr_identifiers**: Quản lý dữ liệu mã QR động chu kỳ 5 phút phục vụ xác thực 2 lớp (MFA).
- **cards**: Quản lý kho thẻ tạm vật lý dành cho khách vãng lai.
- **zones**: Quản lý cấu hình phân khu tầng đỗ xe.
- **parking_slots**: Quản lý dữ liệu ô đỗ xe và trạng thái cảm biến.
- **parking_sessions**: Quản lý vòng đời cốt lõi của các phiên đỗ xe trong bãi.
- **vip_subscriptions**: Quản lý dữ liệu gói cước vé tháng VIP của khách hàng.
- **transactions**: Quản lý dữ liệu hóa đơn thanh toán tài chính.
- **pricing_rules**: Quản lý biểu phí gửi xe và phí phạt.
- **blacklisted_cards**: Quản lý danh sách thẻ tạm bị khóa/mất.
- **ai_scan_logs**: Quản lý lịch sử quét nhận diện của hệ thống AI Camera.
- **parking_violations**: Quản lý dữ liệu vi phạm vị trí đỗ (VD: xe xăng đỗ khu EV).
- **audit_logs**: Quản lý nhật ký hệ thống bất biến (Audit Trail).

### 1.2. Data Dictionary / Fields

#### users
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| username | VARCHAR(50) | NOT NULL UNIQUE | Tên đăng nhập |
| password_hash | VARCHAR(255) | NOT NULL | BCRYPT hash (bcrypt cost >=10) |
| full_name | VARCHAR(100) | NOT NULL | Họ và tên |
| email | VARCHAR(100) | NOT NULL UNIQUE | Email người dùng, unique |
| phone | VARCHAR(15) | | Số điện thoại |
| role | VARCHAR(10) | NOT NULL | Quyền: ADMIN/MANAGER/STAFF/DRIVER |
| status | VARCHAR(10) | NOT NULL DEFAULT 'ACTIVE' | Trạng thái tài khoản |
| fcm_token | VARCHAR(255) | | Firebase Cloud Messaging Token cho Push Notification |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp cập nhật cuối |
| last_login_at | TIMESTAMP | | Thời điểm login cuối |

#### refresh_tokens
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| user_id | UUID | NOT NULL | Tham chiếu tới users |
| token | UUID | NOT NULL UNIQUE DEFAULT gen_random_uuid() | Mã refresh token |
| expires_at | TIMESTAMP | NOT NULL | Hết hạn sau 7 ngày |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |

#### vehicles
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| owner_id | UUID | NOT NULL | Tham chiếu tới chủ sở hữu (users) |
| license_plate | VARCHAR(20) | NOT NULL UNIQUE | Biển số xe (VD: 51A-12345) |
| vehicle_size | VARCHAR(15) | NOT NULL | Phân loại: VAN_TRUCK/MINIBUS_16/FAMILY_CAR |
| color | VARCHAR(30) | | Tên màu xe (VD: "Đen") |
| color_rgb | VARCHAR(7) | | Mã màu Hex chính xác (VD: "#1C1C1C") |
| body_shape | VARCHAR(20) | | Dáng xe (SEDAN/SUV/VAN...) |
| brand | VARCHAR(50) | | Hãng xe |
| registration_doc_url | VARCHAR(255) | | URL ảnh Cà vẹt (S3/MinIO) |
| registration_photo_url | VARCHAR(255) | | Ảnh xe thực tế góc trước (đăng ký VIP) |
| violation_count | INT | NOT NULL DEFAULT 0 | Số lần vi phạm EV zone |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE | Trạng thái hoạt động |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp cập nhật cuối |

#### vip_qr_identifiers
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| vehicle_id | UUID | NOT NULL | Tham chiếu tới vehicles |
| qr_token | VARCHAR(255) | NOT NULL UNIQUE | Chuỗi mã hóa sinh từ App Driver |
| purpose | VARCHAR(15) | NOT NULL | Mục đích: CHECK_IN hoặc CHECK_OUT |
| expired_at | TIMESTAMP | NOT NULL | Thời gian hết hạn (NOW + 5 phút) |
| is_used | BOOLEAN | NOT NULL DEFAULT FALSE | Cờ trạng thái sử dụng (Single-use) |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |

#### cards
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| card_code | VARCHAR(20) | NOT NULL UNIQUE | Mã in trên thẻ RFID vãng lai |
| status | VARCHAR(15) | NOT NULL DEFAULT 'AVAILABLE' | Trạng thái (AVAILABLE/IN_USE/LOST/BLACKLISTED) |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp cập nhật cuối |

#### zones
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| zone_name | VARCHAR(80) | NOT NULL | Tên khu vực đỗ |
| zone_code | VARCHAR(10) | NOT NULL UNIQUE | Mã khu vực đỗ (VD: "B1", "F1") |
| allowed_sizes | TEXT | NOT NULL | JSON Array: ["FAMILY_CAR","MINIBUS_16"] |
| total_slots | INT | NOT NULL CHECK (total_slots > 0) | Tổng số ô đỗ |
| current_occupied | INT | NOT NULL DEFAULT 0 | Số ô đỗ đang bị chiếm dụng |
| has_ev_charger | BOOLEAN | NOT NULL DEFAULT FALSE | Có khu vực sạc điện (Flow 7) |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE | Trạng thái phân khu |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp cập nhật cuối |

#### parking_slots
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| zone_id | UUID | NOT NULL | Tham chiếu tới zones |
| slot_number | VARCHAR(10) | NOT NULL | Mã ô đỗ (VD: "A01", "B15") |
| slot_type | VARCHAR(10) | NOT NULL DEFAULT 'NORMAL' | NORMAL/EV/DISABLED |
| slot_status | VARCHAR(15) | NOT NULL DEFAULT 'AVAILABLE' | AVAILABLE/OCCUPIED/MAINTENANCE |
| sensor_mock_id | VARCHAR(50) | | ID cảm biến giả lập |
| ev_charger_id | VARCHAR(50) | | ID trụ sạc mock (nếu slot_type = 'EV') |
| last_updated | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Cập nhật cuối |

#### parking_sessions
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| license_plate | VARCHAR(20) | NOT NULL | Biển số xe thực tế khi vào bãi |
| is_vip | BOOLEAN | NOT NULL DEFAULT FALSE | Cờ xác định phân loại VIP/Vãng lai |
| vehicle_id | UUID | | Tham chiếu xe hệ thống (NULL nếu vãng lai) |
| card_id | UUID | | Tham chiếu thẻ tạm (NULL nếu VIP) |
| validated_qr_id | UUID | | Tham chiếu ID mã QR động đã xác thực |
| assigned_zone_id | UUID | NOT NULL | Phân khu được điều hướng |
| parked_slot_id | UUID | | Ô đỗ cụ thể |
| check_in_time | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Giờ vào bãi |
| check_out_time | TIMESTAMP | | Giờ xuất bãi (NULL khi còn ACTIVE) |
| session_status | VARCHAR(25) | NOT NULL DEFAULT 'ACTIVE' | Trạng thái phiên (ACTIVE/COMPLETED/...) |
| is_locked | BOOLEAN | NOT NULL DEFAULT FALSE | Cờ khóa xe chống trộm từ App Driver |
| is_suspicious | BOOLEAN | NOT NULL DEFAULT FALSE | Cờ nghi vấn tráo đổi xe (Anti-swap) |
| suspicious_reason | VARCHAR(100) | | Lý do nghi vấn |
| override_by_staff | UUID | | Nhân viên ghi đè lỗi AI |
| override_reason | TEXT | | Lý do ghi đè |
| mobile_checkout_staff_id | UUID | | Staff thu tiền di động |
| mobile_checkout_location | VARCHAR(100) | | Tọa độ GPS "lat,lng" |
| mobile_checkout_at | TIMESTAMP | | Thời gian thu tiền di động |
| mobile_checkout_photo | VARCHAR(255) | | Ảnh minh chứng thu tiền |
| lost_card_proof_photos | JSON | | Ảnh khai báo mất thẻ ["url_cmnd","url_cavet"] |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp cập nhật cuối |

#### vip_subscriptions
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| vehicle_id | UUID | NOT NULL | Tham chiếu tới vehicles |
| subscription_type | VARCHAR(10) | NOT NULL | MONTHLY/QUARTERLY/YEARLY |
| start_date | DATE | NOT NULL | Ngày bắt đầu |
| end_date | DATE | NOT NULL | Ngày hết hạn |
| status | VARCHAR(25) | NOT NULL DEFAULT 'PENDING' | PENDING_APPROVAL/ACTIVE/EXPIRED/REJECTED |
| document_photos | JSON | | {"ca_vet":"url","cmnd":"url"} |
| approved_by | UUID | | Manager duyệt |
| approved_at | TIMESTAMP | | Thời điểm duyệt |
| rejection_reason | TEXT | | Lý do từ chối |
| fee_amount | DECIMAL(10,2) | NOT NULL | Số tiền thanh toán |
| payment_method | VARCHAR(20) | NOT NULL | VNPAY_SANDBOX/BANK_TRANSFER |
| payment_reference | VARCHAR(100) | | Mã giao dịch Gateway |
| payment_status | VARCHAR(10) | NOT NULL DEFAULT 'PENDING' | PENDING/SUCCESS/FAILED |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |
| updated_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp cập nhật cuối |

#### transactions
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| session_id | UUID | NOT NULL UNIQUE | 1 session -> 1 transaction |
| parking_fee | DECIMAL(10,2) | NOT NULL DEFAULT 0 | Phí gửi xe |
| lost_card_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 0 | Phí phạt mất thẻ |
| violation_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 0 | Phí phạt đỗ sai khu EV |
| total_amount | DECIMAL(10,2) | NOT NULL | Tổng tiền thanh toán |
| payment_method | VARCHAR(20) | NOT NULL | CASH/VNPAY_SANDBOX/QR_BANK |
| payment_status | VARCHAR(10) | NOT NULL DEFAULT 'PENDING' | PENDING/SUCCESS/FAILED |
| payment_reference | VARCHAR(100) | | Mã giao dịch |
| processed_by | UUID | NOT NULL | Staff ID xử lý |
| is_mobile_checkout | BOOLEAN | NOT NULL DEFAULT FALSE | Check thanh toán di động |
| mobile_gps_location | VARCHAR(100) | | GPS Staff thu tiền |
| mobile_photo_proof | VARCHAR(255) | | Ảnh biên lai |
| receipt_url | VARCHAR(255) | | URL hóa đơn điện tử |
| processed_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Thời điểm thanh toán |

#### pricing_rules
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| vehicle_type | VARCHAR(15) | NOT NULL | Phân loại xe |
| first_hour_fee | DECIMAL(10,2) | NOT NULL | Phí giờ đầu |
| additional_hour_fee | DECIMAL(10,2) | NOT NULL | Phí giờ tiếp theo |
| max_daily_fee | DECIMAL(10,2) | NOT NULL | Phí trần tối đa/ngày |
| lost_card_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 50000 | Phí phạt mất thẻ |
| ev_violation_penalty | DECIMAL(10,2) | NOT NULL DEFAULT 20000 | Phí phạt đỗ sai khu điện |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE | Trạng thái hiệu lực |
| effective_from | DATE | NOT NULL | Ngày bắt đầu áp dụng |
| effective_to | DATE | | Ngày kết thúc |
| created_by | UUID | | Người tạo (Manager) |

#### blacklisted_cards
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| card_id | UUID | NOT NULL UNIQUE | Tham chiếu cards |
| session_id | UUID | | Tham chiếu session phát sinh |
| reason | VARCHAR(15) | NOT NULL | LOST/STOLEN/DAMAGED |
| blacklisted_by | UUID | NOT NULL | Nhân viên thao tác |
| blacklisted_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Thời gian đưa vào blacklist |
| notes | TEXT | | Ghi chú |

#### ai_scan_logs
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| session_id | UUID | | Tham chiếu session |
| scan_location | VARCHAR(25) | NOT NULL | MAIN_ENTRANCE/VIP_EXIT/CASUAL_EXIT |
| scan_type | VARCHAR(25) | NOT NULL DEFAULT 'STANDARD' | STANDARD/CHECK_IN_FP/CHECK_OUT_FP |
| camera_id | VARCHAR(50) | NOT NULL | Mã Camera |
| image_url | VARCHAR(255) | NOT NULL | Ảnh chụp (lưu S3 30 ngày) |
| detected_plate | VARCHAR(20) | NOT NULL | Biển số xe AI quét được |
| confidence_score | DECIMAL(5,2) | NOT NULL | Điểm tin cậy (0-100%) |
| detected_vehicle_type | VARCHAR(15) | | Loại xe AI dự đoán |
| detected_color | VARCHAR(30) | | Tên màu AI dự đoán |
| detected_color_rgb | VARCHAR(7) | | Mã màu RGB AI dự đoán |
| detected_shape | VARCHAR(20) | | Dáng xe AI dự đoán |
| match_score | DECIMAL(5,2) | | % Khớp fingerprint so với lúc vào |
| color_diff | DECIMAL(5,2) | | Độ lệch phổ màu RGB |
| shape_match | BOOLEAN | | Xác nhận khớp dáng xe |
| scanned_qr_token | VARCHAR(255) | | Chuỗi token QR giải mã từ đầu quét |
| qr_match | BOOLEAN | | Kết quả kiểm tra QR chính chủ |
| is_overridden | BOOLEAN | NOT NULL DEFAULT FALSE | Cờ nhân viên ghi đè |
| override_plate | VARCHAR(20) | | Biển số ghi đè thủ công |
| override_by | UUID | | Nhân viên ghi đè |
| override_reason | TEXT | | Lý do ghi đè |
| is_evidence | BOOLEAN | NOT NULL DEFAULT FALSE | Cờ bảo lưu vĩnh viễn tệp ảnh (Bằng chứng) |
| scanned_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Thời gian quét |

#### parking_violations
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| session_id | UUID | NOT NULL | Tham chiếu session |
| slot_id | UUID | NOT NULL | Tham chiếu ô đỗ vi phạm |
| violation_type | VARCHAR(25) | NOT NULL | Loại vi phạm (EV_ZONE_MISUSE) |
| photo_urls | JSON | NOT NULL | Ảnh bằng chứng do Staff chụp |
| detected_by | UUID | NOT NULL | Staff phát hiện |
| is_first_violation | BOOLEAN | NOT NULL DEFAULT TRUE | Lần đầu cảnh báo, từ lần 2 phạt tiền |
| penalty_applied | BOOLEAN | NOT NULL DEFAULT FALSE | Đã áp dụng phạt |
| penalty_amount | DECIMAL(10,2) | NOT NULL DEFAULT 0 | Số tiền phạt |
| notes | TEXT | | Ghi chú vi phạm |
| detected_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Thời gian lập biên bản |

#### audit_logs
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Primary identifier (UUID) |
| user_id | UUID | | NULL nếu hệ thống tự động |
| action_type | VARCHAR(40) | NOT NULL | Thao tác (LOGIN/OVERRIDE_AI/REMOTE_OPEN...) |
| entity_type | VARCHAR(50) | | Tên bảng bị tác động |
| entity_id | UUID | | ID bị tác động |
| old_value | JSON | | Dữ liệu cũ |
| new_value | JSON | | Dữ liệu mới cập nhật |
| ip_address | VARCHAR(45) | | IP thao tác |
| user_agent | VARCHAR(255) | | Thiết bị thao tác |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Timestamp tạo record |

### 1.3. Business Rules & Constraints

- **Flow 3 (Congestion relief — Revised):** Staff thu tiền di động dưới hầm sẽ thiết lập `transaction.is_mobile_checkout=TRUE` và `session_status=PASSED_CONFIRMED`; phương tiện bắt buộc phải di chuyển ra bằng ĐÚNG LÀN VÃNG LAI. Hệ thống cấm điều hướng chéo sang làn VIP để tránh xung đột hạ tầng.
- **MFA Security Làn VIP (Xác thực mã QR động):** Cổng vào/ra VIP yêu cầu 2 lớp xác thực bảo mật. Làn xuất bãi bắt buộc phải khớp ĐỒNG THỜI: (1) AI Camera nhận diện đúng biển số có hồ sơ VIP ACTIVE và (2) Quét mã QR động (Single-use, chu kỳ sống 5 phút) sinh từ App Driver. 
- **Timeout Rule:** Tại làn xuất bãi VIP, nếu AI đã quét trúng biển số mà tài xế không quét QR trong vòng **1 phút (60 giây)**, hệ thống khóa cứng Barie, báo LED đỏ và gửi cảnh báo về PC của Staff.
- **Vehicle Swap Prevention (Chống tráo xe):** Tại lúc checkout làn VIP, hệ thống so khớp Fingerprint ngoại quan (Màu `color_rgb`, Dáng `body_shape`) và Token QR giải mã. Nếu độ lệch phổ màu > 30 hoặc sai dáng/sai QR, hệ thống bật `is_suspicious=TRUE`, giữ Barie và hiển thị ảnh Side-by-side trên màn hình Staff để duyệt thủ công.
- **EV Zone Violation:** Ghi nhận vi phạm tại bảng `parking_violations`; lần đầu (`is_first_violation=TRUE`) chỉ nhắc nhở qua LED, các lần vi phạm tiếp theo tự động cộng thêm phí phạt vào `transactions` và tăng biến đếm `vehicles.violation_count`.

### 1.4. Role-Based Access Control (RBAC)

| Table | ADMIN | MANAGER | STAFF | DRIVER |
|---|---:|---:|---:|---:|
| users | CRUD | CRU | R/U | R (own) |
| refresh_tokens | CRUD | CRU | R/U | R (own) |
| vehicles | CRUD | CRU | R/U | R (own) |
| vip_qr_identifiers | CRUD | CRU | R/U | C/R (own) |
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

## 2. FRONT-END SPECIFICATIONS (FE)

### 2.1. UI/UX Layout & Wireframe Concept
- Admin/Manager Dashboard: Tổng quan widgets (phiên đang hoạt động, doanh thu trong ngày, lượng chỗ trống, danh sách xe VIP sắp hết hạn).

### 2.2. Components & Interactive Controls
- Data tables cho users, sessions, transactions hỗ trợ server-side pagination và bộ lọc (filters).

### 2.3. Client-Side Validation
- Regex kiểm tra định dạng biển số xe, cờ required fields, kiểm tra email hợp lệ, giới hạn numeric ranges cho bảng giá.

### 2.4. UX States (Loading/Toast)
- Loading skeleton hiển thị tạm tại các dashboard widgets, toast notifications thông báo thành công/lỗi, Confirmation Modal trước khi thực thi các thao tác nhạy cảm (Xóa, Blacklist).

## 3. BACK-END SPECIFICATIONS (BE)

### 3.1. Database Schema Design
- Xem Mục 1.2 để nắm chi tiết các trường dữ liệu. Cấu trúc yêu cầu sử dụng UUID làm Primary Key (PK), thiết lập Foreign Key (FK) nghiêm ngặt và đánh chỉ mục (Index) như mô tả trong migration script.

### 3.2. Backend Data Source Configuration (application.properties example)

```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:parkingdb}
spring.datasource.username=${DB_USER:parking_user}
spring.datasource.password=${DB_PASS:change_me}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL95Dialect
spring.jpa.hibernate.ddl-auto=none
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
