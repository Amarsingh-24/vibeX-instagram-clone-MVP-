-- Drop existing check constraint if it exists
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated check constraint with all notification types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'like',
  'comment', 
  'follow',
  'welcome',
  'welcome_back',
  'story_view'
));