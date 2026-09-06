-- =====================================================================
-- Adds dob/gender to users, needed by the ASHA app's patient registration
-- screen (asha-app/README.md P0 scope: "name, phone, DOB, gender, facility").
-- Run after 001_init.sql:
--   psql -U <user> -d <database> -f migrations/002_add_patient_demographics.sql
-- =====================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('female', 'male', 'other'));
