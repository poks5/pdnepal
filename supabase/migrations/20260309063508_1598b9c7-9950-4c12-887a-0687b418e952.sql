ALTER TABLE public.pd_settings
  ADD COLUMN IF NOT EXISTS catheter_model text,
  ADD COLUMN IF NOT EXISTS catheter_size_fr text,
  ADD COLUMN IF NOT EXISTS catheter_length_cm text,
  ADD COLUMN IF NOT EXISTS catheter_tip_type text,
  ADD COLUMN IF NOT EXISTS catheter_cuff_type text;