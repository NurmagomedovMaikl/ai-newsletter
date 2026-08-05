# AI Newsletter Projekt — Schritt-für-Schritt-Plan

> Komplett automatischer AI Newsletter (Free + Paid Version) mit Recherche, Asset-Generierung und Qualitätssicherung.
> Alle Tools laufen im Free-Tier (mit dokumentierten Grenzen).

---

## Projektübersicht

**Ziel:** Wöchentlicher, vollautomatisierter AI-Newsletter mit:
- Free Version (kostenlos) und Paid Version (via Zahlungsanbieter)
- User-Accounts (Registrierung / Login)
- Inhalte: News-Snippets, Tool-Empfehlungen (ProductHunt), Prompt der Woche, Bildgenerierungs-Prompt-Training, AI Deep-Dive Tutorial, Podcast/Video/Read of the Week
- Komplette Pipeline: Recherche → Filter → Zusammenfassung → Asset-Generierung → QA / Fake-News-Check → Versand

---

## TECHNOLOGIE-STACK (alles Free-Tier)

| Bereich | Technologie | Free-Tier Grenze |
|---|---|---|
| Frontend + Backend | Next.js (React, Tailwind) | — |
| Hosting | Vercel (Hobby) | 100GB Bandbreite/Monat |
| Datenbank + Auth | Supabase (Postgres + Auth + RLS) | 500MB DB, 50k MAU |
| Zahlungen | LemonSqueezy (Merchant of Record, übernimmt EU-USt) | kein Free-Tier nötig, %-Anteil pro Verkauf |
| Email (transaktional) | Resend | 3000 E-Mails/Monat |
| Email (Newsletter, größere Listen) | Brevo / MailerLite | 300/Tag bzw. 1000/Monat |
| Automation | Vercel Cron / GitHub Actions | Hobby-Cron-Limit |
| Recherche | RSS-Feeds, HN/Reddit API, NewsAPI Free | NewsAPI: 100 Requests/Tag |
| LLM (Filter/Summarize/Assets) | Groq (Primary) + OpenRouter (Fallback) | Rate-Limits |
| Bildgenerierung | Cloudflare Workers AI (FLUX.1-schnell / SDXL) | 10.000 Neuronen/Tag |
| Fact-Check | Google Fact Check Tools API | kostenlos |

---

## PHASE 0 — Projekt-Setup

- [ ] Node.js (>= 18) + npm installieren/verifizieren
- [ ] Git-Repository initialisieren (lokal, `.gitignore` anlegen)
- [ ] Next.js-Projekt erstellen (`create-next-app`) mit TypeScript + Tailwind
- [ ] Projektstruktur festlegen:
  - `src/app/` (Pages/UI)
  - `src/lib/` (Bibliotheken: Supabase, LLM, Email, LemonSqueezy)
  - `src/api/` (Interne Pipeline-Funktionen)
  - `pipeline/` (Weekly-Workflow-Skripte)
  - `docs/` (Dokumentation)
- [ ] Environment-Variablen-Schema anlegen (`.env.example` — Keys nie committen)
- [ ] Supabase-Projekt erstellen (kostenlos) + Anmeldedaten in Env hinterlegen
- [ ] Vercel-Konto + Projekt mit GitHub verbinden (später für Deploy)

---

## PHASE 1 — Content-Pipeline: Recherche

- [x] Quellen definieren (AI News): RSS-Feeds (TechCrunch AI, The Verge AI, MIT Tech Review, Wired, Ars Technica, VentureBeat, Google News), HackerNews-API, Reddit (via RSS), ProductHunt
- [x] NewsAPI-Free-Tier integrieren als zusätzliche Quelle (optional, nur wenn `NEWSAPI_KEY` gesetzt)
- [x] ProductHunt-RSS für Tool-Empfehlungen (Kategorie "AI Tools") als Quelle aufgenommen
- [x] Sammel-Skript schreiben: `pipeline/collect.ts` (Skriptname im Plan war `collect_sources.ts`)
  - Ruft alle Quellen ab (rss-parser + REST-APIs via fetch)
  - Dedupliziert (URL-Hash + normalisierter Titel)
  - Normalisiert zu einheitlichem Format (`src/lib/types.ts` → `RawArticle`)
  - Kleine Pause (750ms) zwischen Quellen gegen Rate-Limits
  - Fehler einzelner Quellen brechen die Pipeline NICHT ab (werden geloggt)
- [x] Ausgabe: JSON-Datei unter `pipeline/output/raw_articles_YYYY-MM-DD.json` + `latest.json`
- [ ] Ausgabe zusätzlich in Supabase-Tabelle `raw_articles` speichern (kommt, wenn Supabase-Setup in Phase 5 steht)

## PHASE 2 — Content-Pipeline: Filter + Zusammenfassung

- [x] Filter-Logik mit LLM (Groq/OpenRouter): Artikel nach Relevanz bewerten (Score 0–10) → `pipeline/score.ts`
- [x] Relevanz-Schwelle festlegen: **Score >= 7** (`RELEVANCE_THRESHOLD`)
- [x] Newsletter-Segmente strukturieren (alle umgesetzt im Entwurf):
  - [x] News-Snippets (5 kurze Zusammenfassungen)
  - [x] Tool of the Week (inkl. Link + Use-Case)
  - [x] Prompt der Woche (Prompt + Erklärung)
  - [x] Bildgenerierungs-Prompt-Training (Konzept + Template + Beispiel, 3D-Stil)
  - [x] AI Deep-Dive Tutorial (Thema + Intro + 5–8 Steps + Takeaways)
  - [x] Podcast of the Week (Empfehlung + Begründung)
  - [x] Video of the Week (Empfehlung + Begründung)
  - [x] Read of the Week (Empfehlung + Begründung)
- [x] Summarize-Skript: `pipeline/generate_content.ts` — LLM erzeugt Snippets + Texte für alle Segmente
- [x] Output-Schema `newsletter_draft` (Typen in `src/lib/types.ts`, JSON-Ausgabe)
- [ ] Entwurf zusätzlich in Supabase `issues`-Tabelle speichern (kommt mit Supabase-Setup, Phase 5)

## PHASE 3 — Asset-Generierung

- [x] Text-Assets: alle Newsletter-Texte via LLM (Segment-Prompts in `generate_content.ts`)
- [x] Bild-Assets:
  - [x] **Cloudflare Workers AI** integriert (FLUX.1-schnell → SDXL → SDXL-Lightning) für Header-/Social-Bild — *E-014: Pollinations, HF und lokale SD entfernt, nur Cloudflare (siehe Doku)*
  - [x] Bild-Größen/Formate festgelegt: Header 1024x576 (PNG), Social-Teaser 1024x1024 (PNG)
- [x] E-Mail-HTML-Asset: Template gebaut (`pipeline/templates/email_template.html`, responsiv, Inline-CSS) + Renderer (`renderEmail.ts`)
- [x] Landing-Page-Texte + Produktbeschreibungen generiert (`landing_texts.json`)
- [ ] Generierte Assets in Supabase Storage ablegen (kommt mit Supabase-Setup, Phase 5)
- [x] Bilder für Ausgabe 1 generiert (Cloudflare Workers AI, Testlauf 05.08.2026 erfolgreich)

## PHASE 4 — Qualitätssicherung + Fake-News-Test

- [x] QA-Agent bauen (zweiter LLM-Pass): prüft Format, Länge, Ton, Duplikate, kaputte Links → `pipeline/qa.ts`
- [x] Fake-News-Check Stufe 1: Claims aus Snippets extrahieren + gegen Original-Quelle verifizieren
- [x] Fake-News-Check Stufe 2: Google Fact Check Tools API (optional, wenn `GOOGLE_FACTCHECK_API_KEY` gesetzt)
- [x] Kreuz-Referenz: widersprüchliche Aussagen zwischen mehreren Quellen erkennen (`crossReferenceCheck` in `qa.ts`)
- [x] Bild-ALT-Texte + Accessibility-Check im HTML-Template (Header-ALT-Texte eingebaut)
- [x] Fehlertoleranz: Pipeline bricht bei QA-Fail ab und loggt (Exit-Code 1, Report `qa_report_*.json`)
- [ ] Optional: manueller Review-Schritt (E-Mail an Admin mit Draft zur Freigabe)

## PHASE 5 — Datenbank + User Management

- [x] Supabase-Schema entwerfen (`supabase/migrations/0001_init.sql`):
  - [x] `profiles` (Plan: free/paid, Newsletter-Einstellungen)
  - [x] `subscriptions` (Zahlungsstatus, LemonSqueezy-Subscription-ID, Ablaufdatum)
  - [x] `issues` (Newsletter-Ausgaben, Status: draft/qa/published)
  - [x] `issue_content` (Segmente je Ausgabe, `paid_only`-Gating)
  - [x] `raw_articles` (gecrawllte Quellen)
  - [x] `newsletter_deliveries` (Versandlog je User)
- [x] Row-Level-Security aktivieren (User sieht nur eigene Daten; Free/Paid-Gating via `is_paid_subscriber()`)
- [x] API-Hilfsfunktionen: `lib/supabase/client.ts`, `lib/supabase/server.ts` (Service-Role), `lib/auth.ts` (Session/Profil/Paid-Check), `src/proxy.ts` (Session-Refresh, Next-16-Proxy)
- [ ] Auth-Flows: Registrierung, Login, E-Mail-Verifikation, Passwort-Reset (UI folgt in Phase 6, Resend in Phase 7)
- [x] Migration in echtes Supabase-Projekt anwenden + Keys in `.env` hinterlegen (Nutzer-Schritt)
- [x] Pipeline-Persistenz: `pipeline/persist.ts` (raw_articles + issues + issue_content in DB, Header/Social-PNG in Storage-Bucket `newsletter-assets`, Stufe 6/6 in `run_weekly.ts`, `--publish` für Freigabe)

## PHASE 6 — Frontend

- [x] Landing Page (Produktvorstellung, Free/Paid-Vergleich, CTA)
- [x] Registrierungs-Seite (Name, E-Mail, Passwort)
- [x] Login-Seite
- [x] Account-Dashboard:
  - [x] Plan-Anzeige (Free / Paid)
  - [x] Newsletter-Einstellungen (Frequenz, Themen, Formate)
  - [ ] Abo-Verwaltung (Upgrade/Downgrade/Kündigen) — Upgrade-Link da, Kündigen/Verwaltung erst mit echten LS-Keys
  - [x] Zugriff auf bisherige Ausgaben (Paid: komplette Archive)
- [x] Paid-Version:
  - [x] Newsletter-Archiv (alle früheren Ausgaben)
  - [x] Exklusive Segmente (z.B. erweiterte Prompt-Sammlung, Deep-Dive-Tutorials vollständig)
- [x] Free-Version:
  - [x] Aktuelle Ausgabe (eingeschränkt, z.B. nur News-Snippets + Tool of the Week)
- [x] Zahlungsflow:
  - [x] LemonSqueezy-Checkout integrieren (Monats-Abo) — env-gestützt, Live-Test mit Keys offen
  - [x] Webhook-Handler für Zahlungsstatus (LemonSqueezy → Supabase `subscriptions`) — env-gestützt, Live-Test mit Keys offen
  - [ ] Gratis-Testzeitraum optional
- [x] Responsive Design + Dark Mode (optional)
- [x] SEO: Meta-Tags, OG-Images

## PHASE 7 — Email Service

- [ ] Resend-Konto + API-Key (Nutzer-Schritt: Konto anlegen, Key in `.env`)
- [ ] Domain verifizieren (SPF/DKIM für E-Mail-Reputation) (Nutzer-Schritt; Test mit `onboarding@resend.dev` möglich)
- [x] Transaktionsmails (Best-Effort, `sendWelcomeEmailIfConfigured`/`sendUpgradeEmailIfConfigured`):
  - [x] Willkommens-E-Mail (`renderWelcomeEmail`; nach `signUp` + `/auth/confirm`)
  - [ ] E-Mail-Verifikation (von Supabase Auth übernommen — nutzt eigene Supabase-Mail, kein Resend; optional später Resend-Custom-SMTP)
  - [ ] Passwort-Reset (von Supabase Auth übernommen; optional später via Resend)
  - [x] Zahlungsbestätigung / Abo-Upgrade (`renderUpgradeEmail`; LemonSqueezy-Webhook `active`/`on_trial`)
- [x] Newsletter-Versand:
  - [x] E-Mail-Template rendern (aus `issue_content` + Assets) — `src/lib/email-render.ts`, gegen Live-Daten verifiziert (Free 3 Segmente / Paid 8)
  - [x] Versand-Logik: `/api/send-weekly` (Bearer `CRON_SECRET`), Empfänger = auth.users ∩ profiles, `newsletter_deliveries`-Log, idempotent
  - [x] Free: Teaser-Version | Paid: Vollversion (Paid = `plan=paid` ODER aktive Subscription)
  - [x] Unsubscribe-Link (HMAC-Token, `/api/unsubscribe` → `format=unsubscribed`) + Bounce-Handling (Svix-Webhook → `status=bounced`)
  - [ ] Bei großer Liste: Brevo/MailerLite als Backup-Provider (erst wenn Resend-Limit 3.000/Monat erreicht)

## PHASE 8 — Automation (der komplette Weekly-Workflow)

- [x] Master-Skript `pipeline/run_weekly.ts` das alle Phasen 1–4 nacheinander ausführt (collect → score → generate → assets → qa)
  - [x] `--from=<stufe>` zum Starten mitten in der Pipeline
  - [x] `--auto-fix`: kaputte Empfehlungs-Links automatisch entfernen + QA-Wiederholung
  - [x] Fail-closed: QA-Fehler → Abbruch mit Exit 1
- [x] Cron-Job einrichten:
  - [x] Option A: Vercel Cron (Montag 06:00 UTC → `/api/send-weekly`, Fallback-Sender; `vercel.json`)
  - [x] Option B: GitHub Actions Schedule (Montag 04:45 UTC → kompletter Workflow in `.github/workflows/weekly.yml`)
- [x] Fehler-Handling: Retry (LLM 429), Logging (`run_weekly_*.json`), Abbruch bei QA-Fail; Fehler-Notification an Admin via Resend (`notifyAdminOnErrorIfConfigured` + Actions-Step)
- [x] Status-Tracking je Ausgabe (draft → qa → published via `persist(status)`, `--publish`-Flag)
- [x] Manueller Trigger möglich (workflow_dispatch in GitHub Actions; lokal `npm run pipeline:weekly -- --publish`)
- [x] Statistiken: Grundlage in DB (Migration 0002, `delivered`-Status + `opened_at`/`clicked_at` via Resend-Webhook, Auswertungs-SQL in Migration); Dashboard/UI folgt optional (Phase 9/10)

## PHASE 9 — Qualitätstests + Iteration

- [ ] Pipeline-Test mit echten Daten (mehrere Testläufe)
- [ ] Newsletter-Inhalte manuell reviewen (Qualität, Relevanz, Fakten)
- [ ] E-Mail-Template in Clients testen (Gmail, Outlook, Apple Mail, Mobile)
- [ ] Landing-Page + Auth-Flow testen (Registrierung → Zahlung → Zugriff)
- [ ] Zahlungstests mit LemonSqueezy-Testmodus (Checkout, Webhook, Downgrade, Kündigung)
- [ ] Free vs. Paid: Paywall-Checks (Free-User darf Paid-Inhalte NICHT sehen)
- [ ] Iteration: Prompts/Filter verfeinern bis Ergebnis-Qualität stimmt

## PHASE 10 — Launch

- [ ] Finaler E2E-Test des kompletten Flows
- [ ] LemonSqueezy auf Live-Modus umstellen (Payment + Webhooks)
- [ ] Erste "echte" Newsletter-Ausgabe erzeugen und versenden
- [ ] Landing-Page + SEO final
- [ ] Legal: Impressum, Datenschutzerklärung (Pflicht in DE), AGB, Widerruf
- [ ] Deploy auf Vercel (Production)
- [ ] Monitoring einrichten (Fehler-Logs, E-Mail-Deliverability, Downtime)

---

## Offene Entscheidungen (alle geklärt am 04.08.2026 — siehe DOKUMENTATION.md)

- [x] Zahlungsanbieter: **LemonSqueezy** (Merchant of Record, übernimmt EU-USt)
- [x] Newsletter-Format: **wöchentlich**
- [x] Paid-Modell: **Monats-Abo**
- [x] Erscheinungstag + Uhrzeit: **Montag 08:00**
- [x] Paid-Archive: **Ja, komplettes Archiv** ab Ausgabe 1
- [x] Sprache der Inhalte: **Englisch**
- [x] LLM-Anbieter final: **Groq (Primary) + OpenRouter (Fallback)**
- [x] Bildstil: **Moderne 3D-Illustration**
