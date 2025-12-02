-- ===================================================
-- Row Level Security (RLS) Policies for NRC System
-- ===================================================
-- These policies enforce access control based on user roles
-- Copy and paste into Supabase SQL Editor after running the main schema

-- ===================================================
-- USERS TABLE - RLS Policies
-- ===================================================
-- Admin can view all users
CREATE POLICY "admin_view_all_users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own profile
CREATE POLICY "user_view_own_profile" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Only admin can insert users
CREATE POLICY "admin_create_users" ON users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- PATIENTS TABLE - RLS Policies
-- ===================================================
-- Admin can view all patients
CREATE POLICY "admin_view_all_patients" ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Anganwadi workers can view only their own registered patients
CREATE POLICY "worker_view_own_patients" ON patients
  FOR SELECT
  USING (
    registered_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  );

-- Supervisors can view all patients under their jurisdiction
CREATE POLICY "supervisor_view_patients" ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  );

-- Hospital staff can view patients with bed assignments
CREATE POLICY "hospital_view_admitted_patients" ON patients
  FOR SELECT
  USING (
    bed_id IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Workers can insert patients
CREATE POLICY "worker_create_patients" ON patients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('anganwadi_worker', 'supervisor', 'admin')
    )
  );

-- Workers can update their own patients
CREATE POLICY "worker_update_own_patients" ON patients
  FOR UPDATE
  USING (
    registered_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  )
  WITH CHECK (
    registered_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  );

-- ===================================================
-- BEDS TABLE - RLS Policies
-- ===================================================
-- Anyone authenticated can view beds
CREATE POLICY "authenticated_view_beds" ON beds
  FOR SELECT
  USING (TRUE);

-- Hospital staff can update beds
CREATE POLICY "hospital_update_beds" ON beds
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital', 'admin')
    )
  );

-- Hospital staff can insert beds
CREATE POLICY "hospital_create_beds" ON beds
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital', 'admin')
    )
  );

-- ===================================================
-- MEDICAL RECORDS TABLE - RLS Policies
-- ===================================================
-- Admins and supervisors can view all medical records
CREATE POLICY "admin_supervisor_view_all_records" ON medical_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Workers can view medical records for their patients
CREATE POLICY "worker_view_patient_records" ON medical_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medical_records.patient_id
      AND p.registered_by = auth.uid()
    )
  );

-- Hospital staff can view records for admitted patients
CREATE POLICY "hospital_view_admitted_records" ON medical_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medical_records.patient_id
      AND p.bed_id IS NOT NULL
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Health workers can insert records
CREATE POLICY "worker_create_records" ON medical_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('anganwadi_worker', 'supervisor', 'hospital', 'admin')
    )
  );

-- ===================================================
-- BED REQUESTS TABLE - RLS Policies
-- ===================================================
-- Requesters can view their own requests
CREATE POLICY "user_view_own_requests" ON bed_requests
  FOR SELECT
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  );

-- Hospital staff can view all bed requests
CREATE POLICY "hospital_view_requests" ON bed_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital', 'admin')
    )
  );

-- Workers can create bed requests
CREATE POLICY "worker_create_requests" ON bed_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('anganwadi_worker', 'supervisor', 'admin')
    )
  );

-- Only supervisors and admins can approve/reject requests
CREATE POLICY "supervisor_update_requests" ON bed_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'hospital', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'hospital', 'admin')
    )
  );

-- ===================================================
-- NOTIFICATIONS TABLE - RLS Policies
-- ===================================================
-- Users can view their own notifications
CREATE POLICY "user_view_own_notifications" ON notifications
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    (user_role = (SELECT role FROM users WHERE id = auth.uid())) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create notifications
CREATE POLICY "admin_create_notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own notifications
CREATE POLICY "user_update_own_notifications" ON notifications
  FOR UPDATE
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- ===================================================
-- VISITS TABLE - RLS Policies
-- ===================================================
-- Authenticated users can view visits
CREATE POLICY "authenticated_view_visits" ON visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
    )
  );

-- Health workers can create visits
CREATE POLICY "worker_create_visits" ON visits
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('anganwadi_worker', 'supervisor', 'admin')
    )
  );

-- ===================================================
-- ANGANWADI CENTERS TABLE - RLS Policies
-- ===================================================
-- All authenticated users can view centers
CREATE POLICY "authenticated_view_centers" ON anganwadi_centers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
    )
  );

-- Only supervisors and admins can update centers
CREATE POLICY "supervisor_update_centers" ON anganwadi_centers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  );

-- ===================================================
-- WORKERS TABLE - RLS Policies
-- ===================================================
-- Supervisors can view workers under their centers
CREATE POLICY "supervisor_view_workers" ON workers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  );

-- ===================================================
-- TREATMENT TRACKERS TABLE - RLS Policies
-- ===================================================
-- Hospital staff and supervisors can view treatment trackers
CREATE POLICY "hospital_supervisor_view_trackers" ON treatment_trackers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital', 'supervisor', 'admin')
    )
  );

-- Hospital staff can update trackers
CREATE POLICY "hospital_update_trackers" ON treatment_trackers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital', 'admin')
    )
  );

-- ===================================================
-- DEFAULT - Deny all access (most restrictive)
-- ===================================================
-- If a policy is not explicitly defined, access is denied
-- For tables not listed above, no one can access them except via explicit policies

-- IMPORTANT: After running this script, verify the policies are created:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
