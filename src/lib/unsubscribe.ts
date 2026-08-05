import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;
}

/** Signiert einen Unsubscribe-Token für einen User (userId.hmac). */
export function signUnsubscribeToken(userId: string): string {
  const sig = createHmac("sha256", secret()).update(userId).digest("hex").slice(0, 32);
  const id = Buffer.from(userId, "utf8").toString("base64url");
  return `${sig}.${id}`;
}

/** Verifiziert den Token und liefert die userId zurück, oder null. */
export function verifyUnsubscribeToken(token: string): string | null {
  const [sig, idB64] = token.split(".");
  if (!sig || !idB64) return null;
  const userId = Buffer.from(idB64, "base64url").toString("utf8");
  const expected = createHmac("sha256", secret()).update(userId).digest("hex").slice(0, 32);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}
