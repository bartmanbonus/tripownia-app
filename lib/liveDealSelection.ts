import type { Offer } from "./offers";
import { normalizeDestinationKey, touristDestinationKey } from "./destinationGrouping";
import { isHomepageDeal } from "./offerValuePolicy";
import { isTravelDestinationAllowed } from "./travelSafety";

export type LiveDealKind = "city" | "allinclusive" | "exotic" | "holiday";
export const LIVE_PRICE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 60_000;
const DAY_MS = 86_400_000;
const LONG_HAUL = /zanzibar|tanzania|kenia|mauritius|malediw|seszel|tajland|wietnam|indonez|bali|sri lanka|dominik|meksyk|kuba|jamaj|japon|\busa\b|stany zjednoczone|nowy jork|brazyl|kolumbi|peru|kostary|\brpa\b|poludniowej afryki/;

export function liveDealKind(offer: Offer): LiveDealKind {
  if (LONG_HAUL.test(normalizeDestinationKey(`${offer.city} ${offer.country}`))) return "exotic";
  if (/all[ -]?inclusive/i.test(offer.board)) return "allinclusive";
  return offer.nights <= 5 ? "city" : "holiday";
}

function dateISO(token: string): string | null {
  const parts = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(token);
  const iso = parts ? `${parts[3]}-${parts[2].padStart(2, "0")}-${parts[1].padStart(2, "0")}` : token;
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(iso)) return null;
  const time = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === iso ? iso : null;
}

function warsawDate(now: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Withhold ambiguous highlights; never invent hotel nights from flight dates. */
export function liveTripDates(offer: Pick<Offer, "dates" | "nights">, today = warsawDate(Date.now())) {
  const match = /^\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4})\s*[-\u2013\u2014]\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4})\s*$/.exec(String(offer.dates || ""));
  if (!match || !Number.isInteger(offer.nights) || offer.nights < 1) return null;
  const start = dateISO(match[1]);
  const end = dateISO(match[2]);
  if (!start || !end || end <= start || start < today) return null;
  const duration = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS;
  return duration === offer.nights ? { start, end } : null;
}

function isLiveCandidate(offer: Offer, now: number, today: string) {
  if (!offer || !Number.isSafeInteger(offer.id) || offer.id <= 0
    || !Number.isFinite(offer.price) || offer.price <= 0
    || ![offer.city, offer.country, offer.departure, offer.hotel, offer.board].every((value) => typeof value === "string" && value.trim())
    || !["esky", "exim", "tui"].includes(offer.partner)) return false;
  if (!isTravelDestinationAllowed(offer.city, offer.country)) return false;
  const match = offer.linkMatch ?? (offer.linkType === "exact" ? "exact" : "parameters");
  if (match !== "exact") return false;
  try {
    const url = new URL(offer.affiliateUrl);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return false;
  } catch { return false; }
  // Only the offer's source timestamp qualifies it, never the HTTP poll timestamp.
  const checked = Date.parse(offer.priceCheckedAt || "");
  if (!Number.isFinite(checked) || checked > now + CLOCK_SKEW_MS || now - checked > LIVE_PRICE_MAX_AGE_MS) return false;
  return isHomepageDeal(offer) && liveTripDates(offer, today) !== null;
}

/** Select from the COMPLETE returned pool, before limiting the number of cards. */
export function selectLiveDeals(offers: readonly Offer[], limit = 6, now = Date.now()): Offer[] {
  const size = Number.isFinite(limit) ? Math.max(0, Math.min(6, Math.floor(limit))) : 6;
  if (!size || !Number.isFinite(now)) return [];
  const today = warsawDate(now);
  const eligible = offers.filter((offer) => isLiveCandidate(offer, now, today)).sort((a, b) =>
    a.price - b.price || Date.parse(b.priceCheckedAt!) - Date.parse(a.priceCheckedAt!) || a.id - b.id);
  const selected: Offer[] = [];
  const destinations = new Set<string>();
  const countries = new Map<string, number>();
  const ids = new Set<number>();
  const links = new Set<string>();
  const take = (kind?: LiveDealKind) => {
    if (selected.length >= size) return;
    const offer = eligible.find((row) => {
      const country = normalizeDestinationKey(row.country);
      return (!kind || liveDealKind(row) === kind)
        && !destinations.has(touristDestinationKey(row))
        && !ids.has(row.id) && !links.has(row.affiliateUrl)
        && (countries.get(country) || 0) < 2;
    });
    if (!offer) return;
    selected.push(offer);
    destinations.add(touristDestinationKey(offer));
    ids.add(offer.id);
    links.add(offer.affiliateUrl);
    const country = normalizeDestinationKey(offer.country);
    countries.set(country, (countries.get(country) || 0) + 1);
  };
  // Give different kinds of trips room without relaxing price or freshness rules.
  // Missing categories are NOT filled with invented or stale offers.
  for (const kind of ["city", "allinclusive", "exotic", "holiday", "city", "allinclusive"] as const) take(kind);
  for (let index = selected.length; index < size; index++) take();
  return selected;
}

export function livePriceAge(value: string | undefined, now = Date.now()) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time) || time > now + CLOCK_SKEW_MS) return "brak daty ceny";
  const minutes = Math.max(0, Math.floor((now - time) / 60_000));
  if (minutes < 2) return "przed chwil\u0105";
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h temu` : `${Math.floor(hours / 24)} d temu`;
}

export function liveNightsLabel(nights: number) {
  const suffix = nights === 1 ? "noc" : nights % 10 >= 2 && nights % 10 <= 4
    && !(nights % 100 >= 12 && nights % 100 <= 14) ? "noce" : "nocy";
  return `${nights} ${suffix}`;
}
