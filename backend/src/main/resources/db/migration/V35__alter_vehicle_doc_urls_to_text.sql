-- Flyway Migration V35: Alter vehicle registration doc and photo URLs to TEXT
ALTER TABLE vehicles ALTER COLUMN registration_doc_url TYPE TEXT;
ALTER TABLE vehicles ALTER COLUMN registration_photo_url TYPE TEXT;
