-- 1. Create a secure view for profiles that excludes email
-- This view will be used instead of direct profiles table access for friend/group features
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  avatar_url,
  friend_code,
  duel_wins,
  duel_streak,
  created_at,
  updated_at
FROM public.profiles;

-- 2. Add DELETE policy for pomodoro_sessions
-- Allow users to delete their own pomodoro sessions
CREATE POLICY "Users can delete their own pomodoro sessions"
ON public.pomodoro_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Add constraint on profiles.full_name for length validation
-- This provides server-side validation for username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_full_name_length'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_full_name_length 
    CHECK (full_name IS NULL OR (length(trim(full_name)) >= 2 AND length(full_name) <= 30));
  END IF;
END $$;