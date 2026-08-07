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

- [x] Node.js (>= 18) + npm installieren/verifizieren
- [x] Git-Repository initialisieren (lokal, `.gitignore` anlegen)
- [x] Next.js-Projekt erstellen (`create-next-app`) mit TypeScript + Tailwind
- [x] Projektstruktur festlegen:
  - `src/app/` (Pages/UI)
  - `src/lib/` (Bibliotheken: Supabase, LLM, Email, LemonSqueezy)
  - `src/api/` (Interne Pipeline-Funktionen)
  - `pipeline/` (Weekly-Workflow-Skripte)
  - `docs/` (Dokumentation)
- [x] Environment-Variablen-Schema anlegen (`.env.example` — Keys nie committen)
- [x] Supabase-Projekt erstellen (kostenlos) + Anmeldedaten in Env hinterlegen
- [x] Vercel-Konto + Projekt mit GitHub verbinden (Deploy, Session 15)

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
- [x] Ausgabe zusätzlich in Supabase-Tabelle `raw_articles` speichern (254 Artikel, Session 10)

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
- [x] Entwurf zusätzlich in Supabase `issues`-Tabelle speichern (Session 10)

## PHASE 3 — Asset-Generierung

- [x] Text-Assets: alle Newsletter-Texte via LLM (Segment-Prompts in `generate_content.ts`)
- [x] Bild-Assets:
  - [x] **Cloudflare Workers AI** integriert (FLUX.1-schnell → SDXL → SDXL-Lightning) für Header-/Social-Bild — *E-014: Pollinations, HF und lokale SD entfernt, nur Cloudflare (siehe Doku)*
  - [x] Bild-Größen/Formate festgelegt: Header 1024x576 (PNG), Social-Teaser 1024x1024 (PNG)
- [x] E-Mail-HTML-Asset: Template gebaut (`pipeline/templates/email_template.html`, responsiv, Inline-CSS) + Renderer (`renderEmail.ts`)
- [x] Landing-Page-Texte + Produktbeschreibungen generiert (`landing_texts.json`)
- [x] Generierte Assets in Supabase Storage ablegen (Bucket `newsletter-assets`, Session 10)
- [x] Bilder für Ausgabe 1 generiert (Cloudflare Workers AI, Testlauf 05.08.2026 erfolgreich)

## PHASE 4 — Qualitätssicherung + Fake-News-Test

- [x] QA-Agent bauen (zweiter LLM-Pass): prüft Format, Länge, Ton, Duplikate, kaputte Links → `pipeline/qa.ts`
- [x] Fake-News-Check Stufe 1: Claims aus Snippets extrahieren + gegen Original-Quelle verifizieren
- [x] Fake-News-Check Stufe 2: Google Fact Check Tools API (optional, wenn `GOOGLE_FACTCHECK_API_KEY` gesetzt)
- [x] Kreuz-Referenz: widersprüchliche Aussagen zwischen mehreren Quellen erkennen (`crossReferenceCheck` in `qa.ts`)
- [x] Bild-ALT-Texte + Accessibility-Check im HTML-Template (Header-ALT-Texte eingebaut)
- [x] Fehlertoleranz: Pipeline bricht bei QA-Fail ab und loggt (Exit-Code 1, Report `qa_report_*.json`)
- [x] Link-Inhalts-Check für Empfehlungen (Seitentitel-Validierung, tote/halluzinierte Links, Domain-Parking) + Auto-Fix (Session 21)
- [x] Optional: manueller Review-Schritt — **ersetzt durch** Auto-Fix + QA-Report + Admin-Notification (`notifyAdminOnErrorIfConfigured`)

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
- [x] Auth-Flows: Registrierung, Login, E-Mail-Verifikation, Passwort-Reset (UI in Phase 6, PKCE-Code-Bugfix Session 16)
- [x] Migration in echtes Supabase-Projekt anwenden + Keys in `.env` hinterlegen (Nutzer-Schritt)
- [x] Pipeline-Persistenz: `pipeline/persist.ts` (raw_articles + issues + issue_content in DB, Header/Social-PNG in Storage-Bucket `newsletter-assets`, Stufe 6/6 in `run_weekly.ts`, `--publish` für Freigabe)

## PHASE 6 — Frontend

- [x] Landing Page (Produktvorstellung, Free/Paid-Vergleich, CTA)
- [x] Registrierungs-Seite (Name, E-Mail, Passwort)
- [x] Login-Seite
- [x] Account-Dashboard:
  - [x] Plan-Anzeige (Free / Paid)
  - [x] Newsletter-Einstellungen (Frequenz, Themen, Formate)
  - [x] Abo-Verwaltung (Upgrade/Downgrade/Kündigen) — LS Customer Portal (Session 18) + Webhook-E2E (Cancel/Downgrade/Reaktivierung, Session 21)
- [x] Zugriff auf bisherige Ausgaben (Paid: komplette Archive)
- [x] Paid-Version:
  - [x] Newsletter-Archiv (alle früheren Ausgaben)
  - [x] Exklusive Segmente (z.B. erweiterte Prompt-Sammlung, Deep-Dive-Tutorials vollständig)
- [x] Free-Version:
  - [x] Aktuelle Ausgabe (eingeschränkt, z.B. nur News-Snippets + Tool of the Week)
- [x] Zahlungsflow:
  - [x] LemonSqueezy-Checkout integrieren (Monats-Abo) — live im Test-Modus (Checkout-URL erzeugt, Session 19)
  - [x] Webhook-Handler für Zahlungsstatus (LemonSqueezy → Supabase `subscriptions`) — Live-E2E getestet (Session 20/21)
  - [ ] Gratis-Testzeitraum optional — nicht umgesetzt (optional)
- [x] Responsive Design + Dark Mode (optional)
- [x] SEO: Meta-Tags, OG-Images

## PHASE 7 — Email Service

- [x] Resend-Konto + API-Key (live, Test-Konto; Key in `.env` + Vercel + GitHub-Secrets)
- [ ] Domain verifizieren (SPF/DKIM für E-Mail-Reputation) — Test mit `onboarding@resend.dev` verifiziert; **eigene Domain = Nutzer-Schritt vor echtem Launch**
- [x] Transaktionsmails (Best-Effort, `sendWelcomeEmailIfConfigured`/`sendUpgradeEmailIfConfigured`):
  - [x] Willkommens-E-Mail (`renderWelcomeEmail`; nach `signUp` + `/auth/confirm`)
  - [x] E-Mail-Verifikation (von Supabase Auth übernommen — nutzt eigene Supabase-Mail; bestanden, Session 12)
  - [x] Passwort-Reset (von Supabase Auth übernommen; bestanden, Session 16)
  - [x] Zahlungsbestätigung / Abo-Upgrade (`renderUpgradeEmail`; LemonSqueezy-Webhook `active`/`on_trial`)
- [x] Newsletter-Versand:
  - [x] E-Mail-Template rendern (aus `issue_content` + Assets) — `src/lib/email-render.ts`, gegen Live-Daten verifiziert (Free 3 Segmente / Paid 8)
  - [x] Versand-Logik: `/api/send-weekly` (Bearer `CRON_SECRET`), Empfänger = auth.users ∩ profiles, `newsletter_deliveries`-Log, idempotent
  - [x] Free: Teaser-Version | Paid: Vollversion (Paid = `plan=paid` ODER aktive Subscription)
  - [x] Unsubscribe-Link (HMAC-Token, `/api/unsubscribe` → `format=unsubscribed`) + Bounce-Handling (Svix-Webhook → `status=bounced`)
  - [x] Live-Versand getestet (Session 15 + 21: `sent: 1` an maikdrum1@gmail.com, Paid-Vollversion)
  - [ ] Bei großer Liste: Brevo/MailerLite als Backup-Provider (nur wenn Resend-Limit 3.000/Monat erreicht — nicht nötig)

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

- [x] Pipeline-Test mit echten Daten (mehrere Testläufe 04.–07.08.)
- [x] Newsletter-Inhalte manuell reviewen (Qualität, Relevanz, Fakten) — Nutzer + QA (Session 21)
- [x] E-Mail-Template in Clients testen (Gmail, Outlook, Apple Mail, Mobile) — Test-Versand empfangen (Session 15/21)
- [x] Landing-Page + Auth-Flow testen (Registrierung → Zahlung → Zugriff)
- [x] Zahlungstests mit LemonSqueezy-Testmodus (Checkout, Webhook, Downgrade, Kündigung)
- [x] Free vs. Paid: Paywall-Checks (Free-User darf Paid-Inhalte NICHT sehen) — RLS verifiziert (Session 21)
- [x] Iteration: Prompts/Filter verfeinern bis Ergebnis-Qualität stimmt (Session 21: Prompt/Image-Training-Tiefe, Empfehlungs-QA)

## PHASE 10 — Launch

- [x] Finaler E2E-Test des kompletten Flows (Nutzer + finaler Test-Durchlauf, Session 22)
- [ ] LemonSqueezy auf Live-Modus umstellen (Payment + Webhooks) — **Nutzer-Schritt vor echtem Launch** (aktuell Test-Modus)
- [x] Erste "echte" Newsletter-Ausgabe erzeugen und versenden (Issue 2026-08-07, QA-PASS, published, versendet)
- [x] Landing-Page + SEO final
- [x] Legal: Impressum, Datenschutzerklärung (Pflicht in DE), AGB, Widerruf (Session 17)
- [x] Deploy auf Vercel (Production) — live unter `https://ai-newsletter-sage.vercel.app` (Session 15)
- [ ] Monitoring einrichten (Fehler-Logs, E-Mail-Deliverability, Downtime) — Teil: Admin-Fehler-Mail via `notifyAdminOnErrorIfConfigured`; Dashboard-Statistik optional

---

## FINALER STAND (Session 22 — 07.08.2026)

- **Fertig:** Komplette Pipeline (Recherche → Scoring → Inhalte → Assets → QA/Auto-Fix → Persist), Frontend (Auth, Dashboard, Paywall/RLS, Legal), Zahlung (LemonSqueezy Test-Modus, Webhook-E2E), E-Mail (Resend, Versand + Unsubscribe + Bounce/Open/Click), Deployment (Vercel live), Doku.
- **Verbleibend bis zum echten Launch (nur noch Nutzer-Schritte):**
  1. Eigene Domain in Resend verifizieren (SPF/DKIM) + `NEWSLETTER_FROM_EMAIL` umstellen (Vercel-Env).
  2. LemonSqueezy auf **Live-Modus** umstellen (Identitätsprüfung läuft; Live-Key in `.env` + Vercel).
  3. Optional: GitHub-Secrets `NEWSAPI_KEY`, `GOOGLE_FACTCHECK_API_KEY`, `RESEND_API_KEY`, `NEWSLETTER_FROM_EMAIL`, `ADMIN_EMAIL` nachtragen (für GitHub-Actions-Workflow).
  4. Optional: Monitoring/Dashboard-Statistiken ausbauen.
- **Bekannte, akzeptierte Hinweise:** Google-News-Redirect-URLs sind im Claims-Check nicht verifizierbar (Warnung, kein Blocker); Test-Absender `onboarding@resend.dev` sendet nur an die eigene Adresse.

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
