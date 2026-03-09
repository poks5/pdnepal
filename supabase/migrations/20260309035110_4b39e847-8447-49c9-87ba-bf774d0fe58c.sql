
-- ============================================
-- 1. CENTERS TABLE (Multi-Center Support)
-- ============================================
CREATE TABLE public.centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  phone text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all centers" ON public.centers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users view active centers" ON public.centers
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- ============================================
-- 2. ADD center_id TO profiles
-- ============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS center_id uuid REFERENCES public.centers(id);

-- ============================================
-- 3. SYSTEM CONFIG TABLE
-- ============================================
CREATE TABLE public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general',
  description text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage system config" ON public.system_config
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated read system config" ON public.system_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seed default config values
INSERT INTO public.system_config (config_key, config_value, category, description) VALUES
  ('fluid_types', '["1.5% Dextrose","2.5% Dextrose","4.25% Dextrose","Icodextrin","Amino Acid"]'::jsonb, 'clinical', 'Available PD fluid types'),
  ('solution_brands', '["Baxter","Fresenius","B Braun"]'::jsonb, 'clinical', 'PD solution brands'),
  ('antibiotic_list', '["Cefazolin","Ceftazidime","Vancomycin","Gentamicin","Ciprofloxacin","Fluconazole","Meropenem","Amphotericin B"]'::jsonb, 'clinical', 'Common antibiotics for PD infections'),
  ('organism_list', '["Staph aureus","Staph epidermidis","E. coli","Klebsiella","Pseudomonas","Enterococcus","Candida","Culture Negative","Polymicrobial"]'::jsonb, 'clinical', 'Common organisms in PD infections'),
  ('lab_reference_ranges', '{"hemoglobin":{"min":10,"max":16,"unit":"g/dL"},"creatinine":{"min":0.5,"max":15,"unit":"mg/dL"},"potassium":{"min":3.5,"max":5.5,"unit":"mEq/L"},"albumin":{"min":3.0,"max":5.0,"unit":"g/dL"},"phosphorus":{"min":2.5,"max":6.5,"unit":"mg/dL"},"calcium":{"min":8.0,"max":10.5,"unit":"mg/dL"}}'::jsonb, 'clinical', 'Lab reference ranges'),
  ('alert_thresholds', '{"effluent_wbc_critical":100,"peritonitis_antibiotic_max_days":21,"missed_exchange_alert_hours":12,"cloudy_drain_immediate":true}'::jsonb, 'alerts', 'Alert threshold configuration'),
  ('catheter_types', '["Tenckhoff Straight","Tenckhoff Coiled","Swan Neck","Toronto Western"]'::jsonb, 'clinical', 'PD catheter types'),
  ('drain_colors', '["Clear","Slightly Yellow","Yellow","Cloudy","Bloody","Fibrin"]'::jsonb, 'clinical', 'Drain color options');

-- ============================================
-- 4. RECORD VERSIONS TABLE (Version History)
-- ============================================
CREATE TABLE public.record_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_reason text
);

ALTER TABLE public.record_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all versions" ON public.record_versions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors view patient record versions" ON public.record_versions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') AND
    EXISTS (
      SELECT 1 FROM doctor_patient_assignments dpa
      WHERE dpa.doctor_id = auth.uid()
        AND dpa.status = 'active'
        AND (
          (record_versions.table_name = 'peritonitis_episodes' AND dpa.patient_id = (
            SELECT patient_id FROM peritonitis_episodes WHERE id = record_versions.record_id
          ))
          OR
          (record_versions.table_name = 'exchange_logs' AND dpa.patient_id = (
            SELECT patient_id FROM exchange_logs WHERE id = record_versions.record_id
          ))
        )
    )
  );

-- ============================================
-- 5. RECORD LOCKS TABLE
-- ============================================
CREATE TABLE public.record_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  locked_by uuid NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now(),
  lock_reason text,
  UNIQUE(table_name, record_id)
);

ALTER TABLE public.record_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage record locks" ON public.record_locks
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated view locks" ON public.record_locks
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- 6. VERSION TRACKING FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.track_record_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _version int;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO _version
  FROM public.record_versions
  WHERE table_name = TG_TABLE_NAME AND record_id = OLD.id;

  INSERT INTO public.record_versions (table_name, record_id, version_number, old_data, new_data, changed_by)
  VALUES (TG_TABLE_NAME, OLD.id, _version, to_jsonb(OLD), to_jsonb(NEW), auth.uid());

  RETURN NEW;
END;
$$;

-- Attach version tracking to key clinical tables
CREATE TRIGGER track_peritonitis_versions
  BEFORE UPDATE ON public.peritonitis_episodes
  FOR EACH ROW EXECUTE FUNCTION public.track_record_version();

CREATE TRIGGER track_exchange_versions
  BEFORE UPDATE ON public.exchange_logs
  FOR EACH ROW EXECUTE FUNCTION public.track_record_version();

CREATE TRIGGER track_lab_versions
  BEFORE UPDATE ON public.lab_results
  FOR EACH ROW EXECUTE FUNCTION public.track_record_version();

CREATE TRIGGER track_catheter_versions
  BEFORE UPDATE ON public.pd_catheters
  FOR EACH ROW EXECUTE FUNCTION public.track_record_version();

-- ============================================
-- 7. ENHANCED AUDIT LOG (add IP and details)
-- ============================================
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS user_agent text;

-- ============================================
-- 8. UPDATE TIMESTAMP TRIGGERS for new tables
-- ============================================
CREATE TRIGGER update_centers_updated_at
  BEFORE UPDATE ON public.centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
