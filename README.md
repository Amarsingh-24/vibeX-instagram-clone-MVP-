# vibeX - Social Media Platform

[![CI](https://github.com/Amarsingh-24/vibeX-instagram-clone-MVP-/actions/workflows/ci.yml/badge.svg)](https://github.com/Amarsingh-24/vibeX-instagram-clone-MVP-/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://vibex-social.vercel.app)

A modern, full-stack social media application built with React, TypeScript, and Supabase. vibeX enables users to share moments, connect with others, and discover content through an intuitive, Instagram-inspired interface.

![vibeX](https://img.shields.io/badge/vibeX-Social%20Media-38BDF8?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure email/password authentication with session management
- **User Profiles** - Customizable profiles with avatars, bios, and full names
- **Image Posts** - Share photos with captions (up to 500 characters)
- **Social Interactions** - Like, comment, and engage with posts
- **Follow System** - Follow/unfollow users to curate your feed

### Advanced Features
- **Instagram-Style Stories** - Share ephemeral content that expires after 24 hours
- **Story Analytics** - View who watched your stories with viewer tracking
- **Direct Messaging** - Real-time private conversations between users
- **Explore Page** - Discover trending posts sorted by engagement
- **Real-Time Notifications** - Instant alerts for likes, comments, follows, and story views
- **User Search** - Find and discover new users to follow
- **Suggested Users** - Algorithmic user recommendations

### Technical Highlights
- **Real-Time Updates** - Live data synchronization using Supabase Realtime
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices
- **Dark Theme** - Modern dark UI with neon accent colors
- **Row-Level Security** - Robust database security with RLS policies
- **Input Validation** - Both client-side and server-side data validation

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better developer experience
- **TailwindCSS** - Utility-first CSS framework for rapid UI development
- **Shadcn/UI** - High-quality, accessible component library
- **React Router** - Client-side routing and navigation
- **React Query** - Server state management and caching
- **Lucide Icons** - Beautiful, consistent iconography

### Backend
- **Supabase** - Open-source Firebase alternative
  - PostgreSQL database with real-time subscriptions
  - Built-in authentication and authorization
  - File storage for media uploads
  - Row-Level Security (RLS) for data protection

### Build Tools
- **Vite** - Next-generation frontend build tool
- **ESLint** - Code quality and consistency

## 📁 Project Structure

```
vibeX/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Shadcn/UI base components
│   │   ├── Layout.tsx       # Main app layout
│   │   ├── PostCard.tsx     # Post display component
│   │   ├── StoryViewer.tsx  # Story viewing component
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External service integrations
│   │   └── supabase/        # Supabase client and types
│   ├── pages/               # Application pages/routes
│   │   ├── Auth.tsx         # Login/Signup page
│   │   ├── Home.tsx         # Main feed
│   │   ├── Profile.tsx      # User profiles
│   │   ├── Stories.tsx      # Stories feature
│   │   ├── Messages.tsx     # Direct messaging
│   │   ├── Explore.tsx      # Discover content
│   │   └── ...
│   └── lib/                 # Utility functions
├── supabase/
│   ├── config.toml          # Supabase configuration
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## 🗄️ Database Schema

### Tables
- **profiles** - User profile information
- **posts** - User-created posts with images
- **comments** - Comments on posts
- **likes** - Post likes tracking
- **follows** - User follow relationships
- **stories** - Ephemeral story content
- **story_views** - Story view analytics
- **conversations** - Chat conversation metadata
- **conversation_participants** - Chat participants
- **messages** - Direct messages
- **notifications** - User notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (or use existing project)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amarsingh-24/vibeX-instagram-clone-MVP-.git
   cd vibeX-instagram-clone-MVP-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

4. **Database Setup**
   
   Run the migrations in the `supabase/migrations` folder in order, or connect to an existing Supabase project with the schema already configured.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Deploy!

### Supabase Configuration

Ensure your Supabase project has:
- Authentication enabled with email/password provider
- Storage buckets created: `posts`, `avatars`, `stories`
- Row-Level Security policies applied to all tables

## 📸 Screenshots

### Demo
![Demo](screenshots/demo.gif)

## 🛠️ What I Built

I developed vibeX from the ground up, including:

- **Frontend Architecture** - React + TypeScript with custom components and hooks
- **Authentication System** - Complete signup, login, and session management
- **Media Handling** - Image upload pipeline with Supabase Storage integration
- **Stories Feature** - Instagram-style stories with 24-hour expiration and viewer tracking
- **Real-Time Messaging** - Direct messaging with live updates using Supabase Realtime
- **Social Features** - Likes, comments, follow/unfollow system with optimistic updates
- **Content Discovery** - Explore page with trending content algorithm
- **Notification System** - Real-time notifications for all social interactions
- **UI/UX Design** - Responsive dark theme with custom neon accent color palette

### Technical Responsibilities
- Designed and implemented the complete database schema in PostgreSQL
- Implemented Row-Level Security (RLS) policies for all tables
- Built real-time subscriptions for messaging and notifications
- Added comprehensive input validation (client & server-side)
- Set up CI/CD pipeline with GitHub Actions
- Wrote documentation and technical decisions

## 🔒 Security Features

- **Row-Level Security (RLS)** - All database tables protected with granular access policies
- **Input Validation** - Server-side constraints prevent data injection
- **Secure Authentication** - Supabase Auth with session management
- **HTTPS Only** - All communications encrypted in transit

## 🎨 Design System

vibeX uses a custom dark theme with neon accents:
- **Background**: `#0D0D0D`
- **Card Background**: `#1F1F1F`
- **Primary (Neon Blue)**: `#38BDF8`
- **Accent (Neon Pink)**: `#F472B6`
- **Secondary (Neon Purple)**: `#A78BFA`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

**Amar Singh**
- GitHub: [@Amarsingh-24](https://github.com/Amarsingh-24)

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Supabase
