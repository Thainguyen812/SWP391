# ĐẶC TẢ KỸ THUẬT: TASK 9 - DRIVER PWA: VIP SUBSCRIPTION & ANTI-THEFT TOGGLE

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: vip_subscriptions
- Read: subscription status
- Update: is_locked toggle

### 1.2. Data Fields
- vip_subscriptions: id, vehicle_id, type, start_date, end_date, status, photos_urls, approved_by
- parking_sessions.is_locked flag

### 1.3. Business Rules
- Anti-theft toggles is_locked on active sessions
- VIP drivers can register subscription through Driver PWA.
- Registration requires vehicle information and supporting documents.
- Anti-theft feature toggles is_locked on active sessions.
- When is_locked = true, vehicle exit is blocked until the owner disables the lock from the Driver App.

### 1.4. RBAC
Driver can manage own subscription; Manager approves

## 2. FRONT-END SPECIFICATIONS
PWA screens: subscription form with document upload, subscription status page, anti-theft toggle switch.

## 3. BACK-END SPECIFICATIONS
POST /api/vip/register -> create vip_subscriptions PENDING_APPROVAL
POST /api/vip/activate/{id} (Manager) -> set ACTIVE
POST /api/vehicle/{id}/lock -> set is_locked

## 4. ACCEPTANCE CRITERIA
- VIP registration creates a PENDING_APPROVAL subscription.
- Manager can approve and activate subscription.
- Toggling is_locked prevents vehicle exit until the lock is disabled.
