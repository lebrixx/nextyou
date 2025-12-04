-- Create security definer function to check group membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

-- Create security definer function to get user's group_ids
CREATE OR REPLACE FUNCTION public.get_user_group_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id
  FROM public.group_members
  WHERE user_id = _user_id
$$;

-- Fix group_members SELECT policy using security definer function
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  public.is_group_member(auth.uid(), group_id)
);

-- Fix groups SELECT policy  
DROP POLICY IF EXISTS "Users can view groups they're in" ON public.groups;
CREATE POLICY "Users can view groups they're in"
ON public.groups
FOR SELECT
USING (
  owner_id = auth.uid() OR
  public.is_group_member(auth.uid(), id)
);

-- Fix challenges SELECT policy
DROP POLICY IF EXISTS "Users can view challenges they created or participate in" ON public.challenges;
CREATE POLICY "Users can view challenges they created or participate in"
ON public.challenges
FOR SELECT
USING (
  creator_id = auth.uid() OR
  opponent_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.challenge_participants WHERE challenge_id = challenges.id AND user_id = auth.uid()) OR
  (group_id IS NOT NULL AND public.is_group_member(auth.uid(), group_id))
);