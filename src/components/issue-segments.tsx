import type { IssueContentRow, SegmentKey } from "@/lib/db-types";
import Image from "next/image";

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

const SECTION_TITLES: Record<SegmentKey, string> = {
  intro: "",
  news: "Top AI news",
  tool: "Tool of the week",
  prompt: "Prompt of the week",
  image_training: "Image prompt training",
  deep_dive: "AI deep dive",
  podcast: "Podcast of the week",
  video: "Video of the week",
  read: "Read of the week",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  if (!title) return <>{children}</>;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function renderIntro(content: IntroContent) {
  return (
    <div>
      {content.headerImageUrl && (
        <Image
          src={content.headerImageUrl}
          alt="Issue header"
          width={1024}
          height={576}
          className="mb-6 aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
        />
      )}
      <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">{content.text}</p>
    </div>
  );
}

function renderNews(items: NewsSegment[]) {
  return (
    <ol className="space-y-6">
      {items.map((item, i) => (
        <li key={i}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
          >
            {i + 1}. {item.title}
          </a>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.summary}</p>
          {item.source && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{item.source}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

function renderRecommendation(rec: Recommendation) {
  return (
    <div>
      <a
        href={rec.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
      >
        {rec.title}
      </a>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{rec.description}</p>
      {rec.why && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Why:</span> {rec.why}
        </p>
      )}
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code?: string }) {
  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderPrompt(p: PromptOfTheWeek) {
  return (
    <div>
      <p className="font-medium">{p.title}</p>
      <CodeBlock label="Prompt" code={p.prompt} />
      {p.explanation && (
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{p.explanation}</p>
      )}
    </div>
  );
}

function renderImageTraining(t: ImagePromptTraining) {
  return (
    <div>
      <p className="font-medium">{t.title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.concept}</p>
      <CodeBlock label="Template" code={t.promptTemplate} />
      <CodeBlock label="Example" code={t.examplePrompt} />
    </div>
  );
}

function renderDeepDive(d: DeepDive) {
  return (
    <div>
      <p className="font-medium">{d.topic}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{d.intro}</p>
      {(d.steps ?? []).length > 0 && (
        <ol className="mt-4 space-y-2">
          {(d.steps ?? []).map((step, i) => (
            <li key={i} className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{i + 1}.</span> {step}
            </li>
          ))}
        </ol>
      )}
      {(d.takeaways ?? []).length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold">Key takeaways</p>
          <ul className="mt-2 space-y-1.5">
            {(d.takeaways ?? []).map((t, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                • {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderSegment(seg: IssueContentRow) {
  const content = seg.content as Record<string, unknown>;
  switch (seg.segment_key) {
    case "intro":
      return renderIntro(content as IntroContent);
    case "news":
      return renderNews(content as unknown as NewsSegment[]);
    case "tool":
    case "podcast":
    case "video":
    case "read":
      return renderRecommendation(content as Recommendation);
    case "prompt":
      return renderPrompt(content as PromptOfTheWeek);
    case "image_training":
      return renderImageTraining(content as ImagePromptTraining);
    case "deep_dive":
      return renderDeepDive(content as DeepDive);
  }
}

export function IssueSegments({ segments }: { segments: IssueContentRow[] }) {
  const intro = segments.find((s) => s.segment_key === "intro");
  const rest = segments.filter((s) => s.segment_key !== "intro");

  return (
    <article>
      {intro && renderSegment(intro)}
      {rest.map((seg) => (
        <Section key={seg.id} title={SECTION_TITLES[seg.segment_key]}>
          {renderSegment(seg)}
        </Section>
      ))}
      {rest.length === 0 && (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          The full issue is available to premium subscribers.
        </p>
      )}
    </article>
  );
}
