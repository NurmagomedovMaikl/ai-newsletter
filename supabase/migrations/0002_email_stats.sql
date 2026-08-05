-- Phase 8: Delivery-Statistiken
-- newsletter_deliveries um Status 'delivered' erweitern (Opens/Clicks werden
-- bereits in opened_at/clicked_at gespeichert, Spalten existieren seit 0001).

alter table public.newsletter_deliveries
  drop constraint if exists newsletter_deliveries_status_check;

alter table public.newsletter_deliveries
  add constraint newsletter_deliveries_status_check
  check (status in ('pending', 'sent', 'failed', 'bounced', 'delivered'));

-- Beispiel-Statistik (SQL Editor, später evtl. Admin-UI):
--   select
--     count(*) filter (where status in ('sent','delivered')) as gesendet,
--     count(*) filter (where status = 'delivered')             as zugestellt,
--     count(*) filter (where opened_at is not null)            as geoeffnet,
--     count(*) filter (where clicked_at is not null)           as geklickt,
--     count(*) filter (where status = 'bounced')               as bounces
--   from public.newsletter_deliveries;
