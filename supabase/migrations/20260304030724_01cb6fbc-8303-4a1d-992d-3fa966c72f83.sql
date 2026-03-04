
-- Tighten audit log INSERT to authenticated users only
DROP POLICY "System insert audit" ON public.audit_log;
CREATE POLICY "Authenticated users insert audit" ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
