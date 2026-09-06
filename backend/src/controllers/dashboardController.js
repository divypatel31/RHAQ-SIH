const db = require("../config/db");

// GET /dashboard/district?district=
exports.getDistrictOverview = async (req, res) => {
  try {
    const { district } = req.query;
    const params = district ? [district] : [];
    const districtFilter = district ? "WHERE f.district = $1" : "";

    const referralStatsResult = await db.query(
      `SELECT
         COUNT(*)::int AS total_referrals,
         COUNT(*) FILTER (WHERE r.status = 'completed')::int AS completed,
         COUNT(*) FILTER (WHERE r.status = 'missed')::int AS missed,
         COUNT(*) FILTER (WHERE r.status IN ('referred','travel_in_progress'))::int AS in_progress,
         ROUND(100.0 * COUNT(*) FILTER (WHERE r.status = 'completed') / NULLIF(COUNT(*), 0), 1) AS completion_rate_pct
       FROM referrals r
       JOIN facilities f ON f.facility_id = r.to_facility_id
       ${districtFilter}`,
      params
    );

    const highRiskStatsResult = await db.query(
      `SELECT
         COUNT(*)::int AS total_enrolled,
         COUNT(*) FILTER (WHERE hf.status = 'overdue')::int AS overdue,
         COUNT(*) FILTER (WHERE hf.status = 'missed')::int AS missed,
         COUNT(*) FILTER (WHERE hf.status = 'due')::int AS due_soon
       FROM high_risk_followups hf
       JOIN facilities f ON f.facility_id = hf.facility_id
       ${districtFilter}`,
      params
    );

    const emergencyStatsResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE e.status = 'open')::int AS open_escalations,
         COUNT(*) FILTER (WHERE e.status = 'acknowledged')::int AS acknowledged,
         COUNT(*)::int AS total_escalations
       FROM emergency_escalations e
       JOIN facilities f ON f.facility_id = e.facility_id
       ${districtFilter}`,
      params
    );

    const lowStockWhere = district
      ? `WHERE f.district = $1 AND fms.quantity_available <= fms.low_stock_threshold`
      : `WHERE fms.quantity_available <= fms.low_stock_threshold`;
    const lowStockResult = await db.query(
      `SELECT f.name AS facility_name, m.name AS medicine_name, fms.quantity_available
       FROM facility_medicine_stock fms
       JOIN facilities f ON f.facility_id = fms.facility_id
       JOIN medicines m ON m.medicine_id = fms.medicine_id
       ${lowStockWhere}
       ORDER BY fms.quantity_available ASC
       LIMIT 20`,
      params
    );

    const facilityActivityResult = await db.query(
      `SELECT f.facility_id, f.name, f.tier,
              COUNT(DISTINCT a.appointment_id)::int AS appointments_last_30d
       FROM facilities f
       LEFT JOIN appointments a
         ON a.facility_id = f.facility_id
         AND a.appointment_date >= (CURRENT_DATE - INTERVAL '30 days')
       ${districtFilter}
       GROUP BY f.facility_id, f.name, f.tier
       ORDER BY f.tier, f.name`,
      params
    );

    res.status(200).json({
      referralStats: referralStatsResult.rows[0],
      highRiskStats: highRiskStatsResult.rows[0],
      emergencyStats: emergencyStatsResult.rows[0],
      lowStock: lowStockResult.rows,
      facilityActivity: facilityActivityResult.rows,
    });
  } catch (error) {
    console.error("getDistrictOverview error:", error);
    res.status(500).json({ message: "Failed to build district overview" });
  }
};

// GET /dashboard/facility/:id
exports.getFacilityOverview = async (req, res) => {
  try {
    const { id } = req.params;

    const referralsOut = await db.query(
      "SELECT COUNT(*)::int AS count FROM referrals WHERE from_facility_id = $1 AND status NOT IN ('completed','missed')",
      [id]
    );
    const referralsIn = await db.query(
      "SELECT COUNT(*)::int AS count FROM referrals WHERE to_facility_id = $1 AND status NOT IN ('completed','missed')",
      [id]
    );
    const highRiskBacklog = await db.query(
      "SELECT COUNT(*)::int AS count FROM high_risk_followups WHERE facility_id = $1 AND status IN ('due','overdue','missed')",
      [id]
    );
    const openEmergencies = await db.query(
      "SELECT COUNT(*)::int AS count FROM emergency_escalations WHERE facility_id = $1 AND status = 'open'",
      [id]
    );

    res.status(200).json({
      referralsOutPending: referralsOut.rows[0].count,
      referralsInPending: referralsIn.rows[0].count,
      highRiskBacklog: highRiskBacklog.rows[0].count,
      openEmergencies: openEmergencies.rows[0].count,
    });
  } catch (error) {
    console.error("getFacilityOverview error:", error);
    res.status(500).json({ message: "Failed to build facility overview" });
  }
};
