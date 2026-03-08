
-- Create storage bucket for clinical photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinical-photos', 'clinical-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload clinical photos
CREATE POLICY "Authenticated users upload clinical photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'clinical-photos');

-- Allow authenticated users to view clinical photos
CREATE POLICY "Authenticated users view clinical photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'clinical-photos');

-- Allow users to delete their own uploads
CREATE POLICY "Users delete own clinical photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'clinical-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add photo_urls column to peritonitis_episodes
ALTER TABLE public.peritonitis_episodes
ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}'::text[];
