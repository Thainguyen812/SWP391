# Skill Name: Universal FR-to-Technical Spec Architecture Blueprint

## 1. Metadata & Execution Mode
- **Type**: Deep-Dive Technical & Architectural Specification Generator
- **Target File Output**: `TECHNICAL_SPEC_[FEATURE_NAME].md`
- **Role**: Expert Business Analyst & Senior Software Architect
- **Execution Mode**: 100% Non-interactive & Autonomous (Tự động hoàn toàn)
- **Language**: Vietnamese (Tiếng Việt chuyên ngành Kỹ thuật phần mềm)

## 2. Context & Input Processing
Khi người dùng yêu cầu phân tích một Chức năng/Yêu cầu cụ thể (Functional Requirement - FR) từ tài liệu hệ thống, AI Agent phải tự động áp dụng khung cấu trúc 4 giai đoạn dưới đây để sinh tài liệu bàn giao cho lập trình viên (FE & BE).

---

## 3. 4-Stage Core Transformation Logic

### 🔴 GIAI ĐOẠN 1: FUNCTIONAL & BUSINESS LOGIC ANALYSIS
AI phân tích sâu về logic nghiệp vụ của thực thể/tính năng:
- **Granular Operations (CRUD Matrix):** Bẻ nhỏ động từ cốt lõi (ví dụ: "Quản lý", "Xử lý") thành các hành động hệ thống rõ ràng: Khởi tạo (Create), Đọc/Xem (Read), Cập nhật (Update), Xóa/Vô hiệu hóa (Delete/Deactivate).
- **Data Dictionary / Fields:** Đề xuất toàn bộ thuộc tính dữ liệu bắt buộc cho thực thể này (Tên trường, Kiểu dữ liệu, Bắt buộc/Tùy chọn - Mandatory/Optional).
- **Business Rules & Constraints:** Định nghĩa luật nghiệp vụ cứng, quy tắc validate dữ liệu, điều kiện ràng buộc giữa các trường và luồng xử lý conditional workflow.
- **RBAC (Role-Based Access Control):** Chỉ rõ Role nào (Admin, Staff, Client...) được phép gọi hành động nào; xử lý kịch bản nếu truy cập trái phép.

### 🔵 GIAI ĐOẠN 2: FRONT-END SPECIFICATIONS (FE)
Đặc tả chi tiết giao diện và tương tác phía Client:
- **UI/UX Layout & Wireframe Concept:** Mô tả các màn hình, view, component hoặc hộp thoại modal cần thiết (Ví dụ: Dashboard widgets, Bảng dữ liệu Data tables, Form nhập liệu).
- **Components & Interactive Controls:** Liệt kê các nút chức năng, thanh tìm kiếm, bộ lọc thả xuống (multi-select dropdown), bộ chọn ngày (date picker), phân trang (pagination), cơ chế sắp xếp (sorting).
- **Client-Side Validation:** Các quy tắc bắt lỗi thời gian thực ngay trên UI (Regex định dạng, giới hạn ký tự, độ mạnh mật khẩu...) trước khi submit.
- **UX States:** Định nghĩa trạng thái giao diện khi chạy bất đồng bộ (Hiệu ứng loading skeletons, vô hiệu hóa nút bấm khi đang gửi data, thông báo Toast báo thành công/thất bại).

### 🟢 GIAI ĐOẠN 3: BACK-END SPECIFICATIONS (BE)
Đặc tả chi tiết kiến trúc dữ liệu và API:
- **Database Schema Design:** Thiết kế cấu trúc bảng quan hệ (hoặc NoSQL document model) gồm: Tên cột, Kiểu dữ liệu, Khóa chính (PK), Khóa ngoại (FK), Ràng buộc (Unique, Not Null).
- **RESTful API Contract:** Thiết kế các Endpoint phục vụ tính năng:
  - Phương thức HTTP & Đường dẫn (Method & Path).
  - Yêu cầu xác thực & Phân quyền (Authentication / Authorization).
  - Dữ liệu gửi lên: Request Payload (Cấu trúc JSON / Query parameters).
  - Dữ liệu trả về: Response Payload (JSON định dạng thành công 200/201).
- **Exception Handling & HTTP Status Codes:** Quy định cách Backend trả lỗi: `400 Bad Request` (Validate lỗi), `403 Forbidden` (Sai role), `404 Not Found`, `409 Conflict` và cấu trúc JSON của Error Body.

### 🟡 GIAI ĐOẠN 4: ACCEPTANCE CRITERIA (AC)
Thiết lập bộ tiêu chí nghiệm thu kiểm thử chuẩn BDD (Behavior-Driven Development):
- Bắt buộc viết dưới cấu trúc cấu trúc: **Given (Cho biết) — When (Khi) — Then (Thì)**.
- Sản sinh tối thiểu **2 kịch bản luồng chạy thành công (Happy Path)** và **2 kịch bản xử lý lỗi/ngoại lệ (Edge Case / Error Handling)**.

---

## 4. Output Template Format
AI viết đè hoặc xuất dữ liệu đặc tả kỹ thuật theo đúng cấu trúc tiêu đề lớn nhỏ sau:

```markdown
# ĐẶC TẢ KỸ THUẬT: [TÊN TÍNH NĂNG VIẾT HOA]

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. Granular Operations (CRUD Matrix)
### 1.2. Data Dictionary / Fields
### 1.3. Business Rules & Constraints
### 1.4. Role-Based Access Control (RBAC)

## 2. FRONT-END SPECIFICATIONS (FE)
### 2.1. UI/UX Layout & Wireframe Concept
### 2.2. Components & Interactive Controls
### 2.3. Client-Side Validation
### 2.4. UX States (Loading/Toast)

## 3. BACK-END SPECIFICATIONS (BE)
### 3.1. Database Schema Design
### 3.2. RESTful API Contract
### 3.3. Exception Handling & HTTP Status Codes

## 4. ACCEPTANCE CRITERIA (AC - BDD Format)
### 4.1. Happy Path Scenarios (Tối thiểu 2)
### 4.2. Edge Cases & Error Handling (Tối thiểu 2)