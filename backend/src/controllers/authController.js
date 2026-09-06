const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const VALID_ROLES = ["patient", "asha_worker", "doctor", "receptionist", "admin"];

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, role: user.role, facility_id: user.facility_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { name, phone, password, role, facility_id, dob, gender } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: "name, phone, password and role are required" });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of ${VALID_ROLES.join(", ")}` });
    }

    const existing = await db.query("SELECT user_id FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "A user with this phone number already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, phone, password_hash, role, facility_id, dob, gender)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, name, role, facility_id`,
      [name, phone, password_hash, role, facility_id || null, dob || null, gender || null]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({ user_id: user.user_id, token });
  } catch (error) {
    console.error("register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "phone and password are required" });
    }

    const result = await db.query(
      "SELECT user_id, name, role, facility_id, password_hash FROM users WHERE phone = $1",
      [phone]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const token = signToken(user);
    res.status(200).json({
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      facility_id: user.facility_id,
      token,
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
