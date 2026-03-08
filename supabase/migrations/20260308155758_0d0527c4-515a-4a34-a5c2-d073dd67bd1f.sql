
-- 1. PD Events (Timeline Engine)
CREATE TABLE public.pd_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'catheter_insertion', 'pd_start', 'peritonitis', 'exit_site_infection',
    'tunnel_infection', 'catheter_revision', 'catheter_removal',
    'transfer_to_hd', 'transplant', 'pd_restart', 'death'
  )),
  event_date date NOT NULL,
  related_record_id uuid,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Peritonitis Episodes
CREATE TABLE public.peritonitis_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  episode_number integer NOT NULL DEFAULT 1,
  date_onset date NOT NULL,
  presenting_symptoms text[] DEFAULT '{}',
  effluent_wbc integer,
  neutrophil_percent numeric,
  eosinophil_percent numeric,
  gram_stain_result text,
  culture_result text,
  organism text,
  classification text CHECK (classification IS NULL OR classification IN (
    'culture_negative', 'fungal', 'polymicrobial', 'refractory',
    'relapsing', 'recurrent', 'repeat', 'standard'
  )),
  empiric_antibiotic_start_date date,
  empiric_regimen text,
  definitive_antibiotic text,
  route text CHECK (route IS NULL OR route IN ('IP', 'IV', 'oral', 'combined')),
  duration_days integer,
  effluent_clearance_date date,
  clearance_wbc_below_100 boolean,
  symptoms_resolved boolean,
  culture_negative_on_clearance boolean,
  clinical_response text CHECK (clinical_response IS NULL OR clinical_response IN ('good', 'partial', 'none')),
  catheter_removed boolean DEFAULT false,
  removal_date date,
  switch_to_hd boolean DEFAULT false,
  death boolean DEFAULT false,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Peritonitis Antibiotics
CREATE TABLE public.peritonitis_antibiotics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.peritonitis_episodes(id) ON DELETE CASCADE,
  drug_name text NOT NULL,
  route text NOT NULL CHECK (route IN ('IP', 'IV', 'oral')),
  start_date date NOT NULL,
  stop_date date,
  dose text,
  frequency text,
  reason_for_change text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Peritonitis Culture & Sensitivity
CREATE TABLE public.peritonitis_cultures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.peritonitis_episodes(id) ON DELETE CASCADE,
  culture_date date NOT NULL,
  sample_type text DEFAULT 'PD effluent',
  organism text,
  colony_count text,
  gram_type text CHECK (gram_type IS NULL OR gram_type IN ('positive', 'negative', 'fungal', 'mycobacterial')),
  sensitivity jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Exit Site Infections
CREATE TABLE public.exit_site_infections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  date_onset date NOT NULL,
  symptoms text[] DEFAULT '{}',
  organism text,
  culture_date date,
  antibiotic text,
  route text CHECK (route IS NULL OR route IN ('topical', 'oral', 'IV')),
  duration_days integer,
  resolved boolean DEFAULT false,
  resolution_date date,
  progressed_to_peritonitis boolean DEFAULT false,
  related_peritonitis_id uuid REFERENCES public.peritonitis_episodes(id),
  photo_urls text[] DEFAULT '{}',
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pd_events_patient ON public.pd_events(patient_id, event_date DESC);
CREATE INDEX idx_peritonitis_patient ON public.peritonitis_episodes(patient_id, date_onset DESC);
CREATE INDEX idx_peritonitis_antibiotics_episode ON public.peritonitis_antibiotics(episode_id);
CREATE INDEX idx_peritonitis_cultures_episode ON public.peritonitis_cultures(episode_id);
CREATE INDEX idx_exit_site_patient ON public.exit_site_infections(patient_id, date_onset DESC);

-- Enable RLS
ALTER TABLE public.pd_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peritonitis_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peritonitis_antibiotics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peritonitis_cultures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_site_infections ENABLE ROW LEVEL SECURITY;

-- RLS: pd_events
CREATE POLICY "Patients view own events" ON public.pd_events FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients insert own events" ON public.pd_events FOR INSERT WITH CHECK (auth.uid() = patient_id AND auth.uid() = created_by);
CREATE POLICY "Doctors view assigned patient events" ON public.pd_events FOR SELECT USING (
  has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pd_events.patient_id AND status = 'active'
  )
);
CREATE POLICY "Doctors insert patient events" ON public.pd_events FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pd_events.patient_id AND status = 'active'
  )
);
CREATE POLICY "Admins manage all events" ON public.pd_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS: peritonitis_episodes
CREATE POLICY "Patients view own episodes" ON public.peritonitis_episodes FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage assigned patient episodes" ON public.peritonitis_episodes FOR ALL USING (
  has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = peritonitis_episodes.patient_id AND status = 'active'
  )
);
CREATE POLICY "Doctors insert episodes" ON public.peritonitis_episodes FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'doctor') AND auth.uid() = created_by
);
CREATE POLICY "Admins manage all episodes" ON public.peritonitis_episodes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS: peritonitis_antibiotics (via episode ownership)
CREATE POLICY "Users view antibiotics for accessible episodes" ON public.peritonitis_antibiotics FOR SELECT USING (
  EXISTS (SELECT 1 FROM peritonitis_episodes pe WHERE pe.id = episode_id AND (
    pe.patient_id = auth.uid() OR has_role(auth.uid(), 'admin') OR
    (has_role(auth.uid(), 'doctor') AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pe.patient_id AND status = 'active'
    ))
  ))
);
CREATE POLICY "Doctors manage antibiotics" ON public.peritonitis_antibiotics FOR ALL USING (
  has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM peritonitis_episodes pe WHERE pe.id = episode_id AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pe.patient_id AND status = 'active'
    )
  )
);
CREATE POLICY "Admins manage all antibiotics" ON public.peritonitis_antibiotics FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS: peritonitis_cultures (via episode ownership)
CREATE POLICY "Users view cultures for accessible episodes" ON public.peritonitis_cultures FOR SELECT USING (
  EXISTS (SELECT 1 FROM peritonitis_episodes pe WHERE pe.id = episode_id AND (
    pe.patient_id = auth.uid() OR has_role(auth.uid(), 'admin') OR
    (has_role(auth.uid(), 'doctor') AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pe.patient_id AND status = 'active'
    ))
  ))
);
CREATE POLICY "Doctors manage cultures" ON public.peritonitis_cultures FOR ALL USING (
  has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM peritonitis_episodes pe WHERE pe.id = episode_id AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pe.patient_id AND status = 'active'
    )
  )
);
CREATE POLICY "Admins manage all cultures" ON public.peritonitis_cultures FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS: exit_site_infections
CREATE POLICY "Patients view own exit site infections" ON public.exit_site_infections FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients insert own exit site infections" ON public.exit_site_infections FOR INSERT WITH CHECK (auth.uid() = patient_id AND auth.uid() = created_by);
CREATE POLICY "Doctors manage assigned patient infections" ON public.exit_site_infections FOR ALL USING (
  has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = exit_site_infections.patient_id AND status = 'active'
  )
);
CREATE POLICY "Admins manage all exit site infections" ON public.exit_site_infections FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_pd_events_updated_at BEFORE UPDATE ON public.pd_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_peritonitis_episodes_updated_at BEFORE UPDATE ON public.peritonitis_episodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exit_site_infections_updated_at BEFORE UPDATE ON public.exit_site_infections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.pd_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.peritonitis_episodes;
