import type { SourceConfig } from "@/lib/types";

/**
 * Zentrale Quellen-Konfiguration für die Recherche.
 * Neue Quellen hier ergänzen (id muss eindeutig sein).
 */
export const SOURCES: SourceConfig[] = [
  // --- RSS-Feeds (kein API-Key nötig) ---
  {
    id: "techcrunch-ai",
    type: "rss",
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    enabled: true,
    category: ["general"],
  },
  {
    id: "theverge-ai",
    type: "rss",
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    enabled: true,
    category: ["general"],
  },
  {
    id: "mit-ai",
    type: "rss",
    name: "MIT Technology Review AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    enabled: true,
    category: ["general"],
  },
  {
    id: "venturebeat-ai",
    type: "rss",
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    enabled: true,
    category: ["general"],
  },
  {
    id: "wired-ai",
    type: "rss",
    name: "Wired AI",
    url: "https://www.wired.com/feed/tag/ai/latest/rss",
    enabled: true,
    category: ["general"],
  },
  {
    id: "arstechnica-ai",
    type: "rss",
    name: "Ars Technica AI",
    url: "https://arstechnica.com/ai/feed/",
    enabled: true,
    category: ["general"],
  },
  {
    id: "google-news-ai",
    type: "rss",
    name: "Google News AI",
    url: "https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en",
    enabled: true,
    category: ["general"],
  },
  {
    id: "producthunt-ai",
    type: "rss",
    name: "ProductHunt — AI Tools",
    url: "https://www.producthunt.com/feed?category=artificial-intelligence",
    enabled: true,
    category: ["tools"],
  },

  // --- HackerNews (offene API, kein Key nötig) ---
  {
    id: "hackernews",
    type: "hackernews",
    name: "Hacker News",
    url: "https://hacker-news.firebaseio.com/v0/",
    enabled: true,
    category: ["general"],
    daysBack: 7,
    minScore: 50,
  },

  // --- Reddit via RSS (JSON-API liefert 403 ohne OAuth) ---
  {
    id: "reddit-artificial",
    type: "rss",
    name: "Reddit r/artificial",
    url: "https://www.reddit.com/r/artificial/.rss",
    enabled: true,
    category: ["general"],
    daysBack: 7,
  },
  {
    id: "reddit-localLLaMA",
    type: "rss",
    name: "Reddit r/LocalLLaMA",
    url: "https://www.reddit.com/r/LocalLLaMA/.rss",
    enabled: true,
    category: ["general"],
    daysBack: 7,
  },
  {
    id: "reddit-MachineLearning",
    type: "rss",
    name: "Reddit r/MachineLearning",
    url: "https://www.reddit.com/r/MachineLearning/.rss",
    enabled: true,
    category: ["general"],
    daysBack: 7,
  },

  // --- NewsAPI (optional, nur wenn NEWSAPI_KEY gesetzt) ---
  {
    id: "newsapi-ai",
    type: "newsapi",
    name: "NewsAPI AI",
    url: "https://newsapi.org/v2/everything",
    enabled: true,
    category: ["general"],
  },
];
