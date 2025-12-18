# vibeX - Social Media Platform
## 🌐 Live Demo

👉 [Vibex App](https://vibexinstaclonemvp.lovable.app)

vibeX is a full-stack social media application inspired by Instagram. I built this project to understand how modern social platforms work end-to-end — from authentication and database design to real-time features and UI/UX.
It allows users to share photos, connect with others, post stories, chat in real time, and explore trending content, all wrapped in a clean dark UI.

Why I Built This

I wanted to build something realistic and production-like, not just a CRUD app.
vibeX helped me learn:

How real social apps handle auth, feeds, and relationships

Designing a secure PostgreSQL schema with RLS

Using Supabase Realtime for chats and notifications

Building a responsive UI that actually feels like a social app

This project was built from scratch — backend schema, frontend architecture, and deployment.

Features
Core Features

Email & password authentication

User profiles (avatar, name, bio)

Create image posts with captions

Like and comment on posts

Follow / unfollow users

Personalized feed based on follows

Stories

Instagram-style stories

Stories expire automatically after 24 hours

Track who viewed your stories

Messaging & Notifications

Real-time direct messaging

Live notifications for:

Likes

Comments

New followers

Story views

Discovery

Explore page showing trending posts

User search

Suggested users to follow

Tech Stack
Frontend

React 18

TypeScript

Tailwind CSS

shadcn/ui

React Router

React Query

Lucide Icons

Vite

Backend

Supabase

PostgreSQL database

Authentication

Storage for images

Realtime subscriptions

Row-Level Security (RLS)

Project Structure
src/
├── components/        reusable UI components
│   ├── ui/            shadcn base components
│   ├── PostCard.tsx
│   ├── StoryViewer.tsx
│   └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── custom hooks
├── integrations/
│   └── supabase/
├── pages/
│   ├── Auth.tsx
│   ├── Home.tsx
│   ├── Profile.tsx
│   ├── Explore.tsx
│   ├── Stories.tsx
│   └── Messages.tsx
└── lib/
    └── helpers and utilities

Database Overview

Main tables used in the project:

profiles

posts

comments

likes

follows

stories

story_views

conversations

conversation_participants

messages

notifications

All tables are protected using Row-Level Security policies.

Getting Started Locally
Prerequisites

Node.js 18+

npm

Supabase account

Setup
git clone https://github.com/Amarsingh-24/vibeX-instagram-clone-MVP-.git
cd vibeX-instagram-clone-MVP-
npm install


Create a .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id


Run the dev server:

npm run dev


Open http://localhost:5173

Supabase Notes

Make sure your Supabase project has:

Email/password auth enabled

Storage buckets:

posts

avatars

stories

RLS enabled on all tables

Migrations from /supabase/migrations applied

Deployment

The app is deployed on Vercel.

Steps:

Push code to GitHub

Import project into Vercel

Add environment variables

Deploy

What I Personally Worked On

Designed the full PostgreSQL schema

Wrote all Row-Level Security policies

Built authentication and session handling

Implemented image uploads with Supabase Storage

Built stories with expiration logic

Implemented real-time chat and notifications

Designed the dark UI and layout

Set up GitHub Actions CI

Wrote all documentation

Design

Dark theme with neon accents:

Background: #0D0D0D

Card: #1F1F1F

Primary: #38BDF8

Accent: #F472B6

Secondary: #A78BFA

License

MIT License

Contributing

Feel free to fork the repo and submit PRs.
Suggestions and improvements are always welcome.

Contact
amarfighter37@gmail.com
linkedin https://www.linkedin.com/in/sardarsathiamarsingh/
