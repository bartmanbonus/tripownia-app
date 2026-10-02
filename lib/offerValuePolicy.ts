import type { Offer } from "@/lib/offers";

type PricedTrip = Pick<Offer, "price" | "nights" | "country" | "city" | "board">;
const LONG_HAUL = /zanzibar|tanzania|kenia|mauritius|malediw|seszel|tajland|wietnam|indonez|bali|sri lanka|dominik|meksyk|kuba|jamaj|japon|usa|stany zjednoczone|nowy jork|brazyl|kolumbi|peru|kostary|rpa|poludniowej afryki/i;
function longHaul(offer: PricedTrip) {
  return LONG_HAUL.test(`${offer.country} ${offer.city}`.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}

// Applies to search too: short regional breaks cannot reappear at luxury prices
// through broad searches, alternatives or a different supplier.
export function isAffordableShortTrip(offer: PricedTrip) {
  return Number.isFinite(offer.price) && offer.price > 0 && offer.nights > 0
    && (offer.nights > 5 || longHaul(offer) || offer.price <= 2000);
}

// Editorial price ceilings are deliberately separate from complete search inventory.
// These are selection rules, not a claim to have compared the entire market.
export function isPromotableOffer(offer: Offer) {
  if (!isAffordableShortTrip(offer) || !offer.affiliateUrl || offer.linkType !== "exact"
    || offer.availabilityStatus !== "available") return false;
  const checked = Date.parse(offer.priceCheckedAt || "");
  if (!Number.isFinite(checked) || Date.now() - checked > 6 * 60 * 60 * 1000 || checked > Date.now() + 60000) return false;
  const exotic = longHaul(offer);
  const allInclusive = /all[ -]?inclusive/i.test(offer.board);
  const ceiling = exotic ? (allInclusive ? 6000 : 5000)
    : offer.nights <= 5 ? 2000 : allInclusive ? 3500 : 3000;
  return offer.price <= ceiling;
}
