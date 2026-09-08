const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const referralRoutes = require("./routes/referralRoutes");
const highRiskRoutes = require("./routes/highRiskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const syncRoutes = require("./routes/syncRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "rhaq-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/high-risk", highRiskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/sync", syncRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
