-- Create friend_streaks table to track mutual daily completions
CREATE TABLE public.friend_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_mutual_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friend_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view their own streaks
CREATE POLICY "Users can view their own streaks"
ON public.friend_streaks
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can insert their own streaks
CREATE POLICY "Users can insert their own streaks"
ON public.friend_streaks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own streaks
CREATE POLICY "Users can update their own streaks"
ON public.friend_streaks
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create trigger for updated_at using existing function
CREATE TRIGGER update_friend_streaks_updated_at
BEFORE UPDATE ON public.friend_streaks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for friend_streaks
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_streaks;