-- Admin auth wall tables (OTP + Passkey)

create table if not exists public.admin_otps (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_admin_otps_admin_id on public.admin_otps(admin_id);
create index if not exists idx_admin_otps_expires_at on public.admin_otps(expires_at);

create table if not exists public.passkey_credentials (
  credential_id text primary key,
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  credential_public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.passkey_challenges (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  challenge text not null,
  type text not null check (type in ('registration', 'authentication')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_passkey_challenges_admin_user on public.passkey_challenges(admin_user_id);

alter table public.admin_otps enable row level security;
alter table public.passkey_credentials enable row level security;
alter table public.passkey_challenges enable row level security;
