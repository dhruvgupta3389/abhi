-- NRC Management System - Complete Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgsql-http";

-- ============================================
-- 1. HOSPITALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  contact_number VARCHAR(20),
  total_beds INTEGER DEFAULT 0,
  nrc_equipped BOOLEAN DEFAULT true,
  state VARCHAR(100),
  district VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hospitals_code ON hospitals(code);

-- ============================================
-- 2. WARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  ward_type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wards_hospital_id ON wards(hospital_id);

-- ============================================
-- 3. USERS TABLE (Authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'anganwadi_worker', 'supervisor', 'hospital')),
  contact_number VARCHAR(20),
  email VARCHAR(255),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_hospital_id ON users(hospital_id);

-- ============================================
-- 4. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  aadhaar_number VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  type VARCHAR(20) NOT NULL CHECK (type IN ('child', 'pregnant')),
  pregnancy_week INTEGER,
  contact_number VARCHAR(20),
  emergency_contact VARCHAR(255),
  address TEXT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  blood_pressure VARCHAR(20),
  temperature DECIMAL(4,2),
  hemoglobin DECIMAL(5,2),
  nutrition_status VARCHAR(50) NOT NULL CHECK (nutrition_status IN ('normal', 'malnourished', 'severely_malnourished')),
  medical_history TEXT,
  symptoms TEXT,
  documents TEXT,
  photos TEXT,
  remarks TEXT,
  risk_score DECIMAL(5,2),
  nutritional_deficiency TEXT,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  last_visit_date TIMESTAMP,
  next_visit_date TIMESTAMP,
  registered_by VARCHAR(255),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_registration_number ON patients(registration_number);
CREATE INDEX idx_patients_aadhaar_number ON patients(aadhaar_number);
CREATE INDEX idx_patients_bed_id ON patients(bed_id);
CREATE INDEX idx_patients_nutrition_status ON patients(nutrition_status);

-- ============================================
-- 5. BEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  number VARCHAR(20) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  admission_date TIMESTAMP,
  discharge_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hospital_id, ward, number)
);

CREATE INDEX idx_beds_hospital_id ON beds(hospital_id);
CREATE INDEX idx_beds_ward_id ON beds(ward_id);
CREATE INDEX idx_beds_patient_id ON beds(patient_id);
CREATE INDEX idx_beds_status ON beds(status);

-- ============================================
-- 6. BED REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bed_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  requested_by VARCHAR(255),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  urgency_level VARCHAR(50) NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  medical_justification TEXT,
  current_condition TEXT,
  estimated_stay_duration INTEGER,
  special_requirements TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'cancelled')),
  reviewed_by VARCHAR(255),
  review_date TIMESTAMP,
  review_comments TEXT,
  hospital_referral JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bed_requests_patient_id ON bed_requests(patient_id);
CREATE INDEX idx_bed_requests_status ON bed_requests(status);
CREATE INDEX idx_bed_requests_urgency_level ON bed_requests(urgency_level);

-- ============================================
-- 7. VISITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  health_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP,
  actual_date TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visits_patient_id ON visits(patient_id);
CREATE INDEX idx_visits_health_worker_id ON visits(health_worker_id);
CREATE INDEX idx_visits_status ON visits(status);

-- ============================================
-- 8. MEDICAL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('routine', 'emergency', 'follow_up', 'admission', 'discharge')),
  health_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  temperature DECIMAL(4,2),
  blood_pressure VARCHAR(20),
  pulse INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL(4,2),
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medications JSONB,
  appetite VARCHAR(50),
  food_intake VARCHAR(50),
  supplements TEXT,
  diet_plan TEXT,
  hemoglobin DECIMAL(5,2),
  blood_sugar DECIMAL(5,2),
  protein_level DECIMAL(5,2),
  notes TEXT,
  next_visit_date TIMESTAMP,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_health_worker_id ON medical_records(health_worker_id);
CREATE INDEX idx_medical_records_visit_type ON medical_records(visit_type);

-- ============================================
-- 9. ANGANWADI CENTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS anganwadi_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  location_area VARCHAR(100),
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
  facilities TEXT,
  coverage_areas TEXT,
  established_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anganwadi_code ON anganwadi_centers(code);
CREATE INDEX idx_anganwadi_district ON anganwadi_centers(location_district);

-- ============================================
-- 10. WORKERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('head', 'supervisor', 'helper', 'asha')),
  anganwadi_id UUID REFERENCES anganwadi_centers(id) ON DELETE SET NULL,
  contact_number VARCHAR(20),
  address TEXT,
  assigned_areas TEXT,
  qualifications TEXT,
  working_hours_start VARCHAR(5),
  working_hours_end VARCHAR(5),
  emergency_contact_name VARCHAR(255),
  emergency_contact_relation VARCHAR(100),
  emergency_contact_number VARCHAR(20),
  join_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workers_employee_id ON workers(employee_id);
CREATE INDEX idx_workers_anganwadi_id ON workers(anganwadi_id);

-- ============================================
-- 11. SURVEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  survey_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observations TEXT,
  appetite VARCHAR(50),
  food_intake VARCHAR(50),
  supplements TEXT,
  symptoms TEXT,
  recommendations TEXT,
  health_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_surveys_patient_id ON surveys(patient_id);
CREATE INDEX idx_surveys_health_worker_id ON surveys(health_worker_id);

-- ============================================
-- 12. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_role VARCHAR(50),
  notification_type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  action_required BOOLEAN DEFAULT false,
  read_status BOOLEAN DEFAULT false,
  notification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_role ON notifications(user_role);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);

-- ============================================
-- 13. TREATMENT TRACKERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  admission_date TIMESTAMP NOT NULL,
  treatment_plan TEXT,
  medicine_schedule JSONB,
  doctor_remarks TEXT,
  daily_progress JSONB,
  lab_reports JSONB,
  discharge_date TIMESTAMP,
  discharge_summary JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_treatment_trackers_patient_id ON treatment_trackers(patient_id);
CREATE INDEX idx_treatment_trackers_hospital_id ON treatment_trackers(hospital_id);

-- ============================================
-- 14. VISIT TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS visit_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anganwadi_id UUID NOT NULL REFERENCES anganwadi_centers(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP,
  scheduled_time VARCHAR(5),
  assigned_area VARCHAR(255),
  visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('routine_checkup', 'nutrition_survey', 'vaccination', 'emergency', 'follow_up')),
  target_beneficiaries_pregnant_women INTEGER,
  target_beneficiaries_children INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled')),
  reported_by VARCHAR(255),
  reported_date TIMESTAMP,
  escalation_level VARCHAR(50) DEFAULT 'none' CHECK (escalation_level IN ('none', 'anganwadi', 'district', 'state')),
  activities_completed TEXT,
  issues_encountered TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visit_tickets_anganwadi_id ON visit_tickets(anganwadi_id);
CREATE INDEX idx_visit_tickets_worker_id ON visit_tickets(worker_id);
CREATE INDEX idx_visit_tickets_status ON visit_tickets(status);

-- ============================================
-- 15. MISSED VISIT TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS missed_visit_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  date_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reported_by VARCHAR(255),
  missed_conditions JSONB,
  attempt_details JSONB,
  patient_condition_health_status VARCHAR(255),
  patient_condition_urgency_level VARCHAR(50),
  patient_condition_visible_symptoms TEXT,
  patient_condition_family_concerns TEXT,
  actions_taken TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  next_attempt_date TIMESTAMP,
  supervisor_notified BOOLEAN DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
  escalation_level VARCHAR(50) DEFAULT 'none' CHECK (escalation_level IN ('none', 'anganwadi', 'district', 'state')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missed_visit_tickets_patient_id ON missed_visit_tickets(patient_id);
CREATE INDEX idx_missed_visit_tickets_visit_id ON missed_visit_tickets(visit_id);
CREATE INDEX idx_missed_visit_tickets_status ON missed_visit_tickets(status);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON wards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bed_requests_updated_at BEFORE UPDATE ON bed_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anganwadi_centers_updated_at BEFORE UPDATE ON anganwadi_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_trackers_updated_at BEFORE UPDATE ON treatment_trackers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visit_tickets_updated_at BEFORE UPDATE ON visit_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missed_visit_tickets_updated_at BEFORE UPDATE ON missed_visit_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA
-- ============================================
INSERT INTO hospitals (name, code, address, contact_number, total_beds, nrc_equipped, state, district)
VALUES ('District Hospital Meerut', 'HOSP001', 'Medical College Road, Meerut, UP', '+91 121-2234567', 20, true, 'Uttar Pradesh', 'Meerut')
ON CONFLICT (code) DO NOTHING;

INSERT INTO wards (hospital_id, name, ward_type, capacity)
SELECT h.id, 'Pediatric Ward', 'pediatric', 10 FROM hospitals h WHERE h.code = 'HOSP001'
ON CONFLICT DO NOTHING;

INSERT INTO wards (hospital_id, name, ward_type, capacity)
SELECT h.id, 'Maternity Ward', 'maternity', 10 FROM hospitals h WHERE h.code = 'HOSP001'
ON CONFLICT DO NOTHING;
