# SQL Commands Reference - Complete

This document provides all SQL queries you might need to manage your Supabase database.

---

## 🚀 INITIAL SETUP (RUN THESE FIRST)

### 1. Create All Tables (MUST RUN FIRST)

Copy the entire content of `SUPABASE_SQL_SCHEMA.sql` and run it in Supabase SQL Editor.

```sql
-- This file creates 14 tables with all necessary columns, indexes, and sample data
-- File: SUPABASE_SQL_SCHEMA.sql
-- Action: Copy entire file → Paste in SQL Editor → Click Run
```

### 2. Add Security Policies (Optional but Recommended)

Copy the entire content of `SUPABASE_RLS_POLICIES.sql` and run it in Supabase SQL Editor.

```sql
-- This file adds row-level security policies
-- File: SUPABASE_RLS_POLICIES.sql
-- Action: Copy entire file → Paste in SQL Editor → Click Run
```

---

## 📊 VERIFICATION QUERIES

### Check if Tables Created Successfully

```sql
-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: 14 tables (users, patients, beds, hospitals, etc.)
```

### Verify Sample Data

```sql
-- Check users created
SELECT employee_id, username, name, role, is_active FROM users;

-- Check hospitals created
SELECT name, code, total_beds FROM hospitals;

-- Check beds created
SELECT bed_number, ward, status FROM beds LIMIT 10;
```

---

## 👥 USER MANAGEMENT

### Create New User

```sql
-- Insert new user (password should be bcryptjs hash)
INSERT INTO users (
  employee_id, username, password_hash, name, role, 
  contact_number, email, is_active, created_by
)
VALUES (
  'EMP002',
  'new.worker',
  '$2a$10$[HASH_HERE]', -- Use bcryptjs hashed password
  'New Worker Name',
  'anganwadi_worker',
  '+91 9876543210',
  'new.worker@example.com',
  true,
  'ADMIN001'
);
```

### List All Users

```sql
SELECT 
  id, employee_id, username, name, role, 
  contact_number, email, is_active, created_at
FROM users
ORDER BY created_at DESC;
```

### List Users by Role

```sql
SELECT * FROM users WHERE role = 'anganwadi_worker';
SELECT * FROM users WHERE role = 'supervisor';
SELECT * FROM users WHERE role = 'hospital';
SELECT * FROM users WHERE role = 'admin';
```

### Deactivate User

```sql
UPDATE users 
SET is_active = false, updated_at = NOW()
WHERE employee_id = 'EMP001';
```

### Update User Password

```sql
-- First hash the password with bcryptjs, then update
UPDATE users
SET password_hash = '$2a$10$[NEW_HASH_HERE]', updated_at = NOW()
WHERE employee_id = 'EMP001';
```

---

## 🏥 HOSPITAL MANAGEMENT

### Add New Hospital

```sql
INSERT INTO hospitals (name, code, address, contact_number, total_beds, nrc_equipped)
VALUES (
  'City Medical Center',
  'HOSP002',
  '789 Hospital Avenue, City',
  '+91 1122334455',
  75,
  true
);
```

### List All Hospitals

```sql
SELECT id, name, code, address, contact_number, total_beds, nrc_equipped, created_at
FROM hospitals
ORDER BY name;
```

### Get Hospital with Bed Count

```sql
SELECT 
  h.id, h.name, h.code, 
  COUNT(b.id) as total_beds,
  SUM(CASE WHEN b.status = 'available' THEN 1 ELSE 0 END) as available_beds,
  SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) as occupied_beds
FROM hospitals h
LEFT JOIN beds b ON h.id = b.hospital_id
GROUP BY h.id, h.name, h.code
ORDER BY h.name;
```

---

## 🛏️ BED MANAGEMENT

### Add Beds to Hospital

```sql
-- Get hospital ID first
SELECT id FROM hospitals WHERE code = 'HOSP001';

-- Then insert beds (replace HOSPITAL_ID with actual UUID)
INSERT INTO beds (hospital_id, bed_number, ward, status)
VALUES 
  ('HOSPITAL_ID', '101', 'Pediatric', 'available'),
  ('HOSPITAL_ID', '102', 'Pediatric', 'available'),
  ('HOSPITAL_ID', '103', 'Maternity', 'available'),
  ('HOSPITAL_ID', '201', 'Maternity', 'available');
```

### List Available Beds

```sql
SELECT 
  b.id, h.name as hospital_name, b.bed_number, b.ward, b.status
FROM beds b
JOIN hospitals h ON b.hospital_id = h.id
WHERE b.status = 'available'
ORDER BY h.name, b.bed_number;
```

### List Occupied Beds with Patient Info

```sql
SELECT 
  b.id, h.name as hospital_name, b.bed_number, b.ward,
  b.patient_name, b.patient_type, b.nutrition_status,
  b.admission_date
FROM beds b
JOIN hospitals h ON b.hospital_id = h.id
WHERE b.status = 'occupied'
ORDER BY h.name, b.bed_number;
```

### Update Bed Status

```sql
-- Mark bed as occupied
UPDATE beds
SET status = 'occupied', 
    patient_name = 'John Doe',
    patient_type = 'child',
    admission_date = CURRENT_DATE,
    updated_at = NOW()
WHERE id = 'BED_UUID_HERE';

-- Mark bed as available
UPDATE beds
SET status = 'available',
    patient_name = NULL,
    patient_type = NULL,
    updated_at = NOW()
WHERE id = 'BED_UUID_HERE';

-- Mark bed for maintenance
UPDATE beds
SET status = 'maintenance', updated_at = NOW()
WHERE id = 'BED_UUID_HERE';
```

### Get Bed Occupancy Rate

```sql
SELECT 
  h.name as hospital,
  COUNT(b.id) as total_beds,
  SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) as occupied,
  SUM(CASE WHEN b.status = 'available' THEN 1 ELSE 0 END) as available,
  SUM(CASE WHEN b.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
  ROUND(
    100.0 * SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) / COUNT(b.id), 2
  ) as occupancy_rate_percent
FROM beds b
JOIN hospitals h ON b.hospital_id = h.id
GROUP BY h.id, h.name
ORDER BY h.name;
```

---

## 👶 PATIENT MANAGEMENT

### Register New Patient

```sql
-- Get worker ID first
SELECT id FROM users WHERE employee_id = 'EMP001';

INSERT INTO patients (
  registration_number, aadhaar_number, name, age, type, 
  contact_number, emergency_contact, address,
  weight, height, nutrition_status,
  registered_by, is_active
)
VALUES (
  'REG-' || EXTRACT(EPOCH FROM NOW())::text,
  '1234567890123456',
  'Priya Kumari',
  4,
  'child',
  '+91 9876543210',
  '+91 9876543211',
  'Village ABC, District XYZ, State India',
  12.5,
  100,
  'malnourished',
  'WORKER_UUID_HERE',
  true
);
```

### List All Patients

```sql
SELECT 
  registration_number, name, age, type, contact_number,
  nutrition_status, risk_score, created_at
FROM patients
WHERE is_active = true
ORDER BY created_at DESC;
```

### List Patients by Nutrition Status

```sql
SELECT 
  registration_number, name, age, nutrition_status, risk_score
FROM patients
WHERE is_active = true 
  AND nutrition_status = 'severely_malnourished'
ORDER BY risk_score DESC;
```

### List Patients Registered by Worker

```sql
SELECT 
  p.registration_number, p.name, p.age, p.type, p.nutrition_status,
  u.name as registered_by
FROM patients p
JOIN users u ON p.registered_by = u.id
WHERE u.employee_id = 'EMP001'
  AND p.is_active = true
ORDER BY p.created_at DESC;
```

### Update Patient Information

```sql
UPDATE patients
SET 
  weight = 13.2,
  height = 102,
  nutrition_status = 'normal',
  next_visit_date = CURRENT_DATE + INTERVAL '7 days',
  updated_at = NOW()
WHERE registration_number = 'REG-1234567890';
```

### Get Patients Due for Visit

```sql
SELECT 
  registration_number, name, age, next_visit_date
FROM patients
WHERE is_active = true
  AND next_visit_date <= CURRENT_DATE
  AND next_visit_date IS NOT NULL
ORDER BY next_visit_date ASC;
```

### Get High-Risk Patients

```sql
SELECT 
  registration_number, name, age, type,
  nutrition_status, risk_score, created_at
FROM patients
WHERE is_active = true
  AND risk_score >= 7
ORDER BY risk_score DESC;
```

### Soft Delete Patient

```sql
UPDATE patients
SET is_active = false, updated_at = NOW()
WHERE registration_number = 'REG-1234567890';
```

---

## 📋 MEDICAL RECORDS

### Create Medical Record

```sql
INSERT INTO medical_records (
  patient_id, visit_date, visit_type, health_worker_id,
  weight, height, temperature, blood_pressure,
  hemoglobin, symptoms, diagnosis, treatment,
  next_visit_date, follow_up_required
)
VALUES (
  'PATIENT_UUID',
  CURRENT_DATE,
  'routine',
  'WORKER_UUID',
  13.2,
  102,
  37.2,
  '90/60',
  11.5,
  '["fever", "cough"]'::jsonb,
  'Common cold with malnutrition',
  'Nutrition supplements + rest',
  CURRENT_DATE + INTERVAL '7 days',
  true
);
```

### View Patient Medical History

```sql
SELECT 
  visit_date, visit_type, weight, height, temperature,
  blood_pressure, hemoglobin, diagnosis, treatment,
  follow_up_required
FROM medical_records
WHERE patient_id = 'PATIENT_UUID'
ORDER BY visit_date DESC;
```

### Get Follow-up Needed Records

```sql
SELECT 
  p.registration_number, p.name, m.visit_date,
  m.diagnosis, m.next_visit_date
FROM medical_records m
JOIN patients p ON m.patient_id = p.id
WHERE m.follow_up_required = true
  AND m.next_visit_date <= CURRENT_DATE
ORDER BY m.next_visit_date ASC;
```

---

## 🛏️ BED REQUESTS

### Create Bed Request

```sql
INSERT INTO bed_requests (
  patient_id, requested_by, urgency_level,
  medical_justification, current_condition,
  estimated_stay_duration, status
)
VALUES (
  'PATIENT_UUID',
  'WORKER_UUID',
  'high',
  'Severe malnutrition requiring hospitalization',
  'Child with severe nutritional deficiency',
  14,
  'pending'
);
```

### View Pending Bed Requests

```sql
SELECT 
  br.id, p.registration_number, p.name, p.age,
  br.urgency_level, br.medical_justification,
  br.request_date, br.status
FROM bed_requests br
JOIN patients p ON br.patient_id = p.id
WHERE br.status = 'pending'
ORDER BY br.urgency_level DESC, br.request_date ASC;
```

### Approve Bed Request

```sql
UPDATE bed_requests
SET 
  status = 'approved',
  reviewed_by = 'REVIEWER_UUID',
  review_date = NOW(),
  review_comments = 'Approved for admission to pediatric ward'
WHERE id = 'REQUEST_UUID';
```

### Get Bed Request Statistics

```sql
SELECT 
  status, 
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE urgency_level = 'critical') as critical,
  COUNT(*) FILTER (WHERE urgency_level = 'high') as high,
  COUNT(*) FILTER (WHERE urgency_level = 'medium') as medium,
  COUNT(*) FILTER (WHERE urgency_level = 'low') as low
FROM bed_requests
WHERE request_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY status;
```

---

## 📢 NOTIFICATIONS

### Create Notification for User

```sql
INSERT INTO notifications (
  user_id, user_role, type, title, message,
  priority, action_required, is_read
)
VALUES (
  'USER_UUID',
  'anganwadi_worker',
  'patient_registered',
  'New Patient Registered',
  'Patient John Doe has been successfully registered',
  'normal',
  false,
  false
);
```

### Create Role-Based Notification

```sql
INSERT INTO notifications (
  user_role, type, title, message,
  priority, action_required, is_read
)
VALUES (
  'supervisor',
  'bed_request',
  'New Bed Request',
  'A new bed request requires your approval',
  'high',
  true,
  false
);
```

### Get Unread Notifications

```sql
SELECT 
  id, title, message, priority, action_required,
  created_at
FROM notifications
WHERE user_id = 'USER_UUID'
  AND is_read = false
ORDER BY created_at DESC;
```

### Mark Notification as Read

```sql
UPDATE notifications
SET 
  is_read = true,
  read_at = NOW(),
  updated_at = NOW()
WHERE id = 'NOTIFICATION_UUID';
```

### Mark All Notifications as Read

```sql
UPDATE notifications
SET 
  is_read = true,
  read_at = NOW(),
  updated_at = NOW()
WHERE user_id = 'USER_UUID'
  AND is_read = false;
```

### Get Notifications by Priority

```sql
SELECT 
  title, message, priority, action_required, created_at
FROM notifications
WHERE user_id = 'USER_UUID'
  AND priority IN ('high', 'critical')
  AND is_read = false
ORDER BY created_at DESC;
```

---

## 🏥 ANGANWADI CENTERS

### Add Anganwadi Center

```sql
INSERT INTO anganwadi_centers (
  name, code, location_area, location_district, 
  location_state, location_pincode,
  latitude, longitude, supervisor_employee_id,
  capacity_pregnant_women, capacity_children,
  established_date, is_active
)
VALUES (
  'Anganwadi Center - Village ABC',
  'AWC001',
  'Area 1',
  'District X',
  'State Y',
  '123456',
  28.6139,
  77.2090,
  'SUP001',
  50,
  100,
  '2020-01-15'::date,
  true
);
```

### List All Active Anganwadi Centers

```sql
SELECT 
  name, code, location_district, location_state,
  supervisor_employee_id, capacity_pregnant_women,
  capacity_children, established_date
FROM anganwadi_centers
WHERE is_active = true
ORDER BY location_district, name;
```

---

## 👥 WORKERS

### Add Worker to Anganwadi

```sql
INSERT INTO workers (
  employee_id, name, role, anganwadi_id,
  contact_number, address,
  join_date, is_active
)
VALUES (
  'EMP002',
  'Sangeeta Devi',
  'health_worker',
  'ANGANWADI_UUID',
  '+91 9876543210',
  'Village ABC, District XYZ',
  CURRENT_DATE,
  true
);
```

### List Workers by Anganwadi

```sql
SELECT 
  w.employee_id, w.name, w.role, w.contact_number,
  ac.name as anganwadi_name
FROM workers w
LEFT JOIN anganwadi_centers ac ON w.anganwadi_id = ac.id
WHERE ac.code = 'AWC001'
ORDER BY w.name;
```

---

## 📊 REPORTING QUERIES

### Patient Registration by Month

```sql
SELECT 
  DATE_TRUNC('month', created_at)::date as month,
  COUNT(*) as total_patients,
  SUM(CASE WHEN type = 'child' THEN 1 ELSE 0 END) as children,
  SUM(CASE WHEN type = 'pregnant_woman' THEN 1 ELSE 0 END) as pregnant_women
FROM patients
WHERE is_active = true
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Nutrition Status Distribution

```sql
SELECT 
  nutrition_status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM patients
WHERE is_active = true
GROUP BY nutrition_status
ORDER BY count DESC;
```

### Average Metrics by Age Group

```sql
SELECT 
  CASE 
    WHEN age < 2 THEN 'Under 2'
    WHEN age < 5 THEN '2-4'
    WHEN age < 10 THEN '5-9'
    ELSE '10+'
  END as age_group,
  COUNT(*) as count,
  ROUND(AVG(weight), 2) as avg_weight,
  ROUND(AVG(height), 2) as avg_height,
  ROUND(AVG(hemoglobin), 2) as avg_hemoglobin
FROM patients
WHERE is_active = true
GROUP BY age_group
ORDER BY age_group;
```

### Visit Completion Rate

```sql
SELECT 
  CASE 
    WHEN status = 'completed' THEN 'Completed'
    WHEN status = 'scheduled' THEN 'Scheduled'
    WHEN status = 'missed' THEN 'Missed'
    WHEN status = 'cancelled' THEN 'Cancelled'
    ELSE status
  END as status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM visits
WHERE scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY status
ORDER BY count DESC;
```

---

## 🔧 DATABASE MAINTENANCE

### Check Table Sizes

```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### List All Indexes

```sql
SELECT 
  tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check Foreign Key Relationships

```sql
SELECT 
  constraint_name, table_name, column_name,
  referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
AND referenced_table_name IS NOT NULL
ORDER BY table_name, constraint_name;
```

### View Row Counts

```sql
SELECT 
  tablename,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🚨 IMPORTANT NOTES

1. Replace `PLACEHOLDER_UUID` with actual UUIDs from your database
2. Always test queries in Supabase SQL Editor first
3. Use transactions for critical operations
4. Keep backups before major changes
5. Check RLS policies before querying (if enabled)

---

**Last Updated**: 2024  
**Database**: Supabase PostgreSQL  
**Application**: NRC Management System
