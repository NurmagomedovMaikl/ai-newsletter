import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";
import { emailConfigured, sendEmail } from "@/lib/email";
import { renderIssueEmail } from "@/lib/email-render";
import { signUnsubscribeToken } from "@/lib/unsubscribe";
import type { IssueContentRow, IssueRow } from "@/lib/db-types";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Service-Client mit Zugriff auf das auth-Schema (User-E-Mail). */
function authClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: "auth" },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

interface Recipient {
  userId: string;
  email: string;
  paid: boolean;
  unsubscribed: boolean;
}

async function collectRecipients(service: SupabaseClient): Promise<Recipient[]> {
  const { data: usersRaw } = await authClient()
    .from("users")
    .select("id, email")
    .not("email", "is", null);
  const users = (usersRaw ?? []) as { id: string; email: string }[];

  const { data: profilesRaw } = await service
    .from("profiles")
    .select("id, plan, email_preferences");
  const profiles = (profilesRaw ?? []) as {
    id: string;
    plan: string;
    email_preferences?: Record<string, unknown>;
  }[];

  const { data: activeSubsRaw } = await service
    .from("subscriptions")
    .select("profile_id")
    .in("status", ["active", "on_trial"]);
  const activeSubs = (activeSubsRaw ?? []) as { profile_id: string }[];

  const paidIds = new Set(activeSubs.map((s) => s.profile_id));
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const recipients: Recipient[] = [];
  for (const user of users) {
    const profile = profileMap.get(user.id);
    if (!profile) continue;
    const prefs = profile.email_preferences ?? {};
    if (prefs.format === "unsubscribed") continue;
    recipients.push({
      userId: user.id,
      email: user.email,
      paid: profile.plan === "paid" || paidIds.has(user.id),
      unsubscribed: false,
    });
  }
  return recipients;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET fehlt in .env." }, { status: 501 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) {
    return NextResponse.json({ error: "RESEND_API_KEY / NEWSLETTER_FROM_EMAIL fehlen in .env." }, { status: 501 });
  }

  const service = createServiceClient();

  const { data: issue } = await service
    .from("issues")
    .select("id, issue_date, title, status, published_at")
    .eq("status", "published")
    .order("issue_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!issue) {
    return NextResponse.json({ ok: true, skipped: "no published issue" });
  }

  const { data: allSegments } = await service
    .from("issue_content")
    .select("id, issue_id, segment_key, content, paid_only, sort_order")
    .eq("issue_id", issue.id)
    .order("sort_order", { ascending: true });
  if (!allSegments || allSegments.length === 0) {
    return NextResponse.json({ ok: true, skipped: "issue has no content" });
  }

  const { data: alreadyDelivered } = await service
    .from("newsletter_deliveries")
    .select("profile_id")
    .eq("issue_id", issue.id);
  const deliveredIds = new Set((alreadyDelivered ?? []).map((d) => d.profile_id as string));

  const recipients = await collectRecipients(service);
  const results = { sent: 0, failed: 0, skippedAlready: 0, skippedUnsubscribed: 0 };
  const errors: string[] = [];

  for (const rec of recipients) {
    if (deliveredIds.has(rec.userId)) {
      results.skippedAlready++;
      continue;
    }

    const segments = rec.paid
      ? (allSegments as IssueContentRow[])
      : (allSegments as IssueContentRow[]).filter((s) => !s.paid_only);

    const { subject, html } = renderIssueEmail(
      issue as IssueRow,
      segments,
      `${siteUrl()}/api/unsubscribe?t=${encodeURIComponent(signUnsubscribeToken(rec.userId))}`,
      siteUrl(),
    );

    const { error: insertError } = await service.from("newsletter_deliveries").insert({
      issue_id: issue.id,
      profile_id: rec.userId,
      status: "pending",
    });
    if (insertError) {
      errors.push(`${rec.email}: ${insertError.message}`);
      results.failed++;
      continue;
    }

    try {
      await sendEmail({ to: rec.email, subject, html });
      await service
        .from("newsletter_deliveries")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("issue_id", issue.id)
        .eq("profile_id", rec.userId);
      results.sent++;
    } catch (err) {
      await service
        .from("newsletter_deliveries")
        .update({ status: "failed" })
        .eq("issue_id", issue.id)
        .eq("profile_id", rec.userId);
      errors.push(`${rec.email}: ${(err as Error).message}`);
      results.failed++;
    }
  }

  return NextResponse.json({ ok: true, issue: issue.issue_date, recipients: recipients.length, results, errors });
}
