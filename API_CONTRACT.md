# API Contract

This is the shared agreement between the backend, the website, and the ASHA app. **Both front-end teams should build against this document from day one** — even before every endpoint is implemented, mock responses matching these shapes so nobody blocks on the other.

Base URL (local dev): `http://localhost:5000/api`
Auth: `Authorization: Bearer <JWT>` header on every endpoint except `/auth/login` and `/auth/register`.

---

## Auth

### `POST /auth/register`
```json
// request
{ "name": "Sunita Devi", "phone": "9876543210", "password": "...", "role": "asha_worker", "facility_id": 4 }
// response 201
{ "user_id": 12, "token": "<jwt>" }
```

### `POST /auth/login`
```json
// request
{ "phone": "9876543210", "password": "..." }
// response 200
{ "user_id": 12, "name": "Sunita Devi", "role": "asha_worker", "facility_id": 4, "token": "<jwt>" }
```

---

## Facilities

### `GET /facilities?tier=&district=`
```json
{ "facilities": [
  { "facility_id": 3, "name": "PHC - Village Cluster 1", "tier": "phc", "parent_facility_id": 2, "district": "Demo District" }
]}
```

### `GET /facilities/:id/hierarchy`
Returns the chain from the given facility up to district level. Used by referral-destination pickers.

---

## Appointments

### `POST /appointments`
```json
// request (patient role: patient_id is inferred from the token, no need to send it)
{ "facility_id": 4, "doctor_id": 12, "appointment_date": "2026-09-15", "is_teleconsult": false }
// response 201
{ "message": "Appointment booked", "appointment_id": 1 }
```

### `GET /appointments?facility_id=&status=`
A patient token only ever returns their own appointments regardless of query params; facility staff can filter by facility/status.
```json
{ "appointments": [
  { "appointment_id": 1, "patient_id": 35, "patient_name": "Geeta Kumari", "facility_id": 4,
    "facility_name": "Sub-Centre - Village X", "doctor_id": null, "doctor_name": null,
    "appointment_date": "2026-09-15T00:00:00.000Z", "is_teleconsult": false, "status": "scheduled" }
]}
```

### `PATCH /appointments/:id/status`
```json
{ "status": "cancelled" }  // scheduled | completed | cancelled
```

---

## Prescriptions

### `POST /prescriptions`
Restricted to `doctor`, `receptionist`, `admin` roles.
```json
{ "patient_id": 35, "facility_id": 4, "appointment_id": 1, "medicines": "Paracetamol 500mg - 1 tab twice daily x 5 days", "notes": "Take after food" }
// response 201
{ "message": "Prescription issued", "prescription_id": 1 }
```

### `GET /prescriptions?patient_id=`
A patient token only ever returns their own prescriptions.
```json
{ "prescriptions": [
  { "prescription_id": 1, "patient_id": 35, "medicines": "Paracetamol 500mg ...", "notes": "Take after food",
    "facility_name": "Sub-Centre - Village X", "issued_by_name": "Dr. Anil Sharma", "created_at": "2026-09-06T12:47:07.102Z" }
]}
```

---

## Patients

### `GET /patients/search?query=&facility_id=`
Search by partial name or phone match (case-insensitive), so the ASHA app and website never need to ask a worker to type a raw patient ID.
```json
{ "patients": [
  { "user_id": 35, "name": "Geeta Kumari", "phone": "9111122223", "dob": "1998-04-12", "gender": "female",
    "facility_id": 4, "facility_name": "Sub-Centre - Village X" }
]}
```
`query` must be at least 2 characters. Returns up to 20 results.

### `GET /patients/:id`
Resolve a single patient by ID (e.g. to redisplay a name for a patient_id that was selected while offline and cached locally).
```json
{ "patient": { "user_id": 35, "name": "Geeta Kumari", "phone": "9111122223", "dob": "1998-04-12", "gender": "female", "facility_id": 4 } }
```

---

## Referrals

### `POST /referrals`
```json
// request
{ "patient_id": 55, "from_facility_id": 4, "to_facility_id": 2, "reason": "suspected TB, needs X-ray", "urgency": "routine" }
// response 201
{ "referral_id": 101, "status": "referred" }
```

### `PATCH /referrals/:id/status`
```json
// request
{ "status": "arrived", "note": "optional" }
// valid statuses: referred | travel_in_progress | arrived | seen | completed | missed
```

### `GET /referrals?status=&facility_id=&patient_id=`
```json
{ "referrals": [
  { "referral_id": 101, "patient_id": 55, "patient_name": "Ramesh Kumar",
    "from_facility_id": 4, "from_facility_name": "Sub-Centre X",
    "to_facility_id": 2, "to_facility_name": "Rural Hospital A",
    "status": "referred", "urgency": "routine", "created_at": "2026-09-05T10:00:00Z" }
]}
```

---

## High-Risk Follow-ups

### `POST /high-risk`
```json
{ "patient_id": 55, "category": "maternal", "condition_label": "ANC 3rd trimester",
  "facility_id": 4, "next_due_date": "2026-09-20", "frequency_days": 30 }
```

### `GET /high-risk?facility_id=&status=`
```json
{ "followups": [
  { "followup_id": 9, "patient_name": "Kavita Singh", "category": "maternal",
    "condition_label": "ANC 3rd trimester", "next_due_date": "2026-09-20", "status": "due" }
]}
```

### `PATCH /high-risk/:id/contact`
Logs a contact; server reschedules `next_due_date` by `frequency_days` and resets status to `on_track`.

---

## Dashboard

### `GET /dashboard/district?district=`
```json
{
  "referralStats": { "total_referrals": 42, "completed": 30, "missed": 3, "completion_rate_pct": 71.4 },
  "highRiskStats": { "total_enrolled": 18, "overdue": 2, "due_soon": 4 },
  "emergencyStats": { "open_escalations": 1 },
  "lowStock": [ { "facility_name": "PHC 1", "medicine_name": "Paracetamol", "quantity_available": 3 } ],
  "facilityActivity": [ { "facility_id": 2, "name": "Rural Hospital A", "appointments_last_30d": 56 } ]
}
```

---

## Emergency Escalations

### `POST /emergency`
```json
{ "patient_id": 55, "facility_id": 4, "description": "Severe bleeding, needs immediate transfer" }
```

### `PATCH /emergency/:id/status`
```json
{ "status": "acknowledged" }  // open | acknowledged | dispatched | resolved
```

---

## Offline Sync (ASHA app only)

### `POST /sync/batch`
```json
// request
{
  "device_id": "device_abc123",
  "items": [
    { "local_id": "local_1699999_x1", "entity_type": "patient_registration",
      "payload": { "name": "...", "phone": "...", "facility_id": 4 } },
    { "local_id": "local_1699999_x2", "entity_type": "referral",
      "payload": { "patient_id": 55, "from_facility_id": 4, "to_facility_id": 2, "reason": "...", "urgency": "routine" } }
  ]
}
// response 200
{ "results": [
  { "local_id": "local_1699999_x1", "status": "synced", "server_entity_id": 201 },
  { "local_id": "local_1699999_x2", "status": "synced", "server_entity_id": 105 }
]}
```
`entity_type` supported values: `patient_registration`, `referral`, `high_risk_followup`.

**Chained offline actions (same batch):** if a referral or high-risk enrollment is created for a patient who was *also* registered offline in the same session, set that item's `payload.patient_id` to the *other* item's `local_id` string (e.g. `"local_1699999_x1"`) instead of a number. The server processes items in array order and resolves the reference automatically once the patient registration ahead of it in the same batch succeeds. If the referenced registration isn't in the batch (or comes after it, or itself failed), that item comes back with `status: "failed"` and stays queued for the next sync attempt — never silently dropped.

---

## Error shape (all endpoints)
```json
{ "message": "Human-readable error description" }
```
Status codes: `400` validation, `401` missing/invalid token, `403` wrong role, `404` not found, `500` server error.

---

## Change process
If either app needs a field or endpoint that isn't here, **update this file in the same PR** that adds the backend support for it — don't let the two sides drift apart.
