const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "panchakarma_db",
  port: process.env.DB_PORT || 3306,
};

let pool;

/**
 * Initialize database connection
 */
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log("Database connected successfully");
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

/**
 * Generate 30-minute time slots between start and end time
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {Array} Array of slot objects with start_time and end_time
 */
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Add 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }

    const slotEnd = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Only add if end time doesn't exceed the working hours end time
    if (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
      slots.push({
        start_time: slotStart,
        end_time: slotEnd
      });
    }
  }

  return slots;
}

/**
 * Generate slots for a practitioner
 * @param {string} practitionerId - Practitioner ID
 * @param {boolean} regenerate - Whether to regenerate existing slots
 * @param {Object} dbPool - Database pool to use
 */
async function generatePractitionerSlots(practitionerId, regenerate = false, dbPool = null) {
  try {
    // Use provided pool or create new one
    const pool = dbPool || (await initializeDatabase());

    // Get practitioner's working hours
    const [practitioners] = await pool.execute(
      'SELECT working_hours FROM practitioners WHERE practitioner_id = ?',
      [practitionerId]
    );

    if (practitioners.length === 0) {
      throw new Error('Practitioner not found');
    }

    let workingHours = [];
    try {
      console.log('Raw working_hours from DB:', practitioners[0].working_hours);
      workingHours = JSON.parse(practitioners[0].working_hours || '[]');
      console.log('Parsed working hours:', workingHours);
    } catch (parseError) {
      console.error('Error parsing working hours:', parseError);
    }

    // Always use default working hours for now
    workingHours = [
      { day: 'monday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'friday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '17:00' },
      { day: 'sunday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    ];

    // If no working hours are set, use defaults
    if (!workingHours || workingHours.length === 0) {
      workingHours = [
        { day: 'monday', isWorking: true, startTime: '09:00', endTime: '17:00' },
        { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
        { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
        { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '17:00' },
        { day: 'friday', isWorking: true, startTime: '09:00', endTime: '17:00' },
        { day: 'saturday', isWorking: false, startTime: '09:00', endTime: '17:00' },
        { day: 'sunday', isWorking: false, startTime: '09:00', endTime: '17:00' },
      ];
    }

    // Delete existing slots if regenerating
    if (regenerate) {
      await pool.execute('DELETE FROM slots WHERE practitioner_id = ?', [practitionerId]);
    }

    // Generate slots for each working day
    for (const daySchedule of workingHours) {
      if (!daySchedule.isWorking) {
        // Create leave slots for non-working days
        const leaveSlots = generateTimeSlots('09:00', '17:00'); // Default 9-5 for leave slots
        for (const slot of leaveSlots) {
          await pool.execute(
            'INSERT INTO slots (slot_id, practitioner_id, day, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), practitionerId, daySchedule.day.toLowerCase(), slot.start_time, slot.end_time, 'leave']
          );
        }
      } else {
        // Generate working slots
        const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
        for (const slot of slots) {
          await pool.execute(
            'INSERT INTO slots (slot_id, practitioner_id, day, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), practitionerId, daySchedule.day.toLowerCase(), slot.start_time, slot.end_time, 'free']
          );
        }
      }
    }

    console.log(`Slots generated successfully for practitioner ${practitionerId}`);
  } catch (error) {
    console.error('Error generating slots:', error);
    throw error;
  }
}

/**
 * Generate slots for all practitioners
 * @param {boolean} regenerate - Whether to regenerate existing slots
 * @param {Object} dbPool - Database pool to use
 */
async function generateAllPractitionersSlots(regenerate = false, dbPool = null) {
  try {
    // Use provided pool or create new one
    const pool = dbPool || (await initializeDatabase());

    // Get all practitioners
    const [practitioners] = await pool.execute('SELECT practitioner_id FROM practitioners');

    for (const practitioner of practitioners) {
      await generatePractitionerSlots(practitioner.practitioner_id, regenerate, pool);
    }

    console.log('Slots generated for all practitioners');
  } catch (error) {
    console.error('Error generating slots for all practitioners:', error);
    throw error;
  }
}

/**
 * Update slots when practitioner's working hours are updated
 * @param {string} practitionerId - Practitioner ID
 * @param {Object} dbPool - Database pool to use
 */
async function updatePractitionerSlots(practitionerId, dbPool = null) {
  await generatePractitionerSlots(practitionerId, true, dbPool);
}

// Export functions for use in other modules
module.exports = {
  initializeDatabase,
  generatePractitionerSlots,
  generateAllPractitionersSlots,
  updatePractitionerSlots,
  generateTimeSlots
};

// If run directly, generate slots for all practitioners
if (require.main === module) {
  (async () => {
    try {
      await initializeDatabase();
      const regenerate = process.argv[2] === '--regenerate';
      await generateAllPractitionersSlots(regenerate);
      process.exit(0);
    } catch (error) {
      console.error('Script execution failed:', error);
      process.exit(1);
    }
  })();
}
