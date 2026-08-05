import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { collect } from "./collect";
import { score } from "./score";
import { generate } from "./generate_content";
import { generateAssets } from "./generate_assets";
import { runQa } from "./qa";
import { renderEmail } from "./renderEmail";
import { persist } from "./persist";
import type { NewsletterDraft, QaReport } from "@/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");

type Stage = "collect" | "score" | "generate" | "assets" | "qa" | "persist";
const STAGE_ORDER: Stage[] = ["collect", "score", "generate", "assets", "qa", "persist"];

function startFrom(): number {
  const arg = process.argv.find((a) => a.startsWith("--from="));
  if (!arg) return 0;
  const stage = arg.slice("--from=".length) as Stage;
  const index = STAGE_ORDER.indexOf(stage);
  if (index === -1) {
    console.error(`Unbekannte Stufe: ${stage} (erlaubt: ${STAGE_ORDER.join(", ")})`);
    process.exit(1);
  }
  return index;
}

const REC_SECTION_TO_KEY: Record<string, keyof NewsletterDraft> = {
  tool: "toolOfTheWeek",
  podcast: "podcastOfTheWeek",
  video: "videoOfTheWeek",
  read: "readOfTheWeek",
};

/** Entfernt Empfehlungen mit kaputten Links (QA-Fehler in optionalen Sektionen)
 *  aus dem Draft und rendert die E-Mail neu. */
async function autoFixBrokenRecommendations(): Promise<boolean> {
  const draft = findLatestDraft();
  const report = JSON.parse(
    readFileSync(join(OUTPUT_DIR, `qa_report_${draft.issueDate}.json`), "utf8"),
  ) as QaReport;

  const broken = report.issues.filter(
    (i) => i.severity === "error" && i.url && i.section in REC_SECTION_TO_KEY,
  );
  if (broken.length === 0) return false;

  let changed = false;
  for (const issue of broken) {
    const key = REC_SECTION_TO_KEY[issue.section];
    const rec = draft[key];
    if (rec && typeof rec === "object" && (rec as { url?: string }).url === issue.url) {
      (draft[key] as unknown) = null;
      console.log(`[WEEKLY] Auto-Fix: "${issue.section}" entfernt (Link ${issue.url} ist tot).`);
      changed = true;
    }
  }
  if (!changed) return false;

  writeFileSync(
    join(OUTPUT_DIR, `newsletter_draft_${draft.issueDate}.json`),
    JSON.stringify(draft, null, 2),
    "utf8",
  );
  writeFileSync(
    join(OUTPUT_DIR, `email_${draft.issueDate}.html`),
    renderEmail(draft, `assets/header_${draft.issueDate}.png`),
    "utf8",
  );
  return true;
}

function findLatestDraft(): NewsletterDraft {
  const files = readdirSync(OUTPUT_DIR)
    .filter((f) => f.startsWith("newsletter_draft_") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) throw new Error("Kein newsletter_draft gefunden.");
  return JSON.parse(readFileSync(join(OUTPUT_DIR, files.at(-1)!), "utf8")) as NewsletterDraft;
}

async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  console.log(`\n===== ${name} =====`);
  const value = await fn();
  console.log(`----- ${name} fertig (${((Date.now() - start) / 1000).toFixed(1)}s) -----`);
  return value;
}

export async function runWeekly(): Promise<QaReport> {
  if (typeof process.loadEnvFile === "function" && existsSync(join(process.cwd(), ".env"))) {
    process.loadEnvFile(join(process.cwd(), ".env"));
  }

  const autoFix = process.argv.includes("--auto-fix");
  const from = startFrom();
  const timings: Record<string, number> = {};
  const t0 = Date.now();

  if (from <= 0) await step("Stufe 1/6: Recherche", async () => { timings.collect = Date.now(); await collect(); });
  if (from <= 1) await step("Stufe 2/6: Scoring", async () => { timings.score = Date.now(); await score(); });
  if (from <= 2) await step("Stufe 3/6: Inhalte generieren", async () => { timings.generate = Date.now(); await generate(); });
  if (from <= 3) await step("Stufe 4/6: Assets (Bilder, Landing, E-Mail)", async () => { timings.assets = Date.now(); await generateAssets(); });

  let report = await step("Stufe 5/6: QA + Fake-News-Check", () => runQa());
  timings.qa = Date.now();

  if (autoFix && !report.passed) {
    const fixed = await autoFixBrokenRecommendations();
    if (fixed) {
      console.log("\n[WEEKLY] Auto-Fix angewendet — QA erneut ausführen ...");
      report = await runQa();
      timings.qa = Date.now();
    }
  }

  if (from <= 5) await step("Stufe 6/6: Persistenz (Supabase)", async () => { timings.persist = Date.now(); await persist(false); });

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);

  const summary = {
    ranAt: new Date().toISOString(),
    stages: timings,
    qa: { passed: report.passed, errorCount: report.errorCount, warningCount: report.warningCount },
    durationSec: Number(durationSec),
  };
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, `run_weekly_${report.issueDate}.json`), JSON.stringify(summary, null, 2), "utf8");

  if (!report.passed) {
    console.error(
      `\n[WEEKLY] QA FAILED: ${report.errorCount} Fehler, ${report.warningCount} Warnungen — Ausgabe wird NICHT veröffentlicht.`,
    );
  } else {
    console.log(`\n[WEEKLY] ALLE STUFEN OK in ${durationSec}s — Ausgabe ${report.issueDate} bereit.`);
  }
  return report;
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  runWeekly()
    .then((report) => {
      if (report.passed || process.env.QA_IGNORE_ERRORS === "1") process.exit(0);
      process.exit(1);
    })
    .catch((err) => {
      console.error(`\n[WEEKLY] FEHLER: ${err.message}`);
      process.exit(1);
    });
}
