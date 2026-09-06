const db = require("../config/db");

const VALID_STATUSES = ["open", "acknowledged", "dispatched", "resolved"];

// POST /emergency
exports.raiseEscalation = async (req, res) => {
  try {
    const { patient_id, facility_id, description } = req.body;
    const raised_by_user_id = req.user?.user_id || req.body.raised_by_user_id;

    if (!facility_id || !description) {
      return res.status(400).json({ message: "facility_id and description are required" });
    }

    const result = await db.query(
      `INSERT INTO emergency_escalations (patient_id, raised_by_user_id, facility_id, description, status)
       VALUES ($1,$2,$3,$4,'open')
       RETURNING escalation_id`,
      [patient_id || null, raised_by_user_id, facility_id, description]
    );

    res.status(201).json({ message: "Emergency escalation raised", escalation_id: result.rows[0].escalation_id });
  } catch (error) {
    console.error("raiseEscalation error:", error);
    res.status(500).json({ message: "Failed to raise escalation" });
  }
};

// GET /emergency?status=&facility_id=
exports.getEscalations = async (req, res) => {
  try {
    const { status, facility_id } = req.query;
    const params = [];
    const conditions = [];

    if (status) { params.push(status); conditions.push(`e.status = $${params.length}`); }
    if (facility_id) { params.push(facility_id); conditions.push(`e.facility_id = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT e.*, f.name AS facility_name, u.name AS raised_by_name
       FROM emergency_escalations e
       JOIN facilities f ON f.facility_id = e.facility_id
       LEFT JOIN users u ON u.user_id = e.raised_by_user_id
       ${where}
       ORDER BY
         CASE e.status
           WHEN 'open' THEN 0 WHEN 'acknowledged' THEN 1 WHEN 'dispatched' THEN 2 ELSE 3
         END,
         e.created_at DESC`,
      params
    );

    res.status(200).json({ escalations: result.rows });
  } catch (error) {
    console.error("getEscalations error:", error);
    res.status(500).json({ message: "Failed to fetch escalations" });
  }
};

// PATCH /emergency/:id/status
exports.updateEscalationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${VALID_STATUSES.join(", ")}` });
    }

    await db.query(
      `UPDATE emergency_escalations
       SET status = $1::varchar, resolved_at = CASE WHEN $1::varchar = 'resolved' THEN NOW() ELSE resolved_at END
       WHERE escalation_id = $2`,
      [status, id]
    );

    res.status(200).json({ message: "Escalation status updated" });
  } catch (error) {
    console.error("updateEscalationStatus error:", error);
    res.status(500).json({ message: "Failed to update escalation" });
  }
};
