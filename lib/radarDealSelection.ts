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

export type RadarSlot = {
  category: RadarCategory;
  offer: Offer | null;
  priceKind: RadarPriceKind;
};

export const RADAR_CATEGORIES: readonly RadarCategory[] = [
  { kind: "flight", title: "Tanie loty", teaser: "Lot w obie strony · 2–5 nocy", maxPrice: 399, url: "/loty" },
  { kind: "city", title: "City break", teaser: "Lot + hotel · 2–5 nocy", maxPrice: 899, url: "/city-break" },
  { kind: "allinclusive", title: "All Inclusive", teaser: "Lot + hotel + wyżywienie · min. 6 nocy", maxPrice: 2199, url: "/tanie-all-inclusive" },
  { kind: "beach", title: "Plaża i słońce", teaser: "Lot + hotel · min. 6 nocy", maxPrice: 1799, url: "/wakacje" },
  { kind: "exotic", title: "Egzotyka", teaser: "Daleka podróż · lot + hotel · min. 6 nocy", maxPrice: 3899, url: "/dalekie-podroze" },
];

const EXOTIC_RE = /zanzibar|tanzania|kenia|mauritius|malediw|seszel|tajland|wietnam|indonez|bali|sri lanka|dominik|meksyk|kuba|jamaj|japon|usa|stany zjednoczone|nowy jork|brazyl|kolumbi|peru|kostary|rpa|poludniowej afryki|wyspy zielonego przyladka|republika zielonego przyladka/;
const CLOCK_SKEW_MS = 60_000;

function isExotic(offer: Offer): boolean {
  return EXOTIC_RE.test(normalizeDestinationKey(offer.city + " " + offer.country));
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
      const target = url.searchParams.get("custom_url") || "";
      return domain === "c111.travelpayouts.com"
        && Boolean(url.searchParams.get("shmarker"))
        && target.startsWith("https://www.kiwi.com/");
    }
    if (offer.partner === "tui") return ["pdt.tradedoubler.com", "clk.tradedoubler.com"].includes(domain);
    if (offer.partner === "exim") return ["reklamy.exim.pl", "clk.tradedoubler.com"].includes(domain);
    if (offer.partner === "esky") return ["www2.esky.pl", "www.esky.pl"].includes(domain)
      && url.pathname.startsWith("/lot+hotel/");
    return false;
  } catch {
    return false;
  }
}

/** Flight-calendar prices are leads, not checkout-verified package prices. */
function isFlightLead(offer: Offer, now: number): boolean {
  return offer.partner === "kiwi"
    && offer.linkMatch === "parameters"
    && offer.category?.includes("flight") === true
    && offer.hotel === "Sam lot"
    && offer.nights >= 2 && offer.nights <= 5
    && sourceTimestampFresh(offer, now)
    && trustedLink(offer)
    && liveTripDates(offer) !== null;
}

function isExactPackage(offer: Offer, now: number): boolean {
  return ["esky", "exim", "tui"].includes(offer.partner)
    && offer.availabilityStatus === "available"
    && offer.linkMatch === "exact"
    && offer.linkType === "exact"
    && offer.hotel !== "Sam lot"
    && Boolean(offer.hotel?.trim())
    && sourceTimestampFresh(offer, now)
    && trustedLink(offer)
    && liveTripDates(offer) !== null;
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

/** Five DIFFERENT trip types. Empty categories stay honest rather than receiving costly duplicates. */
export function selectRadarSlots(offers: readonly Offer[], now = Date.now()): RadarSlot[] {
  const takenDestinations = new Set<string>();
  const takenCountries = new Set<string>();
  return RADAR_CATEGORIES.map((category) => {
    const candidates = offers.filter((offer) => qualifiesFor(offer, category, now))
      .sort((a, b) => a.price - b.price
        || Date.parse(b.priceCheckedAt || "") - Date.parse(a.priceCheckedAt || "")
        || a.id - b.id);
    const available = candidates.filter((offer) => !takenDestinations.has(touristDestinationKey(offer)));
    const offer = available.find((row) => !takenCountries.has(normalizeDestinationKey(row.country)))
      || available[0] || null;
    if (offer) {
      takenDestinations.add(touristDestinationKey(offer));
      takenCountries.add(normalizeDestinationKey(offer.country));
    }
    return { category, offer, priceKind: category.kind === "flight" ? "calendar" : "package" };
  });
}
