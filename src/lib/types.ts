export type SourceType = "rss" | "hackernews" | "reddit" | "newsapi";

export interface SourceConfig {
  id: string;
  type: SourceType;
  name: string;
  url: string;
  enabled: boolean;
  category: string[];
  /** Artikel älter als dieser Zeitraum (Tage) werden verworfen */
  daysBack?: number;
  /** Reddit/HN: nur Beiträge ab diesem Score übernehmen */
  minScore?: number;
}

export interface RawArticle {
  /** Stabiler Hash über die normalisierte URL */
  id: string;
  title: string;
  url: string;
  sourceId: string;
  source: string;
  publishedAt: string;
  author?: string;
  summary?: string;
  content?: string;
  category: string[];
  /** Relevanz-Score 0–10; wird in Phase 2 vom LLM gefüllt */
  score: number;
  collectedAt: string;
}

export interface CollectResult {
  collectedAt: string;
  totalFetched: number;
  totalUnique: number;
  sourcesSucceeded: number;
  sourcesFailed: string[];
  articles: RawArticle[];
}

/** Artikel mit LLM-Relevanz-Score (Phase 2, Schritt 1). */
export interface ScoredArticle extends RawArticle {
  score: number;
  reason?: string;
}

/** Eine kompakte Nachrichten-Zusammenfassung. */
export interface NewsSnippet {
  title: string;
  url: string;
  source: string;
  summary: string;
}

/** Empfehlung mit Link + Begründung (Tool/Podcast/Video/Read of the Week). */
export interface Recommendation {
  title: string;
  url: string;
  description: string;
  why: string;
}

export interface PromptOfTheWeek {
  title: string;
  prompt: string;
  explanation: string;
}

export interface ImagePromptTraining {
  title: string;
  concept: string;
  promptTemplate: string;
  examplePrompt: string;
}

export interface DeepDive {
  topic: string;
  intro: string;
  steps: string[];
  takeaways: string[];
}

/** Kompletter Newsletter-Entwurf (Output-Schema Phase 2). */
export interface NewsletterDraft {
  issueDate: string;
  title: string;
  intro: string;
  newsSnippets: NewsSnippet[];
  toolOfTheWeek: Recommendation | null;
  promptOfTheWeek: PromptOfTheWeek;
  imagePromptTraining: ImagePromptTraining;
  deepDive: DeepDive;
  podcastOfTheWeek: Recommendation | null;
  videoOfTheWeek: Recommendation | null;
  readOfTheWeek: Recommendation | null;
  generatedAt: string;
  llmUsed: string[];
}

/** Landing-Page-Texte (Asset-Generierung Phase 3). */
export interface LandingTexts {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  features: { title: string; description: string }[];
  pricing: {
    free: { title: string; description: string; features: string[] };
    paid: { title: string; description: string; price: string; features: string[] };
  };
  faq: { question: string; answer: string }[];
}

/** Ein einzelner QA-Befund (Phase 4). */
export interface QaIssue {
  severity: "error" | "warning" | "info";
  section: string;
  message: string;
  url?: string;
}

/** QA-Report pro Ausgabe (Phase 4). */
export interface QaReport {
  issueDate: string;
  checkedAt: string;
  passed: boolean;
  errorCount: number;
  warningCount: number;
  issues: QaIssue[];
  llmUsed: string[];
}
