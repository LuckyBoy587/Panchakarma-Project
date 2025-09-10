const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get appointments
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    let query;
    let params = [];

    if (req.user.role === "patient") {
      // Get patient's appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               COALESCE(pr.first_name, tr.first_name) as provider_first_name,
               COALESCE(pr.last_name, tr.last_name) as provider_last_name,
               CASE WHEN a.practitioner_id IS NOT NULL THEN 'practitioner' ELSE 'therapist' END as provider_type
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        LEFT JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
        LEFT JOIN users pr ON prac.user_id = pr.user_id
        LEFT JOIN therapists ther ON a.therapist_id = ther.therapist_id
        LEFT JOIN users tr ON ther.user_id = tr.user_id
        WHERE pt.user_id = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
      params = [req.user.userId];
    } else if (req.user.role === "practitioner") {
      // Get practitioner's appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
        JOIN users pr ON prac.user_id = pr.user_id
        WHERE prac.user_id = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
      params = [req.user.userId];
    } else if (req.user.role === "therapist") {
      // Get therapist's appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               tr.first_name as therapist_first_name, tr.last_name as therapist_last_name
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN therapists ther ON a.therapist_id = ther.therapist_id
        JOIN users tr ON ther.user_id = tr.user_id
        WHERE ther.user_id = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
      params = [req.user.userId];
    } else {
      // Admin gets all appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               COALESCE(pr.first_name, tr.first_name) as provider_first_name,
               COALESCE(pr.last_name, tr.last_name) as provider_last_name,
               CASE WHEN a.practitioner_id IS NOT NULL THEN 'practitioner' ELSE 'therapist' END as provider_type
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        LEFT JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
        LEFT JOIN users pr ON prac.user_id = pr.user_id
        LEFT JOIN therapists ther ON a.therapist_id = ther.therapist_id
        LEFT JOIN users tr ON ther.user_id = tr.user_id
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
    }

    const [appointments] = await pool.execute(query, params);
    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create appointment
router.post("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    const {
      practitionerId,
      therapistId,
      appointmentDate,
      startTime,
      endTime,
      serviceType,
      consultationType,
      specialInstructions,
      preparationNotes,
    } = req.body;

    // Get patient ID from user ID
    const [patient] = await pool.execute(
      "SELECT patient_id FROM patients WHERE user_id = ?",
      [req.user.userId]
    );
    if (patient.length === 0) {
      return res.status(400).json({ error: "Patient profile not found" });
    }

    const appointmentId = uuidv4();

    await pool.execute(
      `INSERT INTO appointments (
        appointment_id, patient_id, practitioner_id, therapist_id, appointment_date, start_time, end_time,
        service_type, consultation_type, special_instructions, preparation_notes,
        booking_channel, confirmation_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        patient[0].patient_id,
        practitionerId || null,
        therapistId || null,
        appointmentDate,
        startTime,
        endTime,
        serviceType,
        consultationType,
        specialInstructions,
        preparationNotes,
        'app',
        Math.random().toString(36).substring(2, 10).toUpperCase(),
      ]
    );

    const [newAppointment] = await pool.execute(
      `SELECT * FROM appointments WHERE appointment_id = ?`,
      [appointmentId]
    );

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment[0],
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
