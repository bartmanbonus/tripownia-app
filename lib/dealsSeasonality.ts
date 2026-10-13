import { inferOfferStartDate, type Offer } from "@/lib/offers";

/**
 * Editorial relevance for the /okazje discovery page. This is deliberately
 * separate from feed eligibility: a visitor explicitly searching for a warm
 * holiday or a destination should still see the complete matching inventory.
 */
type SeasonalOffer = Pick<Offer, "city" | "dates" | "nights" | "category"> & {
  startDateISO?: string;
};

export type DealsSeasonContext = {
  month: string;
  year: string;
  quickFilter: string;
  destination: string;
  dealType: string;
  now: Date;
};

function normalize(value: string) {
  return value.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const MARKET_CITIES = new Set([
  "wieden", "vienna", "wien", "praga", "praha", "prague",
  "budapeszt", "budapest", "berlin", "drezno", "dresden",
  "norymberga", "nuremberg", "nurnberg", "salzburg",
]);

export function isChristmasMarketCity(offer: Pick<SeasonalOffer, "city">) {
  return MARKET_CITIES.has(normalize(offer.city).trim());
}

function validISODate(value: string | undefined): string | null {
  if (!value || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

/**
 * Month-only copy such as "grudzień 2026" is NOT a confirmed pre-Christmas
 * departure day. Never infer a 1 December departure from such copy.
 */
export function knownDepartureISO(offer: SeasonalOffer): string | null {
  const explicit = validISODate(offer.startDateISO);
  if (explicit) return explicit;
  const iso = String(offer.dates || "").match(/20\d{2}-\d{2}-\d{2}/);
  if (iso) return validISODate(iso[0]);

  const text = normalize(String(offer.dates || ""));
  const hasActualDay = /\b\d{1,2}\s*(?:[-–—]\s*\d{1,2}\s*)?[a-z]+\s+20\d{2}\b/.test(text);
  if (!hasActualDay) return null;
  const inferred = inferOfferStartDate(offer.dates);
  return inferred ? validISODate(inferred.toISOString().slice(0, 10)) : null;
}

function isAdventDeparture(iso: string) {
  const monthDay = iso.slice(5);
  // The 2026 Advent page starts its earliest market on 13 November.
  return monthDay >= "11-13" && monthDay <= "12-23";
}

export function isAdventMarketTrip(offer: SeasonalOffer) {
  if (!isChristmasMarketCity(offer) || offer.nights < 1 || offer.nights > 5) return false;
  const depart = knownDepartureISO(offer);
  if (depart) return isAdventDeparture(depart);
  const dates = normalize(String(offer.dates || ""));
  return dates.includes("listopad") || dates.includes("grudzien");
}

function explicitlyRequestedOtherTrips(context: DealsSeasonContext) {
  return Boolean(context.destination) || context.dealType === "allinclusive"
    || ["sun", "allinclusive", "flight"].includes(context.quickFilter);
}

function isWinterSunTrip(offer: SeasonalOffer) {
  return offer.category.includes("cieplo")
    || offer.category.includes("plaza")
    || normalize(offer.city).includes("malta");
}

/**
 * In December before Christmas, recommend short Advent trips, not random
 * warm-weather breaks. 27-31 December remains available for post-Christmas
 * travel, and the explicit Warmth / All Inclusive / Flights tabs are unaffected.
 * Never substitute November or January offers for a December selection.
 */
export function isSeasonallyRelevantDeal(offer: SeasonalOffer, context: DealsSeasonContext) {
  if (explicitlyRequestedOtherTrips(context)) return true;
  const departure = knownDepartureISO(offer);

  if (context.month === "12" && context.year !== "any") {
    if (departure) {
      if (!departure.startsWith(context.year + "-12-")) return false;
      const day = Number(departure.slice(8));
      if (day <= 23) return isAdventMarketTrip(offer);
      return day >= 27;
    }
    // A vague "December" beach offer might really depart before Christmas.
    // Without a concrete date, keep only known Christmas-market directions.
    return isAdventMarketTrip(offer)
      && normalize(String(offer.dates || "")).includes("grudzien");
  }

  // On the generic autumn feed, avoid highlighting November/December
  // sun/sea city breaks with explicit pre-Christmas dates (e.g. Malta).
  const currentYear = context.now.getUTCFullYear();
  const currentMonth = context.now.getUTCMonth() + 1;
  if (context.month === "any" && currentYear === 2026 && currentMonth >= 10 && currentMonth <= 12) {
    if (departure && departure >= "2026-11-20" && departure <= "2026-12-23"
      && isWinterSunTrip(offer) && !isAdventMarketTrip(offer)) return false;
    if (!departure && normalize(String(offer.dates || "")).includes("grudzien 2026")
      && isWinterSunTrip(offer) && !isAdventMarketTrip(offer)) return false;
  }
  return true;
}

export function seasonalDealBoost(offer: SeasonalOffer, context: DealsSeasonContext) {
  if (explicitlyRequestedOtherTrips(context) || !isAdventMarketTrip(offer)) return 0;
  if (context.month === "12" || context.month === "11") return 400;

  const year = context.now.getUTCFullYear();
  const month = context.now.getUTCMonth() + 1;
  const day = context.now.getUTCDate();
  if (year !== 2026) return 0;
  if ((month === 11 && day >= 13) || (month === 12 && day <= 23)) return 300;
  if (month === 10) return 45; // preview the upcoming season, not all-year noise
  return 0;
}
