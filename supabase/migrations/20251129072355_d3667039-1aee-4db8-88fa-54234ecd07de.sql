-- Fix stories storage bucket RLS policies by dropping all first
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can upload stories" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own stories" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own stories" ON storage.objects;
  DROP POLICY IF EXISTS "Stories are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view stories" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload stories" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own stories" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own stories" ON storage.objects;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create proper RLS policies for stories bucket
CREATE POLICY "Stories public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Stories authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Stories owner update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Stories owner delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix infinite recursion in conversation_participants
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;

-- Create a security definer function to check conversation access
CREATE OR REPLACE FUNCTION is_conversation_member(conversation_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conversation_uuid
    AND user_id = user_uuid
  );
$$;

-- Use the function in the policy to avoid recursion
CREATE POLICY "Users can view participants in their conversations"
ON conversation_participants FOR SELECT
USING (
  user_id = auth.uid()
  OR
  is_conversation_member(conversation_id, auth.uid())
);

-- Create welcome notifications function
CREATE OR REPLACE FUNCTION create_welcome_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert welcome notification
  INSERT INTO notifications (user_id, actor_id, type, read)
  VALUES (NEW.id, NEW.id, 'welcome', false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for welcome notifications
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_welcome_notifications();