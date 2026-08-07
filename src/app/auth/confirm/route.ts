import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendWelcomeEmailIfConfigured } from "@/lib/email-flows";

/** Bestätigt E-Mail-Links (code- bzw. token_hash-Flow) und leitet weiter. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  const supabase = await createServerSupabase();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(redirectTo);
  } else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error && data.user?.email) {
      if (type === "signup") {
        const name =
          (data.user.user_metadata?.full_name as string | undefined) ?? "";
        await sendWelcomeEmailIfConfigured(data.user.email, name);
      }
      return NextResponse.redirect(redirectTo);
    }
  }
  return NextResponse.redirect(`${request.nextUrl.origin}/login?error=confirm`);
}
