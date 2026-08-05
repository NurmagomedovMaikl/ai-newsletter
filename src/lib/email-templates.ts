export interface EmailEnvelope {
  subject: string;
  html: string;
}

function shell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f9fafb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
    <tr><td align="center" style="padding:32px 0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="border-radius:999px;background-color:#111827;">
      <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
    </td></tr>
  </table>`;
}

export function welcomeEmail(name: string, siteUrl: string): EmailEnvelope {
  return {
    subject: "Welcome to AI Newsletter 🎉",
    html: shell(`
      <h1 style="margin:0 0 12px 0;font-size:22px;color:#111827;">Welcome${name ? `, ${name}` : ""}!</h1>
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#374151;">
        You're now subscribed to AI Newsletter. Every Monday morning you'll get the most relevant AI
        news, a tool recommendation and — with the Premium plan — the full archive and exclusive segments.
      </p>
      ${cta(`${siteUrl}/issues`, "Read the latest issue")}
      <p style="margin:0;font-size:13px;color:#6b7280;">Questions or feedback? Just reply to this email.</p>
    `),
  };
}

export function upgradeEmail(siteUrl: string): EmailEnvelope {
  return {
    subject: "You're now a Premium subscriber 💎",
    html: shell(`
      <h1 style="margin:0 0 12px 0;font-size:22px;color:#111827;">Welcome to Premium!</h1>
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#374151;">
        Your upgrade is active. You now have full access to every past issue and all exclusive
        segments — prompt of the week, image prompt training, deep dives and more.
      </p>
      ${cta(`${siteUrl}/issues`, "Open the archive")}
      <p style="margin:0;font-size:13px;color:#6b7280;">You can manage your subscription anytime from your dashboard.</p>
    `),
  };
}
