import { createHash } from "node:crypto";

/** Entfernt Tracking-Parameter und normalisiert die URL für stabile IDs. */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    const drop = new Set([
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "ref_src",
      "mc_cid",
      "mc_eid",
    ]);
    for (const key of [...u.searchParams.keys()]) {
      if (drop.has(key)) u.searchParams.delete(key);
    }
    u.hostname = u.hostname.toLowerCase();
    return u.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

/** Stabiler Hash für die Artikel-ID. */
export function hashId(url: string): string {
  return createHash("sha1").update(normalizeUrl(url)).digest("hex").slice(0, 16);
}

/** Normalisierter Titel (klein, ohne Satzzeichen) für Near-Duplicate-Erkennung. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
