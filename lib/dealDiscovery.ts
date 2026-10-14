import { touristDestinationKey } from './destinationGrouping';

type DiscoveryOffer = {
  city: string; country: string; dates?: string; startDateISO?: string;
  category?: string[]; reason?: string; title?: string;
};

/** December is reserved for explicitly described Christmas-market trips in discovery.
 * A deliberate destination search remains a complete catalogue. */
export function isSeasonalDiscoveryOffer(offer: DiscoveryOffer): boolean {
  const dates = `${offer.startDateISO || ''} ${offer.dates || ''}`;
  const december = /\b20\d{2}-12-\d{2}\b|\b\d{1,2}\.12\.20\d{2}\b|grudzie/i.test(dates);
  if (!december) return true;
  return /jarmark|christmas.market|weihnachtsmarkt/i.test(
    `${(offer.category || []).join(' ')} ${offer.reason || ''} ${offer.title || ''}`
  );
}

/** Keep every variant, but show one per destination before repeating a destination. */
export function diversifyDestinations<T extends DiscoveryOffer>(offers: T[]): T[] {
  const buckets = new Map<string, T[]>();
  for (const offer of offers) {
    const key = touristDestinationKey(offer);
    const bucket = buckets.get(key) || [];
    bucket.push(offer);
    buckets.set(key, bucket);
  }
  const result: T[] = [];
  const groups = [...buckets.values()];
  for (let index = 0; ; index++) {
    let added = false;
    for (const group of groups) if (index < group.length) { result.push(group[index]); added = true; }
    if (!added) return result;
  }
}
