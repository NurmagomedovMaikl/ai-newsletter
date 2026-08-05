import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NewsletterDraft, ScoredArticle } from "@/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");
const BUCKET = "newsletter-assets";

type SegmentKey =
  | "intro"
  | "news"
  | "tool"
  | "prompt"
  | "image_training"
  | "deep_dive"
  | "podcast"
  | "video"
  | "read";

interface Segment {
  segment_key: SegmentKey;
  content: unknown;
  paid_only: boolean;
  sort_order: number;
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function findLatestDraft(): NewsletterDraft {
  const files = readdirSync(OUTPUT_DIR)
    .filter((f) => f.startsWith("newsletter_draft_") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) throw new Error("Kein newsletter_draft gefunden.");
  return loadJson<NewsletterDraft>(join(OUTPUT_DIR, files.at(-1)!));
}

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen in .env");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function upsertRawArticles(service: SupabaseClient, articles: ScoredArticle[]): Promise<number> {
  const rows = articles.map((a) => ({
    id: a.id,
    title: a.title,
    url: a.url,
    source: a.source,
    source_id: a.sourceId,
    published_at: a.publishedAt || null,
    summary: a.summary ?? null,
    category: a.category ?? [],
    score: typeof a.score === "number" ? a.score : null,
  }));
  const CHUNK = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await service.from("raw_articles").upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`raw_articles upsert: ${error.message}`);
    inserted += chunk.length;
    console.log(`[PERSIST] raw_articles: ${inserted}/${rows.length}`);
  }
  return inserted;
}

async function upsertIssue(
  service: SupabaseClient,
  draft: NewsletterDraft,
  publish: boolean,
): Promise<string> {
  const payload = {
    issue_date: draft.issueDate,
    title: draft.title,
    status: publish ? "published" : "draft",
    ...(publish ? { published_at: new Date().toISOString() } : {}),
  };
  const { data, error } = await service
    .from("issues")
    .upsert(payload, { onConflict: "issue_date" })
    .select("id")
    .single();
  if (error) throw new Error(`issues upsert: ${error.message}`);
  return data.id;
}

async function uploadAssets(
  service: SupabaseClient,
  issueDate: string,
): Promise<{ headerImageUrl: string; socialImageUrl: string }> {
  const { data: buckets } = await service.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await service.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Bucket anlegen: ${error.message}`);
    console.log(`[PERSIST] Bucket "${BUCKET}" angelegt (public).`);
  }

  const path = (name: string) => `issues/${issueDate}/${name}`;
  const { data: header } = await service.storage
    .from(BUCKET)
    .upload(path("header.png"), readFileSync(join(OUTPUT_DIR, "assets", `header_${issueDate}.png`)), {
      upsert: true,
      contentType: "image/png",
    });
  if (header?.path) console.log(`[PERSIST] header.png hochgeladen -> ${header.path}`);

  const { data: social } = await service.storage
    .from(BUCKET)
    .upload(path("social.png"), readFileSync(join(OUTPUT_DIR, "assets", `social_${issueDate}.png`)), {
      upsert: true,
      contentType: "image/png",
    });
  if (social?.path) console.log(`[PERSIST] social.png hochgeladen -> ${social.path}`);

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/issues/${issueDate}`;
  return { headerImageUrl: `${url}/header.png`, socialImageUrl: `${url}/social.png` };
}

function buildSegments(draft: NewsletterDraft, images: { headerImageUrl: string; socialImageUrl: string }): Segment[] {
  const segments: Segment[] = [
    { segment_key: "intro", content: { text: draft.intro, ...images }, paid_only: false, sort_order: 0 },
    { segment_key: "news", content: draft.newsSnippets, paid_only: false, sort_order: 1 },
    { segment_key: "tool", content: draft.toolOfTheWeek, paid_only: false, sort_order: 2 },
    { segment_key: "prompt", content: draft.promptOfTheWeek, paid_only: true, sort_order: 3 },
    { segment_key: "image_training", content: draft.imagePromptTraining, paid_only: true, sort_order: 4 },
    { segment_key: "deep_dive", content: draft.deepDive, paid_only: true, sort_order: 5 },
    { segment_key: "podcast", content: draft.podcastOfTheWeek, paid_only: true, sort_order: 6 },
    { segment_key: "video", content: draft.videoOfTheWeek, paid_only: true, sort_order: 7 },
    { segment_key: "read", content: draft.readOfTheWeek, paid_only: true, sort_order: 8 },
  ];
  return segments.filter((s) => s.content != null);
}

async function replaceIssueContent(service: SupabaseClient, issueId: string, segments: Segment[]) {
  const { error: del } = await service.from("issue_content").delete().eq("issue_id", issueId);
  if (del) throw new Error(`issue_content delete: ${del.message}`);
  const { error } = await service
    .from("issue_content")
    .insert(segments.map((s) => ({ ...s, issue_id: issueId })));
  if (error) throw new Error(`issue_content insert: ${error.message}`);
}

export async function persist(publish: boolean): Promise<void> {
  const draft = findLatestDraft();
  console.log(`[PERSIST] Ausgabe ${draft.issueDate} (${publish ? "published" : "draft"}) ...`);

  const scored = loadJson<ScoredArticle[]>(join(OUTPUT_DIR, "scored_articles.json"));
  const service = serviceClient();

  const articleCount = await upsertRawArticles(service, scored);

  const issueId = await upsertIssue(service, draft, publish);
  console.log(`[PERSIST] Issue ${draft.issueDate} -> ${issueId}`);

  const images = await uploadAssets(service, draft.issueDate);
  const segments = buildSegments(draft, images);
  await replaceIssueContent(service, issueId, segments);
  console.log(`[PERSIST] ${segments.length} Segmente gespeichert (paid: ${segments.filter((s) => s.paid_only).length}).`);

  const summary = {
    ranAt: new Date().toISOString(),
    issueDate: draft.issueDate,
    status: publish ? "published" : "draft",
    issueId,
    articles: articleCount,
    segments: segments.length,
    headerImageUrl: images.headerImageUrl,
    socialImageUrl: images.socialImageUrl,
  };
  writeFileSync(join(OUTPUT_DIR, `persist_${draft.issueDate}.json`), JSON.stringify(summary, null, 2), "utf8");
  console.log(`[PERSIST] Fertig. ${articleCount} Artikel, ${segments.length} Segmente, Assets im Bucket.`);
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  if (typeof process.loadEnvFile === "function" && existsSync(join(process.cwd(), ".env"))) {
    process.loadEnvFile(join(process.cwd(), ".env"));
  }
  persist(process.argv.includes("--publish"))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`\n[PERSIST] FEHLER: ${err.message}`);
      process.exit(1);
    });
}
