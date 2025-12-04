-- Allow users to find profiles by friend_code (for adding friends)
CREATE POLICY "Users can find profiles by friend code"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;