"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { sendWelcomeEmailIfConfigured } from "@/lib/email-flows";

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
    await sendWelcomeEmailIfConfigured(email, fullName);
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

/** E-Mail anfordern, um das Passwort zurückzusetzen (Supabase sendet den Link). */
export async function requestPasswordReset(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Bitte gib deine E-Mail ein." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/auth/reset-password`,
  });
  if (error) return { error: error.message };

  // Bewusst neutral formuliert (keine Auskunft über existierende Konten).
  return { ok: "Falls die Adresse registriert ist, haben wir dir einen Link geschickt." };
}

/** Neues Passwort setzen (nur mit gültiger Session, z.B. nach Recovery-Link). */
export async function updatePassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSession();
  if (!user) return { error: "Sitzung abgelaufen — bitte den Reset-Link erneut anfordern." };

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Passwort muss mindestens 8 Zeichen lang sein." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: "Passwort geändert. Du kannst dich jetzt mit dem neuen Passwort anmelden." };
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
