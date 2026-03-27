# قنفات ودواوين الأسدي — Standalone Vite App

## Overview

Standalone React + Vite application ready for Vercel deployment. No monorepo/workspace — clean single-project structure.

## Stack

- **Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Routing**: Wouter
- **Database**: Supabase (`@supabase/supabase-js`)
- **UI Components**: Radix UI + shadcn/ui
- **Package Manager**: npm
- **Language**: TypeScript

## Structure

```text
/
├── src/
│   ├── App.tsx              # Router (wouter)
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles + Tailwind
│   ├── pages/
│   │   ├── Home.tsx         # Main landing page
│   │   ├── Gallery.tsx      # Full gallery with lightbox
│   │   ├── Colors.tsx       # Color swatches
│   │   └── Catalogs.tsx     # Fabric catalog management
│   ├── components/
│   │   ├── AdminLogin.tsx   # Secret admin login modal
│   │   ├── AdminPanel.tsx   # Admin control panel
│   │   ├── CatalogModal.tsx # Add/edit catalog modal
│   │   ├── ColorModal.tsx   # Add/edit color modal
│   │   ├── LoadingSpinner.tsx
│   │   └── ScrollToTop.tsx
│   └── lib/
│       ├── supabase.ts      # Supabase client
│       ├── db.ts            # Gallery, testimonials, settings CRUD
│       └── catalogsDb.ts   # Catalogs & colors CRUD
├── public/                  # Static assets
├── dist/                    # Production build output
├── index.html               # HTML entry
├── vite.config.ts           # Vite config (PORT env var, no Replit deps)
├── tsconfig.json            # Standalone TypeScript config
├── package.json             # npm package (no workspace)
├── vercel.json              # SPA routing for Vercel
├── .env                     # Supabase env vars (local)
├── .env.example             # Template for env vars
└── supabase-tables.sql      # SQL to create Supabase tables
```

## Scripts

```bash
npm run dev      # Start dev server (PORT env var or 3000)
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Tables

Run `supabase-tables.sql` in Supabase SQL editor to create:
- `gallery` — images/videos for gallery page
- `testimonials` — customer reviews
- `settings` — site settings (title, phone, social links)
- `catalogs` — fabric catalogs (max 24)
- `catalog_colors` — colors per catalog (max 20 each)

## Admin Panel

- **Trigger**: Click copyright text 5× OR press Ctrl+Shift+A
- **Login**: username `admin` / password `alasdi2024`
- **Features**: gallery management, testimonials, social links, contact info

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Framework: Vite (auto-detected)
4. Build command: `npm run build`
5. Output dir: `dist`
6. Add env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
7. Deploy — `vercel.json` handles SPA routing automatically
