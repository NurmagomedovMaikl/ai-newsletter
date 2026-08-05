import { Resend } from "resend";

let cachedClient: Resend | null = null;

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL);
}

export function resendClient(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY fehlt in .env");
  if (!cachedClient) cachedClient = new Resend(process.env.RESEND_API_KEY);
  return cachedClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Sendet eine E-Mail über Resend. Wirft bei Fehler. */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  if (!from) throw new Error("NEWSLETTER_FROM_EMAIL fehlt in .env");
  const { error } = await resendClient().emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
