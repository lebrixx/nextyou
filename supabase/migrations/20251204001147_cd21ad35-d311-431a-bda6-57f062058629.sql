-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'duel', -- 'duel' or 'group'
  target_type TEXT NOT NULL DEFAULT 'completions', -- 'completions', 'streak', 'specific_habit'
  target_value INTEGER NOT NULL DEFAULT 7,
  habit_id UUID,
  group_id UUID,
  opponent_id UUID,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table for tracking progress
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenges
CREATE POLICY "Users can view challenges they created or participate in"
ON public.challenges FOR SELECT
USING (
  creator_id = auth.uid() OR 
  opponent_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.challenge_participants WHERE challenge_id = challenges.id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = challenges.group_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create challenges"
ON public.challenges FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own challenges"
ON public.challenges FOR UPDATE
USING (creator_id = auth.uid() OR opponent_id = auth.uid());

CREATE POLICY "Creators can delete their challenges"
ON public.challenges FOR DELETE
USING (creator_id = auth.uid());

-- RLS policies for challenge participants
CREATE POLICY "Users can view challenge participants"
ON public.challenge_participants FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.challenges WHERE id = challenge_id AND (creator_id = auth.uid() OR opponent_id = auth.uid()))
);

CREATE POLICY "Challenge creators can add participants"
ON public.challenge_participants FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.challenges WHERE id = challenge_id AND creator_id = auth.uid()) OR
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own participation"
ON public.challenge_participants FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their participation"
ON public.challenge_participants FOR DELETE
USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_challenge_participants_updated_at
BEFORE UPDATE ON public.challenge_participants
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();