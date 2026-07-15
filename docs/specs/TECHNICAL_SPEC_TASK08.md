# ĐẶC TẢ KỸ THUẬT: TASK 8 - LOST CARD EXCEPTION HANDLER & SECURE PROOF UPLOAD

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: lost-card incident record
- Read: historical incidents
- Update: close incident after payment

### 1.2. Data Fields
blacklisted_cards: card_id, session_id, reason, blacklisted_by, blacklisted_at, notes
incidents: id, plate, claimant_name, proof_urls

### 1.3. Business Rules
- On confirm lost-card, mark card status LOST and add to blacklisted_cards
- Require image of ID + vehicle registration; store in Object Storage with access control

### 1.4. RBAC
Staff triggers lost-card flow; Manager may approve edge cases (rented car)

## 2. FRONT-END SPECIFICATIONS
Staff UI: form to capture claimant info, upload images, display calculated penalty, Confirm button.

## 3. BACK-END SPECIFICATIONS
POST /api/lost-card/report {plate, claimant, images[]} -> 201 {incidentId}
POST /api/lost-card/confirm/{incidentId} -> marks card LOST, adds blacklisted record, creates transaction

## 4. ACCEPTANCE CRITERIA
- Given valid proof images and payment, system blacklists card and closes session.
- Missing required proof -> 400 and reject.
