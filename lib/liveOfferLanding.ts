import type { Offer } from "@/lib/offers";

type LiveOffer = Offer & {
  startDateISO?: string;
  endDateISO?: string;
};

export function liveOfferLandingHref(offer: Offer, options?: { price?: number | null; note?: string; source?: string }) {
  const live = offer as LiveOffer;
  const params = new URLSearchParams({
    offer: String(offer.id),
    city: offer.city,
    country: offer.country,
    departure: offer.departure,
    nights: String(offer.nights),
    dates: offer.dates,
    board: offer.board,
    target: offer.affiliateUrl,
  });
  const landingPrice = options?.price === undefined ? offer.price : options.price;
  if (landingPrice !== null && Number.isFinite(Number(landingPrice)) && Number(landingPrice) > 0) {
    params.set("price", String(landingPrice));
  }

  if (options?.note) params.set("note", options.note);
  if (options?.source) params.set("source", options.source);
  if (offer.hotel) params.set("hotel", offer.hotel);
  if (offer.airportCode) params.set("airport", offer.airportCode);
  if (live.startDateISO) params.set("start", live.startDateISO);
  if (live.endDateISO) params.set("end", live.endDateISO);

  return `/okazja?${params.toString()}`;
}
