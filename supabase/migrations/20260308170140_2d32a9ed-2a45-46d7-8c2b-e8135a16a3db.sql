
-- Learning progress tracking table
CREATE TABLE public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  quiz_score integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Users manage own progress
CREATE POLICY "Users manage own learning progress"
  ON public.learning_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Doctors view assigned patient progress
CREATE POLICY "Doctors view patient learning progress"
  ON public.learning_progress FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_patient_assignments.doctor_id = auth.uid()
        AND doctor_patient_assignments.patient_id = learning_progress.user_id
        AND doctor_patient_assignments.status = 'active'
    )
  );

-- Admins manage all
CREATE POLICY "Admins manage all learning progress"
  ON public.learning_progress FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Doctor-assigned modules
CREATE TABLE public.learning_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  module_id text NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  UNIQUE(patient_id, module_id)
);

ALTER TABLE public.learning_assignments ENABLE ROW LEVEL SECURITY;

-- Patients view own assignments
CREATE POLICY "Patients view own learning assignments"
  ON public.learning_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- Doctors manage assignments for their patients
CREATE POLICY "Doctors manage learning assignments"
  ON public.learning_assignments FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_patient_assignments.doctor_id = auth.uid()
        AND doctor_patient_assignments.patient_id = learning_assignments.patient_id
        AND doctor_patient_assignments.status = 'active'
    )
  );

-- Admins manage all
CREATE POLICY "Admins manage all learning assignments"
  ON public.learning_assignments FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
