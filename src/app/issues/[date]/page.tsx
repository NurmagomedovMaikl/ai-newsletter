import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueByDate, getIssueContent, getLatestPublishedIssueDate } from "@/lib/issues";
import { isPaidUser } from "@/lib/auth";
import { IssueSegments } from "@/components/issue-segments";

interface Params {
  date: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { date } = await params;
  const issue = await getIssueByDate(date);
  if (!issue) return { title: "Issue not found" };
  return { title: `Issue ${issue.issue_date}` };
}

export default async function IssuePage({ params }: { params: Promise<Params> }) {
  const { date } = await params;
  const issue = await getIssueByDate(date);
  if (!issue) notFound();

  const [latestDate, isPaid] = await Promise.all([getLatestPublishedIssueDate(), isPaidUser()]);

  // Archiv-Regel: ältere Ausgaben sind Premium-only.
  const isLatest = issue.issue_date === latestDate;
  if (!isPaid && !isLatest) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{issue.issue_date}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{issue.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
          Past issues are for premium subscribers. Upgrade to unlock the full archive and every
          exclusive segment.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Upgrade to Premium
        </Link>
      </main>
    );
  }

  const segments = await getIssueContent(issue.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{issue.issue_date}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{issue.title}</h1>
      <IssueSegments segments={segments} />
    </main>
  );
}
