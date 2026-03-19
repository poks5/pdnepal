-- Allow patients to insert their own peritonitis episodes
CREATE POLICY "Patients insert own episodes"
ON public.peritonitis_episodes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id AND auth.uid() = created_by);

-- Allow patients to update their own episodes
CREATE POLICY "Patients update own episodes"
ON public.peritonitis_episodes FOR UPDATE
TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- Allow patients to insert antibiotics for their own episodes
CREATE POLICY "Patients insert own antibiotics"
ON public.peritonitis_antibiotics FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM peritonitis_episodes pe
  WHERE pe.id = peritonitis_antibiotics.episode_id
  AND pe.patient_id = auth.uid()
));

-- Allow patients to insert cultures for their own episodes
CREATE POLICY "Patients insert own cultures"
ON public.peritonitis_cultures FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM peritonitis_episodes pe
  WHERE pe.id = peritonitis_cultures.episode_id
  AND pe.patient_id = auth.uid()
));