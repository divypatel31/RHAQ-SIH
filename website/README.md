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
- Cross-facility medicine availability search (P1, backend endpoint exists at `GET /facilities/medicine-search`) has no UI yet.
- No UI yet for staff to issue a prescription (backend endpoint works and is tested — see root `README.md`'s test-account section for a curl workaround).

## Admin (User & Facility Management)
Built and verified live: `pages/admin/UserManagement.jsx` (list/filter by role, edit name/role/facility) and `pages/admin/FacilityManagement.jsx` (list, create, edit — full sub-centre/PHC/rural/district hierarchy). Both are admin-role-gated on both ends: the nav items only render for `role === 'admin'` in `DashboardLayout`, and the backend independently enforces it via `requireRole("admin")` on every endpoint — the frontend gate is a UX nicety, not the actual security boundary.

Deliberately narrow scope on the backend: no hard delete for users or facilities (a user delete would cascade into their referrals/appointments/prescriptions, and a facility can't be deleted while referrals reference it — both are safety-by-default choices, not oversights), and no password reset from this endpoint (that needs its own flow that invalidates sessions).

Verified live: admin lists users, edits a user's facility assignment, edits a facility's contact info, and creates a new facility — all confirmed against the real database.

## Multilingual UI
English, Hindi, and Marathi — the same three languages as the ASHA app, using the same `i18next`/`react-i18next` pattern. 162 keys, verified to have identical coverage across all three locale files (no silent gaps). Status labels (referral status, high-risk status, emergency status) are translated too, not just page chrome — `StatusTag` in `components/common/index.jsx` now resolves its label via `t('status.' + status)` instead of a hardcoded English string.

## Design notes on what was actually chosen
Palette: deep teal (`#0F6E56`, carried over from the ASHA app and diagrams for brand consistency) as the primary action/status color, a warm clay tone reserved for urgency accents, and a cool off-white background — deliberately not the cream+terracotta or dark+neon combinations that read as generic AI-generated defaults. Typeface: IBM Plex Sans throughout (one family, weight/size used for hierarchy rather than a second display face), chosen for its institutional/technical character over a more generic choice like Inter. Status (referral status, follow-up status, emergency status) is shown as a left-border accent + label rather than a rounded pill badge — a structural device tied to real data, used identically everywhere status appears, instead of decorative color-coding.

**Update — brand theme and landing page.** Per a later request to align with the visual convention of national health-portal sites (e.g. eSanjeevani — India's national telemedicine service), the primary/action color shifted from teal to a deep institutional blue (`brand-500 #0B5CAB`), with a saffron accent (`saffron-500 #E67E00`) reserved for the landing page's primary calls-to-action. This was a deliberate, scoped change: `Button`'s primary variant, input focus rings, active nav/tab states, and info banners now use `brand-*` instead of `teal-*`. **The status-color system was left untouched** — referral/high-risk/emergency status still uses teal/amber/rose/clay, because that's functional data encoding, not decoration, and changing it would have broken the "status = accent color, used consistently everywhere" design language established earlier for no real benefit.

A public landing page (`pages/public/Landing.jsx`) now sits at `/` for anyone not logged in, matching the eSanjeevani pattern of a proper intro page before login rather than dropping straight into a login form: a header with branding + language switcher + login link, a hero with two entry points (patient / facility staff — both route to the same `/login`, since role is resolved server-side at login, not by which button was clicked), a facts strip, and feature cards. The facts strip states real system capabilities ("4 facility tiers connected," "3 languages supported") rather than fabricated usage numbers — this is a hackathon prototype with no real users yet, and inventing adoption metrics would be dishonest. Logged-in users hitting `/` are redirected straight to their dashboard; the landing page only shows for signed-out visitors.

I could not access the live eSanjeevani site directly to screenshot it (it blocks automated requests) — this was built from well-established knowledge of the Indian government health-portal design convention (deep blue + saffron, National Emblem-style header branding, language switcher up top, hero with dual patient/provider entry points), not a pixel-accurate copy of the current live site. Worth an actual visual comparison against the live site before a demo.
