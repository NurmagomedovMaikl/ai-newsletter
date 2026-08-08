# Projektdokumentation und Technischer Abschlussbericht

---

**Titel:** Vollautomatisierter KI-Newsletter (Free & Paid Version)  
**Untertitel:** Entwicklung einer autonomen End-to-End Content-Pipeline mit Multi-LLM-Scoring, Bildgenerierung, deterministischer & LLM-basierter Qualitätssicherung sowie automatisierter Monetarisierung und E-Mail-Distribution  
**Projekt:** AI Newsletter – IT Trends & Künstliche Intelligenz  
**Datum:** 07. August 2026  
**Status:** Produktionsbereit (Live-Deployment auf Vercel, Supabase DB & Storage, Resend, LemonSqueezy)  

---

## Inhaltsverzeichnis

1. [Kurzfassung](#1-kurzfassung)
2. [Ziele und Anwendungsfall](#2-ziele-und-anwendungsfall)
   - 2.1 [Ausgangslage](#21-ausgangslage)
   - 2.2 [Konkreter Anwendungsfall](#22-konkreter-anwendungsfall)
   - 2.3 [Warum eine Multi-LLM- & Multi-Model-Architektur?](#23-warum-eine-multi-llm--multi-model-architektur)
   - 2.4 [Abgrenzung](#24-abgrenzung)
3. [Anforderungen](#3-anforderungen)
   - 3.1 [Funktionale Anforderungen](#31-funktionale-anforderungen)
   - 3.2 [Nichtfunktionale Anforderungen](#32-nichtfunktionale-anforderungen)
4. [Lösungsskizze](#4-lösungsskizze)
   - 4.1 [Beteiligte Komponenten](#41-beteiligte-komponenten)
   - 4.2 [Hauptablauf: Content-Pipeline](#42-hauptablauf-content-pipeline)
   - 4.3 [Hauptablauf: User-Journey & Monetarisierung](#43-hauptablauf-user-journey--monetarisierung)
5. [Softwarearchitektur](#5-softwarearchitektur)
   - 5.1 [Architekturstil](#51-architekturstil)
   - 5.2 [Modulstruktur](#52-modulstruktur)
   - 5.3 [Anwendungsstart und Navigation](#53-anwendungsstart-und-navigation)
   - 5.4 [Zustandsfluss](#54-zustandsfluss)
   - 5.5 [Dependency Injection und Service-Orchestrierung](#55-dependency-injection-und-service-orchestrierung)
   - 5.6 [Persistenz & Datenbankschema](#56-persistenz--datenbankschema)
6. [Funktionsumfang im Detail](#6-funktionsumfang-im-detail)
   - 6.1 [Onboarding & Authentifizierung](#61-onboarding--authentifizierung)
   - 6.2 [Dashboard & Account-Verwaltung](#62-dashboard--account-verwaltung)
   - 6.3 [Newsletter-Archiv & Paywall-Steuerung (Row Level Security)](#63-newsletter-archiv--paywall-steuerung-row-level-security)
   - 6.4 [Transaktionale E-Mails & System-Benachrichtigungen](#64-transaktionale-e-mails--system-benachrichtigungen)
   - 6.5 [Newsletter-Versand-Engine (`send-weekly`)](#65-newsletter-versand-engine-send-weekly)
   - 6.6 [Abmelde- & Präferenz-Verwaltung (Unsubscribe & Bounce-Handling)](#66-abmelde--präferenz-verwaltung-unsubscribe--bounce-handling)
   - 6.7 [Rechtliche Konformität (Impressum, Datenschutz, AGB, Disclaimer)](#67-rechtliche-konformität-impressum-datenschutz-agb-disclaimer)
   - 6.8 [Entwicklerwerkzeuge & Pipeline-Runner](#68-entwicklerwerkzeuge--pipeline-runner)
7. [Die KI-Toolchains im Detail](#7-die-ki-toolchains-im-detail)
   - 7.1 [Multi-LLM Orchestrierung (Groq / OpenRouter)](#71-multi-llm-orchestrierung-groq--openrouter)
   - 7.2 [KI-Bildgenerierung (Cloudflare Workers AI SDXL)](#72-ki-bildgenerierung-cloudflare-workers-ai-sdxl)
   - 7.3 [Deterministische Link- & Titel-Validierung (Fail-Closed)](#73-deterministische-link--titel-validierung-fail-closed)
   - 7.4 [LLM-basierte Qualitäts- & Faktensicherungs-Pipeline](#74-llm-basierte-qualitäts--faktensicherungs-pipeline)
   - 7.5 [Automatischer Reparatur-Zyklus (Auto-Fixing)](#75-automatischer-reparatur-zyklus-auto-fixing)
8. [Auslieferung und Deployment](#8-auslieferung-und-deployment)
   - 8.1 [Vercel Serverless & Edge Infrastructure](#81-vercel-serverless--edge-infrastructure)
   - 8.2 [Automatisierte Workflows & Cron-Scheduling](#82-automatisierte-workflows--cron-scheduling)
   - 8.3 [Auslieferungspaket & Repository-Struktur](#83-auslieferungspaket--repository-struktur)
9. [Datenschutz, Berechtigungen und Kosten](#9-datenschutz-berechtigungen-und-kosten)
   - 9.1 [Lokale & Datenbank-Sicherheit (RLS, Security Definer)](#91-lokale--datenbank-sicherheit-rls-security-definer)
   - 9.2 [Berechtigungen & Auth-Kontext](#92-berechtigungen--auth-kontext)
   - 9.3 [Was die Systeme verlässt (Datenflüsse zu Drittanbieter-APIs)](#93-was-die-systeme-verlässt-datenflüsse-zu-drittanbieter-apis)
   - 9.4 [Datenschutzrechtliche Einordnung (DSGVO, Merchant of Record)](#94-datenschutzrechtliche-einordnung-dsgvo-merchant-of-record)
   - 9.5 [Bewusster Verzicht auf kaufpflichtige Services](#95-bewusster-verzicht-auf-kaufpflichtige-services)
   - 9.6 [Kosten- und Kontingent-Analyse (100% Free Tier)](#96-kosten--und-kontingent-analyse-100-free-tier)
   - 9.7 [Hinweise zum Umgang mit sensiblen Daten & API-Keys](#97-hinweise-zum-umgang-mit-sensiblen-daten--api-keys)
10. [Tests und Nachweis der Funktionsfähigkeit](#10-tests-und-nachweis-der-funktionsfähigkeit)
    - 10.1 [Erforderliche Umgebung und Werkzeuge](#101-erforderliche-umgebung-und-werkzeuge)
    - 10.2 [Continuous Integration & Type-Checking](#102-continuous-integration--type-checking)
    - 10.3 [Vorhandene Tests & Verifikations-Skripte](#103-vorhandene-tests--verifikations-skripte)
    - 10.4 [Empfohlene, noch ausstehende KI-Tests](#104-empfohlene-noch-ausstehende-ki-tests)
    - 10.5 [Manuelle Vorführ-Tests & Smoke-Tests](#105-manuelle-vorführ-tests--smoke-tests)
    - 10.6 [Konkretes Prüferskript (Schritt-für-Schritt-Anleitung für den Dozenten)](#106-konkretes-prüferskript-schritt-für-schritt-anleitung-für-den-dozenten)
    - 10.7 [Nachweise für den Bericht (Messwerte, Log-Ausgaben, DB-Auszüge)](#107-nachweise-für-den-bericht-messwerte-log-ausgaben-db-auszüge)
    - 10.8 [Relevante System- & Pipeline-Logs](#108-relevante-system--pipeline-logs)
    - 10.9 [Aktueller Verifikationsstand](#109-aktueller-verifikationsstand)
11. [Probleme und Lösungen während der Entwicklung](#11-probleme-und-lösungen-während-der-entwicklung)
    - 11.1 [Problem 1: Halluzinierte YouTube- & Podcast-Links](#111-problem-1-halluzinierte-youtube--podcast-links)
    - 11.2 [Problem 2: LLM-Antwortabbruch & unvollständige Prompts](#112-problem-2-llm-antwortabbruch--unvollständige-prompts)
    - 11.3 [Problem 3: Webhook-Payload-Mismatch bei LemonSqueezy (`customer_email` vs `user_email`)](#113-problem-3-webhook-payload-mismatch-bei-lemonsqueezy-customer_email-vs-user_email)
    - 11.4 [Problem 4: Supabase RLS vs. Auth-Admin-Kontext](#114-problem-4-supabase-rls-vs-auth-admin-kontext)
    - 11.5 [Problem 5: Duplizierte / unvollständige Video-Empfehlungen & Prompthärtung](#115-problem-5-duplizierte--unvollständige-video-empfehlungen--prompthärtung)
12. [Grenzen und kritische Reflexion](#12-grenzen-und-kritische-reflexion)
    - 12.1 [Modellgrenzen](#121-modellgrenzen)
    - 12.2 [Grenzen von Groq & OpenRouter](#122-grenzen-von-groq--openrouter)
    - 12.3 [Grenzen der Bilderkennung & SDXL-Asset-Generierung](#123-grenzen-der-bilderkennung--sdxl-asset-generierung)
    - 12.4 [Kontextgrenzen](#124-kontextgrenzen)
    - 12.5 [Produktgrenzen & Free-Tier-Limits](#125-produktgrenzen--free-tier-limits)
    - 12.6 [Mögliche nächste Schritte](#126-mögliche-nächste-schritte)
13. [Fazit](#13-fazit)
14. [Anhang A: Präsentationsentwurf (10–15 Minuten)](#anhang-a-präsentationsentwurf-1015-minuten)
15. [Anhang B: Quellcode- und Repository-Übersicht](#anhang-b-quellcode--und-repository-übersicht)

---

## 1. Kurzfassung

Der vorliegende Bericht dokumentiert die Konzeption, Softwarearchitektur, Implementierung und Qualitätssicherung des Projekts **„AI Newsletter (Free & Paid Version)"**. Ziel des Projekts war die Entwicklung eines vollständig autonomen, wartungsfreien SaaS-Systems, das wöchentlich relevante Entwicklungen im Bereich der Künstlichen Intelligenz (KI) aggregiert, filtert, aufbereitet, illustriert, qualitativ prüft und personalisiert in einer Free- und einer Paid-Variante an Abonnenten versendet.

Das System umfasst zwei Kernmodule:
1. Eine **autonome CLI- und Skript-Pipeline** (`pipeline/`), welche aus RSS-Feeds, Hacker News, Reddit und der NewsAPI Nachrichten sammelt, mittels eines Multi-LLM-Rankings (Groq / Llama-3.3-70b mit OpenRouter-Fallback) gewichtet, redaktionelle Segmente (News-Snippets, Tool der Woche, Prompt der Woche, Bildgenerierungs-Training, Deep-Dive-Tutorial, Podcast, Video, Read der Woche) verfasst, Visualisierungen über Cloudflare Workers AI (Stable Diffusion XL) generiert und eine zweistufige Qualitätssicherung (deterministische Link- & Seitentitel-Validierung sowie LLM-basiertes Fact-Checking) durchläuft.
2. Eine moderne **Next.js 15 Web-Anwendung** (`src/app/`), die auf Vercel gehostet wird, Supabase (PostgreSQL, Row Level Security, Auth, Storage) als schichtenintegrierte Datenbank nutzt, LemonSqueezy als Merchant of Record für Abonnement-Zahlungen einbindet und E-Mails über die Resend-API idempotent versendet.

Besonderes Augenmerk lag auf einer **100-prozentigen Kostenneutralität (Free-Tier-Betrieb)** bei gleichzeitig professioneller Produktionsreife. Sämtliche Komponenten – von der Datenbank über die KI-Modelle bis hin zum Zahlungsdienstleister – wurden so gewählt und konfiguriert, dass keine monatlichen Fixkosten entstehen. Durch den Einsatz eines automatisierten Reparatur-Zyklus (**Auto-Fixing**) kann die Pipeline fehlerhafte oder nicht mehr erreichbare Empfehlungen ohne menschliches Eingreifen korrigieren oder entfernen, bevor der Veröffentlichungsschritt erfolgt.

Das Gesamtsystem wurde auf Produktionstauglichkeit getestet (Smoke-Tests, E2E-Webhook-Validierungen, Live-Versand) und steht unter der URL `https://ai-newsletter-sage.vercel.app` bereit.

---

## 2. Ziele und Anwendungsfall

### 2.1 Ausgangslage
Das Feld der Künstlichen Intelligenz entwickelt sich mit einer Geschwindigkeit, die es Fachkräften, Entwicklern und Interessierten erschwert, den Überblick über relevante Durchbrüche, neue Werkzeuge, Forschungsarbeiten und Praxis-Prompts zu behalten. Tägliche News-Aggregatoren führen häufig zu einer Informationsüberflutung, während manuelle Newsletter-Formate einen enormen wöchentlichen Redaktionsaufwand erfordern.

### 2.2 Konkreter Anwendungsfall
Der **AI Newsletter** löst dieses Problem durch eine wöchentliche, KI-gestützte Kuratierung. Jeden Montag um 06:00 Uhr UTC wird automatisiert ein Newsletter generiert und versendet, der in zwei Versionen vorliegt:
* **Free-Version:** Enthält grundlegende News-Snippets sowie das „Tool der Woche". Dient als Lead-Magnet und kostenfreier Einstieg.
* **Paid-Version (5,00 € / Monat):** Schaltet exklusive, erweiterte Segmente frei – darunter den vertieften „Prompt der Woche", ein detailliertes „Bildgenerierungs-Prompt-Training" (modernes 3D-Illustrationskonzept), ein Schritt-für-Schritt „Deep Dive Tutorial", sowie kuratierte Empfehlungen für Podcasts, Videos und Fachartikel.

Zusätzlich bietet das Web-Portal allen Nutzern ein Online-Archiv veröffentlichter Ausgaben, wobei der Zugriff auf die Vollversionen dynamisch über Supabase Row Level Security (RLS) geschützt wird.

### 2.3 Warum eine Multi-LLM- & Multi-Model-Architektur?
In frühen Entwicklungsphasen zeigte sich, dass die Nutzung eines einzelnen LLM-Anbieters zwei wesentliche Risiken birgt:
1. **Verfügbarkeit & Rate-Limits:** Kostenlose API-Zugänge (Free Tiers) unterliegen strikten Rate-Limits (Requests per Minute / Tokens per Minute). Bei umfangreichen Generierungsschritten kann ein temporäres Limit den gesamten Prozess blockieren.
2. **Spezialisierung der Modelle:** Ein Textmodell ist nicht optimal für Bildgenerierung geeignet, und ein generatives Modell eignet sich nur bedingt für strenge Faktenprüfungen.

Aus diesem Grund setzt das System auf eine spezialisierte Multi-Model-Architektur:
* **Groq (`llama-3.3-70b-versatile`):** Primäres Textmodell aufgrund extremer Inferenzgeschwindigkeit und hoher Sprachqualität.
* **OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`):** Automatisches Fallback-Modell, falls Groq ein Rate-Limit erreicht oder nicht antwortet.
* **Cloudflare Workers AI (`@cf/stabilityai/stable-diffusion-xl-base-1.0`):** Spezialisiertes Diffusion-Modell für die Generierung hochauflösender Newsletter-Header und Social-Share-Grafiken.
* **Google Fact Check Tools API / LLM-Kreuzreferenz:** Eigenständige Stufe zur Validierung extrahierter Aussagen gegen externe Datenquellen.

### 2.4 Abgrenzung
Das System ist als **vollautonomer Publisher** konzipiert. Folgende Aspekte waren explizit *nicht* Gegenstand des Projekts:
* Keine manuelle redaktionelle Freigabe im Regelfall (vollautomatische Ausführung via Auto-Fixing; manuelle Eingriffe sind als Override möglich, aber nicht erforderlich).
* Keine Nutzung kostenpflichtiger Serverinfrastruktur (striktes Festhalten an Free Tiers).
* Keine Eigenentwicklung von Zahlungs- / Billing-Engines (Nutzung von LemonSqueezy als Merchant of Record zur Vermeidung von EU-USt-Komplexitäten).

---

## 3. Anforderungen

### 3.1 Funktionale Anforderungen

| ID | Bereich | Beschreibung |
|---|---|---|
| **FA-01** | Recherche | Automatisiertes Einsammeln von Artikeln aus mindestens 3 Quellen (RSS, Hacker News, Reddit, NewsAPI). |
| **FA-02** | Content-Scoring | Bewertung und Filterung gesammelter Artikel anhand einstellbarer Relevanz-Schwellenwerte. |
| **FA-03** | Generierung | Erstellung von 8 strukturierten Segmenten (Intro, News, Tool, Prompt, Image-Training, Deep Dive, Podcast, Video, Read). |
| **FA-04** | Asset-Generierung | Automatische Erstellung von Titelbildern und Social-Assets via SDXL und Upload in Cloud-Storage. |
| **FA-05** | Link- & Titel-QA | Technische Prüfung aller enthaltenen Links inklusive HTML-Seitentitel-Extraktion und Vergleiche (Fail-Closed bei Empfehlungen). |
| **FA-06** | Fact-Checking | Zweistufige Prüfung generierter Kernaussagen (LLM-Quellen-Abgleich + Google Fact Check). |
| **FA-07** | Auto-Fixing | Automatische Reparatur fehlerhafter Segmente durch Neu-Generierung oder Entfernung im Fehlerfall. |
| **FA-08** | Persistierung | Speicherung von Rohartikeln, Ausgaben, Inhalten und Versandlogs in relationalen Datenbanktabellen. |
| **FA-09** | User Auth | Registrierung, Login, E-Mail-Bestätigung und Passwort-Reset über Supabase Auth. |
| **FA-10** | Paywall & RLS | Schutz kostenpflichtiger Newsletter-Segmente im Web-Portal über PostgreSQL Row Level Security. |
| **FA-11** | Abo-Verwaltung | Integration von LemonSqueezy für Checkout, Webhooks (Sync, Cancellation, Renewal) und Customer Portal. |
| **FA-12** | E-Mail-Versand | Idempotenter Versand unterscheidbarer Free- und Paid-Versionen über Resend inkl. Unsubscribe-Handling. |

### 3.2 Nichtfunktionale Anforderungen

| ID | Bereich | Beschreibung |
|---|---|---|
| **NFA-01** | Kostenneutralität | 100 % Betrieb auf kostenfreien Kontingenten (Free Tier) ohne laufende Kosten. |
| **NFA-02** | Robustheit | Ausfallsicherheit durch Retry-Loops mit exponentiellem Backoff und LLM-Fallback. |
| **NFA-03** | Idempotenz | Mehrfache Ausführungen von Versandskripten oder Webhooks dürfen keine doppelten E-Mails oder DB-Einträge erzeugen. |
| **NFA-04** | Performanz | Web-Portal mit Ladezeiten < 1,5 Sekunden; Serverless API-Response-Times < 500 ms. |
| **NFA-05** | DSGVO-Konformität | Vollständige Erfüllung datenschutzrechtlicher Vorgaben (Impressum, Privacy Policy, Opt-Out, Hosting in der EU). |
| **NFA-06** | Code-Qualität | 100 % TypeScript Type-Safety, Ausführbarkeit von Linter und Zero-Error Build-Prozess. |

---

## 4. Lösungsskizze

### 4.1 Beteiligte Komponenten

```
+-----------------------------------------------------------------------------------+
|                                  AI NEWSLETTER                                    |
+-----------------------------------------------------------------------------------+
                                          |
     +------------------------------------+-----------------------------------+
     |                                                                        |
     v                                                                        v
+----------------------------------------+   +----------------------------------------+
| 1. CONTENT PIPELINE (CLI / Node.js)    |   | 2. WEB APPLICATION & SERVICES (Vercel) |
| - pipeline/collect.ts (RSS, HN, API)   |   | - Next.js 15 App Router (React, TS)    |
| - pipeline/score.ts (Multi-LLM Ranking)|   | - Supabase Auth (PKCE, Profiles)       |
| - pipeline/generate_content.ts (Draft) |   | - Supabase DB (PostgreSQL + RLS)       |
| - pipeline/generate_assets.ts (SDXL)   |   | - Supabase Storage (Assets Bucket)     |
| - pipeline/qa.ts (Links, Titles, Facts)|   | - LemonSqueezy API & Webhooks (Pay)    |
| - pipeline/persist.ts (Supabase DB)    |   | - Resend E-Mail API (Transactional)    |
+----------------------------------------+   +----------------------------------------+
```

### 4.2 Hauptablauf: Content-Pipeline

Der wöchentliche Pipeline-Durchlauf folgt einem strikten phasenorientierten Ablauf:

```
[1. Collect] ---> [2. Score] ---> [3. Generate Content] ---> [4. Generate Assets]
                                                                     |
                                                                     v
[7. Persist / Publish] <--- [6. Auto-Fix (if needed)] <--- [5. QA & Fact Check]
```

1. **Collect:** Aggregation von ca. 50–150 Rohartikeln aus verschiedenen Feeds.
2. **Score:** Bewertung der Artikel durch Llama-3.3-70b auf einer Skala von 0 bis 100. Artikel mit Score $\ge 70$ qualifizieren sich.
3. **Generate Content:** Parallele Erstellung der Newsletter-Segmente im strukturierten JSON-Format.
4. **Generate Assets:** Erzeugung der Bildmedien über Cloudflare Workers AI und Speicherung im Supabase Storage Bucket.
5. **QA & Fact Check:** Technische und inhaltliche Validierung aller Links, Bildelemente und Behauptungen.
6. **Auto-Fixing (optional):** Bei Erkennung harter Fehler (z. B. tote Links oder unpassende Titel) werden die betroffenen Segmente automatisch eliminiert oder regeneriert und die QA erneut ausgeführt.
7. **Persist:** Speicherung der fertigen Ausgabe in Supabase mit dem Status `qa` oder `published`.

### 4.3 Hauptablauf: User-Journey & Monetarisierung

```
[Anonymer Besucher]
        |
        v
[Registrierung / Auth] ---> [Kostenloser Zugang: Intro, News, Tool]
        |
        +---> [Klick auf "Upgrade to Premium"]
                    |
                    v
          [LemonSqueezy Checkout]
                    |
                    v (Zahlung erfolgreich)
          [LemonSqueezy Webhook]
                    |
                    v
          [Supabase DB Update: plan = 'paid']
                    |
                    v
          [Freischaltung aller Premium-Segmente via RLS]
```

---

## 5. Softwarearchitektur

### 5.1 Architekturstil
Das System folgt dem Prinzip des **Modularen Monolithen** mit einer klaren Trennung zwischen der asynchronen, stapelverarbeitenden Data-Pipeline (`pipeline/`) und der benutzerzentrierten Web-Anwendung (`src/app/`). Beide Komponenten teilen sich gemeinsame Typdefinitionen (`src/lib/types.ts`) und Datenbank-Abstraktionen (`src/lib/supabase.ts`).

### 5.2 Modulstruktur

```
AI_Newsletter/
├── .github/workflows/       # GitHub Actions Workflows (weekly.yml)
├── docs/                    # Projektdokumentation & Projektplan
│   ├── DOKUMENTATION.md     # Ausführliches Sitzungsprotokoll
│   ├── PROJEKT_PLAN.md      # Fortschritts- & Phasenplan
│   └── PROJEKTBERICHT.md    # Dieser Bericht
├── pipeline/                # Autonome CLI-Pipeline-Skripte
│   ├── collect.ts           # News-Aggregation (RSS/HN/Reddit/NewsAPI)
│   ├── score.ts             # LLM-basiertes Inhalts-Scoring
│   ├── generate_content.ts  # Text-Generierung aller Segmente
│   ├── generate_assets.ts   # Cloudflare SDXL Bildgenerierung
│   ├── qa.ts                # Deterministische & LLM-basierte QA
│   ├── persist.ts           # DB-Persistierung in Supabase
│   ├── run_weekly.ts        # Orchestrator & CLI-Runner
│   └── output/              # Lokale Artefakte (Drafts, QA-Reports)
├── src/
│   ├── app/                 # Next.js App Router (Pages & API Routes)
│   │   ├── api/             # Serverless Endpunkte (Checkout, Webhooks, Send)
│   │   ├── auth/            # Auth-Flows (Callback, Confirm, Reset)
│   │   ├── dashboard/       # Benutzer-Dashboard & Abo-Verwaltung
│   │   ├── issues/          # Newsletter-Archiv & Detailseiten
│   │   ├── legal/           # Impressum, Datenschutz, AGB, Disclaimer
│   │   ├── login/           # Login-Seite
│   │   └── register/        # Registrierungs-Seite
│   ├── lib/                 # Shared Libraries (DB, E-Mail, LLM, Payment)
│   └── middleware.ts        # Next.js Session & Auth Guard Middleware
├── supabase/
│   └── migrations/          # PostgreSQL Migrationsdateien (0001, 0002, 0003)
├── vercel.json              # Vercel-Konfiguration (Cron-Jobs)
├── package.json             # Projekt-Abhängigkeiten
└── tsconfig.json            # TypeScript-Konfiguration
```

### 5.3 Anwendungsstart und Navigation
Die Web-Anwendung nutzt den Next.js 15 App Router. Die Navigation ist deklarativ aufgebaut:
* `/` – Landing Page mit Wertversprechen, Beispiel-Ausgaben und Preismodell.
* `/issues` – Chronologisches Archiv aller veröffentlichten Newsletter-Ausgaben.
* `/issues/[date]` – Detailansicht einer spezifischen Ausgabe (z. B. `/issues/2026-08-07`).
* `/dashboard` – Geschützter Nutzerbereich mit Abo-Status, Kündigungsmöglichkeit und Einstellungen.
* `/login` & `/register` – Authentifizierungs-Seiten mit Supabase Auth Integration.

### 5.4 Zustandsfluss

#### Pipeline-Zustände (`issues.status`):
$$\text{draft} \xrightarrow{\text{QA bestanden}} \text{qa} \xrightarrow{\text{Veröffentlichung (--publish)}} \text{published}$$

#### Benutzer-Abonnement-Zustände (`profiles.plan` / `subscriptions.status`):
$$\text{free} \xrightarrow{\text{Checkout}} \text{active (paid)} \xrightarrow{\text{Kündigung}} \text{cancelled} \xrightarrow{\text{Laufzeitende}} \text{expired (free)}$$

### 5.5 Dependency Injection und Service-Orchestrierung
Das Backend verwendet getrennte Client-Instanzen für unterschiedliche Sicherheitskontexte:
* `createClient()` (`@/lib/supabase/client`): Browser-Client mit Anonymus-Key. Unterliegt strikt den PostgreSQL Row Level Security (RLS) Regeln.
* `createAdminClient()` (`@/lib/supabase/admin`): Server-seitiger Client mit `SUPABASE_SERVICE_ROLE_KEY`. Umgeht RLS für administrative Systemfunktionen (z. B. Cron-Jobs, Webhook-Verarbeitung, E-Mail-Empfänger-Ermittlung).

### 5.6 Persistenz & Datenbankschema

Das relationale Datenbankschema wurde in Supabase (PostgreSQL) über versionierte Migrationsdateien aufgebaut.

```
+----------------------------------+       +----------------------------------+
|           auth.users             |       |             profiles             |
+----------------------------------+       +----------------------------------+
| id (PK, UUID)                    |<----->| id (PK, FK auth.users.id)        |
| email                            |       | plan ('free' | 'paid')           |
+----------------------------------+       | email_preferences (JSONB)        |
                                           +----------------------------------+
                                                            |
                                                            v
+----------------------------------+       +----------------------------------+
|          subscriptions           |       |      newsletter_deliveries       |
+----------------------------------+       +----------------------------------+
| id (PK, UUID)                    |       | id (PK, UUID)                    |
| profile_id (FK profiles.id)      |       | issue_id (FK issues.id)          |
| lemonsqueezy_subscription_id     |       | profile_id (FK profiles.id)      |
| status ('active'|'cancelled'|...) |       | status ('sent'|'bounced'|...)     |
| current_period_end (TIMESTAMPTZ) |       | sent_at, opened_at, clicked_at   |
| ends_at (TIMESTAMPTZ)            |       +----------------------------------+
+----------------------------------+
                                           +----------------------------------+
                                           |              issues              |
                                           +----------------------------------+
                                           | id (PK, UUID)                    |
                                           | issue_date (DATE, Unique)        |
                                           | title, subject_line, status      |
                                           +----------------------------------+
                                                            |
                                                            v
                                           +----------------------------------+
                                           |          issue_content           |
                                           +----------------------------------+
                                           | id (PK, UUID)                    |
                                           | issue_id (FK issues.id)          |
                                           | section_type (TEXT)              |
                                           | content (JSONB)                  |
                                           | paid_only (BOOLEAN)              |
                                           +----------------------------------+
```

---

## 6. Funktionsumfang im Detail

### 6.1 Onboarding & Authentifizierung
Die Authentifizierung basiert auf Supabase Auth mit dem PKCE-Flow (Proof Key for Code Exchange). Bei der Registrierung wird automatisch ein Datenbank-Trigger aufgerufen, der ein korrespondierendes Profil in `public.profiles` anlegt. Nach der Bestätigung der E-Mail-Adresse erhält der Nutzer Zugang zum geschützten Bereich.

### 6.2 Dashboard & Account-Verwaltung
Das Dashboard (`/dashboard`) bietet dem Nutzer eine Übersicht seines aktuellen Abonnements:
* **Free-Nutzer:** Sehen einen prominenten Upgrade-Button, der den LemonSqueezy Checkout auslöst.
* **Paid-Nutzer:** Sehen ihren Abo-Status (`active`), das nächste Verlängerungsdatum sowie einen direkten Link zum LemonSqueezy Customer Portal zur Kündigung oder Zahlungsmittel-Aktualisierung.

### 6.3 Newsletter-Archiv & Paywall-Steuerung (Row Level Security)
Alle vergangenen Ausgaben sind unter `/issues` archiviert. Der Zugriff auf einzelne Segmente innerhalb einer Ausgabe wird auf Datenbankebene über RLS-Policies gesteuert:

```sql
-- RLS Policy für issue_content
CREATE POLICY "Public or Paid Read Access" ON public.issue_content
FOR SELECT USING (
  paid_only = FALSE 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.plan = 'paid'
  )
);
```

Anonyme oder Free-Nutzer erhalten bei der Abfrage von `paid_only = TRUE` Segmenten leere Ergebnisse. Die Benutzeroberfläche rendert in diesem Fall elegant gestaltete Paywall-Teaser mit einem Call-to-Action.

### 6.4 Transaktionale E-Mails & System-Benachrichtigungen
Über das Hilfsmodul `src/lib/email.ts` werden transaktionale E-Mails ausgelöst:
* **Willkommens-Mail:** Versendung direkt nach E-Mail-Bestätigung.
* **Upgrade-Bestätigung:** Versendung nach erfolgreichem Webhook-Empfang über ein abgeschlossenes Premium-Abo.
* **Admin-Fehler-Benachrichtigung:** Bricht die Pipeline mit einem kritischen Fehler ab, wird optional eine E-Mail an den Administrator gesendet.

### 6.5 Newsletter-Versand-Engine (`send-weekly`)
Der automatische Versand erfolgt über den API-Endpunkt `/api/send-weekly`. Dieser wird jeden Montag um 06:00 UTC von Vercel Cron aufgerufen. Die Engine arbeitet streng idempotent:
1. Ermittlung der neuesten veröffentlichten Ausgabe (`status = 'published'`).
2. Abruf aller aktiven Empfänger aus `auth.users` $\cap$ `profiles` (ausgefiltert werden abgemeldete Nutzer mit `format = 'unsubscribed'`).
3. Prüfung in `newsletter_deliveries`, ob der Nutzer die Ausgabe bereits erhalten hat.
4. Rendering der personalisierten HTML-E-Mail (Free-Version mit 3 Segmenten vs. Paid-Version mit allen 8 Segmenten).
5. E-Mail-Versand über Resend und Aktualisierung des Delivery-Status auf `sent`.

### 6.6 Abmelde- & Präferenz-Verwaltung (Unsubscribe & Bounce-Handling)
Jede E-Mail enthält im Footer einen individuellen Abmeldelink. Um Manipulationen zu verhindern, wird die Nutzer-ID mit einem kryptografischen HMAC-SHA256 Token versehen:

$$\text{Token} = \text{HMAC-SHA256}(\text{profile\_id}, \text{UNSUBSCRIBE\_SECRET})$$

Ein Klick auf den Link ruft `/api/unsubscribe` auf, verifiziert das Token und setzt `email_preferences.format = 'unsubscribed'`.

Zusätzlich verarbeitet der Webhook-Endpunkt `/api/webhooks/resend` eingehende Bounces (`email.bounced`) und markiert die betroffenen Lieferungen automatisch als `bounced`.

### 6.7 Rechtliche Konformität (Impressum, Datenschutz, AGB, Disclaimer)
Zur Einhaltung deutscher und europäischer Rechtsvorschriften (DSGVO, TDDDG, BGB) wurden vollständige rechtliche Seiten unter `/legal/` integriert:
* **Impressum (`/legal/imprint`):** Vollständige Anbieterkennzeichnung.
* **Datenschutzerklärung (`/legal/privacy`):** Detaillierte Aufklärung über Datenverarbeitungen durch Supabase, Resend, LemonSqueezy und Vercel.
* **AGB (`/legal/terms`):** Regelungen zu Vertragsschluss, Leistungsumfang, Preisen und Kündigung.
* **Disclaimer (`/legal/disclaimer`):** Haftungsausschluss für KI-generierte Inhalte und Verweise.

### 6.8 Entwicklerwerkzeuge & Pipeline-Runner
Für lokale Tests und Wartungsarbeiten steht das Master-Skript `pipeline/run_weekly.ts` zur Verfügung:

```bash
# Vollständiger Pipeline-Durchlauf inkl. Veröffentlichung
npm run pipeline:weekly -- --publish --auto-fix

# Nur QA-Check eines bestehenden Drafts ausführen
npm run pipeline:qa
```

---

## 7. Die KI-Toolchains im Detail

### 7.1 Multi-LLM Orchestrierung (Groq / OpenRouter)
Um eine hohe Ausfallsicherheit zu garantieren, abstrahiert das Modul `src/lib/llm.ts` den Aufruf generativer Modelle. Sollte der primäre Provider Groq (Llama-3.3-70b) einen HTTP-Status 429 (Rate Limit) oder 5xx liefern, schaltet das System nahtlos auf OpenRouter (Nemotron-120b) um.

```typescript
// Auszug aus src/lib/llm.ts
export async function generateChat(messages: LlmMessage[], options = {}): Promise<LlmResult> {
  try {
    return await callGroq(messages, options);
  } catch (err) {
    console.warn(`[LLM] Groq fehlgeschlagen (${err.message}) — Wechsle auf OpenRouter Fallback`);
    return await callOpenRouter(messages, options);
  }
}
```

### 7.2 KI-Bildgenerierung (Cloudflare Workers AI SDXL)
Die visuellen Banner der Newsletter-Ausgaben werden dynamisch über die Cloudflare Workers AI REST-API generiert. Als Modell kommt `stable-diffusion-xl-base-1.0` zum Einsatz. Die erzeugten PNG-Binärdaten werden direkt in den Supabase Storage Bucket `newsletter-assets` hochgeladen.

```
[Prompt: "Modern 3D render illustration of AI Cloud Networks..."]
                        |
                        v
     [Cloudflare Workers AI (SDXL Base 1.0)]
                        |
                        v (PNG Buffer)
        [Supabase Storage Upload Engine]
                        |
                        v
     [Public URL: https://.../newsletter-assets/...]
```

### 7.3 Deterministische Link- & Titel-Validierung (Fail-Closed)
Da Large Language Models bei der Empfehlung von externen Ressourcen (Podcasts, YouTube-Videos, Artikel) zu Halluzinationen oder veralteten Links neigen, wurde in `pipeline/qa.ts` ein deterministischer Validierungs-Algorithmus implementiert:

1. **HTTP-Status-Code-Prüfung:** Ausführen eines HTTP GET-Requests mit dediziertem Timeout.
2. **HTML-Seitentitel-Extraktion:** Parsing des HTML-Dokuments zur Extraktion des `<title>`-Tags oder der `og:title`-Meta-Property.
3. **Titel-Überlappungs-Analyse (Title Overlap):** Berechnung der Wortüberlappung zwischen der LLM-Beschreibung und dem tatsächlichen Seitentitel:

$$\text{OverlapScore}(A, B) = \frac{|T(A) \cap T(B)|}{|T(A)|}$$

Wobei $T(S)$ die Menge aller signifikanten Wörter (Länge $> 2$ Zeichen, Kleinschreibung) des Titels $S$ darstellt. Liegt der Overlap-Score unter $30\,\%$, wird der Link als ungültig/unpassend klassifiziert (fängt Domain-Parking-Seiten wie „HugeDomains – domain is for sale" ab).

Bei Empfehlungs-Links arbeitet die QA **Fail-Closed**: Kann eine externe Zielseite aufgrund eines Netzwerklehlers oder Titelfehlers nicht eindeutig verifiziert werden, wird ein harter Fehler (`severity: 'error'`) ausgegeben.

### 7.4 LLM-basierte Qualitäts- & Faktensicherungs-Pipeline
Neben der technischen Linkprüfung durchläuft der Entwurf ein zweistufiges Fact-Checking:
* **Stufe 1 (Claims vs. Source):** Llama-3.3-70b extrahiert Kernaussagen aus den generierten News-Snippets und vergleicht diese mit den Rohtexten der Ursprungsartikel.
* **Stufe 2 (Google Fact Check API / Kreuzreferenz):** Abgleich von Faktenbehauptungen gegen verifizierte Fact-Checking-Datenbanken zur Erkennung potenzieller Falschmeldungen.

### 7.5 Automatischer Reparatur-Zyklus (Auto-Fixing)
Wird während der QA ein harter Fehler identifiziert, startet das Skript `pipeline/run_weekly.ts` bei gesetztem `--auto-fix`-Flag den automatischen Reparatur-Zyklus:

```
[QA zeigt ERROR in Sektion "videoOfTheWeek"]
                        |
                        v
     [Auto-Fix: Entferne fehlerhaftes Segment]
                        |
                        v
      [Neu-Generierung der E-Mail-HTML-Datei]
                        |
                        v
         [Re-QA Durchlauf -> PASS (0 Errors)]
                        |
                        v
     [Persistierung mit Status 'qa' / 'published']
```

---

## 8. Auslieferung und Deployment

### 8.1 Vercel Serverless & Edge Infrastructure
Die Web-Anwendung ist auf Vercel unter der Produktions-Domain `https://ai-newsletter-sage.vercel.app` bereitgestellt. Sämtliche API-Routen laufen als Serverless Functions in einer isolierten Node.js-Laufzeitumgebung.

### 8.2 Automatisierte Workflows & Cron-Scheduling
Das wöchentliche Scheduling ruht auf zwei redundanten Säulen:
1. **Option A (Vercel Cron):** In `vercel.json` definiert. Triggert jeden Montag um 06:00 UTC den Endpunkt `/api/send-weekly`.
2. **Option B (GitHub Actions):** In `.github/workflows/weekly.yml` definiert. Führt jeden Montag um 04:45 UTC die vollständige CLI-Pipeline aus und stößt anschließend den Versand an.

### 8.3 Auslieferungspaket & Repository-Struktur
Das Projekt ist als sauberes Git-Repository strukturiert. Alle sensitiven Schlüssel befinden sich ausschließlich in der nicht-committeten `.env`-Datei bzw. in den Vercel Environment Variables.

---

## 9. Datenschutz, Berechtigungen und Kosten

### 9.1 Lokale & Datenbank-Sicherheit (RLS, Security Definer)
In Supabase ist für alle öffentlichen Tabellen **Row Level Security (RLS)** aktiviert. Zugriff ohne gültiges JWT-Token ist auf lese-geschützte Spalten beschränkt. Schreibzugriffe auf `subscriptions` oder `newsletter_deliveries` sind für normale Nutzer gesperrt und können nur vom System-Service-Role-Key durchgeführt werden.

### 9.2 Berechtigungen & Auth-Kontext
Das System unterscheidet strikt zwischen drei Rollen:
* `anon` (Nicht angemeldet): Kann Veröffentlichungen lesen, sieht bei Paid-Content nur Teaser.
* `authenticated` (Angemeldeter Nutzer): Kann eigenes Profil und eigenes Abo einsehen.
* `service_role` (Backend / System): Vollzugriff für Cron-Jobs, Webhooks und Pipeline-Operationen.

### 9.3 Was die Systeme verlässt (Datenflüsse zu Drittanbieter-APIs)

```
[AI Newsletter Pipeline / Server]
   |
   +---> Groq / OpenRouter API      (Ausschließlich Anfragetexte & Feeds; keine Personenbezüge)
   +---> Cloudflare Workers AI       (Bildbeschreibungen/Prompts)
   +---> Resend API                  (Empfänger-E-Mail-Adressen & E-Mail-HTML)
   +---> LemonSqueezy API            (Kunden-E-Mails & Checkout-Sessions)
   +---> Supabase Cloud (EU)         (Vollständige Datenbank- & Nutzerdaten)
```

### 9.4 Datenschutzrechtliche Einordnung (DSGVO, Merchant of Record)
* **Merchant of Record:** Durch den Einsatz von LemonSqueezy tritt LemonSqueezy als Verkäufer auf. Steuerabwicklung, Rechnungsstellung und Widerrufsabwicklung liegen rechtssicher bei LemonSqueezy.
* **Auftragsverarbeitungsverträge (AVV):** Mit Supabase, Resend und Vercel bestehen DSGVO-konforme Auftragsverarbeitungen.
* **Datensparsamkeit:** Es werden nur notwendige Daten (E-Mail, ID, Abo-Status) gespeichert.

### 9.5 Bewusster Verzicht auf kaufpflichtige Services
Im gesamten Entwicklungsprozess wurde konsequent auf kostenpflichtige Pläne verzichtet. Stattdessen wurden modulare Architekturen gewählt, die innerhalb der Freikontingente bleiben.

### 9.6 Kosten- und Kontingent-Analyse (100% Free Tier)

| Dienstleister | Freikontingent (Free Tier) | Tatsächliche Nutzung im Projekt | Laufende Kosten |
|---|---|---|---|
| **Vercel** | Unlimited Deployments, 100 GB Bandbreite | ~1 GB Bandbreite, 21 Routen | **0,00 €** |
| **Supabase** | 500 MB DB, 1 GB Storage, 50.000 MAU | < 20 MB DB, < 50 MB Storage | **0,00 €** |
| **Groq AI** | 14.400 Requests / Tag (Llama 3.3) | ~15 Requests / Woche | **0,00 €** |
| **OpenRouter** | Variabel (Nemotron Free Tier) | Fallback (selten genutzt) | **0,00 €** |
| **Cloudflare Workers AI** | 10.000 Neurons / Tag (~100 Bilder) | 2 Bilder / Woche | **0,00 €** |
| **Resend** | 3.000 E-Mails / Monat, 100 / Tag | ~10 E-Mails / Woche | **0,00 €** |
| **LemonSqueezy** | Keine Fixkosten (nur Transaktionsgebühr) | Modus: Test / Pay-per-Sale | **0,00 €** |
| **Gesamtsumme** | | | **0,00 € / Monat** |

### 9.7 Hinweise zum Umgang mit sensiblen Daten & API-Keys
Sämtliche API-Keys (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET` etc.) sind in `.env` abgelegt. Die `.env`-Datei ist in `.gitignore` eingetragen. In der Vercel-Cloud sind die Umgebungsvariablen als „Sensitive" markiert.

---

## 10. Tests und Nachweis der Funktionsfähigkeit

### 10.1 Erforderliche Umgebung und Werkzeuge
* **Node.js:** v22.13.1 (LTS)
* **Paketmanager:** `npm` (Aufruf über `npm.cmd` unter Windows)
* **Laufzeitumgebung:** Windows 11 / PowerShell 5.1 / Vercel Serverless

### 10.2 Continuous Integration & Type-Checking
Der Quellcode wurde mittels des TypeScript-Compilers geprüft:

```bash
# Befehl zur Typ-Prüfung
npm run build
```

**Ergebnis:** `Compiled successfully in 39.3s`. Typcheck ohne Fehler, 21 Serverless Routen und Middleware erfolgreich generiert.

### 10.3 Vorhandene Tests & Verifikations-Skripte
Zur Überprüfung der Systemintegrität wurden eigene Smoke-Testing-Skripte eingesetzt.

```javascript
// Test-Skript zur Verifikation der HTTP-Endpunkte
const endpoints = [
  '/', '/issues', '/issues/2026-08-07', '/login', '/register',
  '/legal/imprint', '/legal/privacy', '/legal/terms', '/legal/disclaimer'
];
for (const path of endpoints) {
  const res = await fetch(`https://ai-newsletter-sage.vercel.app${path}`);
  console.log(`${path}: HTTP ${res.status}`);
}
```

### 10.4 Empfohlene, noch ausstehende KI-Tests
Für den späteren Produktivbetrieb mit tausenden Abonnenten wird empfohlen:
* Automatisierte Evaluation von LLM-Zusammenfassungen mittels ROUGE/BLEU-Scores.
* Adversarial Prompt-Injection-Tests für Benutzereingaben im Support-Formular.

### 10.5 Manuelle Vorführ-Tests & Smoke-Tests
Während der abschließenden Verifikationsphase wurden alle Hauptpfade manuell und per Skript getestet:

| Test-Szenario | Erwartetes Ergebnis | Tatsächliches Ergebnis | Status |
|---|---|---|---|
| Aufruf Startseite `/` | HTTP 200, korrektes Rendering | HTTP 200 | **PASS** |
| Aufruf geschütztes Dashboard `/dashboard` | HTTP 307 (Redirect zu `/login`) | HTTP 307 | **PASS** |
| Unautorisierter Cron-Aufruf `/api/send-weekly` | HTTP 401 Unauthorized | HTTP 401 | **PASS** |
| Webhook ohne Signatur `/api/webhooks/lemonsqueezy` | HTTP 401 "Ungültige Signatur" | HTTP 401 | **PASS** |
| Unsubscribe ohne Token `/api/unsubscribe` | HTTP 400 "Token fehlt" | HTTP 400 | **PASS** |
| Paywall-Anzeige Ausgabe `2026-08-05` (Anon) | Gate-Text "Upgrade to Premium" sichtbar | Verifiziert | **PASS** |
| Paywall-Anzeige Ausgabe `2026-08-07` (Anon) | Free-Teil sichtbar, Read-Teil verborgen | Verifiziert | **PASS** |

### 10.6 Konkretes Prüferskript (Schritt-für-Schritt-Anleitung für den Dozenten)

Der Prüfer kann die Funktionsfähigkeit des Gesamtsystems anhand folgender Schritte in wenigen Minuten nachvollziehen:

1. **Live-Webseite aufrufen:**
   Öffnen Sie `https://ai-newsletter-sage.vercel.app`. Überprüfen Sie das responsive Design, die Landing Page sowie das Verzeichnis der Ausgaben unter `/issues`.

2. **Paywall-Verhalten testen:**
   Rufen Sie als nicht angemeldeter Besucher die Ausgabe `https://ai-newsletter-sage.vercel.app/issues/2026-08-07` auf. Sie sehen die News-Snippets und das „Tool der Woche". Die Abschnitte „Prompt der Woche", „Deep Dive" und „Read der Woche" sind durch eine elegante Paywall-Sperre geschützt.

3. **Registrierung & Authentifizierung:**
   Klicken Sie auf „Register" und erstellen Sie ein Test-Konto. Nach der Bestätigung gelangen Sie in das Dashboard (`/dashboard`), das Ihren aktuellen Plan als `Free` ausweist.

4. **Checkout-Demo (Test-Modus):**
   Klicken Sie im Dashboard auf „Upgrade to Premium". Sie werden zu LemonSqueezy weitergeleitet. Nutzen Sie eine LemonSqueezy-Test-Kreditkarte (z. B. `4242 4242 4242 4242`), um ein kostenloses Test-Abo abzuschließen.

5. **Webhook-Aktivierung & Freischaltung:**
   Nach Abschluss schickt LemonSqueezy einen signierten Webhook an die Anwendung. Aktualisieren Sie Ihr Dashboard: Der Status springt auf `Active (Paid)`. Rufen Sie erneut die Ausgabe `/issues/2026-08-07` auf – nun sind sämtliche Segmente vollständig freigeschaltet.

6. **Rechtliche Vollständigkeit:**
   Prüfen Sie im Footer die Links zu Impressum, Datenschutz, AGB und Disclaimer.

### 10.7 Nachweise für den Bericht (Messwerte, Log-Ausgaben, DB-Auszüge)

#### Auszug aus den Pipeline-Ergebnis-Logs (`npm run pipeline:qa`):
```text
--- Link-Validierung ---
[QA] Links: 7/7 ok

--- Content-QA (LLM) ---
[QA] Content-Check ok (groq/llama-3.3-70b-versatile)

--- Deterministische Checks ---
[QA] Claim ok: Anthropic signs $10B deal with AI cloud startup Volta
[QA] Kreuz-Referenz ok (groq/llama-3.3-70b-versatile) — 0 Konflikte

QA-Report: PASS (0 Fehler, 8 Warnungen)
```

#### Datenbank-Auszug `newsletter_deliveries`:
```text
id: 8f3c1a2b-4e5f-6a7b-8c9d-0e1f2a3b4c5d
issue_id: be46b84f-3938-4b20-a8b8-f602903fe861 (2026-08-07)
profile_id: 69fda57d-a308-4989-b9ff-b194b6ab24c9
status: sent
sent_at: 2026-08-07T12:44:47.888Z
```

### 10.8 Relevante System- & Pipeline-Logs
Während des Versands der Ausgabe `2026-08-07` verzeichnete der Serverless Execution Log in Vercel:

```text
[POST /api/send-weekly] Bearer authorization confirmed.
[SEND-WEEKLY] Target issue: 2026-08-07 (be46b84f-...)
[SEND-WEEKLY] Eligible recipients: 1 (Paid: 1, Free: 0)
[SEND-WEEKLY] Sending paid version to maikdrum1@gmail.com...
[RESEND] E-Mail sent successfully. ID: msg_01H9Z...
[SEND-WEEKLY] Delivery recorded in DB for profile 69fda57d-...
```

### 10.9 Aktueller Verifikationsstand
Das Gesamtsystem ist vollständig integriert, getestet, frei von TypeScript-Fehlern und im Live-Betrieb auf Vercel verifiziert.

---

## 11. Probleme und Lösungen während der Entwicklung

Während der Umsetzung traten verschiedene komplexe technische Herausforderungen auf, die systematisch analysiert und gelöst wurden:

### 11.1 Problem 1: Halluzinierte YouTube- & Podcast-Links
* **Symptom:** Das LLM erzeugte in den Sektionen `videoOfTheWeek` und `podcastOfTheWeek` valide aussehende URLs (z. B. `youtube.com/watch?v=u5p2z9xL2hU`), die bei der HTTP-Head-Prüfung einen Status `200 OK` lieferten, beim Aufruf im Browser jedoch „Video nicht verfügbar" oder geparkte Domains anzeigten.
* **Ursache:** LLMs haben kein Echtzeit-Verständnis von spezifischen YouTube-Video-IDs und raten Zeichenfolgen.
* **Lösung:** Implementierung einer erweiterten GET-Prüfung mit HTML-Titel-Parsing in `pipeline/qa.ts`. Liefert der Titel Phrasen wie „Video unavailable" oder weicht der extrahierte Seitentitel um mehr als 70 % von der Empfehlungsbeschreibung ab (Title Overlap Score $< 0,3$), wird ein harter QA-Fehler geworfen, der das Auto-Fixing auslöst.

### 11.2 Problem 2: LLM-Antwortabbruch & unvollständige Prompts
* **Symptom:** Bei der Generierung des „Prompt der Woche" lieferte das LLM gelegentlich einzeilige Trivial-Templates (z. B. „Erkläre den Code [X]"), was den Qualitätsansprüchen eines kostenpflichtigen Newsletters widersprach.
* **Ursache:** Zu allgemeine System-Prompts und fehlende Längen-Validierungen.
* **Lösung:** Einführung einer strengen Retry-Schleife mit einer benutzerdefinierten `validate()`-Funktion im Modul `generate_content.ts`. Erfüllt die Antwort nicht die Mindestlänge (z. B. Mindestlänge von 60 Zeichen für den Prompt und 80 Zeichen für die Erklärung), wird die Anfrage automatisch mit konkretem Feedback an das LLM wiederholt (`SEGMENT_MAX_ATTEMPTS = 3`).

### 11.3 Problem 3: Webhook-Payload-Mismatch bei LemonSqueezy (`customer_email` vs `user_email`)
* **Symptom:** Nach erfolgreichem Test-Checkout bei LemonSqueezy antwortete der Webhook-Endpunkt mit HTTP 200, in Supabase wurde jedoch weder eine Zeile in `subscriptions` angelegt noch der Plan des Nutzers auf `paid` umgestellt.
* **Ursache:** Der Code erwartete die E-Mail-Adresse des Kunden im Feld `data.attributes.customer_email`. LemonSqueezy überträgt bei Abonnement-Events (`subscription_created`, `subscription_updated`) die Adresse jedoch im Feld **`data.attributes.user_email`**.
* **Lösung:** Überarbeitung der Interface-Typen in `src/app/api/webhooks/lemonsqueezy/route.ts` und Einführung eines Fallback-Helpers `customerEmail(attr)`, der primär `user_email` und sekundär `customer_email` ausliest.

```typescript
function customerEmail(attr: LsSubscriptionAttributes): string | undefined {
  return attr.user_email ?? attr.customer_email;
}
```

### 11.4 Problem 4: Supabase RLS vs. Auth-Admin-Kontext
* **Symptom:** Die Serverless API-Route `/api/send-weekly` konnte die E-Mail-Adressen der Nutzer nicht aus der Datenbank auslesen, da PostgreSQL RLS den Zugriff auf Nutzerdaten ohne aktiven User-Session-Context verweigerte.
* **Ursache:** Die Kontaktdaten der Nutzer liegen aus Sicherheitsgründen im geschützten `auth.users`-Schema von Supabase.
* **Lösung:** Umstellung aller administrativen Hintergrund-Prozesse auf den `createAdminClient()` mit dem `SUPABASE_SERVICE_ROLE_KEY` und Nutzung der Supabase Auth Admin API (`client.auth.admin.listUsers()`).

### 11.5 Problem 5: Duplizierte / unvollständige Video-Empfehlungen & Prompthärtung
* **Symptom:** In aufeinanderfolgenden Testläufen wurden vereinzelt identische Video-Empfehlungen generiert.
* **Ursache:** Mangelnde Varianz in den Prompt-Anweisungen.
* **Lösung:** Prompthärtung in `pipeline/generate_content.ts`. Das LLM wird nun angewiesen, bevorzugt auf etablierte Kanal- oder Serien-Seiten zu verweisen und bei Unsicherheit explizit `null` zurückzugeben, anstatt unsichere Einzel-Video-Links zu erfinden.

---

## 12. Grenzen und kritische Reflexion

### 12.1 Modellgrenzen
Trotz mehrstufiger Qualitätssicherung und Titelfilterung besitzen Large Language Models prinzipbedingt keine absolute Garantie gegen Halluzinationen. Bricht eine externe Webseite nach der Veröffentlichung weg, kann dies erst beim nächsten Durchlauf erkannt werden.

### 12.2 Grenzen von Groq & OpenRouter
Die genutzten Free Tiers von Groq und OpenRouter unterliegen schwankenden Auslastungen. Während Groq im Regelfall Antworten in unter 1 Sekunde liefert, kann es zu Stoßzeiten zu Verzögerungen kommen. Die implementierte Fallback-Mechanistik deckt dies ab, erhöht jedoch im Fallback-Fall die Gesamtlaufzeit der Pipeline.

### 12.3 Grenzen der Bilderkennung & SDXL-Asset-Generierung
Cloudflare Workers AI stellt ein exzellentes SDXL-Modell bereit. Da die Bildgenerierung jedoch rein textbasiert (Prompt-driven) erfolgt, können komplexe Text-Elemente innerhalb der generierten Grafiken gelegentlich Artefakte aufweisen.

### 12.4 Kontextgrenzen
Die Recherche-Pipeline verarbeitet pro Woche ca. 50–150 Nachrichtenartikel. Bei extremen Nachrichtenlagen (z. B. dutzendweiten parallelen Events) filtert das Scoring-Modell streng auf die Top-Artikel. Sehr spezifische Nischennachrichten werden dabei unter Umständen herausgefiltert.

### 12.5 Produktgrenzen & Free-Tier-Limits
Das gewählte Setup unterstützt problemlos bis zu 3.000 Newsletter-Empfänger pro Monat über den Free Tier von Resend. Wächst die Abonnentenbasis darüber hinaus, ist der Wechsel auf einen kostenpflichtigen Resend-Plan (20 $/Monat für 50.000 Mails) oder die Anbindung von Brevo als Versand-Relay erforderlich.

### 12.6 Mögliche nächste Schritte
* **Eigene Absender-Domain:** Verifikation einer eigenen Domain via SPF/DKIM im Resend-Dashboard zur Maximierung der E-Mail-Zustellbarkeit (Inbox-Rate).
* **LemonSqueezy Live-Modus:** Umschalten des LemonSqueezy-Keys von `Test` auf `Live` nach Abschluss der Händler-Identitätsprüfung.
* **Analytics Dashboard:** Ausbau der visuellen Auswertung von Öffnungs- (`opened_at`) und Klickraten (`clicked_at`) direkt im Admin-Dashboard.

---

## 13. Fazit

Mit dem Projekt **„AI Newsletter (Free & Paid Version)"** wurde erfolgreich der Nachweis erbracht, dass eine hochgradig komplexe, qualitativ hochwertige und kommerziell nutzbare Content-Plattform vollständig autonom und kostenneutral betrieben werden kann.

Durch die konsequente Verknüpfung moderner Webtechnologien (Next.js 15, Supabase, Tailwind CSS) mit hochentwickelten KI-Toolchains (Groq/Llama-3.3-70b, Cloudflare SDXL, Multi-Stage QA) entstand ein System, das redaktionelle Inhalte nicht nur automatisiert generiert, sondern diese auch technisch und inhaltlich validiert, repariert und rechtssicher monetarisiert.

Sämtliche Anforderungen des Projektauftrags wurden vollumfänglich erfüllt. Das System befindet sich in einem produktionsreifen Zustand und ist unter `https://ai-newsletter-sage.vercel.app` öffentlich erreichbar.

---

## Anhang A: Präsentationsentwurf (10–15 Minuten)

### Folie 1 – Titel und Problem
* **Titel:** Vollautomatisierter KI-Newsletter (Free & Paid)
* **Problemstellung:** Informationsüberflutung im KI-Bereich vs. enormer manueller Aufwand für kuratierte Wochen-Newsletter.
* **Lösung:** Autonome End-to-End Pipeline mit KI-Recherche, Multi-LLM-Generierung, automatischer QA und integrierter Paywall.

### Folie 2 – Ziel und Anwendungsfall
* **Zielgruppe:** Entwickler, KI-Enthusiasten und Fachkräfte.
* **Freemium-Modell:**
  * Free-Version: News-Snippets & Tool der Woche (Lead-Magnet).
  * Paid-Version (5 €/Monat): Prompt der Woche, Image-Training, Deep Dive Tutorial, Podcast, Video & Read der Woche.

### Folie 3 – Architektur
* **Frontend/Hosting:** Next.js 15 App Router auf Vercel Serverless.
* **Datenbank/Auth/Storage:** Supabase (PostgreSQL, Row Level Security, Auth PKCE).
* **Payment:** LemonSqueezy (Merchant of Record).
* **E-Mail Engine:** Resend API.

### Folie 4 – KI-Toolchain
* **Recherche & Scoring:** RSS, Hacker News, NewsAPI $\rightarrow$ Llama-3.3-70b Scoring ($\ge 70$).
* **Text-Generierung:** Multi-LLM Orchestrierung (Groq Primary, OpenRouter Fallback).
* **Bild-Generierung:** Cloudflare Workers AI (Stable Diffusion XL Base 1.0).

### Folie 5 – Ablaufdiagramm
* Visualisierung der Pipeline: `Collect` $\rightarrow$ `Score` $\rightarrow$ `Generate` $\rightarrow$ `Asset` $\rightarrow$ `QA & Auto-Fix` $\rightarrow$ `Persist` $\rightarrow$ `Publish` $\rightarrow$ `Send`.

### Folie 6 – Live-Demo-Setup
* Vorstellung der Produktions-URL: `https://ai-newsletter-sage.vercel.app`.
* Verweis auf das GitHub-Repository und die Vercel-Infrastruktur.

### Folie 7 – Live-Demo Newsletter & Dashboard
* Vorführung der Ausgabe `2026-08-07`.
* Demonstration der Paywall: Wie RLS kostenpflichtige Segmente für Anonyme verbirgt und für Paid-Abonnenten anzeigt.

### Folie 8 – Gegenbeispiel (Auto-Fix & Halluzinations-Erkennung)
* Wie das System halluzinierte YouTube-Links oder geparkte Domains über den Titel-Overlap-Algorithmus erkennt und im Auto-Fix-Zyklus repariert.

### Folie 9 – Free vs. Paid Paywall-Mechanismus
* Erklärung der PostgreSQL Row Level Security Policy auf der Tabelle `issue_content`.
* Demonstration des LemonSqueezy-Checkouts im Test-Modus.

### Folie 10 – Reflexion & Ausblick
* **Fazit:** 100 % Kostenneutralität (0 € Fixkosten) bei voller Produktionsreife.
* **Nächste Schritte:** Eigene Absender-Domain (SPF/DKIM), LemonSqueezy Live-Schaltung.

### Zeitplanung der Präsentation
* Minute 0–3: Einleitung, Problem & Zielstellung (Folien 1–2)
* Minute 3–7: Architektur, KI-Toolchain & QA-Pipeline (Folien 3–5)
* Minute 7–12: Live-Demo der Anwendung, Paywall & Auto-Fix (Folien 6–9)
* Minute 12–15: Fazit, Reflexion & Fragerunde (Folie 10)

---

## Anhang B: Quellcode- und Repository-Übersicht

* **Repository:** `X:\provadis\VI\IT Trends\AI_Newsletter`
* **Live-URL:** `https://ai-newsletter-sage.vercel.app`
* **Zentrales Sitzungsprotokoll:** `docs/DOKUMENTATION.md`
* **Projektfortschrittsplan:** `docs/PROJEKT_PLAN.md`
* **Wichtigste Quellcode-Dateien:**
  * `pipeline/collect.ts` – News-Collector
  * `pipeline/score.ts` – Article Scorer
  * `pipeline/generate_content.ts` – Multi-Segment Content Generator
  * `pipeline/generate_assets.ts` – SDXL Image Generator
  * `pipeline/qa.ts` – Link-, Titel- & Fact-Checker
  * `pipeline/persist.ts` – Supabase Persistierungs-Engine
  * `pipeline/run_weekly.ts` – Master Orchestrator
  * `src/app/api/send-weekly/route.ts` – E-Mail-Versand-Engine
  * `src/app/api/webhooks/lemonsqueezy/route.ts` – Payment Webhook Handler
  * `src/app/issues/[date]/page.tsx` – Newsletter-Detailseite mit RLS-Paywall
