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
    slug: "teneryfa-beverly-hills-1809",
    city: "Teneryfa",
    country: "Hiszpania",
    price: 1809,
    departure: "Kraków",
    nights: 4,
    dates: "22–26 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Ona Beverly Hills Suites",
    partner: "exim",
    partnerLabel: "EXIM tours",
    affiliateUrl: "https://www.exim.pl/kierunki/hiszpania/teneryfa/los-cristianos/ona-beverly-hills-suites?KEY=MjE4NzYxNXwzNTczMjMxMzA0fDEzMjEzNTY&DS=1024&GIATA=429808&D=74465&HID=457643&MT=6&DI=GT06-AO&NN=4&MNN=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&NNM=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&DF=2026-11-15%7C2026-12-10&RD=2026-11-26&DD=2026-11-22&ERM=0&AC1=2&KC1=0&IC1=0&TO=1825&TT=1&PID=457643&DPR=EXIM+TOURS+POLAND&PC=4-2026-11-22&IFC=RlJ8MjY1NHwyMDI2LTExLTI2VDEyOjA1&OFC=RlJ8MjY1NXwyMDI2LTExLTIyVDEzOjAw&utm_term=feed&tduid=c7d243284e2e1a9f478e3768f8d89c2b&utm_source=Tradedoubler_3487177&utm_medium=Affiliate&utm_campaign=Ongoing_P_TD",
    imageSrc: "/images/destinations/teneryfa.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-10-11T14:00:17+02:00",
    status: "active",
    included: ["Lot w obie strony", "4 noce", "Transfer lotnisko–hotel–lotnisko", "Podstawowe ubezpieczenie"],
  },
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
