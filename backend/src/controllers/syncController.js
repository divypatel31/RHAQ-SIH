const bcrypt = require("bcryptjs");
const db = require("../config/db");

// POST /sync/batch
// body: { device_id, items: [{ local_id, entity_type, payload }] }
exports.syncBatch = async (req, res) => {
  const { device_id, items } = req.body;
  if (!device_id || !Array.isArray(items)) {
    return res.status(400).json({ message: "device_id and items[] are required" });
  }

  const results = [];
  // Maps a client local_id -> the real server id, populated as we process
  // each item. This lets a referral queued in the same offline session as
  // a brand-new patient registration resolve that patient's real id, even
  // though neither had synced yet when the worker created them.
  const localIdToServerId = {};

  function resolvePatientId(rawPatientId) {
    if (typeof rawPatientId === "string" && rawPatientId.startsWith("local_")) {
      return localIdToServerId[rawPatientId] || null;
    }
    return rawPatientId;
  }

  for (const item of items) {
    const { local_id, entity_type, payload } = item;
    try {
      let server_entity_id = null;

      switch (entity_type) {
        case "patient_registration": {
          const password_hash = await bcrypt.hash(payload.password_hash || payload.password || payload.phone, 10);
          const r = await db.query(
            `INSERT INTO users (name, phone, password_hash, role, facility_id, abha_id, preferred_language, dob, gender)
             VALUES ($1,$2,$3,'patient',$4,$5,$6,$7,$8)
             RETURNING user_id`,
            [
              payload.name, payload.phone, password_hash, payload.facility_id || null,
              payload.abha_id || null, payload.preferred_language || "en",
              payload.dob || null, payload.gender || null,
            ]
          );
          server_entity_id = r.rows[0].user_id;
          break;
        }
        case "referral": {
          const patient_id = resolvePatientId(payload.patient_id);
          if (!patient_id) {
            throw new Error("Referenced patient has not synced yet — it will retry on the next sync.");
          }
          const r = await db.query(
            `INSERT INTO referrals
              (patient_id, referred_by_user_id, from_facility_id, to_facility_id, reason, urgency, status)
             VALUES ($1,$2,$3,$4,$5,$6,'referred')
             RETURNING referral_id`,
            [
              patient_id, payload.referred_by_user_id, payload.from_facility_id,
              payload.to_facility_id, payload.reason, payload.urgency || "routine",
            ]
          );
          server_entity_id = r.rows[0].referral_id;
          break;
        }
        case "high_risk_followup": {
          const patient_id = resolvePatientId(payload.patient_id);
          if (!patient_id) {
            throw new Error("Referenced patient has not synced yet — it will retry on the next sync.");
          }
          const r = await db.query(
            `INSERT INTO high_risk_followups
              (patient_id, category, condition_label, facility_id, assigned_worker_id, next_due_date, frequency_days, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             RETURNING followup_id`,
            [
              patient_id, payload.category, payload.condition_label, payload.facility_id,
              payload.assigned_worker_id || null, payload.next_due_date,
              payload.frequency_days || 30, payload.notes || null,
            ]
          );
          server_entity_id = r.rows[0].followup_id;
          break;
        }
        default:
          throw new Error(`Unsupported entity_type: ${entity_type}`);
      }

      if (server_entity_id) localIdToServerId[local_id] = server_entity_id;

      await db.query(
        `INSERT INTO offline_sync_log (device_id, entity_type, client_local_id, server_entity_id, payload)
         VALUES ($1,$2,$3,$4,$5)`,
        [device_id, entity_type, local_id, server_entity_id, JSON.stringify(payload)]
      );

      results.push({ local_id, status: "synced", server_entity_id });
    } catch (error) {
      console.error("sync item failed:", local_id, error.message);
      results.push({ local_id, status: "failed", error: error.message });
    }
  }

  res.status(200).json({ results });
};
