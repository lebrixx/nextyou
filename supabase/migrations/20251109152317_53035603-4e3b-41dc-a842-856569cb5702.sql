-- Add notification_delay column to reminders table
ALTER TABLE public.reminders 
ADD COLUMN notification_delay integer DEFAULT 0;

COMMENT ON COLUMN public.reminders.notification_delay IS 'Delay in minutes before the reminder date/time to send notification (e.g., 60 for 1 hour before)';