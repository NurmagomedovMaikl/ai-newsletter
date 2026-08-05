import type { IssueContentRow, IssueRow } from "@/lib/db-types";

interface IntroContent {
  text?: string;
  headerImageUrl?: string;
}

interface NewsSegment {
  title?: string;
  url?: string;
  source?: string;
  summary?: string;
}

interface Recommendation {
  title?: string;
  url?: string;
  description?: string;
  why?: string;
}

interface PromptOfTheWeek {
  title?: string;
  prompt?: string;
  explanation?: string;
}

interface ImagePromptTraining {
  title?: string;
  concept?: string;
  promptTemplate?: string;
  examplePrompt?: string;
}

interface DeepDive {
  topic?: string;
  intro?: string;
  steps?: string[];
  takeaways?: string[];
}

const PAID_LABEL = "✨ PREMIUM";

function escapeHtml(text: unknown): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function block(title: string, body: string): string {
  return `
    <tr><td style="padding:24px 32px 8px 32px;">
      <h2 style="margin:0 0 12px 0;font-size:20px;color:#111827;">${escapeHtml(title)}</h2>
      ${body}
    </td></tr>`;
}

function newsBody(items: NewsSegment[]): string {
  return items
    .map(
      (s) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr><td>
          <a href="${escapeHtml(s.url)}" style="font-size:16px;font-weight:bold;color:#111827;text-decoration:none;">${escapeHtml(s.title)}</a>
          <p style="margin:4px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(s.summary)}</p>
          <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">${escapeHtml(s.source)}</p>
        </td></tr>
      </table>`,
    )
    .join("");
}

function recommendationBody(rec: Recommendation | null | undefined): string {
  if (!rec) return "";
  return `
    <a href="${escapeHtml(rec.url)}" style="font-size:16px;font-weight:bold;color:#2563eb;text-decoration:none;">${escapeHtml(rec.title)}</a>
    <p style="margin:6px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(rec.description)}</p>
    <p style="margin:6px 0 0 0;font-size:14px;line-height:1.5;color:#374151;"><strong>Why:</strong> ${escapeHtml(rec.why)}</p>`;
}

function codeBlock(label: string, code: string | undefined): string {
  return `
    <p style="margin:10px 0 4px 0;font-size:12px;color:#6b7280;">${escapeHtml(label)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;border-radius:8px;">
      <tr><td style="padding:16px;font-family:monospace;font-size:13px;color:#111827;line-height:1.5;">${escapeHtml(code)}</td></tr>
    </table>`;
}

function renderSegmentHtml(seg: IssueContentRow): string {
  const content = seg.content as Record<string, unknown>;
  switch (seg.segment_key) {
    case "intro":
      return "";
    case "news":
      return block("Top AI news", newsBody(content as unknown as NewsSegment[]));
    case "tool":
      return block("Tool of the Week", recommendationBody(content as Recommendation));
    case "prompt": {
      const p = content as PromptOfTheWeek;
      return block(
        `Prompt of the Week ${PAID_LABEL}`,
        `<p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(p.title)}</p>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;border-radius:8px;">
           <tr><td style="padding:16px;font-family:monospace;font-size:13px;color:#e5e7eb;line-height:1.5;">${escapeHtml(p.prompt)}</td></tr>
         </table>
         <p style="margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(p.explanation)}</p>`,
      );
    }
    case "image_training": {
      const t = content as ImagePromptTraining;
      return block(
        `Image Prompt Training ${PAID_LABEL}`,
        `<p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(t.title)}</p>
         <p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(t.concept)}</p>
         ${codeBlock("Template", t.promptTemplate)}
         ${codeBlock("Example", t.examplePrompt)}`,
      );
    }
    case "deep_dive": {
      const d = content as DeepDive;
      const steps = (d.steps ?? [])
        .map(
          (s, i) =>
            `<tr><td style="padding:6px 0;font-size:14px;line-height:1.5;color:#374151;"><strong>${i + 1}.</strong> ${escapeHtml(s)}</td></tr>`,
        )
        .join("");
      const takeaways = (d.takeaways ?? [])
        .map(
          (t) =>
            `<tr><td style="padding:4px 0;font-size:14px;line-height:1.5;color:#374151;">&bull; ${escapeHtml(t)}</td></tr>`,
        )
        .join("");
      return block(
        `AI Deep Dive ${PAID_LABEL}`,
        `<p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(d.topic)}</p>
         <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(d.intro)}</p>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${steps}</table>
         <p style="margin:12px 0 4px 0;font-size:14px;font-weight:bold;color:#111827;">Key takeaways</p>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${takeaways}</table>`,
      );
    }
    case "podcast":
      return block(`Podcast of the Week ${PAID_LABEL}`, recommendationBody(content as Recommendation));
    case "video":
      return block(`Video of the Week ${PAID_LABEL}`, recommendationBody(content as Recommendation));
    case "read":
      return block(`Read of the Week ${PAID_LABEL}`, recommendationBody(content as Recommendation));
  }
}

export interface RenderedIssueEmail {
  subject: string;
  html: string;
}

export function renderIssueEmail(
  issue: IssueRow,
  segments: IssueContentRow[],
  unsubscribeUrl: string,
  siteUrl: string,
): RenderedIssueEmail {
  const intro = segments.find((s) => s.segment_key === "intro")?.content as IntroContent | undefined;
  const body = segments.map(renderSegmentHtml).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f9fafb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
    <tr><td align="center" style="padding:32px 0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
        ${intro?.headerImageUrl ? `<tr><td><img src="${escapeHtml(intro.headerImageUrl)}" alt="AI Newsletter header" width="600" style="display:block;width:100%;height:auto;" /></td></tr>` : ""}
        <tr><td style="padding:32px 32px 8px 32px;">
          <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;">${escapeHtml(issue.issue_date)}</p>
          <h1 style="margin:0;font-size:24px;color:#111827;">${escapeHtml(issue.title)}</h1>
        </td></tr>
        <tr><td style="padding:16px 32px 8px 32px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(intro?.text)}</p>
        </td></tr>
        ${body}
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px 0;font-size:13px;line-height:1.5;color:#6b7280;">
            You are receiving this email because you subscribed to AI Newsletter.
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">
            <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7280;">Unsubscribe</a> ·
            <a href="${escapeHtml(siteUrl)}" style="color:#6b7280;">Read online</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: `Issue ${issue.issue_date} — ${issue.title}`, html };
}
