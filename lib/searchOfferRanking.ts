// Search retains all distinct, comparable variants; editorial city quotas must
// never hide inventory. Keep exact matches ahead of clearly labelled alternatives.
export function searchPrice(offer: any): number {
  const price = Number(offer?.price);
  return Number.isFinite(price) && price > 0 ? price : Infinity;
}

export function searchTier(offer: any): number {
  return Number(offer?.searchTier || 0);
}

export function rankSearchOffers<T extends Record<string, any>>(offers: T[], limit = 400): T[] {
  const sorted = offers.filter(offer => searchPrice(offer) < Infinity)
    .sort((a, b) => searchTier(a) - searchTier(b) || searchPrice(a) - searchPrice(b));
  const seen = new Set<string>();
  return sorted.filter(offer => {
    const key = [offer.partner, offer.country, offer.city, offer.hotel,
      offer.startDateISO || offer.dates, offer.endDateISO, offer.nights,
      offer.departure, offer.airportCode, offer.board, offer.roomType || offer.room,
      offer.baggageIncluded, offer.transferIncluded]
      .map(value => String(value ?? '').trim().toLocaleLowerCase('pl-PL')).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}
