# Skill Name: Generic Auto-Vision & Scope Generator

## 1. Metadata & Execution Mode
- **Type**: Universal Automated Requirements Analyzer
- **Target File Output**: `VISION_SCOPE.md`
- **Execution Mode**: 100% Non-interactive & Autonomous (Tự động hoàn toàn)
- **User Interaction**: Strictly Forbidden (Không dừng lại hỏi hay yêu cầu nhập liệu)

## 2. Dynamic Context & Variable Extraction (Tự động cấu hình hệ thống)
AI Agent bắt buộc phải tự động xác định các thông tin sau từ môi trường mà không được hỏi người dùng:
1. **[PROJECT_CODE]**: 
   - Tự động lấy tên của thư mục gốc hiện hành (Ví dụ: Thư mục tên là `SWP391` thì Project Code là `SWP391`, thư mục là `EXE201` thì Project Code là `EXE201`).
   - Nếu không đọc được tên thư mục, tự động quét file `package.json`, `pom.xml` hoặc cấu hình `.git` để lấy tên dự án.
2. **[PROJECT_DOMAIN]**:
   - Tự động đọc tiêu đề hoặc nội dung các file thô trong thư mục (như file `.xlsx`, `.txt`, `.md`) để nhận diện dự án đang làm về chủ đề gì (Ví dụ: Hệ thống quản lý bãi xe, Website bán hàng, App quản lý tài chính...).

## 3. Core Logic & Domain Alignment (Phân tích theo chủ đề động)
Dựa trên **[PROJECT_DOMAIN]** đã tự động nhận diện ở trên, AI sẽ tự động sinh ra nội dung phù hợp theo cấu trúc 3 lớp chuẩn mực dưới đây bằng **Tiếng Việt chuyên ngành**:

### Phần 1: Business Requirements (Yêu cầu Nghiệp vụ)
AI tự động trích xuất và tối ưu từ tài liệu đầu vào các mục tiêu sau:
- Mục tiêu tối ưu hóa vận hành cốt lõi của hệ thống đó.
- Luồng nghiệp vụ chính (luồng đi của dữ liệu/giao dịch chính).
- Khả năng quản lý, phân loại thực thể và phân quyền người dùng.
- Cơ chế xử lý lỗi/ngoại lệ đặc thù của domain đó.
- Định hướng tích hợp công nghệ thông minh (AI/Automation) phù hợp với chủ đề dự án.

### Phân 2: Project Scope (Phạm vi Dự án)
Tự động phân tách rạch ròi dựa trên tài liệu hiện có thành:
1. **In scope**: Toàn bộ các chức năng cốt lõi bắt buộc phải có để hệ thống chạy được cấu hình dưới dạng MVP (Core Features, CRUD danh mục, Giao dịch chính, Báo cáo cơ bản).
2. **Optional / Extended scope**: Các tính năng nâng cao, module mở rộng, tích hợp bên thứ ba hoặc các tính năng dự kiến phát triển ở giai đoạn sau.

### Phần 3: Limitations (Hạn chế hệ thống)
Tự động phân tích các rủi ro và giới hạn kỹ thuật:
- Sự phụ thuộc vào độ chính xác của dữ liệu đầu vào.
- Giới hạn về phần cứng, hạ tầng hoặc kết nối API bên thứ ba nếu có.
- Các quy tắc nghiệp vụ còn mập mờ cần làm rõ ở các sprint sau.

---

## 4. Output Template Format
AI bắt buộc phải ghi đè hoặc tạo mới file `VISION_SCOPE.md` tại thư mục gốc theo đúng format sau (Thay thế các chữ trong ngoặc vuông `[...]` bằng nội dung tương ứng của dự án đó):

```markdown
# VISION_SCOPE.md - Dự án [Điền PROJECT_CODE tự động]

## 1. Business Requirements
[AI tự động sinh từ 5-8 gạch đầu dòng phân tích sâu về yêu cầu nghiệp vụ vận hành của dự án hiện tại]

## 2. Project Scope

### In scope
[AI tự động liệt kê chi tiết các chức năng cốt lõi cần code của dự án]

### Optional / Extended scope
[AI tự động liệt kê các chức năng nâng cao/mở rộng của dự án]

## 3. Limitations
[AI tự động liệt kê các hạn chế, ràng buộc kỹ thuật của dự án]
\```