# ĐẶC TẢ KỸ THUẬT: TASK 2 - FLYWAY DB MIGRATION SCHEMA & BASELINE SEED DATA

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: run migrations and insert seed data
- Read: queries for zones, pricing
- Update/Delete: none at migration time

### 1.2. Data Dictionary / Fields
Tạo 12 bảng theo schema.sql: users, vehicles, zones, cards, parking_sessions, vip_subscriptions, pricing_rules, transactions, ai_scan_logs, blacklisted_cards, audit_logs, parking_violations, refresh_tokens.

### 1.3. Business Rules
- Ensure unique constraints and FK enforced.
- Seed Admin/Manager/Staff accounts with bcrypt passwords.

### 1.4. RBAC
Migration executed by CI/deploy only.

## 2. FRONT-END SPECIFICATIONS (FE)
No UI; provide sample data JSON for frontend dev.

## 3. BACK-END SPECIFICATIONS (BE)
### 3.1. DB Schema
Use Flyway V1__init.sql translating schema.sql.

### 3.2. RESTful API Contract
Provide endpoint GET /api/dev/seed-status -> returns seed applied.

### 3.3. Exception Handling & HTTP Status Codes
Return 409 if seed already applied.

## 4. ACCEPTANCE CRITERIA
- Given clean DB, when Flyway migrate run, then all tables exist and sample records inserted.
- Given migration re-run, should be idempotent (no duplicate seeds).
