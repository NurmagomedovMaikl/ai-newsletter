import { writeFileSync } from "node:fs";
import sharp from "sharp";

const CF_API = "https://api.cloudflare.com/client/v4/accounts";
const TIMEOUT_MS = 120_000;

/**
 * Bildgenerierung ausschließlich über Cloudflare Workers AI (Free-Tier, 10.000 Neuronen/Tag).
 * Entscheidung E-014: HF/Pollinations entfernt, nur Cloudflare.
 * Strategie: FLUX.1-schnell (beste Qualität, nur quadratisch) ist immer primär;
 * nicht-quadratische Formate (Header) werden zentriert auf die Zielgröße zugeschnitten (sharp).
 * Fallbacks: SDXL base → SDXL Lightning (unterstützen width/height direkt).
 */
export async function generateImage(
  prompt: string,
  width: number,
  height: number,
  seed: number,
  outPath: string,
): Promise<void> {
  let buffer: Buffer | undefined;
  let lastError = "";

  try {
    const square = await cloudflareImage("@cf/black-forest-labs/flux-1-schnell", {
      prompt,
      seed,
      steps: 8,
    });
    buffer = width === height ? square : await centerCrop(square, width, height);
  } catch (err) {
    lastError = (err as Error).message;
    console.warn(`[IMAGE] FLUX fehlgeschlagen: ${lastError}`);
  }
  if (buffer) return save(buffer, "@cf/black-forest-labs/flux-1-schnell", width, height, outPath);

  try {
    buffer = await cloudflareImage("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
      prompt,
      width,
      height,
      seed,
      num_steps: 20,
      guidance_scale: 7.5,
    });
  } catch (err) {
    lastError = (err as Error).message;
    console.warn(`[IMAGE] SDXL fehlgeschlagen: ${lastError}`);
  }
  if (buffer) return save(buffer, "@cf/stabilityai/stable-diffusion-xl-base-1.0", width, height, outPath);

  try {
    buffer = await cloudflareImage("@cf/bytedance/stable-diffusion-xl-lightning", {
      prompt,
      width,
      height,
      seed,
      num_steps: 4,
    });
  } catch (err) {
    lastError = (err as Error).message;
    console.warn(`[IMAGE] SDXL-Lightning fehlgeschlagen: ${lastError}`);
  }
  if (buffer) return save(buffer, "@cf/bytedance/stable-diffusion-xl-lightning", width, height, outPath);

  throw new Error(`Alle Bild-Provider fehlgeschlagen: ${lastError}`);
}

async function cloudflareImage(model: string, params: Record<string, unknown>): Promise<Buffer> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN fehlen in .env");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${CF_API}/${accountId}/ai/run/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`${model}: HTTP ${res.status}: ${detail}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  let buffer: Buffer;
  if (contentType.includes("image/")) {
    buffer = Buffer.from(await res.arrayBuffer());
  } else {
    const json = (await res.json()) as {
      success?: boolean;
      errors?: { message?: string }[];
      result?: { image?: string };
    };
    if (json.success === false || !json.result?.image) {
      const msg = json.errors?.[0]?.message ?? "kein Bild in Antwort";
      throw new Error(`${model}: ${msg}`);
    }
    buffer = Buffer.from(json.result.image, "base64");
  }
  if (buffer.length < 1000) throw new Error(`${model}: Antwort zu klein (${buffer.length} bytes)`);
  return buffer;
}

async function centerCrop(buffer: Buffer, width: number, height: number): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const srcW = meta.width ?? width;
  const srcH = meta.height ?? height;
  if (srcW < width || srcH < height) throw new Error(`Quellbild (${srcW}x${srcH}) zu klein für ${width}x${height}`);
  return sharp(buffer)
    .extract({
      left: Math.round((srcW - width) / 2),
      top: Math.round((srcH - height) / 2),
      width,
      height,
    })
    .png()
    .toBuffer();
}

function save(buffer: Buffer, model: string, width: number, height: number, outPath: string): void {
  writeFileSync(outPath, buffer);
  console.log(`[IMAGE] Cloudflare ${model}: ${width}x${height} → ${outPath}`);
}
