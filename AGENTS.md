<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Projektregeln — AI Newsletter

## Ausführung (Windows/PowerShell)
- `npm`/`npx` nicht direkt, sondern als `npm.cmd`/`npx.cmd` mit vorher gesetztem fnm-PATH:
  `$env:Path = "C:\Users\x\AppData\Roaming\fnm\node-versions\v22.13.1\installation;" + $env:Path`
- Nach Pipeline-Ausführung `process.exit(0)` (verhindert undici-Hang).
- TypeScript-Check separat: `npx.cmd tsc --noEmit`.

## Content-Pipeline (nach jeder Änderung an Pipeline-Code: tsc + lint)
- `npm.cmd run pipeline:collect` / `:score` / `:generate` / `:assets` / `:qa` / `:weekly`
- Weekly: `npm.cmd run pipeline:weekly -- --from=<stufe> --auto-fix`

## Dokumentation
- Entscheidungen und Session-Ergebnisse IMMER in `docs/DOKUMENTATION.md` protokollieren (chronologisch, neueste unten, Entscheidungen als E-00x).
- Fortschritt in `docs/PROJEKT_PLAN.md` mit Checkboxen aktualisieren.

## Git
- **Commit-Cadence: nach jeder abgeschlossenen Arbeitseinheit/Session committen** (kleine, in sich abgeschlossene Commits).
- `core.autocrlf` ist auf `false` gesetzt — beibehalten.
- `.env` und `pipeline/output/` sind gitignored — niemals committen.
- Commit-Nachricht: kurz, präzise, passend zum Repo-Stil.
