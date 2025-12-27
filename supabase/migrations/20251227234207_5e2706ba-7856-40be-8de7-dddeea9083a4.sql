-- Allow users to view profiles of people who sent them pending friend requests
CREATE POLICY "Users can view pending request sender profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friendships f
    WHERE f.status = 'pending'
      AND f.friend_id = auth.uid()
      AND f.user_id = profiles.id
  )
);