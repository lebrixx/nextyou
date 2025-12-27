-- Allow users to view habit completions of their friends
CREATE POLICY "Users can view friend habit completions"
ON public.habit_completions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.user_id = auth.uid() AND f.friend_id = habit_completions.user_id)
      OR (f.friend_id = auth.uid() AND f.user_id = habit_completions.user_id)
    )
  )
);

-- Allow users to view habits of their friends (for displaying habit names)
CREATE POLICY "Users can view friend habits"
ON public.habits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.user_id = auth.uid() AND f.friend_id = habits.user_id)
      OR (f.friend_id = auth.uid() AND f.user_id = habits.user_id)
    )
  )
);

-- Enable realtime for habit_completions
ALTER TABLE public.habit_completions REPLICA IDENTITY FULL;