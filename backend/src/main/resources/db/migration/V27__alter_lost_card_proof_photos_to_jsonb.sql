-- Alter lost_card_proof_photos column type back to JSONB to match Hibernate entity configuration
ALTER TABLE parking_sessions ALTER COLUMN lost_card_proof_photos TYPE JSONB USING lost_card_proof_photos::JSONB;
