import { jsonrepair } from "jsonrepair";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmOptions {
  maxTokens?: number;
  temperature?: number;
  /** JSON-Ausgabe erzwingen (wird als response_format mitgeschickt). */
  jsonMode?: boolean;
}

export interface LlmResult {
  content: string;
  provider: "groq" | "openrouter";
  model: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Führt einen Chat-Aufruf aus: primär Groq, bei Fehler/Rate-Limit OpenRouter. */
export async function generateChat(
  messages: LlmMessage[],
  options: LlmOptions = {},
): Promise<LlmResult> {
  const attempts: Array<[string, string, string, string]> = [
    ["groq", GROQ_URL, process.env.GROQ_API_KEY ?? "", process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"],
    [
      "openrouter",
      OPENROUTER_URL,
      process.env.OPENROUTER_API_KEY ?? "",
      process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free",
    ],
  ];

  let lastError = "";
  for (const [provider, url, apiKey, model] of attempts) {
    if (!apiKey) {
      lastError = `${provider}: kein API-Key in .env`;
      continue;
    }
    try {
      const content = await attemptProvider(url, apiKey, model, messages, options);
      return { content, provider: provider as LlmResult["provider"], model };
    } catch (err) {
      lastError = `${provider}: ${(err as Error).message}`;
      console.error(`[LLM] Fallback nötig: ${lastError}`);
    }
  }
  throw new Error(`Alle LLM-Provider fehlgeschlagen: ${lastError}`);
}

/** Ruft einen Provider mit Retry bei Rate-Limits (HTTP 429) auf. */
async function attemptProvider(
  url: string,
  apiKey: string,
  model: string,
  messages: LlmMessage[],
  options: LlmOptions,
): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await callChat(url, apiKey, model, messages, options);
    } catch (err) {
      const message = (err as Error).message;
      const isRateLimit = message.includes("429") || message.toLowerCase().includes("rate limit");
      if (isRateLimit && attempt < 3) {
        const waitMs = parseRetryAfter(message);
        console.log(`[LLM] Rate-Limit (Versuch ${attempt}/3) — warte ${Math.round(waitMs / 1000)}s`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Retries erschöpft");
}

/** Liest die Wartezeit aus der Groq-Fehlermeldung ("try again in 13.235s") oder Header-ähnlichem Text. */
function parseRetryAfter(message: string): number {
  const match = message.match(/try again in ([0-9.]+)\s*s/i);
  if (match) return Math.min(60_000, Math.max(1000, Math.ceil(parseFloat(match[1]) * 1000)));
  return 3000;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function callChat(
  url: string,
  apiKey: string,
  model: string,
  messages: LlmMessage[],
  options: LlmOptions,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: options.maxTokens ?? 2048,
    temperature: options.temperature ?? 0.4,
  };
  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      throw new Error(`HTTP ${res.status}: ${detail}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Leere Antwort vom LLM");
    return content;
  } finally {
    clearTimeout(timer);
  }
}

/** Extrahiert das erste JSON-Objekt/-Array aus einer LLM-Antwort (robust gegen Markdown-Fences). */
export function extractJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const first = cleaned.search(/[\[{]/);
  const last = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  if (first === -1 || last === -1) {
    throw new Error(`Kein JSON in LLM-Antwort gefunden: ${raw.slice(0, 200)}`);
  }
  const candidate = cleaned.slice(first, last + 1);
  let value: unknown;
  try {
    value = JSON.parse(candidate);
  } catch {
    // Fallback: fehlerhaftes JSON (unescaped Quotes, Truncation) reparieren
    value = jsonrepair(candidate);
  }
  // LLMs liefern manchmal ein JSON-Objekt, das als String escaped ist → rekursiv auflösen
  while (typeof value === "string") {
    const s = value.trim();
    if (!s.startsWith("{") && !s.startsWith("[")) break;
    try {
      value = JSON.parse(s);
    } catch {
      value = jsonrepair(s);
    }
  }
  return value as T;
}
