import { createServerSupabase } from "./supabase/server";
import type { User } from "@supabase/supabase-js";

/** Aktuelle Session (User) aus dem Server-Kontext, oder null. */
export async function getSession(): Promise<User | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Aktuelle Session — wirft, wenn nicht angemeldet (für geschützte Routen). */
export async function requireUser(): Promise<User> {
  const user = await getSession();
  if (!user) throw new Error("Nicht angemeldet.");
  return user;
}

export interface Profile {
  id: string;
  full_name: string | null;
  plan: "free" | "paid";
  email_preferences: Record<string, unknown>;
  created_at: string;
}

/** Profil des aktuellen Users laden (RLS: nur eigenes Profil). */
export async function getProfile(): Promise<Profile | null> {
  const user = await getSession();
  if (!user) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

/** Prüft, ob ein User aktuell zahlender Abonnent ist (server-seitig). */
export async function isPaidUser(): Promise<boolean> {
  const user = await getSession();
  if (!user) return false;
  const profile = await getProfile();
  if (profile?.plan === "paid") return true;
  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .in("status", ["active", "on_trial"]);
  return (count ?? 0) > 0;
}
