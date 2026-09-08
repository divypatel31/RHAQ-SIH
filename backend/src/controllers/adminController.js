const db = require("../config/db");

const VALID_ROLES = ["patient", "asha_worker", "doctor", "receptionist", "admin"];

// GET /admin/users?role=&facility_id=&query=
exports.listUsers = async (req, res) => {
  try {
    const { role, facility_id, query } = req.query;
    const params = [];
    const conditions = [];

    if (role) { params.push(role); conditions.push(`u.role = $${params.length}`); }
    if (facility_id) { params.push(facility_id); conditions.push(`u.facility_id = $${params.length}`); }
    if (query) { params.push(`%${query}%`); conditions.push(`(u.name ILIKE $${params.length} OR u.phone ILIKE $${params.length})`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT u.user_id, u.name, u.phone, u.role, u.facility_id, f.name AS facility_name, u.created_at
       FROM users u
       LEFT JOIN facilities f ON f.facility_id = u.facility_id
       ${where}
       ORDER BY u.role, u.name
       LIMIT 200`,
      params
    );

    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("listUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// PATCH /admin/users/:id
// Deliberately narrow: only name, role, and facility_id are editable here.
// No password reset or hard delete from this endpoint — those need their
// own careful flows (password reset should invalidate sessions; delete
// cascades into referrals/appointments/prescriptions and shouldn't be a
// one-click action).
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, facility_id } = req.body;

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of ${VALID_ROLES.join(", ")}` });
    }

    const existing = await db.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const current = existing.rows[0];

    await db.query(
      `UPDATE users SET name = $1, role = $2, facility_id = $3 WHERE user_id = $4`,
      [
        name ?? current.name,
        role ?? current.role,
        facility_id !== undefined ? (facility_id || null) : current.facility_id,
        id,
      ]
    );

    res.status(200).json({ message: "User updated" });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};
