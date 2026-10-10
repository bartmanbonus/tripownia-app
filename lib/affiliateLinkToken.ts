import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { partnerFromUrl } from "@/lib/affiliateJourney";

export type AffiliateLinkIntent = "review" | "exit" | "offer";
export type AffiliateLinkPayload = {
  mode: AffiliateLinkIntent;
  partner: string;
  target: string;
  context: Record<string, string>;
};

const CONTEXT_KEYS = new Set([
  "source", "destination", "offer", "price", "page", "clickId", "return",
  "utmSource", "utmMedium", "utmCampaign", "utmContent", "landing",
  "city", "country", "departure", "nights", "dates", "board", "note", "checkedAt",
  "hotel", "airport", "start", "end",
]);
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

function key() {
  const raw = process.env.TRIPOWNIA_AFFILIATE_LINK_KEY || "";
  if (!/^[a-f\d]{64}$/i.test(raw)) throw new Error("TRIPOWNIA_AFFILIATE_LINK_KEY is not configured");
  return Buffer.from(raw, "hex");
}

export function affiliateLinkContext(input: unknown) {
  const raw = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown> : {};
  const context: Record<string, string> = {};
  for (const [name, value] of Object.entries(raw)) {
    if (!CONTEXT_KEYS.has(name) || typeof value !== "string") continue;
    const cleaned = value.replace(/[\r\n\t]/g, " ").trim().slice(0, name === "return" ? 500 : 180);
    if (cleaned) context[name] = cleaned;
  }
  return context;
}

function validated(payload: AffiliateLinkPayload) {
  if ((payload.mode !== "review" && payload.mode !== "exit" && payload.mode !== "offer") || payload.target.length > 8192) return false;
  return partnerFromUrl(payload.target) === payload.partner;
}

/**
 * Server-side only. AES-GCM encryption avoids exposing affiliate identifiers,
 * destination URLs or query parameters in Tripownia's customer-facing links.
 */
export function sealAffiliateLink(payload: AffiliateLinkPayload) {
  if (!validated(payload)) throw new Error("Invalid affiliate target");
  const normalized = {
    v: 1,
    iat: Date.now(),
    mode: payload.mode,
    partner: payload.partner,
    target: payload.target,
    context: affiliateLinkContext(payload.context),
  };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const compressed = deflateRawSync(Buffer.from(JSON.stringify(normalized)));
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  return Buffer.concat([Buffer.from([1]), iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openAffiliateLink(value: string): AffiliateLinkPayload | null {
  if (!/^[A-Za-z0-9_-]{40,12000}$/.test(value)) return null;
  try {
    const encoded = Buffer.from(value, "base64url");
    if (encoded.length < 31 || encoded[0] !== 1) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), encoded.subarray(1, 13));
    decipher.setAuthTag(encoded.subarray(13, 29));
    const compressed = Buffer.concat([decipher.update(encoded.subarray(29)), decipher.final()]);
    const parsed = JSON.parse(inflateRawSync(compressed, { maxOutputLength: 20_000 }).toString("utf8"));
    if (parsed.v !== 1 || !Number.isFinite(parsed.iat) || parsed.iat > Date.now() + 300_000
      || Date.now() - parsed.iat > MAX_AGE_MS) return null;
    const payload: AffiliateLinkPayload = {
      mode: parsed.mode,
      partner: parsed.partner,
      target: parsed.target,
      context: affiliateLinkContext(parsed.context),
    };
    return validated(payload) ? payload : null;
  } catch {
    return null;
  }
}

/**
 * Stable compact public reference: HMAC of the encrypted payload. The sealed
 * value remains server-side in Supabase; public URLs never expose it.
 */


const SHORT_REF_PATTERN = /^[A-Za-z0-9_-]{16}$/;

function shortLinkConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wgbzccgcfhnouakswyvj.supabase.co";
  const serviceKey = process.env.TRIPOWNIA_LINK_STORE_KEY || "";
  if (!serviceKey || !/^https:\/\//.test(url)) throw new Error("Short link store is not configured");
  return { url: url.replace(/\/$/, ""), serviceKey };
}

export async function storeAffiliateLink(payload: AffiliateLinkPayload) {
  const sealed = sealAffiliateLink(payload);
  const ref = createHmac("sha256", key()).update(sealed).digest("base64url").slice(0, 16);
  const { url, serviceKey } = shortLinkConfig();
  const response = await fetch(`${url}/rest/v1/tripownia_short_links?on_conflict=ref`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ ref, sealed, expires_at: new Date(Date.now() + MAX_AGE_MS).toISOString() }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Short link store write failed: ${response.status}`);
  return ref;
}

export async function resolveAffiliateLink(ref: string): Promise<AffiliateLinkPayload | null> {
  if (!SHORT_REF_PATTERN.test(ref)) return openAffiliateLink(ref);
  try {
    const { url, serviceKey } = shortLinkConfig();
    const response = await fetch(`${url}/rest/v1/tripownia_short_links?ref=eq.${encodeURIComponent(ref)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=sealed&limit=1`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, cache: "no-store",
    });
    if (!response.ok) return null;
    const rows = await response.json() as Array<{ sealed?: string }>;
    return rows[0]?.sealed ? openAffiliateLink(rows[0].sealed) : null;
  } catch { return null; }
}
