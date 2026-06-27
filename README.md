# SeeMyCountries — MVP

Minimalist travel map platform. Mark countries and cities, attach one photo or Instagram post per city, share your public profile.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** (Auth, PostgreSQL, Storage)
- **SVG world map** (world-atlas + d3-geo — no Google Maps)
- **next-intl** (English first, i18n-ready)
- **sharp** (WebP compression, max 1080px width)

## Setup

1. Create a [Supabase](https://supabase.com) project.

2. Copy env file and add credentials:
   ```bash
   cp .env.local.example .env.local
   ```

3. Run the SQL migration in Supabase SQL Editor:
   `supabase/migrations/001_initial_schema.sql`

4. Create a public storage bucket named `city-media` in Supabase Storage.

5. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/register` | Sign up (username, email, password) |
| `/login` | Log in |
| `/dashboard` | Manage your map (authenticated) |
| `/u/[username]` | Public travel profile |

## SRS coverage (MVP)

- [x] User registration with unique username → `/u/username`
- [x] Countries \| Cities stats counter
- [x] SVG vector map with country fill + city pins
- [x] Hover labels on pins
- [x] Popup: 1 media (photo OR Instagram), 1000-char note with scroll
- [x] Instagram lazy embed on popup open
- [x] Image upload → WebP, max 1080px
- [x] English UI with `messages/en.json` for future locales
- [x] Supabase RLS policies

## Next steps

- Geocoding autocomplete for city coordinates
- OAuth (Google / Apple)
- Turkish locale (`messages/tr.json`)
- Open Graph meta for social sharing previews
