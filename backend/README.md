# Backend — RHAQ Shared API

## What this is
The single Node.js/Express + PostgreSQL backend that both the ASHA app and the website talk to. It is the only place data is written and read from — neither front-end has its own database.

## Read first
- `../API_CONTRACT.md` — every endpoint you must implement, with exact request/response shapes
- `../docs/db-schema.md` — the tables and relationships to build

## Build order
1. `users` table + `/auth/register`, `/auth/login` (JWT + bcrypt)
2. `facilities` table + `GET /facilities`, `GET /facilities/:id/hierarchy`
3. `referrals` + `referral_status_log` tables + `POST /referrals`, `PATCH /referrals/:id/status`, `GET /referrals`
4. `high_risk_followups` table + enroll/list/log-contact endpoints
5. `POST /sync/batch` — the offline sync endpoint the ASHA app depends on; this is P0, don't leave it for last
6. Dashboard aggregation endpoint (`GET /dashboard/district`)
7. `emergency_escalations` + endpoints
8. `facility_medicine_stock` + search endpoint

## Non-negotiable behaviors
- **Every endpoint except `/auth/*` requires a valid JWT.** Reject with `401` if missing/invalid.
- **Role checks matter**: an `asha_worker` token should not be able to hit admin-only endpoints. Return `403`.
- **`POST /sync/batch` must process each item independently** — one bad item in a batch should not fail the whole batch. Return per-item results as specified in the contract.
- **Referral status must only move through the defined sequence** (`referred → travel_in_progress → arrived → seen → completed`, or `missed` from any non-terminal state). Reject invalid transitions with `400`.
- Log every referral status change to `referral_status_log` — this audit trail is a specific PS133 talking point, don't skip it.

## Suggested stack
Node.js + Express, PostgreSQL (`pg` driver), `jsonwebtoken`, `bcrypt`, `node-cron` (for the stale-referral/overdue-followup sweep — P1, do this after the core CRUD works).

## Environment variables
```
PORT=5000
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
JWT_SECRET=
```

## Definition of done for P0
A person with Postman/curl can: register a user, log in, create a facility, create a referral between two facilities, advance its status, and list referrals filtered by status — all against real PostgreSQL data.

**This is done.** The full P0 backend (auth, facilities, referrals with status machine, high-risk follow-ups, district dashboard, emergency escalation, offline sync batch endpoint) is implemented in `src/` and has been verified end-to-end against a real local PostgreSQL instance — including the complete referral lifecycle (create → advance through every status → completed), high-risk follow-up contact logging, emergency escalation resolution, and an offline sync batch call.

## Running it locally
```bash
cd backend
npm install
cp .env.example .env        # edit DB credentials if needed
createdb rhaq                # or: psql -c "CREATE DATABASE rhaq;"
npm run migrate               # applies migrations/001_init.sql
npm run dev                   # starts on http://localhost:5000
curl http://localhost:5000/api/health
```

## A note on PostgreSQL parameter typing
A few queries that mix a bind parameter with string concatenation or interval math (e.g. rescheduling a follow-up's due date, or a status update that also conditionally sets another column) will fail with `error: could not determine data type of parameter $N` unless the parameter is explicitly cast, e.g. `$1::text` or `$1::varchar`. This bit us more than once while building this scaffold — if you add a new query with a similar shape, cast explicitly rather than relying on Postgres to infer the type from context.
