import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCustomerPortalUrl, storeBillingUrl } from "@/lib/lemonsqueezy";

/** Öffnet das LemonSqueezy-Customer-Portal für eine eigene Subscription (signed URL). */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${request.nextUrl.origin}/login`);

  const subscriptionId = request.nextUrl.searchParams.get("subscription");
  if (!subscriptionId) {
    return NextResponse.json({ error: "subscription-Parameter fehlt." }, { status: 400 });
  }

  // Nur eigene Subscriptions: RLS-Check über den User-Kontext.
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("profile_id", user.id)
    .eq("lemonsqueezy_subscription_id", subscriptionId)
    .maybeSingle();
  if (!data) {
    return NextResponse.json({ error: "Subscription nicht gefunden." }, { status: 404 });
  }

  const signedUrl = await getCustomerPortalUrl(subscriptionId);
  const target = signedUrl ?? storeBillingUrl();
  if (!target) {
    return NextResponse.json(
      { error: "LemonSqueezy ist noch nicht konfiguriert (LEMONSQUEEZY_API_KEY/STORE_URL)." },
      { status: 501 },
    );
  }
  return NextResponse.redirect(target);
}
