const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get practitioners
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    const [practitioners] = await pool.execute(`
      SELECT p.*, u.first_name, u.last_name, u.email, u.phone
      FROM practitioners p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.verification_status = 'verified'
      ORDER BY p.created_at DESC
    `);
    console.log('Practitioners query result:', practitioners);
    res.json(practitioners);
  } catch (error) {
    console.error("Get practitioners error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create practitioner profile
router.post("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const pool = getPool();

    const {
      licenseNumber,
      qualification,
      specializations,
      experienceYears,
      languagesSpoken,
      consultationFee,
      clinicAffiliation,
      practiceStartDate,
      workingHours,
      consultationDuration,
      maxPatientsPerDay,
    } = req.body;

    const practitionerId = uuidv4();
    await pool.execute(
      `INSERT INTO practitioners (
        practitioner_id, user_id, license_number, qualification, specializations,
        experience_years, languages_spoken, consultation_fee, clinic_affiliation,
        practice_start_date, working_hours, consultation_duration, max_patients_per_day
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        practitionerId,
        req.user.userId,
        licenseNumber,
        qualification,
        JSON.stringify(specializations),
        experienceYears,
        JSON.stringify(languagesSpoken),
        consultationFee,
        clinicAffiliation,
        practiceStartDate,
        JSON.stringify(workingHours),
        consultationDuration,
        maxPatientsPerDay,
      ]
    );

    const [newPractitioner] = await pool.execute(
      `SELECT * FROM practitioners WHERE practitioner_id = ?`,
      [practitionerId]
    );

    res.status(201).json({
      message: "Practitioner profile created successfully",
      practitioner: newPractitioner[0],
    });
  } catch (error) {
    console.error("Create practitioner error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current practitioner's profile
router.get("/profile", authenticateToken, authorizeRoles("practitioner"), async (req, res) => {
  try {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
       FROM practitioners p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.user_id = ?`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Practitioner profile not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get practitioner profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update current practitioner's profile
router.put("/profile", authenticateToken, authorizeRoles("practitioner"), async (req, res) => {
  try {
    const pool = getPool();

    const { workingHours } = req.body;

    await pool.execute(
      `
      UPDATE practitioners
      SET working_hours = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
      [JSON.stringify(workingHours), req.user.userId]
    );

    const [updatedPractitioner] = await pool.execute(
      `SELECT * FROM practitioners WHERE user_id = ?`,
      [req.user.userId]
    );

    if (updatedPractitioner.length === 0) {
      return res
        .status(404)
        .json({ error: "Practitioner profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      practitioner: updatedPractitioner[0],
    });
  } catch (error) {
    console.error("Update practitioner profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
