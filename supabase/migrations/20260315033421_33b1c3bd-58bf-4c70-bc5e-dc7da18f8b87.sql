-- Create centralized PD prescriptions table
CREATE TABLE public.pd_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  daily_exchanges integer NOT NULL DEFAULT 4,
  fill_volume_ml integer NOT NULL DEFAULT 2000,
  dwell_time_hours numeric DEFAULT 4,
  dialysate_type text DEFAULT 'Dianeal',
  glucose_concentration text DEFAULT '1.5%',
  active_from date NOT NULL DEFAULT CURRENT_DATE,
  active_to date DEFAULT NULL,
  created_by uuid NOT NULL,
  notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pd_prescriptions ENABLE ROW LEVEL SECURITY;

-- Patients can view their own prescriptions
CREATE POLICY "Patients view own prescriptions"
  ON public.pd_prescriptions FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

-- Doctors can manage prescriptions for assigned patients
CREATE POLICY "Doctors manage assigned patient prescriptions"
  ON public.pd_prescriptions FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_id = auth.uid()
        AND patient_id = pd_prescriptions.patient_id
        AND status = 'active'
    )
  );

-- Admins manage all
CREATE POLICY "Admins manage all prescriptions"
  ON public.pd_prescriptions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Caregivers can view patient prescriptions
CREATE POLICY "Caregivers view patient prescriptions"
  ON public.pd_prescriptions FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'caregiver'::app_role) AND EXISTS (
      SELECT 1 FROM caregiver_patient_assignments
      WHERE caregiver_id = auth.uid()
        AND patient_id = pd_prescriptions.patient_id
        AND status = 'active'
    )
  );

-- Dieticians can view patient prescriptions
CREATE POLICY "Dieticians view patient prescriptions"
  ON public.pd_prescriptions FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'dietician'::app_role) AND EXISTS (
      SELECT 1 FROM dietician_patient_assignments
      WHERE dietician_id = auth.uid()
        AND patient_id = pd_prescriptions.patient_id
        AND status = 'active'
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_pd_prescriptions_updated_at
  BEFORE UPDATE ON public.pd_prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pd_prescriptions;