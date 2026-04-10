# Couplesna

Couplesna is a responsive Next.js web app for long-distance couples. This codebase now targets a Supabase-backed architecture with:

- Supabase Auth for sign-in
- Supabase Postgres for application data
- Supabase Storage for private gallery uploads
- Google Maps and Genkit/Gemini isolated behind provider adapters for phase 1
- Raspberry Pi friendly deployment via `standalone` Next.js output, Docker, and Caddy

## Local Setup

1. Copy [.env.example](./.env.example) to `.env`.
2. Fill in your Supabase project values.
3. Apply the SQL files in [supabase/migrations](./supabase/migrations) to your Supabase project.
4. Install dependencies with `npm install`.
5. Start the app with `npm run dev`.

## Important Paths

- Supabase schema: [supabase/migrations](./supabase/migrations)
- App state + server actions: [src/actions/app.ts](./src/actions/app.ts)
- Supabase clients: [src/lib/supabase](./src/lib/supabase)
- Raspberry Pi deployment docs: [docs/raspberry-pi.md](./docs/raspberry-pi.md)

## Deployment

This repository includes:

- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)
- [Caddyfile](./Caddyfile)

They are designed for a Raspberry Pi 4 running a stateless app container against Supabase Cloud.
