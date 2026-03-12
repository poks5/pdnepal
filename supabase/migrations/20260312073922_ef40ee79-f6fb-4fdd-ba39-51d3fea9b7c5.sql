
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nagrita_number text,
ADD COLUMN IF NOT EXISTS nagrita_district text;
