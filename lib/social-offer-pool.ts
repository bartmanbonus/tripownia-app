import liveSnapshotRaw from "@/data/live-offers-snapshot.json";
import dailyFlightGemRaw from "@/data/daily-flight-gem.json";
import { isOfferExpired, offers, type AvailabilityStatus, type Offer } from "@/lib/offers";
import type { PartnerKey } from "@/lib/partners";

const PARTNERS = new Set<PartnerKey>([
  "esky", "wakacje", "exim", "tui", "getyourguide", "seeplaces",
  "holidaypark", "fonia", "parklot", "kiwi", "booking",
]);

const TAGS = new Set<Offer["tag"]>(["BIERZEMY", "DOBRA OPCJA", "OKAZJA"]);
const STATUSES = new Set<AvailabilityStatus>(["available", "unknown", "expired"]);

type LiveOfferRaw = Partial<Offer> & { provider?: string; url?: string };
type LiveSnapshot = {
  ok?: boolean;
  checkedAt?: string | null;
  snapshotAt?: string | null;
  sourceCount?: number;
  destinationCount?: number;
  offers?: LiveOfferRaw[];
};

type FlightGemSnapshot = {
  ok?: boolean;
  configured?: boolean;
  checkedAt?: string | null;
  gem?: null | {
    id: number;
    from: string;
    to: string;
    city: string;
    country: string;
    flag: string;
    image: string;
    price: number;
    currency?: string;
    bookingUrl: string;
    departureDate: string;
    returnDate: string;
    checkedAt: string;
    medianPrice: number;
    discountPct: number;
    comparableCount: number;
  };
};

export type SocialOfferPoolData = {
  offers: Offer[];
  liveCount: number;
  snapshotAt: string | null;
  checkedAt: string | null;
  flightGemId: number | null;
};

const liveSnapshot = liveSnapshotRaw as unknown as LiveSnapshot;
const flightSnapshot = dailyFlightGemRaw as unknown as FlightGemSnapshot;

function warsawDateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function foundToday(offer: Offer, now: Date) {
  if (!offer.priceCheckedAt) return false;
  return warsawDateKey(offer.priceCheckedAt) === warsawDateKey(now);
}

function normalizeLiveOffer(raw: LiveOfferRaw): Offer | null {
  const id = Number(raw.id);
  const price = Number(raw.price);
  const nights = Number(raw.nights);
  const partnerValue = String(raw.partner || raw.provider || "").toLowerCase() as PartnerKey;
  const affiliateUrl = String(raw.affiliateUrl || raw.url || "").trim();
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(price) || price <= 0 || !Number.isFinite(nights) || nights <= 0) return null;
  if (!PARTNERS.has(partnerValue) || !affiliateUrl) return null;

  const category = Array.isArray(raw.category)
    ? raw.category.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
  const status = STATUSES.has(raw.availabilityStatus as AvailabilityStatus) ? raw.availabilityStatus as AvailabilityStatus : "unknown";
  const tag = TAGS.has(raw.tag as Offer["tag"]) ? raw.tag as Offer["tag"] : "DOBRA OPCJA";
  const linkMatch = raw.linkMatch === "exact" || raw.linkMatch === "parameters" || raw.linkMatch === "destination" || raw.linkMatch === "unsafe"
    ? raw.linkMatch
    : raw.linkType === "exact" ? "exact" : "destination";

  return {
    id,
    flag: String(raw.flag || "✈️"),
    city: String(raw.city || raw.country || "Oferta podróżnicza"),
    country: String(raw.country || raw.city || ""),
    price,
    pricePrevious: typeof raw.pricePrevious === "number" ? raw.pricePrevious : undefined,
    priceCheckedAt: raw.priceCheckedAt ? String(raw.priceCheckedAt) : undefined,
    availabilityStatus: status,
    departure: String(raw.departure || "lotnisko do sprawdzenia"),
    airportCode: String(raw.airportCode || ""),
    nights,
    weather: String(raw.weather || "sprawdź"),
    score: Number.isFinite(Number(raw.score)) ? Number(raw.score) : 8.5,
    tag,
    reason: String(raw.reason || "Konkretna oferta z aktualnego feedu partnera."),
    image: String(raw.image || "/images/destinations/default.jpg"),
    category,
    hotel: String(raw.hotel || "Hotel do sprawdzenia"),
    board: String(raw.board || "Wyżywienie do sprawdzenia"),
    dates: String(raw.dates || "termin do sprawdzenia"),
    partner: partnerValue,
    destinationUrl: raw.destinationUrl ? String(raw.destinationUrl) : undefined,
    affiliateUrl,
    linkType: raw.linkType === "exact" ? "exact" : "search",
    linkMatch,
    transferIncluded: typeof raw.transferIncluded === "boolean" ? raw.transferIncluded : undefined,
    baggageIncluded: typeof raw.baggageIncluded === "boolean" ? raw.baggageIncluded : undefined,
  };
}

function flightGemOffer(now: Date): Offer | null {
  const gem = flightSnapshot.gem;
  if (!flightSnapshot.ok || !gem || !gem.bookingUrl) return null;
  if (warsawDateKey(gem.checkedAt) !== warsawDateKey(now)) return null;
  const departure = new Date(gem.departureDate);
  const returning = new Date(gem.returnDate);
  const nights = Math.max(1, Math.round((returning.getTime() - departure.getTime()) / 86400000));
  return {
    id: Number(gem.id),
    flag: gem.flag || "✈️",
    city: gem.city,
    country: gem.country,
    price: Number(gem.price),
    priceCheckedAt: gem.checkedAt,
    availabilityStatus: "available",
    departure: gem.from,
    airportCode: gem.from,
    nights,
    weather: "sprawdź",
    score: 10,
    tag: "BIERZEMY",
    reason: `Lot ok. ${gem.discountPct}% poniżej mediany znalezionych wyników (${gem.medianPrice} zł).`,
    image: gem.image || "/images/destinations/default.jpg",
    category: ["flight", "tanio", "city"],
    hotel: "Tylko lot",
    board: "Bez wyżywienia",
    dates: `${gem.departureDate}–${gem.returnDate}`,
    partner: "esky",
    destinationUrl: gem.bookingUrl,
    affiliateUrl: gem.bookingUrl,
    linkType: "exact",
    linkMatch: "exact",
  };
}

export function getSocialOfferPoolData(now = new Date()): SocialOfferPoolData {
  const live = (liveSnapshot.offers || [])
    .map(normalizeLiveOffer)
    .filter((offer): offer is Offer => Boolean(offer))
    .filter((offer) => !isOfferExpired(offer, now))
    .filter((offer) => foundToday(offer, now));

  const flight = flightGemOffer(now);
  const combined: Offer[] = flight ? [flight, ...live] : [...live];
  const seenIds = new Set<number>();
  const seenUrls = new Set<string>();
  const unique = combined.filter((offer) => {
    if (seenIds.has(offer.id)) return false;
    const key = offer.affiliateUrl.trim();
    if (key && seenUrls.has(key)) return false;
    seenIds.add(offer.id);
    if (key) seenUrls.add(key);
    return true;
  });

  // Ręczna baza jest tylko awaryjnym fallbackiem dla backendu publikacji,
  // ale nie trafia do porannego plannera, bo nie jest "znaleziona dzisiaj".
  return {
    offers: unique.slice(0, 240),
    liveCount: live.length,
    snapshotAt: liveSnapshot.snapshotAt ? String(liveSnapshot.snapshotAt) : null,
    checkedAt: liveSnapshot.checkedAt ? String(liveSnapshot.checkedAt) : null,
    flightGemId: flight?.id ?? null,
  };
}

export function getSocialOfferById(id: number, now = new Date()) {
  const fresh = getSocialOfferPoolData(now).offers.find((offer) => offer.id === id);
  if (fresh) return fresh;
  return offers.find((offer) => offer.id === id && !isOfferExpired(offer, now));
}
