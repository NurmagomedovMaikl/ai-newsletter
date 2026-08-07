-- 0003: Abo-Verwaltung — ends_at für gekündigte/abgelaufene Subscriptions
alter table public.subscriptions
  add column if not exists ends_at text;
