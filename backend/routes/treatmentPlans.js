const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get treatment plans
router.get("/", authenticateToken, async (req, res) => {
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
        JOIN users pr ON prac.user_id = pr.user_id
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
        JOIN users pr ON prac.user_id = pr.user_id
        WHERE prac.user_id = ?
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
        JOIN users pr ON prac.user_id = pr.user_id
        ORDER BY tp.created_at DESC
      `;
    }

    const [treatmentPlans] = await pool.execute(query, params);
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
      therapyId,
      treatmentName,
      startDate,
      endDate,
      totalSessions,
      totalCost,
    } = req.body;

    const treatmentPlanId = uuidv4();
    await pool.execute(
      `INSERT INTO treatment_plans (
        treatment_plan_id, patient_id, practitioner_id, therapy_id, treatment_name,
        start_date, end_date, total_sessions, total_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        treatmentPlanId,
        patientId,
        req.user.userId,
        therapyId,
        treatmentName,
        startDate,
        endDate,
        totalSessions,
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

module.exports = router;
