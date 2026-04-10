# Raspberry Pi 4 Deployment

## What Runs on the Pi

- Caddy as the public reverse proxy
- The Next.js `standalone` app container
- Supabase remains hosted remotely in phase 1

## Pi Prerequisites

1. Install Docker and Docker Compose plugin.
2. Clone this repository onto the Raspberry Pi.
3. Copy `.env.example` to `.env` and fill in your Supabase values.
4. Set `APP_DOMAIN` in the Pi shell or a systemd environment file if you want a public hostname.

## First Deploy

```bash
docker compose build
docker compose up -d
```

## Updating

```bash
git pull
docker compose build
docker compose up -d
```

## Notes

- `platform: linux/arm64` is already set for Raspberry Pi 4.
- The app is stateless on the Pi. All persistent app data lives in Supabase.
- `GET /api/health` is used as the container health check.
