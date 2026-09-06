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
