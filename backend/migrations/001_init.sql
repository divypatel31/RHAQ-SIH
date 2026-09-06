-- =====================================================================
-- RHAQ backend — initial schema (PostgreSQL)
-- Matches docs/db-schema.md. Run once against a fresh database:
--   psql -U <user> -d <database> -f migrations/001_init.sql
-- =====================================================================

CREATE TABLE IF NOT EXISTS facilities (
  facility_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('sub_centre', 'phc', 'rural_hospital', 'district_hospital')),
  parent_facility_id INTEGER REFERENCES facilities(facility_id) ON DELETE SET NULL,
  district VARCHAR(100) NOT NULL,
  block VARCHAR(100),
  village_or_area VARCHAR(150),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  contact_phone VARCHAR(20),
  has_diagnostics BOOLEAN DEFAULT FALSE,
  has_teleconsult_kiosk BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'asha_worker', 'doctor', 'receptionist', 'admin')),
  facility_id INTEGER REFERENCES facilities(facility_id) ON DELETE SET NULL,
  abha_id VARCHAR(20),
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  facility_id INTEGER REFERENCES facilities(facility_id) ON DELETE SET NULL,
  doctor_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  appointment_date DATE,
  is_teleconsult BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  referral_id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  referred_by_user_id INTEGER REFERENCES users(user_id),
  from_facility_id INTEGER NOT NULL REFERENCES facilities(facility_id),
  to_facility_id INTEGER NOT NULL REFERENCES facilities(facility_id),
  reason TEXT NOT NULL,
  urgency VARCHAR(10) NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  status VARCHAR(20) NOT NULL DEFAULT 'referred' CHECK (
    status IN ('referred', 'travel_in_progress', 'arrived', 'seen', 'completed', 'missed')
  ),
  outcome_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_status_log (
  log_id SERIAL PRIMARY KEY,
  referral_id INTEGER NOT NULL REFERENCES referrals(referral_id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  note VARCHAR(255),
  changed_by_user_id INTEGER REFERENCES users(user_id),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS high_risk_followups (
  followup_id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('maternal', 'child_immunization', 'chronic_disease', 'other')),
  condition_label VARCHAR(150) NOT NULL,
  facility_id INTEGER NOT NULL REFERENCES facilities(facility_id),
  assigned_worker_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  next_due_date DATE NOT NULL,
  frequency_days INTEGER DEFAULT 30,
  status VARCHAR(20) NOT NULL DEFAULT 'on_track' CHECK (
    status IN ('on_track', 'due', 'overdue', 'missed', 'closed')
  ),
  last_contacted_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Not listed in docs/db-schema.md but required so facility_medicine_stock's
-- medicine_id FK resolves to something real. Keep it minimal for now.
CREATE TABLE IF NOT EXISTS medicines (
  medicine_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_medicine_stock (
  stock_id SERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(facility_id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines(medicine_id) ON DELETE CASCADE,
  quantity_available INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (facility_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS emergency_escalations (
  escalation_id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  raised_by_user_id INTEGER REFERENCES users(user_id),
  facility_id INTEGER NOT NULL REFERENCES facilities(facility_id),
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'acknowledged', 'dispatched', 'resolved')
  ),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offline_sync_log (
  sync_id SERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  entity_type VARCHAR(30) NOT NULL CHECK (
    entity_type IN ('patient_registration', 'referral', 'high_risk_followup', 'appointment')
  ),
  client_local_id VARCHAR(100) NOT NULL,
  server_entity_id INTEGER,
  payload JSONB NOT NULL,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Seed a minimal facility hierarchy + one medicine so the API has real
-- data to return immediately after setup.
-- ---------------------------------------------------------------------
INSERT INTO facilities (name, tier, parent_facility_id, district, block, has_diagnostics, has_teleconsult_kiosk)
VALUES ('District Hospital HQ', 'district_hospital', NULL, 'Demo District', NULL, TRUE, TRUE);

INSERT INTO facilities (name, tier, parent_facility_id, district, block, has_diagnostics, has_teleconsult_kiosk)
VALUES
  ('Rural Hospital - Block A', 'rural_hospital', 1, 'Demo District', 'Block A', TRUE, TRUE),
  ('PHC - Village Cluster 1', 'phc', 2, 'Demo District', 'Block A', FALSE, TRUE),
  ('Sub-Centre - Village X', 'sub_centre', 3, 'Demo District', 'Block A', FALSE, FALSE);

INSERT INTO medicines (name) VALUES ('Paracetamol'), ('ORS'), ('Iron Folic Acid Tablets');
