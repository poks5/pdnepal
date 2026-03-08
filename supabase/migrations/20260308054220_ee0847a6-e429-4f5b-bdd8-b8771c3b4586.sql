
-- Fix 1: Allow authenticated users to see doctor user_ids (needed for browsing doctors)
CREATE POLICY "Authenticated users can view doctor roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role = 'doctor'::app_role);

-- Fix 2: Drop all RESTRICTIVE policies on doctor_patient_assignments and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own assignments" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Doctors can create assignments" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Patients can request doctor assignment" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Doctors can update assignment status" ON public.doctor_patient_assignments;

-- Recreate as PERMISSIVE
CREATE POLICY "Users can view own assignments"
ON public.doctor_patient_assignments
FOR SELECT
TO authenticated
USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Doctors can create assignments"
ON public.doctor_patient_assignments
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) AND doctor_id = auth.uid());

CREATE POLICY "Admins can manage assignments"
ON public.doctor_patient_assignments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can request doctor assignment"
ON public.doctor_patient_assignments
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'patient'::app_role) AND patient_id = auth.uid() AND status = 'pending');

CREATE POLICY "Doctors can update assignment status"
ON public.doctor_patient_assignments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'doctor'::app_role) AND doctor_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) AND doctor_id = auth.uid());
