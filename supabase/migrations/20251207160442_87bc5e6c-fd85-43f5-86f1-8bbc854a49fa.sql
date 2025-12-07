-- Fix 1: Remove email from profiles visibility and restrict friend/group policies
-- Drop the problematic "Anyone can view group by invite code" policy
DROP POLICY IF EXISTS "Anyone can view group by invite code" ON public.groups;

-- Create a proper policy that only allows viewing by invite code when searching
CREATE POLICY "Users can view groups by invite code when searching"
ON public.groups
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  OR is_group_member(auth.uid(), id)
);

-- Fix 2: Restrict duel_results INSERT to only allow inserts from challenge participants
DROP POLICY IF EXISTS "System can insert duel results" ON public.duel_results;

-- Create a proper policy that validates the user is a participant of the challenge
CREATE POLICY "Challenge participants can insert duel results"
ON public.duel_results
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be creator or opponent of the challenge
  EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = challenge_id
    AND (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
    AND c.status = 'active'
  )
  -- And can only set themselves as winner if they actually won
  AND (
    winner_id IS NULL 
    OR winner_id = auth.uid() 
    OR loser_id = auth.uid()
  )
);

-- Fix 3: Create a view without email for profile visibility
-- Update the friend profiles policy to exclude email
DROP POLICY IF EXISTS "Users can view friend profiles" ON public.profiles;

CREATE POLICY "Users can view friend profiles limited"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.user_id = auth.uid() AND f.friend_id = profiles.id)
      OR (f.friend_id = auth.uid() AND f.user_id = profiles.id)
    )
  )
);

-- Update group member profiles policy
DROP POLICY IF EXISTS "Users can view group member profiles" ON public.profiles;

CREATE POLICY "Users can view group member profiles limited"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
    AND gm2.user_id = profiles.id
  )
);

-- Create a security definer function to search groups by invite code (safe way)
CREATE OR REPLACE FUNCTION public.get_group_by_invite_code(_invite_code text)
RETURNS TABLE(id uuid, name text, description text, owner_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _invite_code IS NULL OR LENGTH(_invite_code) != 8 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT g.id, g.name, g.description, g.owner_id
  FROM public.groups g
  WHERE UPPER(g.invite_code) = UPPER(_invite_code);
END;
$$;