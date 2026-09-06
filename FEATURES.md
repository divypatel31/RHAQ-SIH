# Feature List — Rural Health Access & Quality Improvement System

Legend: **P0** = must work for the demo, **P1** = strengthens the pitch, **P2** = stretch goal if time remains.

---

## 1. Backend API (shared — build this first)

### P0 — Core
- [x] User auth: register/login, JWT issue + verify, bcrypt password hashing
- [x] Roles: `patient`, `asha_worker`, `doctor`, `receptionist`, `admin`
- [x] Facilities: CRUD + hierarchy (`sub_centre` → `phc` → `rural_hospital` → `district_hospital`)
- [x] Referrals: create, list/filter, update status (`referred → travel_in_progress → arrived → seen → completed / missed`)
- [x] Referral status audit log (every status change recorded)
- [x] High-risk follow-ups: enroll, list/filter, log contact (auto-reschedules), close
- [x] Offline batch sync endpoint (`POST /sync/batch`) accepting queued actions from the ASHA app — including resolving a referral/follow-up that references a patient registered in the same offline batch, not yet synced

### P1 — Strengthens the pitch
- [x] Auto-flagging job: referrals stuck >72h → `missed`; follow-ups past due date → `overdue`/`missed`
- [x] District/facility dashboard aggregation endpoint (referral completion %, high-risk backlog, facility activity)
- [x] Emergency escalation: raise, list, update status
- [x] Cross-facility medicine stock search

### P2 — Stretch
- [ ] ABHA ID field + FHIR-shaped export stub (interoperability signal for judges)
- [ ] SMS/email notification hooks for referral status changes
- [ ] Basic rate limiting / request logging

---

## 2. ASHA Mobile App (offline-first)

### P0 — Core
- [x] Login (works with cached credentials if offline after first login)
- [x] Register a new patient — **must work fully offline**, queues locally, syncs on reconnect
- [x] Create a referral for a patient — **must work fully offline**
- [x] Visible "pending sync" indicator on any record not yet confirmed by the server
- [x] Manual "sync now" button, plus automatic sync on reconnect

### P1 — Strengthens the pitch
- [x] View/update referrals the worker created (status progression) — via patient search + referral creation flow
- [x] Enroll a patient in high-risk follow-up + log a contact visit — `HighRiskScreen`, log-contact and close actions
- [x] Simple worklist: "due today," "overdue" high-risk patients — `HighRiskScreen` filters
- [x] Language toggle (English/Hindi at minimum) — English, Hindi, and Marathi, persisted across restarts
- [x] Patient search by name/phone instead of a raw ID — `PatientSearchField`, with offline fallback to recently-seen patients

### P2 — Stretch
- [ ] Raise an emergency escalation from the field
- [x] Basic offline patient search (previously synced patients cached locally) — via the recently-seen cache in `services/patients.js`
- [ ] Photo attachment for referral notes (stored locally until synced)
- [x] Voice read-aloud in any supported language (Bhashini API) — beyond original scope, added per request; **unverified against the live Bhashini API**, see asha-app/README.md

---

## 3. Website (patient / PHC / hospital staff)

### P0 — Core
- [x] Login, role-based dashboard routing
- [x] Facility staff: view and update referrals sent to/from their facility
- [x] Facility staff: view high-risk follow-up worklist for their facility
- [x] Patient: book appointment, view own appointments/prescriptions

### P1 — Strengthens the pitch
- [x] Facility/district dashboard: referral completion rate, high-risk backlog, low stock, facility activity
- [x] Emergency escalations view with status updates
- [ ] Admin: manage facilities, users
- [ ] Cross-facility medicine availability search — backend endpoint exists (`GET /facilities/medicine-search`), no UI yet

### P2 — Stretch
- [ ] AI symptom triage chat + auto-booking
- [ ] Lab request/result workflow
- [ ] Pharmacy dispensing (FIFO batching)
- [ ] Multilingual UI (English/Hindi) — done on the ASHA app (+Marathi); not yet ported to the website

---

## Suggested build order 

1. Agree on `API_CONTRACT.md` and `docs/db-schema.md` — do this together before writing code.
2. Backend: auth + facilities + referrals (P0) — get this deployed somewhere reachable (even a free-tier host) so both apps can hit real endpoints instead of mocks.
3. ASHA app: offline patient registration + referral creation against the live backend.
4. Website: referral view/update + facility dashboard against the same live backend.
5. Once the P0 loop works end-to-end (ASHA creates referral offline → syncs → shows up on website → status updated on website), move to P1 items.