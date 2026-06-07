# ĐẶC TẢ KỸ THUẬT: TASK 9 - DRIVER PWA: ETC VIP SUBSCRIPTION & ANTI-THEFT TOGGLE

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: vip_subscriptions
- Read: subscription status
- Update: is_locked toggle

### 1.2. Data Fields
vip_subscriptions: id, vehicle_id, type, start_date, end_date, status, photos_urls, approved_by
vehicles: etc_tag_code required
parking_sessions.is_locked flag

### 1.3. Business Rules
- ETC mandatory for VIP subscription
- Anti-theft toggles is_locked on active sessions

### 1.4. RBAC
Driver can manage own subscription; Manager approves

## 2. FRONT-END SPECIFICATIONS
PWA screens: subscription form with document upload, subscription status page, anti-theft toggle switch.

## 3. BACK-END SPECIFICATIONS
POST /api/vip/register -> create vip_subscriptions PENDING_APPROVAL
POST /api/vip/activate/{id} (Manager) -> set ACTIVE
POST /api/vehicle/{id}/lock -> set is_locked

## 4. ACCEPTANCE CRITERIA
- Registration without etc_tag_code rejected.
- Toggling is_locked prevents exit until cleared.
