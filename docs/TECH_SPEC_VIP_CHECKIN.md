# TECH SPEC: VIP Automatic Check-in / Check-out (Plate + Dynamic QR MFA)
Feature: Tự động kiểm soát làn VIP không dừng bằng xác thực 2 lớp (Plate + Dynamic QR)
Source: docs/SRS_Parking_Building_Management_System.md
1. Tổng quan
- Mục tiêu: Cho phép xe VIP ra/vào tự động không cần dừng nếu (1) biển số khớp hồ sơ VIP và (2) mã QR động từ App Driver được xác thực (single-use, expires in 60s).
- Giới hạn: Dự án là thuần phần mềm; Camera và đầu đọc QR là mô-đun giả lập (Mock REST API).
2. Yêu cầu chức năng (từ SRS)
- Xác thực đồng thời 4 điều kiện để tự động mở barrier: biển số thuộc VIP ACTIVE; token QR động hợp lệ & chưa sử dụng; có session ACTIVE; is_locked == FALSE.
- Hiển thị trạng thái MATCH — VIP QR EXIT trên màn hình Staff.
- Ghi Audit Log cho mọi thao tác mở barrier tự động hoặc override.
3. Kiến trúc thành phần
- Mock AI Camera Service: POST /mock/camera/scan -> {plate, confidence, image_url, vehicle_type}
- Mock QR Reader Service: POST /mock/qr/read -> {qr_token, reader_id, timestamp}
- Backend (Java Spring Boot)
  - Auth Service (JWT)
  - Session Service (parking_sessions CRUD)
  - VIP Service (vip_subscriptions lookup)
  - Allocation Service (zones)
  - Barrier Controller (HTTP client to Mock Barrier Controller)
  - Audit Service (writes audit_logs)
- Cache: Redis (hot counts current_occupied per zone)
- DB: PostgreSQL (transactions for session lifecycle)
4. Data models (relevant fields)
- vehicles: id, license_plate, vehicle_type, color_rgb, body_shape
- vip_subscriptions: id, vehicle_id, status (ACTIVE)
- parking_sessions: id, license_plate, vehicle_id, validated_qr_id, check_in_time, check_out_time, session_status, is_vip, is_locked, assigned_zone_id
- ai_scan_logs: id, session_id, detected_plate, confidence_score, image_url, override_by, scanned_qr_token
- audit_logs: (action_type: QR_CODE_CHECK_OUT / REMOTE_OPEN / OVERRIDE)
5. API contract (examples)
- POST /api/v1/hardware-events/camera-scan
  - Payload: {camera_id, image_url, detected_plate, confidence, vehicle_type, timestamp}
  - Behavior: find active session or create session; call VIP validation flow.
- POST /api/v1/hardware-events/qr-read
  - Payload: {reader_id, qr_token, timestamp, lane_id}
  - Behavior: correlate with latest camera event within short window (<=2s) or with session by plate; call QR validation.
- POST /api/v1/parking/verify-exit-qr
  - Payload: {session_id, detected_plate, qr_token}
  - Response: {success:true/false, reason?:string}
6. Sequence (simplified)
1. Camera posts scan -> backend creates transient ai_scan_logs entry.
2. QR Reader posts read -> backend correlates by lane_id + time window and/or session by plate.
3. Backend transaction begins:
  a. Lookup vehicle by plate -> vehicle_id
  b. Lookup vip_subscriptions where vehicle_id and status=ACTIVE
  c. Read vip_qr_identifiers by qr_token -> ensure not expired and is_used = FALSE
  d. Find active parking_session for plate (status=ACTIVE)
  e. Check is_locked==FALSE
  f. If all true -> mark vip_qr_identifiers.is_used = TRUE, set parking_sessions.validated_qr_id = qr.id, set parking_session.session_status = 'COMPLETED' (check_out_time = now), write audit_log QR_CODE_CHECK_OUT, call Barrier Controller to open, push message to Staff UI (MATCH — VIP QR EXIT)
  g. Else -> push mismatch reason to Staff UI and set flag for manual override
4. Commit transaction; update Redis occupancy atomically if slot freed.
7. Concurrency & Consistency
- Use DB transaction isolation (REPEATABLE READ / SELECT ... FOR UPDATE) when updating parking_sessions and zones counts.
- Use optimistic locking on parking_sessions (version/timestamp) to avoid double-checkout.
- Correlation window: match camera and QR events within configurable window (default 2s). If no correlation, QR validation may still proceed using session_id + plate pairing.
8. Error handling & retries
- If Barrier Controller fails -> retry exponential backoff (3 attempts) then escalate: create incident, push error to Staff UI for manual override.
- If QR token missing/expired or low confidence plate -> mark ai_scan_logs.is_overridden=true and require Staff override.
- If DB commit fails -> roll back and notify monitoring.
9. Security
- All external hardware endpoints authenticated by shared HMAC token.
- Validate inputs strictly; normalize plate strings before DB lookup.
- Audit logs are append-only; no API permits deletion.
- Use HTTPS for all services; store QR tokens encrypted at rest (AES-256) with key management.
10. Non-functional requirements mapping
- Latency: VIP validation end-to-end target < 500ms (SRS requires AI mock <=2s, barrier <500ms). Ensure async pipelines and fast cache lookup.
- Availability: service should be horizontally scalable behind load balancer.
11. Monitoring & Metrics
- Metrics: vip_validations_per_min, vip_success_rate, barrier_open_latency, qr_validation_latency, ai_scan_confidence_distribution
- Alerts: barrier_open_failures > 5/min, vip_success_rate drop >10% vs baseline
12. Testing
- Unit tests: validation logic, DB transactions
- Integration tests: simulate camera + qr events, assert barrier call and session close
- E2E: mock devices to ensure MATCH flow completes and UI receives MATCH event
- Load test: simulate 100 concurrent VIP exits to check p95 latency
13. Deployment & Rollout
- Feature-flag the AUTO_VIP_EXIT behavior; start in monitor-only mode (do not open barrier) for canary rollout.
- Use blue-green deploy; run smoke tests that simulate a VIP exit.
14. Acceptance criteria
- Given a VIP vehicle with ACTIVE subscription and a valid single-use QR token (issued <=60s) and an ACTIVE session, when camera and QR events arrive, then barrier opens automatically and session is closed; the Staff UI shows "MATCH — VIP QR EXIT" and an audit_log is written.
- If any condition fails, barrier does not open automatically and the case is visible for Staff override.

