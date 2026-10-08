-- ============================================================
-- Halvorsen & Reyes Builders — rate limits
-- Run the whole file once in the SQL Editor (after schema.sql).
-- Re-running is safe. Doesn't touch the leads table or its data.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Chatbot: how many messages per visitor and in total
-- ------------------------------------------------------------
-- One row per message sent to the chatbot. We don't keep the IP, only a
-- hash (fingerprint) of it, and only for 2 days.
create table if not exists public.chat_usage (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor text not null
);
create index if not exists chat_usage_created_idx on public.chat_usage (created_at);
create index if not exists chat_usage_visitor_idx on public.chat_usage (visitor, created_at);

-- RLS on with no policy => from the site (anon key) nobody can read or write
-- here. Only the function below, called by the chat Edge Function.
alter table public.chat_usage enable row level security;

-- Checks the limit and, if there's room, logs the message. Returns true/false.
-- The lock makes the check + insert atomic (two simultaneous requests can't
-- both slip past the limit).
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

-- Only the Edge Function (with the service_role key, which lives on the server) can call it.
revoke all on function public.chat_allow(text, int, int) from public, anon, authenticated;
grant execute on function public.chat_allow(text, int, int) to service_role;

-- ------------------------------------------------------------
-- 2) Quote form: anti-spam
-- ------------------------------------------------------------
-- The form writes straight into leads with the anon key, so the limit has to
-- live in the database. Max 30 requests per hour total, and 3 per day from
-- the same email. Over the limit, the insert is rejected and the site shows
-- its usual form error message.
create or replace function public.leads_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.leads
       where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Too many requests in the last hour. Please try again later.'
      using errcode = 'P0001';
  end if;

  if (select count(*) from public.leads
       where lower(email) = lower(new.email)
         and created_at > now() - interval '1 day') >= 3 then
    raise exception 'You''ve already sent 3 requests today from this email.'
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
