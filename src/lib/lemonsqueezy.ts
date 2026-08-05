import { createHmac, timingSafeEqual } from "node:crypto";

const LS_API = "https://api.lemonsqueezy.com/v1";

export function lemonsqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_STORE_ID &&
      process.env.LEMONSQUEEZY_VARIANT_ID,
  );
}

interface CheckoutOptions {
  email: string;
  userId: string;
  redirectUrl: string;
  storeId?: string;
  variantId?: string;
}

/** Erstellt einen LemonSqueezy-Checkout und liefert die Checkout-URL. */
export async function createCheckout(options: CheckoutOptions): Promise<string | null> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) return null;

  const storeId = options.storeId ?? process.env.LEMONSQUEEZY_STORE_ID!;
  const variantId = options.variantId ?? process.env.LEMONSQUEEZY_VARIANT_ID!;

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: options.email,
          custom: { user_id: options.userId },
        },
        product_options: { redirect_url: options.redirectUrl },
      },
      relationships: {
        store: { data: { type: "stores", id: storeId } },
        variant: { data: { type: "variants", id: variantId } },
      },
    },
  };

  const res = await fetch(`${LS_API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LemonSqueezy Checkout fehlgeschlagen (${res.status}): ${text}`);
  }
  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
  };
  return json.data?.attributes?.url ?? null;
}

/** Verifiziert die HMAC-SHA256-Signatur eines LemonSqueezy-Webhooks. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
