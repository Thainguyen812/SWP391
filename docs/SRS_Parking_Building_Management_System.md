# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS SPECIFICATION)
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ TÒA NHÀ GỬI XE (PARKING BUILDING MANAGEMENT SYSTEM)

---

## 1. BỐI CẢNH THỰC HIỆN ĐỀ TÀI

Cùng với sự phát triển của hạ tầng giao thông, số lượng xe ô tô cá nhân tại Việt Nam đang tăng trưởng mạnh mẽ. Tuy nhiên, các bãi đỗ xe truyền thống tại các tòa nhà văn phòng, trung tâm thương mại hiện nay vẫn chủ yếu vận hành dựa trên các phương thức thủ công, bộc lộ nhiều hạn chế nghiêm trọng.

### 1.1. Các vấn đề hiện tại
* **Ùn tắc giao thông cổng vào/ra:** Quy trình dừng xe để quẹt thẻ vật lý, kiểm tra hóa đơn và thu tiền thủ công tạo ra tình trạng ùn ứ kéo dài, đặc biệt trong các khung giờ cao điểm (sáng đi làm, chiều tan tầm).
* **Hỗn loạn trong quy hoạch vị trí:** Không có sự phân luồng hệ thống theo chủng loại phương tiện (xe tải nhỏ, xe 16 chỗ, xe gia đình), dẫn đến tình trạng xe lớn chiếm dụng không gian xe nhỏ sai quy định, gây lãng phí hạ tầng đỗ xe.
* **Rủi ro vận hành và mất mát vật tư:** Khách hàng làm mất thẻ gửi xe dẫn đến quy trình tra cứu đối soát thủ công phức tạp, mất thời gian, dễ gây tranh chấp và làm tăng nguy cơ thất thoát doanh thu hoặc mất cắp phương tiện.

### 1.2. Giải pháp đề xuất
Nhóm đề xuất phát triển **Hệ thống Quản lý Bãi đỗ xe Ô tô Thông minh (Smart Car Parking Management System)** — Một giải pháp **THUẦN PHẦN MỀM** quản lý, ứng dụng AI giả lập (Mock API) để nhận diện biển số và phân loại kích thước xe, từ đó tự động phân bổ quyền truy cập vào các tầng đỗ (Zone) chuyên biệt.

> 💡 **ĐIỂM ĐỘT PHÁ VỀ NGHIỆP VỤ (Cập nhật Xác thực QR Động):**
> * **Khách Thành Viên (VIP):** Không dùng thẻ vật lý. Hệ thống áp dụng cơ chế xác thực hai lớp (MFA) tự động bằng cách kết hợp AI Camera nhận diện biển số và Đầu quét mã QR động (Dynamic QR) sinh ra trực tiếp từ ứng dụng di động chính chủ. Quy trình quét QR động là bắt buộc ở cổng ra để loại bỏ hoàn toàn lỗ hổng tráo đổi/bóc gỡ thẻ vật lý hoặc sticker định danh cơ học dán trên xe.
> * **Khách vãng lai:** Vẫn dùng Thẻ Tạm vật lý tại làn vãng lai riêng biệt, không áp dụng luồng xác thực QR động. Quy trình xử lý tối giản và có Nhân viên (Staff) hỗ trợ thu hồi thẻ tại cổng ra.
> * **Tích hợp luồng xử lý kẹt xe vãng lai linh hoạt:** Xử lý qua thiết bị cầm tay di động (Mobile Web App) dưới hầm. Sau khi thanh toán xong tại chỗ dưới hầm, khách di chuyển ra làn vãng lai chỉ cần nộp lại thẻ cho nhân viên bốt trực nhấc thanh chắn lập tức mà không cần dừng lại thanh toán, tránh chồng chéo và xung đột làn xe.
> * **Quy trình đối chiếu giấy tờ bảo mật:** Áp dụng cơ chế an ninh chặt chẽ khi xảy ra sự cố mất thẻ, mang lại mô hình quản lý bãi xe an toàn, bảo mật và hiện đại.

---

## 2. SCOPE — PHẠM VI DỰ ÁN

### 2.1. Phạm vi dự án (Project Scope)
Hệ thống tập trung chuyên biệt vào việc quản lý phần mềm điều hành phương tiện là **Ô tô (từ 4 đến 16 chỗ, xe tải nhỏ)**, hoàn toàn không bao gồm xe máy và xe thô sơ.

* **In-Scope (Thuần phần mềm quản lý):** Xây dựng các thuật toán logic Backend, quản lý cơ sở dữ liệu quan hệ, thiết kế hệ thống RESTful API, và xây dựng giao diện hiển thị phía Client (ReactJS SPA & Responsive Mobile Web). Tích hợp Mock API (giả lập dữ liệu) các tín hiệu từ hệ thống camera AI, đầu đọc/quét QR mã hóa động, cổng thanh toán Sandbox và các lệnh đóng/mở thanh chắn kỹ thuật số.
* **Out-of-Scope (Nằm ngoài phạm vi):** Không chịu trách nhiệm lắp đặt, vận hành hay lập trình nhúng phần cứng cơ khí Barie, mạng lưới cảm biến siêu âm vật lý tại từng ô đỗ, hay các thiết bị đọc thẻ vật lý chuyên dụng ngoài đời thực. Toàn bộ phần cứng được mô phỏng hoàn toàn bằng dữ liệu truyền nhận thông qua RESTful API sạch.

### 2.2. Context Diagram — Sơ đồ Ngữ cảnh
Do dự án là thuần phần mềm, các thiết bị phần cứng được xem như các Mô-đun giao tiếp dữ liệu đầu vào/đầu ra giả lập (**External Data Modules**) thông qua RESTful API.

#### A. Core System
* **Parking Building Management System:** Thực thi các hàm API xử lý nghiệp vụ, quản lý trạng thái phiên gửi xe, tính toán biểu phí, điều phối luồng dữ liệu giải tỏa kẹt xe và đẩy dữ liệu thống kê Analytics lên Dashboard giám sát thời gian thực.

#### B. External Actors (Con người)
| Actor | Interface | Mô tả tương tác |
| :--- | :--- | :--- |
| **Admin** | Web Admin | Quản lý tài khoản toàn hệ thống, cấu hình phân quyền chi tiết (RBAC), xem hệ thống nhật ký hành động (Audit Logs). |
| **Manager** | Web Dashboard | Duyệt hồ sơ VIP, cấu hình biểu phí và phân khu, xem thống kê doanh thu, kích hoạt mở cổng cưỡng bức từ xa. |
| **Staff** | Web (PC + Mobile) | Giám sát làn ra/vào, thu tiền mặt, override dữ liệu AI khi quét sai, xử lý nghiệp vụ mất thẻ và giải tỏa kẹt xe lưu động dưới hầm. |
| **Driver VIP** | Mobile Web/App | Đăng ký thành viên/vé tháng, bật/tắt chế độ khóa xe an toàn, chủ động sinh mã QR động để xác thực vào (dự phòng) / ra (bắt buộc). |
| **Driver Vãng lai** | Không trực tiếp | Tương tác vật lý: Nhận thẻ tạm tự động khi vào, trả thẻ tạm + thanh toán tiền cho Staff khi ra (tại làn vãng lai). |

#### C. External Systems (Hệ thống bên ngoài giả lập)
| External System | Loại | Luồng dữ liệu chính |
| :--- | :--- | :--- |
| **Mock AI Camera Module** | Hardware Mock | Camera $
-> System: Trả về cấu trúc JSON gồm biển số, loại xe, màu xe, và URL ảnh chụp ngoại quan. |
| **Mock QR Code Scanner** | Hardware Mock | Đầu quét $
-> System: Nhận diện và gửi chuỗi token mã hóa từ ứng dụng di động (CHECK_IN / CHECK_OUT). |
| **Mock Barrier Controller** | Hardware Mock | System $
-> Barrier: Lệnh mở/đóng vật lý; Barrier $
-> System: Trả về trạng thái đóng/mở hiện hành. |
| **Mock Card Dispenser** | Hardware Mock | System $
-> Máy phát thẻ: Lệnh nhả thẻ + gán phân khu; Máy phát $
-> System: Trạng thái tồn kho thẻ tạm. |
| **Mock LED Display** | Hardware Mock | System $
-> Bảng hiển thị LED: Số tiền cần thu, thông báo điều hướng phân tầng, câu lệnh cảnh báo đỏ khẩn cấp. |
| **Payment Gateway Sandbox** | 3rd Party | System $
-> Gateway: Yêu cầu thanh toán (VNPAY); Gateway $
-> System: Webhook (IPN callback) cập nhật hóa đơn. |
| **Notification Service (FCM)** | 3rd Party | System $
-> Firebase Cloud Messaging: Gửi thông báo Push Notification khẩn cấp đến thiết bị Driver khi kích hoạt báo động chống trộm. |
| **Object Storage (MinIO/S3)** | Infrastructure | System $
-> Storage: Lưu trữ hình ảnh xe từ Camera AI, ảnh chụp CMND/CCCD, Cà vẹt xe khi xử lý hồ sơ hoặc vi phạm. |

---

## 3. MAIN FLOWS — SWIMLANE DIAGRAM SƠ ĐỒ NGHIỆP VỤ

Hệ thống gồm 7 luồng nghiệp vụ chính chia làm 2 giai đoạn. Mọi thiết bị phần cứng được giả lập qua Mock API — hệ thống chỉ gửi/nhận JSON qua RESTful endpoint.

### GIAI ĐOẠN 1: TÍNH NĂNG CỐT LÕI

#### Flow 1: Vào bãi & Định hướng phân tầng (Smart Check-in & Floor Allocation)
1.  **Tài xế:** Lái xe tiếp cận vạch dừng tại cổng vào chính (Hệ thống thiết lập 2 làn tách biệt độc lập: Làn Vãng lai và Làn VIP tự động).
2.  **Cảm biến làn:** Phát hiện xe, kích hoạt AI Camera quét nhận diện ký tự biển số, phân loại kích cỡ dáng xe (`TRUCK/VAN`, `VAN_16`, `CAR_7`, `CAR_4`), và màu sắc phương tiện.
3.  **Backend System:** Kiểm tra xem biển số có nằm trong Hệ thống Blacklist hay không. Nếu hợp lệ, tiến hành phân luồng logic xử lý:
    * **Luồng Vãng lai:** Hệ thống tự động gán phân khu tầng đỗ (Zone) tối ưu theo kích cỡ xe $
-> Gửi lệnh nhả Thẻ Tạm (`Mock Card Dispenser`) $
-> Khởi tạo phiên đỗ $
-> Kích nổ mở Barie. Luồng này hoàn toàn bỏ qua bước quét mã QR.
    * **Luồng VIP Chuẩn:** Hệ thống tra cứu DB thấy biển số thuộc danh sách VIP trạng thái `ACTIVE` $
-> Tự động gán Zone dựa theo cấu hình xe đã duyệt $
-> Khởi tạo phiên đỗ $
-> Tự động nhấc Barie thông xe không cần tương tác vật lý.
    * **Luồng VIP Fallback (Lỗi nhận diện do thời tiết/mờ biển):** Nếu Camera AI không quét được hoặc độ tin cậy < 70%, tài xế chủ động mở App Driver sinh mã QR Động Vào Bãi (hiệu lực 5 phút ) 
-> Đưa qua đầu quét tại bốt 
-> Hệ thống giải mã kiểm tra tính hợp lệ chính chủ $
-> Khởi tạo phiên đỗ và mở Barie.
-> Đưa qua đầu quét tại bốt $
-> Hệ thống giải mã kiểm tra tính hợp lệ chính chủ $
-> Khởi tạo phiên đỗ và mở Barie.
4.  **Hệ thống:** Khởi tạo bản ghi dữ liệu `ParkingSession`. Hiển thị thông tin phân tầng đỗ tối ưu phù hợp loại xe lên bảng LED điều hướng. Cập nhật số lượng chỗ đỗ trống hiện hành của Zone tương ứng (-1) trong Redis Cache.
* *Lưu ý bảo mật:* Xe Thành viên bắt buộc phải có trạng thái hồ sơ `ACTIVE` và trùng khớp nhận diện Fingerprint ngoại quan hệ thống mới cho phép liên kết luồng.

#### Flow 2: Ra cổng & Thanh toán (Main Exit Check-out)
Hệ thống tách biệt hoàn toàn 2 làn xử lý độc lập tại cổng ra:

##### Kịch bản A — Làn Thành Viên VIP (BẮT BUỘC XÁC THỰC HAI LỚP QR ĐỘNG)
1.  **Tiếp cận làn:** Xe thành viên tiến vào làn ra VIP riêng biệt.
2.  **AI Camera quét:** Hệ thống tự động quét biển số xe để truy vết tìm phiên đỗ `ACTIVE` tương ứng trong cơ sở dữ liệu.
3.  **Bắt buộc quét QR:** Tài xế **BẮT BUỘC** phải bật App Driver, sinh mã QR Động Xuất Bãi (hiệu lực 5 phút, giá trị sử dụng một lần) và đưa vào thiết bị quét QR đặt tại bốt.
4.  **Backend xác thực:** Hệ thống tiến hành đối soát đồng thời 4 điều kiện nghiêm ngặt:
    * (1) Ký tự biển số thuộc diện Thành Viên VIP trạng thái `ACTIVE` trong DB.
    * (2) Mã Token giải mã từ QR động trùng khớp với tài khoản sở hữu xe đó, trạng thái QR là chưa từng sử dụng và chưa hết hạn.
    * (3) Có phiên gửi xe `ACTIVE` khớp với biển số xe trong hệ thống bãi.
    * (4) Cờ cấu hình bảo vệ chống trộm đang gạt tắt (`is_locked == FALSE`).
5.  **Xử lý kết quả:**
    * *Nếu TẤT CẢ đều hợp lệ:* Tự động gửi lệnh mở Barie, cập nhật trạng thái session sang `COMPLETED`, giải phóng slot trống phân khu (+1). Màn hình Staff hiển thị trạng thái xanh trực quan: `"MATCH — VIP QR EXTENSION EXIT"`. Phí giao dịch hiển thị bằng 0đ (đã khấu trừ tự động vào vé tháng).
    * *Nếu thiếu hoặc sai bất kỳ điều kiện nào (Không quét QR, quét sai tài khoản, xe đang khóa):* Barie giữ nguyên trạng thái khóa cứng, phát tín hiệu còi hú cảnh báo đỏ sang màn hình Staff trực bốt giám sát.

##### Kịch bản B — Làn Vãng lai (Staff trực bốt xử lý)
1.  **Tiếp cận làn:** Lái xe tiến vào làn Vãng lai, đưa Thẻ Tạm vật lý cho nhân viên bốt trực. Luồng này tuyệt đối không áp dụng quét mã QR động của tài xế.
2.  **Kiểm tra phí:** Staff thực hiện quẹt thẻ hoặc nhập thủ công mã số thẻ vào hệ thống. Backend tự động tính toán tổng chi phí dựa trên block giờ gửi thực tế + bảng giá cấu hình quy định. Bảng LED ngoài cổng hiển thị số tiền cần thu kèm mã QR thanh toán tĩnh của ngân hàng.
3.  **Thanh toán:** Tài xế thanh toán bằng tiền mặt trực tiếp cho Staff hoặc thực hiện quét mã QR ngân hàng hiển thị trên LED.
4.  **Cho xe ra:** Staff thu lại Thẻ Tạm bỏ vào hộp lưu trữ tuần hoàn kho $
-> Bấm nút "Xác nhận thu tiền" trên màn hình $
-> Hệ thống đóng session (`COMPLETED`), giải phóng slot trống của tầng đỗ, gửi lệnh nhấc thanh chắn Barie giải phóng phương tiện.

#### Flow 3: Xử lý Kẹt xe Giờ cao điểm vãng lai (Basement Congestion Relief)
1.  **Kích hoạt:** Manager hoặc Staff phát hiện ùn ứ kéo dài tại cổng ra vãng lai $
-> Bấm nút `"Kích hoạt Giải tỏa cao điểm"` trên bảng điều khiển hệ thống.
2.  **Tiếp cận thực địa:** Staff cầm thiết bị di động (đã đăng nhập Web App Staff Mobile POS) đi bộ xuống khu vực hầm đỗ, tiếp cận từng đầu xe vãng lai đang xếp hàng chờ di chuyển.
3.  **Thanh toán di động:** Staff dùng camera điện thoại quét biển số xe $
-> Hệ thống truy quét tính tiền tự động $
-> Khách thực hiện trả tiền mặt hoặc quét mã QR hiển thị trực tiếp trên màn hình điện thoại Staff $
-> Staff bấm nút `"Xác nhận thanh toán lưu động"`. Hệ thống tự động ghi nhận dữ liệu GPS vị trí + timestamp để phục vụ công tác kiểm toán nội bộ chống gian lận. Staff **KHÔNG THU HỒI** Thẻ Tạm tại bước này, trả lại thẻ cho khách giữ để đảm bảo kiểm soát đầu ra đồng bộ.
4.  **Cập nhật trạng thái:** Backend ghi nhận giao dịch tài chính thành công, cập nhật trạng thái session của xe vãng lai đó thành `PASSED_CONFIRMED` và chuyển trạng thái hóa đơn liên kết sang `PAID`.
5.  **Xuất bãi nhanh:** Xe di chuyển tịnh tiến tiếp cận cổng ra của Làn Vãng Lai (Tuyệt đối không rẽ sang làn VIP để tránh di chuyển chồng chéo cắt mặt gây hỗn loạn giao thông). Tài xế đưa Thẻ Tạm cho Staff tại bốt. Staff thực hiện quẹt thẻ, hệ thống quét phát hiện trạng thái biến cờ `PASSED_CONFIRMED == TRUE` $
-> Tự động nhấc Barie lập tức mà không yêu cầu thu tiền lần hai. Staff thu hồi thẻ tạm nhập hộp để hoàn trả kho thẻ.

---

### GIAI ĐOẠN 2: TÍNH NĂNG NÂNG CAO

#### Flow 4: Xử lý Mất thẻ bảo mật kép (Lost Card Handling)
1.  **Khai báo:** Tài xế di chuyển ra bốt cổng vãng lai, thông báo mất Thẻ Tạm vật lý với nhân viên trực trực.
2.  **Quét biển số:** AI Camera quét nhận diện biển số xe đang đứng tĩnh tại bốt (Ví dụ: `51A-11111`).
3.  **Đối chiếu trực quan:** Staff yêu cầu tài xế xuất trình CMND/CCCD + Giấy đăng ký xe (Cà vẹt). Staff dùng điện thoại hoặc webcam chụp ảnh giấy tờ lưu vào hệ thống. Hệ thống hiển thị song song ảnh AI chụp lúc vào bãi (`ai_check_in_image`) để Staff đối chiếu kiểu dáng, màu sắc thực tế của xe xem có trùng khớp hay không.
4.  **Tra cứu hệ thống:** Staff mở tab `"Xử lý mất thẻ"` trên Desktop Web $
-> Nhập ký tự biển số $
-> Bấm nút Tìm kiếm.
5.  **Phạt phụ thu:** Backend kiểm tra truy vết session `ACTIVE` của xe $
-> Tính toán tổng phí gửi tích lũy theo block giờ + Phí phạt mất thẻ vật lý cấu hình sẵn. Tự động đưa mã hiệu `card_id` cũ đã mất vào danh sách đen `blacklisted_cards` để vô hiệu hóa thẻ.
6.  **Giải phóng xe:** Staff thu số tiền phạt hiển thị trên màn hình $
-> Bấm nút `"Xác nhận đóng phiên mất thẻ"` $
-> Hệ thống đóng phiên, lưu vết hình ảnh đối soát và mở Barie giải phóng xe.
7.  **Trường hợp xe thuê/Không có giấy tờ gốc:** Nếu tài xế không có Cà vẹt xe (xe thuê, xe doanh nghiệp): Staff gọi điện Hotline báo cho Manager. Manager tiến hành kiểm tra hệ thống camera từ xa, xác minh các câu hỏi bảo mật nghiệp vụ (Giờ vào bãi, vị trí tầng đỗ) $
-> Manager bấm nút Duyệt mở từ xa (Remote Override Open) trên hệ thống Web Admin để xả xe, thông tin này ghi log tuyệt đối vào hệ thống Audit Logs.

#### Flow 5: Đăng ký & Quản lý Thành Viên VIP (VIP Subscription with Dynamic QR Auth)
1.  **Điền thông tin:** Tài xế truy cập Web/App Driver $
-> Chọn mục `"Đăng ký Vé tháng"`. Nhập biển số, chọn phân loại kích cỡ phương tiện, họ tên thông tin chủ xe. *(Hệ thống hiển thị thông báo bắt buộc: "Xác thực hai lớp làn ra sử dụng mã QR động mã hóa trên ứng dụng di động chính chủ").*
2.  **Tải tài liệu:** Tài xế tải lên ảnh chụp Cà vẹt xe, CMND/CCCD và ảnh thực tế góc chính diện mặt trước của xe.
3.  **OCR & Thanh toán:** Bộ lọc cấu trúc OCR Mock thực hiện kiểm tra tính đồng nhất của ký tự biển số xe hiển thị trên giấy tờ và ô nhập liệu. Tài xế tiến hành thực hiện thanh toán gói cước thành viên qua cổng VNPAY Sandbox.
4.  **Phê duyệt:** Sau khi hệ thống nhận dữ liệu Webhook IPN trả về giao dịch thành công, hồ sơ chuyển sang trạng thái `PENDING_APPROVAL`. Manager mở giao diện đối soát giấy tờ trực quan $
-> Bấm nút `"Duyệt"` $
-> Kích hoạt trạng thái VIP sang `ACTIVE`.
5.  **Kích hoạt:** Phương tiện VIP chính thức được cấu hình nhận diện tự động trên toàn hệ thống và tích hợp tiện ích widget tự động sinh Mã QR động mã hóa an ninh chu kỳ 5 phút trên App.

#### Flow 6: Khóa xe an toàn Chống trộm (Anti-theft Security)
1.  **Kích hoạt khóa:** Tài xế sau khi hoàn tất đỗ xe cố định dưới hầm tòa nhà $
-> Mở App Driver $
-> Bật nút `"Khóa xe an toàn"` $
-> Hệ thống lập tức cập nhật trường dữ liệu `is_locked = TRUE` trong cơ sở dữ liệu.
2.  **Đột nhập:** Kẻ gian có hành vi phá khóa cơ học xe, nổ máy và lái xe tiếp cận làn xuất bãi để tẩu tán phương tiện.
3.  **Chặn cứng:** Cho dù kẻ gian dùng bất kỳ chiêu trò gì, khi xe tiến vào làn ra và quét trúng biển số có trạng thái cờ `is_locked == TRUE` $
-> Backend phát lệnh đóng băng cứng thanh chắn Barie, hiển thị bảng cảnh báo Đỏ khẩn cấp chớp nháy lên màn hình PC bốt trực, đồng thời kích hoạt còi hú báo động tại bốt và đẩy tín hiệu Push Notification báo động khẩn cấp trực tiếp về điện thoại của chủ xe thông qua Firebase FCM.
4.  **Giải quyết:** Staff giữ phương tiện tại chỗ, yêu cầu người lái xuất trình ứng dụng di động chính chủ để thực hiện gạt tắt chế độ khóa an toàn về trạng thái `is_locked = FALSE` mới cho phép thông xe giải phóng làn.

#### Flow 7: Cảnh báo Đỗ sai vị trí Xăng/Điện (Post-audit Violation Detection)
1.  **Phát hiện vi phạm:** Mạng lưới cảm biến tại ô đỗ chuyên dụng báo trạng thái đã bị chiếm dụng (`OCCUPIED`), nhưng hệ thống API kết nối từ trụ sạc xe điện trả dữ liệu trạng thái `"Không thực hiện sạc"` liên tục vượt quá mốc thời gian quy định 15 phút $
-> Hệ thống tự động kích hoạt cảnh báo Vàng trên màn hình giám sát trực quan của Staff tuần tra.
2.  **Ghi nhận thực địa:** Staff đi tuần tra khu vực sạc điện, tiến hành chụp ảnh phương tiện vi phạm và bấm nút `"Ghi nhận vi phạm"` trên ứng dụng Web di động gắn liền với mã hiệu ô đỗ cụ thể.
3.  **Xử lý lần 1:** Hệ thống ghi nhận lịch sử vi phạm, chỉ hiển thị dòng văn bản nhắc nhở trên bảng LED bốt trực khi xe thực hiện xuất bãi.
4.  **Xử lý lần 2 trở đi:** Kể từ lần vi phạm thứ hai trở đi được lưu vết, Backend tự động thực hiện cấu hình cộng thêm khoản phí phạt phụ thu vi phạm vị trí đỗ (`parking_violation_penalty`) vào trực tiếp tổng hóa đơn giao dịch thanh toán khi xe ra bãi, bắt buộc tài xế phải hoàn tất đóng khoản phí phạt này mới phát lệnh mở thanh chắn Barie.

---

## 4. ACTORS & FEATURES

### 4.1. System Admin (Quản trị viên)
* CRUD tài khoản nhân sự trong hệ thống (Admin, Manager, Staff).
* Cấu hình phân quyền RBAC chi tiết đến từng Module hành động của các nhóm tài khoản.
* Tra cứu hệ thống nhật ký hành động chuyên sâu (Audit Logs) bảo mật, bất biến phục vụ công tác rà soát lỗi hoặc gian lận.
* Giám sát các chỉ số sức khỏe của hệ thống phần mềm (Trạng thái kết nối DB, Redis, API Latency status).

### 4.2. Manager (Quản lý bãi xe)
* Cấu hình chính sách giá (`pricing_rules`): Thiết lập biểu phí gửi xe theo block giờ, phí phạt mất thẻ vật lý, phí phạt phụ thu đỗ sai khu vực quy định.
* Quản lý cấu hình phân khu Zone: Thiết lập mảng dữ liệu các loại xe được phép tiếp cận (`allowed_vehicle_types`).
* Phê duyệt hoặc Từ chối hồ sơ đăng ký VIP tháng thông qua giao diện đối soát giấy tờ trực tuyến trực quan.
* Dashboard thời gian thực giám sát biểu đồ doanh thu tài chính, tỷ lệ lấp đầy phân khu bãi xe.
* Kích hoạt nút mở cổng cưỡng bức từ xa (`Remote Override Open`) trong các trường hợp khẩn cấp - Lưu vết tuyệt đối vào Audit Log hành vi này.
* Kích hoạt/Tắt chế độ `"Giải tỏa cao điểm"` khi xảy ra tình trạng ùn ứ làn vãng lai.

### 4.3. Staff (Nhân viên vận hành)
* Giám sát luồng dữ liệu camera và quét QR thời gian thực trên giao diện PC bốt trực cổng ra/vào.
* `Override AI`: Thực hiện nhập tay sửa đổi ký tự biển số xe khi mô-đun AI giả lập quét bị sai lệch ký tự do ngoại cảnh.
* Đóng phiên vãng lai thông thường: Thu hồi thẻ tạm, kiểm tra trạng thái thanh toán hóa đơn điện tử của khách.
* Đi tuần thu tiền lưu động dưới hầm bằng thiết bị di động cá nhân khi bãi xe kích hoạt chế độ kẹt xe cao điểm (Flow 3).
* Xử lý nghiệp vụ mất thẻ vãng lai: Đối chiếu ảnh check-in hệ thống, thu phí phạt phụ thu đúng quy trình bảo mật.

### 4.4. Driver VIP (Tài xế Thành viên)
* Đăng ký gói cước thành viên/vé tháng trực tuyến: Upload tài liệu minh chứng (Cà vẹt, CMND/CCCD, ảnh xe).
* Ra/vào làn VIP tự động thông qua cơ chế xác thực hai lớp an ninh bảo mật cao (AI Camera + Chủ động sinh mã QR xuất bãi trên thiết bị di động).
* Bật/Tắt widget khóa xe an toàn chống trộm từ xa (`Anti-theft lock`) bất cứ lúc nào khi xe đã đỗ cố định.
* Xem lịch sử giao dịch hóa đơn tài chính và xem gợi ý sơ đồ khu vực phân tầng đỗ còn trống phù hợp với phân loại phương tiện.

### 4.5. Driver Vãng lai (Tài xế Khách)
* Nhận Thẻ Tạm vật lý tự động nhả từ máy phát đầu cổng vào của làn vãng lai.
* Di chuyển đỗ xe theo chỉ dẫn hiển thị thời gian thực trên các bảng bảng hiển thị LED điều hướng phân tầng.
* Hoàn trả lại Thẻ Tạm vật lý + hoàn tất thanh toán hóa đơn tài chính tại làn vãng lai của cổng ra (hoặc thanh toán trước dưới hầm cho Staff đi tuần).

---

## 5. CÔNG NGHỆ VÀ KỸ THUẬT THỰC HIỆN

| Layer | Technology | Mục đích thực hiện |
| :--- | :--- | :--- |
| **Backend** | Java Spring Boot | Thiết lập cấu trúc hệ thống RESTful API mạnh mẽ, quản lý các thuật toán logic và điều phối luồng nghiệp vụ lõi của bãi xe. |
| **Security** | JWT (JSON Web Token) | Thực thi cơ chế xác thực an toàn hệ thống với mã hóa chữ ký mã hóa, thiết lập Access Token (15 phút) và Refresh Token (7 ngày) lưu DB phục vụ Force Logout. |
| **API Docs** | Swagger UI / OpenAPI 3.0 | Tự động biên dịch tài liệu đặc tả cấu trúc API Contract phục vụ quá trình kết nốiFrontend và thiết lập Mock API giả lập thiết bị. |
| **Frontend** | ReactJS | Xây dựng kiến trúc Single Page Application phục vụ màn hình làm việc quản trị máy tính của Admin, Manager, và Staff trực bốt. |
| **Mobile Web** | ReactJS Responsive (PWA) | Tối ưu hiển thị ứng dụng di động gọn nhẹ, tương thích tốt với thiết bị màn hình nhỏ của Driver VIP và Staff đi tuần lưu động dưới hầm. |
| **Main DB** | PostgreSQL hoặc MySQL | Quản lý hệ cơ sở dữ liệu quan hệ chặt chẽ, đảm bảo tính toàn vẹn dữ liệu cho các giao dịch tài chính phức tạp và lịch sử đỗ xe (Chuẩn ACID). |
| **Cache Layer** | Redis | Bộ nhớ đệm lưu trữ dữ liệu nóng có tần suất truy cập cao (số ô đỗ trống của từng tầng) để đồng bộ nhanh thời gian thực lên bảng hiển thị LED ngoài cổng. |
| **Storage** | MinIO / AWS S3 | Lưu trữ tệp tin hình ảnh camera AI chụp lúc vào/ra, tệp hình ảnh hồ sơ CMND/CCCD, Cà vẹt xe phục vụ đối soát và lưu vết bằng chứng vi phạm. |
| **Payment** | VNPay Sandbox | Tích hợp cổng thanh toán giả lập xử lý luồng kết nối Webhook IPN để tự động kích hoạt trạng thái vé tháng thành viên khi chuyển khoản thành công. |
| **Notification**| Firebase FCM | Đẩy tín hiệu thông báo còi hú thời gian thực về thiết bị di động Driver ngay lập tức khi phát hiện hành vi gian lận hoặc đột nhập phá khóa xe an toàn. |
| **Mock Devices**| Mock REST APIs | Thiết lập các Endpoint giả lập dữ liệu truyền nhận dạng JSON của Barie, Camera AI, Máy phát thẻ và Đầu quét mã QR để chứng minh giải pháp phần mềm chạy tốt. |

---

## 6. NON-FUNCTIONAL REQUIREMENTS (YÊU CẦU PHI CHỨC NĂNG)

* **Performance Latency:** Phản hồi của các Endpoint API xử lý luồng nghiệp vụ cốt lõi (Check-in, Check-out, QR Validation) phải đạt hiệu năng **< 200ms** ở mốc độ đo percentile 95 (p95) dưới điều kiện kiểm thử tải 100 người dùng đồng thời.
* **AI & Hardware Mock Latency:** Thời gian phản hồi giả lập của luồng đọc biển số từ AI Camera và giải mã chuỗi token mã hóa của mã QR động không được vượt quá **2 giây** trước khi đưa ra chỉ thị điều phối hiển thị lên LED.
* **Barrier Execute Delay:** Lệnh kích nổ mở thanh chắn Barie kỹ thuật số phải được truyền tải thành công tới Mock Barrier Controller trong vòng **< 500ms** sau khi Backend xác nhận biến phiên đỗ hợp lệ.
* **System Availability:** Hệ thống phần mềm điều hành quản lý phải đạt chỉ số sẵn sàng hoạt động liên tục **Uptime > 99.5%** trên môi trường vận hành, đảm bảo bãi xe hoạt động xuyên suốt 24/7 không gián đoạn.
* **Data Retention Lifecycle:** Hình ảnh lưu vết ngoại quan phương tiện của camera AI tự động chạy script dọn dẹp xóa bỏ sau **30 ngày** để tối ưu hóa không gian lưu trữ của Object Storage; dữ liệu giao dịch hóa đơn tài chính bắt buộc lưu trữ bất biến tối thiểu **3 năm** phục vụ công tác thanh tra kiểm toán thuế.
* **Security Guardrails:** Bắt buộc thực hiện mã hóa một chiều mật khẩu tài khoản bằng thuật toán **Bcrypt (với cost factor = 10)**, thiết lập hàng rào chống tấn công SQL Injection thông qua cơ chế *Parameter Binding* nghiêm ngặt của ORM, và ép buộc giao thức bảo mật mã hóa **HTTPS** trên toàn bộ các kết nối API Client-Server.

---

## 7. CONCEPTUAL & LOGICAL ERD

### 7.1. Mô hình Khái niệm (Conceptual ERD)
* **users:** Thực thể lưu trữ định danh tài khoản con người trong hệ thống. Quan hệ phân tầng: `1 User (Driver)` $
-> Quản lý sở hữu `N Vehicles`; `1 User (Manager)` $
-> Thực hiện phê duyệt `N` hồ sơ `vip_subscriptions`.
* **vehicles:** Thực thể phương tiện gửi xe cụ thể. Quan hệ phân tầng: `1 Vehicle` $
-> Liên kết duy nhất với `1` bản ghi hồ sơ VIP `vip_subscriptions` (Mối quan hệ 1:1 bảo mật tuyệt đối dựa trên token QR tài khoản chính chủ); `1 Vehicle` $
-> Khởi tạo `N` phiên đỗ `parking_sessions` theo dòng thời gian gửi xe.
* **parking_sessions:** Thực thể trung tâm quản lý logic, lưu vết trạng thái của một chiếc xe đang nằm trong bãi. Quan hệ phân tầng: `1 Session` $
-> Gán với `1 Thẻ Tạm cards` (Chỉ áp dụng cho đối tượng khách vãng lai, đối với khách VIP trường khóa ngoại này nhận giá trị `NULL`); `1 Session` $
-> Thuộc về quản lý của `1 phân khu zones`; `1 Session` $
-> Kích hoạt phát sinh `1 Hóa đơn thanh toán transactions`.
* **vip_subscriptions:** Hồ sơ đăng ký vé tháng gia hạn của phương tiện. Quan hệ phân tầng: Mối quan hệ `1:1` nghiêm ngặt với bảng `vehicles` thông qua ràng buộc khóa ngoại độc nhất, phục vụ luồng kiểm tra an ninh đầu ra cổng tự động VIP mà không cần phần cứng cơ học hỗ trợ.
* **cards:** Thực thể quản lý kho Thẻ Tạm vật lý sử dụng tại làn vãng lai. Quan hệ phân tầng: `1 Card` $
-> Liên kết với tối đa `1 phiên đỗ parking_sessions` đang ở trạng thái hoạt động (`ACTIVE`) tại một thời điểm nhất định.
* **zones & parking_slots:** Thực thể định nghĩa cấu trúc không gian hình học tầng hầm bãi xe. Quan hệ phân tầng: `1 Zone` $
-> Chứa `N ô đỗ parking_slots` chuyên biệt; `1 Slot` $
-> Phát sinh `N bản ghi` lịch sử vi phạm vị trí đỗ `parking_violations`.

### 7.2. Cấu trúc bảng Chi tiết (Logical ERD Schema)

#### Bảng: `users`
| Column | Type | Constraint | Mô tả |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Khóa chính của bảng tài khoản người dùng. |
| **username** | VARCHAR(50) | UNIQUE NOT NULL | Tên đăng nhập hệ thống không trùng lặp. |
| **password_hash** | VARCHAR(255) | NOT NULL | Chuỗi hash mật khẩu bảo mật mã hóa bằng Bcrypt (cost=10). |
| **full_name** | VARCHAR(100) | NOT NULL | Họ và tên thật của người dùng phục vụ đối soát. |
| **email** | VARCHAR(100) | UNIQUE NOT NULL | Địa chỉ thư điện tử liên hệ chính chủ. |
| **phone** | VARCHAR(15) | NULL | Số điện thoại liên lạc khi cần thông báo khẩn cấp. |
| **role** | ENUM | NOT NULL | Quyền hệ thống: `ADMIN`, `MANAGER`, `STAFF`, `DRIVER`. |
| **status** | ENUM | DEFAULT 'ACTIVE' | Trạng thái tài khoản: `ACTIVE`, `INACTIVE`, `SUSPENDED`. |
| **fcm_token** | VARCHAR(255) | NULL | Mã Firebase phục vụ bắn tín hiệu báo động chống trộm thời gian thực. |
| **created_at** | TIMESTAMP | DEFAULT NOW() | Thời điểm khởi tạo tài khoản hệ thống. |

#### Bảng: `vehicles`
| Column | Type | Constraint | Mô tả |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Khóa chính phương tiện. |
| **owner_id** | UUID | FK $
-> `users(id)` | Mã định danh chủ sở hữu xe (Tài xế). |
| **license_plate** | VARCHAR(20) | UNIQUE NOT NULL | Ký tự biển số xe viết liền không dấu (Ví dụ: `51A-11111`). |
| **vehicle_type** | ENUM | NOT NULL | Phân loại kích cỡ để phân tầng đỗ: `CAR_4`, `CAR_7`, `VAN_16`, `TRUCK`. |
| **color** | VARCHAR(30) | NULL | Màu sắc phương tiện giúp thuật toán AI double-check ngoại quan. |
| **brand** | VARCHAR(50) | NULL | Nhãn hiệu chế tạo xe (Ví dụ: Toyota, VinFast). |
| **registration_doc_url**| VARCHAR(255) | NULL | Đường dẫn URL lưu trữ ảnh quét Cà vẹt xe trên hệ thống S3. |
| **is_active** | BOOLEAN | DEFAULT TRUE | Trạng thái hoạt động của phương tiện trong hệ thống. |

#### Bảng: `parking_sessions` (Bảng nghiệp vụ trung tâm)
| Column | Type | Constraint | Mô tả |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Khóa chính của phiên gửi xe. |
| **license_plate** | VARCHAR(20) | NOT NULL | Biển số phương tiện ghi nhận thực tế từ Camera AI cổng vào. |
| **vehicle_id** | UUID | FK $
-> `vehicles`, NULL | ID xe hệ thống (Nhận giá trị `NULL` nếu là xe khách vãng lai). |
| **card_id** | UUID | FK $
-> `cards`, NULL | ID thẻ tạm vãng lai (Nhận giá trị `NULL` nếu xe ra vào bằng làn VIP). |
| **validated_qr_id** | UUID | FK $
-> `vip_qr_identifiers`| ID mã QR động đã thực hiện đối soát xác thực thành công cổng ra. |
| **check_in_time** | TIMESTAMP | NOT NULL DEFAULT NOW()| Thời gian phương tiện vượt qua thanh chắn tiến vào bãi xe. |
| **check_out_time** | TIMESTAMP | NULL | Thời gian xuất bãi (Nhận giá trị `NULL` khi phiên đỗ còn `ACTIVE`). |
| **assigned_zone_id** | UUID | FK $
-> `zones`, NOT NULL| Mã ID phân khu tầng đỗ hệ thống chỉ định điều hướng từ đầu cổng. |
| **session_status** | ENUM | DEFAULT 'ACTIVE' | Trạng thái: `ACTIVE`, `COMPLETED`, `PASSED_CONFIRMED`, `LOST_CARD`. |
| **is_vip** | BOOLEAN | DEFAULT FALSE | Cờ phân tách đối tượng: VIP = `TRUE`, Vãng lai = `FALSE`. |
| **is_locked** | BOOLEAN | DEFAULT FALSE | Cờ trạng thái cấu hình khóa chống trộm từ xa kích hoạt từ App Driver. |
| **is_suspicious** | BOOLEAN | DEFAULT FALSE | Cờ phát hiện dấu hiệu gian lận hoặc tráo đổi biển số/ngoại quan xe. |
| **suspicious_reason** | VARCHAR(100) | NULL | Chi tiết lý do nghi vấn hệ thống tự động gắn cờ cảnh báo. |
| **mobile_checkout_staff_id**| UUID | FK $
-> `users`, NULL | ID của nhân viên thu tiền lưu động dưới hầm khi xảy ra kẹt xe. |
| **mobile_checkout_location**| VARCHAR(100) | NULL | Tọa độ dữ liệu GPS ghi nhận khi Staff thu tiền di động dưới hầm. |
| **override_by_staff** | UUID | FK $
-> `users`, NULL | ID của nhân viên bấm nút ghi đè sửa đổi lỗi nhận diện camera AI. |

#### Tóm tắt cấu trúc các Bảng bổ trợ còn lại trong Hệ thống
* **`vip_qr_identifiers`:** `id`, `vehicle_id [FK]`, `qr_token [UNIQUE]`, `purpose` (ENUM: `CHECK_IN`, `CHECK_OUT`), `expired_at`, `is_used`, `created_at`. Bảng quản lý vòng đời chu kỳ 5 phút bảo mật của mã QR động mã hóa.
* **`vip_subscriptions`:** `id`, `vehicle_id [FK, UQ]`, `type`, `start_date`, `end_date`, `status` (`PENDING_APPROVAL`, `ACTIVE`, `EXPIRED`, `REJECTED`), `photos_urls` (Cấu trúc JSON chứa mảng URL ảnh CMND/Cà vẹt), `approved_by [FK]`, `fee_amount`, `payment_reference`.
* **`cards`:** `id`, `card_number [UNIQUE]`, `card_type` (Mặc định `TEMP`), `status` (`AVAILABLE`, `IN_USE`, `LOST`, `DAMAGED`).
* **`zones`:** `id`, `zone_name`, `zone_code [UNIQUE]`, `allowed_vehicle_types` (Cấu trúc JSON lưu mảng dữ liệu phân loại xe được phép đỗ), `total_slots`, `current_occupied`, `barrier_api_url`, `is_active`.
* **`parking_slots`:** `id`, `zone_id [FK]`, `slot_number` (Ví dụ: `F1-A01`), `slot_status` (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
* **`transactions`:** `id`, `session_id [FK]`, `parking_fee`, `lost_card_penalty`, `parking_violation_penalty`, `total_amount`, `payment_method`, `payment_status` (`PENDING`, `SUCCESS`, `FAILED`), `processed_by [FK]`, `is_mobile_checkout`, `mobile_location`.
* **`pricing_rules`:** `id`, `vehicle_type [ENUM]`, `first_hour_fee`, `additional_hour_fee`, `max_daily_fee`, `lost_card_penalty`, `parking_violation_penalty`, `effective_from [TIMESTAMP]`, `effective_to [TIMESTAMP, NULL]`.
* **`ai_scan_logs`:** `id`, `session_id [FK]`, `scan_location`, `camera_id`, `image_url`, `detected_plate`, `confidence_score`, `detected_color`, `is_overridden`, `override_plate`, `override_by [FK]`.
* **`blacklisted_cards`:** `id`, `card_id [FK, UQ]`, `session_id [FK]`, `reason` (Mặc định `LOST`), `blacklisted_by [FK]`, `blacklisted_at`, `notes`.
* **`audit_logs`:** `id`, `user_id [FK]`, `action_type [ENUM]`, `entity_type`, `entity_id`, `old_value [JSON]`, `new_value [JSON]`, `ip_address`, `timestamp`. Bảng nhật ký hành động bất biến tuyệt đối.
* **`parking_violations`:** `id`, `session_id [FK]`, `slot_id [FK]`, `violation_type` (Mặc định `WRONG_ZONE_OCCUPANCY`), `photo_urls [JSON]`, `detected_by [FK]`, `penalty_applied`, `penalty_amount`.
* **`refresh_tokens`:** `id`, `user_id [FK]`, `token [UUID, UNIQUE]`, `expires_at` (Hết hạn nghiêm ngặt sau 7 ngày kể từ khi tạo).

---

## 8. BUSINESS RULES — QUY TẮC NGHIỆP VỤ CỨNG

### 8.1. Nhóm BR-AUTH & ACCESS (Xác thực tài khoản)
* **BR-AUTH-01:** Mỗi tài khoản đăng nhập khi khởi tạo bắt buộc chỉ được phép sở hữu một phân vai duy nhất thuộc mảng quyền hệ thống, trường dữ liệu `role` tuyệt đối không nhận giá trị `NULL` hoặc chứa đa trị, đảm bảo tính phân rã an ninh bảo mật tối đa.
* **BR-AUTH-02:** Mã Token mã hóa JWT Access giới hạn nghiêm ngặt hiệu lực hoạt động trong vòng 15 phút. Token Refresh dùng để tái cấp phát cấu hình vòng đời tồn tại 7 ngày, bắt buộc lưu vết trực tiếp trong DB để hỗ trợ lệnh vô hiệu hóa cưỡng bức (Force Revoke) từ Admin khi có hành động đăng xuất hoặc phát hiện xâm nhập trái phép.

### 8.2. Nhóm BR-ENTRY (Ràng buộc cổng vào bãi)
* **BR-ENTRY-01:** Một phương tiện chỉ được phép khởi tạo phiên đỗ xe mới (`ParkingSession`) nếu hệ thống kiểm tra và ghi nhận ký tự biển số đó hoàn toàn không nằm trong danh sách đen (`blacklisted_plates`) và số lượng phiên gửi xe đang ở trạng thái hoạt động hiện hành của chính biển số đó trong bãi xe bằng đúng 0.
* **BR-ENTRY-02:** Quy tắc làn VIP tự động tại cổng vào: Hệ thống tự động nhận diện thông qua AI Camera (Plate + Color) để cho xe vào. Trường hợp thiết bị camera AI gặp sự cố kỹ thuật hoặc mờ biển số do tác động thời tiết (Độ tin cậy của thuật toán `Confidence < 70%`), hệ thống cho phép Tài xế quét mã QR Động Vào Bãi (Check-in QR) sinh ra trực tiếp trên App Driver. Mã QR này phải thỏa mãn điều kiện: Thời gian hiện tại nằm trong hạn hiệu lực (`NOW <= expired_at`) và trạng thái sử dụng của mã là chưa từng được sử dụng (`is_used == FALSE`). Sau khi quét thành công, trạng thái QR cập nhật lập tức thành `is_used = TRUE`.

### 8.3. Nhóm BR-EXIT (Ràng buộc cổng xuất bãi)
* **BR-EXIT-01 (MFA Bắt buộc làn VIP):** Hệ thống chỉ thực hiện phát lệnh nhấc thanh chắn Barie tự động cho xe VIP xuất bãi khi và chỉ khi đáp ứng **ĐỒNG THỜI** cả 4 điều kiện an ninh sau đây:
    1.  AI Camera quét nhận diện trùng khớp ký tự biển số xe thuộc diện Thành Viên VIP trạng thái `ACTIVE` trong DB.
    2.  Phương tiện đang sở hữu một phiên gửi xe trạng thái `ACTIVE` hợp lệ trong lòng bãi xe.
    3.  Cờ cấu hình bảo vệ khóa an toàn chống trộm từ xa đang gạt tắt (`is_locked == FALSE`).
    4.  Tài xế thực hiện quét thành công mã QR Động Xuất Bãi (Check-out QR) sinh ra từ App Driver chính chủ của tài khoản sở hữu. Chuỗi mã QR này phải giải mã hợp lệ, thuộc về đúng xe đang đứng tại làn và trạng thái lưu trữ của mã là chưa từng được sử dụng.
* **BR-EXIT-02:** Nếu xe thuộc diện VIP tiến vào làn ra, AI Camera quét thành công biển số nhưng tài xế cố tình không thực hiện quét mã QR xuất bãi trong vòng mốc thời gian trần **30 giây**, hoặc quét mã QR báo lỗi (Hết hạn/Sai tài khoản sở hữu phương tiện), thanh chắn Barie giữ nguyên trạng thái đóng băng khóa cứng, bảng hiển thị LED ngoài cổng lập tức chuyển đỏ hiện dòng văn bản cảnh báo: `"BẮT BUỘC QUÉT QR XUẤT BÃI TRÊN APP DRIVER"`.
* **BR-EXIT-03:** Quy tắc làn vãng lai cổng ra: Xe vãng lai chỉ được phép giải phóng xe ra khỏi bãi khi trạng thái hóa đơn thanh toán của phiên đỗ (`transactions`) chuyển đổi hoàn toàn sang trạng thái `PAID` và Thẻ Tạm vật lý đã được quẹt thu hồi thành công, chuyển đổi trạng thái thẻ về lại kho `AVAILABLE` phục vụ tuần hoàn.
* **BR-EXIT-04:** Cách thức tính toán biểu phí gửi xe vãng lai thực hiện block theo giờ dựa trên quy tắc hàm làm tròn lên (`ceil`). Mức giá áp dụng căn cứ theo mốc thời gian áp dụng (`effective_from <= check_in_time <= effective_to`) và giá trị tổng hóa đơn trong một ngày của một phiên đỗ tuyệt đối không được vượt quá ngưỡng giá trần `max_daily_fee` cấu hình cho phân loại phương tiện đó.

### 8.4. Nhóm BR-CONGEST (Giải tỏa kẹt xe cao điểm)
* **BR-CON-01:** Quyền hạn kích hoạt và tắt cơ chế hoạt động thu phí lưu động di động dưới tầng hầm thuộc đặc quyền của tác nhân Quản lý (`MANAGER`) hoặc Quản trị viên cao cấp (`ADMIN`).
* **BR-CON-02:** Mỗi bản ghi thanh toán di động do Staff thực hiện dưới hầm bắt buộc phải nạp đầy đủ tham số đầu vào cho API bao gồm: Tọa độ vị trí dữ liệu GPS của thiết bị Staff, nhãn thời gian thực hiện (`timestamp`), và URL tệp tin ảnh chụp bằng chứng hoàn tất thu tiền (Ảnh tiền mặt trực tiếp hoặc ảnh chụp màn hình ứng dụng ngân hàng của khách hiển thị trạng thái giao dịch thành công). Nếu thiếu một trong các trường trên, Backend từ chối đóng hóa đơn sớm.
* **BR-CON-03 (Điều hướng xe giải tỏa):** Xe vãng lai sau khi hoàn tất các thủ tục thanh toán lưu động dưới hầm (Trạng thái `session_status` chuyển sang `PASSED_CONFIRMED`) bắt buộc phải di chuyển tịnh tiến thẳng ra ngoài bằng cổng ra của Làn Vãng Lai (Tuyệt đối không điều hướng rẽ sang làn VIP để tránh di chuyển cắt mặt gây xung đột giao thông). Khi tới bốt trực, tài xế đưa lại thẻ tạm cho Staff quẹt thu hồi, hệ thống phát hiện trạng thái cờ `PASSED_CONFIRMED == TRUE` sẽ phát lệnh tự động nhấc thanh chắn lập tức mà không thu phí lần 2. Phiên đóng tiền lưu động dưới hầm có thời hạn hiệu lực di chuyển xuất bãi trong vòng tối đa **30 phút** kể từ thời điểm Staff bấm nút xác nhận.

### 8.5. Nhóm BR-LOST & VIP (Mất thẻ & Vé tháng)
* **BR-VIP-01:** Hồ sơ đăng ký gói cước thành viên vé tháng trực tuyến yêu cầu bắt buộc điền thông tin biển số xe, thông tin chủ sở hữu xe và tải lên đầy đủ bộ 3 loại ảnh chụp minh chứng gốc (Cà vẹt xe, CMND/CCCD hai mặt, ảnh thực tế góc chính diện mặt trước của phương tiện). Loại bỏ hoàn toàn các trường dữ liệu liên quan đến mã định danh phần cứng dán trên xe.
* **BR-LOST-01:** Ngay khi nhân viên trực bốt bấm nút `"Xác nhận đóng phiên mất thẻ"`, ID của thẻ tạm vật lý cũ lập tức bị khóa vĩnh viễn vào bảng `blacklisted_cards` và chuyển trạng thái thẻ sang `LOST`, nghiêm cấm hành vi cấu hình hoàn trả thẻ này về kho `AVAILABLE` để tái sử dụng nhằm triệt tiêu các lỗ hổng gian lận nhặt thẻ vượt cổng. Quy trình đóng phiên mất thẻ yêu cầu bắt buộc phải chụp ảnh minh chứng CCCD/Cà vẹt của người khai báo để lưu vết kiểm toán hệ thống.

### 8.6. Nhóm BR-DATA (Thời hạn lưu trữ & Tính bất biến)
* **BR-DATA-01:** Dữ liệu hóa đơn tài chính và lịch sử phiên đỗ phương tiện (`transactions`, `parking_sessions`) thuộc danh mục bảo mật cấp độ cao, bắt buộc lưu trữ bất biến tối thiểu **3 năm** phục vụ công tác thanh tra kiểm toán thuế.
* **BR-DATA-02:** Mọi hành động can thiệp ghi đè hệ thống nhạy cảm của con người (`OVERRIDE_AI`, `REMOTE_OPEN_BARRIER`, `LOST_CARD_CONFIRM`) bắt buộc phải ghi log chi tiết vào bảng `audit_logs`. Hệ thống không thiết kế bất kỳ một Endpoint REST API nào có chức năng sửa đổi hoặc xóa (`DELETE`) dữ liệu của bảng `audit_logs`, đảm bảo tính bất biến hoàn toàn phục vụ công tác hậu kiểm và chống gian lận nội bộ từ nhân viên.

---

## 9. USER GUIDE — QUY TRÌNH THAO TÁC CỦA CÁC TÁC NHÂN

### 9.1. Giao diện dành cho Tài xế Thành viên (Driver VIP App)
* **Quy trình xuất bãi làn VIP bằng xác thực hai lớp:** Khi lái xe đến vị trí vạch dừng cổng ra làn VIP, tài xế mở điện thoại, truy cập vào App Driver và nhấn nút `"Sinh mã QR xuất bãi"`. Hệ thống sẽ hiển thị một mã QR động kèm thanh bộ đếm ngược thời gian (1 phút / 60 giây). Tài xế hướng màn hình điện thoại vào mắt đọc thiết bị quét QR đặt tại làn ra chính. Sau khi đầu quét phát tiếng bíp tín hiệu thành công và camera AI nhận diện đúng biển số xe, thanh chắn tự động nhấc lên thông xe.
* **Quy trình kích hoạt chế độ Khóa xe an toàn:** Khi đã đỗ xe cố định trong vạch ô thuộc hầm tòa nhà, tài xế mở ứng dụng di động, chọn phương tiện đang gửi và gạt nút `"Khóa xe chống trộm"`. Hệ thống gửi tín hiệu API thiết lập trạng thái an ninh bảo vệ phương tiện. Trước khi lái xe ra về, tài xế bắt buộc phải truy cập ứng dụng để gạt tắt chế độ khóa an toàn, cho phép hệ thống triển khai luồng đối soát tự động.

### 9.2. Giao diện bốt kiểm soát cổng ra (Staff PC Web Terminal)
* **Giám sát luồng ra làn VIP:** Nhân viên không cần thao tác quẹt thẻ đối với xe VIP. Màn hình giao diện sẽ hiển thị song song luồng quét của AI Camera và luồng giải mã Token của mã QR động do khách hàng tự quét. Nếu hai lớp dữ liệu trùng khớp tín hiệu xanh, hệ thống báo `"MATCH — VIP QR EXIT"`. Trường hợp màn hình nhấp nháy dòng trạng thái chờ quét QR hoặc báo lỗi lệch tài khoản, Staff tiến hành hỗ trợ hướng dẫn tài xế làm mới mã trên ứng dụng điện thoại.
* **Quy trình xử lý đóng phiên Vãng lai thông thường:** Nhân viên nhận thẻ tạm từ tài xế, thực hiện quẹt thẻ hoặc nhập thủ công mã số thẻ vào ô xử lý trên màn hình PC. Giao diện hiển thị tức thì số tiền cần thu tính toán tự động từ block giờ gửi xe kèm ảnh chụp trực quan lúc xe vào bãi để nhân viên đối chiếu ngoại quan xe. Hệ thống tự động đẩy thông tin số tiền và mã QR thanh toán tĩnh lên bảng LED cổng ra cho khách quét. Sau khi thu tiền mặt hoặc hệ thống thông báo trạng thái hóa đơn điện tử thành công, nhân viên cất thẻ vào hộp thu hồi và bấm nút `"Xác nhận thu tiền"` trên màn hình, Barie tự động nhấc giải phóng phương tiện.

### 9.3. Giao diện thực địa di động (Staff Mobile Web POS)
* **Quy trình xử lý kẹt xe lưu động giờ cao điểm dưới hầm (Flow 3):** Khi bãi xe bật chế độ `"Giải tỏa cao điểm"`, nhân viên cầm thiết bị di động đi bộ dọc làn xe đang xếp hàng chờ dưới hầm. Tại mỗi đầu xe vãng lai, nhân viên bật camera trên ứng dụng quét biển số xe, hệ thống tự động kiểm tra thời gian gửi và xuất hóa đơn giá tiền trực tiếp trên màn hình di động Staff. Nhân viên cho khách quét mã QR thanh toán trực tiếp tại chỗ, sau khi nhận tiền, Staff bấm nút `"Xác nhận thanh toán lưu động"` trên giao diện App Mobile. Hệ thống ghi nhận trạng thái session sang `PASSED_CONFIRMED`, Staff hoàn trả thẻ tạm lại cho tài xế giữ và hướng dẫn tài xế tiếp tục di chuyển thẳng ra Làn Vãng Lai đầu cổng chính để nộp thẻ xuất bãi nhanh chóng mà không cần dừng xe đóng tiền lại.
