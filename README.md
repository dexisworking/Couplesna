# Couplesna

Connecting long-distance couples and making them feel closer, wherever they are.

Live at: [https://couplesna.vercel.app](https://couplesna.vercel.app)

Couplesna is a premium, AI-enhanced web application designed specifically for long-distance relationships. It provides a shared space for couples to stay connected, plan their next adventures, and preserve their most cherished memories.

## ✨ Key Features

- **Intelligence-Driven Date Planning:** Use our AI Date Idea Generator (powered by Google Gemini & Genkit) to find the perfect virtual or in-person activities based on your mutual interests and locations.
- **Shared Dashboard:** A centralized "Home" for your relationship featuring a "Next Meet" countdown, shared notes, and real-time distance tracking.
- **Secure Connection:** Private invite system to link your account exclusively with your partner.
- **Private Gallery:** A secure vault for your photos and videos, powered by Supabase Storage.
- **Premium Experience:** Fluid animations with Framer Motion and a sleek, responsive dark mode interface tailored for both mobile and desktop.
- **Dev-First Architecture:** Built with modern standards like Next.js 15, Server Actions, and Type-safe Supabase integration.

## 🛠️ The Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Database & Auth:** [Supabase](https://supabase.com/) (Postgres, SSR Auth, Private Storage)
- **AI Integration:** [Google Genkit](https://github.com/firebase/genkit) + [Gemini API](https://ai.google.dev/)
- **Mapping:** Google Maps Platform API
- **Styling:** Tailwind CSS + Radix UI + Lucide Icons
- **Motion:** Framer Motion
- **DevOps:** Docker, Caddy, Standalone Next.js output

---

## 🚀 Get Started (Local Development)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd couplesna-firebase
   ```

2. **Environment Setup:**
   Copy the example environment file and fill in your Supabase and Google AI credentials:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**
   Apply the SQL migrations located in `supabase/migrations` to your Supabase project to initialize the schema.

4. **Install and Run:**
   ```bash
   npm install
   npm run dev
   ```

---

## 📦 Self-Hosting & Deployment

Couplesna is designed to be self-hosted on a Raspberry Pi 4 (arm64) or any cloud VPS.

### Docker Deployment
The project includes a multi-stage `Dockerfile`, `docker-compose.yml`, and `Caddyfile` for a production-ready setup.

1. **Prerequisites:** Install Docker and Docker Compose.
2. **Configuration:** Ensure your `.env` is populated.
3. **Build & Launch:**
   ```bash
   docker compose build
   docker compose up -d
   ```

### Raspberry Pi Specifics
The app runs as a stateless container on the Pi, while all persistent data resides in Supabase Cloud.
- **Reverse Proxy:** Caddy is included to handle SSL and exposure to the public web.
- **Port:** Defaults to 3000 (proxied via Caddy).
- **Docs:** See [docs/raspberry-pi.md](./docs/raspberry-pi.md) for detailed Pi-specific instructions.

---

## 📂 Project Structure

- **`/src/actions`**: Server Actions for app state and logic.
- **`/src/ai`**: Genkit AI flows and configuration.
- **`/src/lib`**: Shared utilities and Supabase clients.
- **`/supabase/migrations`**: PostgreSQL schema definitions.
- **`/components`**: Reusable UI components built with Radix and Tailwind.

---

© 2026 Couplesna. Built for connection.
