# ĐẶC TẢ KỸ THUẬT: TASK 7 - BASEMENT MOBILE CHECKOUT SERVICE & STAFF MOBILE POS UI

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: mobile transaction record
- Read: session lookup by plate
- Update: mark PASSED_CONFIRMED

### 1.2. Data Fields
parking_sessions.mobile_checkout_staff_id, mobile_checkout_location, session_status
transactions.is_mobile_checkout, mobile_location

### 1.3. Business Rules
- Mobile checkout requires GPS, timestamp, proof image
- After mobile confirm, session status PASSED_CONFIRMED valid for 30 minutes

### 1.4. RBAC
Staff role required; Manager/Admin can enable congestion mode

## 2. FRONT-END SPECIFICATIONS
Responsive staff PWA: scan plate, show fee, capture proof image, submit GPS (from device).

## 3. BACK-END SPECIFICATIONS
POST /api/mobile-checkout {plate, staffId, gps, proofImage} -> 200 {sessionId, status: PASSED_CONFIRMED}
Automatic expiry job to revert if not exited within 30 minutes.

## 4. ACCEPTANCE CRITERIA
- Mobile checkout with all required fields succeeds and session marked PASSED_CONFIRMED.
- Missing proof/GPS -> 400 Bad Request.
