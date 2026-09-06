# Rural Health Access & Quality Improvement System (RHAQ)
### Smart India Hackathon 2026 — Problem Statement SIH26133 (Government of Maharashtra)

> "Accessibility and quality of public healthcare services, particularly in rural and underserved areas."

RHAQ strengthens — not replaces — the public health system across the **sub-centre → PHC → rural hospital → district hospital** chain. It closes the biggest invisible failure in rural healthcare: patients referred upward who silently disappear between facilities, and high-risk patients (maternal, child, chronic disease) who fall out of follow-up because nobody proactively tracks them.

This repo is a **fresh rebuild**, split cleanly into two front-ends sharing one backend:

| Part | Owner | What it's for |
|---|---|---|
| `backend/` | shared | One REST API + one database. The single source of truth both apps talk to. |
| `asha-app/` | you | Mobile app for ASHA/frontline workers — offline-first, works with zero connectivity. |
| `website/` | your friend | Web dashboard for patients, PHC staff, and hospital staff. |

**The one rule that matters: both front-ends talk to the same backend and the same database. They are never built as two disconnected systems.** See `API_CONTRACT.md` — that file is the shared agreement both of you (and your AI tools) build against, even before the backend is finished.

---

## 🏗️ Architecture

```
        ┌─────────────────┐        ┌──────────────────┐
        │     Website      │        │     ASHA App      │
        │ (patient/PHC/    │        │ (mobile, offline- │
        │  hospital staff) │        │  first)            │
        └────────┬─────────┘        └─────────┬─────────┘
                 │ REST API (HTTPS/JWT)         │ REST API + offline queue
                 └───────────────┬──────────────┘
                                  ▼
                     ┌────────────────────────┐
                     │   Backend (Node/Express) │
                     │  facilities · referrals   │
                     │  high-risk · dashboard     │
                     │  emergency · auth · sync   │
                     └────────────┬───────────┘
                                  ▼
                     ┌────────────────────────┐
                     │    PostgreSQL database   │
                     └────────────────────────┘
```

---

## 🎯 Why this shape (read before building)

The core problem PS133 asks us to solve isn't "build a telemedicine app" — it's **continuity of care across a health system that most teams treat as a single hospital**. Two things follow from that:

1. **Referrals need a completion loop.** When a patient is referred from a sub-centre to a PHC or district hospital, someone needs to know whether they actually arrived and were seen — not just that a referral was "sent."
2. **High-risk patients need proactive tracking**, not a system that waits for them to come back on their own.

Everything in `FEATURES.md` exists to serve one of those two ideas, plus the practical constraints of rural deployment: unreliable connectivity, low digital literacy, and multiple local languages.

---

## 📂 Repo Structure

```
rural-health-access/
├── README.md                          ← you are here
├── FEATURES.md                        ← full feature list (MVP + stretch), by component
├── API_CONTRACT.md                    ← REST API spec — build against this, don't guess
├── CONTRIBUTING.md                    ← branching, commits, how to work in parallel
├── .gitignore
│
├── backend/                           ← shared Node.js + Express + PostgreSQL API
│   ├── README.md                      ← context for whoever/whatever builds the backend
│   ├── migrations/                    ← SQL migration files (001_init.sql, ...)
│   └── src/
│       ├── config/                    ← db connection, env loading
│       ├── controllers/               ← authController, facilityController, referralController,
│       │                                  highRiskController, dashboardController,
│       │                                  emergencyController, syncController
│       ├── routes/                    ← one route file per controller above
│       ├── middleware/                ← authMiddleware (JWT), roleMiddleware, errorHandler
│       ├── cron/                      ← followupStatusJob (stale referral / overdue sweep)
│       └── utils/                     ← validators, logger
│
├── website/                           ← React (Vite) + Tailwind — your friend builds this
│   ├── README.md                      ← context for your friend's AI to build the website
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/                ← PageHeader, StatusBadge, Modal, FormField, etc.
│       │   └── layout/                ← DashboardLayout (role-based nav)
│       ├── context/                   ← AuthContext
│       ├── pages/
│       │   ├── auth/                  ← Login, Register
│       │   ├── patient/               ← BookAppointment, MyAppointments, Prescriptions
│       │   ├── facility-staff/        ← ReferralTracking, HighRiskFollowups, FacilityDashboard
│       │   ├── admin/                 ← UserManagement, FacilityManagement
│       │   └── common/                ← EmergencyEscalations, Contact
│       ├── i18n/locales/              ← en.json, hi.json (P2)
│       └── utils/                     ← api.js (axios instance), helpers.js
│
├── asha-app/                          ← React Native (Expo) or PWA — you build this
│   ├── README.md                      ← context for your AI to build the ASHA app
│   ├── assets/                        ← icons, splash screen
│   └── src/
│       ├── screens/                   ← Login, RegisterPatient, CreateReferral,
│       │                                  SyncStatus, HighRiskWorklist
│       ├── navigation/                ← AppNavigator
│       ├── services/                  ← api.js, offlineQueue.js (local queue + sync), storage.js
│       ├── context/                   ← AuthContext
│       ├── components/                ← shared UI (buttons, form fields, pending-sync badge)
│       └── i18n/locales/              ← en.json, hi.json (P2)
│
└── docs/
    └── db-schema.md                   ← table-by-table schema reference
```

> Empty folders above are committed with a `.gitkeep` placeholder so the structure exists in git before any code is written — delete the `.gitkeep` in a folder as soon as you add a real file to it.

---

## 🚀 How to start (in order)

1. **Backend first, even if minimal.** The website and ASHA app can't be usefully tested without it. Start with just: facilities, referrals, high-risk follow-ups, auth. See `backend/README.md`.
2. **Both apps build against `API_CONTRACT.md` from day one** — even stubbed/mocked responses matching that contract let both of you work in parallel without blocking on each other.
3. **Agree on the database schema early** (`docs/db-schema.md`) since both front-ends' data shapes come from it.
4. **Demo-critical path:** referral creation → status update → dashboard reflecting it. Get that working end-to-end before polishing anything else.

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express + PostgreSQL | Fast to build, JWT auth, easy hosting |
| Website | React (Vite) + Tailwind CSS | Rich dashboards, fast dev cycle |
| ASHA App | React Native (Expo) | Real installable mobile app, offline storage (SQLite/AsyncStorage), one JS codebase shared mental model with the website |
| Offline sync | Local SQLite queue on the app → batch sync endpoint on reconnect | Works with zero connectivity for hours |
| Auth | JWT, bcrypt password hashing | Shared across both front-ends |

> If you'd rather build the ASHA app as an installable **PWA** instead of React Native, that also works and is faster to ship — see the note in `asha-app/README.md`. Pick one before you start; don't build both.

---

## 👥 Adding a contributor

1. GitHub repo → **Settings → Collaborators** → **Add people** → enter your friend's GitHub username/email → send invite.
2. Your friend accepts the invite via the email/GitHub notification.
3. Agree on branch naming and PR flow in `CONTRIBUTING.md` before either of you starts pushing code.

---

## 📌 Current Status

- [x] Backend API scaffolded — auth, facilities, referrals, high-risk follow-ups, dashboard, emergency escalation, and offline sync batch endpoint are implemented and verified live against a real PostgreSQL database
- [x] Database schema created — `backend/migrations/001_init.sql` and `002_add_patient_demographics.sql`, run and confirmed working
- [x] ASHA app — patient registration (offline) working — verified via both the direct register endpoint and the offline sync batch path
- [x] ASHA app — referral creation (offline) working
- [x] ASHA app — patient search by name/phone (replaces raw ID entry), verified against a live `/patients/search` endpoint
- [x] ASHA app — High-Risk Follow-ups screen (due/overdue worklist, log contact, close), verified against live backend
- [x] ASHA app — language toggle (English/Hindi/Marathi), fully translated, persisted across restarts
- [x] ASHA app — Bhashini voice read-aloud integrated in code — **not yet verified against the live Bhashini API** (no credentials/network access available while building); needs a real test pass before demo day
- [ ] Website — facility dashboard working
- [ ] Website — referral tracking view working
- [ ] End-to-end demo: referral created on ASHA app → visible and updatable on website

---

## 📄 License
Add your team's chosen license here (MIT is a safe default for a hackathon project).
