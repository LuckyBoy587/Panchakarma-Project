-- Panchakarma Management Database Schema
-- MySQL Database Setup

-- Create database
DROP DATABASE IF EXISTS panchakarma_db;
CREATE DATABASE panchakarma_db;
USE panchakarma_db;

-- Users Table
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('patient', 'practitioner', 'therapist', 'admin', 'staff') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    profile_picture_url VARCHAR(500) NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC'
);

-- Patients Table
-- Patients Table
-- patient_id is the same as the corresponding users.user_id for patient accounts
CREATE TABLE patients (
    patient_id VARCHAR(36) PRIMARY KEY,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    blood_group VARCHAR(5) NULL,
    height_cm INT NULL,
    weight_kg DECIMAL(5,2) NULL,
    occupation VARCHAR(100) NULL,
    marital_status ENUM('single', 'married', 'divorced', 'widowed') NULL,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    emergency_contact_relationship VARCHAR(50) NOT NULL,
    medical_conditions TEXT NULL,
    allergies TEXT NULL,
    current_medications TEXT NULL,
    past_surgeries TEXT NULL,
    family_medical_history TEXT NULL,
    lifestyle_habits TEXT NULL,
    dietary_preferences TEXT NULL,
    exercise_routine TEXT NULL,
    -- New structured fields requested by user
    contact_number VARCHAR(20) NULL,
    email_address VARCHAR(255) NULL,
    address TEXT NULL,
    full_name VARCHAR(255) NULL,
    age INT NULL,
    -- Medical history detailed fields (kept as text for flexibility)
    existing_health_conditions TEXT NULL,
    past_surgeries_major_illnesses TEXT NULL,
    allergies_detailed TEXT NULL,
    current_medications_detailed TEXT NULL,
    family_medical_history_detailed TEXT NULL,
    -- Lifestyle (Ayurveda focused)
    diet_pattern ENUM('veg','non-veg','mixed') NULL,
    sleep_pattern ENUM('good','disturbed','insomnia') NULL,
    daily_routine ENUM('sedentary','moderately_active','active') NULL,
    stress_level ENUM('low','moderate','high') NULL,
    addiction_history TEXT NULL,
    prakriti_assessment JSON NULL,
    vikriti_assessment JSON NULL,
    dosha_dominance VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Practitioners Table
CREATE TABLE practitioners (
    practitioner_id VARCHAR(36) PRIMARY KEY,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    qualification VARCHAR(500) NOT NULL,
    specializations JSON NOT NULL,
    experience_years INT NOT NULL,
    languages_spoken JSON NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    clinic_affiliation VARCHAR(200) NULL,
    practice_start_date DATE NOT NULL,
    bio TEXT NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_documents JSON NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    leave_days JSON NULL,
    consultation_duration INT DEFAULT 30,
    max_patients_per_day INT DEFAULT 20,
    emergency_availability BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (practitioner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Therapists Table
CREATE TABLE therapists (
    therapist_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    qualification VARCHAR(500) NOT NULL,
    specializations JSON NOT NULL,
    experience_years INT NOT NULL,
    languages_spoken JSON NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    clinic_affiliation VARCHAR(200) NULL,
    practice_start_date DATE NOT NULL,
    bio TEXT NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_documents JSON NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    leave_days JSON NULL,
    consultation_duration INT DEFAULT 30,
    max_patients_per_day INT DEFAULT 20,
    emergency_availability BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Appointments Table
CREATE TABLE appointments (
    appointment_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    practitioner_id VARCHAR(36) NULL,
    therapist_id VARCHAR(36) NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_type ENUM('consultation', 'treatment', 'follow_up') NOT NULL,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    consultation_type ENUM('in_person', 'video', 'phone') DEFAULT 'in_person',
    booking_channel ENUM('app', 'website', 'phone', 'walk_in') NOT NULL,
    special_instructions TEXT NULL,
    preparation_notes TEXT NULL,
    cancellation_reason TEXT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    confirmation_code VARCHAR(10) UNIQUE,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booked_by VARCHAR(36) NULL,
    check_in_time TIMESTAMP NULL,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(practitioner_id),
    FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id)
);

-- Treatment Plans Table
DROP TABLE IF EXISTS treatment_plans;
CREATE TABLE treatment_plans (
    treatment_plan_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    practitioner_id VARCHAR(36) NULL,
    treatment_name VARCHAR(200) NOT NULL,
    treatment_type ENUM('panchakarma', 'consultation', 'therapy') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_sessions INT NOT NULL,
    sessions_completed INT DEFAULT 0,
    purvakarma_protocols JSON NULL,
    pradhanakarma_protocols JSON NULL,
    paschatkarma_protocols JSON NULL,
    contraindications TEXT NULL,
    expected_outcomes TEXT NULL,
    special_instructions TEXT NULL,
    status ENUM('planned', 'active', 'completed', 'paused', 'cancelled') DEFAULT 'planned',
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(practitioner_id) ON DELETE SET NULL
);

-- Treatment Sessions Table
CREATE TABLE treatment_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    treatment_plan_id VARCHAR(36) NOT NULL,
    appointment_id VARCHAR(36) NULL,
    session_number INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    therapist_id VARCHAR(36) NOT NULL,
    staff_id VARCHAR(36) NULL,
    procedures_performed JSON NOT NULL,
    oils_medicines_used JSON NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    patient_response TEXT NULL,
    side_effects TEXT NULL,
    therapist_notes TEXT NULL,
    vital_signs JSON NULL,
    symptom_scores JSON NULL,
    energy_levels INT CHECK (energy_levels >= 1 AND energy_levels <= 5),
    sleep_quality INT CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    pain_scale INT CHECK (pain_scale >= 0 AND pain_scale <= 10),
    session_rating INT CHECK (session_rating >= 1 AND session_rating <= 5),
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    delivery_channels JSON NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    delivery_status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    priority_level ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    related_entity_type VARCHAR(50) NULL,
    related_entity_id VARCHAR(36) NULL,
    attempts INT DEFAULT 0,
    delivered_at TIMESTAMP NULL,
    failure_reason TEXT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Feedback Table
CREATE TABLE feedback (
    feedback_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    practitioner_id VARCHAR(36) NULL,
    treatment_plan_id VARCHAR(36) NULL,
    appointment_id VARCHAR(36) NULL,
    feedback_type ENUM('treatment', 'practitioner', 'facility', 'general') NOT NULL,
    overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
    treatment_effectiveness INT CHECK (treatment_effectiveness >= 1 AND treatment_effectiveness <= 5),
    practitioner_rating INT CHECK (practitioner_rating >= 1 AND practitioner_rating <= 5),
    facility_rating INT CHECK (facility_rating >= 1 AND facility_rating <= 5),
    staff_behavior_rating INT CHECK (staff_behavior_rating >= 1 AND staff_behavior_rating <= 5),
    value_for_money INT CHECK (value_for_money >= 1 AND value_for_money <= 5),
    recommendation_likelihood INT CHECK (recommendation_likelihood >= 1 AND recommendation_likelihood <= 10),
    positive_comments TEXT NULL,
    improvement_suggestions TEXT NULL,
    complaints TEXT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    response_required BOOLEAN DEFAULT false,
    response_text TEXT NULL,
    responded_by VARCHAR(36) NULL,
    response_date TIMESTAMP NULL,
    resolution_status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(practitioner_id),
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- Billing Table
CREATE TABLE billing (
    bill_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    treatment_plan_id VARCHAR(36) NULL,
    appointment_id VARCHAR(36) NULL,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    outstanding_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,
    payment_reference VARCHAR(100) NULL,
    insurance_claim_id VARCHAR(36) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- User Preferences Table
CREATE TABLE user_preferences (
    preference_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_preferences JSON NOT NULL,
    communication_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    do_not_disturb_start TIME NULL,
    do_not_disturb_end TIME NULL,
    appointment_reminder_time INT DEFAULT 120,
    marketing_communications BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Stock Table
CREATE TABLE stock (
    id VARCHAR(36) PRIMARY KEY,
    item_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Stock Items Table (Master list of available items)
CREATE TABLE stock_items (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Therapies Table
CREATE TABLE therapies (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Therapy Required Items Table
CREATE TABLE therapy_required_items (
    therapy_id INT NOT NULL,
    stock_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (therapy_id, stock_id),
    FOREIGN KEY (therapy_id) REFERENCES therapies(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stock_items(id) ON DELETE CASCADE
);

-- Rooms Table
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    last_updated_by VARCHAR(36) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (last_updated_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Slots Table for Doctor Schedule Management
CREATE TABLE slots (
    slot_id VARCHAR(36) PRIMARY KEY,
    practitioner_id VARCHAR(36) NULL,
    therapist_id VARCHAR(36) NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('booked', 'free', 'leave') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(practitioner_id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
    INDEX idx_provider_date (practitioner_id, therapist_id, date),
    INDEX idx_status (status)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
-- removed idx_patients_user_id because patients no longer stores a separate user_id column
-- practitioners now use practitioner_id which is the users.user_id; no separate user_id index required
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_practitioner_id ON appointments(practitioner_id);
CREATE INDEX idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_treatment_plans_patient_id ON treatment_plans(patient_id);
CREATE INDEX idx_treatment_plans_practitioner_id ON treatment_plans(practitioner_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_feedback_patient_id ON feedback(patient_id);
CREATE INDEX idx_billing_patient_id ON billing(patient_id);
CREATE INDEX idx_stock_updated_by ON stock(updated_by);
CREATE INDEX idx_rooms_last_updated_by ON rooms(last_updated_by);
CREATE INDEX idx_therapy_required_items_therapy_id ON therapy_required_items(therapy_id);
CREATE INDEX idx_therapy_required_items_stock_id ON therapy_required_items(stock_id);

-- Sample data insertion
INSERT INTO users (user_id, email, phone, password_hash, user_type, first_name, last_name, email_verified, phone_verified) VALUES
('admin-001', 'admin@panchakarma.com', '+1234567890', '$2a$12$PVnNS/PEsMLWI0U3mwnTq.8S5qrWgsLiJSfIUP7wB1Wc1Z0U6rsCS', 'practitioner', 'System', 'Admin', true, true),
('prac-001', 'doctor@panchakarma.com', '+1234567891', '$2a$12$PVnNS/PEsMLWI0U3mwnTq.8S5qrWgsLiJSfIUP7wB1Wc1Z0U6rsCS', 'practitioner', 'Dr. Meera', 'Nair', true, true),
('prac-002', 'doctor2@panchakarma.com', '+1234567895', '$2a$12$PVnNS/PEsMLWI0U3mwnTq.8S5qrWgsLiJSfIUP7wB1Wc1Z0U6rsCS', 'practitioner', 'Dr. Ravi', 'Sharma', true, true),
('ther-001', 'therapist@panchakarma.com', '+1234567896', '$2a$12$PVnNS/PEsMLWI0U3mwnTq.8S5qrWgsLiJSfIUP7wB1Wc1Z0U6rsCS', 'therapist', 'Priya', 'Patel', true, true),
('pat-001', 'arjun.sharma@email.com', '+1234567892', '$2a$12$PVnNS/PEsMLWI0U3mwnTq.8S5qrWgsLiJSfIUP7wB1Wc1Z0U6rsCS', 'patient', 'Arjun', 'Sharma', true, true);

INSERT INTO practitioners (practitioner_id, license_number, qualification, specializations, experience_years, languages_spoken, consultation_fee, clinic_affiliation, practice_start_date, verification_status, start_time, end_time, leave_days, consultation_duration, max_patients_per_day) VALUES
('prac-001', 'AYU-KL-12345', 'BAMS, MD Panchakarma', '["Panchakarma", "Ayurveda"]', 12, '["English", "Malayalam", "Hindi"]', 1500.00, 'Holistic Wellness Center', '2012-06-01', 'verified', '09:00', '17:00', '["sunday"]', 45, 16),
('prac-002', 'AYU-KL-67890', 'BAMS, MD Ayurveda', '["Ayurveda", "Yoga Therapy"]', 8, '["English", "Hindi"]', 1200.00, 'Ayurvedic Healing Clinic', '2016-03-15', 'verified', '10:00', '16:00', '["sunday"]', 30, 12);

INSERT INTO therapists (therapist_id, user_id, license_number, qualification, specializations, experience_years, languages_spoken, consultation_fee, clinic_affiliation, practice_start_date, verification_status, start_time, end_time, leave_days, consultation_duration, max_patients_per_day) VALUES
('ther-profile-001', 'ther-001', 'TH-KL-12345', 'Certified Ayurvedic Therapist', '["Massage", "Yoga Therapy"]', 5, '["English", "Hindi"]', 800.00, 'Holistic Wellness Center', '2019-01-15', 'verified', '08:00', '16:00', '["sunday"]', 60, 8);

INSERT INTO patients (patient_id, date_of_birth, gender, blood_group, height_cm, weight_kg, occupation, marital_status, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, medical_conditions, allergies, current_medications, dosha_dominance) VALUES
('pat-001', '1985-07-15', 'male', 'O+', 175, 78.5, 'Software Engineer', 'married', 'Priya Sharma', '+1234567893', 'Spouse', 'Hypertension, Chronic stress', 'Pollen, Dust mites', 'Amlodipine 5mg daily', 'Pitta');

-- Migration statements: If you have an existing DB, run the following ALTER TABLE statements
-- to add the new columns without dropping existing data.
-- ALTER TABLE patients ADD COLUMN contact_number VARCHAR(20) NULL;
-- ALTER TABLE patients ADD COLUMN email_address VARCHAR(255) NULL;
-- ALTER TABLE patients ADD COLUMN address TEXT NULL;
-- ALTER TABLE patients ADD COLUMN full_name VARCHAR(255) NULL;
-- ALTER TABLE patients ADD COLUMN age INT NULL;
-- ALTER TABLE patients ADD COLUMN existing_health_conditions TEXT NULL;
-- ALTER TABLE patients ADD COLUMN past_surgeries_major_illnesses TEXT NULL;
-- ALTER TABLE patients ADD COLUMN allergies_detailed TEXT NULL;
-- ALTER TABLE patients ADD COLUMN current_medications_detailed TEXT NULL;
-- ALTER TABLE patients ADD COLUMN family_medical_history_detailed TEXT NULL;
-- ALTER TABLE patients ADD COLUMN diet_pattern ENUM('veg','non-veg','mixed') NULL;
-- ALTER TABLE patients ADD COLUMN sleep_pattern ENUM('good','disturbed','insomnia') NULL;
-- ALTER TABLE patients ADD COLUMN daily_routine ENUM('sedentary','moderately_active','active') NULL;
-- ALTER TABLE patients ADD COLUMN stress_level ENUM('low','moderate','high') NULL;
-- ALTER TABLE patients ADD COLUMN addiction_history TEXT NULL;

-- Sample staff user
INSERT INTO users (user_id, email, phone, password_hash, user_type, first_name, last_name, email_verified, phone_verified) VALUES
('staff-001', 'staff@panchakarma.com', '+1234567894', '$2a$12$PVnNS/PEsMLWI0U3mwnTq.8S5qrWgsLiJSfIUP7wB1Wc1Z0U6rsCS', 'staff', 'Rajesh', 'Kumar', true, true);

-- Sample rooms data
INSERT INTO rooms (id, room_name, status, last_updated_by) VALUES
('room-001', 'Treatment Room 1', 'available', 'staff-001'),
('room-002', 'Treatment Room 2', 'available', 'staff-001'),
('room-003', 'Consultation Room', 'available', 'staff-001'),
('room-004', 'Massage Room', 'maintenance', 'staff-001'),
('room-005', 'Steam Room', 'available', 'staff-001');

-- Sample stock items data
INSERT INTO stock_items (id, name, category, unit) VALUES
(1, 'Sesame Oil', 'Oil', 'ml'),
(2, 'Coconut Oil', 'Oil', 'ml'),
(3, 'Castor Oil', 'Oil', 'ml'),
(4, 'Ghee', 'Consumable', 'g'),
(5, 'Medicated Powder', 'Powder', 'g'),
(6, 'Medicated Paste', 'Paste', 'g'),
(7, 'Herbal Decoction', 'Decoction', 'ml'),
(8, 'Buttermilk', 'Consumable', 'ml'),
(9, 'Milk', 'Consumable', 'ml'),
(10, 'Honey', 'Consumable', 'ml'),
(11, 'Lemon Juice', 'Consumable', 'ml'),
(12, 'Therapy Bed', 'Equipment', 'piece'),
(13, 'Shirodhara Pot', 'Equipment', 'piece'),
(14, 'Steam Chamber', 'Equipment', 'piece'),
(15, 'Massage Table', 'Equipment', 'piece'),
(16, 'Towels', 'Reusable', 'piece'),
(17, 'Cotton', 'Consumable', 'g'),
(18, 'Cloth Strips', 'Reusable', 'piece'),
(19, 'Blanket', 'Reusable', 'piece'),
(20, 'Earthen Pot', 'Equipment', 'piece'),
(21, 'Copper Vessel', 'Equipment', 'piece'),
(22, 'Mortar and Pestle', 'Equipment', 'piece'),
(23, 'Oil Heating Pan', 'Equipment', 'piece'),
(24, 'Colonic Equipment', 'Equipment', 'set'),
(25, 'Neti Pot', 'Equipment', 'piece'),
(26, 'Eye Cup', 'Equipment', 'piece'),
(27, 'Medicated Rice', 'Consumable', 'g'),
(28, 'Herbal Leaves', 'Consumable', 'g'),
(29, 'Herbal Poultice (Pinda)', 'Consumable', 'piece'),
(30, 'Incense Sticks', 'Misc', 'piece');

-- Sample therapies data
INSERT INTO therapies (id, name) VALUES
(1, 'Abhyanga (Oil Massage)'),
(2, 'Shirodhara'),
(3, 'Swedana (Herbal Steam)'),
(4, 'Nasya (Nasal Therapy)'),
(5, 'Virechana (Purgation)'),
(6, 'Basti (Enema Therapy)'),
(7, 'Netra Tarpana (Eye Therapy)'),
(8, 'Pinda Sweda (Rice Bolus Massage)'),
(9, 'Udvartana (Powder Massage)'),
(10, 'Karna Purana (Ear Therapy)');

-- Sample therapy required items data
INSERT INTO therapy_required_items (therapy_id, stock_id, quantity) VALUES
(1, 1, 200),
(1, 16, 2),
(1, 12, 1),
(2, 1, 500),
(2, 13, 1),
(2, 12, 1),
(3, 14, 1),
(3, 7, 300),
(3, 16, 2),
(4, 2, 20),
(4, 25, 1),
(4, 16, 1),
(5, 3, 50),
(5, 11, 20),
(5, 16, 1),
(6, 24, 1),
(6, 7, 200),
(6, 16, 1),
(7, 4, 50),
(7, 26, 1),
(7, 16, 1),
(8, 27, 200),
(8, 28, 100),
(8, 29, 2),
(8, 16, 2),
(9, 5, 100),
(9, 12, 1),
(9, 16, 2),
(10, 1, 20),
(10, 16, 1);

-- Sample slots data for therapist
INSERT INTO slots (slot_id, therapist_id, date, start_time, end_time, status) VALUES
('slot-ther-001', 'ther-profile-001', '2025-09-11', '08:00', '09:00', 'free'),
('slot-ther-002', 'ther-profile-001', '2025-09-11', '09:00', '10:00', 'free'),
('slot-ther-003', 'ther-profile-001', '2025-09-11', '10:00', '11:00', 'free'),
('slot-ther-004', 'ther-profile-001', '2025-09-11', '11:00', '12:00', 'free'),
('slot-ther-005', 'ther-profile-001', '2025-09-11', '13:00', '14:00', 'free'),
('slot-ther-006', 'ther-profile-001', '2025-09-11', '14:00', '15:00', 'free'),
('slot-ther-007', 'ther-profile-001', '2025-09-11', '15:00', '16:00', 'free'),
('slot-ther-008', 'ther-profile-001', '2025-09-12', '08:00', '09:00', 'free'),
('slot-ther-009', 'ther-profile-001', '2025-09-12', '09:00', '10:00', 'free'),
('slot-ther-010', 'ther-profile-001', '2025-09-12', '10:00', '11:00', 'free'),
('slot-ther-011', 'ther-profile-001', '2025-09-12', '11:00', '12:00', 'free'),
('slot-ther-012', 'ther-profile-001', '2025-09-12', '13:00', '14:00', 'free'),
('slot-ther-013', 'ther-profile-001', '2025-09-12', '14:00', '15:00', 'free'),
('slot-ther-014', 'ther-profile-001', '2025-09-12', '15:00', '16:00', 'free');

-- Sample stock data
INSERT INTO stock (id, item_name, quantity, unit, updated_by) VALUES
('stock-001', 'Sesame Oil', 1000, 'ml', 'staff-001'),
('stock-002', 'Coconut Oil', 500, 'ml', 'staff-001'),
('stock-003', 'Castor Oil', 200, 'ml', 'staff-001'),
('stock-004', 'Ghee', 300, 'g', 'staff-001'),
('stock-005', 'Medicated Powder', 150, 'g', 'staff-001'),
('stock-006', 'Medicated Paste', 100, 'g', 'staff-001'),
('stock-007', 'Herbal Decoction', 400, 'ml', 'staff-001'),
('stock-008', 'Buttermilk', 2000, 'ml', 'staff-001'),
('stock-009', 'Milk', 1000, 'ml', 'staff-001'),
('stock-010', 'Honey', 500, 'ml', 'staff-001'),
('stock-011', 'Lemon Juice', 300, 'ml', 'staff-001'),
('stock-012', 'Therapy Bed', 5, 'piece', 'staff-001'),
('stock-013', 'Shirodhara Pot', 3, 'piece', 'staff-001'),
('stock-014', 'Steam Chamber', 2, 'piece', 'staff-001'),
('stock-015', 'Massage Table', 4, 'piece', 'staff-001'),
('stock-016', 'Towels', 50, 'piece', 'staff-001'),
('stock-017', 'Cotton', 200, 'g', 'staff-001'),
('stock-018', 'Cloth Strips', 100, 'piece', 'staff-001'),
('stock-019', 'Blanket', 10, 'piece', 'staff-001'),
('stock-020', 'Earthen Pot', 5, 'piece', 'staff-001'),
('stock-021', 'Copper Vessel', 3, 'piece', 'staff-001'),
('stock-022', 'Mortar and Pestle', 2, 'piece', 'staff-001'),
('stock-023', 'Oil Heating Pan', 2, 'piece', 'staff-001'),
('stock-024', 'Colonic Equipment', 1, 'set', 'staff-001'),
('stock-025', 'Neti Pot', 5, 'piece', 'staff-001'),
('stock-026', 'Eye Cup', 10, 'piece', 'staff-001'),
('stock-027', 'Medicated Rice', 300, 'g', 'staff-001'),
('stock-028', 'Herbal Leaves', 150, 'g', 'staff-001'),
('stock-029', 'Herbal Poultice (Pinda)', 20, 'piece', 'staff-001'),
('stock-030', 'Incense Sticks', 100, 'piece', 'staff-001');

-- Tables have been recreated with correct structure above
-- No additional ALTER TABLE statements needed
