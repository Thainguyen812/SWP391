# Skill Name: Universal User Story & Functional Spec Generator

## 1. Metadata & Execution Mode
- **Type**: Automated Agile Requirements Transformer
- **Target File Output**: `SU26SWP08-user-stories.md` (Tự động cập nhật theo context dự án)
- **Execution Mode**: 100% Non-interactive & Autonomous (Tự động hoàn toàn)
- **User Interaction**: Strictly Forbidden (Không dừng lại hỏi người dùng)

## 2. Context & Input Scanning
AI Agent sẽ tự động quét thư mục hiện hành để tìm và đọc nội dung từ các file đặc tả yêu cầu hiện có theo thứ tự ưu tiên: `SRS.md` -> `requirements.md` -> `VISION_SCOPE.md`. 
- Tự động bóc tách **[PROJECT_CODE]** từ tên thư mục gốc (Ví dụ: `SWP391`, `SWP2026`).
- Tự động nhận diện danh sách các **Actors (Tác nhân)** và các **Phân hệ chức năng chính (Epics/Features)**.

## 3. Transformation Logic & Format Rules
Với mỗi phân hệ chức năng tìm thấy trong tài liệu đặc tả, AI bắt buộc phải chuyển đổi và sinh ra các **User Stories** theo đúng cấu trúc Agile chuẩn mực bằng **Tiếng Việt chuyên ngành**:

### Tiêu chuẩn định dạng một User Story:
Mỗi User Story phải bao gồm đầy đủ 3 thành phần cốt lõi:
1. **Mã định danh (ID):** Định dạng `US-[Số_Thứ_Tự]` (Ví dụ: `US-01`, `US-02`).
2. **Nội dung Story (Format bắt buộc):**
   - **Với vai trò là:** [Tên Actor/Vai trò hệ thống]
   - **Tôi muốn:** [Hành động/Tính năng cụ thể cần thực hiện]
   - **Để:** [Giá trị nghiệp vụ/Mục đích mang lại]
3. **Tiêu chí nghiệm thu (Acceptance Criteria - AC):** Sinh từ 2-4 gạch đầu dòng bắt đầu bằng định dạng `Given... When... Then...` hoặc mô tả điều kiện đúng/sai rõ ràng để kiểm thử (Kiểm tra tính đúng đắn, xử lý ngoại lệ, ràng buộc bảo mật).

---

## 4. Output Template Format
AI phải xuất thẳng kết quả ra file markdown mới với cấu trúc phân cấp trực quan như sau:

```markdown
# DANH SÁCH USER STORIES - DỰ ÁN [Điền PROJECT_CODE tự động]

## NHÓM CHỨC NĂNG/EPIC: [Tên Phân Hệ Chức Năng 1]

### US-01: [Tên ngắn gọn của tính năng]
- **Với vai trò là:** ...
- **Tôi muốn:** ...
- **Để:** ...
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - **AC 1 (Luồng chính):** Given... When... Then...
  - **AC 2 (Ràng buộc/Nại lệ):** ...

### US-02: [Tên ngắn gọn của tính năng tiếp theo]
...

## NHÓM CHỨC NĂNG/EPIC: [Tên Phân Hệ Chức Năng 2]
...
\```