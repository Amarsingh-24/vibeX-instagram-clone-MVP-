-- Fix create_welcome_notifications function search_path
CREATE OR REPLACE FUNCTION public.create_welcome_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert welcome notification
  INSERT INTO notifications (user_id, actor_id, type, read)
  VALUES (NEW.id, NEW.id, 'welcome', false);
  
  RETURN NEW;
END;
$function$;