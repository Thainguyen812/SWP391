# Skill Name: Automated GitHub Project Task Provisioner

## 1. Metadata & Role Definition
- **Type**: Automated DevOps & Agile Tasks Synchronizer
- **Role**: Agile Project Manager & Release Engineer
- **Execution Mode**: 100% Non-interactive (Tự động hoàn toàn)
- **Target Platform**: GitHub Issues & GitHub Projects Board

## 2. Context & Environment Verification
Trước khi thực hiện, AI Agent bắt buộc phải đảm bảo:
- Thư mục hiện hành có kết nối Git Repository (`C:\SWP391`).
- Đã có file nguồn dữ liệu dữ liệu: `FUNCTIONAL_REQUIREMENTS.md` hoặc `srs.md`.

## 3. Parsing & Generation Logic
AI Agent sẽ tự động đọc bảng ma trận chức năng và thực hiện một chuỗi lệnh tự động sau:
1. **Trích xuất dữ liệu:** Duyệt qua từng dòng của bảng chức năng để lấy ra các trường: `Code` (Mã FR), `Actor` (Tác nhân), `Name` (Tên tính năng), `Functional Requirement` (Mô tả).
2. **Xử lý chuỗi tiêu đề:** Tạo tiêu đề Task theo chuẩn: `[Mã_FR] Tên_Tính_Năng` (Ví dụ: `[FR-004] Configure pricing rules`).
3. **Xử lý nội dung Task (Body):** Xây dựng phần mô tả chi tiết cho task gồm vai trò thực thi và điều kiện hệ thống phải đáp ứng.

## 4. Execution Directive (Chỉ thị gọi lệnh GitHub)
AI Agent sẽ tự động chạy ngầm lệnh gọi **GitHub CLI (`gh`)** để tạo các thẻ công việc trực tiếp lên kho chứa của nhóm mà không cần người dùng thao tác bằng tay:

```bash
gh issue create --title "[Code] Name" --body "**Actor:** Actor_Name\n\n**Requirement:** Detail_Text" --label "todo"