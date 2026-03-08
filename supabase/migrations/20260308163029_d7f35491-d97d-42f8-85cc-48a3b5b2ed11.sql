
DROP POLICY "Service role inserts alerts" ON public.clinical_alerts;

CREATE POLICY "Doctors insert alerts"
  ON public.clinical_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin')
  );
