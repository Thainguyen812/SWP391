# ĐẶC TẢ KỸ THUẬT: TASK 1 - CHECK IN TRONG THƯ VIỆN

## 1. MÔ TẢ CHUNG
Task 1: Cung cấp chức năng "check in" cho thư viện — ghi nhận khi người dùng (hoặc sách) được trả/đi vào kho/nhà sách.

## 2. PHÂN TÍCH CHỨC NĂNG
### 2.1. CRUD Matrix
- Create: Ghi nhận một lần check-in mới (POST /api/checkin)
- Read: Lấy danh sách check-in hoặc chi tiết một check-in (GET /api/checkin, GET /api/checkin/{id})
- Update: Sửa thông tin check-in khi cần (PUT /api/checkin/{id})
- Delete: Hủy bản ghi check-in (DELETE /api/checkin/{id})

### 2.2. Data Dictionary / Fields
- `userId`: ID người dùng thực hiện check-in
- `itemId`: ID đối tượng được check-in (sách, thiết bị, v.v.)
- `timestamp`: thời gian check-in
- `location`: vị trí check-in (khu vực/ tầng/ kệ)

### 2.3. Business Rules
- Chỉ nhân viên/thủ thư hoặc người dùng đã xác thực mới có quyền tạo check-in.
- Mỗi check-in phải có `userId`, `itemId` và `timestamp` hợp lệ.

## 3. GIAO DIỆN & API
- Backend endpoint tối thiểu: `POST /api/checkin`, `GET /api/checkin`, `GET /api/checkin/{id}`.
- Frontend: form đơn giản để nhập `itemId`, chọn `location` và xác nhận check-in.

## 4. ACCEPTANCE CRITERIA
- Khi gửi `POST /api/checkin` với dữ liệu hợp lệ, server trả về 201 và bản ghi mới.
- Danh sách check-in có thể được truy vấn và hiển thị trong giao diện.

## 5. GHI CHÚ KỸ THUẬT
- Lưu trữ bảng `checkins` trong DB với các trường nêu ở mục 2.2.
- Thực hiện kiểm tra quyền (RBAC) cho các endpoint CRUD.

