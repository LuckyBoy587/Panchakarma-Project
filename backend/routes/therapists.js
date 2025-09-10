const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get therapists
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    const [therapists] = await pool.execute(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone
      FROM therapists t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.verification_status = 'verified'
      ORDER BY t.created_at DESC
    `);
    console.log('Therapists query result:', therapists);
    res.json(therapists);
  } catch (error) {
    console.error("Get therapists error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create therapist profile
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

    const therapistId = uuidv4();
    await pool.execute(
      `INSERT INTO therapists (
        therapist_id, user_id, license_number, qualification, specializations,
        experience_years, languages_spoken, consultation_fee, clinic_affiliation,
        practice_start_date, working_hours, consultation_duration, max_patients_per_day
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        therapistId,
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

    const [newTherapist] = await pool.execute(
      `SELECT * FROM therapists WHERE therapist_id = ?`,
      [therapistId]
    );

    res.status(201).json({
      message: "Therapist profile created successfully",
      therapist: newTherapist[0],
    });
  } catch (error) {
    console.error("Create therapist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current therapist's profile
router.get("/profile", authenticateToken, authorizeRoles("therapist"), async (req, res) => {
  try {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT t.*, u.first_name, u.last_name, u.email, u.phone
       FROM therapists t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.user_id = ?`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Therapist profile not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get therapist profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update current therapist's profile
router.put("/profile", authenticateToken, authorizeRoles("therapist"), async (req, res) => {
  try {
    const pool = getPool();

    const { workingHours } = req.body;

    await pool.execute(
      `
      UPDATE therapists
      SET working_hours = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
      [JSON.stringify(workingHours), req.user.userId]
    );

    const [updatedTherapist] = await pool.execute(
      `SELECT * FROM therapists WHERE user_id = ?`,
      [req.user.userId]
    );

    if (updatedTherapist.length === 0) {
      return res
        .status(404)
        .json({ error: "Therapist profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      therapist: updatedTherapist[0],
    });
  } catch (error) {
    console.error("Update therapist profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leave-days", authenticateToken, authorizeRoles("therapist"), async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT leave_days FROM therapists WHERE user_id = ?`,
      [req.user.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Therapist not found" });
    }
    res.json({ leaveDays: rows[0].leave_days || [] });
  } catch (error) {
    console.error("Get leave days error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
