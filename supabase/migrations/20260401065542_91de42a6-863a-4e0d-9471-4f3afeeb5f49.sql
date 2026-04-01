
-- Create reminder_settings table
CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  title TEXT NOT NULL,
  reminder_time TIME NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'exchange',
  enabled BOOLEAN NOT NULL DEFAULT true,
  days_of_week TEXT[] NOT NULL DEFAULT '{Mon,Tue,Wed,Thu,Fri,Sat,Sun}',
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own reminders" ON public.reminder_settings FOR ALL
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors view patient reminders" ON public.reminder_settings FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments
    WHERE doctor_id = auth.uid() AND patient_id = reminder_settings.patient_id AND status = 'active'
  ));

CREATE POLICY "Admins manage all reminders" ON public.reminder_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_reminder_settings_updated_at
  BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create patient_achievements table
CREATE TABLE public.patient_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  achievement_type TEXT NOT NULL DEFAULT 'streak',
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own achievements" ON public.patient_achievements FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients insert own achievements" ON public.patient_achievements FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors view patient achievements" ON public.patient_achievements FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) AND EXISTS (
    SELECT 1 FROM doctor_patient_assignments
    WHERE doctor_id = auth.uid() AND patient_id = patient_achievements.patient_id AND status = 'active'
  ));

CREATE POLICY "Admins manage all achievements" ON public.patient_achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add unique constraint for auto-generated reminders per patient+time
CREATE UNIQUE INDEX idx_reminder_auto_patient_time ON public.reminder_settings (patient_id, reminder_time) WHERE is_auto_generated = true;
