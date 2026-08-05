import { emailConfigured, sendEmail } from "@/lib/email";
import { upgradeEmail, welcomeEmail } from "@/lib/email-templates";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Best-Effort: Willkommens-Mail nach Registrierung. Wirft nie. */
export async function sendWelcomeEmailIfConfigured(email: string, name?: string): Promise<void> {
  if (!emailConfigured()) return;
  try {
    const { subject, html } = welcomeEmail(name ?? "", siteUrl());
    await sendEmail({ to: email, subject, html });
  } catch (err) {
    console.warn("[EMAIL] Willkommens-Mail fehlgeschlagen:", (err as Error).message);
  }
}

/** Best-Effort: Upgrade-Mail nach aktiver Zahlung. Wirft nie. */
export async function sendUpgradeEmailIfConfigured(email: string): Promise<void> {
  if (!emailConfigured()) return;
  try {
    const { subject, html } = upgradeEmail(siteUrl());
    await sendEmail({ to: email, subject, html });
  } catch (err) {
    console.warn("[EMAIL] Upgrade-Mail fehlgeschlagen:", (err as Error).message);
  }
}
