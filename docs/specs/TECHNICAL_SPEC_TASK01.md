# ĐẶC TẢ KỸ THUẬT: TASK 1 - SETUP PROJECT BOILERPLATE & INITIAL CONFIGURATIONS

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Init repo skeleton (Create)
- Read/Show README and infra docs (Read)
- Update configs (Update)
- Archive/cleanup legacy files (Delete/Deactivate)

### 1.2. Data Dictionary / Fields
Không có bảng dữ liệu mới; chỉ cấu hình: git branches, CI env vars, .env template.

### 1.3. Business Rules & Constraints
- Branch policy: main protected, PR review required.
- CI must pass before merge.

### 1.4. RBAC
Chỉ Admin (repo owner) được cấu hình bảo vệ nhánh và secrets.

## 2. FRONT-END SPECIFICATIONS (FE)
### 2.1. UI/UX
Placeholder pages for Admin/Manager/Staff; navigation shell.

### 2.2. Components
App shell, Navbar, Auth pages, Dashboard placeholders.

### 2.3. Client Validation
N/A

### 2.4. UX States
Loading skeletons for initial app boot.

## 3. BACK-END SPECIFICATIONS (BE)
### 3.1. Database Schema
Không thay đổi schema; đảm bảo schema.sql ở repo root và Flyway migration.

### 3.2. RESTful API Contract
Base health endpoint: GET /api/health -> 200 {status: "ok"}

### 3.3. Exception Handling & HTTP Status Codes
Standard error envelope {message, code}

## 4. ACCEPTANCE CRITERIA (AC)
### 4.1. Happy Paths
- Given repo cloned, when run mvn package, then backend builds.
- Given frontend setup, when npm install && npm start, then app serves.

### 4.2. Edge Cases
- CI fails if formatting/linting errors.

