-- =====================================================================
-- One ready-made login per role, for testing the full loop end-to-end:
-- ASHA app -> backend -> website. Neither app has a staff self-signup
-- screen (only the ASHA app registers *patients*), so these exist to
-- give you something to log in with on day one.
--
-- Passwords are intentionally simple/memorable for local testing only.
-- Change or delete these before any real deployment.
--
-- Run after 003_add_prescriptions.sql:
--   psql -U <user> -d <database> -f migrations/004_seed_test_users.sql
-- =====================================================================

-- phone: 9000000001 | password: asha123
INSERT INTO users (name, phone, password_hash, role, facility_id, preferred_language)
VALUES ('Sunita Devi (ASHA)', '9000000001', '$2a$10$PCqIUws4vWoD2usFqfEDXesl3N0/atPudkOzWFEJMa94oynWEcdZC', 'asha_worker', 4, 'en')
ON CONFLICT (phone) DO NOTHING;

-- phone: 9000000002 | password: doctor123
INSERT INTO users (name, phone, password_hash, role, facility_id, preferred_language)
VALUES ('Dr. Anil Sharma', '9000000002', '$2a$10$a/9uI.wlq3imSvTVw/HvUOyDq/y9Ndm7vK9CgnJKYeff.WK3sbnTW', 'doctor', 2, 'en')
ON CONFLICT (phone) DO NOTHING;

-- phone: 9000000003 | password: reception123
INSERT INTO users (name, phone, password_hash, role, facility_id, preferred_language)
VALUES ('Priya Reddy (Receptionist)', '9000000003', '$2a$10$1ZBLGzysfPeiuRjASTiiVetH6bh73L.UwYVn24iOFgkgjXMSt.KAu', 'receptionist', 4, 'en')
ON CONFLICT (phone) DO NOTHING;

-- phone: 9000000004 | password: admin123
INSERT INTO users (name, phone, password_hash, role, facility_id, preferred_language)
VALUES ('Admin User', '9000000004', '$2a$10$Z6slEGcwfge4A0Ky7gNvTOUy6nN9TALrDNA4Y5cH.RUN4b4JdbWC.', 'admin', NULL, 'en')
ON CONFLICT (phone) DO NOTHING;

-- phone: 9000000005 | password: patient123
INSERT INTO users (name, phone, password_hash, role, facility_id, dob, gender, preferred_language)
VALUES ('Ramesh Kumar (Patient)', '9000000005', '$2a$10$PNLw5MMfyOSBtEZAVsSO6uwuoH.YxidKDVMN6f36feFPqPOcLr0TS', 'patient', 4, '1990-05-20', 'male', 'en')
ON CONFLICT (phone) DO NOTHING;
