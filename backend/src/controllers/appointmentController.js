const db = require("../config/db");

// POST /appointments
// A patient books an appointment at a facility; is_teleconsult flags a
// remote consultation rather than an in-person visit.
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, facility_id, doctor_id, appointment_date, is_teleconsult } = req.body;
    const actingPatientId = req.user?.role === "patient" ? req.user.user_id : patient_id;

    if (!actingPatientId || !facility_id || !appointment_date) {
      return res.status(400).json({ message: "patient_id, facility_id and appointment_date are required" });
    }

    const result = await db.query(
      `INSERT INTO appointments (patient_id, facility_id, doctor_id, appointment_date, is_teleconsult, status)
       VALUES ($1,$2,$3,$4,$5,'scheduled')
       RETURNING appointment_id`,
      [actingPatientId, facility_id, doctor_id || null, appointment_date, !!is_teleconsult]
    );

    res.status(201).json({ message: "Appointment booked", appointment_id: result.rows[0].appointment_id });
  } catch (error) {
    console.error("createAppointment error:", error);
    res.status(500).json({ message: "Failed to book appointment" });
  }
};

// GET /appointments?patient_id=&facility_id=&status=
// A patient only ever sees their own; facility staff can filter by facility.
exports.getAppointments = async (req, res) => {
  try {
    const { facility_id, status } = req.query;
    const patient_id = req.user?.role === "patient" ? req.user.user_id : req.query.patient_id;

    const params = [];
    const conditions = [];

    if (patient_id) { params.push(patient_id); conditions.push(`a.patient_id = $${params.length}`); }
    if (facility_id) { params.push(facility_id); conditions.push(`a.facility_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`a.status = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT a.*, f.name AS facility_name, u.name AS patient_name, d.name AS doctor_name
       FROM appointments a
       JOIN facilities f ON f.facility_id = a.facility_id
       JOIN users u ON u.user_id = a.patient_id
       LEFT JOIN users d ON d.user_id = a.doctor_id
       ${where}
       ORDER BY a.appointment_date DESC`,
      params
    );

    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    console.error("getAppointments error:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// PATCH /appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const valid = ["scheduled", "completed", "cancelled"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${valid.join(", ")}` });
    }

    await db.query("UPDATE appointments SET status = $1 WHERE appointment_id = $2", [status, id]);
    res.status(200).json({ message: "Appointment status updated" });
  } catch (error) {
    console.error("updateAppointmentStatus error:", error);
    res.status(500).json({ message: "Failed to update appointment" });
  }
};
