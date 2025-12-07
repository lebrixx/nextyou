-- Add habit_id reference to duels for specific habit tracking
-- This allows duels to target a specific habit rather than all completions

-- Update challenges table to ensure habit-specific duels work properly
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS habit_name TEXT;

-- Add duel_wins column to profiles for quick leaderboard access
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS duel_wins INTEGER NOT NULL DEFAULT 0;

-- Add duel_streak (consecutive duel wins) to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS duel_streak INTEGER NOT NULL DEFAULT 0;

-- Create a function to increment duel wins
CREATE OR REPLACE FUNCTION public.increment_duel_wins(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET duel_wins = duel_wins + 1,
      duel_streak = duel_streak + 1,
      updated_at = NOW()
  WHERE id = _user_id;
END;
$function$;

-- Create a function to reset duel streak (called when user loses)
CREATE OR REPLACE FUNCTION public.reset_duel_streak(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET duel_streak = 0,
      updated_at = NOW()
  WHERE id = _user_id;
END;
$function$;