
-- PET Test Results table
CREATE TABLE public.pet_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  test_date DATE NOT NULL,
  dialysate_creatinine_0h NUMERIC,
  dialysate_creatinine_2h NUMERIC,
  dialysate_creatinine_4h NUMERIC,
  plasma_creatinine NUMERIC,
  dialysate_glucose_0h NUMERIC,
  dialysate_glucose_2h NUMERIC,
  dialysate_glucose_4h NUMERIC,
  dp_creatinine_ratio NUMERIC,
  dp_glucose_ratio NUMERIC,
  transport_type TEXT,
  drain_volume_4h NUMERIC,
  infused_volume NUMERIC DEFAULT 2000,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own PET results" ON public.pet_results
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors manage assigned patient PET results" ON public.pet_results
  FOR ALL USING (
    has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_id = auth.uid() AND patient_id = pet_results.patient_id AND status = 'active'
    )
  );

CREATE POLICY "Admins manage all PET results" ON public.pet_results
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_pet_results_updated_at
  BEFORE UPDATE ON public.pet_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adequacy Calculations table
CREATE TABLE public.adequacy_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  test_date DATE NOT NULL,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  age_years INTEGER,
  total_body_water NUMERIC,
  daily_urine_volume NUMERIC DEFAULT 0,
  urine_creatinine NUMERIC,
  urine_urea NUMERIC,
  serum_creatinine NUMERIC,
  serum_urea NUMERIC,
  dialysate_creatinine NUMERIC,
  dialysate_urea NUMERIC,
  dialysate_volume_24h NUMERIC,
  weekly_kt_v NUMERIC,
  weekly_creatinine_clearance NUMERIC,
  residual_renal_kt_v NUMERIC,
  peritoneal_kt_v NUMERIC,
  assessment TEXT DEFAULT 'borderline',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.adequacy_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own adequacy" ON public.adequacy_calculations
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors manage assigned patient adequacy" ON public.adequacy_calculations
  FOR ALL USING (
    has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_id = auth.uid() AND patient_id = adequacy_calculations.patient_id AND status = 'active'
    )
  );

CREATE POLICY "Admins manage all adequacy" ON public.adequacy_calculations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_adequacy_calculations_updated_at
  BEFORE UPDATE ON public.adequacy_calculations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_pet_results_patient ON public.pet_results (patient_id, test_date DESC);
CREATE INDEX idx_adequacy_patient ON public.adequacy_calculations (patient_id, test_date DESC);
