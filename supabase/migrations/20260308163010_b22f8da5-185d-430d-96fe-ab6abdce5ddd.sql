
-- Clinical alerts table for smart notifications
CREATE TABLE public.clinical_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  message text NOT NULL,
  details text,
  related_record_id uuid,
  acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- RLS
ALTER TABLE public.clinical_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own alerts"
  ON public.clinical_alerts FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'doctor') AND (
      doctor_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM doctor_patient_assignments
        WHERE doctor_patient_assignments.doctor_id = auth.uid()
          AND doctor_patient_assignments.patient_id = clinical_alerts.patient_id
          AND doctor_patient_assignments.status = 'active'
      )
    )
  );

CREATE POLICY "Doctors update own alerts"
  ON public.clinical_alerts FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'doctor') AND (
      doctor_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM doctor_patient_assignments
        WHERE doctor_patient_assignments.doctor_id = auth.uid()
          AND doctor_patient_assignments.patient_id = clinical_alerts.patient_id
          AND doctor_patient_assignments.status = 'active'
      )
    )
  );

CREATE POLICY "Service role inserts alerts"
  ON public.clinical_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins manage all alerts"
  ON public.clinical_alerts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Patients view own alerts"
  ON public.clinical_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);
