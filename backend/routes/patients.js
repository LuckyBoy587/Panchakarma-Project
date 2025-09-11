const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get patients
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    if (req.user.role === 'patient') {
      // Patients can only see their own profile
      const [patients] = await pool.execute(`
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone
        FROM patients p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.user_id = ?
      `, [req.user.userId]);
      res.json(patients);
    } else {
      // Admin and practitioners can see all patients
      const [patients] = await pool.execute(`
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone
        FROM patients p
        JOIN users u ON p.user_id = u.user_id
        ORDER BY p.created_at DESC
      `);
      res.json(patients);
    }
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create patient profile
router.post("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    const {
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      occupation,
      maritalStatus,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      medicalConditions,
      allergies,
      currentMedications,
      pastSurgeries,
      familyMedicalHistory,
      lifestyleHabits,
      dietaryPreferences,
      exerciseRoutine,
      prakritiAssessment,
      vikritiAssessment,
      doshaDominance,
    } = req.body;

    // Helper function to convert undefined to null
    const toNull = (value) => value === undefined ? null : value;

    const patientId = uuidv4();
    await pool.execute(
      `INSERT INTO patients (
        patient_id, user_id, date_of_birth, gender, blood_group, height_cm, weight_kg,
        occupation, marital_status, emergency_contact_name, emergency_contact_phone,
        emergency_contact_relationship, medical_conditions, allergies, current_medications,
        past_surgeries, family_medical_history, lifestyle_habits, dietary_preferences,
        exercise_routine, prakriti_assessment, vikriti_assessment, dosha_dominance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        req.user.userId,
        toNull(dateOfBirth),
        toNull(gender),
        toNull(bloodGroup),
        toNull(height),
        toNull(weight),
        toNull(occupation),
        toNull(maritalStatus),
        toNull(emergencyContactName),
        toNull(emergencyContactPhone),
        toNull(emergencyContactRelationship),
        toNull(medicalConditions),
        toNull(allergies),
        toNull(currentMedications),
        toNull(pastSurgeries),
        toNull(familyMedicalHistory),
        toNull(lifestyleHabits),
        toNull(dietaryPreferences),
        toNull(exerciseRoutine),
        prakritiAssessment ? JSON.stringify(prakritiAssessment) : null,
        vikritiAssessment ? JSON.stringify(vikritiAssessment) : null,
        toNull(doshaDominance),
      ]
    );

    const [newPatient] = await pool.execute(
      `SELECT * FROM patients WHERE patient_id = ?`,
      [patientId]
    );

    res.status(201).json({
      message: "Patient profile created successfully",
      patient: newPatient[0],
    });
  } catch (error) {
    console.error("Create patient error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update patient profile
router.put("/:patientId", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { patientId } = req.params;

    // Verify the patient belongs to the authenticated user or user is admin
    const [existingPatient] = await pool.execute(
      "SELECT * FROM patients WHERE patient_id = ?",
      [patientId]
    );

    if (existingPatient.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    if (req.user.role !== 'admin' && existingPatient[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const {
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      occupation,
      maritalStatus,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      medicalConditions,
      allergies,
      currentMedications,
      pastSurgeries,
      familyMedicalHistory,
      lifestyleHabits,
      dietaryPreferences,
      exerciseRoutine,
      prakritiAssessment,
      vikritiAssessment,
      doshaDominance,
    } = req.body;

    // Helper function to convert undefined to null
    const toNull = (value) => value === undefined ? null : value;

    await pool.execute(
      `UPDATE patients SET
        date_of_birth = ?, gender = ?, blood_group = ?, height_cm = ?, weight_kg = ?,
        occupation = ?, marital_status = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
        emergency_contact_relationship = ?, medical_conditions = ?, allergies = ?, current_medications = ?,
        past_surgeries = ?, family_medical_history = ?, lifestyle_habits = ?, dietary_preferences = ?,
        exercise_routine = ?, prakriti_assessment = ?, vikriti_assessment = ?, dosha_dominance = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ?`,
      [
        toNull(dateOfBirth),
        toNull(gender),
        toNull(bloodGroup),
        toNull(height),
        toNull(weight),
        toNull(occupation),
        toNull(maritalStatus),
        toNull(emergencyContactName),
        toNull(emergencyContactPhone),
        toNull(emergencyContactRelationship),
        toNull(medicalConditions),
        toNull(allergies),
        toNull(currentMedications),
        toNull(pastSurgeries),
        toNull(familyMedicalHistory),
        toNull(lifestyleHabits),
        toNull(dietaryPreferences),
        toNull(exerciseRoutine),
        prakritiAssessment ? JSON.stringify(prakritiAssessment) : null,
        vikritiAssessment ? JSON.stringify(vikritiAssessment) : null,
        toNull(doshaDominance),
        patientId,
      ]
    );

    const [updatedPatient] = await pool.execute(
      `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.patient_id = ?`,
      [patientId]
    );

    res.json({
      message: "Patient profile updated successfully",
      patient: updatedPatient[0],
    });
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
