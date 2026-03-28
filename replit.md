# لوحة إدارة منتجات الأسدي — Admin Dashboard

## Overview

Arabic RTL admin dashboard for managing products. Built with React + Vite + TypeScript + Tailwind + Supabase. No backend/API server — Supabase handles everything.

## Stack

- **Framework**: React 19 + Vite 7 (lazy loading / code splitting)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Routing**: Wouter
- **Auth**: Supabase Auth (email + password)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (bucket: `images`)
- **UI Components**: shadcn/ui (Radix UI)
- **Package Manager**: npm

## Project Structure

```text
src/
├── services/
│   └── products.ts          # CRUD for products table
├── hooks/
│   ├── useAuth.tsx           # Auth context + hook (Supabase Auth)
│   └── useProducts.ts        # Products state hook
├── components/
│   ├── Layout.tsx            # Sidebar + mobile header
│   ├── ProtectedRoute.tsx    # Auth guard (redirects to /login)
│   └── ImageUpload.tsx       # Drag & drop image uploader → Supabase Storage
├── pages/
│   ├── Login.tsx             # Email + password login
│   ├── Dashboard.tsx         # Stats overview + recent products
│   ├── Products.tsx          # Products grid with search + delete
│   └── AddProduct.tsx        # Add/edit product form
├── lib/
│   ├── supabase.ts           # Supabase client (VITE_SUPABASE_*)
│   └── storage.ts            # uploadImage() → Supabase Storage
└── App.tsx                   # Router (lazy-loaded routes)
```

## Routes

| Path | Description | Protected |
|------|-------------|-----------|
| `/login` | Login page | No |
| `/` | Dashboard overview | Yes |
| `/products` | Products list | Yes |
| `/products/add` | Add product | Yes |
| `/products/edit/:id` | Edit product | Yes |

## Supabase Setup

Run `supabase-schema.sql` in Supabase SQL editor:

```sql
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(12,2) DEFAULT 0,
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- + policies (see supabase-schema.sql)
```

Storage: create `images` bucket with public access.

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

```bash
npm run dev      # Dev server (--host, port 5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel — Vite auto-detected
3. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy — `vercel.json` handles SPA routing

## Build Output (code-split)

- `Login.js` — 5 kB
- `Dashboard.js` — 4 kB
- `Products.js` — 6 kB
- `AddProduct.js` — 10 kB
- `index.js` (shared) — 583 kB
