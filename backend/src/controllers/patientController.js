const db = require("../config/db");

// GET /patients/search?query=&facility_id=
// Matches name or phone (partial, case-insensitive). Used by the ASHA app
// to find an existing patient by name/phone instead of typing a raw ID.
exports.searchPatients = async (req, res) => {
  try {
    const { query, facility_id } = req.query;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "query must be at least 2 characters" });
    }

    const params = [`%${query.trim()}%`];
    let sql = `
      SELECT u.user_id, u.name, u.phone, u.dob, u.gender, u.facility_id, f.name AS facility_name
      FROM users u
      LEFT JOIN facilities f ON f.facility_id = u.facility_id
      WHERE u.role = 'patient'
        AND (u.name ILIKE $1 OR u.phone ILIKE $1)`;

    if (facility_id) {
      params.push(facility_id);
      sql += ` AND u.facility_id = $${params.length}`;
    }
    sql += " ORDER BY u.name ASC LIMIT 20";

    const result = await db.query(sql, params);
    res.status(200).json({ patients: result.rows });
  } catch (error) {
    console.error("searchPatients error:", error);
    res.status(500).json({ message: "Failed to search patients" });
  }
};

// GET /patients/:id — used to resolve a cached/offline-selected patient_id
// back into a display name if needed.
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT user_id, name, phone, dob, gender, facility_id
       FROM users WHERE user_id = $1 AND role = 'patient'`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error("getPatientById error:", error);
    res.status(500).json({ message: "Failed to fetch patient" });
  }
};
