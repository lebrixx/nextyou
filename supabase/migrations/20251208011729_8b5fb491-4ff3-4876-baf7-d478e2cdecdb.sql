-- Add duel_mode column to challenges table
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS duel_mode text NOT NULL DEFAULT 'regularity';

-- Add comment explaining modes
COMMENT ON COLUMN public.challenges.duel_mode IS 'Duel mode: regularity (1pt/day), specific_habit (count habit completions), sprint (most in 24-72h), endurance (first to X), streak (longest series)';