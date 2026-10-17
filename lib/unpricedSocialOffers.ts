import type { SocialOffer } from "./socialOffers";

/** Social posts approved without a quoted price. Never represent an unknown price as zero. */
export type UnpricedSocialOffer = Omit<SocialOffer, "price"> & {
  price: null;
  departureDateISO: string;
  returnDateISO: string;
};

export const UNPRICED_SOCIAL_OFFERS: readonly UnpricedSocialOffer[] = [
  {
    slug: "turcja-bosphorus-11-listopada-2026",
    city: "Side",
    country: "Turcja",
    price: null,
    departure: "Wrocław",
    departureDateISO: "2026-11-11",
    returnDateISO: "2026-11-18",
    nights: 7,
    dates: "11–18 listopada 2026",
    board: "Ultra All Inclusive",
    hotel: "Bosphorus Sorgun",
    partner: "wakacje",
    partnerLabel: "Wakacje.pl",
    affiliateUrl: "https://www.wakacje.pl/oferty/turcja/riwiera-turecka/side/bosphorus-sorgun-479030.html?od-2026-11-11,7-dni,all-inclusive,z-wroclawia,srcx&a_aid=3212&utm_source=travellead&utm_medium=cps&utm_campaign=3212-tripownia.pl&utm_content=widget-search",
    imageSrc: "https://i.wakacje.pl/no-index/hotel/bosphorus-sorgun-obiekt-budynek-glowny-zjezdzalnia-1815947448-570-428.jpg",
    imageCountry: "Turcja",
    checkedAt: "2026-10-17T18:47:00+02:00",
    status: "active",
    included: ["7 noclegów", "Ultra All Inclusive"],
  },
];
