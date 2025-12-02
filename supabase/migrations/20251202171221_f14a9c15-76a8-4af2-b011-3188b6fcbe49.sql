-- Add created_by column to track conversation creator
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Drop and recreate the SELECT policy to include creators
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Update INSERT policy to set created_by
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);