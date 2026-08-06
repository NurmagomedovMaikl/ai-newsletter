import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { createServiceClient } from "@/lib/supabase/server";
import { sendUpgradeEmailIfConfigured } from "@/lib/email-flows";

interface LsSubscriptionAttributes {
  customer_email: string;
  status: string;
  variant_name: string | null;
  renews_at: string | null;
}

interface LsData {
  id: string;
  attributes: LsSubscriptionAttributes;
}

interface LsPayload {
  meta?: { event_name?: string };
  data?: LsData;
}

const LS_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_expired",
  "subscription_paused",
]);

function mapStatus(status: string): string {
  switch (status) {
    case "on_trial":
      return "on_trial";
    case "active":
      return "active";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "cancelled";
  }
}

/** Service-Client mit Zugriff auf die Auth-Admin-API (User-E-Mail → profile_id). */
function authClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data } = await authClient().auth.admin.listUsers({ perPage: 1000, page: 1 });
  return data?.users.find((u) => u.email === email)?.id ?? null;
}

async function syncSubscription(service: SupabaseClient, data: LsData, status: string) {
  const userId = await findUserIdByEmail(data.attributes.customer_email);
  if (!userId) {
    console.warn(`[WEBHOOK] Kein User für E-Mail ${data.attributes.customer_email}`);
    return;
  }
  await service.from("subscriptions").upsert(
    {
      profile_id: userId,
      lemonsqueezy_subscription_id: data.id,
      status,
      plan_variant: data.attributes.variant_name,
      current_period_end: data.attributes.renews_at,
    },
    { onConflict: "lemonsqueezy_subscription_id" },
  );

  if (status === "active" || status === "on_trial") {
    await service.from("profiles").update({ plan: "paid" }).eq("id", userId);
    await sendUpgradeEmailIfConfigured(data.attributes.customer_email);
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature") ?? "";
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LsPayload;
  const eventName = payload.meta?.event_name;
  const data = payload.data;
  if (!eventName || !data || !LS_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const service = createServiceClient() as SupabaseClient;
  const status = mapStatus(data.attributes.status);

  if (eventName === "subscription_cancelled" || eventName === "subscription_expired" || eventName === "subscription_paused") {
    await service
      .from("subscriptions")
      .update({ status })
      .eq("lemonsqueezy_subscription_id", data.id);
    // Plan auf free setzen, sofern keine andere aktive Subscription existiert.
    const { count } = await service
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", (await findUserIdByEmail(data.attributes.customer_email)) ?? "")
      .in("status", ["active", "on_trial"]);
    if ((count ?? 0) === 0) {
      const userId = await findUserIdByEmail(data.attributes.customer_email);
      if (userId) await service.from("profiles").update({ plan: "free" }).eq("id", userId);
    }
  } else {
    await syncSubscription(service, data, status);
  }

  return NextResponse.json({ ok: true });
}
