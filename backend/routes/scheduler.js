const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const slots = [];
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  while (start < end) {
    const slotEnd = new Date(start.getTime() + intervalMinutes * 60000);
    if (slotEnd <= end) {
      slots.push({
        start: start.toTimeString().slice(0, 8), // HH:MM:SS format
        end: slotEnd.toTimeString().slice(0, 8)
      });
    }
    start.setTime(slotEnd.getTime());
  }

  return slots;
}

// POST /api/scheduler - Create treatment plan and schedule sessions
router.post(
  "/",
  authenticateToken,
  authorizeRoles("practitioner", "admin"),
  async (req, res) => {
    try {
      const pool = getPool();

      const { patientId, therapyId, startDate, numSessions, frequency } =
        req.body;

      // Get practitioner_id from user_id
      const [practitioners] = await pool.execute(
        "SELECT practitioner_id FROM practitioners WHERE user_id = ?",
        [req.user.userId]
      );

      if (practitioners.length === 0) {
        return res
          .status(403)
          .json({ error: "User is not a registered practitioner" });
      }

      const practitionerId = practitioners[0].practitioner_id;

      // Get therapy details
      const [therapies] = await pool.execute(
        "SELECT * FROM therapies WHERE id = ?",
        [therapyId]
      );

      if (therapies.length === 0) {
        return res.status(404).json({ error: "Therapy not found" });
      }

      const therapy = therapies[0];

      // Get required items for the therapy
      const [requiredItems] = await pool.execute(
        `
      SELECT tri.quantity as required_qty, si.name, si.category, s.quantity as available_qty, s.updated_by
      FROM therapy_required_items tri
      JOIN stock_items si ON tri.stock_id = si.id
      LEFT JOIN stock s ON si.name = s.item_name
      WHERE tri.therapy_id = ?
    `,
        [therapyId]
      );

      // Check if sufficient stock is available
      const insufficientItems = requiredItems.filter(
        (item) => !item.available_qty || item.available_qty < item.required_qty
      );

      if (insufficientItems.length > 0) {
        return res.status(400).json({
          error: "Insufficient stock for required items",
          insufficientItems: insufficientItems.map((item) => ({
            name: item.name,
            required: item.required_qty,
            available: item.available_qty || 0,
          })),
        });
      }

      // Get staff who have updated stock (assuming they are responsible for stock management)
      const staffMembers = [
        ...new Set(
          requiredItems.map((item) => item.updated_by).filter(Boolean)
        ),
      ];

      if (staffMembers.length === 0) {
        return res
          .status(400)
          .json({ error: "No staff found who have updated stock" });
      }

      // Calculate session dates based on frequency
      const sessionDates = [];
      let currentDate = new Date(startDate);
      const sessions = parseInt(numSessions, 10);
    if (isNaN(sessions) || sessions < 1 || sessions > 50) {
      return res.status(400).json({ error: "Number of sessions must be a positive integer between 1 and 50" });
    }

      for (let i = 0; i < sessions; i++) {
        sessionDates.push(new Date(currentDate));
        if (frequency === "daily") {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (frequency === "weekly") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (frequency === "biweekly") {
          currentDate.setDate(currentDate.getDate() + 14);
        } else if (frequency === "monthly") {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          return res.status(400).json({ error: "Invalid frequency. Supported: daily, weekly, biweekly, monthly" });
        }
      }

      // Get all therapists
      const [allTherapists] = await pool.execute(
        `SELECT t.therapist_id, u.first_name, u.last_name, t.start_time, t.end_time
         FROM therapists t
         JOIN users u ON t.user_id = u.user_id`
      );

      if (allTherapists.length === 0) {
        return res.status(400).json({ error: "No therapists found" });
      }

      // Create treatment plan first to get the treatmentPlanId
      const treatmentPlanId = uuidv4();
      const endDate = sessionDates[sessionDates.length - 1]
        .toISOString()
        .split("T")[0];

      await pool.execute(
        `INSERT INTO treatment_plans (
        treatment_plan_id, patient_id, practitioner_id, treatment_name, treatment_type,
        start_date, end_date, total_sessions, total_cost, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          treatmentPlanId,
          patientId,
          practitionerId,
          therapy.name,
          "therapy",
          startDate,
          endDate,
          sessions,
          0.0, // total_cost - can be updated later with proper pricing
          "planned",
        ]
      );

      // Create treatment sessions by finding available 30-minute slots
      const treatmentSessions = [];

      for (let sessionIndex = 0; sessionIndex < sessionDates.length; sessionIndex++) {
        const sessionDate = sessionDates[sessionIndex];
        const dateStr = sessionDate.toISOString().split('T')[0];
        const dayName = sessionDate.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`Scheduling session ${sessionIndex + 1} on ${dateStr} (${dayName})`);

        // Find an available 30-minute slot for this session
        let assignedSlot = null;
        let assignedTherapist = null;

        // Try each therapist until we find an available slot
        for (const therapist of allTherapists) {
          const [isLeaveDay] = await pool.execute(`
            SELECT JSON_CONTAINS(leave_days, JSON_QUOTE(?)) AS is_leave_day
            FROM therapists
            WHERE therapist_id = ?;
            `, [dayName.toLowerCase(), therapist.therapist_id])
          if (isLeaveDay[0].is_leave_day) {
            continue; // Skip this therapist as they are on leave this day
          }
          // Get therapist's working hours
          const therapistStart = therapist.start_time || '09:00:00';
          const therapistEnd = therapist.end_time || '17:00:00';

          // Generate 30-minute slots for this therapist's working hours
          const slots = generateTimeSlots(therapistStart, therapistEnd, 30); // 30-minute slots

          // Check each slot for availability
          for (const slot of slots) {
            // Check if this slot is already booked
            const [bookedSlots] = await pool.execute(
              `SELECT COUNT(*) as count FROM treatment_sessions
               WHERE therapist_id = ? AND session_date = ? AND start_time = ?`,
              [therapist.therapist_id, dateStr, slot.start]
            );

            if (bookedSlots[0].count === 0) {
              // Slot is available
              assignedSlot = {
                start_time: slot.start,
                end_time: slot.end
              };
              assignedTherapist = therapist;
              break;
            }
          }

          if (assignedSlot) break; // Found an available slot
        }

        if (!assignedSlot || !assignedTherapist) {
          return res.status(400).json({
            error: `No available 30-minute slots found for session ${sessionIndex + 1} on ${dateStr}`
          });
        }

        // Assign a staff member (rotate through available staff)
        const assignedStaff = staffMembers[sessionIndex % staffMembers.length];

        const sessionId = uuidv4();
        await pool.execute(
          `INSERT INTO treatment_sessions (
            session_id, treatment_plan_id, session_number, session_date, start_time, end_time,
            therapist_id, staff_id, procedures_performed, duration_minutes, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            treatmentPlanId,
            sessionIndex + 1,
            dateStr,
            assignedSlot.start_time,
            assignedSlot.end_time,
            assignedTherapist.therapist_id,
            assignedStaff,
            JSON.stringify([therapy.name]),
            30, // 30-minute sessions
            "scheduled"
          ]
        );

        treatmentSessions.push({
          sessionId,
          sessionNumber: sessionIndex + 1,
          sessionDate: dateStr,
          startTime: assignedSlot.start_time,
          endTime: assignedSlot.end_time,
          therapist: `${assignedTherapist.first_name} ${assignedTherapist.last_name}`,
          staff: assignedStaff
        });
      }

      res.status(201).json({
        message: "Treatment plan and sessions created successfully",
        treatmentPlanId,
        treatmentSessions,
        requiredItems: requiredItems.map((item) => ({
          name: item.name,
          required: item.required_qty,
          available: item.available_qty,
        })),
      });
    } catch (error) {
      console.error("Scheduler error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
