const db = require("../config/db");

// POST /high-risk
exports.createFollowup = async (req, res) => {
  try {
    const {
      patient_id, category, condition_label, facility_id,
      assigned_worker_id, next_due_date, frequency_days, notes,
    } = req.body;

    if (!patient_id || !category || !condition_label || !facility_id || !next_due_date) {
      return res.status(400).json({
        message: "patient_id, category, condition_label, facility_id and next_due_date are required",
      });
    }

    const result = await db.query(
      `INSERT INTO high_risk_followups
        (patient_id, category, condition_label, facility_id, assigned_worker_id,
         next_due_date, frequency_days, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'on_track')
       RETURNING followup_id`,
      [
        patient_id, category, condition_label, facility_id,
        assigned_worker_id || null, next_due_date, frequency_days || 30, notes || null,
      ]
    );

    res.status(201).json({ message: "Follow-up enrolled", followup_id: result.rows[0].followup_id });
  } catch (error) {
    console.error("createFollowup error:", error);
    res.status(500).json({ message: "Failed to create follow-up" });
  }
};

// GET /high-risk?facility_id=&status=&assigned_worker_id=&category=
exports.getFollowups = async (req, res) => {
  try {
    const { facility_id, status, assigned_worker_id, category } = req.query;
    const params = [];
    const conditions = [];

    if (facility_id) { params.push(facility_id); conditions.push(`hf.facility_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`hf.status = $${params.length}`); }
    if (assigned_worker_id) { params.push(assigned_worker_id); conditions.push(`hf.assigned_worker_id = $${params.length}`); }
    if (category) { params.push(category); conditions.push(`hf.category = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT hf.*, u.name AS patient_name, u.phone AS patient_phone,
              w.name AS assigned_worker_name, f.name AS facility_name
       FROM high_risk_followups hf
       JOIN users u ON u.user_id = hf.patient_id
       LEFT JOIN users w ON w.user_id = hf.assigned_worker_id
       JOIN facilities f ON f.facility_id = hf.facility_id
       ${where}
       ORDER BY
         CASE hf.status
           WHEN 'overdue' THEN 0 WHEN 'missed' THEN 1 WHEN 'due' THEN 2 ELSE 3
         END,
         hf.next_due_date ASC`,
      params
    );

    res.status(200).json({ followups: result.rows });
  } catch (error) {
    console.error("getFollowups error:", error);
    res.status(500).json({ message: "Failed to fetch follow-ups" });
  }
};

// PATCH /high-risk/:id/contact
exports.logContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const existing = await db.query(
      "SELECT frequency_days FROM high_risk_followups WHERE followup_id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Follow-up not found" });
    }
    const { frequency_days } = existing.rows[0];

    await db.query(
      `UPDATE high_risk_followups
       SET last_contacted_at = NOW(),
           next_due_date = CURRENT_DATE + ($1::text || ' days')::interval,
           status = 'on_track',
           notes = CONCAT(COALESCE(notes, ''), E'\n', $2::text)
       WHERE followup_id = $3`,
      [frequency_days, notes || "Contacted", id]
    );

    res.status(200).json({ message: "Contact logged, next due date updated" });
  } catch (error) {
    console.error("logContact error:", error);
    res.status(500).json({ message: "Failed to log contact" });
  }
};

// PATCH /high-risk/:id/close
exports.closeFollowup = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE high_risk_followups SET status = 'closed' WHERE followup_id = $1", [id]);
    res.status(200).json({ message: "Follow-up closed" });
  } catch (error) {
    console.error("closeFollowup error:", error);
    res.status(500).json({ message: "Failed to close follow-up" });
  }
};

// Called by the cron sweeper (src/cron/followupStatusJob.js)
exports.recomputeFollowupStatuses = async () => {
  await db.query(
    `UPDATE high_risk_followups
     SET status = CASE
       WHEN status = 'closed' THEN 'closed'
       WHEN next_due_date < CURRENT_DATE - INTERVAL '14 days' THEN 'missed'
       WHEN next_due_date < CURRENT_DATE THEN 'overdue'
       WHEN next_due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'due'
       ELSE 'on_track'
     END
     WHERE status != 'closed'`
  );
};
