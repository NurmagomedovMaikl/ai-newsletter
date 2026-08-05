import { createBrowserClient } from "@supabase/ssr";

/** Supabase-Client im Browser (Client Components / hooks). */
export function createClient(): ReturnType<typeof createBrowserClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen in .env");
  return createBrowserClient(url, anonKey);
}
