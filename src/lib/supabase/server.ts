import { createServerClient } from "@supabase/ssr";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { cookies } from "next/headers";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Umgebungsvariable fehlt: ${name} (in .env hinterlegen)`);
  return value;
}

/** Supabase-Client im Server (Server Components / Route Handlers) mit Cookie-Session. */
export async function createServerSupabase(): Promise<ReturnType<typeof createServerClient>> {
  const cookieStore = await cookies();
  return createServerClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Wird von Server Components aus aufgerufen → Cookie-Set ist dort nicht erlaubt,
          // Session wird über Proxy (proxy.ts) aktualisiert. Sicher ignorierbar.
        }
      },
    },
  });
}

/** Service-Role-Client für Admin/Pipeline-Operationen (Service Key nur server-seitig verwenden!). */
export function createServiceClient(): SupabaseClient {
  return createSupabaseClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
