# USER_STORIES - Parking Building Management System (SWP391)

Tài liệu user stories được sinh tự động từ SRS trong thư mục.

---

## Epic: Quản lý luồng vào/ra bãi

1. As a Driver (VIP), I want the system to automatically open the VIP lane when my plate and ETC match so that I can exit/enter without stopping.
   - Acceptance:
     - Plate + ETC validated against VIP subscription
     - Active parking session exists
     - is_locked == FALSE

2. As a Driver (Vãng lai), I want to receive a temporary card at check-in so that staff and system can track my session.
   - Acceptance:
     - Card issued and linked to created ParkingSession
     - Assigned zone shown on LED

3. As the Backend System, I want to create a ParkingSession at check-in with plate, time, assigned zone so that occupancy and billing work.
   - Acceptance:
     - Session stored with status=ACTIVE
     - Zone current_occupied updated

---

## Epic: Thanh toán & Check-out

4. As a Staff, I want to scan/enter temporary card at exit and calculate fee so that I can collect payment from casual drivers.
   - Acceptance:
     - Fee computed per pricing_rules (ceil block hours)
     - Transaction recorded and status PAID for successful payment

5. As a Staff (mobile), I want to perform mobile checkout during congestion so that vehicles can be released quickly.
   - Acceptance:
     - Mobile checkout records GPS + timestamp + proof image
     - Session status becomes PASSED_CONFIRMED and valid for 30 minutes

6. As a Manager, I want VIP exits to show MATCH — VIP EXIT on Staff screen for monitoring so that manual oversight is possible.
   - Acceptance:
     - UI displays MATCH message on valid VIP exit
     - No manual payment required

---

## Epic: Thành viên VIP & Quản lý hồ sơ

7. As a Driver (VIP applicant), I want to register for VIP with ETC and documents so that I can be approved for automatic lanes.
   - Acceptance:
     - Uploads CMND, vehicle docs, ETC code required
     - Payment webhook transitions to PENDING_APPROVAL

8. As a Manager, I want to review and approve VIP applications so that only valid ETC-linked vehicles gain VIP status.
   - Acceptance:
     - Manager can view uploaded images and ETC code
     - Approve action sets subscription to ACTIVE and logs audit

---

## Epic: Xử lý ngoại lệ & an ninh

9. As a Staff, I want to override AI plate recognition so that I can manually correct mismatches and allow flow.
   - Acceptance:
     - Override recorded in ai_scan_logs with override_by
     - ParkingSession updated accordingly

10. As a Staff, I want a Lost Card handling flow to charge penalties and blacklist the old card so that fraud is prevented.
    - Acceptance:
      - System computes accumulated fee + lost_card_penalty
      - card_id added to blacklisted_cards
      - Session closed when payment confirmed

11. As a Driver (VIP), I want to enable/disable anti-theft lock so that my vehicle cannot exit while locked.
    - Acceptance:
      - is_locked toggles in ParkingSession/vehicle
      - Exits blocked if is_locked == TRUE and alarm pushed to owner via FCM

---

## Epic: Inventory, Zones & Slots

12. As an Admin, I want CRUD for zones and slots and allowed vehicle types so that allocation rules can be configured.
    - Acceptance:
      - Zones persist allowed_vehicle_types
      - Slots created with unique slot_number and status

13. As the System, I want to allocate a zone/slot based on vehicle type so that space utilization is optimized.
    - Acceptance:
      - Allocation respects allowed_vehicle_types and decrements available count

---

## Epic: Reporting & Audit

14. As a Manager, I want basic reports (entries/exits, revenue, occupancy) so that I can review operations.
    - Acceptance:
      - Reports generated for day/week/month
      - Data exportable to CSV/PDF

15. As an Admin, I want audit logs for sensitive actions (OVERRIDE_AI, REMOTE_OPEN_BARRIER) so that we have immutable traces.
    - Acceptance:
      - Actions recorded in audit_logs and cannot be deleted via API

---

## Non-functional related stories

16. As a System Operator, I want API latency p95 < 200ms under 100 concurrent users so that responsiveness is acceptable.
    - Acceptance:
      - Load test demonstrates p95 < 200ms

17. As a System, I want image retention policy of 30 days and transaction retention 3 years so that storage and compliance rules are met.
    - Acceptance:
      - Auto-cleanup runs for camera images older than 30 days
      - Transactions remain immutable for >= 3 years

---

> Lưu ý: Các user stories trên được sinh tự động từ SRS (C:\SWP391\srs.md). Có thể mở rộng thành các task/acceptance criteria chi tiết hơn theo sprint planning.
