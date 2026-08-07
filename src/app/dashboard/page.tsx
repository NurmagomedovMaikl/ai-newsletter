import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { PreferencesForm } from "@/components/preferences-form";
import { lemonsqueezyConfigured, storeBillingUrl } from "@/lib/lemonsqueezy";
import type { SubscriptionRow } from "@/lib/db-types";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  on_trial: "Trial",
  cancelled: "Cancelled",
  expired: "Expired",
  paused: "Paused",
};

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  const { data: rawSubscriptions } = await supabase
    .from("subscriptions")
    .select("id, profile_id, lemonsqueezy_subscription_id, status, plan_variant, current_period_end, ends_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  const subscriptions = (rawSubscriptions ?? []) as SubscriptionRow[];

  const active = subscriptions.filter((s) => ["active", "on_trial"].includes(s.status));
  const inactive = subscriptions.filter((s) => !["active", "on_trial"].includes(s.status));
  const isPaid = profile?.plan === "paid" || active.length > 0;
  const lsConfigured = lemonsqueezyConfigured();
  const fallbackBillingUrl = storeBillingUrl();
  const prefs = (profile?.email_preferences ?? {}) as Record<string, unknown>;
  const isUnsubscribed = prefs.format === "unsubscribed";

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
        {isPaid && !lsConfigured && (
          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            LemonSqueezy ist noch nicht konfiguriert — Abo-Verwaltung kommt, sobald die API-Keys hinterlegt sind.
          </p>
        )}
      </section>

      {/* Subscriptions */}
      <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">Subscription</h2>
        {subscriptions.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No subscription yet. Upgrade to Premium to unlock the full archive and every exclusive segment.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {active.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sub.plan_variant || "Premium subscription"}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                      {STATUS_LABEL[sub.status] ?? sub.status}
                    </span>
                  </div>
                  {sub.current_period_end && (
                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                      Renews {new Date(sub.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {sub.lemonsqueezy_subscription_id && (
                  <Link
                    href={`/api/portal?subscription=${sub.lemonsqueezy_subscription_id}`}
                    className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Manage
                  </Link>
                )}
              </li>
            ))}
            {inactive.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sub.plan_variant || "Premium subscription"}</p>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {STATUS_LABEL[sub.status] ?? sub.status}
                    </span>
                  </div>
                  {sub.ends_at && (
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {sub.status === "cancelled" ? "Access until" : "Ended"}{" "}
                      {new Date(sub.ends_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {sub.lemonsqueezy_subscription_id && (lsConfigured || fallbackBillingUrl) && (
                  <Link
                    href={`/api/portal?subscription=${sub.lemonsqueezy_subscription_id}`}
                    className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
                  >
                    View billing
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
        {isPaid && !lsConfigured && (
          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            LemonSqueezy-Keys fehlen — Portal-Verwaltung aktiviert sich, sobald sie hinterlegt sind.
          </p>
        )}
      </section>

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
        {isUnsubscribed && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            You&apos;re currently unsubscribed from emails. Set the email format to &quot;Full issue&quot;
            or &quot;Teaser (free)&quot; below and save to start receiving issues again.
          </p>
        )}
        <div className="mt-5">
          <PreferencesForm email_preferences={profile?.email_preferences} />
        </div>
      </section>
    </main>
  );
}
