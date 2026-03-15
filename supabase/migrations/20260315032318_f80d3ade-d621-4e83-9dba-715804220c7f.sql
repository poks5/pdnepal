-- 1. Remove the old unrestricted coordinator update policy on user_roles
DROP POLICY IF EXISTS "Coordinators can update roles" ON public.user_roles;

-- 2. Fix user_roles SELECT policies to use authenticated instead of public
DROP POLICY IF EXISTS "Authenticated users can view doctor roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view dietician roles" ON public.user_roles;

CREATE POLICY "Authenticated users can view doctor roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (role = 'doctor'::app_role);

CREATE POLICY "Authenticated users can view dietician roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (role = 'dietician'::app_role);

-- 3. Fix lab_results INSERT policy to require doctor role + assignment
DROP POLICY IF EXISTS "Lab entry by recorder" ON public.lab_results;

CREATE POLICY "Doctors insert labs for assigned patients"
  ON public.lab_results FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = entered_by AND (
      has_role(auth.uid(), 'admin'::app_role) OR (
        has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
          SELECT 1 FROM doctor_patient_assignments
          WHERE doctor_id = auth.uid()
            AND patient_id = lab_results.patient_id
            AND status = 'active'
        )
      )
    )
  );

-- 4. Restrict patient profile viewing to assigned care team only
DROP POLICY IF EXISTS "Patients can view doctor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Patients can view dietician profiles" ON public.profiles;

CREATE POLICY "Patients can view assigned doctor profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'patient'::app_role) AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_patient_assignments.patient_id = auth.uid()
        AND doctor_patient_assignments.doctor_id = profiles.user_id
        AND doctor_patient_assignments.status = 'active'
    )
  );

CREATE POLICY "Patients can view assigned dietician profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'patient'::app_role) AND EXISTS (
      SELECT 1 FROM dietician_patient_assignments
      WHERE dietician_patient_assignments.patient_id = auth.uid()
        AND dietician_patient_assignments.dietician_id = profiles.user_id
        AND dietician_patient_assignments.status = 'active'
    )
  );