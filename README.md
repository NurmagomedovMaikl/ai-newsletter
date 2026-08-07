# AI Newsletter

Vollautomatisierter wöchentlicher AI-Newsletter mit **Free- und Paid-Version**.

- **Inhalte:** Top AI News, Tool of the Week, Prompt of the Week, Bildgenerierungs-Prompt-Training, AI Deep-Dive-Tutorial, Podcast/Video/Read of the Week
- **Automatisiert:** Recherche → Filter → Inhalte → Assets (Bilder, Landing-Texte, E-Mail-HTML) → QA/Fake-News-Check — alles im Free-Tier
- **Tech:** Next.js (App Router, TypeScript, Tailwind v4), Groq + OpenRouter (LLM), Cloudflare Workers AI (Bildgenerierung), Supabase (DB/Auth, geplant), LemonSqueezy (Zahlungen, geplant), Resend (E-Mail, geplant)

## Projekt-Dokumentation

- `docs/DOKUMENTATION.md` — laufendes Sitzungsprotokoll und Entscheidungs-Log (E-001…)
- `docs/PROJEKT_PLAN.md` — verbindlicher Schritt-für-Schritt-Plan über alle Phasen

## Voraussetzungen

- Node.js ≥ 18 (im Projekt: Node 22 LTS via [fnm](https://github.com/Schniz/fnm))
- `.env` aus `.env.example` kopieren und Keys eintragen (mindestens `GROQ_API_KEY`, `OPENROUTER_API_KEY`; für Bilder `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`)

```bash
cp .env.example .env
npm install
```

> Hinweis Windows: PowerShell blockiert `*.ps1` → `npm`/`npx` als `npm.cmd`/`npx.cmd` aufrufen.

## Entwicklung

```bash
npm run dev        # Next.js-Dev-Server
npm run build      # Build + TypeScript-Check
npm run lint       # ESLint
```

## Content-Pipeline (wöchentlicher Workflow)

Alle Stufen schreiben ihre Ergebnisse nach `pipeline/output/` (gitignored).

| Schritt | Befehl | Ausgabe |
|---|---|---|
| 1. Recherche | `npm run pipeline:collect` | `raw_articles_<Datum>.json` |
| 2. Relevanz-Scoring | `npm run pipeline:score` | `scored_articles.json` |
| 3. Inhalte generieren | `npm run pipeline:generate` | `newsletter_draft_<Datum>.json` |
| 4. Assets (Bilder/Landing/E-Mail) | `npm run pipeline:assets` | `assets/`, `landing_texts.json`, `email_<Datum>.html` |
| 5. QA + Fake-News-Check | `npm run pipeline:qa` | `qa_report_<Datum>.json` |
| 6. Persistenz (Supabase) | `npm run pipeline:persist` | `persist_<Datum>.json`; DB: `raw_articles`/`issues`/`issue_content`, Storage-Bucket `newsletter-assets` |

**Kompletter Wochen-Lauf:**

```bash
npm run pipeline:weekly                          # alles von Anfang
npm run pipeline:weekly -- --from=assets         # ab einer bestimmten Stufe
npm run pipeline:weekly -- --auto-fix            # kaputte Empfehlungs-Links automatisch entfernen
npm run pipeline:persist -- --publish            # letzte Ausgabe veröffentlichen (Status: published)
```

- QA-Prinzip **fail-closed**: ≥1 Fehler → Abbruch mit Exit 1, nichts wird veröffentlicht.
- `--auto-fix` entfernt optionale Empfehlungen (Tool/Podcast/Video/Read) mit toten Links und wiederholt die QA.
- Detailierte Architektur der Stufen: siehe `docs/DOKUMENTATION.md` (Sessions 3–10).

## Verzeichnisstruktur

```
pipeline/            # Weekly-Workflow-Skripte (tsx)
  config/            # Quellenliste (RSS, HN, Reddit, NewsAPI)
  templates/         # E-Mail-Template
  output/            # generierte Artefakte (gitignored)
src/
  app/               # Next.js-Seiten (Landing/Account folgen in Phase 6)
  lib/               # Types, LLM-Client (Groq → OpenRouter-Fallback)
docs/                # DOKUMENTATION.md, PROJEKT_PLAN.md
```

## Status

- ✅ **Fertig (Stand 07.08.2026, Session 22):** Phasen 0–10 — Setup, Recherche, Scoring, Inhalte, Assets, QA inkl. Fake-News-Check (Stufe 1 LLM + Auto-Fix), Supabase (Auth, DB, RLS-Paywall, Storage), Frontend (Landing, Auth, Dashboard, Legal), E-Mail-Versand (Resend, Unsubscribe, Bounce/Open/Click), Zahlung (LemonSqueezy Test-Modus, Webhook-E2E), Deployment (Vercel live unter `https://ai-newsletter-sage.vercel.app`), Doku.
- ⬜ **Nur noch Nutzer-Schritte bis zum echten Launch:** eigene Domain in Resend (SPF/DKIM) + `NEWSLETTER_FROM_EMAIL` umstellen, LemonSqueezy auf Live-Modus umstellen, optionale GitHub-Secrets für `weekly.yml`, optionales Monitoring/Dashboard-Statistik. Details: `docs/PROJEKT_PLAN.md` → „FINALER STAND".
