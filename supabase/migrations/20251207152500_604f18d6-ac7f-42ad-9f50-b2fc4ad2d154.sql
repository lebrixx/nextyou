-- Fix 1: Profiles table - Remove overly permissive policy and add secure alternatives
-- Drop the dangerous policy that allows anyone to read all profiles
DROP POLICY IF EXISTS "Users can find profiles by friend code" ON public.profiles;

-- Create a secure function to search profiles by friend code
CREATE OR REPLACE FUNCTION public.search_profile_by_friend_code(_friend_code text)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  friend_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return limited profile info when searching by exact friend code
  -- Never expose email addresses through this function
  IF _friend_code IS NULL OR LENGTH(_friend_code) != 8 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT p.id, p.full_name, p.avatar_url, p.friend_code
  FROM public.profiles p
  WHERE UPPER(p.friend_code) = UPPER(_friend_code);
END;
$$;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can view profiles of their friends (accepted friendships)
CREATE POLICY "Users can view friend profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.status = 'accepted'
      AND (
        (f.user_id = auth.uid() AND f.friend_id = profiles.id)
        OR (f.friend_id = auth.uid() AND f.user_id = profiles.id)
      )
    )
  );

-- Policy: Users can view profiles of group members in their groups
CREATE POLICY "Users can view group member profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = profiles.id
    )
  );

-- Fix 2: Group Stats table - Remove overly permissive ALL policy
DROP POLICY IF EXISTS "System can update group stats" ON public.group_stats;

-- Create a secure function to update group stats (only callable by group members)
CREATE OR REPLACE FUNCTION public.increment_group_stats(
  _group_id uuid,
  _habits_completed int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is a group member
  IF NOT is_group_member(auth.uid(), _group_id) THEN
    RAISE EXCEPTION 'Not authorized: not a group member';
  END IF;
  
  -- Upsert the stats
  INSERT INTO public.group_stats (group_id, total_habits_completed, last_activity_date, updated_at)
  VALUES (_group_id, _habits_completed, CURRENT_DATE, NOW())
  ON CONFLICT (group_id) 
  DO UPDATE SET 
    total_habits_completed = group_stats.total_habits_completed + _habits_completed,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();
END;
$$;

-- Policy: Only group members can view their group's stats
CREATE POLICY "Members can view own group stats" ON public.group_stats
  FOR SELECT USING (
    is_group_member(auth.uid(), group_id) 
    OR EXISTS (
      SELECT 1 FROM public.groups g 
      WHERE g.id = group_stats.group_id 
      AND g.owner_id = auth.uid()
    )
  );

-- Policy: Only group owners can insert initial stats
CREATE POLICY "Owners can insert group stats" ON public.group_stats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups g 
      WHERE g.id = group_stats.group_id 
      AND g.owner_id = auth.uid()
    )
  );

-- Policy: Members can update their group's stats (limited updates)
CREATE POLICY "Members can update group stats" ON public.group_stats
  FOR UPDATE USING (
    is_group_member(auth.uid(), group_id)
  );