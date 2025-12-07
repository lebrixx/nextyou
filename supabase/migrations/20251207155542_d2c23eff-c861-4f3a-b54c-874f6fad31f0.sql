-- Enable realtime for challenge_participants to track live duel progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participants;