-- =====================================================================
-- Adds prescriptions, needed by the website's patient portal
-- ("view own appointments/prescriptions" — FEATURES.md P0).
-- Run after 002_add_patient_demographics.sql:
--   psql -U <user> -d <database> -f migrations/003_add_prescriptions.sql
-- =====================================================================

CREATE TABLE IF NOT EXISTS prescriptions (
  prescription_id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  issued_by_user_id INTEGER REFERENCES users(user_id),
  facility_id INTEGER REFERENCES facilities(facility_id),
  appointment_id INTEGER REFERENCES appointments(appointment_id) ON DELETE SET NULL,
  medicines TEXT NOT NULL,     -- freeform for now: "Paracetamol 500mg - 1 tab twice daily x 5 days"
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
