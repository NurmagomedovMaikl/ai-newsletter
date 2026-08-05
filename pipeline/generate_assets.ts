import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { LandingTexts, NewsletterDraft } from "@/lib/types";
import { extractJson, generateChat, type LlmMessage } from "@/lib/llm";
import { renderEmail } from "./renderEmail";
import { generateImage } from "./imageProviders";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");
const ASSET_DIR = join(OUTPUT_DIR, "assets");

function findLatestDraft(): NewsletterDraft {
  const files = readdirSync(OUTPUT_DIR)
    .filter((f) => f.startsWith("newsletter_draft_") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) throw new Error("Kein newsletter_draft gefunden. Erst npm run pipeline:generate ausführen.");
  return JSON.parse(readFileSync(join(OUTPUT_DIR, files.at(-1)!), "utf8")) as NewsletterDraft;
}

function headerPrompt(draft: NewsletterDraft): string {
  const topics = draft.newsSnippets.slice(0, 3).map((s) => s.title).join(", ");
  return (
    `Modern 3D illustration for an AI newsletter header, wide format. ` +
    `Theme: ${draft.title}. Key topics: ${topics}. ` +
    `Sleek futuristic abstract shapes, glowing neural-network motifs, dark blue-violet palette ` +
    `with warm orange accents, soft studio lighting, high detail, no text, no letters.`
  );
}

function socialPrompt(draft: NewsletterDraft): string {
  return (
    `Modern 3D illustration, square format, for a social media teaser of an AI newsletter. ` +
    `Theme: ${draft.title}. A single glowing AI core orb surrounded by floating holographic panels, ` +
    `dark background with electric blue and violet gradients, warm orange highlights, ` +
    `clean composition, high detail, no text, no letters.`
  );
}

async function generateLandingTexts(draft: NewsletterDraft): Promise<{ value: LandingTexts; llmUsed: string[] }> {
  const messages: LlmMessage[] = [
    {
      role: "system",
      content:
        `You write marketing copy for a weekly English AI newsletter website. ` +
        `The product has a FREE tier (weekly issue, limited content) and a PAID tier ` +
        `(monthly subscription, full content + complete back-issue archive). ` +
        `House style: modern 3D illustrations, premium tech tone. ` +
        `Respond with a VALID JSON OBJECT only: ` +
        `{"hero":{"headline","subheadline","cta"},"features":[{"title","description"}],"pricing":` +
        `{"free":{"title","description","features":[]},"paid":{"title","description","price","features":[]}},` +
        `"faq":[{"question","answer"}]}`,
    },
    {
      role: "user",
      content: `This week's issue theme: ${draft.title}. Write the landing page texts.`,
    },
  ];
  const res = await generateChat(messages, { maxTokens: 2500, temperature: 0.7, jsonMode: true });
  const value = extractJson<LandingTexts>(res.content);
  console.log(`[LANDING] Texte ok (${res.provider}/${res.model})`);
  return { value, llmUsed: [`${res.provider}:${res.model}`] };
}

export async function generateAssets(): Promise<void> {
  const draft = findLatestDraft();
  const date = draft.issueDate;
  mkdirSync(ASSET_DIR, { recursive: true });

  const seed = Number(date.replace(/-/g, ""));
  const headerFile = join(ASSET_DIR, `header_${date}.png`);
  const socialFile = join(ASSET_DIR, `social_${date}.png`);

  const headerDone = await tryImage(() =>
    generateImage(headerPrompt(draft), 1024, 576, seed, headerFile));
  const socialDone = await tryImage(() =>
    generateImage(socialPrompt(draft), 1024, 1024, seed + 1, socialFile));

  const landing = await generateLandingTexts(draft);
  writeFileSync(
    join(OUTPUT_DIR, `landing_texts.json`),
    JSON.stringify({ issueDate: date, ...landing.value }, null, 2),
    "utf8",
  );

  const headerRef = headerDone ? `assets/header_${date}.png` : "assets/header_placeholder.png";
  const html = renderEmail(draft, headerRef);
  const emailFile = join(OUTPUT_DIR, `email_${date}.html`);
  writeFileSync(emailFile, html, "utf8");

  console.log(`\nAssets fertig:`);
  console.log(`  - E-Mail: ${emailFile}`);
  console.log(`  - Header-Bild: ${headerDone ? headerFile : "FEHLGESCHLAGEN"}`);
  console.log(`  - Social-Bild: ${socialDone ? socialFile : "FEHLGESCHLAGEN"}`);
  console.log(`  - Landing-Texte: ${join(OUTPUT_DIR, "landing_texts.json")}`);
}

async function tryImage(fn: () => Promise<void>): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch (err) {
    console.warn(`[IMAGE] ${(err as Error).message}`);
    return false;
  }
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  if (typeof process.loadEnvFile === "function" && existsSync(join(process.cwd(), ".env"))) {
    process.loadEnvFile(join(process.cwd(), ".env"));
  }
  generateAssets().then(() => process.exit(0)).catch((err) => {
    console.error(`FEHLER: ${err.message}`);
    process.exit(1);
  });
}
