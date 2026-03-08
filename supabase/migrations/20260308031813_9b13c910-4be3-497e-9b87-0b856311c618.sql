
-- Add missing catheter columns to pd_settings
ALTER TABLE public.pd_settings
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS batch_number text,
  ADD COLUMN IF NOT EXISTS placement_method text,
  ADD COLUMN IF NOT EXISTS hospital text,
  ADD COLUMN IF NOT EXISTS surgeon_nephrologist text;

-- Drop restrictive policies that block patient writes
DROP POLICY IF EXISTS "Patients view own PD settings" ON public.pd_settings;

-- Recreate as PERMISSIVE
CREATE POLICY "Patients view own PD settings"
  ON public.pd_settings FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

-- Allow patients to insert their own PD settings
CREATE POLICY "Patients insert own PD settings"
  ON public.pd_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- Allow patients to update their own PD settings
CREATE POLICY "Patients update own PD settings"
  ON public.pd_settings FOR UPDATE TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);
