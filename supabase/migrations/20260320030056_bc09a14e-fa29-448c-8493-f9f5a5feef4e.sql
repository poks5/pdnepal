-- Allow patients to insert their own clinical alerts (for auto-linking from exchange logs)
CREATE POLICY "Patients insert own alerts"
ON public.clinical_alerts
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = patient_id);