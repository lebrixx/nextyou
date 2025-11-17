-- Add two_minute_version and is_two_minute_active columns to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS two_minute_version text NULL,
ADD COLUMN IF NOT EXISTS is_two_minute_active boolean DEFAULT false;

-- Create habit_blocks table for NextMe Blocks feature
CREATE TABLE IF NOT EXISTS public.habit_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on habit_blocks
ALTER TABLE public.habit_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for habit_blocks
CREATE POLICY "Users can view their own habit blocks"
ON public.habit_blocks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit blocks"
ON public.habit_blocks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit blocks"
ON public.habit_blocks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit blocks"
ON public.habit_blocks
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for habit_blocks updated_at
CREATE TRIGGER update_habit_blocks_updated_at
BEFORE UPDATE ON public.habit_blocks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_habit_blocks_user_date 
ON public.habit_blocks(user_id, date);

-- Add new badge types for emotional badges
-- No schema change needed as badge_type is just text