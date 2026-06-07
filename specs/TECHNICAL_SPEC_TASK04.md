# ĐẶC TẢ KỸ THUẬT: TASK 4 - SMART CHECK-IN API & STAFF GATE CONTROL TERMINAL

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: create ParkingSession on check-in
- Read: list active sessions
- Update: assign zone, override plate
- Delete: close session on checkout

### 1.2. Data Fields
parking_sessions: id, license_plate, vehicle_id, assigned_zone_id, check_in_time, session_status, ai_check_in_image, detected_etc_code, is_vip, is_locked

### 1.3. Business Rules
- If plate blacklisted -> reject check-in
- VIP lanes require ETC match for auto open
- Decrement zone slot when assigned

### 1.4. RBAC
Staff can override AI; Manager/Admin can change zone configs.

## 2. FRONT-END SPECIFICATIONS
Staff Gate UI: live feed list, accept/reject buttons, override input, open barrier control.

## 3. BACK-END SPECIFICATIONS
POST /api/checkin/ai -> payload {plate, vehicle_type, image_url, camera_id} -> 201 {sessionId, assignedZone}
POST /api/gate/override -> secured staff action
GET /api/sessions/active -> list

Errors: 409 Conflict if already active session for plate; 403 if blacklisted.

## 4. ACCEPTANCE CRITERIA
- AI payload creates ACTIVE session and assigns zone when slots available.
- Staff override updates session and logs audit entry.
