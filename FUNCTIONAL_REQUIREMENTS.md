| Code | Actor | Name | Functional Requirement |
| :---: | :--- | :--- | :--- |
| FR-001 | System Admin | Manage system accounts | The system shall provide CRUD operations for system accounts (Admin, Manager, Staff) and enforce role-based access control. |
| FR-002 | System Admin | Audit logging | The system shall record and make available immutable audit logs for all sensitive actions. |
| FR-003 | System Admin | Health monitoring | The system shall provide health and status monitoring endpoints (DB, Redis, API) accessible from the admin interface. |
| FR-004 | Manager | Configure pricing rules | The system shall allow Managers to configure pricing rules (first hour, additional hour, max daily fee) and lost-card/violation penalties. |
| FR-005 | Manager | Configure zones | The system shall allow Managers to configure Zones and allowed vehicle types per Zone. |
| FR-006 | Manager | Real-time dashboard | The system shall provide a real-time dashboard that displays revenue, occupancy rates, and zone utilization. |
| FR-007 | Manager | VIP subscription approval | The system shall allow Managers to approve or reject VIP subscription requests and change subscription status to ACTIVE, PENDING_APPROVAL, or REJECTED. |
| FR-008 | Manager | Remote barrier control | The system shall allow Managers to remotely open barriers (Remote Override Open) and log the action into audit logs. |
| FR-009 | Manager | Congestion mode toggle | The system shall allow Managers to enable/disable congestion relief mode (Giải tỏa cao điểm). |
| FR-010 | Staff | Session monitoring UI | The system shall present Staff with a real-time view of incoming/outgoing sessions and LED/PC notifications for match/alerts. |
| FR-011 | Staff | Plate override | The system shall allow Staff to override AI-detected license plates by entering the correct plate manually and record the override in logs. |
| FR-012 | Staff | Guest checkout | The system shall allow Staff to process vãng lai (guest) check-out: look up temporary card, calculate fees, and mark transactions PAID to close sessions. |
| FR-013 | Staff | Lost-card handling | The system shall allow Staff to handle lost-card cases: search by plate, compute accumulated fees + lost-card penalty, blacklist the old card, and close the session upon confirmation. |
| FR-014 | Staff | Mobile checkout (POS) | The system shall allow Staff to perform mobile (on-site) checkout: capture GPS, timestamp, proof image, mark session PASSED_CONFIRMED, and record the collector (mobile staff) identity. |
| FR-015 | Staff | Security alerts | The system shall display urgent security alerts (is_locked, mismatch ETC) and provide controls to freeze/unfreeze barrier behavior for safety incidents. |
| FR-016 | Driver VIP | VIP registration UI | The system shall provide a VIP registration interface that requires license_plate, vehicle type, ETC tag code, and supporting document uploads. |
| FR-017 | Driver VIP | VIP validation & payment | The system shall validate VIP registrations (OCR/mock checks, payment webhook) and mark subscriptions PENDING_APPROVAL until Manager approval. |
| FR-018 | Driver VIP | VIP MFA entry/exit | The system shall allow VIP drivers to enter/exit via VIP lanes with automatic MFA authentication using Plate + ETC; when all checks pass the barrier shall open automatically. |
| FR-019 | Driver VIP | Anti-theft lock | The system shall allow VIP drivers to enable/disable an anti-theft lock (is_locked) that prevents exit until unlocked by the owner. |
| FR-020 | Driver VIP | Driver dashboard | The system shall provide VIP drivers with transaction history and suggested parking zones suitable for their vehicle type. |
| FR-021 | Driver Vãng lai (Guest) | Issue temporary card | The system shall issue a temporary physical card (card_id) on guest entry and associate it with a ParkingSession. |
| FR-022 | Driver Vãng lai (Guest) | Zone assignment | The system shall assign a Zone based on detected vehicle type and decrement available slot counts upon check-in. |
| FR-023 | Driver Vãng lai (Guest) | Fee calculation | The system shall compute parking fees using configured pricing rules (ceil by block hour) and ensure total fees do not exceed the configured max_daily_fee. |
| FR-024 | Driver Vãng lai (Guest) | Guest exit conditions | The system shall allow guest exit only after transaction status is PAID and the temporary card is returned and marked AVAILABLE. |
| FR-025 | Driver Vãng lai (Guest) | Congestion payments | The system shall support mobile/staff-assisted payment under congestion mode: accept proof (GPS, timestamp, image) and set session to PASSED_CONFIRMED to allow exit within the allowed timeframe. |
| FR-026 | Driver Vãng lai (Guest) | Enforce lost-card rules | The system shall enforce lost-card handling rules: compute penalty, blacklist the card, require identity documents, and only close session after staff confirmation and payment. |

*Notes:* Each functional requirement shall be uniquely coded (FR-0XX), include a concise Name, be implemented via RESTful API endpoints, secured via JWT, use parameter binding to prevent SQL injection, and produce audit logs where applicable.
