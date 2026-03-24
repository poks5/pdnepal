-- Allow doctors to see profiles of patients with pending assignments (for accepting requests)
CREATE POLICY "Doctors can view pending patient profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments
    WHERE doctor_patient_assignments.doctor_id = auth.uid()
    AND doctor_patient_assignments.patient_id = profiles.user_id
    AND doctor_patient_assignments.status = 'pending'
  )
);