export function trackedAffiliateHref({
  partner,
  url,
  source,
  offer,
  destination,
}: {
  partner: string;
  url: string;
  source: string;
  offer?: number | string;
  destination?: string;
}) {
  const params = new URLSearchParams({ url, source });
  if (offer !== undefined && offer !== "") params.set("offer", String(offer));
  if (destination) params.set("destination", destination);
  return `/out/${encodeURIComponent(partner)}?${params.toString()}`;
}
