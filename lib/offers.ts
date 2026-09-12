import type { PartnerKey } from "./partners";
import { partners } from "./partners";
import publishedOverridesRaw from "@/data/offer-overrides.json";

export type AvailabilityStatus = "available" | "unknown" | "expired";

export type Offer = {
  id: number;
  flag: string;
  city: string;
  country: string;
  price: number;
  pricePrevious?: number;
  priceCheckedAt?: string;
  availabilityStatus?: AvailabilityStatus;
  departure: string;
  airportCode: string;
  nights: number;
  weather: string;
  score: number;
  tag: "BIERZEMY" | "DOBRA OPCJA" | "OKAZJA";
  reason: string;
  image: string;
  category: string[];
  hotel: string;
  board: string;
  dates: string;
  startDateISO?: string;
  endDateISO?: string;
  partner: PartnerKey;
  destinationUrl?: string;
  affiliateUrl: string;
  linkType?: "search" | "exact";
  linkMatch?: "exact" | "parameters" | "destination" | "unsafe";
  transferIncluded?: boolean;
  baggageIncluded?: boolean;
};

const departurePlaceFor = (airportCode: string) => `ap-${airportCode}`;

type EskySearchOptions = {
  arrivalPlaces: string;
  stayLength: string;
  airportCode: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
};

const esky = ({
  arrivalPlaces,
  stayLength,
  airportCode,
  departureDate,
  returnDate,
  adults = 2,
}: EskySearchOptions) => {
  const departurePlace = departurePlaceFor(airportCode);
  const url = new URL("https://www2.esky.pl/lot+hotel/portfolio");
  url.searchParams.set("rooms[0][adults]", String(adults));
  url.searchParams.set("datesTab", "flexDates");
  url.searchParams.set("stayLength", stayLength);
  url.searchParams.set("arrivalPlaces", arrivalPlaces);
  url.searchParams.set("departurePlaces", departurePlace);
  url.searchParams.set("selectedDeparturePlaces", departurePlace);
  url.searchParams.set("context", "pl-packages");
  url.searchParams.set("sort[TotalPrice]", "asc");
  if (departureDate) url.searchParams.set("departureDate", departureDate);
  if (returnDate) url.searchParams.set("returnDate", returnDate);
  return partners.esky.buildUrl(url.toString());
};

const eximDestination = (path: string) => {
  const destinationUrl = `https://www.exim.pl${path}`;
  return { destinationUrl, affiliateUrl: partners.exim.buildUrl(destinationUrl) };
};

const baseOffers: Offer[] = [
  { id:1, flag:"🇲🇹", city:"Malta", country:"Malta", price:699, departure:"Warszawa Modlin", airportCode:"WMI", nights:3, weather:"20°C", score:9.6, tag:"BIERZEMY", reason:"Bardzo dobra cena, sensowny termin i świetny kierunek na szybki city break.", image:"/images/destinations/valletta.jpg", category:["city","tanio","cieplo","weekend"], hotel:"St. Julian's Bay", board:"Bez wyżywienia", dates:"23–26 listopada 2026", startDateISO:"2026-11-23", endDateISO:"2026-11-26", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"co-MT", stayLength:"3:3", airportCode:"WMI", departureDate:"2026-11-23", returnDate:"2026-11-26" }) , linkType:"search"},
  { id:2, flag:"🇪🇸", city:"Barcelona", country:"Hiszpania", price:1099, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"22°C", score:9.2, tag:"DOBRA OPCJA", reason:"Dobry balans ceny, lotu i lokalizacji. Idealny krótki wypad.", image:"/images/destinations/barcelona.jpg", category:["city","weekend","cieplo"], hotel:"Hotel w centrum", board:"Śniadanie", dates:"wybrane terminy jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-BCN", stayLength:"3:3", airportCode:"WAW" }) , linkType:"search"},
  { id:3, flag:"🇹🇳", city:"Djerba", country:"Tunezja", price:1799, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"26°C", score:9.4, tag:"BIERZEMY", reason:"7 nocy All Inclusive i ciepło — bardzo mocna relacja ceny do długości wyjazdu.", image:"/images/destinations/djerba.jpg", category:["plaza","cieplo","allinclusive"], hotel:"Resort 4★", board:"All Inclusive", dates:"wybrane terminy jesień 2026", partner:"exim", transferIncluded:true, ...eximDestination("/kierunki/tunezja/djerba"), linkType:"search"},
  { id:4, flag:"🇮🇹", city:"Bergamo", country:"Włochy", price:599, departure:"Kraków", airportCode:"KRK", nights:2, weather:"18°C", score:8.8, tag:"OKAZJA", reason:"Bardzo tani szybki wypad i świetna baza do Mediolanu lub nad Como.", image:"/images/destinations/bergamo.jpg", category:["city","tanio","weekend"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"wybrane weekendy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-29266", stayLength:"2:2", airportCode:"KRK" }) , linkType:"search"},
  { id:5, flag:"🇪🇬", city:"Hurghada", country:"Egipt", price:2199, departure:"Katowice", airportCode:"KTW", nights:7, weather:"29°C", score:9.1, tag:"DOBRA OPCJA", reason:"Ciepło poza sezonem, 7 nocy i wygodny pakiet z wyżywieniem.", image:"https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Resort 4★", board:"All Inclusive", dates:"wybrane terminy 2026", partner:"tui", affiliateUrl:partners.tui.buildUrl() , linkType:"search"},
  { id:6, flag:"🇬🇷", city:"Kreta", country:"Grecja", price:2399, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"25°C", score:9.0, tag:"DOBRA OPCJA", reason:"Klasyczny tygodniowy wypoczynek z dobrym balansem ceny i jakości.", image:"https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"All Inclusive", dates:"wybrane terminy 2026", partner:"wakacje", destinationUrl:"https://www.wakacje.pl/wczasy/kreta/", affiliateUrl:partners.wakacje.buildUrl("https://www.wakacje.pl/wczasy/kreta/") , linkType:"search"},
  { id:7, flag:"🇵🇹", city:"Porto", country:"Portugalia", price:949, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"20°C", score:9.1, tag:"BIERZEMY", reason:"Świetny city break na jedzenie, wino i spacerowanie bez gonitwy.", image:"/images/destinations/porto.jpg", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Śniadanie", dates:"październik–listopad 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-OPO", stayLength:"3:3", airportCode:"WAW" }) , linkType:"search"},
  { id:8, flag:"🇮🇹", city:"Rzym", country:"Włochy", price:1199, departure:"Warszawa Modlin", airportCode:"WMI", nights:3, weather:"21°C", score:9.3, tag:"BIERZEMY", reason:"Bardzo dobry termin na zwiedzanie i dużo opcji noclegowych w centrum.", image:"/images/destinations/rzym.jpg", category:["city","weekend"], hotel:"Hotel 3★", board:"Śniadanie", dates:"listopad 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-ROM", stayLength:"2:4", airportCode:"WMI" }) , linkType:"search"},
  { id:9, flag:"🇪🇸", city:"Alicante", country:"Hiszpania", price:899, departure:"Warszawa", airportCode:"WAW", nights:4, weather:"23°C", score:9.0, tag:"OKAZJA", reason:"Słońce, morze i krótki lot — dobry kierunek na ucieczkę od jesieni.", image:"https://images.unsplash.com/photo-1562883676-8c7feb83f09b?auto=format&fit=crop&w=1600&q=80", category:["city","plaza","cieplo","tanio"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-ALC", stayLength:"3:5", airportCode:"WAW" }) , linkType:"search"},
  { id:10, flag:"🇨🇾", city:"Pafos", country:"Cypr", price:1299, departure:"Kraków", airportCode:"KRK", nights:4, weather:"25°C", score:9.2, tag:"BIERZEMY", reason:"Dużo słońca, plaże i wygodna długość pobytu bez tygodnia urlopu.", image:"/images/destinations/pafos.jpg", category:["plaza","cieplo","weekend"], hotel:"Hotel 4★", board:"Śniadanie", dates:"październik 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-PFO", stayLength:"3:5", airportCode:"KRK" }) , linkType:"search"},
  { id:11, flag:"🇬🇧", city:"Londyn", country:"Wielka Brytania", price:849, departure:"Gdańsk", airportCode:"GDN", nights:3, weather:"16°C", score:8.7, tag:"DOBRA OPCJA", reason:"Krótki city break z dużym wyborem lotów i noclegów.", image:"/images/destinations/londyn.jpg", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"wybrane terminy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-LON", stayLength:"2:4", airportCode:"GDN" }) , linkType:"search"},
  { id:12, flag:"🇨🇿", city:"Praga", country:"Czechy", price:649, departure:"Warszawa", airportCode:"WAW", nights:2, weather:"17°C", score:8.9, tag:"OKAZJA", reason:"Tani weekend bez dużego planowania, idealny na szybki reset.", image:"/images/destinations/praga.jpg", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Śniadanie", dates:"weekendy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-PRG", stayLength:"2:3", airportCode:"WAW" }) , linkType:"search"},
  { id:13, flag:"🇦🇹", city:"Wiedeń", country:"Austria", price:799, departure:"Warszawa", airportCode:"WAW", nights:2, weather:"15°C", score:8.8, tag:"DOBRA OPCJA", reason:"Idealny na jarmarki, muzea i elegancki weekend bez długiego lotu.", image:"/images/destinations/wieden.jpg", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Śniadanie", dates:"listopad–grudzień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-VIE", stayLength:"2:3", airportCode:"WAW" }) , linkType:"search"},
  { id:14, flag:"🇭🇺", city:"Budapeszt", country:"Węgry", price:699, departure:"Kraków", airportCode:"KRK", nights:3, weather:"17°C", score:9.0, tag:"OKAZJA", reason:"Dobry stosunek ceny do jakości i dużo atrakcji na 3 dni.", image:"/images/destinations/budapeszt.jpg", category:["city","weekend","tanio"], hotel:"Hotel 4★", board:"Śniadanie", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-BUD", stayLength:"2:4", airportCode:"KRK" }) , linkType:"search"},
  { id:15, flag:"🇪🇸", city:"Teneryfa", country:"Hiszpania", price:2299, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"25°C", score:9.2, tag:"BIERZEMY", reason:"Jedna z najpewniejszych pogodowo opcji na ciepły wyjazd poza sezonem.", image:"/images/destinations/teneryfa.jpg", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"Śniadanie", dates:"listopad–grudzień 2026", partner:"wakacje", destinationUrl:"https://www.wakacje.pl/wczasy/teneryfa/", affiliateUrl:partners.wakacje.buildUrl("https://www.wakacje.pl/wczasy/teneryfa/") , linkType:"search"},
  { id:16, flag:"🇪🇬", city:"Marsa Alam", country:"Egipt", price:2499, departure:"Katowice", airportCode:"KTW", nights:7, weather:"28°C", score:9.0, tag:"DOBRA OPCJA", reason:"Spokojniejszy klimat, rafa i wysoka szansa na dobrą pogodę jesienią.", image:"/images/destinations/marsa-alam.jpg", category:["plaza","cieplo","allinclusive"], hotel:"Resort 4★", board:"All Inclusive", dates:"jesień 2026", partner:"tui", affiliateUrl:partners.tui.buildUrl() , linkType:"search"},
  { id:17, flag:"🇹🇷", city:"Stambuł", country:"Turcja", price:999, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"19°C", score:9.1, tag:"BIERZEMY", reason:"Mocny city break: dużo do zobaczenia, dobre jedzenie i atrakcyjne ceny noclegów.", image:"/images/destinations/stambul.jpg", category:["city","weekend","tanio"], hotel:"Hotel 4★", board:"Śniadanie", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-IST", stayLength:"3:3", airportCode:"WAW" }) , linkType:"search"},
  { id:18, flag:"🇲🇦", city:"Marrakesz", country:"Maroko", price:1499, departure:"Kraków", airportCode:"KRK", nights:4, weather:"27°C", score:9.3, tag:"BIERZEMY", reason:"Ciepło, egzotyka i krótki wyjazd bez dalekiego lotu.", image:"/images/destinations/marrakesz.jpg", category:["city","cieplo","weekend"], hotel:"Riad 4★", board:"Śniadanie", dates:"listopad 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-RAK", stayLength:"3:5", airportCode:"KRK" }) , linkType:"search"},
  { id:19, flag:"🇦🇪", city:"Dubaj", country:"ZEA", price:2999, departure:"Warszawa", airportCode:"WAW", nights:5, weather:"30°C", score:8.9, tag:"DOBRA OPCJA", reason:"Pewne ciepło i bardzo łatwy kierunek na 5 dni intensywnego wyjazdu.", image:"/images/destinations/dubaj.jpg", category:["city","cieplo","premium"], hotel:"Hotel 4★", board:"Śniadanie", dates:"listopad–grudzień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-DXB", stayLength:"4:6", airportCode:"WAW" }) , linkType:"search"},
  { id:20, flag:"🇪🇸", city:"Walencja", country:"Hiszpania", price:949, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"22°C", score:9.0, tag:"OKAZJA", reason:"Miasto i plaża w jednym, z łagodną pogodą poza sezonem.", image:"/images/destinations/walencja.jpg", category:["city","plaza","weekend"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"październik 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-VLC", stayLength:"3:4", airportCode:"WAW" }) , linkType:"search"},
];

// A lot of implementation follows below unchanged.

export const featuredOfferIds = new Set<number>([1, 3, 15]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const publishedOfferOverrides = (publishedOverridesRaw || {}) as Record<string, any>;

export const offers: Offer[] = baseOffers;

export function isOfferExpired(offer: Offer) {
  if (offer.availabilityStatus === "expired") return true;
  if (!offer.dates) return false;
  const matches = offer.dates.match(/(\d{1,2})[.–-](\d{1,2})\s+([a-ząćęłńóśźż]+)\s+(\d{4})/i);
  if (!matches) return false;
  const endDay = Number(matches[2]);
  const year = Number(matches[4]);
  const months: Record<string, number> = { stycznia:0,lutego:1,marca:2,kwietnia:3,maja:4,czerwca:5,lipca:6,sierpnia:7,września:8,października:9,listopada:10,grudnia:11 };
  const month = months[matches[3].toLocaleLowerCase("pl")];
  if (month === undefined) return false;
  return new Date(year, month, endDay, 23, 59, 59).getTime() < Date.now();
}

export function getLinkMatch(offer: Offer) {
  return offer.linkMatch || (offer.linkType === "exact" ? "exact" : "parameters");
}

export function formatPriceCheckedAt(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pl-PL", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }).format(date);
}
