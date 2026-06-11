# ĐẶC TẢ KỸ THUẬT: TASK 11 - MANAGER DASHBOARD & VIP SUBSCRIPTION APPROVAL QUEUE

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- **Read:** Lấy danh sách hồ sơ đăng ký vé tháng VIP đang chờ duyệt (Trạng thái `PENDING_APPROVAL`).
- **Update:** Phê duyệt (Approve) hoặc Từ chối (Reject) hồ sơ đăng ký vé tháng.

### 1.2. Data Fields
- `vip_subscriptions`: status, approved_by, document_photos (chứa JSON URL 3 ảnh minh chứng), rejection_reason.
- `audit_logs`: Lưu vết thao tác hệ thống.

### 1.3. Business Rules
- Cấp quản lý (Manager) phải đối chiếu thủ công 3 ảnh minh chứng (Giấy đăng ký xe, CMND/CCCD, Ảnh đầu xe thực tế) do tài xế tải lên.
- Nếu Từ chối (Reject), bắt buộc phải nhập lý do (`rejection_reason`) để trả về cho PWA của tài xế.
- Mọi thao tác Approve/Reject đều phải tạo một bản ghi Audit Log để truy vết trách nhiệm.

### 1.4. RBAC
- Chỉ tài khoản có role `MANAGER` hoặc `ADMIN` mới có quyền truy cập API và thực hiện các thao tác phê duyệt này.

## 2. FRONT-END SPECIFICATIONS
- **Dashboard widgets:** Biểu đồ doanh thu (revenue chart), đồng hồ đo lượng xe đang chiếm dụng trong bãi (occupancy gauge).
- **VIP Approval Queue:** Lưới danh sách hồ sơ chờ duyệt. Khi click vào sẽ mở màn hình Chi tiết (Detail View) phóng to 3 ảnh minh chứng để dễ đối chiếu.
- Tích hợp 2 nút hành động: Approve (Xanh lá) và Reject (Đỏ - Mở modal yêu cầu nhập lý do từ chối).

## 3. BACK-END SPECIFICATIONS
- `GET /api/v1/manager/dashboard` -> Trả về các số liệu thống kê tổng hợp (aggregates) cho biểu đồ.
- `POST /api/v1/vip/{id}/approve` -> API Manager phê duyệt hồ sơ.
- `POST /api/v1/vip/{id}/reject` -> API Manager từ chối (Payload kèm `reason`).

## 4. ACCEPTANCE CRITERIA
- **Scenario 1 (Approve):** Given hồ sơ hợp lệ, when Manager bấm Approve, then trạng thái gói VIP chuyển thành `ACTIVE`, cập nhật `approved_by`, và hệ thống ghi nhận hành động vào `audit_logs`.
- **Scenario 2 (Reject):** Given hồ sơ thiếu ảnh nét, when Manager nhập lý do và bấm Reject, then trạng thái chuyển thành `REJECTED`, lưu lý do vào database để tài xế xem lại trên App.
