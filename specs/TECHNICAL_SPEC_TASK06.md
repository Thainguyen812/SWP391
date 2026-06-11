# ĐẶC TẢ KỸ THUẬT: TASK 6 - MFA SECURITY VIA DYNAMIC QR VERIFICATION

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Read: verify ETC tag on entry/exit
- Update: mark session as verified

### 1.2. Data Fields
vehicles.etc_tag_code, parking_sessions.detected_etc_code

### 1.3. Business Rules
VIP exit requires:
- Plate match
- Dynamic QR verification

### 1.4. RBAC
Staff can manually override after verification steps and audit.

## 2. FRONT-END SPECIFICATIONS
VIP lane UI shows MATCH/MISMATCH, big green/red indicator, and manual override modal.

## 3. BACK-END SPECIFICATIONS
POST /api/qr/verify {sessionId, etc_tag_code} -> 200 {match:true/false}
If match true and session active and is_locked==false -> trigger barrier open.

## 4. ACCEPTANCE CRITERIA
- Given VIP active and ETC matches, barrier opens automatically.
- Given mismatch, system records event and sets status to require manual review.
