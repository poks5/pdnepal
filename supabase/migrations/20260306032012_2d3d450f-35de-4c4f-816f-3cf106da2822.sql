
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- === profiles ===
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view assigned patients" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can view assigned patients" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = profiles.user_id AND status = 'active'));

-- === exchange_logs ===
DROP POLICY IF EXISTS "Patients manage own exchanges" ON public.exchange_logs;
DROP POLICY IF EXISTS "Doctors view patient exchanges" ON public.exchange_logs;
DROP POLICY IF EXISTS "Admins view all exchanges" ON public.exchange_logs;

CREATE POLICY "Patients manage own exchanges" ON public.exchange_logs FOR ALL TO authenticated USING (auth.uid() = patient_id OR auth.uid() = recorded_by) WITH CHECK (auth.uid() = patient_id OR auth.uid() = recorded_by);
CREATE POLICY "Doctors view patient exchanges" ON public.exchange_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = exchange_logs.patient_id AND status = 'active'));
CREATE POLICY "Admins view all exchanges" ON public.exchange_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- === user_roles ===
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- === exchange_plans ===
DROP POLICY IF EXISTS "Patients view own plans" ON public.exchange_plans;
DROP POLICY IF EXISTS "Doctors manage patient plans" ON public.exchange_plans;
DROP POLICY IF EXISTS "Admins manage all plans" ON public.exchange_plans;

CREATE POLICY "Patients view own plans" ON public.exchange_plans FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage patient plans" ON public.exchange_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = exchange_plans.patient_id AND status = 'active'));
CREATE POLICY "Admins manage all plans" ON public.exchange_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- === lab_results ===
DROP POLICY IF EXISTS "Patients view own labs" ON public.lab_results;
DROP POLICY IF EXISTS "Doctors manage patient labs" ON public.lab_results;
DROP POLICY IF EXISTS "Admins manage all labs" ON public.lab_results;
DROP POLICY IF EXISTS "Lab entry by recorder" ON public.lab_results;

CREATE POLICY "Patients view own labs" ON public.lab_results FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage patient labs" ON public.lab_results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = lab_results.patient_id AND status = 'active'));
CREATE POLICY "Admins manage all labs" ON public.lab_results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Lab entry by recorder" ON public.lab_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = entered_by);

-- === pd_settings ===
DROP POLICY IF EXISTS "Patients view own PD settings" ON public.pd_settings;
DROP POLICY IF EXISTS "Doctors manage patient PD settings" ON public.pd_settings;
DROP POLICY IF EXISTS "Admins manage all PD settings" ON public.pd_settings;

CREATE POLICY "Patients view own PD settings" ON public.pd_settings FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage patient PD settings" ON public.pd_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'doctor') AND EXISTS (SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = pd_settings.patient_id AND status = 'active'));
CREATE POLICY "Admins manage all PD settings" ON public.pd_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- === doctor_patient_assignments ===
DROP POLICY IF EXISTS "Users can view own assignments" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Doctors can create assignments" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.doctor_patient_assignments;

CREATE POLICY "Users can view own assignments" ON public.doctor_patient_assignments FOR SELECT TO authenticated USING (auth.uid() = doctor_id OR auth.uid() = patient_id);
CREATE POLICY "Doctors can create assignments" ON public.doctor_patient_assignments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());
CREATE POLICY "Admins can manage assignments" ON public.doctor_patient_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- === audit_log ===
DROP POLICY IF EXISTS "Admins view audit" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated users insert audit" ON public.audit_log;

CREATE POLICY "Admins view audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
