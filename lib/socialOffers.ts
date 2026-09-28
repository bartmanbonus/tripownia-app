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
  "djerba-sun-beach-2349": {
    slug: "djerba-sun-beach-2349",
    city: "Djerba",
    country: "Tunezja",
    price: 2349,
    departure: "Warszawa",
    nights: 7,
    dates: "19–26 listopada 2026",
    board: "All Inclusive",
    hotel: "Djerba Sun Beach 4★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Ftunezja%2Fdjerba%2Fmidnoun%2Fdjerba-sun-beach%3FD%3D63252%26DD%3D2026-11-19%26DF%3D2026-11-12%257C2026-12-10%26DI%3DGT06-AI%26DPR%3DEXIM%2BTOURS%2BPOLAND%26DS%3D1024%26ERM%3D0%26GIATA%3D3986%26HID%3D422817%26IFC%3DQ0hSfHwyMDI2LTExLTI2VDAwOjAw%26KEY%3DMjIwMzE4MHwzMjIxMzQzMDM5fDEyODk5OTk%253D%26MNN%3D7%257C8%257C9%257C10%26MT%3D5%26NN%3D7%26NNM%3D7%257C8%257C9%257C10%26OFC%3DQ0hSfDEwMTB8MjAyNi0xMS0xOVQwMDowMA--%26PC%3D7-2026-11-19%26PID%3D422817%26RD%3D2026-11-26%26TO%3D3850%26TT%3D1",
    checkedAt: "2026-09-28T19:39:00+02:00",
    status: "active",
  },
  "teneryfa-casablanca-1831": {
    slug: "teneryfa-casablanca-1831",
    city: "Teneryfa",
    country: "Hiszpania",
    price: 1831,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "17–24 grudnia 2026",
    board: "Bez wyżywienia",
    hotel: "Apartamentos Casablanca",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fwyspy-kanaryjskie%2Fteneryfa%2Fapartamentos-casablanca-tfs11042%2FOfferCodeWS%2FWAWTFS20261217090520261217202612241450L07TFS11042STX1UA02ROUSTX1A02FCYY",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },
  "egipt-royal-lagoons-2104": {
    slug: "egipt-royal-lagoons-2104",
    city: "Hurghada",
    country: "Egipt",
    price: 2104,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "17–24 grudnia 2026",
    board: "All Inclusive",
    hotel: "Royal Lagoons Aqua Park Resort & Spa",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fegipt%2Fhurghada%2Froyal-lagoons-aqua-park-resort-spa-hrg11015%2FOfferCodeWS%2FWAWHRG20261217070020261217202612241340L07HRG11015DZZ1AA02ROADZZ1A02FCYY",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },
  "turcja-cleopatra-1462": {
    slug: "turcja-cleopatra-1462",
    city: "Alanya",
    country: "Turcja",
    price: 1462,
    departure: "Katowice",
    nights: 7,
    dates: "12–19 grudnia 2026",
    board: "All Inclusive",
    hotel: "Cleopatra Golden Beach",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fturcja%2Friwiera-turecka%2Fcleopatra-golden-beach-ayt61145%2FOfferCodeWS%2FKTWAYT20261212020020261212202612190740L07AYT61145DZZ1AA02ROADZZ1A02FCYY",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },

  "porto-trindade-1209": {
    slug: "porto-trindade-1209",
    city: "Porto",
    country: "Portugalia",
    price: 1209,
    departure: "Kraków",
    nights: 3,
    dates: "15–18 listopada 2026",
    board: "Śniadania",
    hotel: "Porto Trindade",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1330519_1330453)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fportugalia%2Fporto-i-okolice%2Fporto%2Fporto-trindade-hotel%3FKEY%3DMjM4NTU4MHwzNTQ1NjIwNzM1fDEzMzA0NTM%26DS%3D1024%26GIATA%3D215665%26D%3D63395%26HID%3D423175%26MT%3D1%26DI%3DGT06-BB%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-08%257C2026-12-02%26RD%3D2026-11-18%26DD%3D2026-11-15%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1825%26TT%3D1%26PID%3D423175%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-11-15%26IFC%3DRlJ8MzA0OHwyMDI2LTExLTE4VDA2OjI1%26OFC%3DRlJ8MzA0N3wyMDI2LTExLTE1VDA1OjUw%26utm_term%3Dfeed)",
    imageSrc: "/images/destinations/porto.jpg",
    imageCountry: "Portugalia",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },
  "madera-garajau-1599": {
    slug: "madera-garajau-1599",
    city: "Madera",
    country: "Portugalia",
    price: 1599,
    departure: "Warszawa",
    nights: 3,
    dates: "15–18 listopada 2026",
    board: "Śniadania",
    hotel: "Garajau Madeira Hotel",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1267664_1267732)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fportugalia%2Fmadera%2Fcaniico-de-baixo%2Fdom-pedro-garajau-madeira%3FKEY%3DMjE1NzQ3NnwzMTc2OTY2NzMzfDEyNjc3MzI%26DS%3D1024%26GIATA%3D2210%26D%3D63348%26HID%3D421748%26MT%3D1%26DI%3DGT06-BB%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-08%257C2026-12-02%26RD%3D2026-11-18%26DD%3D2026-11-15%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D3850%26TT%3D1%26PID%3D421748%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-11-15%26IFC%3DVzZ8MTUzNnwyMDI2LTExLTE4VDE2OjQw%26OFC%3DVzZ8MTUzNXwyMDI2LTExLTE1VDExOjI1%26utm_term%3Dfeed)",
    imageSrc: "/images/destinations/madera.jpg",
    imageCountry: "Portugalia",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },
  "marsa-utopia-1970": {
    slug: "marsa-utopia-1970",
    city: "Marsa Alam",
    country: "Egipt",
    price: 1970,
    departure: "Warszawa-Chopina",
    nights: 7,
    dates: "17–24 grudnia 2026",
    board: "All Inclusive",
    hotel: "Utopia Beach Club",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fegipt%2Fmarsa-alam%2Futopia-beach-club-rmf18092",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/RMF18092/S21/18050431.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Egipt",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },
  "gambia-bamboo-2421": {
    slug: "gambia-bamboo-2421",
    city: "Gambia",
    country: "Gambia",
    price: 2421,
    departure: "Warszawa-Chopina",
    nights: 7,
    dates: "4–12 grudnia 2026",
    board: "Śniadania",
    hotel: "Bamboo Garden",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fgambia%2Fbamboo-garden-bjl30130",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/BJL30130/w2627/39487810.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Gambia",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },
  "kenia-voyager-4419": {
    slug: "kenia-voyager-4419",
    city: "Kenia",
    country: "Kenia",
    price: 4419,
    departure: "Warszawa-Chopina",
    nights: 7,
    dates: "1–9 grudnia 2026",
    board: "All Inclusive",
    hotel: "Voyager Beach Resort",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fkenia%2Fvoyager-beach-resort-mba11015",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/MBA11015/S18/8151929.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Kenia",
    checkedAt: "2026-09-28T14:33:00+02:00",
    status: "active",
  },
  "malta-canifor-789": {
    slug: "malta-canifor-789",
    city: "Qawra",
    country: "Malta",
    price: 789,
    departure: "Warszawa–Modlin",
    nights: 7,
    dates: "12–19 grudnia 2026",
    board: "Bez wyżywienia",
    hotel: "Canifor 4★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fmalta%2Fwyspa-malta%2Fqawra%2Fcanifor-hotel%3FDD%3D2026-12-12%26RD%3D2026-12-19%26NN%3D7",
    imageSrc: "/images/destinations/valletta.jpg",
    imageCountry: "Malta",
    checkedAt: "2026-09-28T11:47:00+02:00",
    status: "active",
  },
  "rzym-artis-621": {
    slug: "rzym-artis-621",
    city: "Rzym",
    country: "Włochy",
    price: 621,
    departure: "Kraków",
    nights: 2,
    dates: "27–29 stycznia 2027",
    board: "Bez wyżywienia",
    hotel: "Artis (Rzym)",
    partner: "wakacje",
    partnerLabel: "Wakacje.pl",
    affiliateUrl: "https://www.wakacje.pl/oferty/wlochy/lazio/rzym/artis-rzym-758531.html?utm_source=travellead&utm_medium=cps&utm_campaign=3212-tripownia.pl&a_aid=3212&a_cid=tripownia",
    imageSrc: "/images/destinations/rzym.jpg",
    imageCountry: "Włochy",
    checkedAt: "2026-09-28T09:49:00+02:00",
    status: "active",
  },

  "rodos-stamos-2116": {
    slug: "rodos-stamos-2116",
    city: "Rodos",
    country: "Grecja",
    price: 2116,
    departure: "Katowice",
    nights: 7,
    dates: "26 października – 2 listopada 2026",
    board: "All Inclusive",
    hotel: "Stamos Hotel",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fgrecja%2Frodos%2Fstamos-hotel-rho13034%2FOfferCodeWS%2FKTWRHO20261026000520261026202611020420L07RHO130347BEAA02ROA7BEA02FCYY",
    imageSrc: "/images/destinations/rodos.jpg",
    imageCountry: "Grecja",
    checkedAt: "2026-09-28T11:20:00+02:00",
    status: "active",
  },
  "teneryfa-alua-2841": {
    slug: "teneryfa-alua-2841",
    city: "Teneryfa",
    country: "Hiszpania",
    price: 2841,
    departure: "m.in. Warszawa",
    nights: 7,
    dates: "10–17 grudnia 2026",
    board: "All Inclusive",
    hotel: "Alua Atlantico Golf 4★",
    partner: "wakacje",
    partnerLabel: "Wakacje.pl",
    affiliateUrl: "https://www.wakacje.pl/oferty/hiszpania/teneryfa/golf-del-sur/alua-atlantico-golf-ex-aguamarina-golf-1114610.html?od-2026-12-10,7-dni,all-inclusive&utm_source=travellead&utm_medium=cps&utm_campaign=3212-tripownia.pl&a_aid=3212&a_cid=tripownia",
    imageSrc: "/images/destinations/teneryfa.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-09-28T11:20:00+02:00",
    status: "active",
  },
  "sal-riu-funana-3927": {
    slug: "sal-riu-funana-3927",
    city: "Sal",
    country: "Wyspy Zielonego Przylądka",
    price: 3927,
    departure: "Warszawa",
    nights: 7,
    dates: "14–21 grudnia 2026",
    board: "All Inclusive",
    hotel: "Riu Funana 5★",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fwyspy-zielonego-przyladka%2Fwyspa-sal%2Friu-funana-sid10006%2FOfferCodeWS%2FWAWSID20261214055520261214202612212110L07SID10006DZX1AA02ROADZX1A02FCYY",
    checkedAt: "2026-09-28T11:20:00+02:00",
    status: "active",
  },
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
  const normalizedSlug = slug.toLocaleLowerCase("pl");
  const offer = SOCIAL_OFFERS[normalizedSlug] || null;
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
