# Supabase Database Setup

This directory contains the Supabase configuration and database migrations for vibeX.

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile information (username, avatar, bio) |
| `posts` | User-created posts with images and captions |
| `comments` | Comments on posts |
| `likes` | Post likes tracking |
| `follows` | User follow relationships |
| `stories` | Ephemeral story content (24h expiry) |
| `story_views` | Story view analytics |
| `conversations` | Chat conversation metadata |
| `conversation_participants` | Chat participants |
| `messages` | Direct messages |
| `notifications` | User notifications |

### Entity Relationship

```
profiles
    ├── posts (1:many)
    │   ├── comments (1:many)
    │   └── likes (1:many)
    ├── stories (1:many)
    │   └── story_views (1:many)
    ├── follows (many:many via follower/following)
    ├── notifications (1:many)
    └── conversation_participants (many:many)
        └── conversations
            └── messages (1:many)
```

## Row-Level Security (RLS)

All tables have RLS enabled. Key policies:

### Profiles
- **SELECT**: Public (anyone can view profiles)
- **INSERT**: Users can only create their own profile
- **UPDATE**: Users can only update their own profile

### Posts
- **SELECT**: Public (anyone can view posts)
- **INSERT**: Authenticated users can create posts
- **UPDATE/DELETE**: Only post owner

### Messages
- **SELECT**: Only conversation participants
- **INSERT**: Only conversation participants
- **UPDATE**: Only message sender

### Conversations
- **INSERT**: Only existing participants or creator can add new members

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `posts` | Public | Post images |
| `avatars` | Public | Profile pictures |
| `stories` | Public | Story media |

## Running Migrations

Migrations are automatically applied when connected to Supabase. They are located in `supabase/migrations/` and run in chronological order.

### Migration Files

Each migration file follows the naming convention:
```
YYYYMMDDHHMMSS_description.sql
```

## Local Development

To run Supabase locally:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase db reset
   ```

4. Update `.env` with local credentials:
   ```
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
   ```

## Database Functions

### `is_conversation_member(conversation_uuid, user_uuid)`
Returns boolean indicating if a user is a participant in a conversation.

### `update_updated_at_column()`
Trigger function that automatically updates `updated_at` timestamps.

## Constraints

| Table | Constraint | Rule |
|-------|------------|------|
| `posts` | `posts_caption_length` | Caption ≤ 500 chars |
| `comments` | `comments_text_length` | Text ≤ 500 chars |
| `profiles` | `profiles_username_length` | Username 3-30 chars |
| `profiles` | `profiles_bio_length` | Bio ≤ 500 chars |
| `messages` | `messages_content_length` | Content ≤ 2000 chars |

## Troubleshooting

### "Permission denied" errors
- Check that RLS policies allow the operation
- Verify the user is authenticated
- Check that the user owns the resource (for UPDATE/DELETE)

### Real-time not working
- Ensure the table is added to the `supabase_realtime` publication
- Check that RLS allows SELECT for the user

### Storage upload failing
- Verify bucket exists and has correct policies
- Check file size limits (default 50MB)
- Ensure user is authenticated
