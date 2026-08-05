import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedIssues, getLatestPublishedIssueDate } from "@/lib/issues";
import { isPaidUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Archive" };

export default async function IssuesPage() {
  const [issues, latestDate, isPaid] = await Promise.all([
    getPublishedIssues(),
    getLatestPublishedIssueDate(),
    isPaidUser(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Newsletter archive</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {isPaid
          ? "Premium — you have access to every past issue."
          : "Free — you can read the free sections of the latest issue. Older issues are for premium subscribers."}
      </p>

      {issues.length === 0 ? (
        <p className="mt-12 text-zinc-500 dark:text-zinc-400">
          No published issues yet. The first issue lands soon.
        </p>
      ) : (
        <ul className="mt-10 space-y-3">
          {issues.map((issue) => {
            const isLatest = issue.issue_date === latestDate;
            const accessible = isPaid || isLatest;
            return (
              <li
                key={issue.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              >
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{issue.issue_date}</p>
                  <p className="mt-0.5 font-medium">{issue.title}</p>
                </div>
                {accessible ? (
                  <Link
                    href={`/issues/${issue.issue_date}`}
                    className="shrink-0 rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Read
                  </Link>
                ) : (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Premium
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
