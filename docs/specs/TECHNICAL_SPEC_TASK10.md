# ĐẶC TẢ KỸ THUẬT: TASK 10 - EV CHARGING ZONE POST-AUDIT SCANNER

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: violation record
- Read: report listings
- Update: escalate penalties

### 1.2. Data Fields
parking_violations: id, session_id, slot_id, violation_type, photo_urls, detected_by, penalty_applied

### 1.3. Business Rules
- If slot reports OCCUPIED but charging not active >15 minutes -> flag violation
- Second offense triggers penalty applied into transaction

### 1.4. RBAC
System scheduler runs job; Staff can review and confirm.

## 2. FRONT-END SPECIFICATIONS
Staff dashboard shows flagged slots, ability to attach photos, mark action taken.

## 3. BACK-END SPECIFICATIONS
Scheduled cron: every 5 minutes scan sensors -> if violation raise record
POST /api/violations/scan -> internal endpoint

## 4. ACCEPTANCE CRITERIA
- Violations generated reliably after threshold.
- Penalty applied on second offense.
