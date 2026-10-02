import type { Offer } from "@/lib/offers";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { isOfferExpired } from "@/lib/offerRuntime";
import { isPromotableOffer } from "@/lib/offerValuePolicy";

export type OfferSourceType = "live" | "published_fallback" | "live_unavailable";
export type OfferSelectionMode = "live" | "fallback";

export function isUsableOffer(offer: Offer, mode: OfferSelectionMode) {
  if (!offer || !Number.isFinite(Number(offer.price)) || Number(offer.price) <= 0 || !offer.affiliateUrl) return false;
  if (isOfferExpired(offer)) return false;

  if (mode === "live") {
    return isPromotableOffer(offer) && offer.availabilityStatus === "available";
  }

  return offer.linkMatch !== "unsafe";
}

export function dedupeOffersByIdentity<T extends Offer>(offers: T[], mode: OfferSelectionMode) {
  const unique = new Map<string, T>();

  for (const offer of offers) {
    if (!isUsableOffer(offer, mode)) continue;
    const key = `${offer.partner}:${offer.id}`;
    const current = unique.get(key);
    if (!current || Number(offer.price) < Number(current.price)) unique.set(key, offer);
  }

  return Array.from(unique.values());
}

export function cheapestPerDestination<T extends Offer>(
  offers: T[],
  {
    mode,
    limit = Number.MAX_SAFE_INTEGER,
    tieBreak,
  }: {
    mode: OfferSelectionMode;
    limit?: number;
    tieBreak?: (candidate: T, current: T) => number;
  }
) {
  const best = new Map<string, T>();

  for (const offer of offers) {
    if (!isUsableOffer(offer, mode)) continue;

    const key = touristDestinationKey(offer);
    const current = best.get(key);
    if (
      !current ||
      Number(offer.price) < Number(current.price) ||
      (Number(offer.price) === Number(current.price) && Boolean(tieBreak && tieBreak(offer, current) > 0))
    ) {
      best.set(key, offer);
    }
  }

  return Array.from(best.values())
    .sort((a, b) => Number(a.price) - Number(b.price) || Number(b.score || 0) - Number(a.score || 0))
    .slice(0, limit);
}

export function offerSourceIsLive(sourceType?: string | null) {
  return sourceType === "live";
}

export function offerSourceIsFallback(sourceType?: string | null) {
  return sourceType === "published_fallback" || sourceType === "live_unavailable";
}
