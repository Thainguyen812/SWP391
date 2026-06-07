-- Schema generated from SRS Section 7.2
-- MySQL DDL for Parking Building Management System

CREATE DATABASE IF NOT EXISTS parking_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parking_db;

-- ENUM types simulated using ENUM where appropriate

CREATE TABLE users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15),
  role ENUM('ADMIN','MANAGER','STAFF','DRIVER') NOT NULL,
  status ENUM('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  fcm_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE vehicles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  etc_tag_code VARCHAR(50) UNIQUE,
  vehicle_type ENUM('CAR_4','CAR_7','VAN_16','TRUCK') NOT NULL,
  color VARCHAR(30),
  brand VARCHAR(50),
  registration_doc_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE zones (
  id CHAR(36) NOT NULL PRIMARY KEY,
  zone_name VARCHAR(100),
  zone_code VARCHAR(50) NOT NULL UNIQUE,
  allowed_vehicle_types JSON,
  total_slots INT DEFAULT 0,
  current_occupied INT DEFAULT 0,
  barrier_api_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE cards (
  id CHAR(36) NOT NULL PRIMARY KEY,
  card_number VARCHAR(100) UNIQUE,
  card_type VARCHAR(20) DEFAULT 'TEMP',
  status ENUM('AVAILABLE','IN_USE','LOST','DAMAGED') DEFAULT 'AVAILABLE'
) ENGINE=InnoDB;

CREATE TABLE parking_sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  license_plate VARCHAR(20) NOT NULL,
  vehicle_id CHAR(36),
  card_id CHAR(36),
  detected_etc_code VARCHAR(50),
  check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out_time TIMESTAMP NULL,
  assigned_zone_id CHAR(36) NOT NULL,
  session_status ENUM('ACTIVE','COMPLETED','PASSED_CONFIRMED','LOST_CARD') DEFAULT 'ACTIVE',
  is_vip BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  ai_check_in_image VARCHAR(255),
  mobile_checkout_staff_id CHAR(36),
  mobile_checkout_location VARCHAR(100),
  override_by_staff CHAR(36),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (card_id) REFERENCES cards(id),
  FOREIGN KEY (assigned_zone_id) REFERENCES zones(id),
  FOREIGN KEY (mobile_checkout_staff_id) REFERENCES users(id),
  FOREIGN KEY (override_by_staff) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE vip_subscriptions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  vehicle_id CHAR(36) NOT NULL UNIQUE,
  type VARCHAR(50),
  start_date DATE,
  end_date DATE,
  status ENUM('PENDING_APPROVAL','ACTIVE','EXPIRED','REJECTED'),
  photos_urls JSON,
  approved_by CHAR(36),
  fee_amount DECIMAL(12,2),
  payment_reference VARCHAR(255),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE pricing_rules (
  id CHAR(36) NOT NULL PRIMARY KEY,
  vehicle_type ENUM('CAR_4','CAR_7','VAN_16','TRUCK'),
  first_hour_fee DECIMAL(10,2),
  additional_hour_fee DECIMAL(10,2),
  max_daily_fee DECIMAL(10,2),
  lost_card_penalty DECIMAL(10,2),
  parking_violation_penalty DECIMAL(10,2),
  effective_from TIMESTAMP,
  effective_to TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  parking_fee DECIMAL(12,2),
  lost_card_penalty DECIMAL(12,2),
  parking_violation_penalty DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  payment_method VARCHAR(50),
  payment_status ENUM('PENDING','SUCCESS','FAILED'),
  processed_by CHAR(36),
  is_mobile_checkout BOOLEAN DEFAULT FALSE,
  mobile_location VARCHAR(255),
  FOREIGN KEY (session_id) REFERENCES parking_sessions(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE ai_scan_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  session_id CHAR(36),
  scan_location VARCHAR(100),
  camera_id VARCHAR(100),
  image_url VARCHAR(255),
  detected_plate VARCHAR(50),
  confidence_score DECIMAL(5,2),
  detected_color VARCHAR(30),
  is_overridden BOOLEAN DEFAULT FALSE,
  override_plate VARCHAR(50),
  override_by CHAR(36),
  FOREIGN KEY (session_id) REFERENCES parking_sessions(id),
  FOREIGN KEY (override_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE blacklisted_cards (
  id CHAR(36) NOT NULL PRIMARY KEY,
  card_id CHAR(36) NOT NULL UNIQUE,
  session_id CHAR(36),
  reason VARCHAR(50),
  blacklisted_by CHAR(36),
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (card_id) REFERENCES cards(id),
  FOREIGN KEY (session_id) REFERENCES parking_sessions(id),
  FOREIGN KEY (blacklisted_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36),
  action_type VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE parking_violations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  session_id CHAR(36),
  slot_id CHAR(36),
  violation_type VARCHAR(100),
  photo_urls JSON,
  detected_by CHAR(36),
  penalty_applied BOOLEAN DEFAULT FALSE,
  penalty_amount DECIMAL(12,2),
  FOREIGN KEY (session_id) REFERENCES parking_sessions(id),
  FOREIGN KEY (slot_id) REFERENCES zones(id),
  FOREIGN KEY (detected_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36),
  token CHAR(36) UNIQUE,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_status ON parking_sessions(session_status);
CREATE INDEX idx_transactions_status ON transactions(payment_status);

-- Audit log table should be append-only in application logic

-- End of schema
