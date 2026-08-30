/**
 * Only manually verified, exact-location images belong here.
 * Empty by design after v22 reset: a missing verified image renders a neutral placeholder.
 * Never fall back to an image from the offer, country, or a random source.
 */
export const verifiedImages: Record<string, string> = {};

export function getVerifiedImage(city: string) {
  return verifiedImages[city] || "";
}
