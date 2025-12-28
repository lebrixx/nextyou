-- Fix increment_duel_wins to require authorization
CREATE OR REPLACE FUNCTION public.increment_duel_wins(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify the caller is the user being updated OR is processing a challenge they participated in
  IF _user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM challenges c
    WHERE (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
    AND (c.creator_id = _user_id OR c.opponent_id = _user_id)
    AND c.status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Not authorized to update duel wins for this user';
  END IF;

  UPDATE public.profiles 
  SET duel_wins = duel_wins + 1,
      duel_streak = duel_streak + 1,
      updated_at = NOW()
  WHERE id = _user_id;
END;
$$;

-- Fix reset_duel_streak to require authorization
CREATE OR REPLACE FUNCTION public.reset_duel_streak(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify the caller is the user being updated OR is processing a challenge they participated in
  IF _user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM challenges c
    WHERE (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
    AND (c.creator_id = _user_id OR c.opponent_id = _user_id)
    AND c.status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Not authorized to reset duel streak for this user';
  END IF;

  UPDATE public.profiles 
  SET duel_streak = 0,
      updated_at = NOW()
  WHERE id = _user_id;
END;
$$;