const db = require("../config/db");

const VALID_STATUSES = ["referred", "travel_in_progress", "arrived", "seen", "completed", "missed"];

// POST /referrals
exports.createReferral = async (req, res) => {
  try {
    const { patient_id, from_facility_id, to_facility_id, reason, urgency } = req.body;
    const referred_by_user_id = req.user?.user_id || req.body.referred_by_user_id;

    if (!patient_id || !from_facility_id || !to_facility_id || !reason) {
      return res.status(400).json({
        message: "patient_id, from_facility_id, to_facility_id and reason are required",
      });
    }

    const result = await db.query(
      `INSERT INTO referrals
        (patient_id, referred_by_user_id, from_facility_id, to_facility_id, reason, urgency, status)
       VALUES ($1,$2,$3,$4,$5,$6,'referred')
       RETURNING referral_id`,
      [patient_id, referred_by_user_id, from_facility_id, to_facility_id, reason, urgency || "routine"]
    );
    const referral_id = result.rows[0].referral_id;

    await db.query(
      `INSERT INTO referral_status_log (referral_id, status, note, changed_by_user_id)
       VALUES ($1, 'referred', 'Referral created', $2)`,
      [referral_id, referred_by_user_id]
    );

    // Emergency-urgency referrals also raise an escalation immediately.
    if (urgency === "emergency") {
      await db.query(
        `INSERT INTO emergency_escalations (patient_id, raised_by_user_id, facility_id, description, status)
         VALUES ($1, $2, $3, $4, 'open')`,
        [patient_id, referred_by_user_id, to_facility_id, `Emergency referral: ${reason}`]
      );
    }

    res.status(201).json({ message: "Referral created", referral_id, status: "referred" });
  } catch (error) {
    console.error("createReferral error:", error);
    res.status(500).json({ message: "Failed to create referral" });
  }
};

// PATCH /referrals/:id/status
exports.updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const changed_by = req.user?.user_id || req.body.changed_by_user_id;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${VALID_STATUSES.join(", ")}` });
    }

    await db.query(
      `UPDATE referrals
       SET status = $1::varchar,
           outcome_notes = CASE WHEN $1::varchar IN ('completed','missed') THEN $2 ELSE outcome_notes END,
           updated_at = NOW()
       WHERE referral_id = $3`,
      [status, note || null, id]
    );

    await db.query(
      `INSERT INTO referral_status_log (referral_id, status, note, changed_by_user_id)
       VALUES ($1,$2,$3,$4)`,
      [id, status, note || null, changed_by]
    );

    res.status(200).json({ message: "Referral status updated" });
  } catch (error) {
    console.error("updateReferralStatus error:", error);
    res.status(500).json({ message: "Failed to update referral status" });
  }
};

// GET /referrals?status=&facility_id=&patient_id=
exports.getReferrals = async (req, res) => {
  try {
    const { status, facility_id, patient_id } = req.query;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }
    if (facility_id) {
      params.push(facility_id);
      conditions.push(`(r.from_facility_id = $${params.length} OR r.to_facility_id = $${params.length})`);
    }
    if (patient_id) {
      params.push(patient_id);
      conditions.push(`r.patient_id = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT r.*,
              pf.name AS from_facility_name, pf.tier AS from_facility_tier,
              tf.name AS to_facility_name, tf.tier AS to_facility_tier,
              u.name AS patient_name
       FROM referrals r
       JOIN facilities pf ON pf.facility_id = r.from_facility_id
       JOIN facilities tf ON tf.facility_id = r.to_facility_id
       JOIN users u ON u.user_id = r.patient_id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );

    res.status(200).json({ referrals: result.rows });
  } catch (error) {
    console.error("getReferrals error:", error);
    res.status(500).json({ message: "Failed to fetch referrals" });
  }
};

// GET /referrals/:id/timeline
exports.getReferralTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT rsl.*, u.name AS changed_by_name
       FROM referral_status_log rsl
       LEFT JOIN users u ON u.user_id = rsl.changed_by_user_id
       WHERE rsl.referral_id = $1
       ORDER BY rsl.changed_at ASC`,
      [id]
    );
    res.status(200).json({ timeline: result.rows });
  } catch (error) {
    console.error("getReferralTimeline error:", error);
    res.status(500).json({ message: "Failed to fetch referral timeline" });
  }
};

// Called by the cron sweeper (src/cron/followupStatusJob.js)
exports.flagStaleReferrals = async (staleAfterHours = 72) => {
  await db.query(
    `UPDATE referrals
     SET status = 'missed', updated_at = NOW()
     WHERE status IN ('referred', 'travel_in_progress')
       AND created_at < NOW() - ($1::text || ' hours')::interval`,
    [staleAfterHours]
  );
};
