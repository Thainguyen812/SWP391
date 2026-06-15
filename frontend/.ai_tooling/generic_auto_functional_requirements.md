# Skill Name: Universal Functional Requirements Table Generator

## 1. Metadata & Execution Mode
- **Type**: Automated Requirements to Functional Matrix Transformer
- **Target File Output**: `FUNCTIONAL_REQUIREMENTS.md`
- **Role**: Chief Business Analyst (BA) & Systems Architect
- **Execution Mode**: 100% Non-interactive & Autonomous (Tự động hoàn toàn)
- **User Interaction**: Strictly Forbidden (Không dừng lại hỏi người dùng)

## 2. Context & Input Scanning
AI Agent sẽ tự động quét thư mục hiện hành để đọc hiểu file đặc tả hệ thống (Ưu tiên: `srs.md` -> `requirements.md` -> `VISION_SCOPE.md`).
- Tự động nhận diện tất cả các **Actors (Tác nhân)** tham gia vào hệ thống.
- Tự động bóc tách các luồng nghiệp vụ cốt lõi (Main Flows) để chuyển đổi thành các yêu cầu chức năng (Functional Requirements - FR).

## 3. Transformation & Syntax Rules
Khi chuyển đổi các yêu cầu từ file đặc tả sang bảng chức năng, AI bắt buộc phải tuân thủ nghiêm ngặt các quy tắc định dạng sau:
1. **Mã hiệu (Code):** Đánh số tăng dần theo định dạng `FR-001`, `FR-002`, `FR-003`... cho đến hết hệ thống. Nhóm các mã hiệu theo thứ tự phân vai Actor từ cao xuống thấp (Admin -> Manager -> Staff -> End User).
2. **Cấu trúc câu (Syntax Standard):** Toàn bộ nội dung tại cột *Functional Requirement* bắt buộc phải viết bằng tiếng Anh và bắt đầu bằng cấu trúc kỹ thuật trang trọng: 
   `The system shall [verb/actions]...` (Ví dụ: *The system shall allow Managers to configure pricing rules...*)
3. **Tính bao phủ (Completeness):** Phải vét cạn toàn bộ các tính năng từ CRUD tài khoản, phân quyền RBAC, lưu nhật ký Audit Logs, cho đến các luồng xử lý ngoại lệ (mất thẻ, khóa xe, cảnh báo vi phạm) đã được mô tả trong file SRS đầu vào.

---

## 4. Output Template Format
AI phải xuất thẳng kết quả ra file `FUNCTIONAL_REQUIREMENTS.md` nằm tại thư mục gốc của dự án theo đúng cấu trúc bảng Markdown 4 cột dưới đây:

```markdown
# FUNCTIONAL REQUIREMENTS MATRIX - PROJECT: [AI tự điền tên thư mục viết hoa]

| Code | Actor | Name | Functional Requirement |
| :--- | :--- | :--- | :--- |
| FR-001 | System Admin | Manage system accounts | The system shall provide CRUD operations for system accounts (Admin, Manager, Staff) and enforce role-based access control. |
| FR-002 | System Admin | Audit logging | The system shall record and make available immutable audit logs for all sensitive actions. |
| [AI TỰ SINH] | [AI TỰ SINH] | [AI TỰ SINH] | The system shall [AI TỰ BIÊN DỊCH CHUẨN SHALL...] |