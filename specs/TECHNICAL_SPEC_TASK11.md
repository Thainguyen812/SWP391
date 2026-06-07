# ĐẶC TẢ KỸ THUẬT: TASK 11 - MANAGER DASHBOARD & VIP SUBSCRIPTION APPROVAL QUEUE

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Read: list pending VIP subscriptions
- Update: approve/reject subscription

### 1.2. Data Fields
vip_subscriptions: status, approved_by, photos_urls

### 1.3. Business Rules
- Only Manager role can approve; action must create audit log

### 1.4. RBAC
Manager and Admin roles only for approval actions

## 2. FRONT-END SPECIFICATIONS
Dashboard widgets: revenue chart, occupancy gauge, VIP approval queue with detail view and Approve/Reject buttons.

## 3. BACK-END SPECIFICATIONS
GET /api/manager/dashboard -> returns aggregates
POST /api/vip/{id}/approve -> Manager action

## 4. ACCEPTANCE CRITERIA
- Manager can approve and VIP status becomes ACTIVE and recorded in audit_logs.
