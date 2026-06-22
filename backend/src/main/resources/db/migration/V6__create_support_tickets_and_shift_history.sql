CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE shift_history (
    id BIGSERIAL PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    shift_type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    vehicles_handled INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);
