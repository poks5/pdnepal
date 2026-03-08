
-- Fix exchange_logs: drop restrictive policy, recreate as permissive
DROP POLICY IF EXISTS "Patients manage own exchanges" ON public.exchange_logs;

CREATE POLICY "Patients manage own exchanges"
  ON public.exchange_logs FOR ALL TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = recorded_by)
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = recorded_by);

-- Fix profiles: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
