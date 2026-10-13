import type { Offer } from "./offers";
import { normalizeDestinationKey, touristDestinationKey } from "./destinationGrouping";
import { getLinkMatch, isOfferExpired } from "./offerRuntime";

/**
 * The /okazje shelf is editorial, not the complete search catalogue.
 * Never promote unpriced placeholders, stale feeds or a generic destination link.
 * Climate rules are typical seasonal suitability, NOT a weather forecast.
 */
export type EditorialDealKind = "flight" | "city" | "allinclusive" | "holiday" | "exotic";
type DatedOffer = Offer & { startDateISO?: string };
const PRICE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

function destinationText(offer: Offer) {
  return normalizeDestinationKey(String(offer.city || "") + " " + String(offer.country || ""));
}

function hasAllInclusive(offer: Offer) {
  return /all[\s-]*inclusive|ultra[\s-]*all/i.test(offer.board || "");
}

function isExotic(offer: Offer) {
  return /zanzibar|tanzania|kenia|mauritius|malediw|seszel|tajland|wietnam|indonez|bali|sri lanka|dominik|meksyk|kuba|jamaj|japon|brazyl|kolumbi|peru|kostaryk|gambia|wyspy zielonego przyladka|cape verde/.test(destinationText(offer));
}

function isCanaryIsland(offer: Offer) {
  return /teneryf|tenerife|fuerteventura|gran canaria|lanzarote|la gomera|wyspy kanaryjskie/.test(destinationText(offer));
}

export function editorialDealKind(offer: Offer): EditorialDealKind {
  if (offer.category?.includes("flight")) return "flight";
  if (isExotic(offer)) return "exotic";
  if (hasAllInclusive(offer)) return "allinclusive";
  if (offer.nights <= 5) return "city";
  return "holiday";
}

function departureDateISO(offer: DatedOffer): string | null {
  const text = String(offer.startDateISO || offer.dates || "");
  const match = text.match(/20\d{2}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.20\d{2}/);
  if (!match) return null;
  const token = match[0];
  const iso = token.includes(".")
    ? token.split(".").reverse().map((part, index) => index ? part.padStart(2, "0") : part).join("-")
    : token;
  const time = Date.parse(iso + "T00:00:00Z");
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === iso ? iso : null;
}

function warsawToday(now: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(now));
  const part = (kind: string) => parts.find((item) => item.type === kind)?.value || "";
  return part("year") + "-" + part("month") + "-" + part("day");
}

function monthIn(month: number, months: number[]) {
  return months.includes(month);
}

/** Reject beach-package promotions in the cold/rainy season. City sightseeing isn't restricted. */
export function isTypicalBeachSeason(offer: Offer, month: number): boolean {
  if (month < 1 || month > 12) return false;
  const place = destinationText(offer);
  if (/egipt|marsa alam|hurghada|sharm el|dubaj|emiraty|oman/.test(place)) return true;
  if (isCanaryIsland(offer)) return monthIn(month, [4, 5, 6, 7, 8, 9, 10, 11]);
  if (/zanzibar|tanzania/.test(place)) return monthIn(month, [1, 2, 6, 7, 8, 9, 10, 12]);
  if (/mauritius|seszel/.test(place)) return monthIn(month, [4, 5, 6, 7, 8, 9, 10, 11, 12]);
  if (/malediw|sri lanka/.test(place)) return monthIn(month, [1, 2, 3, 4, 12]);
  if (/tajland|thailand/.test(place)) return monthIn(month, [1, 2, 3, 4, 11, 12]);
  if (/bali|indonez/.test(place)) return monthIn(month, [4, 5, 6, 7, 8, 9, 10]);
  if (/wietnam/.test(place)) return monthIn(month, [1, 2, 3, 4, 11, 12]);
  if (/kenia/.test(place)) return monthIn(month, [1, 2, 3, 7, 8, 9, 10]);
  if (/gambia|wyspy zielonego przyladka|cape verde/.test(place)) return monthIn(month, [1, 2, 3, 4, 11, 12]);
  if (/dominik|meksyk|kuba|jamaj/.test(place)) return monthIn(month, [1, 2, 3, 4, 12]);
  if (/cypr|malta/.test(place)) return month >= 4 && month <= 10;
  if (/tunez|djerba|hammamet/.test(place)) return month >= 5 && month <= 10;
  if (/maroko|marrakesz|agadir/.test(place)) return month >= 5 && month <= 11;
  if (/grecj|kreta|rodos|korfu|zakynthos|kos\b/.test(place)) return month >= 5 && month <= 9;
  if (/turcj|antalya|bodrum/.test(place)) return month >= 5 && month <= 10;
  if (/hiszpan|majorka|mallorca|ibiza|minorka/.test(place)) return month >= 5 && month <= 10;
  if (/portug|algarve|madera|madeira/.test(place)) return month >= 5 && month <= 10;
  if (/wloch|sycyl|sardyn/.test(place)) return month >= 5 && month <= 9;
  if (/bulgar|chorw|alban|czarnogor/.test(place)) return month >= 6 && month <= 9;
  return false;
}

function isBeachTrip(offer: Offer) {
  return hasAllInclusive(offer)
    || offer.category?.some((category) => ["plaza", "beach", "beachholiday"].includes(category)) === true;
}

/** Deliberately tighter than search; thresholds are editorial cutoffs, not market averages. */
export function editorialPriceCeiling(offer: Offer) {
  const kind = editorialDealKind(offer);
  if (kind === "flight") return 399;
  if (kind === "city") return 999;
  if (kind === "exotic") return hasAllInclusive(offer) ? 5500 : 4750;
  if (isCanaryIsland(offer)) return hasAllInclusive(offer) ? 2900 : 2250;
  if (/egipt|tunez|djerba|maroko|marrakesz/.test(destinationText(offer))) {
    return hasAllInclusive(offer) ? 2700 : 2150;
  }
  return hasAllInclusive(offer) ? 2499 : 1999;
}

export function isEditorialDeal(offer: DatedOffer, now = Date.now()): boolean {
  if (!offer || !Number.isFinite(offer.price) || offer.price <= 0
      || !Number.isInteger(offer.nights) || offer.nights < 2 || offer.nights > 14
      || offer.availabilityStatus !== "available" || offer.linkType !== "exact"
      || getLinkMatch(offer) !== "exact" || !Array.isArray(offer.category)
      || offer.price > editorialPriceCeiling(offer)
      || isOfferExpired(offer, new Date(now))) return false;
  const checked = Date.parse(offer.priceCheckedAt || "");
  if (!Number.isFinite(checked) || now - checked < -MINUTE_MS || now - checked >= PRICE_MAX_AGE_MS) return false;
  const start = departureDateISO(offer);
  if (!start || start < warsawToday(now)) return false;
  if (Date.parse(start + "T00:00:00Z") - now > 365 * DAY_MS) return false;
  const url = String(offer.affiliateUrl || "");
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return false;
  } catch { return false; }
  if (isBeachTrip(offer) && !isTypicalBeachSeason(offer, Number(start.slice(5, 7)))) return false;
  return true;
}

function relativePrice(offer: Offer) {
  return offer.price / editorialPriceCeiling(offer);
}

/** At most one listing per destination and two per country on the generic shelf. */
export function selectEditorialDeals<T extends DatedOffer>(
  input: readonly T[], limit = 18, now = Date.now(),
): T[] {
  const maxItems = Math.max(0, Math.min(24, Math.floor(limit)));
  if (!maxItems) return [];
  const byDestination = new Map<string, T>();
  for (const offer of input) {
    if (!isEditorialDeal(offer, now)) continue;
    const key = touristDestinationKey(offer);
    const previous = byDestination.get(key);
    if (!previous || relativePrice(offer) < relativePrice(previous)
        || (relativePrice(offer) === relativePrice(previous) && offer.price < previous.price)) {
      byDestination.set(key, offer);
    }
  }
  const ranked = [...byDestination.values()].sort((a, b) =>
    relativePrice(a) - relativePrice(b) || a.price - b.price || Number(b.score || 0) - Number(a.score || 0));
  const selected: T[] = [];
  const usedDestinations = new Set<string>();
  const countryCount = new Map<string, number>();
  const kindOrder: EditorialDealKind[] = ["city", "allinclusive", "exotic", "holiday", "flight"];
  let picked = true;
  while (picked && selected.length < maxItems) {
    picked = false;
    for (const kind of kindOrder) {
      const next = ranked.find((offer) => {
        const country = normalizeDestinationKey(offer.country || "");
        return editorialDealKind(offer) === kind
          && !usedDestinations.has(touristDestinationKey(offer))
          && (countryCount.get(country) || 0) < 2;
      });
      if (!next) continue;
      selected.push(next);
      usedDestinations.add(touristDestinationKey(next));
      const country = normalizeDestinationKey(next.country || "");
      countryCount.set(country, (countryCount.get(country) || 0) + 1);
      picked = true;
      if (selected.length >= maxItems) break;
    }
  }
  return selected;
}
