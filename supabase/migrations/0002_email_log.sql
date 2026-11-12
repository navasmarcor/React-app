-- React App: a record of every coach email the app sends for an athlete.
-- Paste this whole file into Supabase > SQL Editor and press Run. It is safe to run twice.

create table if not exists public.email_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  school_id text not null,
  to_email text not null,
  subject text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error text,
  provider_id text,
  sent_at timestamptz not null default now()
);

create index if not exists email_log_user_sent_at on public.email_log (user_id, sent_at desc);

alter table public.email_log enable row level security;

-- Athletes can see their own sent emails. Only the send-coach-emails function writes rows.
drop policy if exists "Athletes read their own email log" on public.email_log;
create policy "Athletes read their own email log" on public.email_log
  for select to authenticated using ((select auth.uid()) = user_id);
