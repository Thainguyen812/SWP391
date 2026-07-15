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
POST /api/checkout/{cardId} -> calculates fee and returns invoice
POST /api/transactions/{id}/confirm -> marks PAID (Staff action or webhook)

Errors: 400 validation, 409 if session not ACTIVE.

## 4. ACCEPTANCE CRITERIA
- Given session active and payment completed, checkout closes session and frees slot.
- Payment webhook updates transaction status reliably.
