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

/** Best-Effort: Fehler-Notification an ADMIN_EMAIL (Pipeline-Abbruch). Wirft nie. */
export async function notifyAdminOnErrorIfConfigured(message: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!emailConfigured() || !adminEmail) return;
  try {
    await sendEmail({
      to: adminEmail,
      subject: "[AI Newsletter] Pipeline-Fehler",
      html: `<p>Die Pipeline ist fehlgeschlagen:</p><pre>${message.replace(/</g, "&lt;")}</pre>`,
      text: `Die Pipeline ist fehlgeschlagen:\n${message}`,
    });
  } catch (err) {
    console.warn("[EMAIL] Fehler-Notification fehlgeschlagen:", (err as Error).message);
  }
}
