-- Fix generate_friend_code function to set search_path
CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.friend_code IS NULL THEN
    NEW.friend_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$function$;