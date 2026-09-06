# Database Schema Reference

Core tables both apps' data shapes are derived from. Exact column types are up to whoever implements the backend, but names and relationships below should stay stable since both front-ends' API assumptions depend on them.

### `users`
`user_id (PK)`, `name`, `phone`, `password_hash`, `role` (`patient`/`asha_worker`/`doctor`/`receptionist`/`admin`), `facility_id (FK)`, `abha_id` (nullable), `preferred_language`, `created_at`

### `facilities`
`facility_id (PK)`, `name`, `tier` (`sub_centre`/`phc`/`rural_hospital`/`district_hospital`), `parent_facility_id (FK, self)`, `district`, `block`, `latitude`, `longitude`

### `referrals`
`referral_id (PK)`, `patient_id (FK users)`, `referred_by_user_id (FK users)`, `from_facility_id (FK)`, `to_facility_id (FK)`, `reason`, `urgency` (`routine`/`urgent`/`emergency`), `status` (`referred`/`travel_in_progress`/`arrived`/`seen`/`completed`/`missed`), `outcome_notes`, `created_at`, `updated_at`

### `referral_status_log`
`log_id (PK)`, `referral_id (FK)`, `status`, `note`, `changed_by_user_id (FK)`, `changed_at`

### `high_risk_followups`
`followup_id (PK)`, `patient_id (FK)`, `category` (`maternal`/`child_immunization`/`chronic_disease`/`other`), `condition_label`, `facility_id (FK)`, `assigned_worker_id (FK, nullable)`, `next_due_date`, `frequency_days`, `status` (`on_track`/`due`/`overdue`/`missed`/`closed`), `last_contacted_at`

### `facility_medicine_stock`
`stock_id (PK)`, `facility_id (FK)`, `medicine_id (FK)`, `quantity_available`, `low_stock_threshold`

### `emergency_escalations`
`escalation_id (PK)`, `patient_id (FK, nullable)`, `raised_by_user_id (FK)`, `facility_id (FK)`, `description`, `status` (`open`/`acknowledged`/`dispatched`/`resolved`)

### `offline_sync_log`
`sync_id (PK)`, `device_id`, `entity_type`, `client_local_id`, `server_entity_id`, `payload` (JSON), `synced_at`

### `appointments` (P2 scope)
`appointment_id (PK)`, `patient_id (FK)`, `facility_id (FK)`, `doctor_id (FK)`, `appointment_date`, `is_teleconsult`

---

Relationships at a glance:
- A `facility` can have one `parent_facility` (the next tier up).
- A `user` belongs to one `facility`.
- A `referral` moves a `patient` from one `facility` to another; every status change is logged in `referral_status_log`.
- A `high_risk_followup` belongs to one `patient` and is tracked at one `facility`.
- An `offline_sync_log` row is written every time the ASHA app's queued action is applied server-side — this is your audit trail if a sync ever needs debugging.
