
-- =============================================
-- Convert ALL RESTRICTIVE policies to PERMISSIVE
-- =============================================

-- 1. audit_log
DROP POLICY IF EXISTS "Admins view audit" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated users insert audit" ON public.audit_log;

CREATE POLICY "Admins view audit"
ON public.audit_log FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users insert audit"
ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. exchange_logs
DROP POLICY IF EXISTS "Doctors view patient exchanges" ON public.exchange_logs;
DROP POLICY IF EXISTS "Admins view all exchanges" ON public.exchange_logs;
DROP POLICY IF EXISTS "Patients manage own exchanges" ON public.exchange_logs;

CREATE POLICY "Patients manage own exchanges"
ON public.exchange_logs FOR ALL TO authenticated
USING (auth.uid() = patient_id OR auth.uid() = recorded_by)
WITH CHECK (auth.uid() = patient_id OR auth.uid() = recorded_by);

CREATE POLICY "Doctors view patient exchanges"
ON public.exchange_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
  SELECT 1 FROM doctor_patient_assignments
  WHERE doctor_patient_assignments.doctor_id = auth.uid()
    AND doctor_patient_assignments.patient_id = exchange_logs.patient_id
    AND doctor_patient_assignments.status = 'active'
));

CREATE POLICY "Admins view all exchanges"
ON public.exchange_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. exchange_plans
DROP POLICY IF EXISTS "Patients view own plans" ON public.exchange_plans;
DROP POLICY IF EXISTS "Doctors manage patient plans" ON public.exchange_plans;
DROP POLICY IF EXISTS "Admins manage all plans" ON public.exchange_plans;

CREATE POLICY "Patients view own plans"
ON public.exchange_plans FOR SELECT TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors manage patient plans"
ON public.exchange_plans FOR ALL TO authenticated
USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
  SELECT 1 FROM doctor_patient_assignments
  WHERE doctor_patient_assignments.doctor_id = auth.uid()
    AND doctor_patient_assignments.patient_id = exchange_plans.patient_id
    AND doctor_patient_assignments.status = 'active'
));

CREATE POLICY "Admins manage all plans"
ON public.exchange_plans FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. lab_results
DROP POLICY IF EXISTS "Patients view own labs" ON public.lab_results;
DROP POLICY IF EXISTS "Doctors manage patient labs" ON public.lab_results;
DROP POLICY IF EXISTS "Admins manage all labs" ON public.lab_results;
DROP POLICY IF EXISTS "Lab entry by recorder" ON public.lab_results;

CREATE POLICY "Patients view own labs"
ON public.lab_results FOR SELECT TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors manage patient labs"
ON public.lab_results FOR ALL TO authenticated
USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
  SELECT 1 FROM doctor_patient_assignments
  WHERE doctor_patient_assignments.doctor_id = auth.uid()
    AND doctor_patient_assignments.patient_id = lab_results.patient_id
    AND doctor_patient_assignments.status = 'active'
));

CREATE POLICY "Admins manage all labs"
ON public.lab_results FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Lab entry by recorder"
ON public.lab_results FOR INSERT TO authenticated
WITH CHECK (auth.uid() = entered_by);

-- 5. pd_settings
DROP POLICY IF EXISTS "Doctors manage patient PD settings" ON public.pd_settings;
DROP POLICY IF EXISTS "Admins manage all PD settings" ON public.pd_settings;
DROP POLICY IF EXISTS "Patients view own PD settings" ON public.pd_settings;
DROP POLICY IF EXISTS "Patients insert own PD settings" ON public.pd_settings;
DROP POLICY IF EXISTS "Patients update own PD settings" ON public.pd_settings;

CREATE POLICY "Patients view own PD settings"
ON public.pd_settings FOR SELECT TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients insert own PD settings"
ON public.pd_settings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients update own PD settings"
ON public.pd_settings FOR UPDATE TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors manage patient PD settings"
ON public.pd_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
  SELECT 1 FROM doctor_patient_assignments
  WHERE doctor_patient_assignments.doctor_id = auth.uid()
    AND doctor_patient_assignments.patient_id = pd_settings.patient_id
    AND doctor_patient_assignments.status = 'active'
));

CREATE POLICY "Admins manage all PD settings"
ON public.pd_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view assigned patients" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Patients can view doctor profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can view assigned patients"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
  SELECT 1 FROM doctor_patient_assignments
  WHERE doctor_patient_assignments.doctor_id = auth.uid()
    AND doctor_patient_assignments.patient_id = profiles.user_id
    AND doctor_patient_assignments.status = 'active'
));

CREATE POLICY "Patients can view doctor profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'patient'::app_role) AND EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = profiles.user_id
    AND user_roles.role = 'doctor'::app_role
));

-- 7. user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view doctor roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view doctor roles"
ON public.user_roles FOR SELECT TO authenticated
USING (role = 'doctor'::app_role);
