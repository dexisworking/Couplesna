create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  username text unique,
  avatar_url text,
  location jsonb,
  details jsonb,
  media jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  next_meet_date timestamptz,
  distance_apart_km numeric(10, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (couple_id, profile_id),
  unique (profile_id)
);

create table if not exists public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  sender_profile_id uuid not null references public.profiles (id) on delete cascade,
  receiver_profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (sender_profile_id <> receiver_profile_id)
);

create unique index if not exists couple_invites_pending_unique
  on public.couple_invites (sender_profile_id, receiver_profile_id)
  where status = 'pending';

create table if not exists public.couple_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (couple_id, profile_id)
);

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  slug text not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (couple_id, slug)
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  storage_path text not null unique,
  caption_hint text,
  created_by_profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  sort_order integer not null default 0
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  username_base text;
begin
  username_base := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1), new.id::text),
      '[^a-zA-Z0-9]+',
      '_',
      'g'
    )
  );

  insert into public.profiles (id, email, full_name, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    nullif(trim(username_base), ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_couples_updated_at on public.couples;
create trigger set_couples_updated_at
  before update on public.couples
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_couple_invites_updated_at on public.couple_invites;
create trigger set_couple_invites_updated_at
  before update on public.couple_invites
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_couple_notes_updated_at on public.couple_notes;
create trigger set_couple_notes_updated_at
  before update on public.couple_notes
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.couple_notes enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "couples_members_can_select" on public.couples;
create policy "couples_members_can_select"
  on public.couples for select
  to authenticated
  using (
    exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = couples.id
        and cm.profile_id = auth.uid()
    )
  );

drop policy if exists "couples_members_can_update" on public.couples;
create policy "couples_members_can_update"
  on public.couples for update
  to authenticated
  using (
    exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = couples.id
        and cm.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = couples.id
        and cm.profile_id = auth.uid()
    )
  );

drop policy if exists "couple_members_read_same_couple" on public.couple_members;
create policy "couple_members_read_same_couple"
  on public.couple_members for select
  to authenticated
  using (
    exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = couple_members.couple_id
        and cm.profile_id = auth.uid()
    )
  );

drop policy if exists "couple_members_insert_self" on public.couple_members;
create policy "couple_members_insert_self"
  on public.couple_members for insert
  to authenticated
  with check (profile_id = auth.uid());

drop policy if exists "couple_invites_read_own" on public.couple_invites;
create policy "couple_invites_read_own"
  on public.couple_invites for select
  to authenticated
  using (sender_profile_id = auth.uid() or receiver_profile_id = auth.uid());

drop policy if exists "couple_invites_insert_sender" on public.couple_invites;
create policy "couple_invites_insert_sender"
  on public.couple_invites for insert
  to authenticated
  with check (sender_profile_id = auth.uid() and receiver_profile_id <> auth.uid());

drop policy if exists "couple_invites_update_participants" on public.couple_invites;
create policy "couple_invites_update_participants"
  on public.couple_invites for update
  to authenticated
  using (sender_profile_id = auth.uid() or receiver_profile_id = auth.uid())
  with check (sender_profile_id = auth.uid() or receiver_profile_id = auth.uid());

drop policy if exists "couple_notes_read_same_couple" on public.couple_notes;
create policy "couple_notes_read_same_couple"
  on public.couple_notes for select
  to authenticated
  using (
    exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = couple_notes.couple_id
        and cm.profile_id = auth.uid()
    )
  );

drop policy if exists "couple_notes_insert_own" on public.couple_notes;
create policy "couple_notes_insert_own"
  on public.couple_notes for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = couple_notes.couple_id
        and cm.profile_id = auth.uid()
    )
  );

drop policy if exists "couple_notes_update_own" on public.couple_notes;
create policy "couple_notes_update_own"
  on public.couple_notes for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "gallery_albums_read_same_couple" on public.gallery_albums;
create policy "gallery_albums_read_same_couple"
  on public.gallery_albums for select
  to authenticated
  using (
    exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = gallery_albums.couple_id
        and cm.profile_id = auth.uid()
    )
  );

drop policy if exists "gallery_images_read_same_couple" on public.gallery_images;
create policy "gallery_images_read_same_couple"
  on public.gallery_images for select
  to authenticated
  using (
    exists (
      select 1
      from public.couple_members cm
      where cm.couple_id = gallery_images.couple_id
        and cm.profile_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', false)
on conflict (id) do nothing;
