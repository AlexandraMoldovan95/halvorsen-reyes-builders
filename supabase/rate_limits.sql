-- ============================================================
-- Halvorsen & Reyes Builders — limite de folosire
-- Rulează tot fișierul o dată în SQL Editor (după schema.sql).
-- Re-rularea e sigură. Nu modifică tabelul leads sau datele lui.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Chatbot: câte mesaje pe vizitator și în total
-- ------------------------------------------------------------
-- Un rând pentru fiecare mesaj trimis la chatbot. Nu păstrăm IP-ul, ci doar
-- un hash (amprentă) al lui, și doar 2 zile.
create table if not exists public.chat_usage (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor text not null
);
create index if not exists chat_usage_created_idx on public.chat_usage (created_at);
create index if not exists chat_usage_visitor_idx on public.chat_usage (visitor, created_at);

-- RLS pornit și nicio politică => din site (cheia anon) nimeni nu poate citi
-- sau scrie aici. Doar funcția de mai jos, apelată de Edge Function-ul chat.
alter table public.chat_usage enable row level security;

-- Verifică limita și, dacă e loc, înregistrează mesajul. Întoarce true/false.
-- Lock-ul face verificarea + înregistrarea atomice (două cereri simultane nu
-- pot trece amândouă peste limită).
create or replace function public.chat_allow(
  p_visitor text,
  p_per_hour int default 20,
  p_per_day int default 300
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n_visitor int;
  n_total int;
begin
  perform pg_advisory_xact_lock(hashtext('chat_allow'));
  delete from public.chat_usage where created_at < now() - interval '2 days';

  select count(*) into n_visitor from public.chat_usage
   where visitor = p_visitor and created_at > now() - interval '1 hour';
  select count(*) into n_total from public.chat_usage
   where created_at > now() - interval '1 day';

  if n_visitor >= p_per_hour or n_total >= p_per_day then
    return false;
  end if;

  insert into public.chat_usage (visitor) values (p_visitor);
  return true;
end;
$$;

-- Doar Edge Function-ul (cu cheia service_role, care stă pe server) o poate apela.
revoke all on function public.chat_allow(text, int, int) from public, anon, authenticated;
grant execute on function public.chat_allow(text, int, int) to service_role;

-- ------------------------------------------------------------
-- 2) Formularul de ofertă: anti-spam
-- ------------------------------------------------------------
-- Formularul scrie direct în leads cu cheia anon, deci limita trebuie să fie
-- în baza de date. Maximum 30 de cereri pe oră în total și 3 pe zi de pe
-- același email. Peste limită, inserarea e refuzată și site-ul arată mesajul
-- de eroare obișnuit al formularului.
create or replace function public.leads_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.leads
       where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Prea multe cereri într-o oră. Încearcă din nou mai târziu.'
      using errcode = 'P0001';
  end if;

  if (select count(*) from public.leads
       where lower(email) = lower(new.email)
         and created_at > now() - interval '1 day') >= 3 then
    raise exception 'Ai trimis deja 3 cereri azi de pe acest email.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.leads_rate_limit() from public, anon, authenticated;

drop trigger if exists leads_rate_limit on public.leads;
create trigger leads_rate_limit
  before insert on public.leads
  for each row execute function public.leads_rate_limit();
