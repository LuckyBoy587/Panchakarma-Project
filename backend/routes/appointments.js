const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const { sendEmail } = require("../mail-sender");

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
    JOIN users p ON pt.patient_id = p.user_id
  LEFT JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
  LEFT JOIN users pr ON pr.user_id = prac.practitioner_id
        LEFT JOIN therapists ther ON a.therapist_id = ther.therapist_id
        LEFT JOIN users tr ON ther.user_id = tr.user_id
    WHERE pt.patient_id = ?
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
      JOIN users p ON pt.patient_id = p.user_id
  JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
  JOIN users pr ON pr.user_id = prac.practitioner_id
    WHERE prac.practitioner_id = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
      params = [req.user.userId];
    } else if (req.user.role === "therapist") {
      // Get therapist's treatment sessions (acting as appointments)
      query = `
        SELECT
          ts.session_id as appointment_id,
          ts.session_date as appointment_date,
          ts.start_time,
          ts.end_time,
          ts.status,
          ts.session_number,
          ts.procedures_performed,
          ts.duration_minutes,
          tp.treatment_name as service_type,
          'treatment' as consultation_type,
          tp.patient_id,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          tr.first_name as therapist_first_name,
          tr.last_name as therapist_last_name,
          tp.treatment_plan_id,
          ts.created_at as booked_at
        FROM treatment_sessions ts
        JOIN treatment_plans tp ON ts.treatment_plan_id = tp.treatment_plan_id
        JOIN patients pt ON tp.patient_id = pt.patient_id
    JOIN users p ON pt.patient_id = p.user_id
        JOIN therapists ther ON ts.therapist_id = ther.therapist_id
        JOIN users tr ON ther.user_id = tr.user_id
        WHERE ther.user_id = ? AND ts.status IN ('scheduled', 'completed')
        ORDER BY ts.session_date DESC, ts.start_time DESC
      `;
      params = [req.user.userId];
    } else {
      // Admin gets all appointments and treatment sessions
      query = `
        SELECT
          a.appointment_id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.service_type,
          a.consultation_type,
          a.status,
          a.patient_id,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          COALESCE(pr.first_name, tr.first_name, ts_therapist.first_name) as provider_first_name,
          COALESCE(pr.last_name, tr.last_name, ts_therapist.last_name) as provider_last_name,
          CASE
            WHEN a.practitioner_id IS NOT NULL THEN 'practitioner'
            WHEN a.therapist_id IS NOT NULL THEN 'therapist'
            WHEN ts.session_id IS NOT NULL THEN 'therapist'
            ELSE 'unknown'
          END as provider_type,
          a.created_at as booked_at,
          'appointment' as record_type
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
    JOIN users p ON pt.patient_id = p.user_id
  LEFT JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
  LEFT JOIN users pr ON pr.user_id = prac.practitioner_id
        LEFT JOIN therapists ther ON a.therapist_id = ther.therapist_id
        LEFT JOIN users tr ON ther.user_id = tr.user_id

        UNION ALL

        SELECT
          ts.session_id as appointment_id,
          ts.session_date as appointment_date,
          ts.start_time,
          ts.end_time,
          tp.treatment_name as service_type,
          'treatment' as consultation_type,
          ts.status,
          tp.patient_id,
          p2.first_name as patient_first_name,
          p2.last_name as patient_last_name,
          ts_therapist.first_name as provider_first_name,
          ts_therapist.last_name as provider_last_name,
          'therapist' as provider_type,
          ts.created_at as booked_at,
          'treatment_session' as record_type
        FROM treatment_sessions ts
        JOIN treatment_plans tp ON ts.treatment_plan_id = tp.treatment_plan_id
        JOIN patients pt2 ON tp.patient_id = pt2.patient_id
    JOIN users p2 ON pt2.patient_id = p2.user_id
        JOIN therapists ther2 ON ts.therapist_id = ther2.therapist_id
        JOIN users ts_therapist ON ther2.user_id = ts_therapist.user_id
        WHERE ts.status IN ('scheduled', 'completed')

        ORDER BY appointment_date DESC, start_time DESC
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

    // Get patient ID (patient_id is same as users.user_id)
    const [patient] = await pool.execute(
      "SELECT patient_id FROM patients WHERE patient_id = ?",
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

    // Send email notification to patient
    try {
      // fetch patient email
      const [patientUserRows] = await pool.execute(
        `SELECT u.email, u.first_name, u.last_name FROM users u WHERE u.user_id = ?`,
        [patient[0].patient_id]
      );

      let patientEmail = patientUserRows.length > 0 ? patientUserRows[0].email : null;
      let patientName = patientUserRows.length > 0 ? `${patientUserRows[0].first_name} ${patientUserRows[0].last_name}` : '';

      // determine provider display name
      let providerName = 'Panchakarma Clinic';
      if (practitionerId) {
        const [prRows] = await pool.execute(
          `SELECT u.first_name, u.last_name FROM practitioners prac JOIN users u ON prac.practitioner_id = u.user_id WHERE prac.practitioner_id = ?`,
          [practitionerId]
        );
        if (prRows.length > 0) providerName = `${prRows[0].first_name} ${prRows[0].last_name}`;
      } else if (therapistId) {
        const [trRows] = await pool.execute(
          `SELECT u.first_name, u.last_name FROM therapists ther JOIN users u ON ther.user_id = u.user_id WHERE ther.therapist_id = ?`,
          [therapistId]
        );
        if (trRows.length > 0) providerName = `${trRows[0].first_name} ${trRows[0].last_name}`;
      }

      if (patientEmail) {
        const appt = newAppointment[0];
        const apptDate = appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : appt.appointment_date;
        const start = appt.start_time || '';
        const end = appt.end_time || '';

        const subject = `Appointment booked: ${apptDate} ${start}`;
        const text = `Hello ${patientName || 'Patient'},\n\nYour appointment has been booked successfully. Here are the details:\n\n- Date: ${apptDate}\n- Time: ${start} - ${end}\n- Service: ${appt.service_type || ''}\n- Provider: ${providerName}\n- Location/Type: ${appt.consultation_type || ''}\n- Confirmation code: ${appt.confirmation_code || ''}\n\nIf you need to change or cancel this appointment, please contact us or use the app.\n\nThank you,\nPanchakarma Clinic`;

        sendEmail(patientEmail, subject, text);
      }

      // send email to practitioner only (do not notify therapists)
      try {
        if (practitionerId) {
          const [prUserRows] = await pool.execute(
            `SELECT u.email, u.first_name, u.last_name FROM practitioners prac JOIN users u ON prac.practitioner_id = u.user_id WHERE prac.practitioner_id = ?`,
            [practitionerId]
          );
          if (prUserRows.length > 0) {
            const providerEmail = prUserRows[0].email;
            const providerDisplayName = `${prUserRows[0].first_name} ${prUserRows[0].last_name}`;

            const appt = newAppointment[0];
            const apptDate = appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : appt.appointment_date;
            const start = appt.start_time || '';
            const end = appt.end_time || '';

            const providerSubject = `New appointment: ${apptDate} ${start} - ${providerDisplayName}`;
            const providerText = `Hello ${providerDisplayName},\n\nA new appointment has been booked. Details:\n\n- Patient: ${patientName || appt.patient_id}\n- Date: ${apptDate}\n- Time: ${start} - ${end}\n- Service: ${appt.service_type || ''}\n- Consultation Type: ${appt.consultation_type || ''}\n- Confirmation code: ${appt.confirmation_code || ''}\n\nPlease review your schedule in the app.\n\nThank you,\nPanchakarma Clinic`;

            sendEmail(providerEmail, providerSubject, providerText);
          }
        }
      } catch (provErr) {
        console.error('Error sending provider email:', provErr);
      }
    } catch (emailErr) {
      console.error('Error sending appointment email:', emailErr);
    }

    console.log("New appointment created:", newAppointment[0]);

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
