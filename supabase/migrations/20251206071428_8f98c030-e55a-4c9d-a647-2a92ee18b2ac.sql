-- Add server-side input validation constraints for security (using DROP IF EXISTS + CREATE)

-- First drop any existing constraints, then recreate
DO $$ 
BEGIN
    -- Posts caption constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_caption_length') THEN
        ALTER TABLE posts DROP CONSTRAINT posts_caption_length;
    END IF;
    
    -- Comments text constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_text_length') THEN
        ALTER TABLE comments DROP CONSTRAINT comments_text_length;
    END IF;
    
    -- Profiles username constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_length') THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_username_length;
    END IF;
    
    -- Profiles bio constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_bio_length') THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_bio_length;
    END IF;
    
    -- Messages content constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_content_length') THEN
        ALTER TABLE messages DROP CONSTRAINT messages_content_length;
    END IF;
END $$;

-- Now add all constraints
ALTER TABLE posts ADD CONSTRAINT posts_caption_length 
CHECK (caption IS NULL OR char_length(caption) <= 500);

ALTER TABLE comments ADD CONSTRAINT comments_text_length 
CHECK (char_length(text) <= 500);

ALTER TABLE profiles ADD CONSTRAINT profiles_username_length 
CHECK (char_length(username) BETWEEN 3 AND 30);

ALTER TABLE profiles ADD CONSTRAINT profiles_bio_length 
CHECK (bio IS NULL OR char_length(bio) <= 500);

ALTER TABLE messages ADD CONSTRAINT messages_content_length 
CHECK (char_length(content) <= 2000);