
-- Allow coordinators to view all profiles (needed for user management)
CREATE POLICY "Coordinators can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'coordinator'::app_role));

-- Allow coordinators to view all user_roles (needed for user management)
CREATE POLICY "Coordinators can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'coordinator'::app_role));

-- Allow coordinators to update user_roles (role changes)
CREATE POLICY "Coordinators can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'coordinator'::app_role))
WITH CHECK (has_role(auth.uid(), 'coordinator'::app_role));

-- Allow coordinators to update profiles
CREATE POLICY "Coordinators can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'coordinator'::app_role))
WITH CHECK (has_role(auth.uid(), 'coordinator'::app_role));
