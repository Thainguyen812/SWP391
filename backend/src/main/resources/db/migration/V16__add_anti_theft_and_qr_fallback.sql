ALTER TABLE vehicles ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE parking_sessions ADD COLUMN qr_fallback_used BOOLEAN NOT NULL DEFAULT false;
