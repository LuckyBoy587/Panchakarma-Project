# Panchakarma Management Software - MVP Technical & Business Workflow Map

## Overview
This document provides a comprehensive blueprint for developing a Panchakarma Management Software MVP, covering all functional modules, operational workflows, data models, and backend architecture requirements.

## Table of Contents
1. [Core Functional Modules](#core-functional-modules)
2. [Detailed Module Workflows](#detailed-module-workflows)
3. [Database Schema & Architecture](#database-schema--architecture)
4. [Data Collection Specifications](#data-collection-specifications)
5. [Integration Points](#integration-points)
6. [Security & Privacy Considerations](#security--privacy-considerations)
7. [Sample Data Templates](#sample-data-templates)

---

## Core Functional Modules

### 1. User Authentication & Management
**Purpose:** Secure access control for different user types
**Key Features:**
- Multi-role authentication (Patient, Practitioner, Admin, Staff)
- Profile management with role-based permissions
- Password security with hashing
- Session management

### 2. Patient Registration & Management
**Purpose:** Comprehensive patient onboarding and profile management
**Key Features:**
- Digital registration with health assessments
- Medical history tracking
- Document management
- Emergency contact management

### 3. Practitioner Management
**Purpose:** Healthcare provider registration and profile management
**Key Features:**
- Professional credential verification
- Specialization tracking
- Availability management
- Performance analytics

### 4. Appointment Scheduling
**Purpose:** Efficient booking and calendar management
**Key Features:**
- Multi-practitioner scheduling
- Real-time availability
- Automated conflict detection
- Waitlist management

### 5. Therapy Planning & Tracking
**Purpose:** Panchakarma treatment workflow management
**Key Features:**
- Three-phase treatment tracking (Purvakarma, Pradhanakarma, Paschatkarma)
- Custom therapy protocols
- Progress monitoring
- Treatment milestone tracking

### 6. Notification System
**Purpose:** Automated communication management
**Key Features:**
- Multi-channel notifications (SMS, Email, In-app)
- Appointment reminders
- Treatment updates
- Emergency alerts

### 7. Feedback & Rating System
**Purpose:** Quality assurance and improvement
**Key Features:**
- Post-treatment feedback collection
- Practitioner ratings
- Treatment effectiveness tracking
- Complaint management

### 8. Analytics & Reporting
**Purpose:** Business intelligence and performance monitoring
**Key Features:**
- Treatment outcome analysis
- Resource utilization reports
- Financial performance tracking
- Patient satisfaction metrics

### 9. Admin Panel
**Purpose:** System administration and configuration
**Key Features:**
- User role management
- System configuration
- Content management
- Audit trails

### 10. Billing & Payment
**Purpose:** Financial transaction management
**Key Features:**
- Treatment cost calculation
- Payment processing
- Insurance claim management
- Financial reporting

---

## Detailed Module Workflows

### 1. User Authentication & Management Module

#### User Stories:
- **US1.1:** As a new user, I want to register with my email/phone so I can access the platform
- **US1.2:** As a registered user, I want to login securely using my credentials
- **US1.3:** As a user, I want to reset my password if I forget it
- **US1.4:** As a user, I want to update my profile information
- **US1.5:** As an admin, I want to manage user roles and permissions

#### Operational Logic:
```
1. Registration Flow:
   - User provides basic info (email, phone, name)
   - System validates uniqueness of email/phone
   - OTP verification for phone/email
   - Role assignment (Patient/Practitioner/Admin)
   - Account activation
   - Welcome notification sent

2. Login Flow:
   - User enters credentials
   - System validates against stored hash
   - Session token generation
   - Role-based dashboard redirect
   - Login activity logging

3. Password Reset:
   - User requests reset via email/phone
   - System sends secure reset link/OTP
   - User creates new password
   - Password hash updated
   - Confirmation notification
```

#### Data Fields Captured:
- **Registration:** user_id, email, phone, password_hash, role, created_at, email_verified, phone_verified
- **Login:** login_id, user_id, login_timestamp, ip_address, user_agent, status
- **Password Reset:** reset_id, user_id, reset_token, expires_at, used_at

#### Dependencies:
- **Triggers:** Patient/Practitioner registration processes
- **Integrates with:** All other modules for authentication

---

### 2. Patient Registration & Management Module

#### User Stories:
- **US2.1:** As a patient, I want to complete my health profile during registration
- **US2.2:** As a patient, I want to upload medical documents
- **US2.3:** As a patient, I want to update my health information
- **US2.4:** As a healthcare provider, I want to view complete patient history
- **US2.5:** As a patient, I want to set my communication preferences

#### Operational Logic:
```
1. Patient Onboarding:
   - Basic registration (extends User module)
   - Health assessment questionnaire
   - Medical history input
   - Document upload (reports, prescriptions)
   - Emergency contact setup
   - Dosha analysis (Ayurvedic constitution)
   - Consent form completion

2. Profile Management:
   - Information updates
   - Document version control
   - Health condition tracking
   - Preference management
   - Privacy settings

3. Health Data Integration:
   - Vital signs recording
   - Symptom tracking
   - Medication history
   - Allergy management
   - Treatment response tracking
```

#### Data Fields Captured:
**Personal Information:**
- patient_id, first_name, last_name, date_of_birth, gender, blood_group
- address, city, state, country, postal_code
- occupation, marital_status, preferred_language

**Health Information:**
- height, weight, blood_pressure, medical_conditions, allergies
- current_medications, past_surgeries, family_medical_history
- lifestyle_habits, dietary_preferences, exercise_routine

**Ayurvedic Assessment:**
- prakriti_assessment, vikriti_assessment, dosha_dominance
- digestive_capacity, sleep_pattern, stress_levels

**Emergency Contact:**
- emergency_contact_name, relationship, phone, email, address

#### Dependencies:
- **Requires:** User Authentication completion
- **Triggers:** Appointment scheduling availability
- **Connects to:** Therapy planning, billing modules

---

### 3. Practitioner Management Module

#### User Stories:
- **US3.1:** As a practitioner, I want to register with my professional credentials
- **US3.2:** As a practitioner, I want to set my availability schedule
- **US3.3:** As a practitioner, I want to manage my specializations
- **US3.4:** As an admin, I want to verify practitioner credentials
- **US3.5:** As a practitioner, I want to view my patient assignments

#### Operational Logic:
```
1. Practitioner Registration:
   - Professional info collection
   - Credential verification
   - License validation
   - Specialization selection
   - Experience documentation
   - Clinic/hospital affiliation
   - Background verification

2. Schedule Management:
   - Working hours setup
   - Break time configuration
   - Holiday/leave management
   - Consultation duration settings
   - Emergency availability

3. Performance Tracking:
   - Patient feedback aggregation
   - Treatment success metrics
   - Appointment adherence
   - Revenue contribution
   - Continuing education tracking
```

#### Data Fields Captured:
**Professional Information:**
- practitioner_id, license_number, qualification, specialization
- experience_years, languages_spoken, consultation_fee
- clinic_affiliation, practice_start_date

**Credentials:**
- degree_certificates, license_documents, registration_numbers
- verification_status, expiry_dates, renewal_alerts

**Availability:**
- working_days, start_time, end_time, break_times
- consultation_duration, max_patients_per_day, emergency_availability

**Performance Metrics:**
- total_patients_treated, success_rate, patient_rating
- revenue_generated, feedback_score

#### Dependencies:
- **Requires:** User Authentication, Admin verification
- **Connects to:** Appointment scheduling, therapy planning
- **Triggers:** Patient assignment, billing calculations

---

### 4. Appointment Scheduling Module

#### User Stories:
- **US4.1:** As a patient, I want to book appointments with available practitioners
- **US4.2:** As a patient, I want to reschedule my appointments
- **US4.3:** As a practitioner, I want to view my appointment calendar
- **US4.4:** As a receptionist, I want to manage walk-in appointments
- **US4.5:** As a patient, I want to join a waitlist for fully booked slots

#### Operational Logic:
```
1. Appointment Booking:
   - Patient selects service type
   - System shows available practitioners
   - Time slot selection from available calendar
   - Booking confirmation
   - Calendar update for all parties
   - Confirmation notifications sent

2. Conflict Resolution:
   - Real-time availability checking
   - Double-booking prevention
   - Automated slot suggestions
   - Waitlist queue management

3. Appointment Management:
   - Modification handling
   - Cancellation processing
   - No-show tracking
   - Rescheduling automation
   - Payment status integration

4. Calendar Synchronization:
   - Practitioner calendar updates
   - Patient reminder scheduling
   - Resource allocation
   - Room assignment
   - Equipment booking
```

#### Data Fields Captured:
**Appointment Core:**
- appointment_id, patient_id, practitioner_id, appointment_date, start_time, end_time
- service_type, status, consultation_type, priority_level

**Booking Details:**
- booked_at, booked_by, payment_status, confirmation_code
- special_instructions, preparation_notes

**Status Tracking:**
- status_history, cancellation_reason, rescheduled_from, no_show_flag
- check_in_time, actual_start_time, actual_end_time

#### Dependencies:
- **Requires:** Patient and Practitioner profiles
- **Connects to:** Notification system, billing module
- **Triggers:** Treatment planning, resource allocation

---

### 5. Therapy Planning & Tracking Module

#### User Stories:
- **US5.1:** As a practitioner, I want to create personalized Panchakarma treatment plans
- **US5.2:** As a patient, I want to track my treatment progress
- **US5.3:** As a practitioner, I want to monitor treatment effectiveness
- **US5.4:** As a therapist, I want to record treatment session details
- **US5.5:** As a patient, I want to receive treatment preparation guidelines

#### Operational Logic:
```
1. Treatment Planning:
   - Initial patient assessment
   - Dosha analysis and imbalance identification
   - Treatment protocol selection
   - Three-phase treatment design:
     * Purvakarma (Preparation): 3-7 days
     * Pradhanakarma (Main treatment): 5-21 days
     * Paschatkarma (Post-treatment): 7-14 days
   - Resource requirement estimation
   - Timeline development

2. Treatment Execution:
   - Daily treatment tracking
   - Therapist assignment
   - Progress monitoring
   - Side effect recording
   - Patient feedback collection
   - Treatment adjustment protocols

3. Progress Analytics:
   - Symptom improvement tracking
   - Vital signs monitoring
   - Patient satisfaction measurement
   - Treatment outcome analysis
   - Success rate calculation
```

#### Data Fields Captured:
**Treatment Plan:**
- treatment_plan_id, patient_id, practitioner_id, created_date
- treatment_type, duration_days, total_sessions
- purvakarma_protocols, pradhanakarma_protocols, paschatkarma_protocols

**Daily Sessions:**
- session_id, treatment_plan_id, session_date, therapist_id
- procedures_performed, oils_used, duration_minutes
- patient_response, side_effects, therapist_notes

**Progress Tracking:**
- progress_id, session_id, vital_signs, symptom_scores
- patient_feedback, energy_levels, sleep_quality
- digestive_status, stress_levels, pain_scale

**Treatment Protocols:**
- protocol_id, protocol_name, description, procedures
- contraindications, expected_outcomes, duration

#### Dependencies:
- **Requires:** Patient profile, Practitioner assignment
- **Connects to:** Appointment scheduling, inventory management
- **Triggers:** Progress notifications, billing events

---

### 6. Notification System Module

#### User Stories:
- **US6.1:** As a patient, I want to receive appointment reminders
- **US6.2:** As a practitioner, I want alerts for patient updates
- **US6.3:** As a user, I want to choose my notification preferences
- **US6.4:** As an admin, I want to send system-wide announcements
- **US6.5:** As a patient, I want emergency contact notifications

#### Operational Logic:
```
1. Notification Types:
   - Appointment reminders (24h, 2h before)
   - Treatment preparation instructions
   - Schedule changes/cancellations
   - Treatment progress updates
   - Billing and payment reminders
   - System maintenance alerts
   - Emergency notifications

2. Delivery Channels:
   - SMS notifications
   - Email notifications
   - In-app push notifications
   - WhatsApp integration (optional)

3. Notification Scheduling:
   - Event-triggered notifications
   - Time-based scheduling
   - Recurring reminders
   - Priority-based delivery
   - Failed delivery handling

4. Preference Management:
   - Channel preferences per notification type
   - Timing preferences
   - Do-not-disturb settings
   - Emergency override options
```

#### Data Fields Captured:
**Notification Templates:**
- template_id, template_name, template_type, message_template
- subject_template, channel_supported, priority_level

**Notification Queue:**
- notification_id, user_id, template_id, scheduled_time
- delivery_channel, status, attempts, delivered_at

**User Preferences:**
- preference_id, user_id, notification_type, channels_enabled
- timing_preferences, do_not_disturb_hours

**Delivery Log:**
- log_id, notification_id, delivery_status, delivered_at
- failure_reason, retry_count, final_status

#### Dependencies:
- **Triggered by:** All modules (appointments, treatments, billing)
- **Requires:** User preferences, contact information
- **Integrates with:** SMS/Email service providers

---

### 7. Feedback & Rating System Module

#### User Stories:
- **US7.1:** As a patient, I want to rate my treatment experience
- **US7.2:** As a patient, I want to provide detailed feedback
- **US7.3:** As a practitioner, I want to view my performance ratings
- **US7.4:** As an admin, I want to analyze feedback trends
- **US7.5:** As a patient, I want to file complaints if needed

#### Operational Logic:
```
1. Feedback Collection:
   - Post-treatment automatic surveys
   - Multi-dimensional rating system:
     * Treatment effectiveness (1-5)
     * Practitioner competence (1-5)
     * Facility cleanliness (1-5)
     * Staff behavior (1-5)
     * Overall experience (1-5)
   - Open-text feedback collection
   - Anonymous feedback option

2. Feedback Processing:
   - Sentiment analysis on text feedback
   - Rating aggregation by practitioner
   - Trend analysis over time
   - Alert generation for negative feedback
   - Response workflow for complaints

3. Quality Improvement:
   - Performance dashboards
   - Improvement action tracking
   - Patient satisfaction metrics
   - Comparative analysis
   - Feedback loop closure
```

#### Data Fields Captured:
**Feedback Forms:**
- feedback_id, patient_id, practitioner_id, treatment_plan_id
- submission_date, is_anonymous, overall_rating

**Detailed Ratings:**
- treatment_effectiveness, practitioner_rating, facility_rating
- staff_behavior_rating, value_for_money, recommendation_likelihood

**Qualitative Feedback:**
- positive_comments, improvement_suggestions, complaints
- specific_issues, pain_points, recommendations

**Response Management:**
- response_id, feedback_id, responder_id, response_date
- response_text, resolution_status, follow_up_required

#### Dependencies:
- **Triggered by:** Treatment completion
- **Connects to:** Analytics module, practitioner profiles
- **Influences:** Quality improvement processes

---

### 8. Analytics & Reporting Module

#### User Stories:
- **US8.1:** As an admin, I want to view business performance dashboards
- **US8.2:** As a practitioner, I want to analyze my treatment outcomes
- **US8.3:** As a manager, I want resource utilization reports
- **US8.4:** As a patient, I want to track my health progress
- **US8.5:** As a stakeholder, I want financial performance reports

#### Operational Logic:
```
1. Data Aggregation:
   - Real-time data collection from all modules
   - Historical data analysis
   - Trend identification
   - Pattern recognition
   - Predictive analytics

2. Report Generation:
   - Automated daily/weekly/monthly reports
   - Custom report builder
   - Visual dashboard creation
   - Export capabilities (PDF, Excel)
   - Scheduled report delivery

3. Key Metrics Tracking:
   - Patient acquisition and retention
   - Treatment success rates
   - Practitioner performance
   - Revenue and profitability
   - Resource utilization
   - Patient satisfaction scores
```

#### Data Fields Captured:
**Performance Metrics:**
- metric_id, metric_name, metric_category, measurement_period
- current_value, target_value, trend_direction

**Business KPIs:**
- total_patients, new_patients, returning_patients
- appointment_completion_rate, no_show_rate
- average_treatment_duration, success_rate
- revenue_per_patient, profit_margins

**Quality Metrics:**
- patient_satisfaction_score, treatment_effectiveness
- practitioner_ratings, complaint_resolution_time
- facility_utilization, resource_efficiency

#### Dependencies:
- **Sources data from:** All modules
- **Provides insights to:** Management, practitioners, patients
- **Triggers:** Performance improvement actions

---

## Database Schema & Architecture

### Core Database Tables

#### 1. Users Table
```sql
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('patient', 'practitioner', 'admin', 'staff') NOT NULL,
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
```

#### 2. Patients Table
```sql
CREATE TABLE patients (
    patient_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
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
    prakriti_assessment JSON NULL,
    vikriti_assessment JSON NULL,
    dosha_dominance VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### 3. Practitioners Table
```sql
CREATE TABLE practitioners (
    practitioner_id VARCHAR(36) PRIMARY KEY,
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
    working_hours JSON NOT NULL, -- {monday: {start: "09:00", end: "17:00"}, ...}
    consultation_duration INT DEFAULT 30, -- in minutes
    max_patients_per_day INT DEFAULT 20,
    emergency_availability BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### 4. Appointments Table
```sql
CREATE TABLE appointments (
    appointment_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    practitioner_id VARCHAR(36) NOT NULL,
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
    booked_by VARCHAR(36) NULL, -- staff member who booked
    check_in_time TIMESTAMP NULL,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(practitioner_id)
);
```

#### 5. Treatment Plans Table
```sql
CREATE TABLE treatment_plans (
    treatment_plan_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    practitioner_id VARCHAR(36) NOT NULL,
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
    total_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(practitioner_id)
);
```

#### 6. Treatment Sessions Table
```sql
CREATE TABLE treatment_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    treatment_plan_id VARCHAR(36) NOT NULL,
    appointment_id VARCHAR(36) NULL,
    session_number INT NOT NULL,
    session_date DATE NOT NULL,
    therapist_id VARCHAR(36) NOT NULL,
    procedures_performed JSON NOT NULL,
    oils_medicines_used JSON NULL,
    duration_minutes INT NOT NULL,
    patient_response TEXT NULL,
    side_effects TEXT NULL,
    therapist_notes TEXT NULL,
    vital_signs JSON NULL, -- {bp: "120/80", pulse: 72, temp: 98.6}
    symptom_scores JSON NULL,
    energy_levels INT CHECK (energy_levels >= 1 AND energy_levels <= 5),
    sleep_quality INT CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    pain_scale INT CHECK (pain_scale >= 0 AND pain_scale <= 10),
    session_rating INT CHECK (session_rating >= 1 AND session_rating <= 5),
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (therapist_id) REFERENCES practitioners(practitioner_id)
);
```

#### 7. Notifications Table
```sql
CREATE TABLE notifications (
    notification_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    delivery_channels JSON NOT NULL, -- ["sms", "email", "push"]
    scheduled_time TIMESTAMP NOT NULL,
    delivery_status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    priority_level ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    related_entity_type VARCHAR(50) NULL, -- appointment, treatment, billing
    related_entity_id VARCHAR(36) NULL,
    attempts INT DEFAULT 0,
    delivered_at TIMESTAMP NULL,
    failure_reason TEXT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### 8. Feedback Table
```sql
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
```

#### 9. Billing Table
```sql
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);
```

#### 10. User Preferences Table
```sql
CREATE TABLE user_preferences (
    preference_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_preferences JSON NOT NULL, -- {email: true, sms: false, push: true}
    communication_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    do_not_disturb_start TIME NULL,
    do_not_disturb_end TIME NULL,
    appointment_reminder_time INT DEFAULT 120, -- minutes before appointment
    marketing_communications BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## Data Collection Specifications

### Patient Registration Data Collection

#### Personal Information (Required)
```json
{
  "firstName": "string (2-50 chars)",
  "lastName": "string (2-50 chars)",
  "email": "email format, unique",
  "phone": "string (10-15 digits), unique",
  "dateOfBirth": "date (YYYY-MM-DD)",
  "gender": "enum [male, female, other]",
  "preferredLanguage": "string (ISO code)"
}
```

#### Health Information (Comprehensive)
```json
{
  "physicalMetrics": {
    "height": "integer (cm)",
    "weight": "decimal (kg)",
    "bloodGroup": "enum [A+, A-, B+, B-, AB+, AB-, O+, O-]",
    "bloodPressure": "string (systolic/diastolic)"
  },
  "medicalHistory": {
    "currentMedications": "array of strings",
    "allergies": "array of strings",
    "chronicConditions": "array of strings",
    "pastSurgeries": "array with dates",
    "familyMedicalHistory": "object with conditions and relatives"
  },
  "ayurvedicAssessment": {
    "digestion": "enum [strong, moderate, weak, variable]",
    "sleepPattern": "enum [sound, light, disturbed, insomnia]",
    "stressLevel": "integer (1-10 scale)",
    "energyLevel": "integer (1-10 scale)",
    "bowelMovements": "enum [regular, constipated, loose, irregular]",
    "menstrualCycle": "object (for females)"
  },
  "lifestyleFactors": {
    "dietaryPreferences": "array [vegetarian, vegan, non-vegetarian, etc.]",
    "exerciseHabits": "string description",
    "smokingStatus": "enum [never, former, current]",
    "alcoholConsumption": "enum [never, occasional, regular]",
    "workStressLevel": "integer (1-10 scale)"
  }
}
```

#### Emergency Contact (Required)
```json
{
  "emergencyContact": {
    "name": "string (required)",
    "relationship": "string (required)",
    "phone": "string (required)",
    "email": "email format (optional)",
    "address": "string (optional)"
  }
}
```

#### Consent & Preferences
```json
{
  "consents": {
    "treatmentConsent": "boolean (required)",
    "dataProcessingConsent": "boolean (required)",
    "marketingCommunications": "boolean (optional)",
    "dataSharing": "boolean (optional)",
    "telemedicineConsent": "boolean (optional)"
  },
  "communicationPreferences": {
    "preferredChannel": "enum [email, sms, phone, app]",
    "reminderTiming": "integer (minutes before appointment)",
    "languagePreference": "string (ISO code)"
  }
}
```

### Practitioner Registration Data Collection

#### Professional Information (Required)
```json
{
  "professionalDetails": {
    "licenseNumber": "string (unique, required)",
    "qualification": "array of strings (degrees, certifications)",
    "specializations": "array of enum [panchakarma, general_ayurveda, pulse_diagnosis, etc.]",
    "experienceYears": "integer (required)",
    "practiceStartDate": "date (YYYY-MM-DD)",
    "languagesSpoken": "array of strings"
  },
  "credentials": {
    "medicalDegrees": "array of file uploads",
    "licenseCertificates": "array of file uploads",
    "specialtyTraining": "array of file uploads",
    "continuingEducation": "array of file uploads"
  },
  "practiceSettings": {
    "clinicAffiliation": "string (optional)",
    "consultationFee": "decimal (required)",
    "emergencyAvailability": "boolean",
    "telemedicineOffered": "boolean"
  }
}
```

#### Availability & Scheduling
```json
{
  "workingHours": {
    "monday": {"start": "HH:MM", "end": "HH:MM", "isWorking": "boolean"},
    "tuesday": {"start": "HH:MM", "end": "HH:MM", "isWorking": "boolean"},
    "wednesday": {"start": "HH:MM", "end": "HH:MM", "isWorking": "boolean"},
    "thursday": {"start": "HH:MM", "end": "HH:MM", "isWorking": "boolean"},
    "friday": {"start": "HH:MM", "end": "HH:MM", "isWorking": "boolean"},
    "saturday": {"start": "HH:MM", "end": "HH:MM", "isWorking": "boolean"},
    "sunday": {"start": "HH:MM", "end": "HH:MM", "isWorking": "boolean"}
  },
  "schedulingPreferences": {
    "consultationDuration": "integer (minutes)",
    "breakBetweenConsultations": "integer (minutes)",
    "maxPatientsPerDay": "integer",
    "lunchBreak": {"start": "HH:MM", "end": "HH:MM"}
  }
}
```

---

## Integration Points & Third-Party Services

### 1. Communication Services
- **SMS Gateway:** Twilio, AWS SNS, or local SMS providers
- **Email Service:** SendGrid, AWS SES, or SMTP servers
- **Push Notifications:** Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNS)

### 2. Payment Gateways
- **Payment Processors:** Stripe, Razorpay, PayPal
- **Banking Integration:** Direct bank transfer APIs
- **Insurance Claims:** Integration with insurance provider APIs

### 3. Calendar & Scheduling
- **Calendar Sync:** Google Calendar API, Microsoft Outlook API
- **Video Conferencing:** Zoom API, Google Meet API for telemedicine

### 4. File Storage & Management
- **Cloud Storage:** AWS S3, Google Cloud Storage for documents and images
- **CDN:** CloudFront, CloudFlare for fast content delivery

### 5. Analytics & Monitoring
- **Analytics:** Google Analytics, Mixpanel for user behavior tracking
- **Monitoring:** Sentry for error tracking, DataDog for system monitoring

---

## Security & Privacy Considerations

### Data Protection Measures

#### 1. Authentication Security
```
- Password hashing using bcrypt with salt rounds ≥12
- Multi-factor authentication (MFA) for practitioner accounts
- Session management with secure tokens (JWT with refresh tokens)
- Account lockout after 5 failed login attempts
- Password complexity requirements (min 8 chars, mixed case, numbers, symbols)
```

#### 2. Data Encryption
```
- TLS 1.3 for data in transit
- AES-256 encryption for sensitive data at rest
- Database encryption for PHI (Protected Health Information)
- Encrypted file storage for documents and images
- API endpoint encryption for all communications
```

#### 3. Access Controls
```
- Role-based access control (RBAC) implementation
- Principle of least privilege
- Audit trails for all data access and modifications
- Automatic session timeout after inactivity
- IP whitelisting for admin access
```

#### 4. HIPAA Compliance (if applicable)
```
- Comprehensive audit logging
- User access tracking and reporting
- Secure backup and recovery procedures
- Business Associate Agreements (BAAs) with third parties
- Regular security assessments and penetration testing
```

#### 5. Privacy Controls
```
- Data anonymization options
- User consent management
- Right to data portability
- Right to be forgotten implementation
- Clear privacy policy and consent forms
```

---

## Sample Data Templates

### Sample Patient Record
```json
{
  "patientId": "PAT-2024-001",
  "personalInfo": {
    "firstName": "Arjun",
    "lastName": "Sharma",
    "email": "arjun.sharma@email.com",
    "phone": "+919876543210",
    "dateOfBirth": "1985-07-15",
    "gender": "male",
    "bloodGroup": "O+",
    "occupation": "Software Engineer",
    "maritalStatus": "married"
  },
  "healthMetrics": {
    "height": 175,
    "weight": 78.5,
    "bmi": 25.6,
    "bloodPressure": "130/85"
  },
  "ayurvedicProfile": {
    "prakriti": "Vata-Pitta",
    "vikriti": "Pitta aggravated",
    "dominantDosha": "Pitta",
    "digestion": "variable",
    "sleepPattern": "light",
    "stressLevel": 7,
    "energyLevel": 6
  },
  "medicalHistory": {
    "currentConditions": ["Hypertension", "Chronic stress"],
    "allergies": ["Pollen", "Dust mites"],
    "currentMedications": ["Amlodipine 5mg daily"],
    "familyHistory": ["Diabetes (father)", "Heart disease (mother)"]
  },
  "emergencyContact": {
    "name": "Priya Sharma",
    "relationship": "Spouse",
    "phone": "+919876543211",
    "email": "priya.sharma@email.com"
  },
  "preferences": {
    "communicationLanguage": "Hindi",
    "preferredNotifications": ["SMS", "Email"],
    "reminderTime": 120
  },
  "registrationDate": "2024-01-15T10:30:00Z"
}
```

### Sample Practitioner Record
```json
{
  "practitionerId": "PRAC-2024-001",
  "personalInfo": {
    "firstName": "Dr. Meera",
    "lastName": "Nair",
    "email": "dr.meera.nair@clinic.com",
    "phone": "+919876543220"
  },
  "professionalInfo": {
    "licenseNumber": "AYU-KL-12345",
    "qualification": [
      "BAMS - Kerala Ayurveda Medical College",
      "MD Panchakarma - Gujarat Ayurved University"
    ],
    "specializations": ["Panchakarma", "Women's Health", "Stress Management"],
    "experienceYears": 12,
    "practiceStartDate": "2012-06-01",
    "languagesSpoken": ["English", "Malayalam", "Hindi", "Tamil"]
  },
  "clinicInfo": {
    "affiliation": "Holistic Wellness Ayurveda Center",
    "consultationFee": 1500.00,
    "emergencyAvailability": true,
    "telemedicineAvailable": true
  },
  "schedule": {
    "workingDays": {
      "monday": {"start": "09:00", "end": "17:00", "isWorking": true},
      "tuesday": {"start": "09:00", "end": "17:00", "isWorking": true},
      "wednesday": {"start": "09:00", "end": "17:00", "isWorking": true},
      "thursday": {"start": "09:00", "end": "17:00", "isWorking": true},
      "friday": {"start": "09:00", "end": "17:00", "isWorking": true},
      "saturday": {"start": "09:00", "end": "13:00", "isWorking": true},
      "sunday": {"isWorking": false}
    },
    "consultationDuration": 45,
    "maxPatientsPerDay": 16,
    "lunchBreak": {"start": "13:00", "end": "14:00"}
  },
  "performance": {
    "totalPatients": 1250,
    "averageRating": 4.7,
    "successRate": 89.5,
    "responseTime": "2 hours"
  },
  "verificationStatus": "verified",
  "registrationDate": "2023-12-01T14:20:00Z"
}
```

### Sample Treatment Plan
```json
{
  "treatmentPlanId": "TP-2024-001",
  "patientId": "PAT-2024-001",
  "practitionerId": "PRAC-2024-001",
  "treatmentDetails": {
    "name": "Stress Management Panchakarma Program",
    "type": "panchakarma",
    "startDate": "2024-02-01",
    "endDate": "2024-02-21",
    "totalDuration": 21,
    "totalSessions": 18
  },
  "treatmentPhases": {
    "purvakarma": {
      "duration": 5,
      "protocols": [
        "Pachana therapy",
        "Snehana (Abhyanga with Mahanarayana oil)",
        "Swedana (Steam therapy)"
      ],
      "objectives": ["Toxin mobilization", "Body preparation"]
    },
    "pradhanakarma": {
      "duration": 12,
      "protocols": [
        "Virechana (Purgation therapy)",
        "Basti (Medicated enema series)",
        "Nasya (Nasal administration)"
      ],
      "objectives": ["Primary detoxification", "Dosha balancing"]
    },
    "paschatkarma": {
      "duration": 4,
      "protocols": [
        "Samsarjana karma (Dietary rehabilitation)",
        "Rasayana therapy",
        "Lifestyle counseling"
      ],
      "objectives": ["Recovery", "Rejuvenation", "Prevention"]
    }
  },
  "expectedOutcomes": [
    "Stress level reduction by 60%",
    "Improved sleep quality",
    "Blood pressure normalization",
    "Enhanced energy levels"
  ],
  "contraindications": ["Severe hypertension", "Recent surgery"],
  "totalCost": 45000.00,
  "paymentPlan": "3 installments",
  "status": "planned",
  "createdDate": "2024-01-20T16:45:00Z"
}
```

### Sample Notification Template
```json
{
  "templateId": "NOTIF-TMPL-001",
  "templateName": "Appointment Reminder",
  "templateType": "appointment_reminder",
  "channels": ["SMS", "Email", "Push"],
  "priority": "medium",
  "timing": "2 hours before appointment",
  "templates": {
    "sms": {
      "message": "Hi {{patientName}}, this is a reminder that you have an appointment with {{practitionerName}} today at {{appointmentTime}}. Address: {{clinicAddress}}. For any queries, call {{clinicPhone}}."
    },
    "email": {
      "subject": "Appointment Reminder - {{appointmentDate}}",
      "body": "Dear {{patientName}},\n\nThis is a friendly reminder about your upcoming appointment:\n\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nPractitioner: {{practitionerName}}\nLocation: {{clinicAddress}}\n\nPreparation Instructions: {{preparationNotes}}\n\nPlease arrive 15 minutes early for check-in.\n\nThank you,\n{{clinicName}} Team"
    },
    "push": {
      "title": "Appointment Today",
      "body": "Your appointment with {{practitionerName}} is at {{appointmentTime}}. Tap for details."
    }
  }
}
```

---

## Implementation Roadmap for Hackathon Team

### Phase 1: Core Setup (Hours 0-8)
1. **Database Setup**
   - Create MySQL/PostgreSQL database
   - Implement core tables (Users, Patients, Practitioners, Appointments)
   - Set up basic relationships and constraints
   - Create sample data scripts

2. **Authentication System**
   - User registration/login API
   - JWT token implementation
   - Role-based access control
   - Password hashing and security

3. **Basic API Framework**
   - RESTful API structure
   - Request validation
   - Error handling
   - API documentation setup

### Phase 2: Core Features (Hours 8-16)
1. **Patient Management**
   - Registration workflow
   - Profile management API
   - Health data collection forms
   - Document upload functionality

2. **Practitioner Management**
   - Practitioner registration
   - Schedule management
   - Availability API

3. **Appointment System**
   - Booking workflow
   - Calendar integration
   - Conflict detection
   - Status management

### Phase 3: Treatment & Notifications (Hours 16-24)
1. **Treatment Planning**
   - Treatment plan creation
   - Session tracking
   - Progress monitoring

2. **Notification System**
   - Basic notification framework
   - SMS/Email integration
   - Reminder scheduling

3. **Frontend MVP**
   - Basic user interfaces
   - Mobile-responsive design
   - Core user journeys

### Phase 4: Enhancement & Polish (Hours 24-30)
1. **Feedback System**
   - Rating collection
   - Feedback forms
   - Basic analytics

2. **Reporting Dashboard**
   - Key metrics display
   - Basic charts and graphs

3. **Testing & Deployment**
   - API testing
   - End-to-end testing
   - Deployment setup

This comprehensive blueprint provides your hackathon team with everything needed to build a functional Panchakarma Management Software MVP. The modular approach allows for parallel development while ensuring all components integrate seamlessly.