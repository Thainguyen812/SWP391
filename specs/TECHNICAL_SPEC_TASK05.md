//Thành
# ĐẶC SẢ KỸ THUẬT: TASK 5 - STANDARD CHECK-OUT API & CASUAL GUEST PAYMENT TERMINAL

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: create Transaction on checkout
- Read: fetch session and transaction
- Update: mark transaction PAID
- Delete: n/a

### 1.2. Data Fields
transactions: id, session_id, parking_fee, total_amount, payment_method, payment_status, processed_by

### 1.3. Business Rules
- Fee calculation uses pricing_rules, rounding up per block hour; cap at max_daily_fee
- Guest exit only when payment_status == SUCCESS and card returned

### 1.4. RBAC
Staff processes payment; system can accept webhook from Payment Gateway.

## 2. FRONT-END SPECIFICATIONS
Staff checkout UI: input card id, display fee breakdown, show QR for payment, Confirm button.

## 3. BACK-END SPECIFICATIONS
### 3.1 Calculate Casual Guest Check-out Fee

Endpoint:

POST /api/parking/check-out/casual

Description:

Staff quẹt thẻ tạm của khách vãng lai. Backend dùng cardId để tìm parking session đang ACTIVE, sau đó tính phí và trả thông tin phiên gửi xe về cho màn hình staff.

Request Body:

{
  "cardId": "CARD001",
}

Response Success:

{
  "sessionId": "S001",
  "licensePlate": "51A-12345",
  "cardId": "CARD001",
  "checkInTime": "2026-06-08T08:00:00Z",
  "parkingHours": 3,
  "totalFee": 30000,
  "status": "PENDING_PAYMENT"
}

### 3.2 Confirm Casual Guest Payment

Endpoint:

POST /api/parking/check-out/casual/confirm

Request Body:

Description:

Sau khi staff thu tiền thành công, frontend gửi lệnh xác nhận. Backend đổi trạng thái session sang COMPLETED, cập nhật thẻ tạm về AVAILABLE và trả lệnh mở barrier.


{
  "sessionId": "S001",
  "paymentMethod": "CASH",
  "processedBy": "STAFF001"
}

Response Success:

{
  "sessionId": "S001",
  "status": "COMPLETED",
  "barrierCommand": "OPEN"
}

Errors:

- 400 validation error
- 404 active session not found
- 409 session is not ACTIVE

## 4. ACCEPTANCE CRITERIA
- Given session active and payment completed, checkout closes session and frees slot.
- Payment webhook updates transaction status reliably.
