-- Update the check constraint to include all needed notification types
ALTER TABLE public.social_notifications DROP CONSTRAINT social_notifications_type_check;

ALTER TABLE public.social_notifications ADD CONSTRAINT social_notifications_type_check 
CHECK (type = ANY (ARRAY['nudge'::text, 'group_invite'::text, 'friend_request'::text, 'encouragement'::text, 'motivation'::text, 'challenge'::text, 'duel_update'::text]));