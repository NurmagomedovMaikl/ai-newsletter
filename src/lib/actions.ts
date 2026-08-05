"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export type ActionResult = { error?: string; ok?: string };

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signIn(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "E-Mail und Passwort sind erforderlich." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "E-Mail und Passwort sind erforderlich." };
  if (password.length < 8) return { error: "Passwort muss mindestens 8 Zeichen lang sein." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  // E-Mail-Bestätigung aktiv → Link-Mail; sonst direkt eingeloggt.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
  return { ok: "Fast geschafft — wir haben dir eine Bestätigungs-E-Mail geschickt." };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updatePreferences(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSession();
  if (!user) return { error: "Bitte zuerst anmelden." };

  const frequency = String(formData.get("frequency") ?? "weekly");
  const format = String(formData.get("format") ?? "full");
  const topics = formData
    .getAll("topics")
    .map((t) => String(t).trim())
    .filter(Boolean);

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ email_preferences: { frequency, topics, format } })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: "Einstellungen gespeichert." };
}
