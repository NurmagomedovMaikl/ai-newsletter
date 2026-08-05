import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "svix";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Resend-Webhook (Svix-signiert): markiert `newsletter_deliveries` als bounced,
 * wenn eine Zustellung abprallt. Signatur-Key: RESEND_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "RESEND_WEBHOOK_SECRET fehlt in .env." }, { status: 501 });
  }

  const rawBody = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Signatur-Header fehlen." }, { status: 401 });
  }

  let payload: { type?: string; data?: { to?: string[] } };
  try {
    payload = new Webhook(secret).verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Ungültige Signatur." }, { status: 401 });
  }

  if (payload.type !== "email.bounced") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const to = payload.data?.to?.[0];
  if (!to) return NextResponse.json({ ok: true, ignored: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const auth = createSupabaseClient(url, key, {
    db: { schema: "auth" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: user } = await auth.from("users").select("id").eq("email", to).limit(1).maybeSingle();
  if (!user) return NextResponse.json({ ok: true, ignored: "user not found" });

  const service = createServiceClient();
  await service
    .from("newsletter_deliveries")
    .update({ status: "bounced" })
    .eq("profile_id", user.id as string)
    .in("status", ["pending", "sent"]);

  return NextResponse.json({ ok: true });
}
