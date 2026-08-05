import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  type NewsletterDraft,
  type Recommendation,
  type ScoredArticle,
} from "@/lib/types";
import { extractJson, generateChat, type LlmMessage, type LlmResult } from "@/lib/llm";
import { RELEVANCE_THRESHOLD } from "./score";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");

const ISSUE_DATE = new Date().toISOString().slice(0, 10);

interface Segment<T> {
  value: T;
  llmUsed: string[];
}

async function segment<T>(
  name: string,
  system: string,
  user: string,
  maxTokens = 2500,
): Promise<Segment<T>> {
  const messages: LlmMessage[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  let res: LlmResult;
  let value: T;
  for (let attempt = 1; ; attempt++) {
    res = await generateChat(messages, { maxTokens, temperature: 0.6 });
    try {
      value = extractJson<T>(res.content);
      break;
    } catch (err) {
      if (attempt >= 2) throw err;
      console.warn(`[SEGMENT] ${name}: JSON-Parse-Fehler (${(err as Error).message}) — Retry`);
    }
  }
  console.log(`[SEGMENT] ${name} ok (${res.provider}/${res.model})`);
  return { value, llmUsed: [`${res.provider}:${res.model}`] };
}

function loadScored(): ScoredArticle[] {
  const file = join(OUTPUT_DIR, "scored_articles.json");
  if (!existsSync(file)) throw new Error("scored_articles.json fehlt. Erst npm run pipeline:score ausführen.");
  return JSON.parse(readFileSync(file, "utf8")) as ScoredArticle[];
}

export async function generate(): Promise<void> {
  const scored = loadScored();
  const general = scored.filter((a) => a.score >= RELEVANCE_THRESHOLD);
  const tools = scored.filter((a) => a.category.includes("tools") && a.score >= 5);
  const newsPool = general
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  console.log(
    `\nEntwurf wird erstellt — Basis: ${general.length} relevante Artikel, ${tools.length} Tools.`,
  );

  const llmUsed: string[] = [];

  // --- 1) News-Snippets: LLM wählt aus, URLs bleiben aus den Daten ---
  const newsCtx = newsPool.map((a) => ({
    id: a.id,
    title: a.title,
    url: a.url,
    source: a.source,
    summary: (a.summary ?? "").slice(0, 300),
  }));
  const news = await segment<NewsletterDraft["newsSnippets"]>(
    "News-Snippets",
    `You write the "Top AI News" section of a premium English AI newsletter.
Select the 5 most important, non-redundant stories from the provided list.
For each: keep the EXACT title, url and source from the input (never invent URLs),
and write a punchy 1-2 sentence summary.
Respond with a VALID JSON array only: [{"title","url","source","summary"}]`,
    JSON.stringify(newsCtx),
  );
  llmUsed.push(...news.llmUsed);

  // --- 2) Tool of the Week ---
  const toolCtx = tools.slice(0, 8).map((a) => ({
    title: a.title,
    url: a.url,
    description: (a.summary ?? "").slice(0, 200),
  }));
  let toolOfTheWeek: Recommendation | null = null;
  if (toolCtx.length > 0) {
    const tool = await segment<Recommendation>(
      "Tool of the Week",
      `Pick the single most impressive and useful AI tool from the provided list.
Keep the EXACT url from the input. Respond with a VALID JSON object only:
{"title","url","description","why"} where "description" explains what it does
and "why" (max 40 words) why a reader should try it this week.`,
      JSON.stringify(toolCtx),
    );
    toolOfTheWeek = tool.value;
    llmUsed.push(...tool.llmUsed);
  } else {
    console.log("[SEGMENT] Tool of the Week übersprungen (keine Tools >= 5).");
  }

  // --- 3) Prompt der Woche ---
  const promptWeek = await segment<NewsletterDraft["promptOfTheWeek"]>(
    "Prompt of the Week",
    `Create the "Prompt of the Week" for an AI newsletter for developers and creatives.
Choose a practically useful, non-obvious prompt pattern.
Respond with a VALID JSON object only:
{"title","prompt","explanation"} where "prompt" is the exact copy-paste-able prompt
(with placeholders in [BRACKETS]) and "explanation" (max 60 words) explains
when and how to use it.`,
    `Theme: a genuinely useful prompt for a current AI assistant (Claude, ChatGPT, Gemini).
Keep it fresh and actionable.`,
  );
  llmUsed.push(...promptWeek.llmUsed);

  // --- 4) Bildgenerierungs-Prompt-Training ---
  const imgTraining = await segment<NewsletterDraft["imagePromptTraining"]>(
    "Image Prompt Training",
    `Write an "Image Prompt Training" section that TEACHES readers how to craft
high-quality image generation prompts (for tools like Midjourney, DALL-E, Flux).
The house style of the newsletter is "modern 3D illustration".
Respond with a VALID JSON object only:
{"title","concept","promptTemplate","examplePrompt"}
- "concept": the technique/principle taught this week (max 80 words)
- "promptTemplate": a reusable template with [PLACEHOLDERS]
- "examplePrompt": one complete, detailed example prompt in 3D-illustration style`,
    "Keep it practical and beginner-friendly.",
  );
  llmUsed.push(...imgTraining.llmUsed);

  // --- 5) AI Deep Dive (Tutorial) ---
  const topicHint = general.slice(0, 5).map((a) => a.title).join(" | ");
  const deepDive = await segment<NewsletterDraft["deepDive"]>(
    "Deep Dive Tutorial",
    `Write an "AI Deep Dive" tutorial section for advanced readers.
Choose a current, relevant topic from the news context if one fits,
otherwise pick a high-value evergreen AI topic (model, technique or tool).
Respond with a VALID JSON object only:
{"topic","intro","steps","takeaways"}
- "steps": 5-8 concrete, numbered steps a reader can follow
- "takeaways": 3-5 bullet-style takeaways`,
    `Recent trending topics: ${topicHint || "none"}`,
    4000,
  );
  llmUsed.push(...deepDive.llmUsed);
  // Repair-Artefakte entfernen: Listenmarker ("1." / "*") landen manchmal als Zahlen/Einträge im Array
  deepDive.value = {
    ...deepDive.value,
    steps: (deepDive.value.steps ?? []).filter((s) => typeof s === "string" && s.trim() !== "*"),
    takeaways: (deepDive.value.takeaways ?? []).filter((s) => typeof s === "string" && s.trim() !== "*"),
  };

  // --- 6) Podcast / Video / Read of the Week (Empfehlungen) ---
  const podcast = await segment<Recommendation | null>(
    "Podcast of the Week",
    `Recommend ONE real, well-known AI podcast episode or show. Only recommend
content you are confident actually exists (famous shows only).
Respond with a VALID JSON object only: {"title","url","description","why"}.
If you cannot think of a safe recommendation, respond with: null`,
    "Short description and why (max 40 words).",
  );
  llmUsed.push(...podcast.llmUsed);

  const video = await segment<Recommendation | null>(
    "Video of the Week",
    `Recommend ONE real, well-known AI YouTube video, channel or talk. Only
recommend content you are confident actually exists.
Respond with a VALID JSON object only: {"title","url","description","why"}.
If unsure, respond with: null`,
    "Short description and why (max 40 words).",
  );
  llmUsed.push(...video.llmUsed);

  const read = await segment<Recommendation | null>(
    "Read of the Week",
    `Recommend ONE real, well-known AI book, paper, essay or article. Only
recommend something you are confident exists.
Respond with a VALID JSON object only: {"title","url","description","why"}.
If unsure, respond with: null`,
    "Short description and why (max 40 words).",
  );
  llmUsed.push(...read.llmUsed);

  // --- Intro + Titel ---
  const intro = await segment<{ title: string; intro: string }>(
    "Intro + Titel",
    `Write the newsletter title (max 10 words) and a warm 2-sentence intro
for this week's AI newsletter edition. Respond with a VALID JSON object only:
{"title","intro"}`,
    `Key topics this week: ${newsPool.slice(0, 3).map((a) => a.title).join(" / ")}`,
  );
  llmUsed.push(...intro.llmUsed);

  const draft: NewsletterDraft = {
    issueDate: ISSUE_DATE,
    title: intro.value.title,
    intro: intro.value.intro,
    newsSnippets: news.value,
    toolOfTheWeek: toolOfTheWeek,
    promptOfTheWeek: promptWeek.value,
    imagePromptTraining: imgTraining.value,
    deepDive: deepDive.value,
    podcastOfTheWeek: podcast.value,
    videoOfTheWeek: video.value,
    readOfTheWeek: read.value,
    generatedAt: new Date().toISOString(),
    llmUsed,
  };

  const file = join(OUTPUT_DIR, `newsletter_draft_${ISSUE_DATE}.json`);
  writeFileSync(file, JSON.stringify(draft, null, 2), "utf8");
  console.log(`\nEntwurf geschrieben: ${file}`);
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  if (typeof process.loadEnvFile === "function" && existsSync(join(process.cwd(), ".env"))) {
    process.loadEnvFile(join(process.cwd(), ".env"));
  }
  generate().then(() => process.exit(0)).catch((err) => {
    console.error(`FEHLER: ${err.message}`);
    process.exit(1);
  });
}
