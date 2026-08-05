import Link from "next/link";
import Image from "next/image";
import { landingCopy } from "@/lib/landing-copy";
import { getLatestPublishedIssueDate, getIssueByDate, getIssueContent } from "@/lib/issues";

interface IntroContent {
  text?: string;
  headerImageUrl?: string;
  socialImageUrl?: string;
}

interface NewsSegment {
  title?: string;
  url?: string;
  source?: string;
  summary?: string;
}

async function latestIssueTeaser() {
  const latestDate = await getLatestPublishedIssueDate();
  if (!latestDate) return null;
  const issue = await getIssueByDate(latestDate);
  if (!issue) return null;
  const content = await getIssueContent(issue.id);
  const intro = content.find((s) => s.segment_key === "intro")?.content as IntroContent | undefined;
  const news = content.find((s) => s.segment_key === "news")?.content as NewsSegment[] | undefined;
  return { issue, intro, news: (news ?? []).slice(0, 3) };
}

export default async function Home() {
  const teaser = await latestIssueTeaser();

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-24 text-center sm:px-6">
        <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {landingCopy.hero.badge}
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          {landingCopy.hero.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {landingCopy.hero.subheadline}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {landingCopy.hero.cta}
          </Link>
          <Link
            href="/issues"
            className="rounded-full border border-zinc-300 px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {landingCopy.hero.secondaryCta}
          </Link>
        </div>
      </section>

      {/* Latest issue teaser */}
      <section className="border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Latest issue</h2>
          {teaser ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {teaser.intro?.headerImageUrl && (
                <Image
                  src={teaser.intro.headerImageUrl}
                  alt={teaser.issue.title}
                  width={1024}
                  height={576}
                  className="aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
                />
              )}
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{teaser.issue.issue_date}</p>
                <h3 className="mt-1 text-xl font-semibold">{teaser.issue.title}</h3>
                <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">{teaser.intro?.text}</p>
                <ul className="mt-4 space-y-3">
                  {teaser.news.map((n, i) => (
                    <li key={i}>
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                      >
                        {n.title}
                      </a>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {n.summary} — {n.source}
                      </p>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/issues/${teaser.issue.issue_date}`}
                  className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  Read this issue
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              The first issue is being prepared — it lands every Monday morning.
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {landingCopy.features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800"
            >
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Simple pricing</h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            {[landingCopy.pricing.free, landingCopy.pricing.paid].map((plan) => (
              <div
                key={plan.title}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{plan.title}</h3>
                <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-zinc-400">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 rounded-full px-5 py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.title.includes("Premium")
                      ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="mt-8 space-y-6">
          {landingCopy.faq.map((item) => (
            <div key={item.question}>
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
