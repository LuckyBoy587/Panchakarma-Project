const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'panchakarma_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Initialize database connection
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Routes

// User Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, userType } = req.body;

    // Check if user already exists
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const [newUser] = await pool.execute(
      'INSERT INTO users (user_id, email, phone, password_hash, user_type, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, phone, hashedPassword, userType, firstName, lastName]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: userId,
        email: email,
        userType: userType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [user] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user[0].user_id,
        email: user[0].email,
        role: user[0].user_type
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user[0].user_id,
        email: user[0].email,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
        userType: user[0].user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patient Management Routes
app.get('/api/patients', authenticateToken, authorizeRoles('admin', 'practitioner'), async (req, res) => {
  try {
    const patients = await pool.query(`
      SELECT p.*, u.first_name, u.last_name, u.email, u.phone
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC
    `);
    res.json(patients.rows);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
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
      doshaDominance
    } = req.body;

    const patientId = uuidv4();
    const newPatient = await pool.query(
      `INSERT INTO patients (
        patient_id, user_id, date_of_birth, gender, blood_group, height_cm, weight_kg,
        occupation, marital_status, emergency_contact_name, emergency_contact_phone,
        emergency_contact_relationship, medical_conditions, allergies, current_medications,
        past_surgeries, family_medical_history, lifestyle_habits, dietary_preferences,
        exercise_routine, prakriti_assessment, vikriti_assessment, dosha_dominance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *`,
      [
        patientId, req.user.userId, dateOfBirth, gender, bloodGroup, height, weight,
        occupation, maritalStatus, emergencyContactName, emergencyContactPhone,
        emergencyContactRelationship, medicalConditions, allergies, currentMedications,
        pastSurgeries, familyMedicalHistory, lifestyleHabits, dietaryPreferences,
        exerciseRoutine, JSON.stringify(prakritiAssessment), JSON.stringify(vikritiAssessment), doshaDominance
      ]
    );

    res.status(201).json({
      message: 'Patient profile created successfully',
      patient: newPatient.rows[0]
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Practitioner Management Routes
app.get('/api/practitioners', authenticateToken, async (req, res) => {
  try {
    const practitioners = await pool.query(`
      SELECT p.*, u.first_name, u.last_name, u.email, u.phone
      FROM practitioners p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.verification_status = 'verified'
      ORDER BY p.created_at DESC
    `);
    res.json(practitioners.rows);
  } catch (error) {
    console.error('Get practitioners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/practitioners', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const {
      licenseNumber,
      qualification,
      specializations,
      experienceYears,
      languagesSpoken,
      consultationFee,
      clinicAffiliation,
      practiceStartDate,
      workingHours,
      consultationDuration,
      maxPatientsPerDay
    } = req.body;

    const practitionerId = uuidv4();
    const newPractitioner = await pool.query(
      `INSERT INTO practitioners (
        practitioner_id, user_id, license_number, qualification, specializations,
        experience_years, languages_spoken, consultation_fee, clinic_affiliation,
        practice_start_date, working_hours, consultation_duration, max_patients_per_day
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        practitionerId, req.user.userId, licenseNumber, qualification,
        JSON.stringify(specializations), experienceYears, JSON.stringify(languagesSpoken),
        consultationFee, clinicAffiliation, practiceStartDate, JSON.stringify(workingHours),
        consultationDuration, maxPatientsPerDay
      ]
    );

    res.status(201).json({
      message: 'Practitioner profile created successfully',
      practitioner: newPractitioner.rows[0]
    });
  } catch (error) {
    console.error('Create practitioner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Appointment Management Routes
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'patient') {
      // Get patient's appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
        JOIN users pr ON prac.user_id = pr.user_id
        WHERE pt.user_id = $1
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
      params = [req.user.userId];
    } else if (req.user.role === 'practitioner') {
      // Get practitioner's appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
        JOIN users pr ON prac.user_id = pr.user_id
        WHERE prac.user_id = $1
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
      params = [req.user.userId];
    } else {
      // Admin gets all appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN practitioners prac ON a.practitioner_id = prac.practitioner_id
        JOIN users pr ON prac.user_id = pr.user_id
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `;
    }

    const appointments = await pool.query(query, params);
    res.json(appointments.rows);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const {
      practitionerId,
      appointmentDate,
      startTime,
      endTime,
      serviceType,
      consultationType,
      specialInstructions,
      preparationNotes
    } = req.body;

    // Get patient ID from user ID
    const patient = await pool.query('SELECT patient_id FROM patients WHERE user_id = $1', [req.user.userId]);
    if (patient.rows.length === 0) {
      return res.status(400).json({ error: 'Patient profile not found' });
    }

    const appointmentId = uuidv4();
    const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newAppointment = await pool.query(
      `INSERT INTO appointments (
        appointment_id, patient_id, practitioner_id, appointment_date, start_time, end_time,
        service_type, consultation_type, special_instructions, preparation_notes,
        confirmation_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        appointmentId, patient.rows[0].patient_id, practitionerId, appointmentDate,
        startTime, endTime, serviceType, consultationType, specialInstructions,
        preparationNotes, confirmationCode
      ]
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment.rows[0]
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Treatment Plan Routes
app.get('/api/treatment-plans', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'patient') {
      query = `
        SELECT tp.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
        FROM treatment_plans tp
        JOIN patients pt ON tp.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN practitioners prac ON tp.practitioner_id = prac.practitioner_id
        JOIN users pr ON prac.user_id = pr.user_id
        WHERE pt.user_id = $1
        ORDER BY tp.created_at DESC
      `;
      params = [req.user.userId];
    } else if (req.user.role === 'practitioner') {
      query = `
        SELECT tp.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
               pr.first_name as practitioner_first_name, pr.last_name as practitioner_last_name
        FROM treatment_plans tp
        JOIN patients pt ON tp.patient_id = pt.patient_id
        JOIN users p ON pt.user_id = p.user_id
        JOIN practitioners prac ON tp.practitioner_id = prac.practitioner_id
        JOIN users pr ON prac.user_id = pr.user_id
        WHERE prac.user_id = $1
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

    const treatmentPlans = await pool.query(query, params);
    res.json(treatmentPlans.rows);
  } catch (error) {
    console.error('Get treatment plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/treatment-plans', authenticateToken, authorizeRoles('practitioner', 'admin'), async (req, res) => {
  try {
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
      totalCost
    } = req.body;

    const treatmentPlanId = uuidv4();
    const newTreatmentPlan = await pool.query(
      `INSERT INTO treatment_plans (
        treatment_plan_id, patient_id, practitioner_id, treatment_name, treatment_type,
        start_date, end_date, total_sessions, purvakarma_protocols, pradhanakarma_protocols,
        paschatkarma_protocols, contraindications, expected_outcomes, special_instructions,
        total_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        treatmentPlanId, patientId, req.user.userId, treatmentName, treatmentType,
        startDate, endDate, totalSessions, JSON.stringify(purvakarmaProtocols),
        JSON.stringify(pradhanakarmaProtocols), JSON.stringify(paschatkarmaProtocols),
        contraindications, JSON.stringify(expectedOutcomes), specialInstructions, totalCost
      ]
    );

    res.status(201).json({
      message: 'Treatment plan created successfully',
      treatmentPlan: newTreatmentPlan.rows[0]
    });
  } catch (error) {
    console.error('Create treatment plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload route
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    filePath: req.file.path,
    filename: req.file.filename
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

module.exports = app;
