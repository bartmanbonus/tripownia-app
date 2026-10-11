import { getSocialOfferForLanding, getSocialOfferSlugs, type SocialOffer } from "./socialOffers";

/**
 * Approved social offers that have dedicated /o/<slug>/page.tsx landings.
 * Register each such offer here before publishing its social post. Both the
 * homepage shelf and /oferty-z-postow consume getSocialOfferCatalogEntries().
 * checkedAt records the source snapshot, not a claim of live availability.
 * Existing offers are retained and entries are deduplicated by landing slug.
 */
export const DEDICATED_SOCIAL_OFFERS: readonly SocialOffer[] = [
  {
    slug: "paryz-provinces-opera-1169",
    city: "Paryż",
    country: "Francja",
    price: 1169,
    departure: "Warszawa–Modlin",
    nights: 2,
    dates: "13–15 lutego 2027",
    board: "Śniadania",
    hotel: "Hotel Vacances Bleues Provinces Opéra",
    partner: "esky",
    partnerLabel: "eSky",
    affiliateUrl: "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&departureDate=2027-02-13&returnDate=2027-02-15&stayLength=2:2&departurePlaces=ap-WAW,ap-WMI&arrivalPlaces=ci-PAR&context=pl-packages&metaCode=121507&departureCode=WMI&checkInDate=2027-02-13&checkOutDate=2027-02-15&destinationDepartureDate=2027-02-13&returnArrivalDate=2027-02-15&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=65aa3d76-0372-4fbe-8f40-3e3909e09c9b&fmg_filter=2mp&packageId=MjcwMjEzOjI6cGw6MTIxNTA3&flightOptionId=V01JQlZBMjcwMjEzNzh8fEZSMTg4ODowOjAsQlZBV01JMjcwMjE1NzhJfHxGUjE4ODk6MDox&arrivalCode=BVA&pricePresentation=perpax&selectedDeparturePlaces=ap-WAW,ap-WMI",
    imageSrc: "/images/destinations/paryz.jpg",
    imageCountry: "Francja",
    checkedAt: "2026-10-11T08:29:00+02:00",
    status: "active",
    included: ["Lot w obie strony", "2 noce", "Śniadania"],
  },
];

export function getSocialOfferCatalogEntries(): SocialOffer[] {
  const entries = new Map<string, SocialOffer>();
  for (const slug of getSocialOfferSlugs()) {
    const offer = getSocialOfferForLanding(slug);
    if (offer) entries.set(offer.slug, offer);
  }
  for (const offer of DEDICATED_SOCIAL_OFFERS) {
    const current = entries.get(offer.slug);
    if (!current || Date.parse(offer.checkedAt) > Date.parse(current.checkedAt)) {
      entries.set(offer.slug, offer);
    }
  }
  return [...entries.values()].sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt));
}
