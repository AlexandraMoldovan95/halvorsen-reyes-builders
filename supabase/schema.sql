-- ============================================================
-- Halvorsen & Reyes Builders — Supabase schema (leads table)
-- Run the whole file once, in the SQL Editor of your Supabase
-- project dashboard (Project → SQL Editor → New query).
-- ============================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nume text not null check (char_length(trim(nume)) >= 2),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefon text not null check (char_length(trim(telefon)) >= 7),
  tip_proiect text not null check (tip_proiect in ('casa_la_cheie', 'renovare_completa', 'extindere', 'altul')),
  buget_estimat text,
  mesaj text not null check (char_length(trim(mesaj)) >= 10)
);

-- Length limits: without them, anyone with the anon key could insert huge
-- text blobs straight through the API. Kept separate from create table so
-- they also apply to a table that already exists (re-running the file is safe).
alter table public.leads drop constraint if exists leads_nume_max_len;
alter table public.leads add constraint leads_nume_max_len check (char_length(nume) <= 120);
alter table public.leads drop constraint if exists leads_email_max_len;
alter table public.leads add constraint leads_email_max_len check (char_length(email) <= 254);
alter table public.leads drop constraint if exists leads_telefon_max_len;
alter table public.leads add constraint leads_telefon_max_len check (char_length(telefon) <= 40);
alter table public.leads drop constraint if exists leads_mesaj_max_len;
alter table public.leads add constraint leads_mesaj_max_len check (char_length(mesaj) <= 2000);
alter table public.leads drop constraint if exists leads_buget_valid;
alter table public.leads add constraint leads_buget_valid check (
  buget_estimat is null or buget_estimat in ('sub_50k', '50k_150k', '150k_300k', 'peste_300k')
);

-- Row Level Security: must be on.
alter table public.leads enable row level security;

-- Visitors (role "anon", the public key used on the site) can ONLY insert --
-- never read, edit, or delete. That way nobody can pull the client list
-- out of the site with the anon key (explicitly tested in the acceptance test).
drop policy if exists "Public can insert leads" on public.leads;
create policy "Public can insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policy for "anon" => access is denied by default.
-- You (from the dashboard, with an authenticated/service_role) see the table
-- normally — RLS doesn't apply to the service_role.

-- Useful index for sorting by date in the dashboard.
create index if not exists leads_created_at_idx on public.leads (created_at desc);


-- ============================================================
-- Admin panel (Erik & Camila) — login + viewing leads
-- ============================================================
-- Important: being "authenticated" does NOT automatically mean admin — anyone
-- can sign up if you leave public registration open in Supabase
-- (Authentication → Providers → Email). That's why we explicitly check the
-- email address via a separate table, instead of just the "authenticated" role.
-- See SUPABASE_SETUP.md for how to turn off public registration.

create table if not exists public.admins (
  email text primary key
);

alter table public.admins enable row level security;
-- No policy at all on "admins" => nobody, from the client, can read or write
-- to this table (not even authenticated users). It's populated manually
-- from the SQL Editor / dashboard, with the owner role.

-- Replace with the real addresses of the accounts you create under
-- Authentication → Users → Add user (Erik and Camila).
insert into public.admins (email) values
  ('erik@hr-builders.example'),
  ('camila@hr-builders.example')
on conflict (email) do nothing;

-- RLS also applies to subqueries inside policies: an "exists (select ... from
-- admins)" run as an authenticated user would see 0 rows (admins has no
-- policy), so admins wouldn't see leads either. The security definer function
-- runs with the owner's privileges and reads admins, but only ever returns a
-- boolean — the admins table itself stays unreadable from the client.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where email = auth.email());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Only admins can view leads" on public.leads;
create policy "Only admins can view leads"
  on public.leads
  for select
  to authenticated
  using ((select public.is_admin()));
