
-- Add request_reason and request_message columns to doctor_patient_assignments
ALTER TABLE public.doctor_patient_assignments 
  ADD COLUMN IF NOT EXISTS request_reason text,
  ADD COLUMN IF NOT EXISTS requested_by uuid;

-- Allow patients to INSERT assignments with 'pending' status
CREATE POLICY "Patients can request doctor assignment"
  ON public.doctor_patient_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'patient'::app_role) 
    AND patient_id = auth.uid() 
    AND status = 'pending'
  );

-- Allow doctors to UPDATE assignments (approve/reject)
CREATE POLICY "Doctors can update assignment status"
  ON public.doctor_patient_assignments FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'doctor'::app_role) 
    AND doctor_id = auth.uid()
  )
  WITH CHECK (
    has_role(auth.uid(), 'doctor'::app_role) 
    AND doctor_id = auth.uid()
  );

-- Allow patients to view doctor profiles (needed for browsing)
CREATE POLICY "Patients can view doctor profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'patient'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = profiles.user_id 
      AND user_roles.role = 'doctor'::app_role
    )
  );
