const db = require("../config/db");

// POST /prescriptions — issued by facility staff (doctor/receptionist/admin)
exports.createPrescription = async (req, res) => {
  try {
    const { patient_id, facility_id, appointment_id, medicines, notes } = req.body;
    const issued_by_user_id = req.user?.user_id;

    if (!patient_id || !medicines) {
      return res.status(400).json({ message: "patient_id and medicines are required" });
    }

    const result = await db.query(
      `INSERT INTO prescriptions (patient_id, issued_by_user_id, facility_id, appointment_id, medicines, notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING prescription_id`,
      [patient_id, issued_by_user_id, facility_id || null, appointment_id || null, medicines, notes || null]
    );

    res.status(201).json({ message: "Prescription issued", prescription_id: result.rows[0].prescription_id });
  } catch (error) {
    console.error("createPrescription error:", error);
    res.status(500).json({ message: "Failed to issue prescription" });
  }
};

// GET /prescriptions?patient_id= — a patient only ever sees their own
exports.getPrescriptions = async (req, res) => {
  try {
    const patient_id = req.user?.role === "patient" ? req.user.user_id : req.query.patient_id;
    if (!patient_id) {
      return res.status(400).json({ message: "patient_id is required" });
    }

    const result = await db.query(
      `SELECT p.*, f.name AS facility_name, doc.name AS issued_by_name
       FROM prescriptions p
       LEFT JOIN facilities f ON f.facility_id = p.facility_id
       LEFT JOIN users doc ON doc.user_id = p.issued_by_user_id
       WHERE p.patient_id = $1
       ORDER BY p.created_at DESC`,
      [patient_id]
    );

    res.status(200).json({ prescriptions: result.rows });
  } catch (error) {
    console.error("getPrescriptions error:", error);
    res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
};
