const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get treatment plans
router.get("/", authenticateToken, authorizeRoles("patient", "practitioner", "admin", "staff"), async (req, res) => {
  try {
    const pool = getPool();

    let query;
    let params = [];

    if (req.user.role === "patient") {
      query = `
        SELECT tp.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
  FROM treatment_plans tp
  JOIN patients pt ON tp.patient_id = pt.patient_id
  JOIN users p ON pt.user_id = p.user_id
  JOIN practitioners prac ON tp.practitioner_id = prac.practitioner_id
  JOIN users pr ON pr.user_id = prac.practitioner_id
  WHERE pt.user_id = ?
        ORDER BY tp.created_at DESC
      `;
      params = [req.user.userId];
    } else if (req.user.role === "practitioner") {
      query = `
        SELECT tp.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
  FROM treatment_plans tp
  JOIN patients pt ON tp.patient_id = pt.patient_id
  JOIN users p ON pt.user_id = p.user_id
  JOIN practitioners prac ON tp.practitioner_id = prac.practitioner_id
  JOIN users pr ON pr.user_id = prac.practitioner_id
  WHERE prac.practitioner_id = ?
        ORDER BY tp.created_at DESC
      `;
      params = [req.user.userId];
    } else {
      query = `
        SELECT tp.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
        FROM treatment_plans tp
        JOIN patients pt ON tp.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN practitioners prac ON tp.practitioner_id = prac.practitioner_id
        JOIN users pr ON pr.user_id = prac.practitioner_id
        ORDER BY tp.created_at DESC
      `;
    }

    const [treatmentPlans] = await pool.execute(query, params);
    console.log("Treatment Plans:", treatmentPlans);
    res.json(treatmentPlans);
  } catch (error) {
    console.error("Get treatment plans error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create treatment plan
router.post("/", authenticateToken, authorizeRoles("practitioner", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const {
      patientId,
      treatmentName,
      treatmentType,
      startDate,
      endDate,
      totalSessions,
      purvakarmaProtocols,
      pradhanakarmaProtocols,
      paschatkarmaProtocols,
      contraindications,
      expectedOutcomes,
      specialInstructions,
      totalCost,
    } = req.body;

    const treatmentPlanId = uuidv4();
    await pool.execute(
      `INSERT INTO treatment_plans (
        treatment_plan_id, patient_id, practitioner_id, treatment_name, treatment_type,
        start_date, end_date, total_sessions, purvakarma_protocols, pradhanakarma_protocols,
        paschatkarma_protocols, contraindications, expected_outcomes, special_instructions,
        total_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        treatmentPlanId,
        patientId,
        req.user.userId,
        treatmentName,
        treatmentType,
        startDate,
        endDate,
        totalSessions,
        JSON.stringify(purvakarmaProtocols),
        JSON.stringify(pradhanakarmaProtocols),
        JSON.stringify(paschatkarmaProtocols),
        contraindications,
        JSON.stringify(expectedOutcomes),
        specialInstructions,
        totalCost,
      ]
    );

    const [newTreatmentPlan] = await pool.execute(
      `SELECT * FROM treatment_plans WHERE treatment_plan_id = ?`,
      [treatmentPlanId]
    );

    res.status(201).json({
      message: "Treatment plan created successfully",
      treatmentPlan: newTreatmentPlan[0],
    });
  } catch (error) {
    console.error("Create treatment plan error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get treatment sessions for a therapist
router.get("/sessions/therapist/:therapistId", authenticateToken, authorizeRoles("therapist", "practitioner", "admin"), async (req, res) => {
  try {
    const pool = getPool();
    const { therapistId } = req.params;

    // Verify the therapist is accessing their own sessions or practitioner/admin is accessing
    if (req.user.role === "therapist") {
      // Get therapist profile for this user
      const [therapists] = await pool.execute(
        "SELECT therapist_id FROM therapists WHERE user_id = ?",
        [req.user.userId]
      );
      
      if (therapists.length === 0 || therapists[0].therapist_id !== therapistId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const query = `
      SELECT 
        ts.*,
        tp.treatment_name,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        u.first_name as therapist_first_name,
        u.last_name as therapist_last_name
      FROM treatment_sessions ts
      JOIN treatment_plans tp ON ts.treatment_plan_id = tp.treatment_plan_id
      JOIN patients pt ON tp.patient_id = pt.patient_id
      JOIN users p ON pt.user_id = p.user_id
      JOIN therapists t ON ts.therapist_id = t.therapist_id
      JOIN users u ON t.user_id = u.user_id
      WHERE ts.therapist_id = ? AND ts.status IN ('scheduled', 'completed')
      ORDER BY ts.session_date, ts.start_time
    `;

    const [sessions] = await pool.execute(query, [therapistId]);
    res.json(sessions);
  } catch (error) {
    console.error("Get therapist sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get treatment sessions for a patient
router.get("/sessions/patient", authenticateToken, authorizeRoles("patient"), async (req, res) => {
  try {
    const pool = getPool();

    const query = `
      SELECT 
        ts.*,
        tp.treatment_name,
        tp.treatment_type,
        t.first_name as therapist_first_name,
        t.last_name as therapist_last_name,
        p.first_name as practitioner_first_name,
        p.last_name as practitioner_last_name
      FROM treatment_sessions ts
      JOIN treatment_plans tp ON ts.treatment_plan_id = tp.treatment_plan_id
      JOIN patients pt ON tp.patient_id = pt.patient_id
      JOIN therapists th ON ts.therapist_id = th.therapist_id
      JOIN users t ON th.user_id = t.user_id
  LEFT JOIN practitioners prac ON tp.practitioner_id = prac.practitioner_id
  LEFT JOIN users p ON p.user_id = prac.practitioner_id
      WHERE pt.user_id = ?
      ORDER BY ts.session_date, ts.start_time
    `;

    const [sessions] = await pool.execute(query, [req.user.userId]);
    res.json(sessions);
  } catch (error) {
    console.error("Get patient sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get treatment sessions for a staff member
router.get("/sessions/staff", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const query = `
      SELECT 
        ts.*,
        tp.treatment_name,
        tp.treatment_type,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        t.first_name as therapist_first_name,
        t.last_name as therapist_last_name,
        pr.first_name as practitioner_first_name,
        pr.last_name as practitioner_last_name
      FROM treatment_sessions ts
      JOIN treatment_plans tp ON ts.treatment_plan_id = tp.treatment_plan_id
      JOIN patients pt ON tp.patient_id = pt.patient_id
      JOIN users p ON pt.user_id = p.user_id
      JOIN therapists th ON ts.therapist_id = th.therapist_id
      JOIN users t ON th.user_id = t.user_id
  LEFT JOIN practitioners prac ON tp.practitioner_id = prac.practitioner_id
  LEFT JOIN users pr ON pr.user_id = prac.practitioner_id
      WHERE ts.staff_id = ? AND ts.status IN ('scheduled', 'completed')
      ORDER BY ts.session_date, ts.start_time
    `;

    const [sessions] = await pool.execute(query, [req.user.userId]);
    res.json(sessions);
  } catch (error) {
    console.error("Get staff sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
