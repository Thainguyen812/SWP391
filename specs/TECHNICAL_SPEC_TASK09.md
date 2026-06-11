# ĐẶC TẢ KỸ THUẬT: TASK 9 - DRIVER PWA APP: MANDATORY DYNAMIC QR VIP SUBSCRIPTION & ANTI-THEFT SECURITY

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS

### 1.1. CRUD Matrix
- **Create:** Tạo hồ sơ `vip_subscriptions` mới; Khởi tạo bản ghi `vip_qr_identifiers` khi sinh mã QR động.
- **Read:** Xem trạng thái gói cước (ACTIVE/PENDING); Xem tiến trình đếm ngược của mã QR động.
- **Update:** Bật/tắt cờ khóa an toàn chống trộm (`is_locked`) trên bảng `parking_sessions`.

### 1.2. Data Fields
- `vip_subscriptions`: id, vehicle_id, subscription_type, start_date, end_date, status, document_photos, approved_by.
- `vip_qr_identifiers`: qr_token, purpose, expired_at.
- `parking_sessions`: is_locked.
- *(Đã loại bỏ hoàn toàn yêu cầu về thẻ/chip ETC đối với phương tiện).*

### 1.3. Business Rules
- **Luồng đăng ký vé tháng:** Driver bắt buộc phải upload đủ 3 ảnh minh chứng (Cà vẹt, CMND/CCCD, Ảnh thực tế đầu xe) lưu dưới dạng JSON `document_photos` và thực hiện thanh toán qua VNPAY Sandbox. Sau khi thanh toán thành công, trạng thái chuyển sang PENDING_APPROVAL chờ Manager duyệt.
- **Luồng sinh mã QR động (QR Widget):** App sinh mã QR kèm chuỗi Token mã hóa. Mã chỉ có hiệu lực đúng 5 phút (`expired_at = NOW() + 5 mins`) và chỉ được quét 1 lần (Single-use). Hết 5 phút tự động mờ đi và yêu cầu làm mới.
- **Cơ chế chống trộm (Anti-theft):** Khi tài xế gạt nút bật bảo vệ (`is_locked = TRUE`), nếu kẻ gian lấy cắp xe và cố tình chạy ra cổng, AI Camera quét trúng biển số sẽ lập tức: Đóng băng cứng Barie, kích hoạt còi hú tại bốt trực, đồng thời tự động đẩy Push Notification qua Firebase (FCM) báo động đỏ khẩn cấp về điện thoại chủ xe với độ trễ < 500ms.

### 1.4. RBAC
- **Driver:** Đăng ký gói cước, sinh mã QR động, bật/tắt chức năng chống trộm cho phương tiện của mình.
- **Manager:** Phê duyệt (Approve/Reject) hồ sơ đăng ký vé tháng dựa trên ảnh minh chứng.

## 2. FRONT-END SPECIFICATIONS (DRIVER PWA)
- **Màn hình Đăng ký:** Form upload file có preview ảnh, tích hợp SDK thanh toán.
- **Tab Thẻ Thành Viên (QR Widget):** Khu vực hiển thị mã QR cỡ lớn ở trung tâm, kèm thanh Progress Bar đếm ngược mượt mà từ `05:00` về `00:00`.
- **Nút gạt An ninh (Anti-theft Toggle):** Component dạng Switch ON/OFF nổi bật. Khi chuyển sang ON (Màu đỏ/Biểu tượng ổ khóa), UI hiện hiệu ứng radar bảo vệ.

## 3. BACK-END SPECIFICATIONS
- **POST /api/v1/driver/vip/register**
  - Payload: Thông tin xe, file ảnh, gói cước. $\rightarrow$ Tạo record PENDING_APPROVAL.
- **POST /api/v1/driver/qr/generate**
  - Payload: `{vehicle_id, purpose}` $\rightarrow$ Trả về `201 Created` kèm `{qr_token, expires_in_seconds: 300}`.
- **PUT /api/v1/driver/vehicle/lock**
  - Thực hiện gạt cờ `is_locked` sang TRUE/FALSE cho phiên gửi xe hiện tại.

## 4. ACCEPTANCE CRITERIA
- **Scenario 1 (Validation):** Given Driver điền form đăng ký, when không tải đủ 3 ảnh minh chứng (chỉ tải 1 hoặc 2), then form báo lỗi và nút Submit bị disable.
- **Scenario 2 (Anti-theft triggered):** Given xe đang có session ACTIVE và cờ `is_locked = TRUE`, when phương tiện xuất hiện tại cổng ra và bị camera nhận diện, then hệ thống chốt Barie và Driver nhận được Push Notification cảnh báo trên điện thoại ngay lập tức.
