import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { CollectResult, RawArticle, SourceConfig } from "@/lib/types";
import { SOURCES } from "./config/sources";
import { normalizeTitle } from "./dedup";
import { fetchHackerNews, fetchNewsApi, fetchReddit, fetchRss } from "./fetchers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");

const FETCHER: Record<SourceConfig["type"], (s: SourceConfig) => Promise<RawArticle[]>> = {
  rss: fetchRss,
  hackernews: fetchHackerNews,
  reddit: fetchReddit,
  newsapi: fetchNewsApi,
};

export async function collect(): Promise<CollectResult> {
  const enabled = SOURCES.filter((s) => s.enabled);
  const failed: string[] = [];
  const all: RawArticle[] = [];

  for (const source of enabled) {
    try {
      const articles = await FETCHER[source.type](source);
      all.push(...articles);
      console.log(`[OK]   ${source.name.padEnd(28)} ${articles.length} Artikel`);
    } catch (err) {
      failed.push(source.id);
      console.error(`[FAIL] ${source.name.padEnd(28)} ${(err as Error).message}`);
    }
    // Kleine Pause zwischen Quellen reduziert Rate-Limits (z.B. Reddit).
    await new Promise((r) => setTimeout(r, 750));
  }

  const unique = dedupe(all);
  unique.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  const result: CollectResult = {
    collectedAt: new Date().toISOString(),
    totalFetched: all.length,
    totalUnique: unique.length,
    sourcesSucceeded: enabled.length - failed.length,
    sourcesFailed: failed,
    articles: unique,
  };

  writeOutput(result);
  return result;
}

/** Dedupliziert nach URL-Hash und (Near-Duplicate) normalisiertem Titel. */
function dedupe(articles: RawArticle[]): RawArticle[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const out: RawArticle[] = [];

  for (const a of articles) {
    if (seenIds.has(a.id)) continue;
    const title = normalizeTitle(a.title);
    if (seenTitles.has(title)) continue;
    seenIds.add(a.id);
    seenTitles.add(title);
    out.push(a);
  }
  return out;
}

function writeOutput(result: CollectResult): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const filename = `raw_articles_${date}.json`;
  writeFileSync(join(OUTPUT_DIR, filename), JSON.stringify(result, null, 2), "utf8");
  writeFileSync(join(OUTPUT_DIR, "latest.json"), JSON.stringify(result, null, 2), "utf8");
  console.log(`\nOutput geschrieben: ${join(OUTPUT_DIR, filename)}`);
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  collect().then((r) => {
    console.log(
      `\nFertig: ${r.totalUnique} einzigartige Artikel (von ${r.totalFetched}), ` +
        `${r.sourcesSucceeded}/${r.sourcesSucceeded + r.sourcesFailed.length} Quellen ok, ` +
        `Fehler: ${r.sourcesFailed.join(", ") || "keine"}`,
    );
    process.exit(0);
  });
}
