export type SocialOfferPartner = "exim" | "esky" | "tui" | "wakacje" | "booking" | "kiwi" | "getyourguide" | "other";

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
  included?: string[];
};

const ALLOWED_PARTNER_HOSTS = [
  "reklamy.exim.pl",
  "exim.pl",
  "www.exim.pl",
  "esky.pl",
  "www.esky.pl",
  "www2.esky.pl",
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
  "zanzibar-nest-style-3227": {
    slug: "zanzibar-nest-style-3227",
    city: "Zanzibar",
    country: "Tanzania",
    price: 3227,
    departure: "Wrocław",
    nights: 7,
    dates: "24 marca – 1 kwietnia 2027",
    board: "Śniadania",
    hotel: "Nest Style Zanzibar",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://www.tui.pl/wypoczynek/zanzibar/nest-style-zanzibar-znz20006/OfferCodeWS/WROZNZ20270324030020270324202703311615L07ZNZ20006DZG1GA02ROGDZG1A02FCYY?utm_source=tradedoubler&utm_medium=afiliacja&utm_campaign=link-nowy&tduid=464e0afa0d9a060d7f05f6f5abfd0c5c&ds_rl=1263345&gclid=CJ-kj6GvqJcDFV5uFQgd1Hsm8A&gclsrc=ds&gad_source=7",
    imageCountry: "Tanzania",
    checkedAt: "2026-10-07T19:40:00+02:00",
    status: "active",
  },
  "sylwester-alanya-arsi-enfi-2259": {
    slug: "sylwester-alanya-arsi-enfi-2259",
    city: "Alanya",
    country: "Turcja",
    price: 2259,
    departure: "Kraków",
    nights: 7,
    dates: "28 grudnia 2026 – 4 stycznia 2027",
    board: "All Inclusive",
    hotel: "Arsi Enfi City Beach 3★",
    partner: "wakacje",
    partnerLabel: "Wakacje.pl",
    affiliateUrl: "https://www.wakacje.pl/oferty/turcja/riwiera-turecka/alanya/arsi-enfi-city-beach-589305.html?od-2026-12-28%2C7-dni%2Call-inclusive%2Cz-krakowa=&a_aid=3212&a_cid=tripownia&utm_source=chatgpt.com&utm_medium=cps&utm_campaign=3212-tripownia.pl",
    imageSrc: "https://i.wakacje.pl/no-index/hotel/arsi-enfi-city-beach-basen-zjezdzalnia-1484577709-1200-800.jpg",
    imageCountry: "Turcja",
    checkedAt: "2026-10-07T15:05:00+02:00",
    status: "active",
  },
  "madera-dorisol-estrelicia-1409": {
    slug: "madera-dorisol-estrelicia-1409",
    city: "Madera / Funchal",
    country: "Portugalia",
    price: 1409,
    departure: "Samolot",
    nights: 4,
    dates: "13–17 czerwca 2027",
    board: "Śniadania",
    hotel: "Dorisol Estrelicia 3★",
    partner: "wakacje",
    partnerLabel: "Wakacje.pl",
    affiliateUrl: "https://www.wakacje.pl/oferty/portugalia/madera/funchal/dorisol-estrelicia-1195167.html?od-2027-06-13%2C4-dni%2CBB=",
    imageSrc: "https://i.wakacje.pl/no-index/hotel/dorisol-estrelicia-teren-hotelu-1465445823-1200-800.jpg",
    imageCountry: "Portugalia",
    checkedAt: "2026-10-07T15:10:00+02:00",
    status: "active",
  },
  "algarve-brisa-sol-1189": {
    slug: "algarve-brisa-sol-1189",
    city: "Algarve",
    country: "Portugalia",
    price: 1189,
    departure: "Katowice",
    nights: 3,
    dates: "2–6 kwietnia 2027",
    board: "Bez wyżywienia",
    hotel: "Brisa Sol 4★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://www.exim.pl/kierunki/portugalia/algarve/albufeira/brisa-sol?KEY=MjUzNTk1N3wzNzc1MTkyNjA4fDEzODAzMDQ&DS=1024&GIATA=9279&D=63208&HID=424611&MT=6&DI=GT06-AO&NN=3&MNN=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&NNM=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&DF=2027-03-26%7C2027-04-20&RD=2027-04-06&DD=2027-04-02&ERM=0&AC1=2&KC1=0&IC1=0&TO=1862&TT=1&PID=424611&DPR=EXIM+TOURS+POLAND&PC=3-2027-04-02&IFC=VzZ8MTA5OHwyMDI3LTA0LTA1VDIwOjMw&OFC=VzZ8MTA5N3wyMDI3LTA0LTAyVDE2OjUw&utm_term=feed&tduid=1c28f57c22c93726771b26b5ccaac104&utm_source=Tradedoubler_3487177&utm_medium=Affiliate&utm_campaign=Ongoing_P_TD",
    imageCountry: "Portugalia",
    checkedAt: "2026-10-07T09:43:00+02:00",
    status: "active",
    included: ["Transfer", "Ubezpieczenie"],
  },
  "alicante-929": {
    slug: "alicante-929",
    city: "Alicante",
    country: "Hiszpania",
    price: 929,
    departure: "Warszawa–Chopina",
    nights: 3,
    dates: "24–27 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Hotel La City Estación 3★",
    partner: "esky",
    partnerLabel: "eSky",
    affiliateUrl: "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&stayLength=3:5&arrivalPlaces=ci-ALC&departurePlaces=ap-WAW&context=pl-packages&sort%5BTotalPrice%5D=asc&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=361b3f6d-5996-4df2-9f71-e25f1b8850cb&packageId=MjYxMTI0OjM6cGw6MTM1MjA0&flightOptionId=V0FXQUxDMjYxMTI0Nzh8fEZSNjA3MzowOjAsQUxDV0FXMjYxMTI3NzhJfHxGUjYwNzI6MDox&departureCode=WAW&arrivalCode=ALC&checkInDate=2026-11-24&checkOutDate=2026-11-27&destinationDepartureDate=2026-11-24&returnArrivalDate=2026-11-27&metaCode=135204&pricePresentation=perpax&selectedDeparturePlaces=ap-WAW",
    imageCountry: "Hiszpania",
    checkedAt: "2026-10-06T20:04:00+02:00",
    status: "active",
  },
  "wieden-469": {
    slug: "wieden-469",
    city: "Wiedeń",
    country: "Austria",
    price: 469,
    departure: "Kraków",
    nights: 2,
    dates: "25–27 października 2026",
    board: "wg oferty",
    hotel: "Pakiet lot + hotel",
    partner: "esky",
    partnerLabel: "eSky",
    affiliateUrl: "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?context=pl-packages&packageId=MjYxMDI1OjI6cGw6MTE5NjEw&metaCode=119610&rooms%5B0%5D%5Badults%5D=2&departureCode=KRK&checkInDate=2026-10-25&checkOutDate=2026-10-27&destinationDepartureDate=2026-10-25&returnArrivalDate=2026-10-27&partner_id=TRIPOWNIAPLPACKAGES&departurePlaces=ap-GDN,ap-KTW,ap-KRK,ap-WAW,ap-WRO,ap-WMI&selectedDeparturePlaces=ap-GDN,ap-KTW,ap-KRK,ap-WAW",
    imageCountry: "Austria",
    checkedAt: "2026-10-05T16:00:00+02:00",
    status: "active",
  },
  "costa-brava-tossa-1139": {
    slug: "costa-brava-tossa-1139",
    city: "Tossa de Mar",
    country: "Hiszpania",
    price: 1139,
    departure: "Warszawa–Modlin",
    nights: 4,
    dates: "26–30 października 2026",
    board: "Bez wyżywienia",
    hotel: "Don Juan Tossa 4★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://www.exim.pl/kierunki/hiszpania/costa-brava/tossa-de-mar/don-juan-tossa-hotel?KEY=MjMyNTk2OHwzNDY0MjA4MTM2fDExNjQ1MDQ&DS=1024&GIATA=6281&D=63242&HID=422275&MT=6&DI=GT06-AO&NN=4&MNN=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&NNM=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&DF=2026-10-19%7C2026-11-13&RD=2026-10-30&DD=2026-10-26&ERM=0&AC1=2&KC1=0&IC1=0&TO=4380&TT=1&PID=422275&DPR=EXIM+TOURS+POLAND&PC=4-2026-10-26&IFC=RlJ8NDA4NHwyMDI2LTEwLTMwVDEwOjMw&OFC=RlJ8NDA4M3wyMDI2LTEwLTI2VDE2OjA1&utm_term=feed&tduid=1c28f57c22c93726771b26b5ccaac104&utm_source=Tradedoubler_3487177&utm_medium=Affiliate&utm_campaign=Ongoing_P_TD",
    imageSrc: "https://img.exim.pl/hotels/300/spanelsko/costa-brava/tossa-de-mar/don-juan-tossa-pl/7710/6eeca13bf8747636a7341e8204850334_ludi2400-244.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-10-04T18:06:00+02:00",
    status: "active",
    included: ["Transfer", "Ubezpieczenie", "Opieka organizatora"],
  },
  "bari-alberobello-669": {
    slug: "bari-alberobello-669",
    city: "Bari + Alberobello",
    country: "Włochy",
    price: 669,
    departure: "Warszawa–Modlin → Brindisi",
    nights: 2,
    dates: "20–23 października 2026",
    board: "Śniadanie",
    hotel: "B&B Giardino dei Frutti",
    partner: "esky",
    partnerLabel: "eSky",
    affiliateUrl: "https://www2.esky.pl/lot+hotel/portfolio?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&stayLength=2:4&arrivalPlaces=ci-BRI&context=pl-packages&departureCode=WMI&arrivalCode=BDS&checkInDate=2026-10-20&checkOutDate=2026-10-22&destinationDepartureDate=2026-10-20&returnArrivalDate=2026-10-23&metaCode=708503&pricePresentation=perpax&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=e699796d-f08a-4123-94ee-3e4b66a0c737",
    imageCountry: "Włochy",
    checkedAt: "2026-10-02T20:49:00+02:00",
    status: "active",
  },
  "malaga-959": {
    slug: "malaga-959",
    city: "Malaga",
    country: "Hiszpania",
    price: 959,
    departure: "Warszawa",
    nights: 5,
    dates: "21–26 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Feel Hostels City Center",
    partner: "esky",
    partnerLabel: "eSky",
    affiliateUrl: "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?arrivalPlaces=ci-AGP&context=pl-packages&datesTab=months&departureDate=2026-11-01&departurePlaces=ap-WAW,ap-WMI&mustIncludeWeekend=true&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=8cee4294-841e-48ac-b437-ad0f10a091a5&returnDate=2026-11-30&rooms%5B0%5D%5Badults%5D=2&sort%5BTotalPrice%5D=asc&stayLength=5:7&utm_source=chatgpt.com&packageId=MjYxMTIxOjU6cGw6Mzc0NDY1&flightOptionId=V0FXQUdQMjYxMTIxNzh8fEZSMTM5NzowOjAsQUdQV0FXMjYxMTI2NzhJfHxGUjEzOTY6MDox&departureCode=WAW&arrivalCode=AGP&checkInDate=2026-11-21&checkOutDate=2026-11-26&destinationDepartureDate=2026-11-21&returnArrivalDate=2026-11-26&metaCode=374465&pricePresentation=perpax&selectedDeparturePlaces=ap-WAW,ap-WMI",
    imageSrc: "/images/destinations/malaga.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-10-03T10:40:00+02:00",
    status: "active",
  },
  "ateny-marina-1099": {
    slug: "ateny-marina-1099",
    city: "Ateny",
    country: "Grecja",
    price: 1099,
    departure: "Katowice",
    nights: 4,
    dates: "23–28 listopada 2026",
    board: "Śniadanie",
    hotel: "Marina Athens Hotel",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1249540_1249469)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fgrecja%2Fateny-i-okolice%2Fateny%2Fmarina-athens-hotel%3FKEY%3DMjE5MDkxMHwzMTM5MjM1Mjc3fDEyNDk0Njk%26DS%3D1024%26GIATA%3D51969%26D%3D63219%26HID%3D420740%26MT%3D1%26DI%3DGT06-BB%26NN%3D4%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-16%257C2026-12-12%26RD%3D2026-11-28%26DD%3D2026-11-23%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1862%26TT%3D1%26PID%3D420740%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D4-2026-11-23%26IFC%3DVzZ8MTEyMnwyMDI2LTExLTI3VDIzOjM1%26OFC%3DVzZ8MTEyMXwyMDI2LTExLTIzVDA1OjMw%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/recko/ateny/ateny/marina-athens-hotel-pl/7964/ba1d1ac3a9f8bd2e09b18cd4943db999_marina-244.jpg",
    imageCountry: "Grecja",
    checkedAt: "2026-10-03T07:55:36+02:00",
    status: "active",
  },
  "kalabria-sciaron-1289": {
    slug: "kalabria-sciaron-1289",
    city: "Kalabria",
    country: "Włochy",
    price: 1289,
    departure: "Kraków",
    nights: 3,
    dates: "18–21 października 2026",
    board: "2 posiłki",
    hotel: "Sciaron",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1187889_1187825)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fwlochy%2Fcalabria%2Fricadi-capo-vaticano%2Fsciaron%3FKEY%3DMTg4MTU3OXwyNDIyMzQ5NzczfDExODc4MjU%26DS%3D1024%26GIATA%3D1513%26D%3D63296%26HID%3D426015%26MT%3D2%26DI%3DGT06-HB%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-10-11%257C2026-11-04%26RD%3D2026-10-21%26DD%3D2026-10-18%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1825%26TT%3D1%26PID%3D426015%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-10-18%26IFC%3DRlJ8NTE0NHwyMDI2LTEwLTIxVDEyOjU1%26OFC%3DRlJ8NTE0NXwyMDI2LTEwLTE4VDExOjI1%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/italie/kalabrie/ricadi-capo-vaticano/sciaron/dbad6a6f218f9dfbf55dd393ce94d233_215844472.jpg",
    imageCountry: "Włochy",
    checkedAt: "2026-09-30T20:33:00+02:00",
    status: "active",
  },
  "agadir-borjs-899": {
    slug: "agadir-borjs-899",
    city: "Agadir",
    country: "Maroko",
    price: 899,
    departure: "Wrocław",
    nights: 3,
    dates: "3–6 listopada 2026",
    board: "Śniadanie",
    hotel: "Borjs Hotel Suites & Spa",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1327017_1327088)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fmaroko%2Fwybrzeze-atlantyku%2Fagadir%2Fborjs-hotel-suites-a-spa%3FKEY%3DMjM5MDMxN3wzNTU5NTAwNzU0fDEzMjcwODg%26DS%3D1024%26GIATA%3D874882%26D%3D63707%26HID%3D424573%26MT%3D1%26DI%3DGT06-BB%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-10-27%257C2026-11-20%26RD%3D2026-11-06%26DD%3D2026-11-03%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D3911%26TT%3D1%26PID%3D424573%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-11-03%26IFC%3DRlJ8ODE3NnwyMDI2LTExLTA2VDEwOjQw%26OFC%3DRlJ8ODE3N3wyMDI2LTExLTAzVDA2OjU1%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/maroko/atlantske-pobrezi/agadir/borjs-hotel-suites-a-spa/2735/6a7d2227e1d0939ab0a07-244.jpg",
    imageCountry: "Maroko",
    checkedAt: "2026-10-03T07:55:36+02:00",
    status: "active",
  },
  "zakynthos-alexander-1859": {
    slug: "zakynthos-alexander-1859",
    city: "Zakynthos",
    country: "Grecja",
    price: 1859,
    departure: "Warszawa",
    nights: 7,
    dates: "2–9 października 2026",
    board: "All Inclusive",
    hotel: "Alexander The Great",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1125601_1125580)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fgrecja%2Fzakynthos%2Flaganas%2Falexander-the-great%3FKEY%3DMTkwNjE3MHwzMDEyNDc2NDY3fDExMjU1ODA%26DS%3D1024%26GIATA%3D234943%26D%3D63471%26HID%3D423551%26MT%3D5%26DI%3DGT06-AI%26NN%3D7%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-09-29%257C2026-10-23%26RD%3D2026-10-09%26DD%3D2026-10-02%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D3850%26TT%3D1%26PID%3D423551%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D7-2026-10-02%26IFC%3DRU5UfDE1NTZ8MjAyNi0xMC0wOVQxMDozNQ--%26OFC%3DRU5UfDE1NTV8MjAyNi0xMC0wMlQwNTo1NQ--%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/recko/zakynthos/laganas/alexander-the-great-pl/2059/45e9beb214cd4fe4146_2-244.jpg",
    imageCountry: "Grecja",
    checkedAt: "2026-09-30T16:21:08+02:00",
    status: "expired",
  },
  "durres-albanian-star-969": {
    slug: "durres-albanian-star-969",
    city: "Durrës",
    country: "Albania",
    price: 969,
    departure: "Warszawa–Modlin",
    nights: 3,
    dates: "13–16 listopada 2026",
    board: "Śniadanie",
    hotel: "Albanian Star",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1325032_1324898)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Falbania%2Fdurres%2Fdurres%2Falbanian-star-hotel%3FKEY%3DMjM3NzY0NHwzNTQzMTc2NDkyfDEzMjQ4OTg%26DS%3D1024%26GIATA%3D613609%26D%3D63258%26HID%3D425082%26MT%3D1%26DI%3DGT06-BB%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-06%257C2026-11-30%26RD%3D2026-11-16%26DD%3D2026-11-13%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D4380%26TT%3D1%26PID%3D425082%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-11-13%26IFC%3DRlJ8ODQxM3wyMDI2LTExLTE2VDA2OjIw%26OFC%3DRlJ8ODQxNHwyMDI2LTExLTEzVDA4OjUw%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/albanie/durres/drac/albanian-star-pl/2516/2f83bfffe2f09fa88f213-244.jpg",
    imageCountry: "Albania",
    checkedAt: "2026-09-30T16:21:08+02:00",
    status: "active",
  },
  "costa-dorada-salou-1899": {
    slug: "costa-dorada-salou-1899",
    city: "Costa Dorada",
    country: "Hiszpania",
    price: 1899,
    departure: "Warszawa–Modlin",
    nights: 7,
    dates: "13–20 października 2026",
    board: "2 posiłki",
    hotel: "4R Salou Park Resort I",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1164343_1164533)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fhiszpania%2Fcosta-dorada%2Fsalou%2F4r-salou-park-resort-i%3FKEY%3DMjA2NTk2NXwyNzM2NDU0ODAzfDExNjQ1MzM%26DS%3D1024%26GIATA%3D20888%26D%3D63245%26HID%3D441671%26MT%3D2%26DI%3DGT06-HB%26NN%3D7%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-10-06%257C2026-11-03%26RD%3D2026-10-20%26DD%3D2026-10-13%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D4380%26TT%3D1%26PID%3D441671%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D7-2026-10-13%26IFC%3DRlJ8NDA4NHwyMDI2LTEwLTIwVDA1OjU1%26OFC%3DRlJ8NDA4M3wyMDI2LTEwLTEzVDA5OjI1%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/spanelsko/costa-dorada/salou/4r-salou-park-resort-i/1b3a8f51e989a54b32fd4.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-09-30T16:20:45+02:00",
    status: "active",
  },
  "malediwy-summer-island-7429": {
    slug: "malediwy-summer-island-7429",
    city: "Malediwy",
    country: "Malediwy",
    price: 7429,
    departure: "Kraków",
    nights: 6,
    dates: "18–25 listopada 2026",
    board: "2 posiłki",
    hotel: "Summer Island",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1250918_1250917)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fmalediwy%2Fbaa-atol%2Fbaa-atol%2Fsummer-island%3FKEY%3DMjIxNjIzNnwzMTU0ODkzNDE1fDEyNTA5MTc%26DS%3D1024%26GIATA%3D1772%26D%3D220441%26HID%3D422447%26MT%3D2%26DI%3DGT06-HB%26NN%3D6%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-11%257C2026-12-09%26RD%3D2026-11-25%26DD%3D2026-11-18%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1825%26TT%3D1%26PID%3D422447%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D6-2026-11-18%26IFC%3DRlp8RloxNzg4LCBGWjEwMjUsIEZaMTU3MCwgRloxNzg3fDIwMjYtMTEtMjRUMjM6MzA-%26OFC%3DRlp8RloxNzg4LCBGWjEwMjUsIEZaMTU3MCwgRloxNzg3fDIwMjYtMTEtMTdUMTI6MTA-%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/maledivy/maledivy/baa-atol/summer-island/b09a5e_infinity_pool7.jpg",
    imageCountry: "Malediwy",
    checkedAt: "2026-09-30T16:20:43+02:00",
    status: "active",
  },
  "cefalu-santa-lucia-1619": {
    slug: "cefalu-santa-lucia-1619",
    city: "Cefalù",
    country: "Włochy",
    price: 1619,
    departure: "Warszawa–Modlin",
    nights: 3,
    dates: "20–23 października 2026",
    board: "Śniadanie",
    hotel: "Santa Lucia & Sabbie d'Oro 3★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fwlochy%2Fsycylia%2Fcefalu%2Fsanta-lucia-a-sabbie-d-oro%3FDD%3D2026-10-20%26RD%3D2026-10-23%26NN%3D3%26DI%3DGT06-BB%26DPR%3DEXIM%2BTOURS%2BPOLAND",
    imageSrc: "/images/destinations/sycylia.jpg",
    imageCountry: "Włochy",
    checkedAt: "2026-09-30T06:04:00+02:00",
    status: "active",
  },
  "rodos-memphis-2399": {
    slug: "rodos-memphis-2399",
    city: "Rodos",
    country: "Grecja",
    price: 2399,
    departure: "Poznań",
    nights: 7,
    dates: "5–12 października 2026",
    board: "All Inclusive",
    hotel: "Memphis 3★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fgrecja%2Frodos%2Fkolymbia%2Fmemphis%3FDD%3D2026-10-05%26RD%3D2026-10-12%26NN%3D7%26DI%3DGT06-AI%26DPR%3DEXIM%2BTOURS%2BPOLAND",
    imageSrc: "/images/destinations/rodos.jpg",
    imageCountry: "Grecja",
    checkedAt: "2026-09-30T06:04:00+02:00",
    status: "active",
  },
  "albania-perandor-2749": {
    slug: "albania-perandor-2749",
    city: "Durrës",
    country: "Albania",
    price: 2749,
    departure: "Katowice",
    nights: 7,
    dates: "13–20 października 2026",
    board: "All Inclusive",
    hotel: "Perandor 4★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Falbania%2Fdurres%2Fdurres%2Fperandor-hotel%3FDD%3D2026-10-13%26RD%3D2026-10-20%26NN%3D7%26DI%3DGT06-AI%26DPR%3DEXIM%2BTOURS%2BPOLAND",
    imageSrc: "/images/destinations/riwiera-albanska.jpg",
    imageCountry: "Albania",
    checkedAt: "2026-09-30T06:04:00+02:00",
    status: "active",
  },
  "teneryfa-tropical-park-3011": {
    slug: "teneryfa-tropical-park-3011",
    city: "Teneryfa",
    country: "Hiszpania",
    price: 3011,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "10–17 grudnia 2026",
    board: "All Inclusive",
    hotel: "Tropical Park",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fwyspy-kanaryjskie%2Fteneryfa%2Ftropical-park-tfs08010%2FOfferCodeWS%2FWAWTFS20261210090520261210202612171450L07TFS08010APX1AA02ROAAPX1A02FCYY",
    imageSrc: "/images/destinations/teneryfa.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-09-30T06:04:00+02:00",
    status: "active",
  },
  "dominikana-bluebay-6007": {
    slug: "dominikana-bluebay-6007",
    city: "Puerto Plata",
    country: "Dominikana",
    price: 6007,
    departure: "Kraków",
    nights: 7,
    dates: "3–11 grudnia 2026",
    board: "All Inclusive",
    hotel: "BlueBay Villas Doradas 4★",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fdominikana%2Fpuerto-plata%2Fbluebay-villas-doradas-pop20015%2FOfferCodeWS%2FKRKPOP20261203060020261203202612102040L07POP20015DZX1AA02ROADZX1A02FCKK",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/POP20015/S26/41303068.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Dominikana",
    checkedAt: "2026-09-30T06:04:00+02:00",
    status: "active",
  },
  "lizbona-alcobia-1069": {
    slug: "lizbona-alcobia-1069",
    city: "Lizbona",
    country: "Portugalia",
    price: 1069,
    departure: "Poznań",
    nights: 3,
    dates: "12–15 grudnia 2026",
    board: "Bez wyżywienia",
    hotel: "Grande Pensao Alcobia 2★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fportugalia%2Fwybrzeze-lizbonskie%2Flizbona%2Fgrande-pensao-alcobia%3FKEY%3DMjM0OTA2OHwzNDk4Nzc3NDQwfDEzMjk4NDQ%253D%26DS%3D1024%26GIATA%3D66287%26D%3D63343%26HID%3D446426%26MT%3D6%26DI%3DGT06-AO%26NN%3D3%26MNN%3D3%26NNM%3D3%26DF%3D2026-12-05%257C2026-12-29%26RD%3D2026-12-15%26DD%3D2026-12-12%26ERM%3D0%26TO%3D2854%26TT%3D1%26PID%3D446426%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-12-12%26IFC%3DRlJ8OTU3NHwyMDI2LTEyLTE1VDA5OjM1%26OFC%3DRlJ8OTU3NXwyMDI2LTEyLTEyVDEzOjA1",
    imageSrc: "https://img.exim.pl/hotels/720/portugalsko/lisabon/lisabon/grande-pensao-alcobia/1eaef32e23ab523c3b08a.jpg",
    imageCountry: "Portugalia",
    checkedAt: "2026-09-30T06:00:00+02:00",
    status: "active",
  },
  "agadir-omega-1059": {
    slug: "agadir-omega-1059",
    city: "Agadir",
    country: "Maroko",
    price: 1059,
    departure: "Wrocław",
    nights: 7,
    dates: "8–15 grudnia 2026",
    board: "Bez wyżywienia",
    hotel: "Omega 3★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fmaroko%2Fwybrzeze-atlantyku%2Fagadir%2Fomega-hotel%3FKEY%3DMjE1NjUzM3wzMzA2Nzk3NTU1fDEzMjcwOTM%253D%26DS%3D1024%26GIATA%3D261063%26D%3D63707%26HID%3D423882%26MT%3D6%26DI%3DGT06-AO%26NN%3D7%26MNN%3D7%257C8%257C9%257C10%26NNM%3D7%257C8%257C9%257C10%26DF%3D2026-12-01%257C2026-12-29%26RD%3D2026-12-15%26DD%3D2026-12-08%26ERM%3D0%26TO%3D3911%26TT%3D1%26PID%3D423882%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D7-2026-12-08%26IFC%3DRlJ8ODE3NnwyMDI2LTEyLTE1VDExOjA1%26OFC%3DRlJ8ODE3N3wyMDI2LTEyLTA4VDA2OjU1",
    imageSrc: "https://img.exim.pl/hotels/720/maroko/atlantske-pobrezi/agadir/omega-pl/4233/802af781f7db80709a0ed-244.JPG",
    imageCountry: "Maroko",
    checkedAt: "2026-09-30T06:00:00+02:00",
    status: "active",
  },
  "majorka-lagomonte-2039": {
    slug: "majorka-lagomonte-2039",
    city: "Majorka",
    country: "Hiszpania",
    price: 2039,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "21–28 października 2026",
    board: "All Inclusive",
    hotel: "TUI SUNEO Lagomonte",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fhiszpania%2Fmajorka%2Ftui-suneo-lagomonte-pmi83062%2FOfferCodeWS%2FWAWPMI20261021141520261021202610281705L07PMI83062DZX2AA02ROADZX2A02FCYY",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/PMI83062/S26/33916879.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Hiszpania",
    checkedAt: "2026-09-30T06:00:00+02:00",
    status: "active",
  },
  "fuerteventura-royal-suite-2696": {
    slug: "fuerteventura-royal-suite-2696",
    city: "Fuerteventura",
    country: "Hiszpania",
    price: 2696,
    departure: "Kraków",
    nights: 6,
    dates: "16–22 grudnia 2026",
    board: "All Inclusive",
    hotel: "Hotel Royal Suite",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fwyspy-kanaryjskie%2Ffuerteventura%2Fhotel-royal-suite-fue22019%2FOfferCodeWS%2FKRKFUE20261216063520261216202612221140L06FUE22019FZX1AA02ROAFZX1A02FCMM",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/FUE22019/w2021/17096556.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Hiszpania",
    checkedAt: "2026-09-30T06:00:00+02:00",
    status: "active",
  },
  "gran-canaria-turbo-club-2764": {
    slug: "gran-canaria-turbo-club-2764",
    city: "Gran Canaria",
    country: "Hiszpania",
    price: 2764,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "30 marca – 6 kwietnia 2027",
    board: "All Inclusive",
    hotel: "Aparthotel Turbo Club",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fwyspy-kanaryjskie%2Fgran-canaria%2Faparthotel-turbo-club-lpa41032%2FOfferCodeWS%2FWAWLPA20270330080020270330202704061330L07LPA41032APZ1AA02ROAAPZ1A02FCYY",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/LPA41032/S20/14625529.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Hiszpania",
    checkedAt: "2026-09-30T06:00:00+02:00",
    status: "active",
  },
  "majorka-ilusion-2759": {
    slug: "majorka-ilusion-2759",
    city: "Majorka",
    country: "Hiszpania",
    price: 2759,
    departure: "Warszawa–Modlin",
    nights: 7,
    dates: "7–14 października 2026",
    board: "All Inclusive",
    hotel: "Ilusion Vista Blava 3★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fhiszpania%2Fmajorka%2Fcala-millor%2Filusion-vista-blava%3FKEY%3DMTg0NDE1OHwyMTk1MDgxMDc3fDExMTAxNjg%253D%26DS%3D1024%26GIATA%3D3186%26D%3D63350%26HID%3D422267%26MT%3D5%26DI%3DGT06-AI%26NN%3D7%26MNN%3D7%257C8%257C9%257C10%26NNM%3D7%257C8%257C9%257C10%26DF%3D2026-09-30%257C2026-10-28%26RD%3D2026-10-14%26DD%3D2026-10-07%26ERM%3D0%26TO%3D298%26TT%3D1%26PID%3D422267%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D7-2026-10-07%26IFC%3DRlJ8WFhYfDIwMjYtMTAtMTRUMDA6MDA-%26OFC%3DRlJ8WFhYfDIwMjYtMTAtMDdUMDA6MDA-",
    checkedAt: "2026-09-29T21:12:00+02:00",
    status: "active",
  },
  "marbella-bluebay-1219": {
    slug: "marbella-bluebay-1219",
    city: "Marbella",
    country: "Hiszpania",
    price: 1219,
    departure: "Warszawa",
    nights: 3,
    dates: "16–19 listopada 2026",
    board: "Śniadanie",
    hotel: "BlueBay Banús 4★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fhiszpania%2Fcosta-del-sol%2Fmarbella%2Fbluebay-banus%3FD%3D63213%26DD%3D2026-11-16%26DF%3D2026-11-09%257C2026-12-03%26DI%3DGT06-BB%26DPR%3DEXIM%2BTOURS%2BPOLAND%26DS%3D1024%26ERM%3D0%26GIATA%3D2421%26HID%3D429113%26IFC%3DRlJ8MTM5NnwyMDI2LTExLTE5VDA2OjQ1%26KEY%3DMjM3MDc3M3wzNTM4MTIyMDY2fDEzMjc2MjA%253D%26MNN%3D3%26MT%3D1%26NN%3D3%26NNM%3D3%26OFC%3DRlJ8MTM5N3wyMDI2LTExLTE2VDEyOjMw%26PC%3D3-2026-11-16%26PID%3D429113%26RD%3D2026-11-19%26TO%3D3850%26TT%3D1",
    checkedAt: "2026-09-29T18:39:00+02:00",
    status: "active",
  },
  "fuerteventura-royal-suite-2769": {
    slug: "fuerteventura-royal-suite-2769",
    city: "Fuerteventura",
    country: "Hiszpania",
    price: 2769,
    departure: "Katowice",
    nights: 7,
    dates: "14–21 grudnia 2026",
    board: "All Inclusive",
    hotel: "Royal Suite 3★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fhiszpania%2Ffuerteventura%2Fcosta-calma%2Fhotel-royal-suite%3FD%3D74459%26DD%3D2026-12-14%26DF%3D2026-12-07%257C2027-01-04%26DI%3DGT06-AI%26DPR%3DEXIM%2BTOURS%2BPOLAND%26DS%3D1024%26ERM%3D0%26GIATA%3D12016%26HID%3D421105%26IFC%3DVzZ8MTA4NHwyMDI2LTEyLTIxVDEyOjMw%26KEY%3DMjE5MDUwOXwzMTM1NTc3MzMyfDEyNDgyMDE%253D%26MNN%3D7%257C8%257C9%257C10%26MT%3D5%26NN%3D7%26NNM%3D7%257C8%257C9%257C10%26OFC%3DVzZ8MTA4M3wyMDI2LTEyLTE0VDA3OjEw%26PC%3D7-2026-12-14%26PID%3D421105%26RD%3D2026-12-21%26TO%3D1862%26TT%3D1",
    checkedAt: "2026-09-29T18:39:00+02:00",
    status: "active",
  },
  "sri-lanka-loty-2798": {
    slug: "sri-lanka-loty-2798",
    city: "Kolombo",
    country: "Sri Lanka",
    price: 2798,
    departure: "Warszawa",
    nights: 9,
    dates: "21–30 listopada 2026",
    board: "Lot RT • 1 przesiadka",
    hotel: "Tylko lot",
    partner: "kiwi",
    partnerLabel: "Kiwi.com",
    affiliateUrl: "https://c111.travelpayouts.com/click?shmarker=740301.TRIPOWNIAPL&promo_id=3791&source_type=customlink&type=click&custom_url=https%3A%2F%2Fwww.kiwi.com%2Fdeep%3Ffrom%3DWAW%26to%3DCMB%26departure%3D2026-11-21%26return%3D2026-11-30",
    checkedAt: "2026-09-29T15:46:00+02:00",
    status: "active",
  },
  "malediwy-dhiguveli-6122": {
    slug: "malediwy-dhiguveli-6122",
    city: "Malediwy",
    country: "Malediwy",
    price: 6122,
    departure: "Warszawa–Chopina",
    nights: 6,
    dates: "29 marca – 5 kwietnia 2027",
    board: "Śniadanie",
    hotel: "Dhiguveli Maldives",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fmalediwy%2Fdhiguveli-maldives-mle60007%2FOfferCodeWS%2FWAWMLE20270329150020270330202704050930L06MLE60007DZX1GA02ROGDZX1A02FCKK",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/MLE60007/w2526/33923269.jpg?dstw=1200&dsth=1191.044776119403&srcw=268&srch=266&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Malediwy",
    checkedAt: "2026-09-28T20:50:00+02:00",
    status: "active",
  },
  "jamajka-samsara-6715": {
    slug: "jamajka-samsara-6715",
    city: "Jamajka",
    country: "Jamajka",
    price: 6715,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "3–11 grudnia 2026",
    board: "All Inclusive",
    hotel: "Samsara Cliff Resort",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fjamajka%2Fsamsara-cliff-resort-mbj22011%2FOfferCodeWS%2FWAWMBJ20261203073020261203202612102255L07MBJ22011DZX1AA02ROADZX1A02FCTK",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/MBJ22011/w2627/37968783.jpg?dstw=1200&dsth=1191.044776119403&srcw=268&srch=266&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Jamajka",
    checkedAt: "2026-09-28T20:50:00+02:00",
    status: "active",
  },
  "dominikana-villa-taina-5763": {
    slug: "dominikana-villa-taina-5763",
    city: "Dominikana",
    country: "Dominikana",
    price: 5763,
    departure: "Kraków",
    nights: 7,
    dates: "3–11 grudnia 2026",
    board: "Bez wyżywienia",
    hotel: "Villa Taina",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fdominikana%2Fpuerto-plata%2Fvilla-taina-pop40022%2FOfferCodeWS%2FKRKPOP20261203060020261203202612102040L07POP40022DZX1UA02ROUDZX1A02FCKK",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/POP40022/S26/41302267.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Dominikana",
    checkedAt: "2026-09-28T20:50:00+02:00",
    status: "active",
  },
  "tajlandia-manhattan-4229": {
    slug: "tajlandia-manhattan-4229",
    city: "Tajlandia",
    country: "Tajlandia",
    price: 4229,
    departure: "Warszawa–Chopina",
    nights: 6,
    dates: "28 października – 5 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Manhattan Pattaya Hotel",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Ftajlandia%2Fbangkok%2Fmanhattan-pattaya-hotel-bkk30174%2FOfferCodeWS%2FWAWBKK20261028170020261029202611042300L06BKK301747ASUA02ROU7ASA02FCWQ",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/BKK30174/S26/39273702.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Tajlandia",
    checkedAt: "2026-09-28T20:50:00+02:00",
    status: "active",
  },
  "gambia-holiday-beach-2463": {
    slug: "gambia-holiday-beach-2463",
    city: "Gambia",
    country: "Gambia",
    price: 2463,
    departure: "Katowice",
    nights: 7,
    dates: "18–26 grudnia 2026",
    board: "Śniadanie",
    hotel: "Holiday Beach Club",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fgambia%2Fholiday-beach-club-bjl30001%2FOfferCodeWS%2FKTWBJL20261218101520261218202612251715L07BJL30001DZX5GA02ROGDZX5A02FCYY",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/BJL30001/w2627/37642219.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Gambia",
    checkedAt: "2026-09-28T20:50:00+02:00",
    status: "active",
  },
  "teneryfa-suneo-2689": {
    slug: "teneryfa-suneo-2689",
    city: "Teneryfa",
    country: "Hiszpania",
    price: 2689,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "10–17 grudnia 2026",
    board: "All Inclusive",
    hotel: "TUI SUNEO Globales Tamaimo Tropical",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fwyspy-kanaryjskie%2Fteneryfa%2Ftui-suneo-globales-tamaimo-tropical-tfs36006%2FOfferCodeWS%2FWAWTFS20261210090520261210202612171450L07TFS36006APZ1AA02ROAAPZ1A02FCYY",
    imageSrc: "/images/destinations/teneryfa.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-09-28T20:20:00+02:00",
    status: "active",
  },
  "kreta-bali-mare-1668": {
    slug: "kreta-bali-mare-1668",
    city: "Kreta",
    country: "Grecja",
    price: 1668,
    departure: "Warszawa–Chopina",
    nights: 7,
    dates: "14–21 października 2026",
    board: "All Inclusive",
    hotel: "Bali Mare",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fgrecja%2Fkreta%2Fbali-mare-her83020%2FOfferCodeWS%2FWAWCHQ20261014140520261014202610211855L07HER830207B3AA02ROA7B3A02FCYY",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/HER83020/S24/27234479.jpg?dstw=1157&dsth=621&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Grecja",
    checkedAt: "2026-10-01T12:24:00+02:00",
    status: "expired",
  },
  "bulgaria-ivana-palace-799": {
    slug: "bulgaria-ivana-palace-799",
    city: "Słoneczny Brzeg",
    country: "Bułgaria",
    price: 799,
    departure: "Kraków",
    nights: 3,
    dates: "8–12 października 2026",
    board: "Śniadania",
    hotel: "Ivana Palace 4★",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fbulgaria%2Fsloneczny-brzeg%2Fsloneczny-brzeg%2Fivana-palace%3FKEY%3DMTkwOTkwMXwyNTQ4NDQ3MjcyfDExODk4ODg%26DS%3D1024%26GIATA%3D61201%26D%3D63484%26HID%3D421445%26MT%3D1%26DI%3DGT06-BB%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-10-01%257C2026-10-26%26RD%3D2026-10-12%26DD%3D2026-10-08%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1825%26TT%3D1%26PID%3D421445%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-10-08%26IFC%3DRlJ8ODE5OXwyMDI2LTEwLTEyVDAwOjEw%26OFC%3DRlJ8ODE5OHwyMDI2LTEwLTA4VDEzOjE1%26utm_term%3Dfeed",
    imageSrc: "https://img.exim.pl/hotels/bulharsko/oblast-burgas/slunecne-pobrezi/ivana-palace-pl/7996/382bb3f9d7b43ae3dfdb9-244.jpg",
    imageCountry: "Bułgaria",
    checkedAt: "2026-10-01T20:39:00+02:00",
    status: "active",
  },
  "taormina-elios-1479": {
    slug: "taormina-elios-1479",
    city: "Taormina",
    country: "Włochy",
    price: 1479,
    departure: "Kraków",
    nights: 3,
    dates: "26–29 października 2026",
    board: "Śniadania",
    hotel: "Elios Hotel Taormina",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fwlochy%2Fsycylia%2Ftaormina%2Felios-hotel-taormina%3FKEY%3DMjE0MzY5N3wzMDM5Njk1Mjc3fDExOTIwNDQ%26DS%3D1024%26GIATA%3D82557%26D%3D63426%26HID%3D456206%26MT%3D1%26DI%3DGT06-BB%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-10-19%257C2026-11-12%26RD%3D2026-10-29%26DD%3D2026-10-26%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1825%26TT%3D1%26PID%3D456206%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-10-26%26IFC%3DRlJ8MjcyN3wyMDI2LTEwLTI5VDE5OjQw%26OFC%3DRlJ8MjcyNnwyMDI2LTEwLTI2VDExOjMw%26utm_term%3Dfeed",
    imageSrc: "https://img.exim.pl/hotels/italie/sicilie/taormina/elios-hotel-taormina/3639/d1d4148459f1940414c72a3ce8f85453_hotel-elios-244.jpg",
    imageCountry: "Włochy",
    checkedAt: "2026-10-01T16:20:00+02:00",
    status: "active",
  },
  "kreta-heronissos-1599": {
    slug: "kreta-heronissos-1599",
    city: "Kreta",
    country: "Grecja",
    price: 1599,
    departure: "Katowice",
    nights: 7,
    dates: "21–29 października 2026",
    board: "All Inclusive",
    hotel: "Heronissos Hotel",
    partner: "tui",
    partnerLabel: "TUI",
    affiliateUrl: "https://clk.tradedoubler.com/click?a=3487177&p=308388&url=https%3A%2F%2Fwww.tui.pl%2Fwypoczynek%2Fgrecja%2Fkreta%2Fheronissos-hotel-her41059%2FOfferCodeWS%2FKTWCHQ20261021211020261021202610290040L07HER41059DZZ1AA02ROADZZ1A02FCYY",
    imageSrc: "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/HER41059/S23/22642222.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80",
    imageCountry: "Grecja",
    checkedAt: "2026-09-28T20:20:00+02:00",
    status: "active",
  },
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
    checkedAt: "2026-09-30T20:08:40+02:00",
    status: "expired",
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
  "cypr-protaras-mandalena-889": {
    slug: "cypr-protaras-mandalena-889",
    city: "Protaras",
    country: "Cypr",
    price: 889,
    departure: "Warszawa–Radom",
    nights: 4,
    dates: "22–26 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Mandalena Hotel Apartments",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?p=334260&a=3487177&url=https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fcypr%2Fcypr-poludniowy%2Fprotaras%2Fmandalena-hotel-apartments%3FKEY%3DMjIyODI0OXwzMTc1OTkwNzM5fDEzMDYyOTc%26DS%3D1024%26GIATA%3D227782%26D%3D63542%26HID%3D422255%26MT%3D6%26DI%3DGT06-AO%26NN%3D4%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-15%257C2026-12-10%26RD%3D2026-11-26%26DD%3D2026-11-22%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D4381%26TT%3D1%26PID%3D422255%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D4-2026-11-22%26IFC%3DVzZ8NDY0MHwyMDI2LTExLTI2VDE3OjM1%26OFC%3DVzZ8NDY0MXwyMDI2LTExLTIyVDIwOjQ1%26utm_term%3Dfeed",
    imageSrc: "/images/destinations/pafos.jpg",
    imageCountry: "Cypr",
    checkedAt: "2026-10-01T13:40:00+02:00",
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
  },  "costa-blanca-albir-909": {
    slug: "costa-blanca-albir-909",
    city: "Costa Blanca",
    country: "Hiszpania",
    price: 909,
    departure: "Kraków",
    nights: 3,
    dates: "23–26 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Albir Garden Resort Aquapark",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1265338_1268119)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fhiszpania%2Fcosta-blanca%2Fel-albir%2Falbir-garden-resort-aquapark%3FKEY%3DMjQwNDc4N3wzNTg3NTc3MTM5fDEyNjgxMTk%26DS%3D1024%26GIATA%3D5843%26D%3D63241%26HID%3D420912%26MT%3D6%26DI%3DGT06-AO%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-16%257C2026-12-10%26RD%3D2026-11-26%26DD%3D2026-11-23%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1825%26TT%3D1%26PID%3D420912%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-11-23%26IFC%3DRlJ8NjM1NnwyMDI2LTExLTI2VDA2OjA1%26OFC%3DRlJ8NjM1NXwyMDI2LTExLTIzVDA2OjE1%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/spanelsko/costa-blanca/el-albir/albir-garden-resort-aquapark-spanelsko/dbc30b800d41514558b14c6aa6bb8021_6.jpg",
    imageCountry: "Hiszpania",
    checkedAt: "2026-10-03T08:00:16+02:00",
    status: "active",
  },
  "bansko-saint-george-969": {
    slug: "bansko-saint-george-969",
    city: "Bansko",
    country: "Bułgaria",
    price: 969,
    departure: "Warszawa–Modlin",
    nights: 3,
    dates: "10–13 grudnia 2026",
    board: "Bez wyżywienia",
    hotel: "Saint George Palace",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1316942_1317030)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fbulgaria%2Fbansko%2Fbansko%2Fsaint-george-palace-bansko%3FKEY%3DMjQwNjE4NnwzNTk4Mzc3Mzg5fDEzMTcwMzA%26DS%3D1024%26GIATA%3D229360%26D%3D63486%26HID%3D435950%26MT%3D6%26DI%3DGT06-AO%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-12-03%257C2026-12-27%26RD%3D2026-12-13%26DD%3D2026-12-10%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D4380%26TT%3D1%26PID%3D435950%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-12-10%26IFC%3DRlJ8ODAxfDIwMjYtMTItMTNUMjI6NTU-%26OFC%3DRlJ8NDAzNXwyMDI2LTEyLTEwVDE4OjA1%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/bulharsko/vnitrozemi/bansko/saint-george-palace/9540/-george-palace-bansko-244.jpg",
    imageCountry: "Bułgaria",
    checkedAt: "2026-10-03T08:00:16+02:00",
    status: "active",
  },
  "algarve-plaza-real-1159": {
    slug: "algarve-plaza-real-1159",
    city: "Algarve",
    country: "Portugalia",
    price: 1159,
    departure: "Kraków",
    nights: 7,
    dates: "16–23 listopada 2026",
    board: "Bez wyżywienia",
    hotel: "Plaza Real Aparthotel",
    partner: "exim",
    partnerLabel: "EXIM Tours",
    affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1331510_1331533)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fportugalia%2Falgarve%2Fpraia-da-rocha%2Fplaza-real-aparthotel%3FKEY%3DMjE3MTgzMHwzMzI3NDgzNTE4fDEzMzE1MzM%26DS%3D1024%26GIATA%3D48933%26D%3D63208%26HID%3D420817%26MT%3D6%26DI%3DGT06-AO%26NN%3D7%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-11-09%257C2026-12-07%26RD%3D2026-11-23%26DD%3D2026-11-16%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D1825%26TT%3D1%26PID%3D420817%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D7-2026-11-16%26IFC%3DRlJ8MjgzOHwyMDI2LTExLTIzVDE0OjAw%26OFC%3DRlJ8MjgzOXwyMDI2LTExLTE2VDE5OjUw%26utm_term%3Dfeed)",
    imageSrc: "https://img.exim.pl/hotels/720/portugalsko/algarve/praia-da-rocha/plaza-real-aparthotel/7772/982df25479493c18b3967b807d0e79f6_1-244.jpg",
    imageCountry: "Portugalia",
    checkedAt: "2026-10-03T08:00:16+02:00",
    status: "active",
  },

};

export function findSocialOfferForCatalogOffer(input: {
  affiliateUrl?: string;
  city?: string;
  hotel?: string;
  price?: number;
}): SocialOffer | null {
  const candidates = Object.values(SOCIAL_OFFERS).filter(socialOfferReady);
  const affiliateUrl = String(input.affiliateUrl || "").trim();

  if (affiliateUrl) {
    const exactUrl = candidates.find((offer) => offer.affiliateUrl.trim() === affiliateUrl);
    if (exactUrl) return exactUrl;
  }

  const city = normalize(String(input.city || ""));
  const hotel = normalize(String(input.hotel || ""));
  const price = Number(input.price || 0);
  if (!city || !hotel || !Number.isFinite(price) || price <= 0) return null;

  return candidates.find((offer) =>
    normalize(offer.city) === city
    && normalize(offer.hotel) === hotel
    && Number(offer.price) === price
  ) || null;
}

function decodedAffiliateUrl(value: string) {
  let current = value;
  for (let index = 0; index < 3; index++) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}

function compactIso(value: string) {
  if (!/^20\d{6}$/.test(value)) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function displayDateRange(value: string) {
  const months: Record<string, string> = {
    stycznia: "01", lutego: "02", marca: "03", kwietnia: "04", maja: "05", czerwca: "06",
    lipca: "07", sierpnia: "08", wrzesnia: "09", "września": "09", pazdziernika: "10", "października": "10",
    listopada: "11", grudnia: "12",
  };
  const normalized = value.trim().replace(/\s+/g, " ");
  const sameMonth = normalized.match(/^(\d{1,2})\s*[–-]\s*(\d{1,2})\s+([A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)\s+(20\d{2})$/);
  if (sameMonth) {
    const month = months[sameMonth[3].toLowerCase()];
    if (!month) return { start: "", end: "" };
    return {
      start: `${sameMonth[4]}-${month}-${sameMonth[1].padStart(2, "0")}`,
      end: `${sameMonth[4]}-${month}-${sameMonth[2].padStart(2, "0")}`,
    };
  }
  const crossMonth = normalized.match(/^(\d{1,2})\s+([A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)\s*[–-]\s*(\d{1,2})\s+([A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)\s+(20\d{2})$/);
  if (crossMonth) {
    const startMonth = months[crossMonth[2].toLowerCase()];
    const endMonth = months[crossMonth[4].toLowerCase()];
    if (!startMonth || !endMonth) return { start: "", end: "" };
    return {
      start: `${crossMonth[5]}-${startMonth}-${crossMonth[1].padStart(2, "0")}`,
      end: `${crossMonth[5]}-${endMonth}-${crossMonth[3].padStart(2, "0")}`,
    };
  }
  return { start: "", end: "" };
}

export function socialOfferDateRange(offer: Pick<SocialOffer, "affiliateUrl" | "dates">) {
  const decoded = decodedAffiliateUrl(offer.affiliateUrl || "");
  const firstParam = (keys: string[]) => {
    for (const key of keys) {
      const match = decoded.match(new RegExp(`(?:[?&]|\\b)${key}=((?:20\\d{2}-\\d{2}-\\d{2}))`, "i"));
      if (match?.[1]) return match[1];
    }
    return "";
  };

  let start = firstParam(["destinationDepartureDate", "departure", "DD", "checkInDate"]);
  let end = firstParam(["returnArrivalDate", "return", "RD", "checkOutDate"]);

  if (!start || !end) {
    const compactDates = Array.from(decoded.matchAll(/20\d{6}/g), (match) => compactIso(match[0]))
      .filter(Boolean);
    const uniqueDates = Array.from(new Set(compactDates));
    if (!start && uniqueDates.length) start = uniqueDates[0];
    if (!end && uniqueDates.length > 1) end = uniqueDates[uniqueDates.length - 1];
  }

  if (!start || !end) {
    const display = displayDateRange(offer.dates || "");
    if (!start) start = display.start;
    if (!end) end = display.end;
  }

  if (!/^20\d{2}-\d{2}-\d{2}$/.test(start) || !/^20\d{2}-\d{2}-\d{2}$/.test(end)) {
    return { start: "", end: "" };
  }
  if (Date.parse(end) < Date.parse(start)) return { start: "", end: "" };
  return { start, end };
}

export function getSocialOfferForLanding(slug: string): SocialOffer | null {
  const normalizedSlug = slug.toLocaleLowerCase("pl");
  const offer = SOCIAL_OFFERS[normalizedSlug] || null;
  if (!offer) return null;
  if (!validAffiliateUrl(offer.affiliateUrl)) return null;
  if (!validImageCountry(offer)) return null;
  return offer;
}

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

function socialOfferFresh(offer: SocialOffer, maxHours = 6) {
  const checked = Date.parse(offer.checkedAt || "");
  if (!Number.isFinite(checked)) return false;
  const age = Date.now() - checked;
  return age >= 0 && age <= maxHours * 60 * 60 * 1000;
}

export function socialOfferReady(offer: SocialOffer) {
  // Existing /o/<slug> landings stay reachable, but only recently rechecked
  // offers are eligible for a new automatic publication.
  return offer.status === "active"
    && validAffiliateUrl(offer.affiliateUrl)
    && validImageCountry(offer)
    && socialOfferFresh(offer);
}
