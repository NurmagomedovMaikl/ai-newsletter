import Parser from "rss-parser";
import type { RawArticle, SourceConfig } from "@/lib/types";
import { hashId, normalizeUrl } from "./dedup";

const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRss(source: SourceConfig): Promise<RawArticle[]> {
  const parser = new Parser({ timeout: FETCH_TIMEOUT_MS });
  const feed = await parser.parseURL(source.url);
  const daysBack = source.daysBack ?? 7;

  return (feed.items ?? [])
    .map((item): RawArticle | null => {
      const publishedAt = item.isoDate ?? item.pubDate ?? "";
      if (!item.title || !item.link) return null;
      if (!isWithinWindow(publishedAt, daysBack)) return null;
      return {
        id: hashId(item.link),
        title: cleanTitle(item.title, source.id),
        url: normalizeUrl(item.link),
        sourceId: source.id,
        source: source.name,
        publishedAt: new Date(publishedAt).toISOString(),
        author: item.creator ?? undefined,
        summary: extractSummary(item.content ?? item["content:encoded"] ?? "", item.contentSnippet ?? ""),
        content: item["content:encoded"] ?? item.content ?? undefined,
        category: source.category,
        score: 0,
        collectedAt: new Date().toISOString(),
      };
    })
    .filter((a): a is RawArticle => a !== null);
}

/** Google News hängt " - Quellenname" an jeden Titel an → entfernen. */
function cleanTitle(title: string, sourceId: string): string {
  if (sourceId === "google-news-ai") {
    return title.replace(/\s-\s[^-]+$/, "").trim();
  }
  return title;
}

/** Brauchbare Zusammenfassung aus Content/ContentSnippet ziehen. */
function extractSummary(contentHtml: string, snippet: string): string | undefined {
  if (contentHtml) {
    const text = stripHtml(contentHtml);
    if (text) {
      const marker = text.indexOf("Discussion");
      return (marker > 0 ? text.slice(0, marker) : text).trim().slice(0, 600) || undefined;
    }
  }
  return snippet.trim() || undefined;
}

export async function fetchHackerNews(source: SourceConfig): Promise<RawArticle[]> {
  const daysBack = source.daysBack ?? 7;
  const minScore = source.minScore ?? 0;

  const topRes = await fetchWithTimeout(`${source.url}topstories.json`);
  if (!topRes.ok) throw new Error(`HN topstories: HTTP ${topRes.status}`);
  const ids = (await topRes.json()) as number[];

  const stories = await Promise.all(
    ids.slice(0, 50).map(async (id) => {
      const res = await fetchWithTimeout(`${source.url}item/${id}.json`);
      if (!res.ok) return null;
      return (await res.json()) as {
        id?: number;
        type?: string;
        title?: string;
        url?: string;
        text?: string;
        by?: string;
        time?: number;
        score?: number;
      };
    }),
  );

  const now = Date.now();
  return stories
    .filter(
      (s): s is NonNullable<typeof s> =>
        s !== null && s.type === "story" && !!s.title && (s.score ?? 0) >= minScore,
    )
    .filter((s) => (s.time ? now - s.time * 1000 <= daysBack * 24 * 3600_000 : false))
    .map((s) => {
      const url = s.url ?? `https://news.ycombinator.com/item?id=${s.id ?? ""}`;
      return {
        id: hashId(url),
        title: s.title!,
        url,
        sourceId: source.id,
        source: source.name,
        publishedAt: new Date((s.time ?? now / 1000) * 1000).toISOString(),
        author: s.by ?? undefined,
        summary: stripHtml(s.text ?? "") || undefined,
        content: s.text ?? undefined,
        category: source.category,
        score: 0,
        collectedAt: new Date().toISOString(),
      } satisfies RawArticle;
    });
}

export async function fetchReddit(source: SourceConfig): Promise<RawArticle[]> {
  const daysBack = source.daysBack ?? 7;
  const minScore = source.minScore ?? 0;

  const res = await fetchWithTimeout(source.url, {
    headers: { "User-Agent": "ai-newsletter-pipeline/0.1 (educational project)" },
  });
  if (!res.ok) throw new Error(`Reddit ${source.url}: HTTP ${res.status}`);
  const json = (await res.json()) as {
    data?: { children?: { data?: Record<string, unknown> }[] };
  };

  const now = Date.now();
  return (json.data?.children ?? [])
    .map((c) => c.data)
    .filter((d): d is NonNullable<typeof d> => !!d && typeof d.title === "string")
    .filter((d) => {
      if (typeof d.created_utc !== "number") return false;
      if (now - d.created_utc * 1000 > daysBack * 24 * 3600_000) return false;
      if (typeof d.score === "number" && d.score < minScore) return false;
      return true;
    })
    .map((d) => {
      const url = typeof d.url === "string" ? d.url : "";
      const selftext = typeof d.selftext === "string" ? d.selftext : "";
      const permalink = typeof d.permalink === "string" ? d.permalink : "";
      return {
        id: hashId(url || permalink || `${d.title}`),
        title: d.title as string,
        url,
        sourceId: source.id,
        source: source.name,
        publishedAt: new Date((d.created_utc as number) * 1000).toISOString(),
        author: typeof d.author === "string" ? d.author : undefined,
        summary: selftext.slice(0, 500) || undefined,
        content: selftext || undefined,
        category: source.category,
        score: 0,
        collectedAt: new Date().toISOString(),
      } satisfies RawArticle;
    });
}

export async function fetchNewsApi(source: SourceConfig): Promise<RawArticle[]> {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return []; // optional — ohne Key einfach überspringen

  const params = new URLSearchParams({
    q: "artificial intelligence OR AI OR LLM",
    language: "en",
    sortBy: "publishedAt",
    pageSize: "50",
    apiKey: key,
  });
  const res = await fetchWithTimeout(`${source.url}?${params.toString()}`);
  if (!res.ok) throw new Error(`NewsAPI: HTTP ${res.status}`);
  const json = (await res.json()) as { articles?: Record<string, unknown>[] };

  return (json.articles ?? [])
    .map((a): RawArticle | null => {
      const title = typeof a.title === "string" ? a.title : "";
      const url = typeof a.url === "string" ? a.url : "";
      const publishedAt = typeof a.publishedAt === "string" ? a.publishedAt : "";
      const desc = typeof a.description === "string" ? a.description : "";
      const author = typeof a.author === "string" ? a.author : undefined;
      if (!title || !url) return null;
      return {
        id: hashId(url),
        title,
        url: normalizeUrl(url),
        sourceId: source.id,
        source: source.name,
        publishedAt: new Date(publishedAt).toISOString(),
        author,
        summary: desc || undefined,
        category: source.category,
        score: 0,
        collectedAt: new Date().toISOString(),
      } satisfies RawArticle;
    })
    .filter((a): a is RawArticle => a !== null);
}

function isWithinWindow(publishedAt: string, daysBack: number): boolean {
  if (!publishedAt) return false;
  const time = Date.parse(publishedAt);
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= daysBack * 24 * 3600_000;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
