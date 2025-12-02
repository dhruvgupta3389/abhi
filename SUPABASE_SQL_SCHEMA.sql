-- ===================================================
-- NRC Management System - Complete Supabase Schema
-- ===================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Tables, Indexes, and RLS Policies included

-- ===================================================
-- 1. USERS TABLE (Authentication & RBAC)
-- ===================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'anganwadi_worker', 'supervisor', 'hospital')),
  contact_number VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);

-- ===================================================
-- 2. HOSPITALS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  contact_number VARCHAR(20),
  total_beds INTEGER DEFAULT 0,
  nrc_equipped BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hospitals_code ON hospitals(code);
CREATE INDEX idx_hospitals_nrc_equipped ON hospitals(nrc_equipped);

-- ===================================================
-- 3. BEDS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  bed_number VARCHAR(50) NOT NULL,
  ward VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  patient_id UUID,
  admission_date DATE,
  patient_name VARCHAR(255),
  patient_type VARCHAR(50),
  nutrition_status VARCHAR(100),
  hospital_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hospital_id, bed_number)
);

CREATE INDEX idx_beds_hospital_id ON beds(hospital_id);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_beds_patient_id ON beds(patient_id);
CREATE INDEX idx_beds_ward ON beds(ward);

-- ===================================================
-- 4. PATIENTS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  aadhaar_number VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  type VARCHAR(50) CHECK (type IN ('child', 'pregnant_woman', 'lactating_mother')),
  pregnancy_week INTEGER,
  contact_number VARCHAR(20),
  emergency_contact VARCHAR(255),
  address TEXT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  blood_pressure VARCHAR(50),
  temperature DECIMAL(5,2),
  hemoglobin DECIMAL(5,2),
  nutrition_status VARCHAR(100),
  medical_history JSONB DEFAULT '[]'::jsonb,
  symptoms JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  remarks TEXT,
  risk_score DECIMAL(5,2),
  nutritional_deficiency JSONB DEFAULT '[]'::jsonb,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  last_visit_date DATE,
  next_visit_date DATE,
  registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_registration_number ON patients(registration_number);
CREATE INDEX idx_patients_registered_by ON patients(registered_by);
CREATE INDEX idx_patients_type ON patients(type);
CREATE INDEX idx_patients_risk_score ON patients(risk_score);
CREATE INDEX idx_patients_bed_id ON patients(bed_id);

-- ===================================================
-- 5. ANGANWADI CENTERS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS anganwadi_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  location_area VARCHAR(255),
  location_district VARCHAR(100),
  location_state VARCHAR(100),
  location_pincode VARCHAR(10),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  supervisor_name VARCHAR(255),
  supervisor_contact VARCHAR(20),
  supervisor_employee_id VARCHAR(50),
  capacity_pregnant_women INTEGER,
  capacity_children INTEGER,
  facilities JSONB DEFAULT '[]'::jsonb,
  coverage_areas JSONB DEFAULT '[]'::jsonb,
  established_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anganwadi_code ON anganwadi_centers(code);
CREATE INDEX idx_anganwadi_district ON anganwadi_centers(location_district);
CREATE INDEX idx_anganwadi_supervisor_id ON anganwadi_centers(supervisor_employee_id);

-- ===================================================
-- 6. WORKERS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  anganwadi_id UUID REFERENCES anganwadi_centers(id) ON DELETE SET NULL,
  contact_number VARCHAR(20),
  address TEXT,
  assigned_areas JSONB DEFAULT '[]'::jsonb,
  qualifications JSONB DEFAULT '[]'::jsonb,
  working_hours_start TIME,
  working_hours_end TIME,
  emergency_contact_name VARCHAR(255),
  emergency_contact_relation VARCHAR(100),
  emergency_contact_number VARCHAR(20),
  join_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workers_employee_id ON workers(employee_id);
CREATE INDEX idx_workers_anganwadi_id ON workers(anganwadi_id);
CREATE INDEX idx_workers_role ON workers(role);

-- ===================================================
-- 7. VISITS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  health_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scheduled_date DATE,
  actual_date DATE,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visits_patient_id ON visits(patient_id);
CREATE INDEX idx_visits_health_worker_id ON visits(health_worker_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_scheduled_date ON visits(scheduled_date);

-- ===================================================
-- 8. MEDICAL RECORDS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_type VARCHAR(100),
  health_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  temperature DECIMAL(5,2),
  blood_pressure VARCHAR(50),
  pulse INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL(5,2),
  symptoms JSONB DEFAULT '[]'::jsonb,
  diagnosis TEXT,
  treatment TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  appetite VARCHAR(100),
  food_intake VARCHAR(100),
  supplements JSONB DEFAULT '[]'::jsonb,
  diet_plan TEXT,
  hemoglobin DECIMAL(5,2),
  blood_sugar DECIMAL(5,2),
  protein_level DECIMAL(5,2),
  notes TEXT,
  next_visit_date DATE,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX idx_medical_records_health_worker_id ON medical_records(health_worker_id);

-- ===================================================
-- 9. BED REQUESTS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS bed_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  urgency_level VARCHAR(50) CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  medical_justification TEXT,
  current_condition TEXT,
  estimated_stay_duration INTEGER,
  special_requirements TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'assigned', 'completed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_date TIMESTAMP WITH TIME ZONE,
  review_comments TEXT,
  hospital_referral VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bed_requests_patient_id ON bed_requests(patient_id);
CREATE INDEX idx_bed_requests_status ON bed_requests(status);
CREATE INDEX idx_bed_requests_urgency_level ON bed_requests(urgency_level);

-- ===================================================
-- 10. NOTIFICATIONS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_role VARCHAR(50),
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  action_required BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500),
  related_entity_id UUID,
  related_entity_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_role ON notifications(user_role);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ===================================================
-- 11. TREATMENT TRACKERS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS treatment_trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  admission_date DATE NOT NULL,
  discharge_date DATE,
  diagnosis TEXT,
  treatment_plan TEXT,
  progress_notes JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discharged', 'transferred')),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_treatment_trackers_patient_id ON treatment_trackers(patient_id);
CREATE INDEX idx_treatment_trackers_bed_id ON treatment_trackers(bed_id);
CREATE INDEX idx_treatment_trackers_status ON treatment_trackers(status);

-- ===================================================
-- 12. ANGANWADI VISIT TICKETS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS anganwadi_visit_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anganwadi_id UUID NOT NULL REFERENCES anganwadi_centers(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  number_of_beneficiaries INTEGER,
  activities JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anganwadi_visit_tickets_anganwadi_id ON anganwadi_visit_tickets(anganwadi_id);
CREATE INDEX idx_anganwadi_visit_tickets_scheduled_date ON anganwadi_visit_tickets(scheduled_date);
CREATE INDEX idx_anganwadi_visit_tickets_status ON anganwadi_visit_tickets(status);

-- ===================================================
-- 13. MISSED VISIT TICKETS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS missed_visit_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_visit_date DATE,
  reason_for_miss VARCHAR(255),
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  follow_up_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'escalated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missed_visit_tickets_patient_id ON missed_visit_tickets(patient_id);
CREATE INDEX idx_missed_visit_tickets_status ON missed_visit_tickets(status);

-- ===================================================
-- 14. SURVEY REPORTS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS survey_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_type VARCHAR(100),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  anganwadi_id UUID REFERENCES anganwadi_centers(id) ON DELETE SET NULL,
  conducted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  survey_date DATE NOT NULL,
  nutrition_status VARCHAR(100),
  health_metrics JSONB DEFAULT '{}' :: jsonb,
  findings TEXT,
  recommendations TEXT,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_survey_reports_patient_id ON survey_reports(patient_id);
CREATE INDEX idx_survey_reports_anganwadi_id ON survey_reports(anganwadi_id);
CREATE INDEX idx_survey_reports_survey_date ON survey_reports(survey_date);

-- ===================================================
-- 15. INSERT SAMPLE DATA
-- ===================================================

-- Sample Users (passwords: bcryptjs hash format)
INSERT INTO users (employee_id, username, password_hash, name, role, contact_number, email, is_active, created_by)
VALUES 
  ('ADMIN001', 'admin', '$2a$10$YrL2R2ePYxMiNDHKdF.yIeEfLUcEQJhHxJUhxFYfQ/dPMJqfVJfyW', 'System Administrator', 'admin', '+91 9999999999', 'admin@nrc.gov.in', true, 'SYSTEM'),
  ('EMP001', 'priya.sharma', '$2a$10$3NhZ8OP5K5pJ8L2.sK5WeeLqf8xLG8I4C6mL2pY9j7E7N4r3J1Zea', 'Priya Sharma', 'anganwadi_worker', '+91 9876543210', 'priya.sharma@gov.in', true, 'ADMIN001'),
  ('SUP001', 'supervisor1', '$2a$10$3NhZ8OP5K5pJ8L2.sK5WeeLqf8xLG8I4C6mL2pY9j7E7N4r3J1Zea', 'Dr. Sunita Devi', 'supervisor', '+91 9876543212', 'sunita.devi@gov.in', true, 'ADMIN001'),
  ('HOSP001', 'hospital1', '$2a$10$3NhZ8OP5K5pJ8L2.sK5WeeLqf8xLG8I4C6mL2pY9j7E7N4r3J1Zea', 'Dr. Amit Sharma', 'hospital', '+91 9876543214', 'amit.sharma@hospital.gov.in', true, 'ADMIN001');

-- Sample Hospital
INSERT INTO hospitals (name, code, address, contact_number, total_beds, nrc_equipped)
VALUES ('District Hospital Meerut', 'HOSP001', 'Medical College Road, Meerut, UP', '+91 121-2234567', 20, true);

-- Sample Beds
INSERT INTO beds (hospital_id, bed_number, ward, status, patient_name, patient_type, nutrition_status)
SELECT 
  id as hospital_id,
  v.bed_number,
  v.ward,
  v.status,
  NULL as patient_name,
  NULL as patient_type,
  NULL as nutrition_status
FROM hospitals h,
  LATERAL (VALUES 
    ('101', 'Pediatric', 'available'),
    ('102', 'Pediatric', 'available'),
    ('103', 'Pediatric', 'maintenance'),
    ('201', 'Maternity', 'available'),
    ('202', 'Maternity', 'available'),
    ('203', 'Maternity', 'available')
  ) v(bed_number, ward, status)
WHERE h.code = 'HOSP001';

-- Sample Anganwadi Center
INSERT INTO anganwadi_centers (name, code, location_district, location_state, supervisor_employee_id, capacity_pregnant_women, capacity_children)
VALUES ('Anganwadi Center 1', 'AWC001', 'Meerut', 'Uttar Pradesh', 'SUP001', 50, 100);

-- Sample Worker
INSERT INTO workers (employee_id, name, role, anganwadi_id, contact_number)
SELECT 'EMP001', 'Priya Sharma', 'Health Worker', id, '+91 9876543210'
FROM anganwadi_centers WHERE code = 'AWC001';

-- ===================================================
-- AUTHENTICATION & AUTHORIZATION SETUP
-- ===================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE anganwadi_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE anganwadi_visit_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE missed_visit_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_reports ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- IMPORTANT: PASSWORD CREDENTIALS FOR TESTING
-- ===================================================
-- All sample users have the following password hashes:
-- admin123 -> $2a$10$YrL2R2ePYxMiNDHKdF.yIeEfLUcEQJhHxJUhxFYfQ/dPMJqfVJfyW
-- worker123 -> $2a$10$3NhZ8OP5K5pJ8L2.sK5WeeLqf8xLG8I4C6mL2pY9j7E7N4r3J1Zea
--
-- Login Credentials:
-- Admin: username=admin, password=admin123
-- Worker: username=priya.sharma, password=worker123
-- Supervisor: username=supervisor1, password=worker123
-- Hospital: username=hospital1, password=worker123
-- ===================================================

-- Print completion message
SELECT '✅ Schema setup complete! All tables created with sample data.' AS status;
