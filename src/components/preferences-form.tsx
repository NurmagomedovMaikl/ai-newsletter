"use client";

import { useActionState } from "react";
import { updatePreferences } from "@/lib/actions";

const TOPICS = [
  { value: "general", label: "General AI" },
  { value: "agents", label: "Agents & Applications" },
  { value: "models", label: "Models & Research" },
  { value: "business", label: "Business & Industry" },
  { value: "tools", label: "Tools & Products" },
  { value: "policy", label: "Policy & Safety" },
];

export function PreferencesForm({
  email_preferences,
}: {
  email_preferences?: Record<string, unknown>;
}) {
  const [state, formAction, pending] = useActionState(updatePreferences, undefined);
  const prefs = email_preferences ?? {};
  const frequency = typeof prefs.frequency === "string" ? prefs.frequency : "weekly";
  const format = typeof prefs.format === "string" ? prefs.format : "full";
  const topics = Array.isArray(prefs.topics) ? prefs.topics.map(String) : [];

  const inputClass =
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="frequency" className="mb-1.5 block text-sm font-medium">
          Frequency
        </label>
        <select id="frequency" name="frequency" defaultValue={frequency} className={inputClass}>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div>
        <label htmlFor="format" className="mb-1.5 block text-sm font-medium">
          Email format
        </label>
        <select id="format" name="format" defaultValue={format} className={inputClass}>
          <option value="full">Full issue</option>
          <option value="teaser">Teaser (free)</option>
        </select>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium">Topics of interest</span>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const checked = topics.includes(t.value);
            return (
              <label
                key={t.value}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-sm transition-colors has-checked:border-zinc-900 has-checked:bg-zinc-900 has-checked:text-white dark:border-zinc-700 dark:has-checked:border-zinc-100 dark:has-checked:bg-zinc-100 dark:has-checked:text-zinc-900"
              >
                <input
                  type="checkbox"
                  name="topics"
                  value={t.value}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {t.label}
              </label>
            );
          })}
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          {state.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
