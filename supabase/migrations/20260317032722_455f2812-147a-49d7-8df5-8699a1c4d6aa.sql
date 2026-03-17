
-- 1. Drug catalog (master drug list)
CREATE TABLE public.drug_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name text NOT NULL,
  category text NOT NULL DEFAULT 'antibiotic',
  route_options text[] DEFAULT '{IP,IV,oral}'::text[],
  common_doses text[] DEFAULT '{}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.drug_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view active drugs" ON public.drug_catalog
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins manage drug catalog" ON public.drug_catalog
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed common PD drugs
INSERT INTO public.drug_catalog (drug_name, category, route_options, common_doses) VALUES
  ('Cefazolin', 'antibiotic', '{IP,IV}', '{1g,2g}'),
  ('Ceftazidime', 'antibiotic', '{IP,IV}', '{1g,2g}'),
  ('Vancomycin', 'antibiotic', '{IP,IV}', '{1g,2g,25mg/kg}'),
  ('Gentamicin', 'antibiotic', '{IP,IV}', '{0.6mg/kg}'),
  ('Amikacin', 'antibiotic', '{IP,IV}', '{2mg/kg}'),
  ('Fluconazole', 'antibiotic', '{IP,oral}', '{200mg}'),
  ('Amphotericin B', 'antibiotic', '{IP,IV}', '{1.5mg/L}'),
  ('Ciprofloxacin', 'antibiotic', '{oral}', '{500mg}'),
  ('Heparin', 'additive', '{IP}', '{500 units/L,1000 units/L}'),
  ('Streptokinase', 'additive', '{IP}', '{5000 units}'),
  ('Urokinase', 'additive', '{IP}', '{5000 units}');

-- 2. Exchange additives table
CREATE TABLE public.exchange_additives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_log_id uuid NOT NULL REFERENCES public.exchange_logs(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  additive_type text NOT NULL DEFAULT 'none',
  drug_name text,
  dose text,
  route text DEFAULT 'IP',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_additives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own additives" ON public.exchange_additives
  FOR ALL USING ((auth.uid() = patient_id)) WITH CHECK ((auth.uid() = patient_id));

CREATE POLICY "Doctors view patient additives" ON public.exchange_additives
  FOR SELECT USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments
    WHERE doctor_id = auth.uid() AND patient_id = exchange_additives.patient_id AND status = 'active'
  ));

CREATE POLICY "Admins manage all additives" ON public.exchange_additives
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Medication log (patient-entered)
CREATE TABLE public.medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  drug_name text NOT NULL,
  dose text,
  route text NOT NULL DEFAULT 'oral',
  reason text,
  taken_at timestamptz NOT NULL DEFAULT now(),
  peritonitis_episode_id uuid REFERENCES public.peritonitis_episodes(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own medication logs" ON public.medication_logs
  FOR ALL USING ((auth.uid() = patient_id)) WITH CHECK ((auth.uid() = patient_id));

CREATE POLICY "Doctors view patient medication logs" ON public.medication_logs
  FOR SELECT USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments
    WHERE doctor_id = auth.uid() AND patient_id = medication_logs.patient_id AND status = 'active'
  ));

CREATE POLICY "Admins manage all medication logs" ON public.medication_logs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Symptom reports (patient reports, doctor reviews)
CREATE TABLE public.symptom_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  symptoms text[] NOT NULL DEFAULT '{}'::text[],
  severity text NOT NULL DEFAULT 'moderate',
  notes text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  linked_episode_id uuid REFERENCES public.peritonitis_episodes(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.symptom_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own symptom reports" ON public.symptom_reports
  FOR ALL USING ((auth.uid() = patient_id)) WITH CHECK ((auth.uid() = patient_id));

CREATE POLICY "Doctors view and update patient symptom reports" ON public.symptom_reports
  FOR ALL USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments
    WHERE doctor_id = auth.uid() AND patient_id = symptom_reports.patient_id AND status = 'active'
  ));

CREATE POLICY "Admins manage all symptom reports" ON public.symptom_reports
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for symptom reports (doctors need alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE public.symptom_reports;
