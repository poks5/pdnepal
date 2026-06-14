
-- 1. Remove broad user_roles SELECT policies that exposed all doctor/dietician user_ids
DROP POLICY IF EXISTS "Authenticated users can view doctor roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view dietician roles" ON public.user_roles;

-- 2. SECURITY DEFINER: staff directory for browsing (doctors, dieticians, nurses)
CREATE OR REPLACE FUNCTION public.get_staff_directory(_role app_role)
RETURNS TABLE(user_id uuid, full_name text, hospital text, specialization text[], avatar_url text, phone text, language text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.user_id, p.full_name, p.hospital, p.specialization, p.avatar_url, p.phone, p.language
  FROM public.user_roles ur
  JOIN public.profiles p ON p.user_id = ur.user_id
  WHERE ur.role = _role AND _role IN ('doctor'::app_role,'dietician'::app_role,'nurse'::app_role);
$$;
REVOKE EXECUTE ON FUNCTION public.get_staff_directory(app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_staff_directory(app_role) TO authenticated;

-- 3. SECURITY DEFINER: lookup roles of specific user_ids (for chat contacts)
CREATE OR REPLACE FUNCTION public.get_roles_for_users(_user_ids uuid[])
RETURNS TABLE(user_id uuid, role app_role)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT ur.user_id, ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = ANY(_user_ids);
$$;
REVOKE EXECUTE ON FUNCTION public.get_roles_for_users(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_roles_for_users(uuid[]) TO authenticated;

-- 4. Add UPDATE policy on storage.objects for clinical-photos mirroring INSERT
DROP POLICY IF EXISTS "Clinical photos scoped update" ON storage.objects;
CREATE POLICY "Clinical photos scoped update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
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
  )
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
