import liveSnapshotRaw from "@/data/live-offers-snapshot.json";
import { isOfferExpired, offers, type AvailabilityStatus, type Offer } from "@/lib/offers";
import type { PartnerKey } from "@/lib/partners";

const PARTNERS = new Set<PartnerKey>([
  "esky", "wakacje", "exim", "tui", "getyourguide", "seeplaces",
  "holidaypark", "fonia", "parklot", "kiwi", "booking",
]);

const TAGS = new Set<Offer["tag"]>(["BIERZEMY", "DOBRA OPCJA", "OKAZJA"]);
const STATUSES = new Set<AvailabilityStatus>(["available", "unknown", "expired"]);

type LiveOfferRaw = Partial<Offer> & {
  provider?: string;
  url?: string;
};

type LiveSnapshot = {
  ok?: boolean;
  checkedAt?: string | null;
  snapshotAt?: string | null;
  sourceCount?: number;
  destinationCount?: number;
  offers?: LiveOfferRaw[];
};

export type SocialOfferPoolData = {
  offers: Offer[];
  liveCount: number;
  snapshotAt: string | null;
  checkedAt: string | null;
};

const liveSnapshot = liveSnapshotRaw as unknown as LiveSnapshot;

function normalizeLiveOffer(raw: LiveOfferRaw): Offer | null {
  const id = Number(raw.id);
  const price = Number(raw.price);
  const nights = Number(raw.nights);
  const partnerValue = String(raw.partner || raw.provider || "").toLowerCase() as PartnerKey;
  const affiliateUrl = String(raw.affiliateUrl || raw.url || "").trim();

  if (!Number.isFinite(id) || id <= 0) return null;
  if (!Number.isFinite(price) || price <= 0) return null;
  if (!Number.isFinite(nights) || nights <= 0) return null;
  if (!PARTNERS.has(partnerValue) || !affiliateUrl) return null;

  const category = Array.isArray(raw.category)
    ? raw.category.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
  const status = STATUSES.has(raw.availabilityStatus as AvailabilityStatus)
    ? raw.availabilityStatus as AvailabilityStatus
    : "unknown";
  const tag = TAGS.has(raw.tag as Offer["tag"])
    ? raw.tag as Offer["tag"]
    : "DOBRA OPCJA";
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

export function getSocialOfferPoolData(now = new Date()): SocialOfferPoolData {
  const live = (liveSnapshot.offers || [])
    .map(normalizeLiveOffer)
    .filter((offer): offer is Offer => Boolean(offer))
    .filter((offer) => !isOfferExpired(offer, now));

  const seenIds = new Set<number>();
  const seenUrls = new Set<string>();
  const combined: Offer[] = [];

  for (const offer of [...live, ...offers]) {
    if (isOfferExpired(offer, now)) continue;
    if (seenIds.has(offer.id)) continue;
    const urlKey = offer.affiliateUrl.trim();
    if (urlKey && seenUrls.has(urlKey)) continue;
    seenIds.add(offer.id);
    if (urlKey) seenUrls.add(urlKey);
    combined.push(offer);
  }

  return {
    offers: combined.slice(0, 240),
    liveCount: live.length,
    snapshotAt: liveSnapshot.snapshotAt ? String(liveSnapshot.snapshotAt) : null,
    checkedAt: liveSnapshot.checkedAt ? String(liveSnapshot.checkedAt) : null,
  };
}

export function getSocialOfferById(id: number, now = new Date()) {
  return getSocialOfferPoolData(now).offers.find((offer) => offer.id === id);
}
