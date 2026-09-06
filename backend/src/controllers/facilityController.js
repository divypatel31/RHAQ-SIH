const db = require("../config/db");

// GET /facilities?tier=&district=
exports.getAllFacilities = async (req, res) => {
  try {
    const { tier, district } = req.query;
    const conditions = [];
    const params = [];

    if (tier) {
      params.push(tier);
      conditions.push(`tier = $${params.length}`);
    }
    if (district) {
      params.push(district);
      conditions.push(`district = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await db.query(`SELECT * FROM facilities ${where} ORDER BY tier, name`, params);

    res.status(200).json({ facilities: result.rows });
  } catch (error) {
    console.error("getAllFacilities error:", error);
    res.status(500).json({ message: "Failed to fetch facilities" });
  }
};

// GET /facilities/:id/hierarchy
exports.getFacilityHierarchy = async (req, res) => {
  try {
    const { id } = req.params;
    const chain = [];
    let currentId = id;
    let guard = 0;

    while (currentId && guard < 10) {
      const result = await db.query("SELECT * FROM facilities WHERE facility_id = $1", [currentId]);
      if (result.rows.length === 0) break;
      chain.push(result.rows[0]);
      currentId = result.rows[0].parent_facility_id;
      guard++;
    }

    res.status(200).json({ chain });
  } catch (error) {
    console.error("getFacilityHierarchy error:", error);
    res.status(500).json({ message: "Failed to fetch facility hierarchy" });
  }
};

// POST /facilities (admin only)
exports.createFacility = async (req, res) => {
  try {
    const {
      name, tier, parent_facility_id, district, block,
      village_or_area, latitude, longitude, contact_phone,
      has_diagnostics, has_teleconsult_kiosk,
    } = req.body;

    if (!name || !tier || !district) {
      return res.status(400).json({ message: "name, tier and district are required" });
    }

    const result = await db.query(
      `INSERT INTO facilities
        (name, tier, parent_facility_id, district, block, village_or_area,
         latitude, longitude, contact_phone, has_diagnostics, has_teleconsult_kiosk)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING facility_id`,
      [
        name, tier, parent_facility_id || null, district, block || null,
        village_or_area || null, latitude || null, longitude || null,
        contact_phone || null, !!has_diagnostics, !!has_teleconsult_kiosk,
      ]
    );

    res.status(201).json({ message: "Facility created", facility_id: result.rows[0].facility_id });
  } catch (error) {
    console.error("createFacility error:", error);
    res.status(500).json({ message: "Failed to create facility" });
  }
};

// GET /facilities/:id/medicine-stock
exports.getFacilityMedicineStock = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT fms.stock_id, m.medicine_id, m.name AS medicine_name,
              fms.quantity_available, fms.low_stock_threshold,
              (fms.quantity_available <= fms.low_stock_threshold) AS is_low_stock,
              fms.updated_at
       FROM facility_medicine_stock fms
       JOIN medicines m ON m.medicine_id = fms.medicine_id
       WHERE fms.facility_id = $1
       ORDER BY is_low_stock DESC, m.name`,
      [id]
    );
    res.status(200).json({ stock: result.rows });
  } catch (error) {
    console.error("getFacilityMedicineStock error:", error);
    res.status(500).json({ message: "Failed to fetch medicine stock" });
  }
};

// GET /facilities/medicine-search?medicine_id=&district=
exports.searchMedicineAcrossFacilities = async (req, res) => {
  try {
    const { medicine_id, district } = req.query;
    if (!medicine_id) {
      return res.status(400).json({ message: "medicine_id is required" });
    }

    const params = [medicine_id];
    let query = `
      SELECT f.facility_id, f.name AS facility_name, f.tier, f.district,
             fms.quantity_available
      FROM facility_medicine_stock fms
      JOIN facilities f ON f.facility_id = fms.facility_id
      WHERE fms.medicine_id = $1 AND fms.quantity_available > 0`;

    if (district) {
      params.push(district);
      query += ` AND f.district = $${params.length}`;
    }
    query += " ORDER BY fms.quantity_available DESC";

    const result = await db.query(query, params);
    res.status(200).json({ results: result.rows });
  } catch (error) {
    console.error("searchMedicineAcrossFacilities error:", error);
    res.status(500).json({ message: "Failed to search medicine availability" });
  }
};
