# VISION_SCOPE.md - Dự án SWP391

## 1. Business Requirements
- Quản lý hiệu quả luồng xe vào/ra tòa nhà gửi xe nhiều tầng, giảm ùn tắc tại cổng và tối ưu công suất sử dụng chỗ đỗ.
- Theo dõi trạng thái slot theo tòa nhà, tầng, khu vực và loại phương tiện; hỗ trợ đánh dấu trạng thái: trống, đang sử dụng, đặt trước, bảo trì.
- Ghi nhận Parking Session (check-in/check-out) với thông tin: biển số, thời gian vào/ra, loại phương tiện, phí, và trạng thái thanh toán.
- Hệ thống phân quyền người dùng: Admin (quản trị), Manager (báo cáo & cấu hình), Parking Staff (vận hành), Driver (tra cứu & thanh toán).
- Hỗ trợ chính sách tính phí linh hoạt (theo thời gian, theo loại xe, khung giờ) và xuất báo cáo doanh thu để đối soát.
- Cơ chế xử lý ngoại lệ: mất vé, sai biển số, quá giờ, gửi sai khu vực, và công cụ đối soát doanh thu.
- Báo cáo vận hành thời gian thực và cảnh báo khi tỷ lệ lấp đầy đạt ngưỡng cao.

## 2. Project Scope

### In scope
- Quản lý danh mục: tòa nhà gửi xe, tầng, khu vực, slot, loại phương tiện, bảng giá.
- CRUD cho slot đỗ, phân tầng theo loại phương tiện và trạng thái slot.
- Tạo/đóng Parking Session (check-in/check-out) và tính toán phí cơ bản.
- Giao diện vận hành cho Parking Staff để xử lý vào/ra và ngoại lệ (mất vé, xác minh biển số).
- Hệ thống quản lý người dùng và phân quyền (Admin, Manager, Staff, Driver).
- Báo cáo cơ bản: lượt vào/ra, doanh thu theo ngày/tuần/tháng, tỷ lệ lấp đầy theo tầng/khu vực.
- API REST cơ bản cho tích hợp front-end và cổng thanh toán; xuất CSV/PDF cho đối soát.

### Optional / Extended scope
- Tích hợp phần cứng/IoT để cập nhật trạng thái slot (cảm biến chỗ trống) theo thời gian thực.
- Hệ thống phân bổ slot tự động dựa trên thuật toán ưu tiên (tầng, khoảng cách, loại xe, thời gian gửi).
- Hỗ trợ đặt chỗ trước (reservation) và xử lý hủy/đổi chỗ.
- Tích hợp thanh toán điện tử (VNPay, Stripe/PayPal) và cổng POS.
- Nhận diện biển số tự động (LPR) để tự động hóa check-in/check-out.
- Ứng dụng mobile cho lái xe: xem chỗ trống, đặt trước, thanh toán, nhận thông báo.
- Phân tích dữ liệu nâng cao: dự báo nhu cầu, dynamic pricing, báo cáo KPI nâng cao.

## 3. Limitations
- Chất lượng và độ chính xác phụ thuộc vào dữ liệu đầu vào (nhập liệu thủ công có thể gây sai lệch).
- Một số tính năng nâng cao (LPR, cảm biến IoT, cổng thanh toán) phụ thuộc phần cứng/hạ tầng và tích hợp bên thứ ba.
- Vấn đề pháp lý và quyền riêng tư liên quan đến camera/LPR cần xác minh trước khi triển khai.
- Hệ thống MVP được thiết kế cho quy mô vừa; mở rộng quy mô lớn yêu cầu kiến trúc phân tán và tối ưu thêm.
- Hoạt động trong môi trường lỗi mạng cần cơ chế cache/đồng bộ khi kết nối phục hồi.

_Tài liệu được sinh tự động theo quy tắc trong generic_auto_vision_scope.md._
