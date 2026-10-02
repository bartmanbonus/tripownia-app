import type { Offer } from "@/lib/offers";

type LiveOffer = Offer & {
  startDateISO?: string;
  endDateISO?: string;
};

export function liveOfferLandingHref(offer: Offer, options?: { price?: number; note?: string }) {
  const live = offer as LiveOffer;
  const params = new URLSearchParams({
    offer: String(offer.id),
    city: offer.city,
    country: offer.country,
    departure: offer.departure,
    nights: String(offer.nights),
    dates: offer.dates,
    board: offer.board,
    price: String(options?.price ?? offer.price),
    target: offer.affiliateUrl,
  });

  if (options?.note) params.set("note", options.note);
  if (offer.hotel) params.set("hotel", offer.hotel);
  if (offer.airportCode) params.set("airport", offer.airportCode);
  if (live.startDateISO) params.set("start", live.startDateISO);
  if (live.endDateISO) params.set("end", live.endDateISO);

  return `/okazja?${params.toString()}`;
}
