
-- 1. Audit log: revoke client INSERT; only triggers/service role can write
DROP POLICY IF EXISTS "Authenticated users insert own audit" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated users insert audit" ON public.audit_log;
REVOKE INSERT ON public.audit_log FROM authenticated;
REVOKE INSERT ON public.audit_log FROM anon;

-- 2. Coordinators can only update rows currently scoped to patient/caregiver
DROP POLICY IF EXISTS "Coordinators can update user roles limited" ON public.user_roles;
CREATE POLICY "Coordinators can update user roles limited"
ON public.user_roles FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'coordinator'::app_role)
  AND role = ANY (ARRAY['patient'::app_role, 'caregiver'::app_role])
)
WITH CHECK (
  public.has_role(auth.uid(), 'coordinator'::app_role)
  AND role = ANY (ARRAY['patient'::app_role, 'caregiver'::app_role])
);

-- 3. Patients should not freely SELECT entire doctor profile rows.
-- The app uses the SECURITY DEFINER function get_staff_directory(_role) which
-- returns only safe fields (name, hospital, specialization, avatar, phone, language).
-- Drop the broad browse policy; patients still see assigned doctor profiles via
-- the existing "Patients can view assigned doctor profiles" policy.
DROP POLICY IF EXISTS "Patients can browse doctor profiles" ON public.profiles;

-- 4. Allow patients to create their own adequacy_calculations entries
CREATE POLICY "Patients insert own adequacy"
ON public.adequacy_calculations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id AND auth.uid() = created_by);

CREATE POLICY "Patients update own adequacy"
ON public.adequacy_calculations FOR UPDATE
TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);
