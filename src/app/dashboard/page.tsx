import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { PreferencesForm } from "@/components/preferences-form";
import { lemonsqueezyConfigured } from "@/lib/lemonsqueezy";
import type { SubscriptionRow } from "@/lib/db-types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  const { data: rawSubscriptions } = await supabase
    .from("subscriptions")
    .select("id, profile_id, lemonsqueezy_subscription_id, status, plan_variant, current_period_end")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  const subscriptions = (rawSubscriptions ?? []) as SubscriptionRow[];

  const active = (subscriptions ?? []).filter((s) =>
    ["active", "on_trial"].includes(s.status),
  );
  const isPaid = profile?.plan === "paid" || active.length > 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Welcome, {profile?.full_name || user.email}
      </p>

      {/* Plan */}
      <section className="mt-10 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Your plan</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {isPaid ? "Premium — full access to every issue." : "Free — limited access to the latest issue."}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isPaid
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {isPaid ? "Premium" : "Free"}
          </span>
        </div>
        {!isPaid && (
          <Link
            href="/api/checkout"
            className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Upgrade to Premium
          </Link>
        )}
        {isPaid && !lemonsqueezyConfigured() && (
          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            LemonSqueezy ist noch nicht konfiguriert — Abo-Verwaltung kommt, sobald die API-Keys hinterlegt sind.
          </p>
        )}
      </section>

      {/* Subscriptions */}
      {active.length > 0 && (
        <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="font-semibold">Subscription</h2>
          {active.map((sub) => (
            <div key={sub.id} className="mt-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">
                  {sub.plan_variant || "Premium subscription"} · {sub.status}
                </p>
                {sub.current_period_end && (
                  <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
                    Renews {new Date(sub.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <a
                href="https://app.lemonsqueezy.com/my-orders"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
              >
                Manage
              </a>
            </div>
          ))}
        </section>
      )}

      {/* Archive link */}
      <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">Read issues</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Browse the newsletter archive. Free users can read the latest issue&apos;s free sections.
        </p>
        <Link
          href="/issues"
          className="mt-4 inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Open archive
        </Link>
      </section>

      {/* Preferences */}
      <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">Newsletter settings</h2>
        <div className="mt-5">
          <PreferencesForm email_preferences={profile?.email_preferences} />
        </div>
      </section>
    </main>
  );
}
