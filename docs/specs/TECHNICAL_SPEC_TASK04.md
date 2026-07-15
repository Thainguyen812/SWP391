# ĐẶC TẢ KỸ THUẬT: TASK 4 - SMART CHECK-IN API & STAFF GATE CONTROL TERMINAL

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS

### 1.1. CRUD Matrix
- **Create:** Khởi tạo bản ghi `parking_sessions` khi xe tiến vào bãi; Lưu vết ảnh chụp quét biển số vào `ai_scan_logs`.
- **Read:** Truy vấn trạng thái biển số xe (kiểm tra có đang ACTIVE trong bãi không, có thuộc danh sách đen không, có phải là thẻ VIP không); Đối soát bảng `vip_qr_identifiers` nếu dùng luồng QR Fallback.
- **Update:** Cập nhật tăng số lượng chỗ đã chiếm dụng (`current_occupied = current_occupied + 1`) trong bảng `zones`; Cập nhật cờ `is_used = TRUE` nếu tài xế sử dụng mã QR động để Check-in; Nhân viên ghi đè biển số (Override plate).

### 1.2. Data Fields
- `parking_sessions`: id, license_plate, vehicle_id, is_vip, assigned_zone_id, check_in_time, session_status, override_by_staff.
- `ai_scan_logs`: confidence_score, image_url, detected_plate.
- `vip_qr_identifiers`: qr_token, purpose, expired_at, is_used (Sử dụng cho luồng dự phòng).

### 1.3. Business Rules
- **Blacklist & Chống trùng lặp:** Hệ thống từ chối Check-in (Reject) nếu biển số xe nằm trong danh sách đen hoặc phương tiện đang có một phiên gửi xe `ACTIVE` trong bãi (Ngăn chặn lỗi 1 xe vào 2 lần).
- **Luồng VIP tự động (Auto-open):** Nếu AI Camera nhận diện biển số có độ tin cậy cao (`Confidence >= 70%`) và trùng khớp với hồ sơ VIP đang `ACTIVE`, hệ thống tự động khởi tạo phiên đỗ, điều hướng Zone và phát lệnh nhấc Barie mà không cần tương tác.
- **Luồng dự phòng mã QR động (Fallback QR Check-in):** Trong trường hợp AI Camera bị lỗi hoặc mờ biển số do thời tiết (`Confidence < 70%`), tài xế được yêu cầu quét mã QR Động Vào Bãi (`purpose = 'CHECK_IN'`) sinh ra từ App Driver tại đầu đọc cổng. Hệ thống kiểm tra mã QR phải còn hiệu lực (< 5 phút) và chưa từng sử dụng (`is_used = FALSE`) thì mới khởi tạo phiên gửi và xả trạm.
- **Phân bổ Zone:** Hệ thống tự động tra cứu kích cỡ xe để gán phương tiện vào `assigned_zone_id` phù hợp.

### 1.4. RBAC
- **Staff:** Được phép kiểm tra và ghi đè (Override) biển số xe khi AI nhận diện sai lệch thông qua giao diện bốt trực. Mọi hành động can thiệp ghi đè bắt buộc lưu vết bất biến vào `audit_logs`.
- **Manager/Admin:** Có quyền thay đổi cấu hình Allowed Sizes (Loại xe cho phép) của các Zone đỗ xe.

## 2. FRONT-END SPECIFICATIONS
- **Staff Gate UI (PC Web Terminal):** Màn hình giám sát trực quan chia luồng (Live feed camera). Hiển thị hình ảnh biển số AI vừa chụp được kèm điểm tin cậy (Confidence Score).
- Cung cấp các nút Accept/Reject và Modal nhập liệu để Staff thực hiện Override biển số bằng tay nếu AI đọc sai.
- Tích hợp nút bấm "Mở cổng cưỡng bức" (Remote Open) dành cho các trường hợp xử lý ngoại lệ khẩn cấp.

## 3. BACK-END SPECIFICATIONS
- **POST /api/v1/parking/check-in/ai** - Payload: `{plate, vehicle_type, image_url, camera_id, confidence_score}` 
  - Response: `201 Created {session_id, assigned_zone_code}`
- **POST /api/v1/parking/check-in/qr** (Luồng Fallback cho VIP)
  - Payload: `{qr_token, camera_id}`
  - Response: `201 Created {session_id, assigned_zone_code}`
- **POST /api/v1/gate/override** - API bảo mật (Secured action) yêu cầu quyền Staff để ghi đè sửa biển.
- **Errors Handling:** Trả về mã lỗi `409 Conflict` nếu xe đã có session ACTIVE; `403 Forbidden` nếu biển số bị Blacklist; `400 Bad Request` nếu mã QR hết hạn/đã dùng.

## 4. ACCEPTANCE CRITERIA
- **Scenario 1 (AI Auto VIP):** Given biển số xe VIP hợp lệ và ảnh rõ nét (Confidence > 70%), when AI module gửi payload, then hệ thống tự tạo session ACTIVE, trừ 1 slot trống ở Zone tương ứng và mở Barie thành công.
- **Scenario 2 (Fallback QR):** Given AI Camera quét biển số mờ (< 70%), barie giữ nguyên trạng thái đóng, when tài xế đưa mã QR động Check-in hợp lệ vào đầu quét, then hệ thống giải mã, tạo phiên đỗ và mở Barie thành công.
- **Scenario 3 (Staff Override):** Given AI quét sai ký tự (VD: 8 thành B), when Staff nhập tay sửa lại biển số chính xác trên UI, then hệ thống cập nhật đúng biển số vào `parking_sessions` và ghi nhận một bản ghi 'OVERRIDE_AI' vào `audit_logs` đầy đủ thông tin.
