-- Add group_streak and group activity tracking
CREATE TABLE IF NOT EXISTS public.group_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_habits_completed INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE DEFAULT NULL,
  weekly_goal INTEGER DEFAULT 50,
  weekly_progress INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id)
);

-- Group activity feed
CREATE TABLE IF NOT EXISTS public.group_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'habit_completed', 'streak_milestone', 'joined', 'challenge_won'
  habit_name TEXT DEFAULT NULL,
  message TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Duel badges table
CREATE TABLE IF NOT EXISTS public.duel_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  winner_id UUID DEFAULT NULL,
  loser_id UUID DEFAULT NULL,
  winner_score INTEGER DEFAULT 0,
  loser_score INTEGER DEFAULT 0,
  badge_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id)
);

-- Enable RLS
ALTER TABLE public.group_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_stats
CREATE POLICY "Members can view group stats" ON public.group_stats
FOR SELECT USING (is_group_member(auth.uid(), group_id) OR EXISTS (
  SELECT 1 FROM groups WHERE id = group_id AND owner_id = auth.uid()
));

CREATE POLICY "System can update group stats" ON public.group_stats
FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for group_activity  
CREATE POLICY "Members can view group activity" ON public.group_activity
FOR SELECT USING (is_group_member(auth.uid(), group_id) OR EXISTS (
  SELECT 1 FROM groups WHERE id = group_id AND owner_id = auth.uid()
));

CREATE POLICY "Members can insert activity" ON public.group_activity
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for duel_results
CREATE POLICY "Participants can view duel results" ON public.duel_results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM challenges c 
    WHERE c.id = challenge_id 
    AND (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
  )
);

CREATE POLICY "System can insert duel results" ON public.duel_results
FOR INSERT WITH CHECK (true);

-- Enable realtime for group_activity
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_activity;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_group_activity_group_id ON public.group_activity(group_id);
CREATE INDEX IF NOT EXISTS idx_group_activity_created_at ON public.group_activity(created_at DESC);