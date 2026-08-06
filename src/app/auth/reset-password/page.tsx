"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, updatePassword } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"checking" | "request" | "reset">("checking");
  const [requestState, requestAction, requestPending] = useActionState(requestPasswordReset, undefined);
  const [resetState, resetAction, resetPending] = useActionState(updatePassword, undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: { id: string } | null } }) => setStep(data.user ? "reset" : "request"))
      .catch(() => setStep("request"));
  }, []);

  if (step === "checking") {
    return (
      <div className="mx-auto w-full max-w-sm px-4 py-20 text-center text-sm text-zinc-500 sm:px-6">
        Bitte warten …
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="mx-auto w-full max-w-sm px-4 py-20 sm:px-6">
        <h1 className="text-center text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Choose a password with at least 8 characters.
        </p>

        <form action={resetAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              New password
            </label>
            <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
          </div>

          {resetState?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {resetState.error}
            </p>
          )}
          {resetState?.ok && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              {resetState.ok}
            </p>
          )}

          <button
            type="submit"
            disabled={resetPending}
            className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {resetPending ? "Please wait…" : "Save new password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-20 sm:px-6">
      <h1 className="text-center text-2xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form action={requestAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>

        {requestState?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {requestState.error}
          </p>
        )}
        {requestState?.ok && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {requestState.ok}
          </p>
        )}

        <button
          type="submit"
          disabled={requestPending}
          className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {requestPending ? "Please wait…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
          Log in
        </Link>
      </p>
    </div>
  );
}
