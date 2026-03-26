
ALTER TABLE public.lab_results
  ADD COLUMN IF NOT EXISTS tc integer,
  ADD COLUMN IF NOT EXISTS neutrophil numeric,
  ADD COLUMN IF NOT EXISTS lymphocyte numeric,
  ADD COLUMN IF NOT EXISTS platelets numeric,
  ADD COLUMN IF NOT EXISTS ipth numeric,
  ADD COLUMN IF NOT EXISTS uric_acid numeric,
  ADD COLUMN IF NOT EXISTS rbs numeric,
  ADD COLUMN IF NOT EXISTS fbs numeric,
  ADD COLUMN IF NOT EXISTS pp numeric,
  ADD COLUMN IF NOT EXISTS hba1c numeric,
  ADD COLUMN IF NOT EXISTS peritoneal_fluid_report_url text,
  ADD COLUMN IF NOT EXISTS pet_test_report_url text;
