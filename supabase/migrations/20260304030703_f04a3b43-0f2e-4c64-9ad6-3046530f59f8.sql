
-- Drop any partial artifacts from failed migrations
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.exchange_plans CASCADE;
DROP TABLE IF EXISTS public.lab_results CASCADE;
DROP TABLE IF EXISTS public.exchange_logs CASCADE;
DROP TABLE IF EXISTS public.pd_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.doctor_patient_assignments CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 1. Enum
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'caregiver', 'admin', 'coordinator');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role function (needed by all RLS policies)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- user_roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Doctor-Patient assignments (before profiles since profiles references it)
CREATE TABLE public.doctor_patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (doctor_id, patient_id)
);
ALTER TABLE public.doctor_patient_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assignments" ON public.doctor_patient_assignments FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);
CREATE POLICY "Admins can manage assignments" ON public.doctor_patient_assignments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can create assignments" ON public.doctor_patient_assignments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());

-- 5. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ne')),
  hospital TEXT,
  specialization TEXT[],
  avatar_url TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Doctors can view assigned patients" ON public.profiles FOR SELECT USING (
  public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM public.doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = profiles.user_id AND status = 'active')
);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. PD Settings
CREATE TABLE public.pd_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  catheter_type TEXT,
  catheter_insertion_date DATE,
  modality TEXT DEFAULT 'CAPD' CHECK (modality IN ('CAPD', 'APD', 'Hybrid')),
  daily_exchanges INTEGER DEFAULT 4,
  fill_volume_ml INTEGER DEFAULT 2000,
  dwell_time_hours NUMERIC(4,1),
  solution_type TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pd_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own PD settings" ON public.pd_settings FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage patient PD settings" ON public.pd_settings FOR ALL USING (
  public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM public.doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pd_settings.patient_id AND status = 'active')
);
CREATE POLICY "Admins manage all PD settings" ON public.pd_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. Exchange logs
CREATE TABLE public.exchange_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exchange_type TEXT NOT NULL CHECK (exchange_type IN ('morning', 'afternoon', 'evening', 'night', 'manual')),
  solution_type TEXT NOT NULL,
  fill_volume_ml INTEGER NOT NULL,
  drain_volume_ml INTEGER,
  ultrafiltration_ml INTEGER GENERATED ALWAYS AS (COALESCE(drain_volume_ml, 0) - fill_volume_ml) STORED,
  dwell_start TIMESTAMPTZ NOT NULL,
  dwell_end TIMESTAMPTZ,
  drain_color TEXT CHECK (drain_color IN ('clear', 'slightly_cloudy', 'cloudy', 'bloody', 'yellow', 'amber')),
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  notes TEXT,
  weight_before_kg NUMERIC(5,2),
  weight_after_kg NUMERIC(5,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  temperature NUMERIC(4,1),
  recorded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exchange_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own exchanges" ON public.exchange_logs FOR ALL USING (auth.uid() = patient_id OR auth.uid() = recorded_by);
CREATE POLICY "Doctors view patient exchanges" ON public.exchange_logs FOR SELECT USING (
  public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM public.doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = exchange_logs.patient_id AND status = 'active')
);
CREATE POLICY "Admins view all exchanges" ON public.exchange_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 8. Lab results
CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_date DATE NOT NULL,
  test_type TEXT NOT NULL,
  hemoglobin NUMERIC(4,1), creatinine NUMERIC(6,2), bun NUMERIC(6,2),
  potassium NUMERIC(4,2), sodium NUMERIC(5,1), calcium NUMERIC(4,2),
  phosphorus NUMERIC(4,2), albumin NUMERIC(4,2), glucose NUMERIC(6,1),
  kt_v NUMERIC(4,2), pet_result TEXT, notes TEXT,
  entered_by UUID REFERENCES auth.users(id) NOT NULL,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own labs" ON public.lab_results FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage patient labs" ON public.lab_results FOR ALL USING (
  public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM public.doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = lab_results.patient_id AND status = 'active')
);
CREATE POLICY "Lab entry by recorder" ON public.lab_results FOR INSERT WITH CHECK (auth.uid() = entered_by);
CREATE POLICY "Admins manage all labs" ON public.lab_results FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 9. Exchange plans
CREATE TABLE public.exchange_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prescribed_by UUID REFERENCES auth.users(id) NOT NULL,
  plan_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  exchanges JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exchange_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own plans" ON public.exchange_plans FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage patient plans" ON public.exchange_plans FOR ALL USING (
  public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM public.doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = exchange_plans.patient_id AND status = 'active')
);
CREATE POLICY "Admins manage all plans" ON public.exchange_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 10. Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit" ON public.audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System insert audit" ON public.audit_log FOR INSERT WITH CHECK (true);

-- 11. Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'language', 'en'));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pd_settings_ts BEFORE UPDATE ON public.pd_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exchange_logs_ts BEFORE UPDATE ON public.exchange_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lab_results_ts BEFORE UPDATE ON public.lab_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exchange_plans_ts BEFORE UPDATE ON public.exchange_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Indexes
CREATE INDEX idx_exchange_logs_patient ON public.exchange_logs (patient_id, dwell_start DESC);
CREATE INDEX idx_lab_results_patient ON public.lab_results (patient_id, test_date DESC);
CREATE INDEX idx_plans_active ON public.exchange_plans (patient_id, is_active) WHERE is_active = true;
CREATE INDEX idx_assignments_active ON public.doctor_patient_assignments (doctor_id, status) WHERE status = 'active';
CREATE INDEX idx_audit_user ON public.audit_log (user_id, created_at DESC);
