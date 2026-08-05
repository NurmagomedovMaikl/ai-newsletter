import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { NewsletterDraft, QaIssue, QaReport } from "@/lib/types";
import { extractJson, generateChat, type LlmMessage } from "@/lib/llm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");

const LINK_CONCURRENCY = 5;
const LINK_TIMEOUT_MS = 12_000;
const FETCH_ARTICLE_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function findLatestDraft(): NewsletterDraft {
  const files = readdirSync(OUTPUT_DIR)
    .filter((f) => f.startsWith("newsletter_draft_") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) throw new Error("Kein newsletter_draft gefunden. Erst npm run pipeline:generate ausführen.");
  return JSON.parse(readFileSync(join(OUTPUT_DIR, files.at(-1)!), "utf8")) as NewsletterDraft;
}

// ---------------------------------------------------------------- Links

interface LinkedItem {
  url: string;
  section: string;
  label: string;
}

function collectUrls(draft: NewsletterDraft): LinkedItem[] {
  const items: LinkedItem[] = [];
  draft.newsSnippets.forEach((s) => items.push({ url: s.url, section: "news", label: s.title }));
  const recs: { key: keyof NewsletterDraft; section: string }[] = [
    { key: "toolOfTheWeek", section: "tool" },
    { key: "podcastOfTheWeek", section: "podcast" },
    { key: "videoOfTheWeek", section: "video" },
    { key: "readOfTheWeek", section: "read" },
  ];
  for (const { key, section } of recs) {
    const rec = draft[key];
    if (rec && typeof rec === "object" && "url" in (rec as object) && (rec as { url?: string }).url) {
      items.push({ url: (rec as { url: string }).url, section, label: (rec as { title: string }).title });
    }
  }
  return items;
}

async function validateLink(item: LinkedItem): Promise<QaIssue | null> {
  const probe = async (method: "HEAD" | "GET"): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LINK_TIMEOUT_MS);
    try {
      return await fetch(item.url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT },
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let res = await probe("HEAD");
    if (res.status === 405 || res.status === 403 || res.status === 501) res = await probe("GET");
    if (res.status >= 400) {
      const severity: QaIssue["severity"] =
        res.status === 404 || res.status === 410 ? "error" : "warning";
      return { severity, section: item.section, message: `HTTP ${res.status}`, url: item.url };
    }
    return null;
  } catch {
    return { severity: "warning", section: item.section, message: "Nicht prüfbar (Timeout/Netz)", url: item.url };
  }
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ---------------------------------------------------------- Content-QA

async function contentQa(draft: NewsletterDraft): Promise<{ issues: QaIssue[]; llmUsed: string[] }> {
  const messages: LlmMessage[] = [
    {
      role: "system",
      content:
        `You are a senior newsletter QA editor. Check the newsletter draft (JSON) for:
1. All required sections present with correct structure (newsSnippets array, tool/prompt/imageTraining/deepDive, extras)
2. Premium, professional English tone — no marketing fluff, no sloppy grammar
3. No duplicate or near-duplicate content across sections
4. No hallucination risk or factual overreach in claims (be strict, this goes out publicly)
5. Length limits: intro max 2 sentences, each news summary max 2 sentences, "why" max 40 words
6. No empty strings, placeholders ("lorem", "TBD", "[insert]") or overly vague filler
NOTE: Square-bracket placeholders in "prompt", "promptTemplate" and "examplePrompt" are INTENTIONAL and outside your scope.
NOTE: deepDive with 5-8 steps and 3-5 takeaways is INTENTIONAL — never flag the deepDive section for being lengthy or detailed if it stays within that spec.
ERROR vs WARNING: "error" is reserved for must-fix problems only: missing/empty fields, broken structure, factual risk or hallucination, broken grammar. Anything that is a style, wording or readability improvement must be a "warning", never an "error".
Respond with VALID JSON only:
{"issues":[{"severity":"error"|"warning","section":"<section name>","message":"<concrete issue>"}]}
Empty issues array = all good. "error" = must-fix before sending, "warning" = should improve.`,
    },
    { role: "user", content: JSON.stringify(draft).slice(0, 60_000) },
  ];
  const res = await generateChat(messages, { maxTokens: 2500, temperature: 0.2, jsonMode: true });
  const value = extractJson<{ issues?: QaIssue[] }>(res.content);
  console.log(`[QA] Content-Check ok (${res.provider}/${res.model})`);
  return { issues: value.issues ?? [], llmUsed: [`${res.provider}:${res.model}`] };
}

/** Deterministische Prüfungen (unabhängig vom LLM): konkrete Regeln,
 *  die ein LLM-QA erfahrungsgemäß unzuverlässig bewertet. */
function deterministicChecks(draft: NewsletterDraft): QaIssue[] {
  const issues: QaIssue[] = [];
  const example = draft.imagePromptTraining?.examplePrompt ?? "";
  if (!example.trim() || /\[[^\]]*\]/.test(example)) {
    issues.push({
      severity: "error",
      section: "imagePromptTraining",
      message: "examplePrompt muss ein konkretes, vollständiges Beispiel ohne [PLATZHALTER] sein.",
    });
  }
  return issues;
}

// ------------------------------------------------- Claims vs. Quelle

async function fetchArticleText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_ARTICLE_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "User-Agent": USER_AGENT } });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return null;
    const html = await res.text();
    const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "").trim();
    const desc = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? "").trim();
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);
    const combined = [title, desc, body].filter(Boolean).join(" ").trim();
    return combined.length > 50 ? combined : null;
  } catch {
    return null;
  }
}

async function claimsCheck(draft: NewsletterDraft): Promise<{ issues: QaIssue[]; llmUsed: string[] }> {
  const issues: QaIssue[] = [];
  const llmUsed: string[] = [];
  for (const snippet of draft.newsSnippets) {
    const articleText = await fetchArticleText(snippet.url);
    if (!articleText) {
      issues.push({
        severity: "warning",
        section: "claims",
        message: `Quelle nicht abrufbar, Claim ungeprüft: "${snippet.title}"`,
        url: snippet.url,
      });
      continue;
    }
    const messages: LlmMessage[] = [
      {
        role: "system",
        content:
          `You verify whether a newsletter claim is supported by its source article.
Judge the claim against the article text only. Respond with VALID JSON only:
{"status":"supported"|"contradicted"|"unclear","note":"<max 30 words>"}`,
      },
      {
        role: "user",
        content: `CLAIM: ${snippet.title}\nSUMMARY: ${snippet.summary}\n\nSOURCE ARTICLE TEXT:\n${articleText.slice(0, 3000)}`,
      },
    ];
    const res = await generateChat(messages, { maxTokens: 800, temperature: 0, jsonMode: true });
    llmUsed.push(`${res.provider}:${res.model}`);
    const value = extractJson<{ status?: string; note?: string }>(res.content);
    if (value.status === "contradicted") {
      issues.push({
        severity: "error",
        section: "claims",
        message: `Claim widerspricht Quelle: "${snippet.title}" — ${value.note ?? ""}`,
        url: snippet.url,
      });
    } else if (value.status !== "supported") {
      issues.push({
        severity: "warning",
        section: "claims",
        message: `Claim unklar: "${snippet.title}" — ${value.note ?? ""}`,
        url: snippet.url,
      });
    } else {
      console.log(`[QA] Claim ok: ${snippet.title}`);
    }
  }
  return { issues, llmUsed };
}

// ------------------------------------------ Google Fact Check (Stufe 2)

async function factCheckApi(draft: NewsletterDraft): Promise<QaIssue[]> {
  const key = process.env.GOOGLE_FACTCHECK_API_KEY;
  if (!key) {
    return [
      {
        severity: "warning",
        section: "factcheck",
        message: "GOOGLE_FACTCHECK_API_KEY nicht gesetzt — Stufe 2 übersprungen (optional).",
      },
    ];
  }
  const issues: QaIssue[] = [];
  for (const snippet of draft.newsSnippets) {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(
      snippet.title,
    )}&languageCode=en&key=${key}`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = (await res.json()) as {
        claims?: { text?: string; claimReview?: { textualRating?: string; url?: string }[] }[];
      };
      const review = json.claims?.[0]?.claimReview?.[0];
      if (review?.textualRating) {
        const rating = review.textualRating.toLowerCase();
        const severity: QaIssue["severity"] = /false|misleading|incorrect|fake/.test(rating) ? "error" : "info";
        issues.push({
          severity,
          section: "factcheck",
          message: `Fact-Check-Treffer: "${rating}" zu "${snippet.title}"`,
          url: review.url ?? snippet.url,
        });
      }
    } catch {
      // Stufe 2 ist optional — Fehler nicht eskalieren
    }
  }
  return issues;
}

// ------------------------------------------------- Kreuz-Referenz

async function crossReferenceCheck(draft: NewsletterDraft): Promise<{ issues: QaIssue[]; llmUsed: string[] }> {
  const snippets = draft.newsSnippets
    .map((s, i) => `${i + 1}. "${s.title}" (${s.source}): ${s.summary}`)
    .join("\n");
  const messages: LlmMessage[] = [
    {
      role: "system",
      content:
        `You detect contradictions between the following newsletter news snippets.
Two snippets conflict only if their claims are logically incompatible (e.g. "policy passed" vs "policy blocked").
Different topics are NOT conflicts. Respond with VALID JSON only:
{"conflicts":[{"first":1,"second":2,"reason":"<max 20 words>"}]}
Empty array = no conflicts.`,
    },
    { role: "user", content: snippets },
  ];
  const res = await generateChat(messages, { maxTokens: 1000, temperature: 0, jsonMode: true });
  const value = extractJson<{ conflicts?: { first?: number; second?: number; reason?: string }[] }>(res.content);
  const issues = (value.conflicts ?? []).map((c) => ({
    severity: "error" as const,
    section: "crossref",
    message: `Widersprüchliche Claims: Snippet ${c.first ?? "?"} vs. ${c.second ?? "?"} — ${c.reason ?? ""}`,
  }));
  console.log(`[QA] Kreuz-Referenz ok (${res.provider}/${res.model}) — ${issues.length} Konflikte`);
  return { issues, llmUsed: [`${res.provider}:${res.model}`] };
}

// ------------------------------------------------------------- Report

export async function runQa(): Promise<QaReport> {
  const draft = findLatestDraft();
  const issues: QaIssue[] = [];
  const llmUsed: string[] = [];

  console.log("\n--- Link-Validierung ---");
  const linked = collectUrls(draft);
  const linkResults = await mapWithConcurrency(linked, LINK_CONCURRENCY, validateLink);
  const linkIssues = linkResults.filter((r): r is QaIssue => r !== null);
  const okLinks = linked.length - linkIssues.length;
  issues.push(...linkIssues);
  console.log(`[QA] Links: ${okLinks}/${linked.length} ok`);

  console.log("\n--- Content-QA (LLM) ---");
  const content = await contentQa(draft);
  issues.push(...content.issues);
  llmUsed.push(...content.llmUsed);

  console.log("\n--- Deterministische Checks ---");
  issues.push(...deterministicChecks(draft));

  console.log("\n--- Claims vs. Quelle (Stufe 1) ---");
  const claims = await claimsCheck(draft);
  issues.push(...claims.issues);
  llmUsed.push(...claims.llmUsed);

  console.log("\n--- Google Fact Check (Stufe 2, optional) ---");
  issues.push(...(await factCheckApi(draft)));

  console.log("\n--- Kreuz-Referenz (Widersprüche) ---");
  const cross = await crossReferenceCheck(draft);
  issues.push(...cross.issues);
  llmUsed.push(...cross.llmUsed);

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const report: QaReport = {
    issueDate: draft.issueDate,
    checkedAt: new Date().toISOString(),
    passed: errorCount === 0,
    errorCount,
    warningCount,
    issues,
    llmUsed: [...new Set(llmUsed)],
  };

  writeFileSync(join(OUTPUT_DIR, `qa_report_${draft.issueDate}.json`), JSON.stringify(report, null, 2), "utf8");
  console.log(`\nQA-Report: ${report.passed ? "PASS" : "FAIL"} (${errorCount} Fehler, ${warningCount} Warnungen)`);
  for (const issue of issues) {
    console.log(`  [${issue.severity.toUpperCase()}] ${issue.section}: ${issue.message}${issue.url ? ` (${issue.url})` : ""}`);
  }
  return report;
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  if (typeof process.loadEnvFile === "function" && existsSync(join(process.cwd(), ".env"))) {
    process.loadEnvFile(join(process.cwd(), ".env"));
  }
  runQa()
    .then((report) => {
      if (report.passed || process.env.QA_IGNORE_ERRORS === "1") {
        process.exit(0);
      }
      process.exit(1);
    })
    .catch((err) => {
      console.error(`FEHLER: ${err.message}`);
      process.exit(1);
    });
}
