# Technical Decisions

This document explains the key technical decisions made during the development of vibeX.

## Technology Stack

### Frontend: React + TypeScript

**Why React?**
- Component-based architecture enables reusable UI elements (PostCard, StoryViewer, etc.)
- Large ecosystem with mature libraries (React Query, React Router)
- Excellent TypeScript support for type safety
- Virtual DOM for efficient updates in real-time features

**Why TypeScript?**
- Catches errors at compile time rather than runtime
- Better IDE support with autocomplete and refactoring
- Self-documenting code through type definitions
- Essential for maintaining a growing codebase

### Styling: TailwindCSS

**Why TailwindCSS?**
- Utility-first approach speeds up development
- No context switching between CSS and JSX files
- Built-in responsive design utilities
- Easy to maintain consistent design system
- Small bundle size with purging unused styles

### Backend: Supabase (PostgreSQL)

**Why Supabase over alternatives?**

| Feature | Supabase | Firebase | Custom Backend |
|---------|----------|----------|----------------|
| Database | PostgreSQL (relational) | NoSQL | Varies |
| Real-time | Built-in | Built-in | Manual setup |
| Auth | Built-in | Built-in | Manual setup |
| Storage | Built-in | Built-in | Manual setup |
| RLS | Native SQL policies | Security rules | Manual |
| Vendor lock-in | Low (open source) | High | None |

**Key reasons:**
- PostgreSQL's relational model fits social media data (users → posts → comments → likes)
- Row-Level Security (RLS) provides database-level access control
- Real-time subscriptions for live updates (messages, notifications)
- Built-in file storage for posts, stories, and avatars
- Open source with ability to self-host

## Security Architecture

### Row-Level Security (RLS)

Every table has RLS enabled with specific policies:

```
profiles  → Public read, owner-only write
posts     → Public read, owner-only write/delete
comments  → Public read, owner-only write/delete
likes     → Public read, owner-only create/delete
follows   → Public read, authenticated create/delete
stories   → Public read, owner-only write/delete
messages  → Participant-only read/write
```

**Why RLS over application-level auth?**
- Security at the database layer (can't be bypassed)
- Policies written in SQL (auditable)
- Works with any client (web, mobile, API)
- Reduces attack surface

### Input Validation Strategy

**Client-side:**
- Immediate user feedback
- Prevents unnecessary API calls
- Character limits displayed in UI

**Server-side (database constraints):**
- Enforced even if client is bypassed
- CHECK constraints on text lengths
- Foreign key constraints for referential integrity

## Real-Time Features

### Implementation Approach

Used Supabase Realtime for:
- Direct messages (instant delivery)
- Notifications (likes, comments, follows)
- Story view tracking

**Why Supabase Realtime over WebSockets?**
- No server infrastructure to manage
- Automatic reconnection handling
- Built-in presence features
- Integrates with RLS policies

## File Storage

### Structure

```
storage/
├── posts/      → Post images (public)
├── avatars/    → Profile pictures (public)
└── stories/    → Story media (public, 24h expiry)
```

**Why public buckets?**
- Social media content is meant to be shared
- Simplifies URL sharing and embedding
- No signed URL overhead for reads
- RLS still controls who can upload/delete

## State Management

### React Query for Server State

**Why React Query over Redux/Zustand?**
- Built-in caching and cache invalidation
- Automatic background refetching
- Loading/error states handled automatically
- Optimistic updates for better UX
- Reduces boilerplate significantly

### Local State with React Hooks

Simple component state uses `useState` and `useReducer`:
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary client-only data

## Performance Considerations

### Optimizations Implemented

1. **Lazy loading** - Images load as they enter viewport
2. **Query caching** - React Query caches API responses
3. **Pagination** - Feed loads in chunks, not all at once
4. **Optimistic updates** - UI updates before server confirms

### Future Improvements

- Image compression before upload
- Service worker for offline support
- Virtual scrolling for long feeds
- CDN for static assets

## Trade-offs Made

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| Public posts by default | Simpler UX, better discovery | No private accounts (MVP) |
| Client-side routing | Fast navigation | SEO limitations |
| 24h story expiry | Matches user expectations | Requires cleanup job |
| Single image per post | Simpler upload flow | No carousels (MVP) |

## Lessons Learned

1. **Start with RLS** - Adding security later is harder than building it in
2. **Type everything** - TypeScript caught many bugs before runtime
3. **Test auth flows early** - Authentication edge cases are complex
4. **Monitor bundle size** - Easy to add dependencies, hard to remove them
