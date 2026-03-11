
-- Backfill profiles for all auth users who don't have one yet
INSERT INTO public.profiles (user_id, full_name, language)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', u.email), COALESCE(u.raw_user_meta_data->>'language', 'en')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id)
ON CONFLICT DO NOTHING;

-- Backfill user_roles for auth users who don't have any role yet
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, COALESCE((u.raw_user_meta_data->>'role')::app_role, 'patient')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id)
ON CONFLICT DO NOTHING;

-- Add admin role to anilpokhrel@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'anilpokhrel@gmail.com'
ON CONFLICT DO NOTHING;

-- Ensure anilpokhrel@gmail.com also has doctor role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'doctor'::app_role FROM auth.users WHERE email = 'anilpokhrel@gmail.com'
ON CONFLICT DO NOTHING;
