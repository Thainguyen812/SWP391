# ĐẶC TẢ KỸ THUẬT: TASK 12 - OPENAPI SPEC REFINEMENT & PRODUCT SEED DATA

## 1. FUNCTIONAL & BUSINESS LOGIC ANALYSIS
### 1.1. CRUD Matrix
- Create: OpenAPI spec artifacts
- Read: serve /swagger-ui.html

### 1.2. Data Fields
N/A

### 1.3. Business Rules
- API docs must reflect production contract; kept in repo under /docs/openapi.yaml

### 1.4. RBAC
Public endpoints documented; protected endpoints mention required roles and scopes

## 2. FRONT-END SPECIFICATIONS
Provide example API calls and seed data JSON for frontend dev.

## 3. BACK-END SPECIFICATIONS
Expose Swagger UI in dev profiles; ensure API contracts match controller annotations.

## 4. ACCEPTANCE CRITERIA
- Swagger UI loads and lists all endpoints.
- Seed data JSON available and can populate development DB.
