-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view challenges they created or participate in" ON challenges;
DROP POLICY IF EXISTS "Users can view challenge participants" ON challenge_participants;
DROP POLICY IF EXISTS "Challenge creators can add participants" ON challenge_participants;

-- Create a SECURITY DEFINER function to check challenge participation without RLS
CREATE OR REPLACE FUNCTION public.is_challenge_participant(_user_id uuid, _challenge_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.challenge_participants
    WHERE user_id = _user_id
      AND challenge_id = _challenge_id
  )
$$;

-- Create a SECURITY DEFINER function to check if user is challenge creator
CREATE OR REPLACE FUNCTION public.is_challenge_creator(_user_id uuid, _challenge_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.challenges
    WHERE id = _challenge_id
      AND creator_id = _user_id
  )
$$;

-- Simplified SELECT policy for challenges (no subquery to challenge_participants)
CREATE POLICY "Users can view challenges they created or participate in"
ON challenges
FOR SELECT
USING (
  creator_id = auth.uid() 
  OR opponent_id = auth.uid()
  OR is_challenge_participant(auth.uid(), id)
  OR (group_id IS NOT NULL AND is_group_member(auth.uid(), group_id))
);

-- Simplified SELECT policy for challenge_participants (using function)
CREATE POLICY "Users can view challenge participants"
ON challenge_participants
FOR SELECT
USING (
  user_id = auth.uid()
  OR is_challenge_creator(auth.uid(), challenge_id)
);

-- Simplified INSERT policy for challenge_participants (using function)
CREATE POLICY "Challenge creators can add participants"
ON challenge_participants
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR is_challenge_creator(auth.uid(), challenge_id)
);