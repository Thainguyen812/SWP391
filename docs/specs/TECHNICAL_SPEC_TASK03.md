# ĐẶC TẢ KỸ THUẬT: TASK 3 - JWT SECURITY BASE & USER AUTHENTICATION UI

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: register user (Driver)
- Read: fetch user profile
- Update: change password, roles (Admin)
- Delete: deactivate account

### 1.2. Data Dictionary
users: id, username, password_hash (bcrypt cost=10), full_name, email, role, status, fcm_token, created_at
refresh_tokens: id, user_id, token, expires_at

### 1.3. Business Rules
- Access tokens expire 15 minutes; refresh tokens 7 days stored in DB.
- Passwords hashed with bcrypt cost=10.

### 1.4. RBAC
Endpoints protected by roles. Admin can manage users. Drivers limited.

## 2. FRONT-END SPECIFICATIONS
Login and Register forms with client-side validation; store JWT in memory + refresh via cookie/localStorage per security policy.

## 3. BACK-END SPECIFICATIONS
### 3.1. DB
users & refresh_tokens exist.

### 3.2. API Contract
POST /api/auth/login {username,password} -> 200 {accessToken, refreshToken}
POST /api/auth/refresh {refreshToken} -> 200 {accessToken}
POST /api/auth/register {username,email,password,...} -> 201
POST /api/auth/logout -> 200 (invalidate refresh token)

### 3.3. Exception Handling & HTTP Status Codes
401 Unauthorized for bad creds; 403 for insufficient role.

## 4. ACCEPTANCE CRITERIA
- Given valid creds, login returns tokens; refresh returns new access token.
- Invalid refresh token returns 401 and requires re-login.
