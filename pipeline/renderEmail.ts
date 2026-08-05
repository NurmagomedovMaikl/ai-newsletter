import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NewsletterDraft } from "@/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = readFileSync(join(__dirname, "templates", "email_template.html"), "utf8");

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function newsItems(draft: NewsletterDraft): string {
  return draft.newsSnippets
    .map(
      (s) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
          <tr>
            <td>
              <a href="${escapeHtml(s.url)}" style="font-size:16px;font-weight:bold;color:#111827;text-decoration:none;">${escapeHtml(s.title)}</a>
              <p style="margin:4px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(s.summary)}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">${escapeHtml(s.source)}</p>
            </td>
          </tr>
        </table>`,
    )
    .join("");
}

function section(title: string, body: string): string {
  return `
    <tr>
      <td style="padding:24px 32px 8px 32px;">
        <h2 style="margin:0 0 12px 0;font-size:20px;color:#111827;">${escapeHtml(title)}</h2>
        ${body}
      </td>
    </tr>`;
}

function toolBlock(draft: NewsletterDraft): string {
  const t = draft.toolOfTheWeek;
  if (!t) return "";
  return section(
    "Tool of the Week",
    `
      <a href="${escapeHtml(t.url)}" style="font-size:16px;font-weight:bold;color:#2563eb;text-decoration:none;">${escapeHtml(t.title)}</a>
      <p style="margin:6px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(t.description)}</p>
      <p style="margin:6px 0 0 0;font-size:14px;line-height:1.5;color:#374151;"><strong>Why:</strong> ${escapeHtml(t.why)}</p>`,
  );
}

function promptBlock(draft: NewsletterDraft): string {
  const p = draft.promptOfTheWeek;
  return section(
    "Prompt of the Week",
    `
      <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(p.title)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;border-radius:8px;">
        <tr><td style="padding:16px;font-family:monospace;font-size:13px;color:#e5e7eb;line-height:1.5;">${escapeHtml(p.prompt)}</td></tr>
      </table>
      <p style="margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(p.explanation)}</p>`,
  );
}

function imageTrainingBlock(draft: NewsletterDraft): string {
  const t = draft.imagePromptTraining;
  return section(
    "Image Prompt Training",
    `
      <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(t.title)}</p>
      <p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(t.concept)}</p>
      <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;">Template:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;border-radius:8px;">
        <tr><td style="padding:16px;font-family:monospace;font-size:13px;color:#111827;line-height:1.5;">${escapeHtml(t.promptTemplate)}</td></tr>
      </table>
      <p style="margin:10px 0 4px 0;font-size:12px;color:#6b7280;">Example:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;border-radius:8px;">
        <tr><td style="padding:16px;font-family:monospace;font-size:13px;color:#111827;line-height:1.5;">${escapeHtml(t.examplePrompt)}</td></tr>
      </table>`,
  );
}

function deepDiveBlock(draft: NewsletterDraft): string {
  const d = draft.deepDive;
  const steps = d.steps
    .map(
      (s, i) =>
        `<tr><td style="padding:6px 0;font-size:14px;line-height:1.5;color:#374151;"><strong>${i + 1}.</strong> ${escapeHtml(s)}</td></tr>`,
    )
    .join("");
  const takeaways = d.takeaways
    .map(
      (t) =>
        `<tr><td style="padding:4px 0;font-size:14px;line-height:1.5;color:#374151;">&bull; ${escapeHtml(t)}</td></tr>`,
    )
    .join("");
  return section(
    "AI Deep Dive",
    `
      <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(d.topic)}</p>
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(d.intro)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${steps}</table>
      <p style="margin:12px 0 4px 0;font-size:14px;font-weight:bold;color:#111827;">Key takeaways</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${takeaways}</table>`,
  );
}

function extraBlocks(draft: NewsletterDraft): string {
  const items: { title: string; url: string; description: string; why: string; label: string }[] = [];
  if (draft.podcastOfTheWeek) items.push({ ...draft.podcastOfTheWeek, label: "Podcast of the Week" });
  if (draft.videoOfTheWeek) items.push({ ...draft.videoOfTheWeek, label: "Video of the Week" });
  if (draft.readOfTheWeek) items.push({ ...draft.readOfTheWeek, label: "Read of the Week" });
  if (items.length === 0) return "";

  const body = items
    .map(
      (it) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px 0;">
          <tr>
            <td style="width:32%;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;vertical-align:top;">${escapeHtml(it.label)}</td>
            <td>
              <a href="${escapeHtml(it.url)}" style="font-size:15px;font-weight:bold;color:#2563eb;text-decoration:none;">${escapeHtml(it.title)}</a>
              <p style="margin:4px 0 0 0;font-size:13px;line-height:1.5;color:#374151;">${escapeHtml(it.description)}</p>
              <p style="margin:4px 0 0 0;font-size:13px;line-height:1.5;color:#6b7280;">${escapeHtml(it.why)}</p>
            </td>
          </tr>
        </table>`,
    )
    .join("");
  return section("Worth Your Time", body);
}

export function renderEmail(
  draft: NewsletterDraft,
  headerImageUrl: string,
  unsubscribeUrl = "#",
  headerAlt = `AI Newsletter — ${draft.title}`,
): string {
  return TEMPLATE.replace("{{EMAIL_TITLE}}", escapeHtml(draft.title))
    .replace("{{PREHEADER}}", escapeHtml(`This week: ${draft.title}`))
    .replace("{{HEADER_IMAGE_URL}}", headerImageUrl)
    .replace("{{HEADER_ALT}}", escapeHtml(headerAlt))
    .replace("{{TITLE}}", escapeHtml(draft.title))
    .replace("{{INTRO}}", escapeHtml(draft.intro))
    .replace("{{NEWS_ITEMS}}", newsItems(draft))
    .replace("{{TOOL_BLOCK}}", toolBlock(draft))
    .replace("{{PROMPT_BLOCK}}", promptBlock(draft))
    .replace("{{IMAGE_TRAINING_BLOCK}}", imageTrainingBlock(draft))
    .replace("{{DEEP_DIVE_BLOCK}}", deepDiveBlock(draft))
    .replace("{{EXTRA_BLOCKS}}", extraBlocks(draft))
    .replace("{{UNSUBSCRIBE_URL}}", unsubscribeUrl);
}
