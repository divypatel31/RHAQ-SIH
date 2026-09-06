# ASHA App — Offline-First Mobile App for Frontline Workers

## What this is
The mobile app used by ASHA/ANM frontline workers in the field. Its entire reason to exist is working **with zero connectivity** and syncing automatically later. If it requires a live network connection to register a patient or create a referral, it has failed its core requirement.

## Read first
- `../API_CONTRACT.md` — especially the `POST /sync/batch` section
- `../FEATURES.md` section 2 — the exact feature list and priority order

## Platform choice — pick one before starting
- **React Native + Expo** (recommended if you want a real installable app for the demo): use `expo-sqlite` or `@react-native-async-storage/async-storage` for the local offline queue.
- **PWA** (faster to ship, still installable on a phone home screen, works fully offline via IndexedDB + Service Worker): lower effort, slightly less "native app" feel for judges.

Don't build both. Decide based on how much time you have before the deadline.

## The offline pattern (this is the whole point of the app)
1. User performs an action (register patient / create referral) while offline.
2. App writes it to a local queue (SQLite table or IndexedDB store) with a locally-generated ID and `status: pending`.
3. UI immediately shows the action as done, with a **visible "pending sync" badge** — don't hide this, it's a feature judges should see.
4. When the device regains connectivity (listen for a network-state change), the app calls `POST /sync/batch` with all pending queue items.
5. On success per item, remove it from the local queue and update its UI badge to synced.
6. If a sync fails for an item, keep it queued and retry later — never silently drop data.

## Screens to build (in priority order)
1. Login (cache last-used credentials so re-login works offline too)
2. Register patient (offline-capable) — name, phone, DOB, gender, facility
3. Create referral (offline-capable) — pick patient, from/to facility, reason, urgency
4. Sync status screen/indicator — how many items pending, manual "sync now" button
5. High-risk follow-up worklist — due/overdue patients, log-contact action
6. Language toggle (English/Hindi)

## Design constraints
- Assume a low-end Android phone and a first-time smartphone user: large touch targets, minimal text per screen, clear icons.
- Every "create" action needs an obvious success state, whether it synced immediately or was queued offline — the worker should never wonder if it worked.

## Definition of done for P0
Turn on airplane mode. Register a patient. Create a referral for that patient. See both marked "pending sync." Turn airplane mode off. Watch them sync automatically without touching anything else. Confirm on the website (or via API call) that they now exist server-side.

**This is done.** `RegisterPatientScreen` and `CreateReferralScreen` both check connectivity via `NetInfo`, hit the live endpoint when online, and fall back to `offlineQueue.queueAction()` when offline (or when a request fails mid-flight for a network reason) — the worker sees the same success screen either way, just with a "pending sync" badge instead of "synced." `App.js` registers an auto-sync listener that drains the queue the moment connectivity returns, and `SyncStatusScreen` gives a manual "Sync Now" fallback plus visibility into what's still queued.

One real gap this surfaced and fixed along the way: the backend's `users` table didn't have `dob`/`gender` columns even though this screen collects them — see `backend/migrations/002_add_patient_demographics.sql`. If you add a new field to a form here, check it's actually stored server-side, not just accepted and silently dropped.

## Not yet built (still real work before this is demo-ready)
- Real device/emulator testing — this has been syntax-validated (every file parses via Babel, all i18n locale files have matching key sets across en/hi/mr) and logically verified against the live backend via the same request shapes the app makes, but not actually run inside Expo Go or an emulator yet. Do that before the demo, not on demo day.
- **Bhashini voice read-aloud is unverified against the live API.** It's written against Bhashini's publicly documented pipeline shape (`src/services/bhashiniService.js`), but this sandbox has no network access to `bhashini.gov.in` and no real credentials to test with. Register at https://bhashini.gov.in/ulca/user/register, put your `userID` and `ulcaApiKey` into `src/config.js` (`BHASHINI_USER_ID`, `BHASHINI_API_KEY`), and test the actual pipeline response shape before relying on it for a demo — Bhashini's API has changed shape before and may not match exactly what's coded here. If it fails, `ReadAloudButton` degrades to a clear error message instead of crashing, so a demo won't break even if this needs adjustment.
- Patient search currently searches all patients (optionally filtered by facility via a query param the screen doesn't pass yet) rather than defaulting to "patients at my facility first" — fine for a demo-sized dataset, worth revisiting at scale.
- High-risk follow-up log-contact/close actions are online-only (unlike registration/referral, which are offline-first) — this matches FEATURES.md's P1 scope for this feature, but if you want it offline too, extend `offlineQueue.js` and the backend's `/sync/batch` the same way referrals were done.

## What's built now (P0 + the three requested P1 features)
- **Patient search** (`src/components/PatientSearchField.js`, `src/services/patients.js`): debounced search by name/phone against `GET /patients/search`, replacing the old raw-ID input. Falls back to a locally cached "recently seen" list when offline. Newly registered patients (online or offline) are cached immediately so they're referrable right away, even before syncing — see the backend's local-id resolution in `API_CONTRACT.md`.
- **High-Risk Follow-ups screen** (`src/screens/HighRiskScreen.js`): worklist filtered by due/overdue/missed, log-contact and close actions, with a read-aloud button on each condition label.
- **Language toggle** (`src/i18n/`): English, Hindi, and Marathi, switchable from the Login screen or Home screen, persisted across app restarts. All screens use translated strings — 93 keys, fully covered in all three languages.
- **Bhashini voice read-aloud** (`src/services/bhashiniService.js`, `src/components/ReadAloudButton.js`): reads any freeform text aloud in the currently selected language, translating first if the text's source language differs (e.g. a doctor's English note read aloud in Marathi for a worker who prefers that language). See the caveat above — this needs real credentials and a live test pass.
