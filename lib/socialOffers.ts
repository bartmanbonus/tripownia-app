export type SocialOfferPartner = "exim" | "tui" | "wakacje" | "booking" | "kiwi" | "getyourguide" | "other";

export type SocialOffer = {
  slug: string;
  city: string;
  country: string;
  price: number;
  departure: string;
  nights: number;
  dates: string;
  board: string;
  hotel: string;
  partner: SocialOfferPartner;
  partnerLabel: string;
  affiliateUrl: string;
  imageSrc?: string;
  imageCountry?: string;
  checkedAt: string;
  status: "active" | "expired";
};

const ALLOWED_PARTNER_HOSTS = [
  "reklamy.exim.pl",
  "exim.pl",
  "www.exim.pl",
  "pdt.tradedoubler.com",
  "clk.tradedoubler.com",
  "tui.pl",
  "www.tui.pl",
  "wakacje.pl",
  "www.wakacje.pl",
  "booking.com",
  "www.booking.com",
  "kiwi.com",
  "www.kiwi.com",
  "kiwi.tpk.lv",
  "c111.travelpayouts.com",
  "getyourguide.pl",
  "www.getyourguide.pl",
  "getyourguide.com",
  "www.getyourguide.com",
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .trim();
}

function validAffiliateUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_PARTNER_HOSTS.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function validImageCountry(offer: SocialOffer) {
  if (!offer.imageSrc) return true;
  return Boolean(offer.imageCountry && normalize(offer.imageCountry) === normalize(offer.country));
}

/**
 * Curated social offers.
 *
 * Publishing rule:
 * 1) only add an offer after the exact partner URL has been verified,
 * 2) imageSrc is optional; if present imageCountry MUST equal country,
 * 3) if no verified image exists, the landing renders a neutral Tripownia placeholder,
 * 4) social posts link to /o/<slug>, never directly to the partner.
 */
const SOCIAL_OFFERS: Record<string, SocialOffer> = {
  "marrakesz": {
    slug: "marrakesz",
    city: "Marrakesz",
    country: "Maroko",
    price: 1179,
    departure: "Kraków",
    nights: 4,
    dates: "25–29 października 2026",
    board: "Śniadania",
    hotel: "Riad Nouhal",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1329285_1329262)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fmaroko%2Fmarrakesz%2Fmarrakesz%2Friad-nouhal%3FKEY%3DMjM3MDIwN3wzNjcwNjgzNDU1fDEzMjkyNjI%26DS%3D1024%26GIATA%3D1318638%26D%3D63710%26HID%3D437950%26MT%3D1%26DI%3DGT06-BB%26NN%3D4%26DF%3D2026-10-18%257C2026-11-12%26RD%3D2026-10-29%26DD%3D2026-10-25%26AC1%3D2%26TO%3D1825%26PID%3D437950%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D4-2026-10-25%26IFC%3DRlJ8NzEwM3wyMDI2LTEwLTI5VDE0OjQw%26OFC%3DRlJ8NzEwMnwyMDI2LTEwLTI1VDA1OjQ1%26utm_term%3Dfeed))",
    imageSrc: "/images/destinations/marrakesz.jpg",
    imageCountry: "Maroko",
    checkedAt: "2026-09-27T08:15:00+02:00",
    status: "active",
  },
  "cypr": {
    slug: "cypr",
    city: "Protaras",
    country: "Cypr",
    price: 959,
    departure: "Warszawa–Radom",
    nights: 4,
    dates: "15–19 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Mandalena Hotel Apartments",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1306319_1306296)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fcypr%2Fcypr-poludniowy%2Fprotaras%2Fmandalena-hotel-apartments%3FKEY%3DMjIyODI0OXwzMTc1OTkwNDYzfDEzMDYyOTY%26DS%3D1024%26GIATA%3D227782%26D%3D63542%26HID%3D422255%26MT%3D6%26DI%3DGT06-AO%26NN%3D4%26DF%3D2026-11-08%257C2026-12-03%26RD%3D2026-11-19%26DD%3D2026-11-15%26AC1%3D2%26TO%3D4381%26PID%3D422255%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D4-2026-11-15%26IFC%3DVzZ8NDY0MHwyMDI2LTExLTE5VDE3OjM1%26OFC%3DVzZ8NDY0MXwyMDI2LTExLTE1VDIwOjQ1%26utm_term%3Dfeed)",
    imageSrc: "/images/destinations/pafos.jpg",
    imageCountry: "Cypr",
    checkedAt: "2026-09-27T11:25:00+02:00",
    status: "active",
  },
};

export function getSocialOffer(slug: string): SocialOffer | null {
  const offer = SOCIAL_OFFERS[slug.toLocaleLowerCase("pl")] || null;
  if (!offer) return null;
  if (offer.status !== "active") return null;
  if (!validAffiliateUrl(offer.affiliateUrl)) return null;
  if (!validImageCountry(offer)) return null;
  return offer;
}

export function getSocialOfferSlugs() {
  return Object.keys(SOCIAL_OFFERS);
}

export function socialOfferReady(offer: SocialOffer) {
  return offer.status === "active" && validAffiliateUrl(offer.affiliateUrl) && validImageCountry(offer);
}
