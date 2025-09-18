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
        JOIN users u ON p.patient_id = u.user_id
        WHERE p.patient_id = ?
      `, [req.user.userId]);
      res.json(patients);
    } else {
      // Admin and practitioners can see all patients
      const [patients] = await pool.execute(`
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone
        FROM patients p
        JOIN users u ON p.patient_id = u.user_id
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
      // New fields
      fullName,
      age,
      contactNumber,
      emailAddress,
      address,
      existingHealthConditions,
      pastSurgeriesMajorIllnesses,
      allergiesDetailed,
      currentMedicationsDetailed,
      familyMedicalHistoryDetailed,
      dietPattern,
      sleepPattern,
      dailyRoutine,
      stressLevel,
      addictionHistory,
      prakritiAssessment,
      vikritiAssessment,
      doshaDominance,
    } = req.body;

    // Helper function to convert undefined to null
    const toNull = (value) => value === undefined ? null : value;

    // Use the authenticated user's id as the patient_id (1:1 relation with users)
    const patientId = req.user.userId;
    await pool.execute(
      `INSERT INTO patients (
        patient_id, date_of_birth, gender, blood_group, height_cm, weight_kg,
        occupation, marital_status, emergency_contact_name, emergency_contact_phone,
        emergency_contact_relationship, medical_conditions, allergies, current_medications,
        past_surgeries, family_medical_history, lifestyle_habits, dietary_preferences,
        exercise_routine, prakriti_assessment, vikriti_assessment, dosha_dominance,
        full_name, age, contact_number, email_address, address,
        existing_health_conditions, past_surgeries_major_illnesses, allergies_detailed,
        current_medications_detailed, family_medical_history_detailed,
        diet_pattern, sleep_pattern, daily_routine, stress_level, addiction_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
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
        toNull(fullName),
        toNull(age),
        toNull(contactNumber),
        toNull(emailAddress),
        toNull(address),
        toNull(existingHealthConditions),
        toNull(pastSurgeriesMajorIllnesses),
        toNull(allergiesDetailed),
        toNull(currentMedicationsDetailed),
        toNull(familyMedicalHistoryDetailed),
        toNull(dietPattern),
        toNull(sleepPattern),
        toNull(dailyRoutine),
        toNull(stressLevel),
        toNull(addictionHistory),
      ]
    );

    // If personal fields provided, update users table to keep in sync
    try {
      const [userRows] = await pool.execute(
        `SELECT first_name, last_name, email, phone FROM users WHERE user_id = ?`,
        [patientId]
      );
      if (userRows && userRows.length > 0) {
        const existingUser = userRows[0];
        let firstName = existingUser.first_name || null;
        let lastName = existingUser.last_name || null;
        if (fullName) {
          const parts = fullName.trim().split(/\s+/);
          firstName = parts.shift() || null;
          lastName = parts.length ? parts.join(' ') : null;
        }
        const emailToSet = emailAddress === undefined ? existingUser.email : emailAddress;
        const phoneToSet = contactNumber === undefined ? existingUser.phone : contactNumber;

        await pool.execute(
          `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?`,
          [firstName, lastName, emailToSet, phoneToSet, patientId]
        );
      }
    } catch (err) {
      console.error('Failed to sync user personal info:', err);
      // don't fail the whole request if user sync fails
    }

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

    if (req.user.role !== 'admin' && existingPatient[0].patient_id !== req.user.userId) {
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
      // New fields
      fullName,
      age,
      contactNumber,
      emailAddress,
      address,
      existingHealthConditions,
      pastSurgeriesMajorIllnesses,
      allergiesDetailed,
      currentMedicationsDetailed,
      familyMedicalHistoryDetailed,
      dietPattern,
      sleepPattern,
      dailyRoutine,
      stressLevel,
      addictionHistory,
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
        full_name = ?, age = ?, contact_number = ?, email_address = ?, address = ?,
        existing_health_conditions = ?, past_surgeries_major_illnesses = ?, allergies_detailed = ?,
        current_medications_detailed = ?, family_medical_history_detailed = ?,
        diet_pattern = ?, sleep_pattern = ?, daily_routine = ?, stress_level = ?, addiction_history = ?,
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
        toNull(fullName),
        toNull(age),
        toNull(contactNumber),
        toNull(emailAddress),
        toNull(address),
        toNull(existingHealthConditions),
        toNull(pastSurgeriesMajorIllnesses),
        toNull(allergiesDetailed),
        toNull(currentMedicationsDetailed),
        toNull(familyMedicalHistoryDetailed),
        toNull(dietPattern),
        toNull(sleepPattern),
        toNull(dailyRoutine),
        toNull(stressLevel),
        toNull(addictionHistory),
        patientId,
      ]
    );

    // Sync personal fields to users table as well
    try {
      const [userRows] = await pool.execute(
        `SELECT first_name, last_name, email, phone FROM users WHERE user_id = ?`,
        [patientId]
      );
      if (userRows && userRows.length > 0) {
        const existingUser = userRows[0];
        let firstName = existingUser.first_name || null;
        let lastName = existingUser.last_name || null;
        if (fullName) {
          const parts = fullName.trim().split(/\s+/);
          firstName = parts.shift() || null;
          lastName = parts.length ? parts.join(' ') : null;
        }
        const emailToSet = emailAddress === undefined ? existingUser.email : emailAddress;
        const phoneToSet = contactNumber === undefined ? existingUser.phone : contactNumber;

        await pool.execute(
          `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?`,
          [firstName, lastName, emailToSet, phoneToSet, patientId]
        );
      }
    } catch (err) {
      console.error('Failed to sync user personal info on update:', err);
    }

    const [updatedPatient] = await pool.execute(
      `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
       FROM patients p
       JOIN users u ON p.patient_id = u.user_id
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



// Get single patient by id
router.get('/:patientId', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { patientId } = req.params;

    const [rows] = await pool.execute(
      `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
       FROM patients p
       JOIN users u ON p.patient_id = u.user_id
       WHERE p.patient_id = ?`,
      [patientId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get patient by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
