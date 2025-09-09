const express = require("express");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Generate slots for a practitioner
router.post("/generate/:practitionerId", authenticateToken, authorizeRoles("admin", "practitioner"), async (req, res) => {
  try {
    const pool = getPool();

    const { practitionerId } = req.params;
    const { regenerate } = req.body;

    // Import the slot generator
    const { generatePractitionerSlots } = require('../slotGenerator');

    await generatePractitionerSlots(practitionerId, regenerate || false, pool);

    res.json({ message: "Slots generated successfully" });
  } catch (error) {
    console.error("Generate slots error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get slots for a practitioner by day and status
router.get("/:practitionerId", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    const { practitionerId } = req.params;
    const { day, status } = req.query;

    let query = "SELECT * FROM slots WHERE practitioner_id = ?";
    let params = [practitionerId];

    if (day) {
      query += " AND day = ?";
      params.push(day.toLowerCase());
    }

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY day, start_time";

    let [slots] = await pool.execute(query, params);

    // If no slots found for the specific day, try to auto-generate them
    if (slots.length === 0 && day) {
      try {
        const { generatePractitionerSlots } = require('../slotGenerator');
        await generatePractitionerSlots(practitionerId, false, pool);

        // Re-query after generation
        [slots] = await pool.execute(query, params);
      } catch (genError) {
        console.error('Error auto-generating slots:', genError);
        // Continue with empty slots if generation fails
      }
    }

    res.json(slots);
  } catch (error) {
    console.error("Get slots error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update slot status
router.put("/:slotId", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    const { slotId } = req.params;
    const { status } = req.body;

    const validStatuses = ["booked", "free", "leave"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [result] = await pool.execute(
      "UPDATE slots SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE slot_id = ?",
      [status, slotId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    const [updatedSlot] = await pool.execute("SELECT * FROM slots WHERE slot_id = ?", [slotId]);

    res.json({
      message: "Slot updated successfully",
      slot: updatedSlot[0]
    });
  } catch (error) {
    console.error("Update slot error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get available slots across all practitioners for a specific date and time
router.post("/available", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();

    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ error: "Date and time are required" });
    }

    // Get day of week from date
    const dateObj = new Date(date);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    console.log('Searching for available doctors:', { date, time, dayOfWeek });

    // Get all practitioners
    const [practitioners] = await pool.execute(`
      SELECT
        p.practitioner_id,
        first_name,
        last_name,
        p.specializations
      FROM practitioners p
      natural join users
    `);

    console.log('Total practitioners:', practitioners.length);

    // For each practitioner, check if they have a booked slot at the specified time
    const availablePractitioners = [];

    for (const practitioner of practitioners) {
      // Check if this practitioner has a booked appointment at the specified date and time
      const [bookedAppointments] = await pool.execute(`
        SELECT COUNT(*) as booked_count
        FROM appointments
        WHERE practitioner_id = ?
          AND appointment_date = ?
          AND start_time LIKE ?
          AND status IN ('scheduled', 'confirmed')
      `, [practitioner.practitioner_id, date, `${time}%`]);
      console.log(bookedAppointments);
      if (bookedAppointments[0].booked_count === 0) {
        availablePractitioners.push(practitioner);
      }
    }

    console.log('Available practitioners:', availablePractitioners.length);
    res.json(availablePractitioners);
  } catch (error) {
    console.error("Get available doctors error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
