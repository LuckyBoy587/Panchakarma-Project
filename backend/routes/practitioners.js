const express = require("express");
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
      JOIN users u ON p.practitioner_id = u.user_id
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
// Allow a registered practitioner to create their own profile (practitioner_id == user_id)
router.post("/", authenticateToken, authorizeRoles("practitioner","admin"), async (req, res) => {
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
      startTime,
      endTime,
      bio,
      verificationDocuments,
      leaveDays,
      consultationDuration,
      maxPatientsPerDay,
      emergencyAvailability,
    } = req.body;

    // Validate required fields per schema
    if (
      !licenseNumber ||
      !qualification ||
      !specializations ||
      experienceYears === undefined ||
      !languagesSpoken ||
      consultationFee === undefined ||
      !practiceStartDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ error: "Missing required practitioner fields" });
    }

    // Use the authenticated user's id as the practitioner_id (one-to-one relationship)
    const practitionerId = req.user.userId;

    // Prevent creating a duplicate profile for the same user
    const [existing] = await pool.execute(
      `SELECT * FROM practitioners WHERE practitioner_id = ?`,
      [practitionerId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Practitioner profile already exists for this user" });
    }

    try {
      await pool.execute(
        `INSERT INTO practitioners (
          practitioner_id, license_number, qualification, specializations,
          experience_years, languages_spoken, consultation_fee, clinic_affiliation,
          practice_start_date, bio, verification_documents, start_time, end_time,
          leave_days, consultation_duration, max_patients_per_day, emergency_availability
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          practitionerId,
          licenseNumber,
          qualification,
          JSON.stringify(specializations),
          experienceYears,
          JSON.stringify(languagesSpoken),
          consultationFee,
          clinicAffiliation || null,
          practiceStartDate,
          bio || null,
          verificationDocuments ? JSON.stringify(verificationDocuments) : null,
          startTime,
          endTime,
          leaveDays ? JSON.stringify(leaveDays) : null,
          consultationDuration || null,
          maxPatientsPerDay || null,
          emergencyAvailability ? !!emergencyAvailability : false,
        ]
      );
    } catch (insertErr) {
      // Handle duplicate license or other constraint errors
      console.error('Practitioner insert error:', insertErr);
      if (insertErr && insertErr.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'License number already exists or duplicate entry' });
      }
      throw insertErr;
    }

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
       JOIN users u ON p.practitioner_id = u.user_id
       WHERE p.practitioner_id = ?`,
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
      WHERE practitioner_id = ?
    `,
      [JSON.stringify(workingHours), req.user.userId]
    );

    const [updatedPractitioner] = await pool.execute(
      `SELECT * FROM practitioners WHERE practitioner_id = ?`,
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

router.get("/leave-days", authenticateToken, authorizeRoles("practitioner"), async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT leave_days FROM practitioners WHERE practitioner_id = ?`,
      [req.user.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Practitioner not found" });
    }
    res.json({ leaveDays: rows[0].leave_days || [] });
  } catch (error) {
    console.error("Get leave days error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
