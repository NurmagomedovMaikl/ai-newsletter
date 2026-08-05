import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createCheckout, lemonsqueezyConfigured } from "@/lib/lemonsqueezy";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Erstellt einen LemonSqueezy-Checkout und leitet den User weiter. */
export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl()}/login`);

  if (!lemonsqueezyConfigured()) {
    return NextResponse.json(
      { error: "LemonSqueezy ist noch nicht konfiguriert (LEMONSQUEEZY_API_KEY/STORE_ID/VARIANT_ID)." },
      { status: 501 },
    );
  }

  const url = await createCheckout({
    email: user.email ?? "",
    userId: user.id,
    redirectUrl: `${siteUrl()}/dashboard`,
  });
  if (!url) {
    return NextResponse.json({ error: "Checkout konnte nicht erstellt werden." }, { status: 500 });
  }
  return NextResponse.redirect(url);
}
