
-- PD Catheters Registry
CREATE TABLE public.pd_catheters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  insertion_date DATE NOT NULL,
  surgeon TEXT,
  insertion_technique TEXT, -- laparoscopic, open, percutaneous
  catheter_type TEXT, -- coiled_tenckhoff, straight_tenckhoff, swan_neck, other
  catheter_brand TEXT,
  exit_site_orientation TEXT, -- downward, lateral, upward
  omentopexy BOOLEAN DEFAULT false,
  first_use_date DATE,
  removal_date DATE,
  reason_for_removal TEXT,
  is_current BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pd_catheters ENABLE ROW LEVEL SECURITY;

-- Patients view own catheters
CREATE POLICY "Patients view own catheters" ON public.pd_catheters
  FOR SELECT USING (auth.uid() = patient_id);

-- Patients insert own catheters
CREATE POLICY "Patients insert own catheters" ON public.pd_catheters
  FOR INSERT WITH CHECK (auth.uid() = patient_id AND auth.uid() = created_by);

-- Doctors manage assigned patient catheters
CREATE POLICY "Doctors manage assigned patient catheters" ON public.pd_catheters
  FOR ALL USING (
    has_role(auth.uid(), 'doctor') AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_id = auth.uid() AND patient_id = pd_catheters.patient_id AND status = 'active'
    )
  );

-- Admins manage all catheters
CREATE POLICY "Admins manage all catheters" ON public.pd_catheters
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- PD Fluid Usage Registry
CREATE TABLE public.pd_fluid_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  fluid_type TEXT NOT NULL, -- Dianeal, Physioneal, Extraneal/Icodextrin, Nutrineal
  glucose_strength TEXT, -- 1.5%, 2.5%, 4.25%
  volume_ml INTEGER,
  exchanges_per_day INTEGER,
  is_current BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pd_fluid_usage ENABLE ROW LEVEL SECURITY;

-- Patients view own fluid usage
CREATE POLICY "Patients view own fluid usage" ON public.pd_fluid_usage
  FOR SELECT USING (auth.uid() = patient_id);

-- Patients insert own fluid usage
CREATE POLICY "Patients insert own fluid usage" ON public.pd_fluid_usage
  FOR INSERT WITH CHECK (auth.uid() = patient_id AND auth.uid() = created_by);

-- Patients update own fluid usage
CREATE POLICY "Patients update own fluid usage" ON public.pd_fluid_usage
  FOR UPDATE USING (auth.uid() = patient_id);

-- Doctors manage assigned patient fluid usage
CREATE POLICY "Doctors manage assigned patient fluid usage" ON public.pd_fluid_usage
  FOR ALL USING (
    has_role(auth.uid(), 'doctor') AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_id = auth.uid() AND patient_id = pd_fluid_usage.patient_id AND status = 'active'
    )
  );

-- Admins manage all fluid usage
CREATE POLICY "Admins manage all fluid usage" ON public.pd_fluid_usage
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_pd_catheters_updated_at BEFORE UPDATE ON public.pd_catheters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pd_fluid_usage_updated_at BEFORE UPDATE ON public.pd_fluid_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
