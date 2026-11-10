-- React App database setup.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.
-- It is safe to run more than once.

-- Each athlete's profile. The coach page reads it through get_public_profile below,
-- so nobody can list or browse other athletes.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text unique not null,
  role text not null default 'athlete' check (role in ('athlete', 'parent')),
  data jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Things only the athlete sees: schools they added and the email tracker.
create table if not exists public.athlete_private (
  id uuid primary key references auth.users (id) on delete cascade,
  custom_schools jsonb not null default '[]'::jsonb,
  outreach jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.athlete_private enable row level security;

drop policy if exists "Owners manage their profile" on public.profiles;
create policy "Owners manage their profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Owners manage their private data" on public.athlete_private;
create policy "Owners manage their private data" on public.athlete_private
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- The coach page: returns one public profile by its link, and nothing else.
create or replace function public.get_public_profile(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('slug', p.slug, 'role', p.role, 'data', p.data)
  from public.profiles p
  where p.slug = p_slug and p.is_public;
$$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

-- Photos. Anyone with a photo's address can view it (coaches need that);
-- only the athlete can add or remove photos in their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

drop policy if exists "Athletes add their own photos" on storage.objects;
create policy "Athletes add their own photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Athletes see their own photos" on storage.objects;
create policy "Athletes see their own photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Athletes remove their own photos" on storage.objects;
create policy "Athletes remove their own photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
