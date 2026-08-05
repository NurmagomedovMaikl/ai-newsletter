import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signOut } from "@/lib/actions";

export async function Header() {
  const user = await getSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
            AI
          </span>
          AI Newsletter
        </Link>

        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/issues" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
            Issues
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-4 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-zinc-900 px-4 py-1.5 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Subscribe
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
