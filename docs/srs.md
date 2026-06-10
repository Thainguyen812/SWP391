# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS SPECIFICATION)
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ TÒA NHÀ GỬI XE (PARKING BUILDING MANAGEMENT SYSTEM)

---

## 1. BỐI CẢNH THỰC HIỆN ĐỀ TÀI

Cùng với sự phát triển của hạ tầng giao thông, số lượng xe ô tô cá nhân tại Việt Nam đang tăng trưởng mạnh mẽ. Tuy nhiên, các bãi đỗ xe truyền thống tại các tòa nhà văn phòng, trung tâm thương mại hiện nay vẫn chủ yếu vận hành dựa trên các phương thức thủ công, bộc lộ nhiều hạn chế.

### 1.1. Các vấn đề hiện tại
* **Ùn tắc giao thông cổng vào/ra:** Quy trình dừng xe để quẹt thẻ vật lý, kiểm tra hóa đơn và thu tiền thủ công tạo ra tình trạng ùn ứ kéo dài, đặc biệt trong các khung giờ cao điểm.  
* **Hỗn loạn trong quy hoạch vị trí:** Không có sự phân luồng hệ thống theo chủng loại phương tiện (xe tải nhỏ, xe 16 chỗ, xe gia đình), dẫn đến chiếm dụng không gian sai quy định và lãng phí hạ tầng.  
* **Rủi ro vận hành và mất mát vật tư:** Khách hàng làm mất thẻ gửi xe dẫn đến tra cứu đối soát thủ công, dễ gây tranh chấp và tăng nguy cơ thất thoát doanh thu hoặc mất cắp phương tiện.  

### 1.2. Giải pháp đề xuất
Nhóm đề xuất phát triển **Hệ thống Quản lý Bãi đỗ xe Ô tô Thông minh (Smart Car Parking Management System)** — giải pháp **THUẦN PHẦN MỀM** quản lý, ứng dụng AI giả lập (Mock API) để nhận diện biển số và phân loại kích thước xe, phân bổ quyền truy cập vào các tầng đỗ (Zone) chuyên biệt.  

> 💡 **Điểm đột phá về nghiệp vụ:**
> * **Khách Thành Viên (VIP):** Không cần thẻ vật lý — hệ thống áp dụng cơ chế xác thực hai lớp (MFA) tự động bằng cách kết hợp AI Camera nhận diện biển số và đầu đọc công nghệ định danh phương tiện ETC (ePass/VETC) quốc gia, loại bỏ hoàn toàn mã QR dự phòng để nâng cao tính bảo mật và chống tráo biển số tuyệt đối.
> * **Khách vãng lai:** Vẫn dùng Thẻ Tạm vật lý tại làn vãng lai riêng biệt, không bắt buộc phải xác thực ETC, quy trình đơn giản và Staff hỗ trợ thu hồi thẻ tại cổng ra.  
> * **Tích hợp luồng xử lý kẹt xe vãng lai linh hoạt:** Xử lý qua thiết bị cầm tay di động (Mobile Web App) dưới hầm, thanh toán xong khách di chuyển ra làn vãng lai chỉ cần nộp lại thẻ mà không cần chồng chéo làn xe.  
> * **Quy trình đối chiếu giấy tờ bảo mật:** Áp dụng cơ chế an ninh chặt chẽ khi mất thẻ, mang lại mô hình quản lý bãi xe an toàn và hiện đại.  

---

## 2. SCOPE — PHẠM VI DỰ ÁN

### 2.1. Phạm vi dự án (Project Scope)
* **In-Scope (Thuần phần mềm quản lý):** Hệ thống tập trung chuyên biệt vào việc quản lý phần mềm điều hành phương tiện là **Ô tô (từ 4 đến 16 chỗ, xe tải nhỏ)**, không bao gồm xe máy. Xây dựng các thuật toán logic Backend, quản lý cơ sở dữ liệu quan hệ (MySQL), thiết kế hệ thống RESTful API, và xây dựng giao diện hiển thị phía Client (ReactJS). Tích hợp Mock API (giả lập dữ liệu) các tín hiệu từ hệ thống camera AI, đầu đọc RFID ETC giả lập, cổng thanh toán Sandbox và các lệnh đóng/mở thanh chắn kỹ thuật số.  
* **Out-of-Scope (Nằm ngoài phạm vi):** Không chịu trách nhiệm lắp đặt, vận hành hay lập trình nhúng phần cứng cơ khí Barie, mạng lưới cảm biến siêu âm vật lý tại từng ô đỗ, hay các thiết bị đọc thẻ vật lý chuyên dụng ngoài đời thực. Toàn bộ phần cứng được mô phỏng hoàn toàn bằng dữ liệu truyền nhận thông qua RESTful API.  

### 2.2. Context Diagram — Sơ đồ Ngữ cảnh
Do dự án là thuần phần mềm, các thiết bị phần cứng được xem như các Mô-đun giao tiếp dữ liệu đầu vào/đầu ra giả lập (*External Data Modules*) thông qua RESTful API sạch.  

#### A. Core System
* **Parking Building Management System:** Thực thi các hàm API xử lý nghiệp vụ, quản lý trạng thái phiên gửi xe, tính toán biểu phí, điều phối luồng dữ liệu giải tỏa kẹt xe và đẩy dữ liệu thống kê Analytics lên Dashboard.  

#### B. External Actors (Con người)
| Actor | Interface | Mô tả tương tác |
| :--- | :--- | :--- |
| **Admin** | Web Admin | Quản lý tài khoản, cấu hình RBAC, xem Audit Logs. |
| **Manager** | Web Dashboard | Duyệt VIP, cấu hình giá, xem doanh thu, mở cổng từ xa. |
| **Staff** | Web (PC + Mobile) | Giám sát, thu tiền, override AI, xử lý mất thẻ & kẹt xe. |
| **Driver VIP** | Mobile Web/App | Đăng ký VIP (bắt buộc nhập mã định danh ETC), bật khóa xe an toàn. |
| **Driver Vãng lai**| Không trực tiếp | Lấy thẻ tạm khi vào, trả thẻ + tiền khi ra (qua làn vãng lai). |

#### C. External Systems (Hệ thống bên ngoài)
| External System | Loại | Luồng dữ liệu chính |
| :--- | :--- | :--- |
| **Mock AI Camera Module** | Hardware Mock | Camera $\rightarrow$ System: biển số, loại xe, màu xe, ảnh URL. |
| **Mock ETC Reader Module** | Hardware Mock | Đầu đọc RFID $\rightarrow$ System: Quét mã định danh ETC (RFID EPC Code) tại làn VIP. |
| **Mock Barrier Controller**| Hardware Mock | System $\rightarrow$ Barrier: lệnh mở/đóng; Barrier $\rightarrow$ System: trạng thái. |
| **Mock Card Dispenser** | Hardware Mock | System $\rightarrow$ Máy: lệnh nhả thẻ + gán zone; Máy $\rightarrow$ System: tồn kho. |
| **Mock LED Display** | Hardware Mock | System $\rightarrow$ LED: số tiền, thông báo điều hướng, cảnh báo đỏ. |
| **Payment Gateway Sandbox**| 3rd Party | System $\rightarrow$ GW: yêu cầu thanh toán; GW $\rightarrow$ System: Webhook callback. |
| **Notification Service (FCM)**| 3rd Party | System $\rightarrow$ FCM: Push notification cho Driver Thành Viên (Anti-theft). |
| **Object Storage (MinIO/S3)**| Infrastructure | System $\rightarrow$ Storage: ảnh AI Camera, CMND, Cà vẹt, vi phạm. |

---

## 3. MAIN FLOWS — SWIMLANE DIAGRAM

Hệ thống gồm 7 luồng nghiệp vụ chính chia làm 2 giai đoạn. Mọi thiết bị phần cứng được giả lập qua Mock API — hệ thống chỉ gửi/nhận JSON qua RESTful endpoint.  

### GIAI ĐOẠN 1: TÍNH NĂNG CỐT LÕI

#### Flow 1: Vào bãi & Định hướng phân tầng (Smart Check-in & Floor Allocation)
1. **Tài xế:** Lái xe tiếp cận vạch dừng tại cổng vào chính (có 2 làn tách biệt: Làn Vãng lai và Làn VIP tự động).
2. **Cảm biến làn:** AI Camera nhận diện biển số, phân loại kích cỡ dáng xe (`TRUCK/VAN`, `VAN_16`, `CAR_4`), màu xe. Riêng tại làn VIP, đầu đọc ETC đồng thời quét mã định danh tag ký số của phương tiện.  
3. **Backend System:** Kiểm tra Blacklist $\rightarrow$ Phân luồng logic xử lý:  
   * **Vãng lai:** Gán zone theo kích cỡ xe $\rightarrow$ Gửi lệnh nhả Thẻ Tạm (*Mock Card Dispenser*) $\rightarrow$ Mở Barie. Làn này không đọc mã ETC.  
   * **VIP (Xác thực 2 lớp):** Tra DB thấy biển số ACTIVE VÀ mã định danh ETC trùng khớp 100% $\rightarrow$ Tự động gán zone từ cấu hình xe $\rightarrow$ Mở Barie không cần thẻ vật lý.
   * **VIP lỗi nhận diện:** Nếu hệ thống AI hoặc đầu đọc lỗi, Staff nhập tay biển số (Override) $\rightarrow$ Hệ thống bắt buộc đối soát mã ETC thủ công hoặc kiểm tra thông tin chính chủ $\rightarrow$ Mở Barie.  
4. **Hệ thống:** Khởi tạo `ParkingSession`. Hiển thị tầng đỗ tối ưu phù hợp loại xe lên LED. Mở Barie. Cập nhật chỗ đỗ trống của Zone tương ứng (-1).  
5. **Lưu ý bảo mật:** Thành viên phải có mã định danh ETC hợp lệ dán cố định trên xe mới được duyệt hồ sơ trực tuyến, ngăn chặn triệt để kịch bản làm giả hoặc tráo đổi vỏ biển số vật lý.

#### Flow 2: Ra cổng & Thanh toán (Main Exit Check-out)
Hệ thống tách biệt hoàn toàn 2 làn xử lý độc lập tại cổng ra:

* **Kịch bản A — Làn Thành Viên VIP (Tự động hóa không dừng 2 lớp)**
  1. **Lái xe ra làn VIP:** Xe tiếp cận làn ra Thành Viên VIP riêng biệt.
  2. **Xác thực 2 lớp:** AI Camera quét biển số đồng thời đầu đọc ETC quét mã chip trên xe. Backend kiểm tra ĐỒNG THỜI 4 điều kiện:
     * (1) Biển số thuộc Thành Viên VIP ACTIVE trong DB.  
     * (2) Mã ETC quét được trùng khớp mã ETC đăng ký của xe đó.
     * (3) Có session ACTIVE (xe đang trong bãi, chưa check-out).  
     * (4) `is_locked == FALSE` (xe không ở trạng thái khóa chống trộm).  
     * $\rightarrow$ *Nếu TẤT CẢ đều hợp lệ:* Tự động mở Barie, đóng session.  
  3. **Màn hình Staff:** Hiển thị `"MATCH — VIP EXIT"` để Staff giám sát trực quan. Không cần thao tác chuột. Phí giao dịch hiển thị bằng 0đ. Loại bỏ hoàn toàn mã QR động tại làn này.  

* **Kịch bản B — Làn Vãng lai (Staff trực xử lý)**
  1. **Tiếp cận làn:** Lái xe vào làn Vãng lai, đưa Thẻ Tạm vật lý cho Staff trực bốt. Làn này không yêu cầu đọc ETC.  
  2. **Kiểm tra phí:** Staff quẹt thẻ/nhập mã thẻ vào hệ thống. Backend tính phí tự động dựa trên block giờ gửi + bảng giá cấu hình. Bảng LED hiển thị số tiền + QR thanh toán tĩnh.  
  3. **Thanh toán:** Tài xế trả tiền mặt hoặc thực hiện quét mã QR ngân hàng.  
  4. **Cho xe ra:** Staff thu lại Thẻ Tạm vào hộp lưu trữ $\rightarrow$ Bấm `"Xác nhận thu tiền"` $\rightarrow$ Hệ thống đóng session (`COMPLETED`), giải phóng slot trống, nhấc Barie giải phóng xe.  

#### Flow 3: Xử lý Kẹt xe Giờ cao điểm vãng lai (Basement Congestion Relief)
1. **Kích hoạt:** Manager/Staff phát hiện ùn ứ kéo dài tại cổng ra vãng lai $\rightarrow$ Bấm nút `"Kích hoạt Giải tỏa cao điểm"` trên hệ thống.  
2. **Tiếp cận:** Staff cầm thiết bị di động (đăng nhập Web App Staff) đi bộ xuống hầm tiếp cận từng đầu xe vãng lai đang xếp hàng chờ.  
3. **Thanh toán di động:** Staff dùng camera điện thoại quét biển số xe $\rightarrow$ Hệ thống tính tiền $\rightarrow$ Khách trả tiền mặt hoặc quét mã QR trên điện thoại Staff $\rightarrow$ Staff bấm `"Xác nhận thanh toán lưu động"`. Hệ thống ghi nhận GPS + timestamp để kiểm toán. Staff KHÔNG thu hồi Thẻ Tạm tại bước này, trả lại thẻ cho khách giữ.  
4. **Cập nhật trạng thái:** Backend ghi nhận giao dịch, cập nhật trạng thái session của xe vãng lai đó thành `PASSED_CONFIRMED` và chuyển trạng thái hóa đơn sang `PAID`.
5. **Xuất bãi:** Xe di chuyển tiếp cận cổng ra của Làn Vãng Lai (không đi sang làn VIP để tránh chồng chéo luồng xe). Tài xế đưa Thẻ Tạm cho Staff tại bốt. Staff quẹt thẻ, hệ thống phát hiện trạng thái `PASSED_CONFIRMED == TRUE` $\rightarrow$ Tự động nhấc Barie lập tức mà không thu tiền lần hai. Staff thu lại thẻ tạm nhập hộp.

---

### GIAI ĐOẠN 2: TÍNH NĂNG NÂNG CAO

#### Flow 4: Xử lý Mất thẻ bảo mật kép (Lost Card Handling)
1. **Khai báo:** Tài xế ra bốt cổng vãng lai, thông báo mất Thẻ Tạm với nhân viên.  
2. **Quét biển số:** AI Camera quét biển số xe đang đứng tại bốt (Ví dụ: 51A-11111).  
3. **Đối chiếu trực quan:** Staff yêu cầu tài xế xuất trình CMND/CCCD + Cà vẹt xe. Staff chụp ảnh giấy tờ để lưu hệ thống. Hệ thống hiển thị ảnh AI chụp lúc vào (`ai_check_in_image`) để Staff đối chiếu kiểu dáng, màu sắc thực tế.  
4. **Tra cứu hệ thống:** Staff mở tab `"Xử lý mất thẻ"` trên Desktop Web $\rightarrow$ Nhập biển số $\rightarrow$ Bấm Tìm kiếm.  
5. **Phạt thu:** Backend truy vết session ACTIVE của xe $\rightarrow$ Tính tổng phí gửi tích lũy + Phí phạt mất thẻ cấu hình. Tự động đưa mã `card_id` cũ vào danh sách đen `blacklisted_cards`.  
6. **Giải phóng xe:** Staff thu tiền hiển thị $\rightarrow$ Bấm `"Xác nhận đóng phiên mất thẻ"` $\rightarrow$ Hệ thống đóng phiên, mở Barie giải phóng xe.  
7. **Trường hợp xe thuê:** Nếu không có Cà vẹt xe (xe thuê/xe doanh nghiệp): Staff gọi Hotline cho Manager. Manager kiểm tra camera từ xa, xác minh câu hỏi bảo mật (giờ vào, tầng đỗ) $\rightarrow$ Manager bấm duyệt mở từ xa trên hệ thống Web Admin.  

#### Flow 5: Đăng ký & Quản lý Thành Viên VIP (VIP Subscription with Mandatory ETC)
1. **Điền thông tin:** Tài xế truy cập Web/App Driver $\rightarrow$ `"Đăng ký Vé tháng"`. Điền biển số, chọn kích cỡ phương tiện và bắt buộc nhập mã định danh thẻ định danh ETC (quy định bắt buộc từ cơ quan quản lý giao thông quốc gia). Hệ thống hiển thị thông báo: *"Mã ETC là bắt buộc để kích hoạt xác thực an ninh hai lớp làn VIP"*.  
2. **Tải tài liệu:** Tài xế tải lên ảnh Cà vẹt, CMND/CCCD và ảnh thực tế của xe.  
3. **OCR & Thanh toán:** Bộ lọc OCR Mock kiểm tra tính đồng nhất của biển số xe trên giấy tờ. Tài xế tiến hành thực hiện thanh toán gói cước qua cổng VNPAY Sandbox.  
4. **Phê duyệt:** Sau khi Webhook trả về giao dịch thành công, hồ sơ chuyển sang trạng thái `PENDING_APPROVAL`. Manager kiểm tra tính hợp lệ của mã ETC và ảnh đối chiếu $\rightarrow$ Bấm `"Duyệt"` $\rightarrow$ Kích hoạt trạng thái VIP sang `ACTIVE`.  
5. **Kích hoạt:** Xe VIP chính thức được cấu hình nhận diện không dừng qua 2 lớp (MFA: Plate + ETC) tại làn VIP tự động, loại bỏ hoàn toàn các widget liên quan đến mã QR.

#### Flow 6: Khóa xe an toàn Chống trộm (Anti-theft Security)
1. **Kích hoạt khóa:** Tài xế sau khi đỗ xe xong dưới hầm $\rightarrow$ Mở App Driver $\rightarrow$ Bật nút `"Khóa xe an toàn"` $\rightarrow$ Hệ thống cập nhật trường `is_locked = TRUE`.  
2. **Đột nhập:** Kẻ gian có hành vi phá khóa cơ học, lái xe tiếp cận làn xuất bãi.
3. **Chặn cứng:** Cho dù camera quét đúng biển số và đầu đọc nhận đúng mã định danh ETC, Backend phát hiện cờ `is_locked == TRUE` $\rightarrow$ Phát lệnh đóng băng Barie, hiển thị cảnh báo Đỏ khẩn cấp lên PC bốt trực, hú còi báo động đồng thời đẩy Push Notification khẩn cấp về điện thoại chủ xe.  
4. **Giải quyết:** Staff giữ phương tiện, yêu cầu người lái tắt chế độ khóa trên App chính chủ để đổi trạng thái `is_locked = FALSE` mới cho phép thông xe.  

#### Flow 7: Cảnh báo Đỗ sai vị trí Xăng/Điện (Post-audit Violation Detection)
* **Phát hiện vi phạm:** Mạng lưới cảm biến ô đỗ báo trạng thái OCCUPIED, nhưng API kết nối trụ sạc điện trả dữ liệu "Không thực hiện sạc" liên tục vượt quá mốc 15 phút $\rightarrow$ Hệ thống kích hoạt cảnh báo Vàng trên màn hình giám sát của Staff.  
* **Ghi nhận:** Staff đi tuần tra khu vực sạc, chụp ảnh phương tiện vi phạm và bấm `"Ghi nhận vi phạm"` trên ứng dụng Web di động gắn với mã hiệu ô đỗ.  
* **Xử lý lần 1:** Hệ thống ghi nhận lịch sử, chỉ hiển thị dòng văn bản nhắc nhở trên bảng LED bốt trực khi xe xuất bãi.  
* **Xử lý lần 2 trở đi:** Kể từ lần vi phạm thứ hai trở đi, Backend tự động thực hiện cấu hình cộng thêm khoản phí phạt phụ thu vi phạm vào tổng hóa đơn giao dịch thanh toán khi xe ra bãi, bắt buộc phải hoàn tất đóng phí mới cho phép thông xe.  

---

## 4. ACTORS & FEATURES

### System Admin (Quản trị viên)
* CRUD tài khoản hệ thống (Admin, Manager, Staff).  
* Cấu hình phân quyền RBAC chi tiết cho từng nhóm tài khoản.  
* Tra cứu hệ thống nhật ký hành động Audit Logs bảo mật bất biến.  
* Giám sát trạng thái sức khỏe hệ thống (DB, Redis, API status).  

### Manager (Quản lý bãi xe)
* Cấu hình `pricing rules` biểu phí gửi xe, phí phạt mất thẻ, phí phạt đỗ sai khu vực.  
* Quản lý cấu hình phân khu Zone: thiết lập mảng dữ liệu `allowed_vehicle_types`.  
* Phê duyệt/Từ chối hồ sơ đăng ký VIP dựa trên mã ETC bắt buộc.  
* Dashboard thời gian thực giám sát doanh thu, tỷ lệ lấp đầy phân khu.  
* Kích hoạt nút mở cổng cưỡng bức từ xa (Remote Override Open) - Lưu vết Audit Log.  
* Kích hoạt/Tắt chế độ "Giải tỏa cao điểm" khi xảy ra ùn ứ.  

### Staff (Nhân viên vận hành)
* Giám sát dữ liệu luồng vào/ra thời gian thực trên giao diện PC bốt trực.  
* Override AI: nhập tay sửa đổi ký tự biển số khi mô-đun AI quét sai lệch.  
* Đóng phiên vãng lai thông thường: thu thẻ tạm, kiểm tra trạng thái thanh toán hóa đơn.  
* Đi tuần thu tiền di động dưới hầm khi bãi xe kích hoạt chế độ kẹt xe cao điểm (Flow 3).  
* Xử lý nghiệp vụ mất thẻ vãng lai: đối chiếu ảnh check-in, thu phí phạt tích lũy.  

### Driver VIP (Tài xế Thành viên)
* Đăng ký vé tháng trực tuyến: upload giấy tờ + cung cấp mã ETC bắt buộc.  
* Ra/vào bãi xe hoàn toàn tự động không dừng qua cơ chế xác thực kép MFA (Plate + ETC).  
* Bật/Tắt widget khóa xe an toàn chống trộm từ xa (Anti-theft lock).  
* Xem lịch sử giao dịch và gợi ý khu vực đỗ xe trống phù hợp loại phương tiện.  

### Driver Vãng lai (Tài xế Khách)
* Nhận Thẻ Tạm vật lý tự động nhả từ máy phát đầu cổng vào.  
* Di chuyển đỗ xe theo chỉ dẫn hiển thị trên bảng LED điều hướng.  
* Trả Thẻ Tạm + hoàn tất thanh toán hóa đơn tại làn vãng lai cổng ra.  

---

## 5. CÔNG NGHỆ VÀ KỸ THUẬT THỰC HIỆN

| Layer | Technology | Mục đích |
| :--- | :--- | :--- |
| **Backend** | Java Spring Boot | Thiết lập cấu trúc hệ thống RESTful API, quản lý logic điều phối nghiệp vụ bãi xe. |
| **Security** | JWT (JSON Web Token) | Thực thi cơ chế xác thực an toàn hệ thống với Access Token (15 phút) và Refresh Token (7 ngày). |
| **API Docs** | Swagger UI / OpenAPI 3.0 | Tự động biên dịch tài liệu đặc tả cấu trúc API Contract phục vụ kết nối Frontend. |
| **Frontend** | ReactJS | Xây dựng Single Page Application phục vụ màn hình làm việc của Admin, Manager, Staff. |
| **Mobile Web** | ReactJS Responsive (PWA) | Tối ưu hiển thị ứng dụng di động cho thiết bị Driver VIP và Staff đi tuần lưu động. |
| **Main DB** | MySQL | Quản lý cơ sở dữ liệu quan hệ, đảm bảo tính toàn vẹn dữ liệu giao dịch tài chính (ACID). |
| **Cache Layer** | Redis | Bộ nhớ đệm lưu trữ dữ liệu nóng (số ô trống bãi xe) để đồng bộ nhanh thời gian thực. |
| **Storage** | MinIO / AWS S3 | Lưu trữ tệp tin hình ảnh camera AI chụp, tệp hồ sơ CMND, vi phạm của khách gửi xe. |
| **Payment** | VNPay Sandbox | Tích hợp cổng thanh toán giả lập xử lý luồng Webhook IPN kích hoạt vé tháng. |
| **Notification** | Firebase FCM | Đẩy tín hiệu thông báo còi hú thời gian thực về thiết bị Driver khi có cảnh báo chống trộm. |
| **Mock Devices**| Mock REST APIs | Giả lập toàn bộ dữ liệu truyền nhận của Barie, Camera AI, Máy phát thẻ và Đầu đọc ETC. |

---

## 6. NON-FUNCTIONAL REQUIREMENTS

* **Performance Latency:** Phản hồi của các Endpoint API xử lý luồng core phải đạt hiệu năng < 200ms ở percentile 95 (p95) dưới tải 100 người dùng đồng thời.  
* **AI & Hardware Mock Latency:** Thời gian phản hồi giả lập của luồng đọc biển số AI Camera và kiểm tra mã định danh ETC không vượt quá 2 giây trước khi đưa ra chỉ thị điều phối.  
* **Barrier Execute Delay:** Lệnh kích nổ mở thanh chắn Barie kỹ thuật số phải truyền tới Mock Barrier Controller trong vòng < 500ms sau khi Backend xác nhận phiên hợp lệ.  
* **System Availability:** Hệ thống phần mềm quản lý phải đạt chỉ số sẵn sàng hoạt động Uptime > 99.5% trên môi trường vận hành.  
* **Data Retention Lifecycle:** Hình ảnh lưu vết của camera AI tự động dọn dẹp sau 30 ngày để tối ưu dung lượng; dữ liệu giao dịch hóa đơn tài chính bắt buộc lưu trữ bất biến tối thiểu 3 năm phục vụ thanh tra kiểm toán.  
* **Security Guardrails:** Bắt buộc mã hóa mật khẩu bằng thuật toán Bcrypt (cost factor = 10), chống tấn công SQL Injection thông qua cơ chế Parameter Binding của ORM, ép buộc giao thức HTTPS toàn bộ các kết nối API.  

---

## 7. CONCEPTUAL & LOGICAL ERD

### 7.1. Mô hình Khái niệm (Conceptual ERD)
* **users:** Thực thể lưu trữ định danh tài khoản con người. *Quan hệ:* 1 User (Driver) $\rightarrow$ Quản lý sở hữu $N$ Vehicles; 1 User (Manager) $\rightarrow$ Thực hiện phê duyệt $N$ hồ sơ `vip_subscriptions`.  
* **vehicles:** Thực thể phương tiện gửi xe. *Quan hệ:* 1 Vehicle $\rightarrow$ Liên kết duy nhất với 1 bản ghi hồ sơ VIP `vip_subscriptions` (mối quan hệ 1:1 bảo mật dựa trên mã định danh ETC cố định); 1 Vehicle $\rightarrow$ Khởi tạo $N$ phiên đỗ `parking_sessions` theo dòng thời gian.  
* **parking_sessions:** Thực thể trung tâm lưu vết trạng thái của xe trong bãi. *Quan hệ:* 1 Session $\rightarrow$ Gán với 1 Thẻ Tạm `cards` (chỉ áp dụng cho khách vãng lai, đối với khách VIP trường này nhận giá trị NULL); 1 Session $\rightarrow$ Thuộc về 1 phân khu `zones`; 1 Session $\rightarrow$ Kích hoạt phát sinh 1 Hóa đơn thanh toán `transactions`.  
* **vip_subscriptions:** Hồ sơ đăng ký vé tháng của xe. *Quan hệ:* Mối quan hệ 1:1 nghiêm ngặt với `vehicles` thông qua ràng buộc khóa ngoại độc nhất, phục vụ luồng kiểm tra an ninh đầu ra cổng tự động VIP.  
* **cards:** Thực thể quản lý kho Thẻ Tạm vật lý sử dụng tại làn vãng lai. *Quan hệ:* 1 Card $\rightarrow$ Liên kết với tối đa 1 phiên đỗ `parking_sessions` hoạt động tại một thời điểm.  
* **zones & parking_slots:** Thực thể định nghĩa cấu trúc không gian tầng hầm bãi xe. *Quan hệ:* 1 Zone $\rightarrow$ Chứa $N$ ô đỗ `parking_slots` chuyên biệt; 1 Slot $\rightarrow$ Phát sinh $N$ bản ghi lịch sử vi phạm vị trí đỗ `parking_violations`.  

### 7.2. Cấu trúc bảng Chi tiết (Logical ERD Schema)

#### Bảng: `users`
| Column | Type | Constraint | Mô tả |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Khóa chính của bảng tài khoản. |
| **username** | VARCHAR(50) | UNIQUE NOT NULL | Tên đăng nhập hệ thống. |
| **password_hash** | VARCHAR(255) | NOT NULL | Chuỗi hash mật khẩu Bcrypt (cost=10). |
| **full_name** | VARCHAR(100) | NOT NULL | Họ và tên thật của người dùng. |
| **email** | VARCHAR(100) | UNIQUE NOT NULL | Địa chỉ thư điện tử liên hệ. |
| **phone** | VARCHAR(15) | NULL | Số điện thoại liên lạc. |
| **role** | ENUM | NOT NULL | Quyền hệ thống: `ADMIN`, `MANAGER`, `STAFF`, `DRIVER`. |
| **status** | ENUM | DEFAULT 'ACTIVE'| Trạng thái: `ACTIVE`, `INACTIVE`, `SUSPENDED`. |
| **fcm_token** | VARCHAR(255) | NULL | Mã Firebase phục vụ bắn tín hiệu báo động chống trộm. |
| **created_at** | TIMESTAMP | DEFAULT NOW() | Thời điểm khởi tạo tài khoản. |

#### Bảng: `vehicles`
| Column | Type | Constraint | Mô tả |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Khóa chính phương tiện. |
| **owner_id** | UUID | FK $\rightarrow$ `users(id)` | Mã định danh chủ sở hữu xe. |
| **license_plate** | VARCHAR(20) | UNIQUE NOT NULL | Ký tự biển số xe (Ví dụ: 51A-11111). |
| **etc_tag_code** | VARCHAR(50) | UNIQUE NULL | Mã định danh thẻ ETC quốc gia (Bắt buộc với xe VIP). |
| **vehicle_type** | ENUM | NOT NULL | Phân loại phân tầng: `CAR_4`, `CAR_7`, `VAN_16`, `TRUCK`. |
| **color** | VARCHAR(30) | NULL | Màu sắc phương tiện giúp AI double-check. |
| **brand** | VARCHAR(50) | NULL | Nhãn hiệu chế tạo xe. |
| **registration_doc_url**| VARCHAR(255) | NULL | URL lưu trữ ảnh quét Cà vẹt xe trên S3. |
| **is_active** | BOOLEAN | DEFAULT TRUE | Trạng thái hoạt động của phương tiện trong hệ thống. |

#### Bảng: `parking_sessions`
| Column | Type | Constraint | Mô tả |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Khóa chính của phiên gửi xe. |
| **license_plate** | VARCHAR(20) | NOT NULL | Biển số phương tiện ghi nhận thực tế. |
| **vehicle_id** | UUID | FK $\rightarrow$ `vehicles`, NULL | ID xe hệ thống (nhận giá trị NULL nếu là xe vãng lai). |
| **card_id** | UUID | FK $\rightarrow$ `cards`, NULL | ID thẻ tạm vãng lai (NULL nếu xe ra vào bằng làn VIP). |
| **detected_etc_code** | VARCHAR(50) | NULL | Mã thẻ định danh ETC đọc được qua RFID tại làn VIP đầu vào. |
| **check_in_time** | TIMESTAMP | NOT NULL DEFAULT NOW()| Thời gian phương tiện tiến vào bãi xe. |
| **check_out_time** | TIMESTAMP | NULL | Thời gian xuất bãi (NULL khi phiên đỗ còn ACTIVE). |
| **assigned_zone_id** | UUID | FK $\rightarrow$ `zones`, NOT NULL| Mã ID phân khu tầng đỗ hệ thống chỉ định điều hướng. |
| **session_status** | ENUM | DEFAULT 'ACTIVE' | Trạng thái: `ACTIVE`, `COMPLETED`, `PASSED_CONFIRMED`, `LOST_CARD`. |
| **is_vip** | BOOLEAN | DEFAULT FALSE | Cờ phân tách đối tượng: VIP = TRUE, Vãng lai = FALSE. |
| **is_locked** | BOOLEAN | DEFAULT FALSE | Cờ trạng thái cấu hình khóa chống trộm từ xa từ App. |
| **ai_check_in_image** | VARCHAR(255) | NULL | URL lưu trữ ảnh chụp ngoại quan xe lúc vào để đối soát. |
| **mobile_checkout_staff_id**| UUID | FK $\rightarrow$ `users`, NULL | ID của nhân viên thu tiền lưu động dưới hầm (Flow 3). |
| **mobile_checkout_location**| VARCHAR(100) | NULL | Tọa độ dữ liệu GPS ghi nhận khi Staff thu tiền di động. |
| **override_by_staff** | UUID | FK $\rightarrow$ `users`, NULL | ID của nhân viên bấm nút ghi đè sửa đổi lỗi camera AI. |

#### Tóm tắt cấu trúc các Bảng bổ trợ còn lại trong Hệ thống
* **`vip_subscriptions`:** `id`, `vehicle_id [FK, UQ]`, `type`, `start_date`, `end_date`, `status` (`PENDING_APPROVAL`, `ACTIVE`, `EXPIRED`, `REJECTED`), `photos_urls` (JSON chứa URL CMND/Cà vẹt), `approved_by [FK]`, `fee_amount`, `payment_reference`.  
* **`cards`:** `id`, `card_number [UNIQUE]`, `card_type` (Mặc định `TEMP`), `status` (`AVAILABLE`, `IN_USE`, `LOST`, `DAMAGED`). *Loại bỏ cột `current_session_id` để tránh lỗi lặp vòng dữ liệu (Circular Reference Antipattern).* * **`zones`:** `id`, `zone_name`, `zone_code [UNIQUE]`, `allowed_vehicle_types` (JSON lưu mảng ENUM loại xe được phép), `total_slots`, `current_occupied`, `barrier_api_url`, `is_active`.  
* **`parking_slots`:** `id`, `zone_id [FK]`, `slot_number` (Ví dụ: F1-A01), `slot_status` (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`). *Bảng bổ sung bắt buộc để phục vụ lưu vết Flow 7.*
* **`transactions`:** `id`, `session_id [FK]`, `parking_fee`, `lost_card_penalty`, `parking_violation_penalty`, `total_amount`, `payment_method`, `payment_status` (`PENDING`, `SUCCESS`, `FAILED`), `processed_by [FK]`, `is_mobile_checkout`, `mobile_location`.  
* **`pricing_rules`:** `id`, `vehicle_type [ENUM]`, `first_hour_fee`, `additional_hour_fee`, `max_daily_fee`, `lost_card_penalty`, `parking_violation_penalty`, `effective_from [TIMESTAMP]`, `effective_to [TIMESTAMP, NULL]`.  
* **`ai_scan_logs`:** `id`, `session_id [FK]`, `scan_location`, `camera_id`, `image_url`, `detected_plate`, `confidence_score`, `detected_color`, `is_overridden`, `override_plate`, `override_by [FK]`.  
* **`blacklisted_cards`:** `id`, `card_id [FK, UQ]`, `session_id [FK]`, `reason` (`LOST`), `blacklisted_by [FK]`, `blacklisted_at`, `notes`.  
* **`audit_logs`:** `id`, `user_id [FK]`, `action_type [ENUM]`, `entity_type`, `entity_id`, `old_value [JSON]`, `new_value [JSON]`, `ip_address`, `timestamp`.  
* **`parking_violations`:** `id`, `session_id [FK]`, `slot_id [FK]`, `violation_type` (`WRONG_ZONE_OCCUPANCY`), `photo_urls` (JSON), `detected_by [FK]`, `penalty_applied`, `penalty_amount`.  
* **`refresh_tokens`:** `id`, `user_id [FK]`, `token [UUID, UNIQUE]`, `expires_at` (Hết hạn sau 7 ngày).  

---

## 8. BUSINESS RULES — QUY TẮC NGHIỆP VỤ CỨNG

### 8.1. Nhóm BR-AUTH & ACCESS (Xác thực tài khoản)
> **BR-AUTH-01:** Mỗi tài khoản đăng nhập bắt buộc chỉ sở hữu một phân vai duy nhất thuộc mảng quyền hệ thống (role không nhận giá trị NULL hoặc đa giá trị).  
> **BR-AUTH-02:** Token JWT Access giới hạn hiệu lực trong 15 phút. Token Refresh dùng để tái cấp phát có vòng đời 7 ngày, lưu vết trực tiếp trong DB để hỗ trợ lệnh vô hiệu hóa cưỡng bức khi có hành động đăng xuất.  

### 8.2. Nhóm BR-ENTRY (Ràng buộc cổng vào bãi)
> **BR-ENTRY-01:** Một phương tiện chỉ được phép khởi tạo phiên đỗ mới nếu hệ thống ghi nhận biển số đó không nằm trong danh sách đen (`blacklisted_plates`) và số lượng phiên hoạt động hiện hành của biển số đó trong bãi bằng 0 (`COUNT(sessions WHERE plate=? AND status='ACTIVE') == 0`).  
> **BR-ENTRY-03:** Quy tắc làn VIP đầu vào: Hệ thống chỉ nhả lệnh mở thanh chắn Barie tự động khi và chỉ khi chuỗi ký tự biển số bóc tách từ AI Camera khớp với hồ sơ VIP VÀ chuỗi mã định danh ETC truyền về từ đầu đọc RFID trùng khớp với trường `etc_tag_code` lưu trong DB. Làn vãng lai bỏ qua bước kiểm tra ETC, thực hiện nhả thẻ tạm thông thường nếu trạng thái lấp đầy của phân khu tương ứng còn dư slot trống.  

### 8.3. Nhóm BR-EXIT (Ràng buộc cổng xuất bãi)
> **BR-EXIT-01:** Quy tắc làn VIP tự động xuất bãi: Hệ thống tự động nhấc Barie không dừng khi đáp ứng đồng thời 4 điều kiện: (1) Biển số xe thuộc danh sách VIP ACTIVE; (2) Mã ETC thực tế quét được trùng khớp mã chip đăng ký hệ thống; (3) Phiên đỗ của xe đang ở trạng thái ACTIVE; (4) Cờ an ninh chống trộm gạt tắt (`is_locked == FALSE`). Nếu cờ chống trộm bật (`is_locked == TRUE`) hoặc mã định danh ETC bị lệch (nghi vấn tráo đổi vỏ biển số vật lý), hệ thống thực hiện đóng băng Barie, nhấp nháy giao diện cảnh báo đỏ sang màn hình Staff và kích hoạt còi hú.  
> **BR-EXIT-03:** Quy tắc làn vãng lai cổng ra: Xe vãng lai chỉ được giải phóng khi trạng thái hóa đơn thanh toán chuyển sang PAID và Thẻ Tạm vật lý đã được quẹt thu hồi, chuyển đổi trạng thái thẻ về lại kho AVAILABLE.  
> **BR-EXIT-05:** Cách thức tính toán biểu phí gửi xe vãng lai thực hiện block theo giờ dựa trên quy tắc làm tròn lên (ceil). Mức giá áp dụng căn cứ theo mốc thời gian áp dụng (`effective_from <= check_in_time <= effective_to`) và giá trị hóa đơn tổng không vượt quá ngưỡng trần `max_daily_fee` cấu hình cho loại phương tiện đó trong ngày.  

### 8.4. Nhóm BR-CONGEST (Giải tỏa kẹt xe cao điểm)
> **BR-CON-01:** Quyền kích hoạt và tắt cơ chế thu phí lưu động dưới hầm thuộc về tác nhân Quản lý (MANAGER) hoặc Quản trị viên (ADMIN).  
> **BR-CON-02:** Mỗi bản ghi thanh toán di động của Staff dưới hầm bắt buộc phải nạp đủ tham số: Tọa độ vị trí GPS, nhãn thời gian thực hiện, và ảnh chụp bằng chứng hoàn tất thu tiền (ảnh tiền mặt hoặc ảnh màn hình app ngân hàng của khách hiển thị giao dịch thành công). Thiếu một trong các trường trên, Backend từ chối đóng hóa đơn sớm.  
> **BR-CON-03:** Điều hướng xe giải tỏa: Xe vãng lai sau khi hoàn tất thủ tục thanh toán lưu động dưới hầm (session status chuyển sang `PASSED_CONFIRMED`) bắt buộc phải di chuyển ra bằng Làn Vãng Lai tại cổng cổng ra chính (không đi sang làn VIP để tránh xung đột hạ tầng di chuyển). Khi tới bốt trực, tài xế đưa lại thẻ tạm cho Staff quẹt thu hồi, Backend nhận diện trạng thái `PASSED_CONFIRMED == TRUE` sẽ nhấc thanh chắn lập tức mà không yêu cầu nộp tiền lần 2. Phiên đóng tiền lưu động có thời hạn hiệu lực xuất bãi trong vòng tối đa 30 phút; quá mốc này hệ thống tự động thiết lập trả trạng thái session về ACTIVE và khách phải thực hiện đóng phí lại tại quầy.  

### 8.5. Nhóm BR-VIP & LOST (Đăng ký thành viên & Mất thẻ)
> **BR-VIP-01:** Hồ sơ đăng ký vé tháng trực tuyến bắt buộc phải điền đầy đủ mã thẻ ETC quốc gia (ePass/VETC) dán trên phương tiện và tải lên đủ 3 loại ảnh minh chứng. Nếu xe không có mã ETC hoặc tài xế bỏ trống trường này, hệ thống hiển thị thông báo chặn, từ chối tạo lệnh giao dịch subscription.  
> **BR-LOST-01:** Ngay khi nhân viên trực bốt bấm nút 'Xác nhận đóng phiên mất thẻ', ID thẻ tạm vật lý cũ lập tức bị khóa vĩnh viễn vào bảng `blacklisted_cards` và chuyển trạng thái thẻ sang LOST, nghiêm cấm hành vi cấu hình hoàn trả thẻ này về kho tái sử dụng để chặn các lỗ hổng gian lận nhặt thẻ vượt cổng. Quy trình đóng phiên mất thẻ yêu cầu phải chụp ảnh minh chứng CCCD/Cà vẹt của người khai báo để lưu vết kiểm toán hệ thống.  

### 8.6. Nhóm BR-DATA (Thời hạn lưu trữ & Tính bất biến)
> **BR-DATA-02:** Dữ liệu hóa đơn tài chính và lịch sử phiên đỗ phương tiện (`transactions`, `parking_sessions`) thuộc danh mục bảo mật cấp độ cao, bắt buộc lưu trữ bất biến tối thiểu 3 năm.  
> **BR-DATA-03:** Mọi hành động can thiệp ghi đè hệ thống nhạy cảm của con người (`OVERRIDE_AI`, `REMOTE_OPEN_BARRIER`, `LOST_CARD_CONFIRM`) bắt buộc phải ghi log chi tiết vào bảng `audit_logs`. Hệ thống không thiết kế bất kỳ một Endpoint REST API nào có chức năng sửa đổi hoặc xóa (DELETE) dữ liệu của bảng `audit_logs`, đảm bảo tính bất biến hoàn toàn phục vụ công tác hậu kiểm và chống gian lận nội bộ từ nhân viên.  

---

## 9. USER GUIDE — QUY TRÌNH THAO TÁC CỦA CÁC TÁC NHÂN

### 9.1. Giao diện dành cho Tài xế Thành viên (Driver VIP App)
* **Quy trình đăng ký Vé tháng trực tuyến:** Tài xế truy cập ứng dụng di động, vào tab "Đăng ký Thành viên VIP". Hệ thống hiển thị form nhập liệu yêu cầu điền biển số xe, chọn gói chu kỳ gia hạn (1 tháng, 3 tháng, 6 tháng) và bắt buộc điền mã số thẻ ETC vật lý dán trên xe. Tài xế đính kèm tệp ảnh CMND/CCCD, ảnh Cà vẹt xe và ảnh chụp trực diện phương tiện rõ biển số. Bấm nút xác nhận điều hướng sang cổng VNPAY Sandbox để quét mã đóng tiền. Sau khi đóng tiền xong, hồ sơ chuyển trạng thái chờ Quản lý tòa nhà hậu kiểm thông tin để kích hoạt.  
* **Quy trình kích hoạt chế độ Khóa xe an toàn:** Khi đã đỗ xe cố định trong vạch ô thuộc hầm tòa nhà, tài xế mở ứng dụng di động, chọn phương tiện đang gửi và gạt nút "Khóa xe chống trộm". Hệ thống gửi tín hiệu API thiết lập trạng thái an ninh bảo vệ phương tiện. Trước khi lái xe ra về, tài xế bắt buộc phải truy cập ứng dụng để gạt tắt chế độ khóa an toàn, cho phép hệ thống tự động thông xe tại làn VIP tự động không dừng.  

### 9.2. Giao diện bốt kiểm soát cổng ra (Staff PC Web Terminal)
* **Quy trình xử lý đóng phiên Vãng lai thông thường:** Nhân viên nhận thẻ tạm từ tài xế, thực hiện quẹt thẻ hoặc nhập thủ công mã số thẻ vào ô xử lý trên màn hình PC. Giao diện hiển thị tức thì số tiền cần thu tính toán tự động từ block giờ gửi xe kèm ảnh chụp trực quan lúc xe vào bãi để nhân viên đối chiếu ngoại quan xe. Hệ thống tự động đẩy thông tin số tiền và mã QR thanh toán tĩnh lên bảng LED cổng ra cho khách quét. Sau khi thu tiền mặt hoặc hệ thống thông báo trạng thái hóa đơn điện tử thành công, nhân viên cất thẻ vào hộp thu hồi và bấm nút "Xác nhận thu tiền" trên màn hình, Barie tự động nhấc giải phóng phương tiện.  
* **Quy trình xử lý khai báo Mất thẻ vật lý:** Khi khách hàng báo mất thẻ tại bốt, nhân viên yêu cầu xuất trình CCCD và Cà vẹt xe. Staff dùng camera bốt hoặc điện thoại chụp lại giấy tờ để upload làm chứng cứ đối soát hệ thống. Trên giao diện Desktop, nhân viên truy cập tab "Xử lý mất thẻ", nhập ký tự biển số xe đang đứng tại bốt và bấm Tìm kiếm. Hệ thống truy vết hiển thị breakdown chi tiết hóa đơn: Phí gửi xe tích lũy + Khoản phụ thu phạt làm mất thẻ vật lý, đồng thời tự động phát lệnh đưa ID thẻ cũ vào danh sách đen. Sau khi khách hoàn tất đóng tiền, Staff bấm "Xác nhận đóng phiên mất thẻ" để nhấc thanh chắn Barie thông xe.  

### 9.3. Giao diện thực địa di động (Staff Mobile Web POS)
* **Quy trình xử lý kẹt xe lưu động giờ cao điểm dưới hầm (Flow 3):** Khi bãi xe bật chế độ "Giải tỏa cao điểm", nhân viên cầm thiết bị di động đi bộ dọc làn xe đang xếp hàng chờ dưới hầm. Tại mỗi đầu xe vãng lai, nhân viên bật camera trên ứng dụng quét biển số xe, hệ thống tự động kiểm tra thời gian gửi và xuất hóa đơn giá tiền trực tiếp trên màn hình di động Staff. Nhân viên cho khách quét mã QR thanh toán trực tiếp tại chỗ, sau khi nhận tiền, Staff bấm nút "Xác nhận thanh toán lưu động" trên giao diện App Mobile. Hệ thống ghi nhận trạng thái session sang `PASSED_CONFIRMED`, Staff hoàn trả thẻ tạm lại cho tài xế giữ và hướng dẫn tài xế tiếp tục di chuyển thẳng ra Làn Vãng Lai đầu cổng chính để nộp thẻ xuất bãi nhanh chóng mà không cần dừng xe đóng tiền lại.  

### 9.4. Giao diện của Quản lý tòa nhà gửi xe (Manager Web Dashboard)
* **Quy trình phê duyệt hồ sơ đăng ký VIP trực tuyến:** Quản lý truy cập hệ thống bằng tài khoản Manager, di chuyển vào tab "Phê duyệt hồ sơ Thành viên". Giao diện hiển thị danh sách các hồ sơ đang ở trạng thái `PENDING_APPROVAL` xếp theo thứ tự thời gian. Manager click vào chi tiết từng hồ sơ để kiểm tra trực quan các tệp ảnh đính kèm: đối chiếu họ tên chủ xe, biển số xe trên ảnh chụp thực tế có khớp với thông tin ký số của mã định danh thẻ ETC hay không. Nếu mọi dữ liệu hợp lệ và đồng nhất, Manager bấm nút "Duyệt" để chính thức kích hoạt trạng thái VIP sang `ACTIVE`, hệ thống tự động đồng bộ ghi nhận lịch sử thao tác vào bảng `audit_logs` để lưu vết giám sát nội bộ.