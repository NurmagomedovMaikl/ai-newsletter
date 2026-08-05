import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { CollectResult, RawArticle, ScoredArticle } from "@/lib/types";
import { extractJson, generateChat, type LlmMessage } from "@/lib/llm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");

/** Relevanz-Schwelle (aus PROJEKT_PLAN.md): nur Score >= 7 übernehmen. */
export const RELEVANCE_THRESHOLD = 7;

const BATCH_SIZE = 10;

const SCORING_SYSTEM_PROMPT = `You are the editorial filter for an AI newsletter aimed at developers, founders and AI enthusiasts.
Your job: score news articles by relevance for this audience.

Scoring criteria (0-10):
- 9-10: Major news, high significance, broad impact on the AI industry (new model releases, funding, policy, breakthrough research).
- 7-8: Relevant developments, tool launches, notable updates with practical value.
- 4-6: Peripheral, niche, or incremental news.
- 0-3: Off-topic, spam, marketing fluff, or trivial.

Rules:
- Score ONLY based on the provided title/summary.
- Unknown or broken context => score low.
- Reasons must be ASCII only (no quotes, no special chars), max 10 words.
- Respond with a VALID JSON OBJECT only: {"scores":[{"id":"<id>","score":0-10,"reason":"<text>"}]}`;

function loadArticles(): RawArticle[] {
  const file = join(OUTPUT_DIR, "latest.json");
  if (!existsSync(file)) throw new Error(`Kein Output gefunden: ${file}. Erst "npm run pipeline:collect" ausführen.`);
  const data = JSON.parse(readFileSync(file, "utf8")) as CollectResult;
  return data.articles;
}

async function scoreBatch(batch: RawArticle[]): Promise<ScoredArticle[]> {
  const items = batch.map((a) => ({
    id: a.id,
    title: a.title,
    source: a.source,
    summary: (a.summary ?? "").slice(0, 200),
  }));

  const messages: LlmMessage[] = [
    { role: "system", content: SCORING_SYSTEM_PROMPT },
    { role: "user", content: `Score these articles:\n${JSON.stringify(items)}` },
  ];

  const res = await generateChat(messages, { maxTokens: 3000, temperature: 0.2, jsonMode: true });
  const parsed = extractJson<{ scores: { id: string; score: number; reason?: string }[] }>(
    res.content,
  );
  const byId = new Map(parsed.scores.map((s) => [s.id, s]));

  return batch.map((a) => {
    const s = byId.get(a.id);
    const score = s?.score ?? 0;
    return {
      ...a,
      score: Math.max(0, Math.min(10, Math.round(score))),
      reason: s?.reason,
    };
  });
}

async function scoreAll(articles: RawArticle[]): Promise<ScoredArticle[]> {
  const scored: ScoredArticle[] = [];
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const result = await withRetry(() => scoreBatch(batch));
    scored.push(...result);
    console.log(`[SCORE] Batch ${i / BATCH_SIZE + 1}/${Math.ceil(articles.length / BATCH_SIZE)} (${result.length} Artikel)`);
    // Pause: Groq-Free-Tier hat ~30 Requests/min → TPM-Limit schonen
    await new Promise((r) => setTimeout(r, 1500));
  }
  return scored;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[SCORE] Batch-Fehler (${(err as Error).message}) — 1 Retry`);
    await new Promise((r) => setTimeout(r, 2000));
    return await fn();
  }
}

export async function score(): Promise<ScoredArticle[]> {
  const articles = loadArticles();
  console.log(`Scoring ${articles.length} Artikel ...`);
  const scored = await scoreAll(articles);
  scored.sort((a, b) => b.score - a.score);

  const file = join(OUTPUT_DIR, "scored_articles.json");
  writeFileSync(file, JSON.stringify(scored, null, 2), "utf8");

  const top = scored.filter((a) => a.score >= RELEVANCE_THRESHOLD);
  console.log(
    `\nFertig: ${top.length}/${scored.length} Artikel mit Score >= ${RELEVANCE_THRESHOLD} ` +
      `(Median ~${(scored.reduce((s, a) => s + a.score, 0) / scored.length).toFixed(1)}). Output: ${file}`,
  );
  return scored;
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  if (typeof process.loadEnvFile === "function" && existsSync(join(process.cwd(), ".env"))) {
    process.loadEnvFile(join(process.cwd(), ".env"));
  }
  score().then(() => process.exit(0)).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
