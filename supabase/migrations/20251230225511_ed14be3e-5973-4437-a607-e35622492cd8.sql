-- Allow users to view their friends' badges
CREATE POLICY "Users can view friend badges" 
ON public.badges 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.user_id = auth.uid() AND f.friend_id = badges.user_id)
      OR (f.friend_id = auth.uid() AND f.user_id = badges.user_id)
    )
  )
);