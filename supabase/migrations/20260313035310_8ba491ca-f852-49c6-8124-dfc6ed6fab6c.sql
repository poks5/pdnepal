
-- Create dietician_patient_assignments table
CREATE TABLE public.dietician_patient_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dietician_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID DEFAULT NULL,
  requested_by UUID DEFAULT NULL,
  request_reason TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(dietician_id, patient_id)
);

ALTER TABLE public.dietician_patient_assignments ENABLE ROW LEVEL SECURITY;

-- Patients can request dietician
CREATE POLICY "Patients can request dietician" ON public.dietician_patient_assignments
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'patient') AND patient_id = auth.uid() AND status = 'pending'
  );

-- Users can view own assignments
CREATE POLICY "Users view own dietician assignments" ON public.dietician_patient_assignments
  FOR SELECT USING (auth.uid() = dietician_id OR auth.uid() = patient_id);

-- Dieticians can update assignment status
CREATE POLICY "Dieticians update own assignments" ON public.dietician_patient_assignments
  FOR UPDATE USING (public.has_role(auth.uid(), 'dietician') AND dietician_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'dietician') AND dietician_id = auth.uid());

-- Admins manage all
CREATE POLICY "Admins manage dietician assignments" ON public.dietician_patient_assignments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Doctors can view dietician assignments for their patients
CREATE POLICY "Doctors view patient dietician assignments" ON public.dietician_patient_assignments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') AND EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_id = auth.uid() AND patient_id = dietician_patient_assignments.patient_id AND status = 'active'
    )
  );

-- Add dietician access RLS to clinical tables
-- Exchange logs
CREATE POLICY "Dieticians view patient exchanges" ON public.exchange_logs
  FOR SELECT USING (
    public.has_role(auth.uid(), 'dietician') AND EXISTS (
      SELECT 1 FROM dietician_patient_assignments
      WHERE dietician_id = auth.uid() AND patient_id = exchange_logs.patient_id AND status = 'active'
    )
  );

-- Lab results
CREATE POLICY "Dieticians view patient labs" ON public.lab_results
  FOR SELECT USING (
    public.has_role(auth.uid(), 'dietician') AND EXISTS (
      SELECT 1 FROM dietician_patient_assignments
      WHERE dietician_id = auth.uid() AND patient_id = lab_results.patient_id AND status = 'active'
    )
  );

-- Clinical alerts
CREATE POLICY "Dieticians view patient alerts" ON public.clinical_alerts
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'dietician') AND EXISTS (
      SELECT 1 FROM dietician_patient_assignments
      WHERE dietician_id = auth.uid() AND patient_id = clinical_alerts.patient_id AND status = 'active'
    )
  );

-- Profiles - dieticians can view assigned patient profiles
CREATE POLICY "Dieticians view assigned patient profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'dietician') AND EXISTS (
      SELECT 1 FROM dietician_patient_assignments
      WHERE dietician_id = auth.uid() AND patient_id = profiles.user_id AND status = 'active'
    )
  );

-- Patients can view dietician profiles
CREATE POLICY "Patients can view dietician profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'patient') AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = profiles.user_id AND user_roles.role = 'dietician'
    )
  );

-- Allow viewing dietician roles
CREATE POLICY "Authenticated users can view dietician roles" ON public.user_roles
  FOR SELECT USING (role = 'dietician');

-- Add conversation_type and conversation_id to messages for group chat
ALTER TABLE public.messages ADD COLUMN conversation_type TEXT NOT NULL DEFAULT 'direct';
ALTER TABLE public.messages ADD COLUMN conversation_id TEXT DEFAULT NULL;

-- Allow care team members to see group messages for their patients
CREATE POLICY "Care team views group messages" ON public.messages
  FOR SELECT USING (
    conversation_type = 'group' AND (
      auth.uid() = patient_id
      OR EXISTS (SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = messages.patient_id AND status = 'active')
      OR EXISTS (SELECT 1 FROM dietician_patient_assignments WHERE dietician_id = auth.uid() AND patient_id = messages.patient_id AND status = 'active')
      OR EXISTS (SELECT 1 FROM caregiver_patient_assignments WHERE caregiver_id = auth.uid() AND patient_id = messages.patient_id AND status = 'active')
    )
  );

-- Care team can insert group messages
CREATE POLICY "Care team sends group messages" ON public.messages
  FOR INSERT WITH CHECK (
    conversation_type = 'group' AND auth.uid() = sender_id AND (
      auth.uid() = patient_id
      OR EXISTS (SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = auth.uid() AND patient_id = messages.patient_id AND status = 'active')
      OR EXISTS (SELECT 1 FROM dietician_patient_assignments WHERE dietician_id = auth.uid() AND patient_id = messages.patient_id AND status = 'active')
      OR EXISTS (SELECT 1 FROM caregiver_patient_assignments WHERE caregiver_id = auth.uid() AND patient_id = messages.patient_id AND status = 'active')
    )
  );
