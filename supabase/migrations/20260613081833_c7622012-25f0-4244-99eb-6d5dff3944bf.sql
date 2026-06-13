
-- 1. Fix exchange_logs: split policies so INSERT requires patient_id = auth.uid() (or caregiver assignment)
DROP POLICY IF EXISTS "Patients manage own exchanges" ON public.exchange_logs;

CREATE POLICY "Patients select own exchanges" ON public.exchange_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = recorded_by);

CREATE POLICY "Patients insert own exchanges" ON public.exchange_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = patient_id AND auth.uid() = recorded_by)
    OR EXISTS (
      SELECT 1 FROM public.caregiver_patient_assignments
      WHERE caregiver_id = auth.uid()
        AND patient_id = exchange_logs.patient_id
        AND status = 'active'
    )
  );

CREATE POLICY "Patients update own exchanges" ON public.exchange_logs
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = patient_id
    OR EXISTS (
      SELECT 1 FROM public.caregiver_patient_assignments
      WHERE caregiver_id = auth.uid()
        AND patient_id = exchange_logs.patient_id
        AND status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = patient_id
    OR EXISTS (
      SELECT 1 FROM public.caregiver_patient_assignments
      WHERE caregiver_id = auth.uid()
        AND patient_id = exchange_logs.patient_id
        AND status = 'active'
    )
  );

CREATE POLICY "Patients delete own exchanges" ON public.exchange_logs
  FOR DELETE TO authenticated
  USING (auth.uid() = patient_id);

-- 2. Fix clinical-photos SELECT policy to scope by ownership / care relationship
DROP POLICY IF EXISTS "Authenticated users view clinical photos" ON storage.objects;

CREATE POLICY "Clinical photos scoped read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'clinical-photos' AND (
      -- Owner (file in their own folder)
      (storage.foldername(name))[1] = auth.uid()::text
      -- Admins / coordinators
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'coordinator'::app_role)
      -- Assigned doctor
      OR EXISTS (
        SELECT 1 FROM public.doctor_patient_assignments
        WHERE doctor_id = auth.uid()
          AND patient_id::text = (storage.foldername(name))[1]
          AND status = 'active'
      )
      -- Assigned nurse/dietician (treat like doctor via assignments table for dieticians)
      OR EXISTS (
        SELECT 1 FROM public.dietician_patient_assignments
        WHERE dietician_id = auth.uid()
          AND patient_id::text = (storage.foldername(name))[1]
          AND status = 'active'
      )
      -- Assigned caregiver
      OR EXISTS (
        SELECT 1 FROM public.caregiver_patient_assignments
        WHERE caregiver_id = auth.uid()
          AND patient_id::text = (storage.foldername(name))[1]
          AND status = 'active'
      )
    )
  );

-- Also tighten INSERT so users can only upload to their own folder, or care team to their patients'
DROP POLICY IF EXISTS "Authenticated users upload clinical photos" ON storage.objects;
CREATE POLICY "Clinical photos scoped upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'clinical-photos' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'coordinator'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.doctor_patient_assignments
        WHERE doctor_id = auth.uid()
          AND patient_id::text = (storage.foldername(name))[1]
          AND status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM public.caregiver_patient_assignments
        WHERE caregiver_id = auth.uid()
          AND patient_id::text = (storage.foldername(name))[1]
          AND status = 'active'
      )
    )
  );

-- 3. Revoke EXECUTE on internal trigger SECURITY DEFINER functions from anon/authenticated.
-- These functions are only invoked as triggers and must not be callable directly via the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_new_patient_education() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.track_record_version() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
-- Keep public.has_role(uuid, app_role) executable since RLS policies call it.
