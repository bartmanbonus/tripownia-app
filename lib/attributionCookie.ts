/**
 * First-party, short-lived source attribution for affiliate exits.
 * Written only after analytics consent. It deliberately stores no identifiers,
 * search phrases, email addresses or full referral URLs.
 */
export const AFFILIATE_ATTRIBUTION_COOKIE = "tripownia-affiliate-attribution-v1";
export const AFFILIATE_ATTRIBUTION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type AffiliateVisitAttribution = {
  source: string;
  medium: string;
  landing: string;
  capturedAt: string;
};

export function parseAffiliateVisitAttribution(
  value: string | null | undefined,
  now = Date.now(),
): AffiliateVisitAttribution | null {
  if (!value || value.length > 1500) return null;

  try {
    const raw: unknown = JSON.parse(decodeURIComponent(value));
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const item = raw as Record<string, unknown>;
    const source = typeof item.source === "string" ? item.source.toLowerCase().trim() : "";
    const medium = typeof item.medium === "string" ? item.medium.toLowerCase().trim() : "";
    const landing = typeof item.landing === "string" ? item.landing.trim() : "";
    const capturedAt = typeof item.capturedAt === "string" ? item.capturedAt : "";
    const capturedMs = Date.parse(capturedAt);

    if (!/^[a-z0-9][a-z0-9._-]{0,79}$/.test(source)) return null;
    if (medium.length > 80 || (medium && !/^[a-z0-9_().-]+$/.test(medium))) return null;
    if (!landing.startsWith("/") || landing.startsWith("//") || landing.length > 180 || /[\r\n]/.test(landing)) return null;
    if (!Number.isFinite(capturedMs) || capturedMs > now + 5 * 60 * 1000
      || now - capturedMs > AFFILIATE_ATTRIBUTION_MAX_AGE_MS) return null;

    return { source, medium, landing, capturedAt };
  } catch {
    return null;
  }
}
