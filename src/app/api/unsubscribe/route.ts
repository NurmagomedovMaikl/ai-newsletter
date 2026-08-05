import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

/** Abmelden per signiertem Link aus der E-Mail. Setzt format=unsubscribed. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  if (!token) {
    return NextResponse.json({ error: "Token fehlt." }, { status: 400 });
  }

  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Ungültiger oder abgelaufener Link." }, { status: 400 });
  }

  const service = createServiceClient();
  await service
    .from("profiles")
    .update({ email_preferences: { frequency: "weekly", topics: [], format: "unsubscribed" } })
    .eq("id", userId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${siteUrl}/?unsubscribed=1`);
}
