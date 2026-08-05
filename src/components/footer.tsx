import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-500 sm:flex-row sm:px-6 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} AI Newsletter. Weekly insights, curated by AI.</p>
        <nav className="flex items-center gap-4">
          <Link href="/#pricing" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
            Pricing
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
            FAQ
          </Link>
          <Link href="/issues" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
            Issues
          </Link>
        </nav>
      </div>
    </footer>
  );
}
