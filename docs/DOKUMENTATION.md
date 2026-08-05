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




