
-- Function to auto-assign essential learning modules for new patients
CREATE OR REPLACE FUNCTION public.assign_new_patient_education()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _modules text[] := ARRAY['catheter-care', 'capd-exchange', 'recognizing-problems', 'peritonitis-education', 'emergency-situations'];
  _mod text;
BEGIN
  -- Only assign if the new user is a patient
  IF COALESCE((NEW.raw_user_meta_data->>'role'), 'patient') = 'patient' THEN
    FOREACH _mod IN ARRAY _modules LOOP
      INSERT INTO public.learning_assignments (patient_id, doctor_id, module_id, notes)
      VALUES (NEW.id, NEW.id, _mod, 'Auto-assigned: New Patient Education Pathway')
      ON CONFLICT (patient_id, module_id) DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users after insert (fires after handle_new_user)
CREATE TRIGGER on_new_user_assign_education
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_new_patient_education();
