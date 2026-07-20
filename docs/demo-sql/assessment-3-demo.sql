-- ============================================================
-- SWP391 SMART PARKING - ASSESSMENT 3 DEMO SQL CHECKLIST
-- Use in pgAdmin Query Tool:
-- 1) Open this file.
-- 2) Highlight one block per demo flow.
-- 3) Click Execute.
--
-- NOTE:
-- - These queries are read-only by default.
-- - Do not run the optional reset/update blocks at the bottom unless needed.
-- ============================================================


-- ============================================================
-- 00. QUICK HEALTH CHECK - RUN BEFORE DEMO
-- Purpose: verify DB has data and main tables are reachable.
-- ============================================================

SELECT 'users' AS table_name, COUNT(*) AS total FROM users
UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'parking_sessions', COUNT(*) FROM parking_sessions
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL SELECT 'cards', COUNT(*) FROM cards
UNION ALL SELECT 'vip_subscriptions', COUNT(*) FROM vip_subscriptions
UNION ALL SELECT 'security_alerts', COUNT(*) FROM security_alerts
UNION ALL SELECT 'parking_violations', COUNT(*) FROM parking_violations
UNION ALL SELECT 'zones', COUNT(*) FROM zones
UNION ALL SELECT 'parking_slots', COUNT(*) FROM parking_slots;


SELECT
    id,
    username,
    email,
    full_name,
    role,
    status,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;


-- ============================================================
-- FLOW 1. DRIVER REGISTER / LOGIN / VEHICLE / VIP REGISTRATION
-- Purpose:
-- - Show driver account.
-- - Show registered vehicles.
-- - Show fuel type GASOLINE/ELECTRIC.
-- - Show VIP subscription status waiting for manager approval.
-- ============================================================

-- 1.1 Driver accounts
SELECT
    id AS user_id,
    username,
    email,
    full_name,
    phone,
    role,
    status,
    created_at,
    last_login_at
FROM users
WHERE role = 'DRIVER'
ORDER BY created_at DESC
LIMIT 20;


-- 1.2 Vehicles registered by drivers
SELECT
    v.id AS vehicle_id,
    u.full_name AS owner_name,
    u.email AS owner_email,
    v.license_plate,
    v.vehicle_size,
    v.body_shape,
    v.brand,
    v.color,
    v.fuel_type,
    v.is_active,
    v.is_locked,
    v.violation_count,
    v.created_at
FROM vehicles v
LEFT JOIN users u ON u.id = v.owner_id
ORDER BY v.created_at DESC
LIMIT 30;


-- 1.3 Latest VIP registrations
SELECT
    vs.id AS subscription_id,
    v.license_plate,
    u.full_name AS owner_name,
    vs.subscription_type,
    vs.status AS vip_status,
    vs.payment_status,
    vs.payment_method,
    vs.fee_amount,
    vs.start_date,
    vs.end_date,
    vs.approved_at,
    vs.rejection_reason,
    vs.created_at
FROM vip_subscriptions vs
JOIN vehicles v ON v.id = vs.vehicle_id
LEFT JOIN users u ON u.id = v.owner_id
ORDER BY vs.created_at DESC
LIMIT 30;


-- 1.4 VIP records waiting for Manager approval
SELECT
    vs.id AS subscription_id,
    v.license_plate,
    u.full_name AS owner_name,
    vs.status,
    vs.payment_status,
    vs.fee_amount,
    vs.document_photos,
    vs.created_at
FROM vip_subscriptions vs
JOIN vehicles v ON v.id = vs.vehicle_id
LEFT JOIN users u ON u.id = v.owner_id
WHERE vs.status = 'PENDING_APPROVAL'
ORDER BY vs.created_at DESC;


-- ============================================================
-- FLOW 2. MANAGER APPROVES VIP / QR ACCESS
-- Purpose:
-- - Show approved active VIP.
-- - Show VIP QR identifiers for gate verification.
-- - Show vehicle active/locked status after approval.
-- ============================================================

-- 2.1 Active VIP subscriptions
SELECT
    vs.id AS subscription_id,
    v.id AS vehicle_id,
    v.license_plate,
    v.vehicle_size,
    v.fuel_type,
    u.full_name AS owner_name,
    vs.subscription_type,
    vs.status,
    vs.payment_status,
    vs.start_date,
    vs.end_date,
    vs.approved_by,
    vs.approved_at
FROM vip_subscriptions vs
JOIN vehicles v ON v.id = vs.vehicle_id
LEFT JOIN users u ON u.id = v.owner_id
WHERE vs.status = 'ACTIVE'
ORDER BY vs.approved_at DESC NULLS LAST, vs.created_at DESC;


-- 2.2 VIP QR identifiers
SELECT
    qr.id AS qr_id,
    v.license_plate,
    qr.qr_token,
    qr.purpose,
    qr.issued_at,
    qr.expires_at,
    qr.is_used,
    qr.created_at
FROM vip_qr_identifiers qr
JOIN vehicles v ON v.id = qr.vehicle_id
ORDER BY qr.created_at DESC
LIMIT 30;


-- 2.3 VIP vehicle security status
SELECT
    v.id AS vehicle_id,
    v.license_plate,
    v.is_active,
    v.is_locked,
    vs.status AS vip_status,
    vs.payment_status,
    vs.end_date
FROM vehicles v
LEFT JOIN vip_subscriptions vs ON vs.vehicle_id = v.id
WHERE vs.status = 'ACTIVE'
ORDER BY v.license_plate;


-- ============================================================
-- FLOW 3. GATE CHECK-IN
-- Purpose:
-- - Show camera scan logs.
-- - Show visitor card check-in.
-- - Show VIP camera/QR check-in.
-- - Confirm parking_sessions are created only after approval/card/VIP validation.
-- ============================================================

-- 3.1 Latest AI/LPR scan logs at gate
SELECT
    id AS scan_id,
    session_id,
    scan_location,
    scan_type,
    camera_id,
    detected_plate,
    confidence_score,
    detected_vehicle_type,
    detected_color,
    detected_shape,
    qr_match,
    is_evidence,
    scanned_at
FROM ai_scan_logs
ORDER BY scanned_at DESC
LIMIT 30;


-- 3.2 Active sessions currently inside parking
SELECT
    ps.id AS session_id,
    ps.license_plate,
    ps.is_vip,
    ps.session_status,
    c.card_code,
    c.status AS card_status,
    z.zone_code,
    z.zone_name,
    z.allowed_sizes,
    ps.entry_gate,
    ps.check_in_time,
    ps.mobile_checkout_at,
    ps.is_locked,
    ps.created_at
FROM parking_sessions ps
LEFT JOIN cards c ON c.id = ps.card_id
LEFT JOIN zones z ON z.id = ps.assigned_zone_id
WHERE ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
ORDER BY ps.check_in_time DESC;


-- 3.3 Latest check-in sessions, including completed records
SELECT
    ps.id AS session_id,
    ps.license_plate,
    ps.is_vip,
    ps.session_status,
    ps.entry_gate,
    ps.exit_gate,
    ps.check_in_time,
    ps.check_out_time,
    c.card_code,
    z.zone_code,
    z.zone_name
FROM parking_sessions ps
LEFT JOIN cards c ON c.id = ps.card_id
LEFT JOIN zones z ON z.id = ps.assigned_zone_id
ORDER BY ps.check_in_time DESC
LIMIT 30;


-- 3.4 Visitor sessions that have temporary cards
SELECT
    ps.id AS session_id,
    ps.license_plate,
    ps.session_status,
    c.card_code,
    c.status AS card_status,
    ps.entry_gate,
    ps.check_in_time
FROM parking_sessions ps
JOIN cards c ON c.id = ps.card_id
WHERE COALESCE(ps.is_vip, false) = false
ORDER BY ps.check_in_time DESC
LIMIT 30;


-- ============================================================
-- FLOW 4. STAFF CHECK-OUT / PAYMENT / LOST CARD
-- Purpose:
-- - Show pending/paid transactions.
-- - Show card status.
-- - Show lost card sessions and blacklisted cards.
-- ============================================================

-- 4.1 Latest transactions
SELECT
    t.id AS transaction_id,
    ps.license_plate,
    ps.is_vip,
    ps.session_status,
    t.session_id,
    t.parking_fee,
    t.lost_card_penalty,
    t.violation_penalty,
    t.total_amount,
    t.payment_method,
    t.payment_status,
    t.is_mobile_checkout,
    t.mobile_gps_location,
    t.processed_by,
    t.processed_at
FROM transactions t
JOIN parking_sessions ps ON ps.id = t.session_id
ORDER BY t.processed_at DESC NULLS LAST
LIMIT 30;


-- 4.2 Transactions by status
SELECT
    t.payment_status,
    COUNT(*) AS transaction_count,
    COALESCE(SUM(t.total_amount), 0) AS total_revenue
FROM transactions t
GROUP BY t.payment_status
ORDER BY t.payment_status;


-- 4.3 Card inventory/status
SELECT
    status,
    COUNT(*) AS card_count
FROM cards
GROUP BY status
ORDER BY status;


-- 4.4 Cards currently in use
SELECT
    c.id AS card_id,
    c.card_code,
    c.status,
    ps.license_plate,
    ps.session_status,
    ps.check_in_time,
    ps.entry_gate
FROM cards c
LEFT JOIN parking_sessions ps
    ON ps.card_id = c.id
    AND ps.session_status IN ('ACTIVE', 'LOST_CARD', 'PASSED_CONFIRMED')
WHERE c.status IN ('IN_USE', 'LOST', 'BLACKLISTED')
ORDER BY c.card_code;


-- 4.5 Lost card sessions
SELECT
    ps.id AS session_id,
    ps.license_plate,
    ps.session_status,
    c.card_code,
    c.status AS card_status,
    ps.lost_card_proof_photos,
    ps.check_in_time,
    ps.check_out_time
FROM parking_sessions ps
LEFT JOIN cards c ON c.id = ps.card_id
WHERE ps.session_status = 'LOST_CARD'
   OR c.status IN ('LOST', 'BLACKLISTED')
ORDER BY ps.updated_at DESC NULLS LAST, ps.check_in_time DESC;


-- 4.6 Blacklisted/lost-card log
SELECT
    bl.id AS blacklist_id,
    c.card_code,
    ps.license_plate,
    bl.reason,
    bl.notes,
    bl.blacklisted_by,
    bl.blacklisted_at
FROM blacklisted_cards bl
LEFT JOIN cards c ON c.id = bl.card_id
LEFT JOIN parking_sessions ps ON ps.id = bl.session_id
ORDER BY bl.blacklisted_at DESC
LIMIT 30;


-- ============================================================
-- FLOW 5. MOBILE POS / CONGESTION CHECKOUT
-- Purpose:
-- - Show mobile checkout transactions.
-- - Show 30-minute grace window from mobile_checkout_at.
-- - Show sessions still waiting for gate exit after mobile payment.
-- ============================================================

-- 5.1 Mobile POS paid sessions
SELECT
    ps.id AS session_id,
    ps.license_plate,
    ps.session_status,
    ps.check_in_time,
    ps.mobile_checkout_at,
    (ps.mobile_checkout_at + INTERVAL '30 minutes') AS mobile_checkout_expires_at,
    CASE
        WHEN ps.mobile_checkout_at IS NULL THEN NULL
        WHEN NOW() <= ps.mobile_checkout_at + INTERVAL '30 minutes'
            THEN EXTRACT(EPOCH FROM ((ps.mobile_checkout_at + INTERVAL '30 minutes') - NOW()))::INT
        ELSE 0
    END AS seconds_remaining_to_exit,
    CASE
        WHEN ps.mobile_checkout_at IS NULL THEN 'NO_MOBILE_PAYMENT'
        WHEN NOW() <= ps.mobile_checkout_at + INTERVAL '30 minutes' THEN 'IN_GRACE_WINDOW'
        ELSE 'EXPIRED_NEED_EXTRA_FEE'
    END AS mobile_exit_status,
    t.id AS transaction_id,
    t.total_amount,
    t.payment_method,
    t.payment_status,
    t.is_mobile_checkout,
    t.mobile_gps_location,
    t.processed_at
FROM parking_sessions ps
JOIN transactions t ON t.session_id = ps.id
WHERE t.is_mobile_checkout = true
ORDER BY ps.mobile_checkout_at DESC NULLS LAST
LIMIT 30;


-- 5.2 Vehicles paid by Mobile POS but not fully exited yet
SELECT
    ps.license_plate,
    ps.session_status,
    ps.mobile_checkout_at,
    (ps.mobile_checkout_at + INTERVAL '30 minutes') AS valid_until,
    t.total_amount,
    t.payment_status,
    c.card_code,
    c.status AS card_status
FROM parking_sessions ps
JOIN transactions t ON t.session_id = ps.id
LEFT JOIN cards c ON c.id = ps.card_id
WHERE t.is_mobile_checkout = true
  AND ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
ORDER BY ps.mobile_checkout_at DESC;


-- 5.3 Revenue from Mobile POS
SELECT
    DATE_TRUNC('day', t.processed_at) AS revenue_day,
    COUNT(*) AS transaction_count,
    COALESCE(SUM(t.total_amount), 0) AS total_mobile_pos_revenue
FROM transactions t
WHERE t.is_mobile_checkout = true
  AND t.payment_status = 'SUCCESS'
GROUP BY DATE_TRUNC('day', t.processed_at)
ORDER BY revenue_day DESC;


-- ============================================================
-- FLOW 6. SECURITY / ANTI-THEFT / FCM ALERT
-- Purpose:
-- - Show driver locked vehicle.
-- - Show active locked sessions.
-- - Show security alerts created when locked vehicle attempts exit.
-- ============================================================

-- 6.1 Locked VIP vehicles
SELECT
    v.id AS vehicle_id,
    v.license_plate,
    v.is_locked,
    v.is_active,
    vs.status AS vip_status,
    vs.end_date,
    u.full_name AS owner_name,
    u.email AS owner_email,
    u.fcm_token IS NOT NULL AS has_fcm_token
FROM vehicles v
LEFT JOIN vip_subscriptions vs ON vs.vehicle_id = v.id AND vs.status = 'ACTIVE'
LEFT JOIN users u ON u.id = v.owner_id
WHERE v.is_locked = true
ORDER BY v.updated_at DESC NULLS LAST;


-- 6.2 Active sessions blocked by anti-theft lock
SELECT
    ps.id AS session_id,
    ps.license_plate,
    ps.is_vip,
    ps.is_locked,
    ps.session_status,
    ps.check_in_time,
    ps.entry_gate
FROM parking_sessions ps
WHERE ps.is_locked = true
  AND ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED')
ORDER BY ps.check_in_time DESC;


-- 6.3 Latest security alerts
SELECT
    id AS alert_id,
    alert_type,
    license_plate,
    reason,
    is_actionable,
    is_resolved,
    created_at,
    resolved_at
FROM security_alerts
ORDER BY created_at DESC
LIMIT 30;


-- 6.4 FCM token readiness for drivers
SELECT
    id AS user_id,
    username,
    email,
    full_name,
    role,
    CASE
        WHEN fcm_token IS NULL OR LENGTH(TRIM(fcm_token)) = 0 THEN 'NO_TOKEN'
        ELSE 'HAS_TOKEN'
    END AS fcm_status,
    LEFT(COALESCE(fcm_token, ''), 24) AS fcm_token_preview
FROM users
WHERE role = 'DRIVER'
ORDER BY updated_at DESC NULLS LAST, created_at DESC;


-- ============================================================
-- FLOW 7. EV/GASOLINE POLICY / SENSOR-ZONE MAP / VIOLATION
-- Purpose:
-- - Show fuel type.
-- - Show zones/floors and allowed vehicle types.
-- - Show parking slots sensor status.
-- - Show EV/gasoline violation and first-warning/penalty logic.
-- ============================================================

-- 7.1 Vehicles grouped by fuel type
SELECT
    fuel_type,
    vehicle_size,
    COUNT(*) AS vehicle_count
FROM vehicles
GROUP BY fuel_type, vehicle_size
ORDER BY fuel_type, vehicle_size;


-- 7.2 Zone/Floor map for Admin/Manager
SELECT
    z.id AS zone_id,
    z.zone_code,
    z.zone_name,
    z.allowed_sizes,
    z.total_slots,
    z.current_occupied,
    (z.total_slots - z.current_occupied) AS available_slots,
    z.has_ev_charger
FROM zones z
ORDER BY z.zone_code;


-- 7.3 Slot sensor status by zone
SELECT
    z.zone_code,
    z.zone_name,
    ps.slot_status,
    COUNT(*) AS slot_count
FROM parking_slots ps
JOIN zones z ON z.id = ps.zone_id
GROUP BY z.zone_code, z.zone_name, ps.slot_status
ORDER BY z.zone_code, ps.slot_status;


-- 7.4 Occupied slots with vehicle/session detail
SELECT
    z.zone_code,
    z.zone_name,
    slot.id AS slot_id,
    slot.slot_number,
    slot.slot_type,
    slot.slot_status,
    ps.license_plate,
    v.vehicle_size,
    v.fuel_type,
    ps.check_in_time,
    ps.slot_photo_url
FROM parking_slots slot
JOIN zones z ON z.id = slot.zone_id
LEFT JOIN parking_sessions ps
    ON ps.parked_slot_id = slot.id
    AND ps.session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')
LEFT JOIN vehicles v ON v.id = ps.vehicle_id
WHERE slot.slot_status = 'OCCUPIED'
ORDER BY z.zone_code, slot.slot_number;


-- 7.5 Latest EV/GASOLINE violations
SELECT
    pv.id AS violation_id,
    ps.license_plate,
    v.fuel_type,
    v.violation_count,
    pv.violation_type,
    pv.is_first_violation,
    pv.penalty_applied,
    pv.penalty_amount,
    pv.status,
    pv.notes,
    pv.detected_at,
    z.zone_code,
    z.zone_name
FROM parking_violations pv
JOIN parking_sessions ps ON ps.id = pv.session_id
LEFT JOIN vehicles v ON v.id = ps.vehicle_id
LEFT JOIN parking_slots slot ON slot.id = pv.slot_id
LEFT JOIN zones z ON z.id = slot.zone_id
ORDER BY pv.detected_at DESC NULLS LAST
LIMIT 30;


-- 7.6 Pending violations that will be applied on checkout
SELECT
    pv.id AS violation_id,
    ps.license_plate,
    pv.violation_type,
    pv.is_first_violation,
    CASE
        WHEN pv.is_first_violation = true THEN 'WARNING_ONLY_0_VND'
        ELSE 'PENALTY_APPLIES'
    END AS expected_checkout_effect,
    pv.penalty_amount,
    pv.penalty_applied,
    pv.status,
    pv.detected_at
FROM parking_violations pv
JOIN parking_sessions ps ON ps.id = pv.session_id
WHERE pv.status = 'PENDING'
ORDER BY pv.detected_at DESC NULLS LAST;


-- ============================================================
-- SUMMARY QUERIES - GOOD FOR END OF DEMO
-- ============================================================

-- A. Today's revenue
SELECT
    COUNT(*) AS success_transactions_today,
    COALESCE(SUM(total_amount), 0) AS revenue_today
FROM transactions
WHERE payment_status = 'SUCCESS'
  AND processed_at >= CURRENT_DATE;


-- B. Current parking capacity
SELECT
    COUNT(*) FILTER (WHERE session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')) AS vehicles_inside,
    COUNT(*) FILTER (WHERE is_vip = true AND session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')) AS vip_inside,
    COUNT(*) FILTER (WHERE COALESCE(is_vip, false) = false AND session_status IN ('ACTIVE', 'PASSED_CONFIRMED', 'LOST_CARD')) AS visitor_inside
FROM parking_sessions;


-- C. Full latest business timeline
SELECT
    'SESSION' AS event_type,
    ps.license_plate,
    ps.session_status::text AS status,
    ps.check_in_time AS event_time,
    ps.entry_gate AS note
FROM parking_sessions ps
UNION ALL
SELECT
    'TRANSACTION',
    ps.license_plate,
    t.payment_status::text,
    t.processed_at,
    t.payment_method::text
FROM transactions t
JOIN parking_sessions ps ON ps.id = t.session_id
UNION ALL
SELECT
    'SECURITY_ALERT',
    sa.license_plate,
    CASE WHEN sa.is_resolved THEN 'RESOLVED' ELSE 'OPEN' END,
    sa.created_at,
    sa.alert_type
FROM security_alerts sa
ORDER BY event_time DESC NULLS LAST
LIMIT 50;


-- ============================================================
-- OPTIONAL DEMO HELPERS - DO NOT RUN UNLESS YOU KNOW WHY
-- These are useful only when your demo data gets stuck.
-- Highlight only the exact statement you need.
-- ============================================================

-- Optional 1: Find one active visitor session to test checkout.
SELECT
    ps.license_plate,
    c.card_code,
    ps.session_status,
    ps.check_in_time
FROM parking_sessions ps
JOIN cards c ON c.id = ps.card_id
WHERE COALESCE(ps.is_vip, false) = false
  AND ps.session_status = 'ACTIVE'
ORDER BY ps.check_in_time DESC
LIMIT 5;


-- Optional 2: Find one active VIP session to test anti-theft lock checkout block.
SELECT
    ps.license_plate,
    ps.is_locked,
    ps.session_status,
    ps.check_in_time
FROM parking_sessions ps
WHERE ps.is_vip = true
  AND ps.session_status = 'ACTIVE'
ORDER BY ps.check_in_time DESC
LIMIT 5;


-- Optional 3: Find sessions that already have transactions.
SELECT
    ps.license_plate,
    ps.session_status,
    t.payment_status,
    t.total_amount,
    t.is_mobile_checkout,
    t.processed_at
FROM parking_sessions ps
JOIN transactions t ON t.session_id = ps.id
ORDER BY t.processed_at DESC NULLS LAST
LIMIT 20;

