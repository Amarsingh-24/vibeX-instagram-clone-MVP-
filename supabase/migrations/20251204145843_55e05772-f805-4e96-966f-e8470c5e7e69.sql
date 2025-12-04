-- Fix conversation participants security vulnerability
DROP POLICY IF EXISTS "Authenticated users can add participants" ON conversation_participants;
CREATE POLICY "Only conversation members can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- User is the conversation creator
      EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id AND created_by = auth.uid()
      )
      OR
      -- User is already a participant
      is_conversation_member(conversation_id, auth.uid())
    )
  );

-- Add server-side input validation constraints
ALTER TABLE posts ADD CONSTRAINT posts_caption_length CHECK (caption IS NULL OR char_length(caption) <= 500);
ALTER TABLE comments ADD CONSTRAINT comments_text_length CHECK (char_length(text) <= 500);
ALTER TABLE profiles ADD CONSTRAINT profiles_username_length CHECK (char_length(username) BETWEEN 3 AND 30);
ALTER TABLE profiles ADD CONSTRAINT profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 500);
ALTER TABLE messages ADD CONSTRAINT messages_content_length CHECK (char_length(content) <= 2000);