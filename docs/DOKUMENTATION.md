# AI_Newsletter — Projektdokumentation / Sitzungsprotokoll

> **Zweck dieser Datei:** Laufendes Protokoll über alle Entscheidungen, Handlungen und Programmierschritte des Projekts.
> Jede Entscheidung wird festgehalten — auch Entscheidungen, die später wieder zurückgenommen werden.
> Die Datei darf lang und ausführlich sein. Einträge werden chronologisch ergänzt (neueste unten).
> Der verbindliche Aufgaben-Plan steht in `PROJEKT_PLAN.md`.

---

## Projektauftrag (Original)

**Erstellung AI Newsletter (free + paid version)** auf Basis KI News Recherche, mit:
- latest news / News-Snippets
- tool recommendation (z.B. ProductHunt)
- Prompt Empfehlung der Woche
- Bildgenerierungs-Prompt-Training
- AI Tutorial (Deep Dive, z.B. Claude)
- Podcast of the Week
- Video of the Week
- Read of the Week

**Anforderung:** Komplett automatisiert inkl. aller Assets und Qualitätssicherung.
**Kosten:** Alles soll gratis laufen (Free-Tier-Lösungen).

---

## Session 1 — 04.08.2026

### Kontext
- Projektauftrag besprochen (siehe oben).
- Grober Vorgehensplan vom Auftraggeber (Reihenfolge nicht verbindlich):
  1. Technologien festlegen (alles gratis)
  2. Frontend bauen (Registrierung/Login + Free/Paid + Zahlungsinformationen)
  3. Datenbank für User Management
  4. Email-Service
  5. Hosting
- Toolchain (Content-Pipeline):
  1. Webscraper
  2. Infos filtern
  3. Infos zusammenfassen
  4. Assets generieren
  5. Qualität testen / iterieren
  6. Fake-News-Tester

### Entscheidung E-001: Technologie-Stack (Vorschlag, noch nicht final)
- **Frontend/Backend:** Next.js (React, TypeScript, Tailwind)
- **Hosting:** Vercel (Hobby / Free-Tier)
- **Datenbank + User Management:** Supabase (Postgres, Auth, Row-Level-Security, Storage)
- **Zahlungen:** Stripe (Alternativ-Vorschlag: LemonSqueezy/Paddle, da diese EU-USt übernehmen)
- **Email (transaktional):** Resend (3000 E-Mails/Monat gratis)
- **Email (Newsletter bei großer Liste):** Brevo / MailerLite
- **Automation:** Vercel Cron oder GitHub Actions (Schedule)
- **Recherche:** RSS-Feeds, HackerNews-/Reddit-API, NewsAPI Free-Tier; falls nötig Python Scrapy/BeautifulSoup
- **LLM (Filter/Summarize/Assets):** Groq (gratis) oder OpenRouter (Free-Modelle) oder Gemini Free-Tier
- **Bildgenerierung:** Pollinations.ai API (gratis) oder lokale Stable Diffusion
- **Fact-Check / Fake-News-Test:** LLM-Kreuzreferenz + Google Fact Check Tools API

*Status: Vorschlag. Offene Entscheidungen unten in E-00x.*

### Entscheidung E-002: Aufgaben-Plan als Datei
- Datei `PROJEKT_PLAN.md` erstellt: detaillierter, schrittweiser Todo-Plan über 11 Phasen
  (Setup → Content-Pipeline → Asset-Generierung → QA/Fake-News-Test → Datenbank → Frontend → Email → Automation → Tests → Launch) plus offene Entscheidungen.

### Entscheidung E-003: Arbeitsverzeichnis
- Das Projekt wurde von `C:\Users\x\Documents\Default Project` nach
  **`X:\provadis\VI\IT Trends\AI_Newsletter`** verschoben.
- Das neue Verzeichnis ist ab sofort das **offizielle Arbeitsverzeichnis** für alle weiteren Schritte.
- Das alte Verzeichnis existiert nicht mehr.

### Entscheidung E-004: Dokumentationsdatei (diese Datei)
- **`DOKUMENTATION.md`** ist die laufende Projektdokumentation (dieses Protokoll).
- Es wird **alles** festgehalten: getroffene Entscheidungen, durchgeführte Handlungen, programmierter Code, und nachträgliche Rücknahmen von Entscheidungen.
- Format: chronologisch, nach Sessions gegliedert, Entscheidungen nummeriert (E-00x).
- Ergänzungsregel: Neue Einträge kommen ans Ende der Datei; alte Einträge bleiben erhalten.

### Offene Entscheidungen (aus PROJEKT_PLAN.md) — Stand: alle geklärt, siehe Session 1 (Fortsetzung)
- E-005 Zahlungsanbieter: **GEKLÄRT → LemonSqueezy**
- E-006 Newsletter-Format: **GEKLÄRT → wöchentlich**
- E-007 Paid-Modell: **GEKLÄRT → Monats-Abo**
- E-008 Erscheinungstag + Uhrzeit: **GEKLÄRT → Montag 08:00**
- E-009 Paid-Archive gebündelt: **GEKLÄRT → Ja, komplettes Archiv**
- E-010 Sprache: **GEKLÄRT → Englisch**
- E-011 LLM-Anbieter: **GEKLÄRT → Groq + OpenRouter als Fallback**
- E-012 Bildstil: **GEKLÄRT → Moderne 3D-Illustration**

---

## Session 1 (Fortsetzung) — 04.08.2026 — Offene Entscheidungen geklärt

Folgende Entscheidungen wurden vom Auftraggeber getroffen (alle Vorschläge wurden übernommen):

| Entscheidung | Ergebnis |
|---|---|
| E-005 Zahlungsanbieter | **LemonSqueezy** (Merchant of Record, übernimmt EU-USt automatisch) → ersetzt Stripe im Stack |
| E-006 Newsletter-Frequenz | **Wöchentlich** (1 Ausgabe pro Woche) |
| E-007 Paid-Modell | **Monats-Abo** (wiederkehrend) |
| E-008 Erscheinungstag/-zeit | **Montag 08:00** |
| E-009 Paid-Archive | **Ja** — komplette bisherige Ausgaben für neue Paid-Mitglieder |
| E-010 Sprache | **Englisch** |
| E-011 LLM-Anbieter | **Groq** (Primary) + **OpenRouter** als Fallback |
| E-012 Bildstil | **Moderne 3D-Illustration** (Header, Social-Media-Teaser) |

### Konsequenzen für den Plan
- **E-001 (Stack) wird angepasst:** Zahlungen = **LemonSqueezy** statt Stripe. (Stripe wird NICHT weiterverfolgt.)
- **E-011 Konkretisierung:** Primäres LLM: Groq (gratis, schnell, z.B. Llama-/Mixtral-Modelle). Bei Rate-Limit/Ausfall: OpenRouter mit Free-Modellen als Fallback. Finale Modellwahl erfolgt später (Phase 2) beim Feintuning der Pipeline.
- **E-010 Konsequenz:** Alle Prompts, Templates und Inhalte der Pipeline werden in **Englisch** erstellt.
- **E-012 Konsequenz:** Bildgenerierungs-Prompts müssen konsistenten 3D-Illustrations-Stil definieren (Design-System in Phase 3).

### Nächste Schritte (geplant)
- Phase 0 starten: Node.js verifizieren, Git init, Next.js-Setup.
- Vor Build von Phase 6/7: LemonSqueezy-Konto anlegen und Test-Modus konfigurieren.

---

<!-- Neue Einträge werden hier unten angefügt. -->

---

## Session 2 — 04.08.2026 — Phase 0 (Projekt-Setup) durchgeführt

### Ausgangslage
- Alle offenen Entscheidungen geklärt (siehe Session 1, Fortsetzung).
- Arbeitsverzeichnis: `X:\provadis\VI\IT Trends\AI_Newsletter`.

### Durchgeführte Schritte (Ablauf)

1. **Node.js-Setup verifiziert:**
   - Node/npm waren NICHT im PATH.
   - `fnm` (Fast Node Manager 1.38.1) war installiert und hatte **Node v22.13.1 (LTS)** bereits.
   - Node-Pfad: `C:\Users\x\AppData\Roaming\fnm\node-versions\v22.13.1\installation\`
   - **Wichtige Erkenntnis:** PowerShell-Execution-Policy blockiert `*.ps1`-Skripte → `npx`/`npm` müssen als `npx.cmd`/`npm.cmd` aufgerufen werden (oder volle Pfade). Alle Kommandos setzen vorher `$env:Path` auf den fnm-Ordner.
   - Git 2.47.1 war vorhanden.

2. **Git-Repository initialisiert:**
   - `git init`, Branch umbenannt auf `main`, `core.autocrlf false` gesetzt.

3. **Next.js-Projekt erstellt:**
   - `create-next-app@latest` mit TypeScript, Tailwind, ESLint, App-Router, `src/`-Verzeichnis, Import-Alias `@/*`, npm, **ohne** Turbopack-Build.
   - **Problem:** Der Ordnername `AI_Newsletter` enthält Großbuchstaben → npm-Namensregel verbietet das als Projektname.
   - **Lösung:** Projekt als `ai-newsletter`-Unterordner erstellt, dann sämtliche Dateien (inkl. versteckter) in den Root verschoben und den Unterordner gelöscht.
   - **Versionen:** Next.js **16.3.0**, React **19.2.8**, Tailwind **v4** (via `@tailwindcss/postcss`), TypeScript 5, ESLint 9.
   - **Hinweis:** Next 16 hat Breaking Changes ggü. älteren Versionen. `AGENTS.md` (von `next dev` generiert) verweist auf Docs unter `node_modules/next/dist/docs/`.

4. **Projektstruktur angelegt:**
   - `src/lib/` — Bibliotheken (Supabase, LLM, Email, LemonSqueezy) — angelegt
   - `src/api/` — interne Pipeline-Funktionen — angelegt
   - `pipeline/` — Weekly-Workflow-Skripte — angelegt
   - `docs/` — **PROJEKT_PLAN.md und DOKUMENTATION.md hierher verschoben**
   - Vom Scaffold generiert: `src/app/` (layout.tsx, page.tsx, globals.css, favicon.ico), `public/`

5. **`.gitignore` angepasst:**
   - Negation ergänzt: `!.env.example` (damit die Beispiel-Env-Datei committed werden kann, `.env*` weiterhin ignoriert).

6. **`.env.example` angelegt** mit allen geplanten Variablen:
   - Supabase (URL, Anon-Key, Service-Role-Key)
   - Groq (API-Key, Modell: `llama-3.3-70b-versatile`)
   - OpenRouter (API-Key, Modell: `meta-llama/llama-3.3-70b-instruct:free`)
   - Resend (API-Key, From-Adresse, Admin-Mail)
   - LemonSqueezy (API-Key, Webhook-Secret, Product/Variant-ID)
   - NewsAPI (Key)
   - `NEXT_PUBLIC_SITE_URL`

7. **Build- und Lint-Test bestanden:**
   - `npm run build` → kompiliert, TypeScript-Check ok, statische Seiten ok.
   - `npm run lint` → keine Fehler.

### Noch offen aus Phase 0
- README.md aktualisieren (Standard-Scaffold-Texte ersetzen) — wird später sinnvoll (nach ersten Features).
- Erster Git-Commit steht noch aus (machen wir, sobald gewünscht).

### Nächste Schritte (geplant)
- **Phase 1:** Content-Pipeline — Recherche (RSS-Feeds, NewsAPI, HN/Reddit) → Sammel-Skript `pipeline/collect_sources.ts`.
- Parallel Setup Supabase-Projekt (Konto + Projekt anlegen, Schema in Phase 5).

---

## Session 3 — 04.08.2026 — Phase 1 (Recherche-Pipeline) umgesetzt

### Neue Abhängigkeiten
- `rss-parser` (Runtime-Dependency) — RSS/Atom-Feeds parsen
- `tsx` (Dev-Dependency) — TypeScript-Skripte direkt ausführen (`npm run pipeline:collect`)

### Angelegte Dateien
| Datei | Zweck |
|---|---|
| `src/lib/types.ts` | Gemeinsame Typen: `RawArticle`, `SourceConfig`, `CollectResult` |
| `pipeline/config/sources.ts` | Zentrale Quellenliste (13 Quellen) |
| `pipeline/fetchers.ts` | Fetch-Logik pro Quellentyp (rss, hackernews, reddit, newsapi) + Timeout/Abort |
| `pipeline/dedup.ts` | `normalizeUrl` (Tracking-Parameter raus), `hashId` (SHA1), `normalizeTitle` |
| `pipeline/collect.ts` | Hauptskript: Quellen abrufen → dedupen → sortieren → JSON schreiben |
| `pipeline/output/` | Ausgabeordner (JSON gitignored, `.gitkeep` committet) |

### Quellen (Stand jetzt)
- **RSS:** TechCrunch AI, The Verge AI, MIT Technology Review AI, VentureBeat AI, Wired AI, Ars Technica AI, Google News AI (Such-Feed), ProductHunt AI Tools
- **HackerNews:** Top-50-Stories, Filter: Score >= 50, letzte 7 Tage, nur `type=story`
- **Reddit:** r/artificial, r/LocalLLaMA, r/MachineLearning — via RSS (`.rss`)
- **NewsAPI:** optional, nur aktiv wenn `NEWSAPI_KEY` gesetzt

### Technische Entscheidungen & Erkenntnisse (Session 3)
1. **Reddit-JSON-API blockiert** (HTTP 403 ohne OAuth) → auf **Reddit-RSS-Feeds** umgestellt. 
2. **Rate-Limits:** Reddit-Subreddits liefern teils HTTP 429 → 750ms-Pause zwischen Quellen; Fehler werden geloggt, brechen die Pipeline aber nicht ab.
3. **Windows/PowerShell:** `npx`/`npm`-`ps1`-Skripte sind blockiert → Aufruf als `npx.cmd`/`npm.cmd` mit gesetztem fnm-PATH.
4. **tsx-Eintrittspunkt:** `import.meta.url === pathToFileURL(process.argv[1]).href` — der Windows-Vergleich ohne korrekte `file:///`-URL hat den Script-Start verhindert; mit `pathToFileURL` gelöst.
5. **Prozess-Hang:** `fetch` (undici) hält Keep-Alive-Verbindungen offen → nach Log-Ausgabe `process.exit(0)`.
6. **Datenqualitäts-Fixes:** Google-News-Titel um angehängtes `" - Quelle"` gekürzt; ProductHunt-Zusammenfassung aus Content extrahiert statt nutzlosem "Discussion | Link".
7. **npm-Name:** Projekt-Ordnername `AI_Newsletter` enthält Großbuchstaben → Scaffold in Lowercase-Unterordner `ai-newsletter` erstellt und in Root verschoben.

### Ergebnis (Testlauf 04.08.2026)
- **246 einzigartige Artikel** (von 251 gefetcht) aus 11/13 Quellen.
- Fehler: Reddit r/LocalLLaMA + r/MachineLearning (HTTP 429, Rate-Limit — akzeptiert, da Fehler-Toleranz eingebaut).
- VentureBeat lieferte 0 Artikel (Feed aktuell leer), NewsAPI 0 (kein Key gesetzt).
- `npm run lint` und `tsc --noEmit` fehlerfrei.

---

## Session 4 — 04.08.2026 — Phase 2 (Filter + Zusammenfassung) umgesetzt

### Ausgangslage
- Nutzer hat `GROQ_API_KEY` und `OPENROUTER_API_KEY` in `.env` hinterlegt (Verifiziert: 56 / 73 Zeichen).

### Neue Abhängigkeiten
- `jsonrepair` — repariert fehlerhaftes LLM-JSON (unescaped Quotes, Truncation).

### Neue Dateien
| Datei | Zweck |
|---|---|
| `src/lib/llm.ts` | LLM-Client: **Groq primary → OpenRouter Fallback** (OpenAI-kompatible API via fetch). Mit Retry bei HTTP 429 (wartet laut Groq-Meldung), `jsonMode` (response_format), `extractJson` mit Repair. |
| `pipeline/score.ts` | Bewertet Artikel in Batches à 10 per LLM (Score 0–10), Schwelle >= 7, schreibt `scored_articles.json`. |
| `pipeline/generate_content.ts` | Erzeugt alle Newsletter-Segmente per LLM und schreibt `newsletter_draft_YYYY-MM-DD.json`. |

### Neue npm-Scripts
- `pipeline:score` → `tsx pipeline/score.ts`
- `pipeline:generate` → `tsx pipeline/generate_content.ts`

### Technische Erkenntnisse & Entscheidungen (Session 4)
1. **OpenRouter-Free-Modell veraltet:** `meta-llama/llama-3.3-70b-instruct:free` existiert nicht mehr (404). Aktuell verfügbare Free-Modelle über `/models`-Endpoint abgefragt. **Neues Fallback-Modell: `nvidia/nemotron-3-super-120b-a12b:free`** (in `.env`, `.env.example` und Code-Default aktualisiert). OpenRouter-Free-Modelle wechseln häufig → muss bei Bedarf neu geprüft werden.
2. **Groq-Free-Tier Rate-Limits:** TPM-Limit 12.000/Min. Lösung: **BATCH_SIZE 10**, Summaries auf 200 Zeichen gekürzt, **1,5s Pause zwischen Batches**, **429-Retry** (wartet die von Groq angegebene Zeit, statt sofort auf OpenRouter zu wechseln).
3. **LLM-JSON oft fehlerhaft:** Unescaped Anführungszeichen in Strings → `jsonrepair` als Fallback; Modell liefert manchmal JSON als escaped String → **rekursive Auflösung** in `extractJson`.
4. **jsonrepair-Artefakte:** Listenmarker wie `1.` werden zu `1.0` (Zahlen) und Bullet-`*` bleiben als eigene Elemente → **Sanitizer** filtert Nicht-Strings und `*` aus Steps/Takeaways.
5. **Deep-Dive-Abschnitt:** Braucht mehr Token (maxTokens 4000) + Retry bei Parse-Fehler in `segment()`.
6. **.env.example fehlte:** Vermutlich beim Anlegen der `.env` umbenannt → **neu erstellt**. Hinweis dokumentiert: `.env.example` bitte als Kopie behalten.
7. **Modell-Wahl (E-011 konkretisiert):** Groq `llama-3.3-70b-versatile` liefert gute Ergebnisse für alle 9 Segmente.

### Ergebnis (Testlauf 04.08.2026)
- **Scoring:** 141/246 Artikel mit Score >= 7 (Median ~6,1). Rate-Limits wurden automatisch abgefangen.
- **Entwurf:** `newsletter_draft_2026-08-04.json` — alle 9 Segmente generiert (5 News-Snippets, Tool of the Week "Gemini Robotics 2", Prompt der Woche, Image-Prompt-Training, Deep Dive mit 8 Steps + 5 Takeaways, Podcast/Video/Read of the Week, Titel + Intro).
- Lint + TypeScript fehlerfrei.
- **Offen:** Supabase-Persistenz (`issues`-Tabelle) → kommt mit Phase 5. Empfehlungen (Podcast/Video/Read) sind LLM-Vorschläge → müssen in Phase 4 (QA) auf Echtheit geprüft werden.

---

## Session 5 — 05.08.2026 — Phase 3 (Asset-Generierung) umgesetzt

### Neue Dateien
| Datei | Zweck |
|---|---|
| `pipeline/generate_assets.ts` | Hauptskript: Bilder, Landing-Texte, E-Mail-HTML; npm-Script `pipeline:assets` |
| `pipeline/imageProviders.ts` | Bild-Provider: HF Inference API (FLUX → SDXL) + lokale SD als Fallback |
| `pipeline/renderEmail.ts` | Füllt das E-Mail-Template mit den Draft-Segmenten (Inline-CSS, Tabellen) |
| `pipeline/templates/email_template.html` | Responsives E-Mail-Template (client-sicher, Platzhalter) |

### NEUE ENTSCHEIDUNG (Plan-Abweichung): Pollinations.ai entfernt
- **Stand 2026:** Pollinations-Bildgenerierung ist kostenpflichtig (402 "Insufficient balance", alle Modelle laufen über "Sana", benötigt Pollen-Guthaben).
- **Ersatz (E-013):** **Hugging Face Inference API** als primärer Bild-Provider:
  - Modell 1: `black-forest-labs/FLUX.1-schnell` (kostenlos, schnell)
  - Modell 2 (Fallback): `stabilityai/stable-diffusion-xl-base-1.0`
  - Benötigt kostenlosen HF-Account + Token (`HF_TOKEN` in `.env`)
- **Fallback (wie im Plan):** lokale Stable Diffusion über WebUI-API (`LOCAL_SD_URL`, optional).
- **Bild-Formate:** Header **1200x630 PNG**, Social-Teaser **1080x1080 PNG** (seed = Issue-Datum für Reproduzierbarkeit).

### Technische Erkenntnisse
1. Bild-Prompts im 3D-Stil (E-012) werden aus Draft-Titel + Top-Themen gebaut (Header) bzw. als Komposition (Social).
2. Fehlerhaftes Bild-Generieren bricht die Pipeline NICHT ab → E-Mail wird trotzdem gerendert, Bild-Referenz zeigt auf Platzhalter.

### Stand der Assets (Testlauf 05.08.2026)
- E-Mail-HTML: gerendert, keine Platzhalter übrig, enthält alle Segmente (News, Tool, Prompt, Image-Training, Deep Dive, Extra-Blocks, Footer mit Unsubscribe).
- Landing-Texte: `landing_texts.json` generiert (hero, features, pricing free/paid, faq).
- Bilder: **AUSSTEHEND** — braucht `HF_TOKEN` vom Nutzer.



## Session 6 — 05.08.2026 — Bildgenerierung umgestellt auf Cloudflare Workers AI (only)

### NEUE ENTSCHEIDUNG (Plan-Abweichung): Nur Cloudflare Workers AI
- **E-014:** Die Bildgenerierung läuft ab sofort **ausschließlich über Cloudflare Workers AI**.
  - Hugging Face (HF_TOKEN) und lokale Stable Diffusion werden NICHT weiterverfolgt (nur Cloudflare).
  - Grund: eine einzige Free-Tier-Quelle statt mehrerer Anbieter/Konten; 3D-Illustrationen (E-012) über FLUX.1-schnell.

### Cloudflare Workers AI — Fakten (recherchiert)
- **Free-Tier:** 10.000 Neuronen/Tag (Neuronen = pro Inferenz-Anfrage, unabhängig von Bildgröße).
- **REST-Endpoint:** `https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{model}`
  - Auth: `Authorization: Bearer {API_TOKEN}` (Permission **"Workers AI: Run"**)
- **Antwortformat (Bildmodelle):** JSON `{ success: true, result: { image: "<Base64>" } }`
- **Modelle (verwendet):**
  1. `@cf/black-forest-labs/flux-1-schnell` — beste Qualität, **nur quadratisch** (kein width/height-Parameter)
  2. `@cf/stabilityai/stable-diffusion-xl-base-1.0` — unterstützt width/height (max. 1024)
  3. Fallback: `@cf/bytedance/stable-diffusion-xl-lightning` — width/height, sehr schnell

### Durchgeführte Änderungen
1. **`pipeline/imageProviders.ts` komplett neu geschrieben:**
   - Nur noch Cloudflare (`runCloudflare`), HF/lokale SD entfernt.
   - Quadratische Bilder → FLUX.1-schnell zuerst, sonst SDXL → SDXL-Lightning.
   - Nicht-quadratische (Header) → SDXL → SDXL-Lightning.
   - Fehlerbehandlung: HTTP-Fehler + `errors[].message` + `result.image` fehlt → klare Meldung;
     leere/zu kleine Antwort (< 1000 Bytes) gilt als Fehler; 120s Timeout mit AbortController.
   - Fehlende Credentials werfen sauberen Fehler (kein Crash mitten in der Pipeline).
2. **`pipeline/generate_assets.ts`:** Bildgrößen angepasst an Cloudflare-Limits:
   - Header: **1200x630 → 1024x576** (SDXL-Maximum 1024, 16:9 bleibt)
   - Social: **1080x1080 → 1024x1024** (FLUX.1-schnell Standard-Quadrat)
3. **`.env.example`:** HF_TOKEN/LOCAL_SD_URL ersetzt durch `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`.

### Testlauf + Nachbesserungen (05.08.2026)
- **1. Versuch:** FLUX ok (Social), aber SDXL-Schema abgelehnt (`/num_steps` max 20) und SDXL-Lightning lieferte **rohes JPEG** statt JSON → Fehler beim Parsen.
- **Fixes:** `num_steps` auf **20** reduziert; `runCloudflare` erkennt `Content-Type: image/*` und schreibt die Antwort direkt als Datei (Roh-Binär), sonst JSON-`result.image` (Base64). *Hinweis: SDXL liefert tatsächlich auch rohe Binärdaten, FLUX dagegen Base64-JSON.*
- **Ergebnis (Testlauf ok):**
  - `assets/header_2026-08-04.png` (1024x576, ~746 KB) via SDXL base
  - `assets/social_2026-08-04.png` (1024x1024, ~458 KB) via FLUX.1-schnell
  - E-Mail-HTML + Landing-Texte erneut gerendert; tsc + Lint fehlerfrei.

### Nachbesserung: Header-Qualität (Nutzer-Feedback)
- SDXL-Header hatte verstümmelten/unlesbaren Text (typisches SDXL-Problem) → **Header wird jetzt ebenfalls mit FLUX.1-schnell erzeugt** (Quadrat 1024x1024) und per **sharp zentriert auf 1024x576 zugeschnitten**.
- `sharp@^0.35.3` als direkte Dependency in `package.json` aufgenommen (war vorher nur transitiv via Next.js).
- Bildstrategie final: **FLUX (Crop bei Bedarf) → SDXL base → SDXL Lightning**. Nutzer-Feedback: „Header sehr gut, Social sehr gut" → abgenommen.

### Offen
- Nutzer-Keys: Der API-Token stand im Chat → nach Tests idealerweise rotieren (neuen Token erstellen, alten löschen).
- Bilder ansehen und Stil-Check (E-012: 3D-Illustration) — Qualität ggf. via Prompts iterieren (Phase 4/9).



## Session 7 — 05.08.2026 — Phase 4 (Qualitätssicherung + Fake-News-Check) umgesetzt

### Neue Dateien / Änderungen
| Datei | Zweck |
|---|---|
| `pipeline/qa.ts` | QA-Agent: Link-Validierung, LLM-Content-QA, Claims-Check (Stufe 1), Google Fact Check (Stufe 2, optional) |
| `src/lib/types.ts` | + `QaIssue`, `QaReport` |
| `pipeline/renderEmail.ts` + `email_template.html` | Header-Bild bekommt **ALT-Text** (`{{HEADER_ALT}}`, default `AI Newsletter — <Titel>`) |
| `package.json` | + Script `pipeline:qa` |
| `.env.example` | + `GOOGLE_FACTCHECK_API_KEY` (optional, Stufe 2) |

### QA-Agent: Prüfschritte (Ablauf `npm run pipeline:qa`)
1. **Link-Validierung:** alle URLs aus dem Draft (News, Tool, Podcast/Video/Read) per HEAD (bei 405/403 → GET), Redirects werden gefolgt.
   - **404/410 → Fehler (must-fix)**; Timeout/Netzfehler → Warnung; Concurrency 5, Timeout 12s.
2. **Content-QA (LLM, Groq):** prüft Struktur, Ton, Duplikate, Halluzinationsrisiko, Längenlimits, leere/Placeholder-Werte → Issues mit severity.
3. **Deterministische Checks:** `imagePromptTraining.examplePrompt` darf keine `[PLATZHALTER]` enthalten (Pflicht-Feld ist sonst `promptTemplate`).
4. **Claims vs. Quelle (Stufe 1):** für jeden News-Snippet Artikel-Seite fetchen (Title/Meta/Body) und per LLM `supported`/`contradicted`/`unclear` bewerten. Quelle nicht abrufbar → Warnung.
5. **Google Fact Check (Stufe 2, optional):** nur wenn `GOOGLE_FACTCHECK_API_KEY` gesetzt; Treffer mit Rating `false/misleading/incorrect/fake` → Fehler, sonst Info.
- **Verhalten:** Report → `qa_report_YYYY-MM-DD.json`; **Exit-Code 1 bei ≥1 Fehler** (Pipeline bricht ab und loggt). Ausnahme: `QA_IGNORE_ERRORS=1`.

### False-Positive-Fixes (Erfahrungen aus dem Testlauf)
1. `[BRACKETS]`-Platzhalter in `promptOfTheWeek.prompt` und `imagePromptTraining.promptTemplate` sind **Design** — nicht als Fehler werten (einmalige Regel im System-Prompt).
2. LLM markierte `examplePrompt` trotz korrektem Inhalt als fehlerhaft → **Platzhalter-Regel deterministisch** geprüft statt per LLM.
3. Deep-Dive mit 5–8 Steps/3–5 Takeaways ist Design — keine Längen-Fehler; und: **"error" nur für Must-Fix (Struktur/Fakten/Leer), Stil- und Lese-Verbesserungen sind immer "warning"**.

### Testlauf 05.08.2026
- `pipeline/qa` auf Draft 2026-08-04: **FAIL (1 Fehler, 9 Warnungen)** — korrekt:
  - **Fehler:** Podcast-Link `https://www.alignmentpodcast.com/` → **HTTP 404** (kaputter Link, von QA zuverlässig gefunden).
  - Warnungen: Stil-Feinheiten (Intro kürzen, Summaries straffen), 4x "Claim unklar" bei **Google-News-Redirect-URLs** (`news.google.com/rss/articles/...` — Quelltext nicht verifizierbar), Fact-Check-Stufe 2 nicht konfiguriert.
- Der echte 404-Fehler zeigt: QA erfüllt seinen Zweck; bei echter Produktion würde die Pipeline hier abbrechen (bzw. Phase-8-Master-Skript müsste Empfehlung neu generieren oder Sektion droppen).
- **Hinweis für später:** Google-News-Redirect-Links sind für Claims-Check und E-Mail-Links suboptimal → in Phase 9 (Iteration) prüfen, ob sie beim Sammeln zur kanonischen URL aufgelöst werden sollen.



## Session 8 — 05.08.2026 — Phase 8 (Master-Skript) + Kreuz-Referenz + Auto-Fix

### Neue Dateien / Änderungen
| Datei | Zweck |
|---|---|
| `pipeline/run_weekly.ts` | Master-Skript: führt alle 5 Stufen nacheinander aus (collect → score → generate → assets → qa), misst Timings, schreibt `run_weekly_YYYY-MM-DD.json`, Exit 0 nur bei QA-PASS |
| `pipeline/qa.ts` | + **Kreuz-Referenz** (`crossReferenceCheck`): LLM prüft News-Snippets auf widersprüchliche Claims → Konflikt = Fehler |
| `pipeline/collect.ts` | `collect()` exportiert (für Master-Skript nutzbar) |
| `package.json` | + Script `pipeline:weekly` |

### Master-Skript `npm run pipeline:weekly` (Phase 8)
- Startet mit `--from=<stufe>` mitten in der Pipeline (z.B. `--from=assets`), erlaubt: `collect|score|generate|assets|qa`.
- Fail-closed: QA-Fehler → Abbruch, Exit 1, Ausgabe wird nicht veröffentlicht.
- **`--auto-fix`:** kaputte Empfehlungs-Links (QA-Fehler in Sektionen tool/podcast/video/read) werden automatisch aus dem Draft entfernt, E-Mail neu gerendert, QA erneut ausgeführt. Sektion `news` wird bewusst NICHT automatisch gefixt (muss manuell/generiert werden).
- Logging: `run_weekly_<issueDate>.json` (Timings + QA-Zusammenfassung).

### End-to-End-Test 05.08.2026 (kompletter Weekly-Lauf, echte Daten)
- **Ablauf:** Recherche 13,3s (254 Artikel, 3 Quellen-Fehler toleriert: Reddit 429 ×2, NewsAPI 401 da Platzhalter-Key) → Scoring 89,4s (146/254 ≥ 7, Rate-Limits automatisch abgefangen) → Inhalte 26,9s (alle 9 Segmente) → Assets 5,0s (beide Bilder via FLUX) → QA 19,9s.
- **QA-Ergebnis: FAIL (1 Fehler, 8 Warnungen)** — wieder der tote Podcast-Link `https://www.alignmentpodcast.com/` (404). Der LLM empfiehlt denselben toten Link mehrfach → **Auto-Fix ist genau für diesen Fall gebaut**.
- Der Auto-Fix-Lauf selbst steht noch aus (Test nach diesem Protokoll-Eintrag).

### Offen / Hinweise
- Auto-Fix getestet: **`npm run pipeline:weekly -- --from=assets --auto-fix` → PASS** (siehe unten).
- Phase-8-Rest (Cron/GitHub Actions, Fehler-Notification an Admin) erst wenn Hosting/Resend stehen.

### Auto-Fix-Test 05.08.2026 (erfolgreich)
- Lauf mit `--from=assets --auto-fix` auf Draft 2026-08-05:
  1. Assets + erste QA → **FAIL (1 Fehler: Podcast-Link 404)**.
  2. Auto-Fix: `podcastOfTheWeek` entfernt, Draft + E-Mail neu geschrieben.
  3. Zweite QA → **PASS (0 Fehler, 9 Warnungen)**, `run_weekly` mit Exit 0: *"ALLE STUFEN OK in 11,1s — Ausgabe 2026-08-05 bereit."*
- Damit ist der komplette Wochen-Workflow (Recherche → Scoring → Inhalte → Assets → QA) inkl. Selbstheilung validiert.
- Hinweis: News-Sektionen werden bewusst NICHT automatisch gefixt — nur optionale Empfehlungen (tool/podcast/video/read).

### README + erster Git-Commit (05.08.2026)
- `README.md` neu geschrieben (Projektübersicht, Pipeline-Befehle, Struktur, Status).
- `.gitignore` verschärft: gesamter `pipeline/output/`-Ordner ignoriert (nur `.gitkeep`).
- **Initial-Commit `39235cd`** (37 Dateien): kompletter Stand inkl. Doku.
- **Commit-Cadence ab jetzt:** nach jeder abgeschlossenen Arbeitseinheit committen — Regel in `AGENTS.md` hinterlegt.



## Session 9 — 05.08.2026 — Phase 5 (Supabase: Schema + Auth-Bibliothek) umgesetzt

### Neue Abhängigkeiten
- `@supabase/supabase-js`, `@supabase/ssr`

### Neue Dateien
| Datei | Zweck |
|---|---|
| `supabase/migrations/0001_init.sql` | Komplettes Schema + RLS + Trigger (in Supabase SQL Editor ausführbar) |
| `src/lib/supabase/client.ts` | Browser-Client (`createClient`, Client Components) |
| `src/lib/supabase/server.ts` | Server-Client (`createServerSupabase`, Cookie-Session) + `createServiceClient` (Service-Role) |
| `src/lib/auth.ts` | `getSession`, `requireUser`, `getProfile`, `isPaidUser` |
| `src/proxy.ts` | **Next-16-Proxy** (ehem. Middleware): Supabase-Session-Refresh für jede Anfrage |

### Schema (Höhepunkte)
- `profiles` (plan free/paid, email_preferences), `subscriptions` (LemonSqueezy-ID, status, current_period_end), `issues` (draft/qa/published), `issue_content` (Segment-JSON, **`paid_only`**-Flag), `raw_articles` (Pipeline-Output, nicht öffentlich), `newsletter_deliveries` (Versandlog).
- **RLS:** User sieht nur eigene Daten; veröffentlichte Issues öffentlich lesbar; Paid-Segmente nur mit aktivem Abo (`is_paid_subscriber()`); `raw_articles` nur via Service-Role.
- **Trigger:** `set_updated_at` (updated_at) + `handle_new_user` (legt bei Registrierung automatisch das Profil an).

### Technische Erkenntnisse (Next 16)
1. **Middleware → Proxy:** Next 16 hat `middleware.ts` in **`proxy.ts`** umbenannt (gleiche Funktionalität, `export function proxy`). Lokale Doku: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.
2. Browser- und Server-Client wurden in **getrennte Dateien** aufgeteilt: der Browser-Client darf `next/headers` nicht importieren (sonst Build-Fehler bei Client Components).
3. `tsc`/`lint`/`next build` grün; Build erkennt die Proxy-Route korrekt.

### Offen (Nutzer-Schritt)
- Kostenloses Supabase-Projekt anlegen → `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
- `supabase/migrations/0001_init.sql` im **Supabase SQL Editor** ausführen.
- Danach: Pipeline-Persistenz (raw_articles/issues in DB, Assets in Storage — Phase-1/2/3-Open-Points) + Auth-UI (Phase 6).



## Session 10 — 05.08.2026 — Phase 5 abgeschlossen (Live-Verbindung + Pipeline-Persistenz)

### Zugangsdaten & Konfiguration
- Supabase-Projekt-URL: `https://znfeiqrhbrjkfsvmnjsi.supabase.co` (vom Nutzer geliefert; der zuvor aus dem JWT abgeleitete Ref `znfeiqhrbjkfsvmnjsi` war falsch → NXDOMAIN).
- Neue Key-Typen: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = publishable-Key (`sb_publishable_…`), `SUPABASE_SERVICE_ROLE_KEY` = secret-Key (`sb_secret_…`), alle in `.env`.
- Migration `0001_init.sql` vom Nutzer im SQL Editor ausgeführt („Success. No rows returned") → Schema live.

### Fehlerbehebung `.env`
- **BOM-Problem:** `.env` hatte einen UTF-8-BOM am Dateianfang; Node `process.loadEnvFile` übersprungen dadurch Werte nach der ersten Zeile (`NEXT_PUBLIC_SUPABASE_URL` blieb leer). BOM entfernt → Parsing ok.

### Neue Datei `pipeline/persist.ts` (Phase-5-Persistenz)
| Funktion | Zweck |
|---|---|
| `upsertRawArticles` | Alle gescorcten Artikel (254) chunked (100) nach `raw_articles` (Upsert auf `id`) |
| `upsertIssue` | Issue per `issue_date`-Upsert; Status `draft` (Default) oder `published` via `--publish` |
| `uploadAssets` | Bucket `newsletter-assets` (public, auto-create) + Header/Social-PNG → `issues/<date>/…`, Upsert |
| `buildSegments` | 9 Segmente; `intro` enthält zusätzlich `headerImageUrl`/`socialImageUrl` (kein Schema-Umbau nötig); `null`-Segmente (entfernte Empfehlungen nach Auto-Fix) werden übersprungen |
| `replaceIssueContent` | `delete` + `insert` (idempotent bei Wiederholung) |

- Free-Segmente: `intro`, `news`, `tool`. Paid-Segmente (`paid_only=true`): `prompt`, `image_training`, `deep_dive`, `podcast`, `video`, `read` (entspricht E-009/Phase-6-Plan).
- npm-Script `pipeline:persist`; in `run_weekly.ts` als **Stufe 6/6** integriert (läuft nach QA, immer als Draft).

### Live-Verifikation (end-to-end)
- `raw_articles`: 254 ✓ · `issues`: 1 (draft) ✓ · `issue_content`: 8 Segmente (5 paid; `podcast` fehlt, da null) ✓
- **RLS getestet:** Anon sieht 0 Issues (draft unsichtbar) und nur Free-Segmente (`intro`, `news`, `tool`) ✓
- Storage public GET: `header.png` → `200 image/png` ✓

### Technische Erkenntnisse
1. `tsx`/ESM: top-level `const` werden vor einem nachfolgenden `process.loadEnvFile`-Aufruf ausgewertet → loadEnvFile immer **vor** die env-`const`s stellen.
2. `issue_content.content` ist NOT NULL → Segmente mit null-Inhalt (Auto-Fix-Fälle) filtern, nicht einfügen.
3. `raw_articles.id` ist text-PK (hashId) → Upsert auf `onConflict: "id"` funktioniert direkt.
4. Wiederholtes Persistieren ist idempotent (Upserts + delete/insert + Storage-Upsert).

### Nächste Schritte
- Phase 6: Auth-UI (Login/Registrierung, Paywall-Gating auf Basis `isPaidUser`), Issue-Page rendert `issue_content` aus DB.
- `--publish`-Flag nutzbar für manuelle Freigabe nach QA.
- Cloudflare-API-Token rotieren (stand im Chat).



## Session 11 — 05.08.2026 — Phase 6 (Frontend + Auth + Paywall + Zahlung) umgesetzt

### Neue Dateien
| Datei | Zweck |
|---|---|
| `src/lib/db-types.ts` | Typisierte DB-Rows (`IssueRow`, `IssueContentRow`, `SubscriptionRow`, `ProfileRow`) |
| `src/lib/issues.ts` | Server-Helper: veröffentlichte Ausgaben, Issue per Datum, Content (RLS-gated), neuestes Datum |
| `src/lib/landing-copy.ts` | Landing-Texte (statisch, Englisch — ersetzt den gitignored Pipeline-Output) |
| `src/lib/actions.ts` | Server Actions: `signIn`, `signUp`, `signOut`, `updatePreferences` |
| `src/lib/lemonsqueezy.ts` | LS-API: `createCheckout` (Checkout-URL), `verifyWebhookSignature` (HMAC-SHA256), `lemonsqueezyConfigured` |
| `src/components/header.tsx` | Sticky-Nav mit Session-Abhängigkeit (Login/Register vs. Dashboard/Sign out) |
| `src/components/footer.tsx` | Footer (Link statt a) |
| `src/components/auth-form.tsx` | Shared Login/Register-Form (`useActionState`) |
| `src/components/preferences-form.tsx` | Einstellungen (Frequenz, Format, Themen-Chips) |
| `src/components/issue-segments.tsx` | Segment-Renderer (intro/news/tool/prompt/image_training/deep_dive/podcast/video/read) |
| `src/app/login/page.tsx`, `register/page.tsx` | Auth-Seiten (redirect bei Session) |
| `src/app/auth/callback/route.ts` | Code-Exchange (E-Mail-Bestätigung) → `/dashboard` |
| `src/app/dashboard/page.tsx` | Plan-Anzeige, Abos, Einstellungen, Archiv-Link, Upgrade |
| `src/app/issues/page.tsx` | Archiv-Liste (Paid-Only ab alter Ausgabe) |
| `src/app/issues/[date]/page.tsx` | Issue-Detail mit Free/Paid-Gating + `generateMetadata` |
| `src/app/api/checkout/route.ts` | GET → erstellt LS-Checkout, redirect zur Checkout-URL (501 ohne Keys) |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | Webhook: Signatur-Verify, Subscriptions-Sync (via auth-Schema, E-Mail→User-ID), Plan-Update |

### Paywall-Logik
- Free (`paid_only=false`): `intro`, `news`, `tool`. Paid: `prompt`, `image_training`, `deep_dive`, `podcast`, `video`, `read`.
- **Archiv-Regel:** Free-Nutzer lesen nur die **neueste** veröffentlichte Ausgabe (nur Free-Segmente, via RLS); ältere Ausgaben → Upgrade-Gate.
- `isPaidUser()` = `profiles.plan = paid` ODER aktive Subscription.

### Zahlung (env-gestützt, noch keine Keys)
- Checkout/Webhook laufen bereits, geben aber ohne `LEMONSQUEEZY_*`-Keys 501 bzw. 401 (Signatur-Fehler) zurück.
- Webhook mappt `customer_email` → `auth.users` (Service-Client mit `db.schema = "auth"`).

### Technische Erkenntnisse (Next 16 + supabase-js)
1. **Untypisierte Supabase-Clients:** `ReturnType<typeof createClient>` ergibt in supabase-js 2.x `never`-Rows bei `update()` → explizite Typen nötig (`createServiceClient(): SupabaseClient`, Daten als `as XRow[]`).
2. `useActionState` statt `useFormState` (React 19); Server Actions geben serialisierbare `ActionResult` zurück.
3. **Params sind Promises** in Next 15/16: `const { date } = await params`.
4. `next/image` für Supabase-Storage: `images.remotePatterns [{ hostname: "**.supabase.co" }]` in `next.config.ts`.
5. Build: alle Routen dynamisch (ƒ, Cookie-Nutzung), Proxy-Route korrekt erkannt.

### Smoke-Test (next start, Port 3100)
- `/` 200 · `/issues` 200 · `/login` 200 · `/register` 200 · `/dashboard` → 307 (Login) · `/issues/2026-08-05` → 404 (Draft, korrekt).
- `tsc`, `eslint`, `next build` grün.

### Nutzer-Schritte (Supabase Dashboard)
- **Auth → URL Configuration:** Site URL auf `http://localhost:3000` (lokal) bzw. Produktions-URL setzen; Redirect-URLs: `http://localhost:3000/auth/callback` + `/login`/`/dashboard`.
- LemonSqueezy: Store/Variant anlegen, `LEMONSQUEEZY_API_KEY`/`STORE_ID`/`VARIANT_ID`/`WEBHOOK_SECRET` in `.env`, Webhook-URL `…/api/webhooks/lemonsqueezy` eintragen.
- Migration 0002 optional (Email in `profiles` speichern, falls Webhook ohne auth-Schema-Zugriff laufen soll).



## Session 12 — 05.08.2026 — Phase 6 E2E-Test durch Nutzer bestanden

- `/auth/confirm/route.ts` ergänzt (token_hash-Flow für E-Mail-Bestätigung).
- **Nutzer hat Block A Schritt 1–5 selbst getestet und bestanden:** Dev-Server, Supabase-URL-Konfiguration (Site URL `http://localhost:3000`, Redirect `/auth/callback`), Ausgabe per `npm run pipeline:persist -- --publish` veröffentlicht, Registrierung + E-Mail-Bestätigung + Login, Free-Gating (nur aktuelle Ausgabe, nur intro/news/tool) verifiziert.
- Entscheidung (Nutzer): **Cloudflare-Token wird NICHT rotiert** (wird beibehalten trotz Chat-Exposition — bewusst in Kauf genommen).
- Entscheidung (Nutzer): **LemonSqueezy (Phase-6-Zahlung) auf später verschoben.**

### Nächste Schritte
- Phase 7: Resend-E-Mail-Versand (Subscriber-Liste = `newsletter_deliveries`/`profiles`, Versand der gerenderten `email_<Datum>.html`).
- Phase 8: Deployment (Vercel) + Wochen-Cron (z.B. Vercel Cron → `/api/cron/weekly`).



## Session 13 — 05.08.2026 — Phase 7 (E-Mail-Versand via Resend) umgesetzt

### Ziel
- Wöchentliche Zustellung der veröffentlichten Ausgabe per E-Mail (Resend, Free-Tier: 3.000/Monat).
- Abmeldung (Unsubscribe), Bounce-Handling, Willkommens-/Upgrade-Transaktionsmails, idempotenter Versand per Cron.

### Neue Dateien
| Datei | Zweck |
|---|---|
| `src/lib/email.ts` | Resend-Client (Singleton), `sendEmail` (wirft bei Fehler), `emailConfigured` (Keys vorhanden) |
| `src/lib/unsubscribe.ts` | HMAC-SHA256-`signUnsubscribeToken(userId)` / `verifyUnsubscribeToken`; Secret = `UNSUBSCRIBE_SECRET` ?? Service-Role-Key |
| `src/lib/email-render.ts` | `renderIssueEmail` — HTML-E-Mail aus `issue_content` (gem. `IssueRow`), Paid-Segmente mit `✨ PREMIUM`-Badge, Unsubscribe-Link unten |
| `src/lib/email-templates.ts` | `renderWelcomeEmail` (nach Registrierung) + `renderUpgradeEmail` (nach Abo-Aktivierung) |
| `src/lib/email-flows.ts` | Best-Effort-Helfer `sendWelcomeEmailIfConfigured`/`sendUpgradeEmailIfConfigured` (schweigen ohne Keys) |
| `src/app/api/send-weekly/route.ts` | POST + Bearer-`CRON_SECRET`; lädt neueste published Issue + Content, baut Empfängerliste (auth.users → profiles → email_preferences), versendet, schreibt `newsletter_deliveries` (pending→sent/failed), idempotent pro issue+profile |
| `src/app/api/unsubscribe/route.ts` | GET `?t=<Token>`; verifiziert HMAC-Token → `email_preferences.format = unsubscribed` → Bestätigungsseite |
| `src/app/api/webhooks/resend/route.ts` | Svix-signierter Resend-Webhook (`RESEND_WEBHOOK_SECRET`): bei `email.bounced` alle pending/sent-Deliveries des Empfängers → `bounced` |
| `src/lib/db-types.ts` | erweitert um `NewsletterDeliveryRow` |

### Verdrahtung
- `signUp` (bei bestehender Session) + `/auth/confirm` (nach E-Mail-Bestätigung) → Willkommens-Mail via `sendWelcomeEmailIfConfigured`.
- LemonSqueezy-Webhook bei `active`/`on_trial` → Upgrade-Mail via `sendUpgradeEmailIfConfigured`.

### Logik-Entscheidungen
- **Empfängerliste:** auth.users (echte E-Mail) ∩ profiles; Abbruch bei `email_preferences.format = unsubscribed`.
- **Paid-Empfänger:** `profiles.plan = paid` ODER aktive Subscription (`active`/`on_trial`) → bekommen alle Segmente, Free nur `intro`/`news`/`tool`.
- **`send-weekly` ohne `CRON_SECRET`/ohne Resend-Key → 501** (env-gestützt, wie Phase 6); ohne Bearer-Token → 401.
- **Unsubscribe ohne Token → 400**; manipuliertes Token → ungültig (HMAC).

### Technische Erkenntnisse
1. Resend-SDK (`emails.send`) kennt kein `reply_to`-Feld in den Typen → Option entfernt.
2. Unbenutzter Typ-Import in `email-render.ts` → eslint warning, entfernt.
3. Untypisierte Supabase-Client-Rows: `.map()` auf `any`-Daten gibt TS7006 → explizite `as`-Typen nach dem Select.
4. Svix-Webhook-Verifikation: Header `svix-id`/`svix-timestamp`/`svix-signature` + `RESEND_WEBHOOK_SECRET`; `svix`-Paket installiert (390 Pakete, 0 Vulns).

### Verifikation
- `tsc --noEmit` ✓ · `eslint .` ✓ · `next build` ✓ (neue Routen `send-weekly`, `unsubscribe`, `webhooks/resend` als ƒ).
- Smoke-Test (next start, Port 3101): `/api/send-weekly` → 501 (kein CRON_SECRET) ✓ · `/api/unsubscribe` ohne Token → 400 ✓ · `/api/webhooks/resend` → 501 (kein WEBHOOK_SECRET) ✓.
- Renderer gegen Live-Daten getestet: FULL = 8 Segmente, 14.774 Bytes HTML, enthält `PREMIUM` ✓; FREE = 3 Segmente, 7.320 Bytes, kein `PREMIUM` ✓; Unsubscribe-Token-Roundtrip ✓, manipuliertes Token → null ✓.

### `.env`-Neuaufnahmen (in `.env.example` dokumentiert)
- `RESEND_WEBHOOK_SECRET` (Svix-Signing-Secret, Resend → Webhooks)
- `CRON_SECRET` (schützt `/api/send-weekly`)
- `UNSUBSCRIBE_SECRET` (HMAC-Signatur der Unsubscribe-Links)
- `NEWSLETTER_FROM_EMAIL`-Hinweis: Test mit `onboarding@resend.dev`; für echten Versand eigene Domain verifizieren (SPF/DKIM).

### Nutzer-Schritte (Phase 7)
1. Resend-Konto anlegen → API-Key unter Settings → API Keys (`re_…`) in `.env` als `RESEND_API_KEY`.
2. **Domain verifizieren** (Resend → Domains → DNS: SPF/DKIM Einträge beim Provider setzen) für echte Absender; zum Testen `NEWSLETTER_FROM_EMAIL=onboarding@resend.dev` (sendet nur an die eigene E-Mail).
3. `CRON_SECRET` + `UNSUBSCRIBE_SECRET` mit langen Zufallsstrings belegen.
4. Webhook anlegen (Resend → Webhooks → URL `…/api/webhooks/resend`, Events: `email.bounced`, `email.delivered`) → Signing-Secret als `RESEND_WEBHOOK_SECRET`.
5. Smoke-Test: `POST /api/send-weekly` mit `Authorization: Bearer <CRON_SECRET>` → Test-Mail an eigene Adresse.
6. Danach Phase 8: Vercel-Cron (wöchentlich, nach Pipeline-Lauf) auf `/api/send-weekly`.



## Session 14 — 05.08.2026 — Phase 8 (Automatisierung des Weekly-Workflows) umgesetzt

### Ziel
- Der komplette Wochen-Workflow läuft automatisch: Pipeline (collect → score → generate → assets → qa → persist) → Veröffentlichung → E-Mail-Versand → Fehler-Notification.
- Manueller Trigger + Delivery-Statistiken (Öffnungen/Klicks).

### Architektur (zwei sich ergänzende Trigger)
1. **GitHub Actions (`Option B`, primärer Content-Workflow)** — `.github/workflows/weekly.yml`:
   - `schedule` Montag 04:45 UTC (vor dem Vercel-Cron-Send um 06:00 UTC) + `workflow_dispatch` für manuellen Trigger.
   - Steps: checkout → Node 22 → `npm ci` → `.env` aus Repository-Secrets erzeugen → `npm run pipeline:weekly -- --auto-fix --publish` → per `curl` den Versand anstoßen (`POST https://<NEWSLETTER_APP_URL>/api/send-weekly`, Bearer `CRON_SECRET`) → bei Fehler Admin-Mail via Resend-API.
   - `concurrency`-Gruppe verhindert parallele Läufe.
2. **Vercel Cron (`Option A`, Fallback-Sender)** — `vercel.json`: `crons: [{ path: "/api/send-weekly", schedule: "0 6 * * 1" }]` (Montag 06:00 UTC = 08:00 MEZ). Vercel sendet automatisch `Authorization: Bearer $CRON_SECRET`; Versand ist idempotent (`newsletter_deliveries`), Doppel-Send daher harmlos.

### Status-Tracking je Ausgabe (draft → qa → published)
- `pipeline/persist.ts`: Signatur `persist(status: "draft"|"qa"|"published")` statt boolean. `published_at` wird nur bei `published` gesetzt.
- CLI: `npm run pipeline:persist -- --publish` → published, `--qa` → qa, ohne Flag → draft.
- `run_weekly.ts`: neues `--publish`-Flag; Statuslogik = QA nicht bestanden → `draft`; bestanden ohne `--publish` → `qa`; bestanden + `--publish` → `published`.

### Fehler-Notification (Admin-Mail)
- `src/lib/email-flows.ts`: `notifyAdminOnErrorIfConfigured(message)` (Best-Effort an `ADMIN_EMAIL`).
- Aufgerufen in `run_weekly.ts` bei: unerwartetem Fehler (catch, inkl. Stack) und QA-Nichtbestehen (bleibt draft, Exit 1).
- Zusätzlich resendet der Actions-Workflow eine Fehler-Mail (mit Run-Link), falls die Pipeline abgebrochen ist.

### Delivery-Statistiken (Öffnungen/Klicks)
- Migration `supabase/migrations/0002_email_stats.sql`: Status-Check von `newsletter_deliveries` um **`delivered`** erweitert (`opened_at`/`clicked_at` existierten schon seit 0001).
- Resend-Webhook (`/api/webhooks/resend`) verarbeitet jetzt: `email.delivered` → `status=delivered`, `email.opened` → `opened_at`, `email.clicked` → `clicked_at`, `email.bounced` → `bounced` (bisher nur bounced).
- Auswertungs-SQL (Beispiel) ist in der Migration kommentiert; Dashboard/UI folgt optional in Phase 9/10.

### Weitere Änderungen
- `.env.example`: Abschnitt „GitHub Actions" — die gleichen Keys als Repository-Secrets hinterlegen (Liste im Kommentar).
- GitHub-Secrets nötig: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `NEWSAPI_KEY`, `GOOGLE_FACTCHECK_API_KEY`, `RESEND_API_KEY`, `NEWSLETTER_FROM_EMAIL`, `ADMIN_EMAIL`, `CRON_SECRET`, `NEWSLETTER_APP_URL` (https://<app>.vercel.app).

### Verifikation
- `tsc --noEmit` ✓ · `eslint .` ✓ · `next build` ✓ (Routen unverändert; vercel.json wird erst von Vercel selbst geprüft).

### Nutzer-Schritte (Phase 8, Deployment)
1. Repo nach GitHub pushen (privates Repo empfohlen): `git remote add origin …` + `git push -u origin main`.
2. GitHub → Settings → Secrets and variables → Actions: obige Secrets anlegen.
3. Vercel: GitHub-Repo importieren → Framework Next.js, Build `next build`. Env-Variablen in Vercel-Project-Settings setzen (gleiche wie lokal, `NEXT_PUBLIC_SITE_URL` = Produktions-URL). Cron wird über `vercel.json` automatisch aktiv (Hobby: min. täglich → wöchentlich ok).
4. Supabase Auth → URL Configuration: Produktions-Site-URL + Redirect-URLs (`https://<app>.vercel.app/auth/callback` usw.) ergänzen.
5. `RESEND_WEBHOOK_SECRET` + Webhook-Events `email.bounced`/`email.delivered`/`email.opened`/`email.clicked` auf `https://<app>.vercel.app/api/webhooks/resend`.
6. Test: `workflow_dispatch` im GitHub-UI auslösen oder `npm run pipeline:weekly -- --publish` lokal → danach `POST /api/send-weekly` mit Bearer `CRON_SECRET`.



## Session 15 — 05.08.2026 — Live-Deployment + erster E-Mail-Versand (Phase 7/8 verifiziert)

### Was gemacht wurde (gemeinsam mit dem Nutzer)
1. **GitHub:** Privates Repo `NurmagomedovMaikl/ai-newsletter` angelegt, `git remote origin` gesetzt, `main` gepusht (Remote: `https://github.com/NurmagomedovMaikl/ai-newsletter.git`).
2. **Vercel:** Repo importiert → Deployment live unter **`https://ai-newsletter-sage.vercel.app`** (Production-Domain; Preview-Domains `ai-newsletter-git-main-blinchik.vercel.app`, `ai-newsletter-gf0cxsur9-blinchik.vercel.app`). PC-Neustart braucht KEIN Redeploy (läuft auf Vercel-Servern).
3. **Vercel Environment Variables** (Production + Preview, „Sensitive" = an): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://ai-newsletter-sage.vercel.app`, `CRON_SECRET`, `UNSUBSCRIBE_SECRET`; später ergänzt: `RESEND_API_KEY`, `NEWSLETTER_FROM_EMAIL=onboarding@resend.dev`, `ADMIN_EMAIL=maikdrum1@gmail.com`, `RESEND_WEBHOOK_SECRET`.
4. **Supabase:** Auth → URL Configuration: Site URL + Redirect-URLs auf die Produktions-Domain umgestellt (localhost bleibt zusätzlich). Migration `0002_email_stats.sql` im SQL Editor ausgeführt („Success").
5. **GitHub Secrets** (Settings → Secrets → Actions): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CRON_SECRET`, `NEWSLETTER_APP_URL=https://ai-newsletter-sage.vercel.app` (optional für später: `NEWSAPI_KEY`, `GOOGLE_FACTCHECK_API_KEY`, `RESEND_API_KEY`, `NEWSLETTER_FROM_EMAIL`, `ADMIN_EMAIL`).
6. **Resend:** Konto angelegt (E-Mail `maikdrum1@gmail.com`), API-Key `re_cyQX…` erstellt, Webhook `https://ai-newsletter-sage.vercel.app/api/webhooks/resend` mit Events `email.bounced`/`delivered`/`opened`/`clicked`, Signing-Secret `whsec_…` → `.env` + Vercel.

### Bug gefunden + behoben (Commit `4864bd1`)
- **Symptom:** `/api/send-weekly` lieferte `recipients: 0`, obwohl 2 bestätigte Nutzer existierten.
- **Ursache:** `createClient(url, key, { db: { schema: "auth" } }).from("users")` → PostgREST-Fehler **„Invalid schema: auth"** (die Schema-Abfrage funktioniert in diesem Supabase-Projekt nicht). Der Fehler wurde still geschluckt → leere Empfängerliste.
- **Fix:** Auf die **Auth-Admin-API** umgestellt: `client.auth.admin.listUsers({ perPage: 1000, page: 1 })`. Betroffen und gefixt: `send-weekly/route.ts`, `webhooks/resend/route.ts`, `webhooks/lemonsqueezy/route.ts` (dort plus Duplikat-Kommentar entfernt). WICHTIG: Der frühere `db.schema = "auth"`-Ansatz war bislang **nie live** verifiziert (LemonSqueezy-Webhook wurde nie ausgelöst).
- Empfängerfilter: nur Nutzer mit `email` **und** `email_confirmed_at` (kein Versand an Unbestätigte).

### Erster Test-Versand (live)
- `POST /api/send-weekly` (Bearer `CRON_SECRET`): `recipients: 2`, **`sent: 1`** (`maikdrum1@gmail.com`), `failed: 1` (`harob90245@bora4d.com` — Test-Regel `onboarding@resend.dev` erlaubt nur die eigene Adresse).
- Nutzer bestätigte Empfang der Test-Ausgabe (Issue 2026-08-05).

### Erkenntnisse / offene Punkte
- **Test-Absender `onboarding@resend.dev` sendet NUR an die eigene Adresse** — für echte Abonnenten eigene Domain in Resend verifizieren (SPF/DKIM) + `NEWSLETTER_FROM_EMAIL` auf `no-reply@<domain>` umstellen.
- Offen: Unsubscribe-Link-Endtest durch Nutzer; Webhook-Statistik (`delivered`/`opened`/`clicked`) anhand der Test-Mail prüfen; optionale GitHub-Secrets nachtragen.
- Lokale `.env` enthält jetzt echte Keys (Resend, CRON/UNSUBSCRIBE-Secrets, ADMIN_EMAIL); bleibt gitignored.



## Session 16 — 07.08.2026 — Passwort-Reset-UI + PKCE-Bugfix (Recovery-Link)

### Neue Dateien / Änderungen
| Datei | Änderung |
|---|---|
| `src/app/auth/reset-password/page.tsx` | Neu: Reset-Seite mit 3 Schritten `checking` → `request` (E-Mail anfordern) / `reset` (neues Passwort) |
| `src/lib/actions.ts` | + `requestPasswordReset` (Server Action, ruft `auth.resetPasswordForEmail` mit `redirectTo` auf) und + `updatePassword` (nur mit gültiger Session, `updateUser({ password })`) |
| `src/components/auth-form.tsx` | + Link „Forgot password?" im Login-Formular → `/auth/reset-password` |
| `src/app/auth/confirm/route.ts` | + `code`-Handling (PKCE) — **der eigentliche Bugfix**, siehe unten |
| `src/app/auth/confirm/route.ts` (Folgeänderung) | Welcome-Mail nur noch bei `type === "signup"` (nicht bei recovery) |

### Warum der Recovery-Link auf die Login-Seite führte (Bug, Commit `2df460d`)
- **Symptom:** Klick auf den Link aus der Supabase-Reset-Mail → Nutzer landete auf `/login` statt auf der „neues Passwort"-Seite.
- **Ursache (Root Cause):** Der Recovery-Link nutzt den **PKCE-Flow**. Link-Format (vom Nutzer bereitgestellt):
  `https://<ref>.supabase.co/auth/v1/verify?token=pkce_<hash>&type=recovery&redirect_to=https://ai-newsletter-sage.vercel.app/auth/confirm?next=/auth/reset-password`
  → Supabase verifiziert den OTP-Token und leitet den Browser dann zum `redirect_to` mit einem **`code`-Parameter** (Authorization-Code) weiter.
  → `/auth/confirm` kannte aber nur den **`token_hash`-Flow**; ohne `token_hash` fiel die Route auf `login?error=confirm` zurück. (Das Signup funktionierte, weil dessen Ziel `/auth/callback` ist, das `code` per `exchangeCodeForSession` bereits tauscht.)
- **Fix:** `/auth/confirm` behandelt jetzt beide Flows:
  1. `?code=…` → `supabase.auth.exchangeCodeForSession(code)` (gleicher Weg wie `/auth/callback`) → Redirect zu `next`.
  2. `?token_hash=…&type=…` → `verifyOtp` (wie bisher, für Nicht-PKCE-Projekte).
  Session-Cookies werden im Server-Route gesetzt; die Reset-Seite erkennt die Session per `getUser()` und zeigt den Reset-Schritt.
- **Erkenntnis:** Dieses Supabase-Projekt hat **PKCE für E-Mail-Links aktiv** (`pkce_…`-Tokens). Alle E-Mail-Verify-Links (Signup, Recovery) laufen über den `/verify`-Endpunkt mit `code`-Redirect — nur `/auth/callback` (Signup) hatte das bisher korrekt behandelt.

### Verifikation
- `tsc --noEmit` ✓ · `eslint` (confirm-Route) ✓ · `next build` ✓ (alle 15 Routen + Proxy, Build-Exit 0).
- Commit `2df460d` gepusht → Vercel deployt automatisch.

### Ergebnis Nutzer-Retest
- **07.08.2026: Passwort-Reset live bestanden.** Nutzer: Reset-Link → neues Passwort setzen → Login mit neuem Passwort funktioniert („passt").

### Nächste Schritte (Launch-Todo-Liste)
- Zahlung live (LemonSqueezy-Store-Keys) → Legal (Texte/Anbieter vom Nutzer) → Abo-Verwaltung → Review-Schritt → Monitoring → Phase-9-Tests → E2E/Launch.



## Session 17 — 07.08.2026 — Legal-Seiten (Impressum, Datenschutz, AGB, Disclaimer)

### Ausgangslage
- Nutzer wählte aus der Launch-Todo-Liste den Punkt **Legal**.
- Entscheidung im Chat: Legal-Seiten-Code zuerst bauen (Platzhalter), Anbieterdaten vom Nutzer danach nachtragen.

### Neue Dateien / Änderungen
| Datei | Änderung |
|---|---|
| `src/components/legal-layout.tsx` | Neu: Wiederverwendbares Seiten-Skelett (Titel, „Stand", Breadcrumb-Link) + Typografie-Styles für `h2`/`h3`/`p`/`ul`/`ol`/`a` per Tailwind-Arbitrary-Varianten (kein Markdown-Paket nötig) |
| `src/app/legal/imprint/page.tsx` | Neu: Impressum (Angaben gem. § 5 DDG, Kontakt, Verantwortlicher nach § 18 Abs. 2 MStV, EU-Streitschlichtung, Haftung für Inhalte/Links, Urheberrecht) |
| `src/app/legal/privacy/page.tsx` | Neu: Datenschutzerklärung (DSGVO): Verantwortlicher, Verarbeitungen, Resend (Versand + Zählpixel-Tracking), LemonSqueezy (Zahlung, Merchant of Record), Vercel/Supabase (Hosting), Speicherdauer, Betroffenenrechte Art. 15–21, SSL/TLS |
| `src/app/legal/terms/page.tsx` | Neu: AGB (Geltungsbereich, Vertragsgegenstand, Zustandekommen, Preise/Zahlung, Laufzeit/Kündigung, Widerrufsrecht inkl. § 356 BGB für digitale Inhalte, Haftung, Änderungen, Rechtswahl/Gerichtsstand, Streitschlichtung) |
| `src/app/legal/disclaimer/page.tsx` | Neu: Disclaimer (KI-generierte Inhalte ohne Gewähr, externe Links, Empfehlungen, Haftungsausschluss) |
| `src/components/footer.tsx` | + zweite Zeile mit Links zu allen vier Legal-Seiten (Impressum/Datenschutz/AGB/Disclaimer) |

### Entscheidungen
- **Sprache:** Legal-Seiten auf **Deutsch** (Impressums-/DSGVO-Pflicht für in Deutschland ansässigen Betreiber), Website-Sprache bleibt Englisch (E-010).
- **Platzhalter-Ansatz:** Anbieterdaten als markierte `[PLATZHALTER]`; nach Rückmeldung des Nutzers ersetzt.
- **Keine neue Dependencies** (react-markdown o. ä.) — Typografie via Tailwind-Arbitrary-Varianten im Wrapper.

### Daten des Anbieters (vom Nutzer geliefert, Commit `5484b2e`)
- Maik Löwen · Hahnenfeldstr. 12b · 32427 Minden · maikdrum1@gmail.com
- Website-URL in AGB: `https://ai-newsletter-sage.vercel.app` (Nutzer-Frage „Website Url?" → aktuell Vercel-Domain; bei eigener Domain später austauschen)
- Telefon: keine Angabe → Zeile im Impressum entfernt. Gerichtsstand AGB: Minden.

### Verifikation
- `tsc --noEmit` ✓ · `eslint` ✓ · `next build` ✓ (4 neue ƒ-Routen `/legal/{imprint,privacy,terms,disclaimer}`).
- Commits: `ea31806` (Seiten + Footer), `5484b2e` (Anbieterdaten).

### Offen / Hinweise
- **Hinweis an Nutzer:** Texte sind seriöse Standard-Templates, aber kein Rechtsrat — bei Bedarf (v. a. vor echtem Verkauf/Paid) juristisch prüfen lassen.
- Optional: Eigene Domain später → Website-URL + Absender/Impressum anpassen.
- Nächster Schritt laut Launch-Todo-Liste: Zahlung live (LemonSqueezy-Keys) oder Abo-Verwaltung im Dashboard.



## Session 18 — 07.08.2026 — Abo-Verwaltung im Dashboard (LemonSqueezy Customer Portal)

### Ausgangslage
- Nutzer wählte „Abo-Verwaltung im Dashboard". LemonSqueezy-Identitätsprüfung läuft noch → Zahlung live aufgeschoben.
- **Recherche:** LS Customer Portal = `https://[store].lemonsqueezy.com/billing`; **signed Portal-URL** liefert die LS-API pro Subscription/Kunde (`attributes.urls.customer_portal`, 24 h gültig, auto-login) → bevorzugter Weg für „Manage"-Links.

### Neue Dateien / Änderungen
| Datei | Änderung |
|---|---|
| `src/lib/lemonsqueezy.ts` | + `getCustomerPortalUrl(subscriptionId)` (GET `/v1/subscriptions/{id}` → signed Portal-URL, null ohne Key/Fehler, `cache: no-store`) und + `storeBillingUrl()` (Fallback `LEMONSQUEEZY_STORE_URL`/billing) |
| `src/app/api/portal/route.ts` | Neu: GET, Auth-Pflicht; prüft per RLS, dass die Subscription dem User gehört (`profile_id` + `lemonsqueezy_subscription_id`); Redirect auf signed URL → sonst Fallback-Store-Portal → sonst 501 |
| `src/app/dashboard/page.tsx` | Überarbeitete Abo-Sektion: **alle** Subscriptions (aktiv + Historie) mit Status-Badges (Active/Trial/Cancelled/Expired/Paused), Verlängerungs-/Enddatum, „Manage"-Link (aktiv) bzw. „View billing" (inaktiv) → `/api/portal`; Hinweis „no subscription yet" + Upgrade-CTA; Unsubscribe-Banner |
| `src/components/preferences-form.tsx` | Format-Select + Option „Unsubscribed (no emails)" → manuelles Ab-/Wieder-Anmelden ohne E-Mail-Link |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | + `ends_at` in Attributen; speichert `ends_at` bei Upsert und im Cancel/Expired/Paused-Zweig |
| `supabase/migrations/0003_subscription_ends_at.sql` | Neu: `subscriptions.ends_at text` (muss im SQL Editor ausgeführt werden) |
| `.env.example` | + `LEMONSQUEEZY_STORE_URL` (Fallback-Portal-URL ohne API-Key) |

### Sicherheits-Entscheidung
- `/api/portal` öffnet **nur** das Portal einer Subscription, die der angemeldete User besitzt (RLS-Check auf `profile_id`). Kein Zugriff auf fremde Abos.

### Verifikation
- `tsc --noEmit` ✓ · `eslint` ✓ · `next build` ✓ (neue Route `/api/portal` als ƒ, 21 Seiten).
- Commit `c9523cb` gepusht → Vercel deployt automatisch.

### Nutzer-Schritte
1. Migration `0003_subscription_ends_at.sql` im Supabase SQL Editor ausführen.
2. Nach LemonSqueezy-Aktivierung: `LEMONSQUEEZY_API_KEY`/`STORE_ID`/`VARIANT_ID`/`WEBHOOK_SECRET` (+ optional `LEMONSQUEEZY_STORE_URL=https://ai-newsletter.lemonsqueezy.com`) in `.env` + Vercel → dann sind Checkout und Portal-Links voll aktiv.
3. Danach: Review-Schritt → Monitoring → Phase-9-Tests → E2E/Launch.



## Session 19 — 07.08.2026 — LemonSqueezy-Integration live geschaltet (Test-Modus)

### Ausgangslage
- LemonSqueezy-Identitätsprüfung durch; Nutzer wollte mit Zahlung weitermachen. Store existiert (#446927, „AI Newsletter", `ai-newsletter.lemonsqueezy.com`, Land DE, Währung EUR, Produkt in **Test-Modus**).

### Erkenntnis: LS-API-Key-Format 2026
- Der generierte API-Key ist **kein** `ls_…`/`el_test_…`-String mehr, sondern ein **JWT** (RS256, `sub` = LS-User-ID). Vor Verwendung direkt gegen `GET /v1/stores` validiert (HTTP 200).

### Über die API ermittelt / eingerichtet (per curl, Temp-Dateien in %TEMP%\opencode)
- **Store-ID:** `446927` · Produkt „AI Newsletter" **`1272872`** (€5.00/Monat, published, test_mode)
- **Variante „Monthly":** `1990193` (Subscription, monatlich, published, test_mode) → `LEMONSQUEEZY_VARIANT_ID`. (Zweite Variante „Default" `1990197`, status `pending`, wird ignoriert.)
- **Webhook** `124833` angelegt: URL `https://ai-newsletter-sage.vercel.app/api/webhooks/lemonsqueezy`, Events `subscription_created/updated/cancelled/resumed/expired/paused`, Secret (max. 40 Zeichen!) `01cc80f1-…`.
  - **Lehrstück:** LS lehnt `secret > 40` Zeichen ab (422) und meldet „Syntax error / Invalid JSON", wenn der Body in PowerShell direkt als `-d` übergeben wird → **Body in Datei schreiben und `-d @datei` verwenden**.
- **Checkout-Test:** `POST /v1/checkouts` für Store 446927 + Variante 1990193 → Checkout-URL erzeugt (`test_mode: true`), `custom.user_id` und `redirect_url` korrekt übernommen.

### Preisanpassung
- Diskrepanz gefunden: Landing-Page zeigte `$9.99/month`, LS-Produkt war `€5.00/month`. **Nutzer-Entscheidung: €5.00/Monat.**
- `src/lib/landing-copy.ts`: `pricing.paid.price` → `€5.00/month` (Commit `103e90f`).

### Konfiguration (lokal)
- `.env` (gitignored) befüllt: `LEMONSQUEEZY_API_KEY` (JWT), `LEMONSQUEEZY_WEBHOOK_SECRET`, `LEMONSQUEEZY_PRODUCT_ID=1272872`, `LEMONSQUEEZY_VARIANT_ID=1990193`, `LEMONSQUEEZY_STORE_ID=446927`, `LEMONSQUEEZY_STORE_URL=https://ai-newsletter.lemonsqueezy.com`.
- Vercel-CLI nicht installiert → **Env-Vars muss der Nutzer im Vercel-Dashboard ergänzen** (Production + Preview): die obigen 6 Werte.

### Verifikation
- `tsc --noEmit` ✓ · `eslint` ✓ · Commit `103e90f` gepusht.

### Offen / Nächste Schritte
1. **Nutzer:** Vercel-Env-Vars (6× LEMONSQUEEZY_*) in Project Settings ergänzen → dann ist `/api/checkout` live funktionsfähig.
2. **Nutzer:** Migration `0003_subscription_ends_at.sql` im Supabase SQL Editor ausführen (falls noch nicht).
3. End-to-End-Test: Login → Upgrade → Test-Checkout (LS Test-Card) → Webhook → `profiles.plan=paid` → Paid-Segmente im Archiv prüfen.
4. Nach Store-Aktivierung (Identitätsprüfung) später: Live-Key statt Test-Key in `.env` + Vercel.
5. Hinweis: LS-Produktbeschreibung ggf. um den €5-Preis bereinigen (falls die Chat-Beschreibung mit $9.99 übernommen wurde).


