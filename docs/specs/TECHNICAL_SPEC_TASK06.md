# ĐẶC TẢ KỸ THUẬT: TASK 6 - MFA SECURITY VIA DYNAMIC QR CODE READER

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS

### 1.1. CRUD Matrix
- **Read:** Đối soát chuỗi token giải mã từ đầu đọc QR với bảng `vip_qr_identifiers` để xác thực cổng ra.
- **Update:** - Cập nhật cờ `is_used = TRUE` cho mã QR ngay sau khi quét thành công (cơ chế Single-use).
  - Cập nhật trường `validated_qr_id` và chuyển đổi `session_status` sang `COMPLETED` trong bảng `parking_sessions`.

### 1.2. Data Fields
- `vip_qr_identifiers`: qr_token, expired_at, is_used, purpose.
- `parking_sessions`: validated_qr_id, is_locked, is_suspicious, session_status.
- `ai_scan_logs`: match_score, color_diff, shape_match.

### 1.3. Business Rules
- **Luồng MFA làn VIP xuất bãi:** Hệ thống chỉ tự động kích nổ lệnh mở Barie khi thỏa mãn ĐỒNG THỜI 4 điều kiện:
  1. Biển số xe được AI nhận diện thuộc hồ sơ VIP `ACTIVE`.
  2. Tồn tại phiên gửi xe trạng thái `ACTIVE` trong bãi.
  3. Trạng thái cờ chống trộm của tài xế đang gạt tắt (`is_locked == FALSE`).
  4. Mã QR động quét tại bốt hợp lệ, đúng tài khoản chủ xe, còn hạn (`NOW() <= expired_at`) và chưa từng sử dụng (`is_used == FALSE`).
- **Ràng buộc Timeout 1 phút (60 giây):** Khi xe VIP tiến vào làn ra, AI Camera quét thành công biển số nhưng nếu tài xế không thực hiện quét mã QR xuất bãi trong vòng 60 giây $\rightarrow$ Barie giữ nguyên trạng thái khóa cứng, bảng LED báo đỏ "BẮT BUỘC QUÉT QR XUẤT BÃI TRÊN APP DRIVER", đồng thời phát báo động khẩn cấp sang Staff.
- **Chống tráo đổi xe (Vehicle Swap Attack):** Khi checkout làn VIP, hệ thống so khớp Fingerprint ngoại quan xe. Nếu độ lệch phổ màu `color_diff > 30` hoặc sai lệch dáng xe `shape_match == FALSE` $\rightarrow$ Tự động bật cờ `is_suspicious = TRUE`, đóng băng Barie và yêu cầu nhân viên đối soát.

### 1.4. RBAC
- **Staff:** Được phép can thiệp ghi đè (Override) giải phóng xe khi hệ thống báo cờ nghi vấn `is_suspicious == TRUE` sau khi đã đối soát bằng mắt thường. Mọi thao tác đều phải lưu vết vào `audit_logs`.

## 2. FRONT-END SPECIFICATIONS
- **UI Làn VIP (Staff PC):** Hiển thị trạng thái MATCH (Xanh) / MISMATCH (Đỏ) khi thực hiện giải mã QR. 
- **Giao diện Anti-Swap:** Khi cờ `is_suspicious` được bật, màn hình lập tức hiển thị Modal đối chiếu ảnh Side-by-side (Ảnh chụp lúc vào vs Ảnh chụp lúc ra) để nhân viên trực kiểm tra ngoại quan thủ công kèm nút "Xác nhận Override".

## 3. BACK-END SPECIFICATIONS
- **POST /api/v1/parking/verify-exit-qr**
  - **Payload:** `{session_id, detected_plate, qr_token}`
  - **Response (200 OK):** `{authenticated: true, action: "TRIGGER_BARRIER_OPEN"}`
- **Logic xử lý API:** Kiểm tra token, đánh dấu `is_used = TRUE`, update session, check cờ `is_locked`, kiểm tra timeout 60s và gọi lệnh trigger Barie phần cứng thông qua Mock API.

## 4. ACCEPTANCE CRITERIA
- **Scenario 1 (Pass MFA):** Given xe VIP có session ACTIVE và không khóa, when tài xế quét mã QR động hợp lệ trong thời gian quy định, then hệ thống ghi nhận `is_used = TRUE`, đóng session và Barie mở tự động.
- **Scenario 2 (Timeout/Mismatch):** Given xe VIP vào làn ra, when vượt quá 60 giây không quét QR hoặc quét sai tài khoản, then hệ thống từ chối mở cửa, log sự kiện lỗi và bật cảnh báo đỏ yêu cầu manual review.
- **Scenario 3 (Anti-Swap Trigger):** Given mã QR hợp lệ, when AI phát hiện xe lúc ra là xe tải nhưng xe lúc check-in là xe con (shape_match = false), then hệ thống khóa Barie, bật `is_suspicious = TRUE` và hiện popup side-by-side cho nhân viên.
