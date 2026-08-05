-- ============================================================
-- AI Newsletter — Initiales Supabase-Schema (Phase 5)
-- Ausführen im Supabase SQL Editor (oder via `supabase db push`)
-- ============================================================

-- ---- Helper: updated_at automatisch setzen ----
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---- profiles (erweitert auth.users) ----
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'paid')),
  email_preferences jsonb not null default '{"frequency":"weekly","topics":[],"format":"full"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---- subscriptions (LemonSqueezy) ----
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lemonsqueezy_subscription_id text unique,
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'expired', 'on_trial')),
  plan_variant text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_profile_id_idx on public.subscriptions(profile_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---- issues (Newsletter-Ausgaben) ----
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  issue_date date not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'qa', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger issues_set_updated_at
  before update on public.issues
  for each row execute function public.set_updated_at();

-- ---- issue_content (Segmente je Ausgabe, paid-gated) ----
create table public.issue_content (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  segment_key text not null
    check (segment_key in ('intro', 'news', 'tool', 'prompt', 'image_training',
                           'deep_dive', 'podcast', 'video', 'read')),
  content jsonb not null,
  paid_only boolean not null default false,
  sort_order int not null default 0
);

create index issue_content_issue_id_idx on public.issue_content(issue_id);

-- ---- raw_articles (gecrawllte Quellen aus der Pipeline) ----
create table public.raw_articles (
  id text primary key,          -- hashId aus pipeline/dedup.ts
  title text not null,
  url text not null,
  source text,
  source_id text,
  published_at timestamptz,
  summary text,
  category text[] not null default '{}',
  score numeric,
  collected_at timestamptz not null default now()
);

-- ---- newsletter_deliveries (Versandlog je User) ----
create table public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'bounced')),
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz
);

create index newsletter_deliveries_profile_id_idx on public.newsletter_deliveries(profile_id);
create index newsletter_deliveries_issue_id_idx on public.newsletter_deliveries(issue_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.issues enable row level security;
alter table public.issue_content enable row level security;
alter table public.raw_articles enable row level security;
alter table public.newsletter_deliveries enable row level security;

-- profiles: User sieht/bearbeitet nur das eigene Profil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- subscriptions: User sieht nur die eigenen Abos
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = profile_id);

-- issues: nur veröffentlichte Ausgaben öffentlich lesbar
create policy "issues_select_published" on public.issues
  for select using (status = 'published');

-- issue_content: Free-Inhalte öffentlich; Paid-Inhalte nur für bezahlte User
create or replace function public.is_paid_subscriber()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.subscriptions s
    join public.profiles p on p.id = s.profile_id
    where p.id = auth.uid()
      and s.status in ('active', 'on_trial')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

create policy "issue_content_select_public" on public.issue_content
  for select using (not paid_only);

create policy "issue_content_select_paid" on public.issue_content
  for select using (paid_only and public.is_paid_subscriber());

-- raw_articles: nicht öffentlich (nur Service-Role / interne Pipeline)
create policy "raw_articles_service_only" on public.raw_articles
  for all using (false);

-- newsletter_deliveries: User sieht nur eigene Versand-Datensätze
create policy "newsletter_deliveries_select_own" on public.newsletter_deliveries
  for select using (auth.uid() = profile_id);

-- Standard-Profil bei Registrierung anlegen
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
