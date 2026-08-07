import type { ReactNode } from "react";
import Link from "next/link";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
          AI Newsletter
        </Link>{" "}
        — Legal
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Stand: {updated}</p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-zinc-700 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-zinc-900 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_a]:underline [&_a:hover]:text-zinc-900 dark:[&_h2]:text-zinc-100 dark:[&_h3]:text-zinc-100 dark:[&_a:hover]:text-zinc-100 dark:[&_p]:text-zinc-300 dark:[&_ul]:text-zinc-300 dark:[&_ol]:text-zinc-300">
        {children}
      </div>
    </main>
  );
}
