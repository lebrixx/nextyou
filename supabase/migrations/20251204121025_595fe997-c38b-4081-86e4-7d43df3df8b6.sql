-- Fix infinite recursion in group_members policy
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);

-- Fix infinite recursion in groups policy  
DROP POLICY IF EXISTS "Users can view groups they're in" ON public.groups;
CREATE POLICY "Users can view groups they're in"
ON public.groups
FOR SELECT
USING (
  owner_id = auth.uid() OR
  id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);

-- Fix infinite recursion in challenges policy
DROP POLICY IF EXISTS "Users can view challenges they created or participate in" ON public.challenges;
CREATE POLICY "Users can view challenges they created or participate in"
ON public.challenges
FOR SELECT
USING (
  creator_id = auth.uid() OR
  opponent_id = auth.uid() OR
  id IN (SELECT challenge_id FROM public.challenge_participants WHERE user_id = auth.uid()) OR
  group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);