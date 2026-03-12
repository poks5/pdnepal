
-- Caregiver-Patient assignment table
CREATE TABLE public.caregiver_patient_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  relationship TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  UNIQUE(caregiver_id, patient_id)
);

ALTER TABLE public.caregiver_patient_assignments ENABLE ROW LEVEL SECURITY;

-- Patients can request caregiver assignment
CREATE POLICY "Patients manage own caregiver assignments"
  ON public.caregiver_patient_assignments FOR ALL
  TO public
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Caregivers can view their own assignments
CREATE POLICY "Caregivers view own assignments"
  ON public.caregiver_patient_assignments FOR SELECT
  TO public
  USING (auth.uid() = caregiver_id);

-- Admins manage all
CREATE POLICY "Admins manage all caregiver assignments"
  ON public.caregiver_patient_assignments FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Doctors can view caregiver assignments for their patients
CREATE POLICY "Doctors view caregiver assignments"
  ON public.caregiver_patient_assignments FOR SELECT
  TO public
  USING (
    has_role(auth.uid(), 'doctor'::app_role)
    AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_patient_assignments.doctor_id = auth.uid()
        AND doctor_patient_assignments.patient_id = caregiver_patient_assignments.patient_id
        AND doctor_patient_assignments.status = 'active'
    )
  );

-- Allow caregivers to read exchange_logs for their assigned patients
CREATE POLICY "Caregivers view patient exchanges"
  ON public.exchange_logs FOR SELECT
  TO public
  USING (
    has_role(auth.uid(), 'caregiver'::app_role)
    AND EXISTS (
      SELECT 1 FROM caregiver_patient_assignments
      WHERE caregiver_patient_assignments.caregiver_id = auth.uid()
        AND caregiver_patient_assignments.patient_id = exchange_logs.patient_id
        AND caregiver_patient_assignments.status = 'active'
    )
  );

-- Allow caregivers to read profiles of assigned patients
CREATE POLICY "Caregivers view assigned patient profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (
    has_role(auth.uid(), 'caregiver'::app_role)
    AND EXISTS (
      SELECT 1 FROM caregiver_patient_assignments
      WHERE caregiver_patient_assignments.caregiver_id = auth.uid()
        AND caregiver_patient_assignments.patient_id = profiles.user_id
        AND caregiver_patient_assignments.status = 'active'
    )
  );

-- Allow caregivers to read clinical_alerts for assigned patients
CREATE POLICY "Caregivers view patient alerts"
  ON public.clinical_alerts FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'caregiver'::app_role)
    AND EXISTS (
      SELECT 1 FROM caregiver_patient_assignments
      WHERE caregiver_patient_assignments.caregiver_id = auth.uid()
        AND caregiver_patient_assignments.patient_id = clinical_alerts.patient_id
        AND caregiver_patient_assignments.status = 'active'
    )
  );
