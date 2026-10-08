-- ============================================================
-- Halvorsen & Reyes Builders — schema Supabase (tabelul leads)
-- Rulează tot fișierul o dată, în SQL Editor din dashboard-ul
-- proiectului tău Supabase (Project → SQL Editor → New query).
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

-- Limite de lungime: fără ele, oricine cu cheia anon poate insera texte
-- uriașe direct prin API. Separate de create table ca să se aplice și pe un
-- tabel deja creat (re-rularea fișierului e sigură).
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

-- Row Level Security: obligatoriu pornit.
alter table public.leads enable row level security;

-- Vizitatorii (rol "anon", cheia publică folosită în site) pot DOAR insera --
-- niciodată citi, edita sau șterge. Așa nu poate nimeni extrage lista de
-- clienți din site cu cheia anon (testată explicit în acceptance test).
drop policy if exists "Public poate insera leads" on public.leads;
create policy "Public poate insera leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- Fără politică de SELECT/UPDATE/DELETE pentru "anon" => acces implicit refuzat.
-- Tu (din dashboard, cu rol autentificat/service_role) vezi tabelul normal,
-- RLS nu se aplică rolului service_role.

-- Index util pentru sortare după dată în dashboard.
create index if not exists leads_created_at_idx on public.leads (created_at desc);


-- ============================================================
-- Panou admin (Erik & Camila) — login + vizualizare leads
-- ============================================================
-- Important: a fi "authenticated" NU înseamnă automat admin — oricine se
-- poate autentifica dacă lași înregistrarea publică deschisă în Supabase
-- (Authentication → Providers → Email). De-asta verificăm explicit
-- adresa de email printr-un tabel separat, nu doar rolul "authenticated".
-- Vezi SUPABASE_SETUP.md pentru cum dezactivezi înregistrarea publică.

create table if not exists public.admins (
  email text primary key
);

alter table public.admins enable row level security;
-- Fără nicio politică pe "admins" => nimeni, din client, nu poate citi
-- sau scrie în acest tabel (nici măcar userii autentificați). Se
-- populează manual din SQL Editor / dashboard, cu rol de owner.

-- Înlocuiește cu adresele reale ale conturilor pe care le creezi în
-- Authentication → Users → Add user (Erik și Camila).
insert into public.admins (email) values
  ('erik@hr-builders.example'),
  ('camila@hr-builders.example')
on conflict (email) do nothing;

-- RLS se aplică și subinterogărilor din politici: un "exists (select ... from
-- admins)" rulat ca user autentificat ar vedea 0 rânduri (admins nu are nicio
-- politică), deci nici adminii n-ar vedea leads. Funcția security definer
-- rulează cu drepturile owner-ului și citește admins, dar întoarce doar un
-- boolean — tabelul admins rămâne în continuare ilizibil din client.
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

drop policy if exists "Doar adminii vad leads" on public.leads;
create policy "Doar adminii vad leads"
  on public.leads
  for select
  to authenticated
  using ((select public.is_admin()));
