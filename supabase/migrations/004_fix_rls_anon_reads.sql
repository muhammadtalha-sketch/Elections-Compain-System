-- Allow anonymous (unauthenticated) reads on members table.
-- The app uses the anon key without Supabase Auth sessions,
-- so auth.role() returns 'anon', not 'authenticated'.
-- Views (member_statistics_view, area_statistics_view) already work for anon
-- because they were created by the postgres superuser (SECURITY DEFINER behaviour).
-- This aligns the direct table reads to match.

DROP POLICY IF EXISTS "members_select" ON public.members;
CREATE POLICY "members_select" ON public.members
  FOR SELECT USING (true);

-- Also fix area_statistics_view reads (used by search/add-member dropdowns)
DROP POLICY IF EXISTS "members_insert" ON public.members;
CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- Fix activity_logs so the timeline doesn't silently return empty
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT USING (true);

-- Fix profiles so users table loads
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);
