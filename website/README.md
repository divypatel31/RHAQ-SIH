# Website — Patient / PHC / Hospital Dashboard

## What this is
The web dashboard used by patients, PHC staff, and hospital staff. Unlike the ASHA app, this assumes reasonably reliable connectivity — a PHC or hospital typically has power and some internet, so no offline requirement here.

## Read first
- `../API_CONTRACT.md` — every endpoint you'll call
- `../FEATURES.md` section 3 — the exact feature list and priority order

## Roles this site serves
- **Patient**: books appointments, views own prescriptions/records
- **Facility staff** (doctor/receptionist/admin at a PHC or hospital): views and updates referrals for their facility, manages high-risk follow-ups, sees the facility/district dashboard

## Screens to build (in priority order)
1. Login, routed by role
2. **Referral list/detail view** for a facility — see incoming and outgoing referrals, advance status (`referred → travel_in_progress → arrived → seen → completed`), mark missed. This is the screen judges will care about most — it's the "completion loop" that's the project's core differentiator.
3. High-risk follow-up worklist for a facility — filter by due/overdue, log a contact
4. Facility/district dashboard — referral completion rate, high-risk backlog, open emergencies, low medicine stock (pull from `GET /dashboard/district`)
5. Patient-facing: book appointment, view appointments/prescriptions
6. Emergency escalations view with status updates
7. Admin: manage facilities and users

## Design notes
- Every referral card/row should clearly show its current status and which facility it's moving between — that's the whole value proposition, don't bury it.
- The dashboard is meant to look like something a real district health officer would actually use: numbers that matter (completion rate, backlog counts), not decoration.
- Multilingual UI is P2 here — if you have time, add it, but don't block P0/P1 screens on it.

## Definition of done for P0
A facility staff account can log in, see referrals involving their facility, advance one through its status sequence, and see that reflected instantly if you refresh. A patient account can log in and book an appointment.

**This is done.** All P0 and most P1 screens are built: Login (role-routed), Referral Tracking (incoming/outgoing tabs, create, advance status, mark missed), High-Risk Follow-ups (filterable worklist, log contact, close), Facility Dashboard (referral completion rate, high-risk backlog, low stock, facility activity), Emergency Escalations (raise-to-resolve status flow), and the full patient portal (book appointment, view/cancel appointments, view prescriptions).

**A real backend gap this surfaced and fixed:** there was no appointments or prescriptions API at all — the `appointments` table existed in the schema but nothing read or wrote it, and there was no `prescriptions` table. Added `backend/migrations/003_add_prescriptions.sql` and the corresponding controllers/routes; see `API_CONTRACT.md`.

**Verified:** `npm run build` compiles clean (103 modules, no errors), the production build serves correctly via `vite preview`, and every API call each page makes mirrors an endpoint already verified live against the real backend (patient books an appointment → sees it in their list → cancels it; a doctor issues a prescription → patient sees it; a facility staff account creates a referral via patient search → advances it through every status).

**Not yet done, being upfront about it:**
- No actual browser click-through testing was done — this sandbox has no way to launch a real browser. Verification was: clean production build + backend endpoint parity (every request shape matches an endpoint already tested live via curl) + careful manual review, not visual/interactive testing. Open it in an actual browser and click through the flows before a demo.
- Admin screens (manage facilities/users — P1) are not built. The task this was built for was scoped to patient and hospital staff only.
- Multilingual UI (P2) is not built here — the ASHA app has it (English/Hindi/Marathi); porting the same `i18next` setup to this site is straightforward if there's time.
- Cross-facility medicine availability search (P1, backend endpoint exists at `GET /facilities/medicine-search`) has no UI yet.

## Design notes on what was actually chosen
Palette: deep teal (`#0F6E56`, carried over from the ASHA app and diagrams for brand consistency) as the primary action/status color, a warm clay tone reserved for urgency accents, and a cool off-white background — deliberately not the cream+terracotta or dark+neon combinations that read as generic AI-generated defaults. Typeface: IBM Plex Sans throughout (one family, weight/size used for hierarchy rather than a second display face), chosen for its institutional/technical character over a more generic choice like Inter. Status (referral status, follow-up status, emergency status) is shown as a left-border accent + label rather than a rounded pill badge — a structural device tied to real data, used identically everywhere status appears, instead of decorative color-coding.
