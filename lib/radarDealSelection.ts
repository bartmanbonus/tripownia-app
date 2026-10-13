import type { Offer } from "@/lib/offers";
import { liveTripDates, LIVE_PRICE_MAX_AGE_MS } from "@/lib/liveDealSelection";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { normalizeDestinationKey, touristDestinationKey } from "@/lib/destinationGrouping";

export type RadarKind = "flight" | "city" | "allinclusive" | "beach" | "exotic";
export type RadarPriceKind = "calendar" | "package";

export type RadarCategory = {
  kind: RadarKind;
  title: string;
  teaser: string;
  maxPrice: number;
  url: string;
};

export type RadarPick = {
  category: RadarCategory;
  offer: Offer;
  priceKind: RadarPriceKind;
};

export const RADAR_CATEGORIES: readonly RadarCategory[] = [
  { kind: "flight", title: "Same loty", teaser: "Lot w obie strony", maxPrice: 399, url: "/loty" },
  { kind: "city", title: "City break", teaser: "Lot + hotel · 2–5 nocy", maxPrice: 899, url: "/city-break" },
  { kind: "allinclusive", title: "All Inclusive", teaser: "Lot + hotel + wyżywienie", maxPrice: 2199, url: "/tanie-all-inclusive" },
  { kind: "beach", title: "Plaża i słońce", teaser: "Lot + hotel · min. 6 nocy", maxPrice: 1799, url: "/wakacje" },
  { kind: "exotic", title: "Egzotyka", teaser: "Dalsza podróż · min. 6 nocy", maxPrice: 3899, url: "/dalekie-podroze" },
];

const EXOTIC_RE = /zanzibar|tanzania|kenia|mauritius|malediw|seszel|tajland|wietnam|indonez|bali|sri lanka|dominik|meksyk|kuba|jamaj|japon|usa|stany zjednoczone|nowy jork|brazyl|kolumbi|peru|kostary|rpa|poludniowej afryki|wyspy zielonego przyladka|republika zielonego przyladka|cape verde/;
const CLOCK_SKEW_MS = 60_000;

function isExotic(offer: Offer): boolean {
  return EXOTIC_RE.test(normalizeDestinationKey(offer.city + " " + offer.country));
}

function warsawDay(now: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const p = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return p("year") + "-" + p("month") + "-" + p("day");
}

function sourceTimestampFresh(offer: Offer, now: number): boolean {
  const checked = Date.parse(offer.priceCheckedAt || "");
  return Number.isFinite(checked) && checked <= now + CLOCK_SKEW_MS && now - checked <= LIVE_PRICE_MAX_AGE_MS;
}

function trustedLink(offer: Offer): boolean {
  try {
    const url = new URL(offer.affiliateUrl);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const domain = url.hostname.toLowerCase();
    if (offer.partner === "kiwi") {
      const targetText = url.searchParams.get("custom_url") || "";
      const target = new URL(targetText);
      return domain === "c111.travelpayouts.com"
        && Boolean(url.searchParams.get("shmarker")?.includes("TRIPOWNIAPL"))
        && target.protocol === "https:" && target.hostname === "www.kiwi.com"
        && target.pathname === "/deep" && Boolean(target.searchParams.get("to"))
        && target.searchParams.get("from") === offer.airportCode;
    }
    if (offer.partner === "tui") return ["pdt.tradedoubler.com", "clk.tradedoubler.com"].includes(domain);
    if (offer.partner === "exim") return ["reklamy.exim.pl", "clk.tradedoubler.com"].includes(domain);
    if (offer.partner === "esky") return ["www2.esky.pl", "www.esky.pl"].includes(domain)
      && url.pathname.startsWith("/lot+hotel/portfolio/details/")
      && Boolean(url.searchParams.get("packageId"));
    return false;
  } catch {
    return false;
  }
}

function hasValidDates(offer: Offer, now: number) {
  return liveTripDates(offer, warsawDay(now)) !== null;
}

/** Calendar quotes are NOT verified checkout prices and are never treated as packages. */
function isFlightLead(offer: Offer, now: number): boolean {
  return offer.partner === "kiwi"
    && offer.linkMatch === "parameters"
    && offer.category?.includes("flight") === true
    && offer.hotel === "Sam lot"
    && offer.nights >= 2 && offer.nights <= 5
    && sourceTimestampFresh(offer, now)
    && trustedLink(offer)
    && hasValidDates(offer, now);
}

/** Exact supplier package with a real price timestamp and matching departure dates. */
function isExactPackage(offer: Offer, now: number): boolean {
  return ["esky", "exim", "tui"].includes(offer.partner)
    && offer.availabilityStatus === "available"
    && offer.linkMatch === "exact"
    && offer.linkType === "exact"
    && offer.hotel !== "Sam lot"
    && Boolean(offer.hotel?.trim())
    && sourceTimestampFresh(offer, now)
    && trustedLink(offer)
    && hasValidDates(offer, now);
}

function qualifiesFor(offer: Offer, category: RadarCategory, now: number): boolean {
  if (!offer || !Number.isFinite(offer.price) || offer.price <= 0 || offer.price > category.maxPrice
    || !isTravelDestinationAllowed(offer.city, offer.country)) return false;
  if (category.kind === "flight") return isFlightLead(offer, now);
  if (!isExactPackage(offer, now)) return false;

  const exotic = isExotic(offer);
  const allInclusive = /all[ -]?inclusive/i.test(offer.board || "");
  if (category.kind === "city") return !exotic && !allInclusive && offer.nights >= 2 && offer.nights <= 5;
  if (category.kind === "allinclusive") return !exotic && allInclusive && offer.nights >= 6;
  if (category.kind === "beach") return !exotic && !allInclusive && offer.nights >= 6 && offer.nights <= 10;
  return exotic && offer.nights >= 6;
}

const CATEGORY_CAPS: Record<RadarKind, number> = {
  flight: 3, city: 2, allinclusive: 2, beach: 2, exotic: 2,
};

/** 
 * Fair, live-only editorial mix: first one per eligible category, then the cheapest
 * distinct destinations with category caps. Empty categories never receive filler
 * and a single country cannot dominate the entire Radar.
 */
export function selectRadarFeed(pool: readonly Offer[], now = Date.now(), limit = 8): RadarPick[] {
  if (!Number.isFinite(now)) return [];
  const cap = Number.isFinite(limit) ? Math.max(0, Math.min(12, Math.floor(limit))) : 8;
  if (!cap) return [];
  const options = new Map<RadarKind, Offer[]>();
  for (const category of RADAR_CATEGORIES) {
    const cheapest = pool.filter((offer) => qualifiesFor(offer, category, now))
      .sort((a, b) => a.price - b.price
        || Date.parse(b.priceCheckedAt || "") - Date.parse(a.priceCheckedAt || "") || a.id - b.id);
    options.set(category.kind, cheapest);
  }

  const selected: RadarPick[] = [];
  const usedDestinations = new Set<string>();
  const usedLinks = new Set<string>();
  const countryCounts = new Map<string, number>();
  const kindCounts = new Map<RadarKind, number>();

  const take = (category: RadarCategory) => {
    if (selected.length >= cap || (kindCounts.get(category.kind) || 0) >= CATEGORY_CAPS[category.kind]) return false;
    const next = (options.get(category.kind) || []).find((offer) => {
      const country = normalizeDestinationKey(offer.country);
      return !usedDestinations.has(touristDestinationKey(offer))
        && !usedLinks.has(offer.affiliateUrl)
        && (countryCounts.get(country) || 0) < 2;
    });
    if (!next) return false;
    const country = normalizeDestinationKey(next.country);
    selected.push({ category, offer: next, priceKind: category.kind === "flight" ? "calendar" : "package" });
    usedDestinations.add(touristDestinationKey(next));
    usedLinks.add(next.affiliateUrl);
    countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    kindCounts.set(category.kind, (kindCounts.get(category.kind) || 0) + 1);
    return true;
  };

  // Give each type one guaranteed opportunity without lowering the price ceiling.
  for (const category of RADAR_CATEGORIES) take(category);
  // When eSky or another provider has no city breaks, fill remaining room with
  // genuinely cheap DIFFERENT destinations rather than empty promotional tiles.
  for (let round = 0; round < 3 && selected.length < cap; round++) {
    let changed = false;
    for (const kind of ["flight", "city", "exotic", "beach", "allinclusive"] as const) {
      const category = RADAR_CATEGORIES.find((item) => item.kind === kind)!;
      changed = take(category) || changed;
      if (selected.length >= cap) break;
    }
    if (!changed) break;
  }
  return selected;
}
