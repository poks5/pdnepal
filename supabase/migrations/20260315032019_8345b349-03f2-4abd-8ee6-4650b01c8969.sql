-- 1. Harden handle_new_user to only allow patient/caregiver self-registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  -- Only allow patient and caregiver for self-registration; default to patient
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'patient') IN ('patient', 'caregiver') THEN
    _role := (NEW.raw_user_meta_data->>'role')::app_role;
  ELSE
    _role := 'patient';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'language', 'en'));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  RETURN NEW;
END;
$function$;

-- 2. Make clinical-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'clinical-photos';

-- 3. Fix clinical_alerts INSERT policies - drop permissive ones, add restricted
DROP POLICY IF EXISTS "Service role inserts alerts" ON public.clinical_alerts;
DROP POLICY IF EXISTS "Doctors insert alerts" ON public.clinical_alerts;

CREATE POLICY "Doctors insert alerts for assigned patients"
  ON public.clinical_alerts FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR (
      has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
        SELECT 1 FROM doctor_patient_assignments
        WHERE doctor_id = auth.uid()
          AND patient_id = clinical_alerts.patient_id
          AND status = 'active'
      )
    )
  );

-- 4. Fix audit_log INSERT policy to enforce user_id = auth.uid()
DROP POLICY IF EXISTS "Authenticated users insert audit" ON public.audit_log;

CREATE POLICY "Authenticated users insert own audit"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 5. Restrict coordinator update on user_roles to only patient/caregiver roles
DROP POLICY IF EXISTS "Coordinators can update user roles" ON public.user_roles;

CREATE POLICY "Coordinators can update user roles limited"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'coordinator'::app_role))
  WITH CHECK (
    has_role(auth.uid(), 'coordinator'::app_role) 
    AND role IN ('patient'::app_role, 'caregiver'::app_role)
  );