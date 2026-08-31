import type { PartnerKey } from "./partners";
import { partners } from "./partners";

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
  partner: PartnerKey;
  destinationUrl?: string;
  affiliateUrl: string;
  linkType?: "search" | "exact";
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
  if (departureDate) url.searchParams.set("departureDate", departureDate);
  if (returnDate) url.searchParams.set("returnDate", returnDate);
  return partners.esky.buildUrl(url.toString());
};

const eximDestination = (path: string) => {
  const destinationUrl = `https://www.exim.pl${path}`;
  return { destinationUrl, affiliateUrl: partners.exim.buildUrl(destinationUrl) };
};

export const offers: Offer[] = [
  { id:1, flag:"🇲🇹", city:"Malta", country:"Malta", price:699, departure:"Warszawa Modlin", airportCode:"WMI", nights:3, weather:"20°C", score:9.6, tag:"BIERZEMY", reason:"Bardzo dobra cena, sensowny termin i świetny kierunek na szybki city break.", image:"https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1600&q=80", category:["city","tanio","cieplo","weekend"], hotel:"St. Julian's Bay", board:"Bez wyżywienia", dates:"23–26 listopada 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"co-MT", stayLength:"3:3", airportCode:"WMI", departureDate:"2026-11-23", returnDate:"2026-11-26" }) , linkType:"search"},
  { id:2, flag:"🇪🇸", city:"Barcelona", country:"Hiszpania", price:1099, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"22°C", score:9.2, tag:"DOBRA OPCJA", reason:"Dobry balans ceny, lotu i lokalizacji. Idealny krótki wypad.", image:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1600&q=80", category:["city","weekend","cieplo"], hotel:"Hotel w centrum", board:"Śniadanie", dates:"wybrane terminy jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-BCN", stayLength:"3:3", airportCode:"WAW" }) , linkType:"search"},
  { id:3, flag:"🇹🇳", city:"Djerba", country:"Tunezja", price:1799, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"26°C", score:9.4, tag:"BIERZEMY", reason:"7 nocy All Inclusive i ciepło — bardzo mocna relacja ceny do długości wyjazdu.", image:"https://images.unsplash.com/photo-1548018560-c7196548e84d?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Resort 4★", board:"All Inclusive", dates:"wybrane terminy jesień 2026", partner:"exim", ...eximDestination("/kierunki/tunezja/djerba"), linkType:"search"},
  { id:4, flag:"🇮🇹", city:"Bergamo", country:"Włochy", price:599, departure:"Kraków", airportCode:"KRK", nights:2, weather:"18°C", score:8.8, tag:"OKAZJA", reason:"Bardzo tani szybki wypad i świetna baza do Mediolanu lub nad Como.", image:"https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1600&q=80", category:["city","tanio","weekend"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"wybrane weekendy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-BGY", stayLength:"2:2", airportCode:"KRK" }) , linkType:"search"},
  { id:5, flag:"🇪🇬", city:"Hurghada", country:"Egipt", price:2199, departure:"Katowice", airportCode:"KTW", nights:7, weather:"29°C", score:9.1, tag:"DOBRA OPCJA", reason:"Ciepło poza sezonem, 7 nocy i wygodny pakiet z wyżywieniem.", image:"https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Resort 4★", board:"All Inclusive", dates:"wybrane terminy 2026", partner:"tui", affiliateUrl:partners.tui.buildUrl() , linkType:"search"},
  { id:6, flag:"🇬🇷", city:"Kreta", country:"Grecja", price:2399, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"25°C", score:9.0, tag:"DOBRA OPCJA", reason:"Klasyczny tygodniowy wypoczynek z dobrym balansem ceny i jakości.", image:"https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"All Inclusive", dates:"wybrane terminy 2026", partner:"wakacje", affiliateUrl:partners.wakacje.buildUrl() , linkType:"search"},
  { id:7, flag:"🇵🇹", city:"Porto", country:"Portugalia", price:949, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"20°C", score:9.1, tag:"BIERZEMY", reason:"Świetny city break na jedzenie, wino i spacerowanie bez gonitwy.", image:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Śniadanie", dates:"październik–listopad 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-OPO", stayLength:"3:3", airportCode:"WAW" }) , linkType:"search"},
  { id:8, flag:"🇮🇹", city:"Rzym", country:"Włochy", price:1199, departure:"Warszawa Modlin", airportCode:"WMI", nights:3, weather:"21°C", score:9.3, tag:"BIERZEMY", reason:"Bardzo dobry termin na zwiedzanie i dużo opcji noclegowych w centrum.", image:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80", category:["city","weekend"], hotel:"Hotel 3★", board:"Śniadanie", dates:"listopad 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-ROM", stayLength:"2:4", airportCode:"WMI" }) , linkType:"search"},
  { id:9, flag:"🇪🇸", city:"Alicante", country:"Hiszpania", price:899, departure:"Warszawa", airportCode:"WAW", nights:4, weather:"23°C", score:9.0, tag:"OKAZJA", reason:"Słońce, morze i krótki lot — dobry kierunek na ucieczkę od jesieni.", image:"https://images.unsplash.com/photo-1562883676-8c7feb83f09b?auto=format&fit=crop&w=1600&q=80", category:["city","plaza","cieplo","tanio"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-ALC", stayLength:"3:5", airportCode:"WAW" }) , linkType:"search"},
  { id:10, flag:"🇨🇾", city:"Pafos", country:"Cypr", price:1299, departure:"Kraków", airportCode:"KRK", nights:4, weather:"25°C", score:9.2, tag:"BIERZEMY", reason:"Dużo słońca, plaże i wygodna długość pobytu bez tygodnia urlopu.", image:"https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","weekend"], hotel:"Hotel 4★", board:"Śniadanie", dates:"październik 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-PFO", stayLength:"3:5", airportCode:"KRK" }) , linkType:"search"},
  { id:11, flag:"🇬🇧", city:"Londyn", country:"Wielka Brytania", price:849, departure:"Gdańsk", airportCode:"GDN", nights:3, weather:"16°C", score:8.7, tag:"DOBRA OPCJA", reason:"Krótki city break z dużym wyborem lotów i noclegów.", image:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"wybrane terminy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-LON", stayLength:"2:4", airportCode:"GDN" }) , linkType:"search"},
  { id:12, flag:"🇨🇿", city:"Praga", country:"Czechy", price:649, departure:"Warszawa", airportCode:"WAW", nights:2, weather:"17°C", score:8.9, tag:"OKAZJA", reason:"Tani weekend bez dużego planowania, idealny na szybki reset.", image:"https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1600&q=80", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Śniadanie", dates:"weekendy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-PRG", stayLength:"2:3", airportCode:"WAW" }) , linkType:"search"},
  { id:13, flag:"🇦🇹", city:"Wiedeń", country:"Austria", price:799, departure:"Warszawa", airportCode:"WAW", nights:2, weather:"15°C", score:8.8, tag:"DOBRA OPCJA", reason:"Idealny na jarmarki, muzea i elegancki weekend bez długiego lotu.", image:"https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1600&q=80", category:["city","weekend","tanio"], hotel:"Hotel 3★", board:"Śniadanie", dates:"listopad–grudzień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-VIE", stayLength:"2:3", airportCode:"WAW" }) , linkType:"search"},
  { id:14, flag:"🇭🇺", city:"Budapeszt", country:"Węgry", price:699, departure:"Kraków", airportCode:"KRK", nights:3, weather:"17°C", score:9.0, tag:"OKAZJA", reason:"Dobry stosunek ceny do jakości i dużo atrakcji na 3 dni.", image:"https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1600&q=80", category:["city","weekend","tanio"], hotel:"Hotel 4★", board:"Śniadanie", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-BUD", stayLength:"2:4", airportCode:"KRK" }) , linkType:"search"},
  { id:15, flag:"🇫🇷", city:"Paryż", country:"Francja", price:1399, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"18°C", score:8.9, tag:"DOBRA OPCJA", reason:"Dobra opcja na romantyczny city break przy sensownym budżecie.", image:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80", category:["city","weekend"], hotel:"Hotel 3★", board:"Śniadanie", dates:"wybrane terminy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-PAR", stayLength:"2:4", airportCode:"WAW" }) , linkType:"search"},
  { id:16, flag:"🇵🇹", city:"Lizbona", country:"Portugalia", price:1499, departure:"Warszawa", airportCode:"WAW", nights:4, weather:"22°C", score:9.3, tag:"BIERZEMY", reason:"Ciepło, klimat i świetne jedzenie — dobry kompromis między city breakiem a odpoczynkiem.", image:"https://images.unsplash.com/photo-1525207934214-58e69a8f8a93?auto=format&fit=crop&w=1600&q=80", category:["city","cieplo"], hotel:"Hotel 3★", board:"Śniadanie", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-LIS", stayLength:"3:5", airportCode:"WAW" }) , linkType:"search"},
  { id:17, flag:"🇲🇦", city:"Marrakesz", country:"Maroko", price:1699, departure:"Warszawa", airportCode:"WAW", nights:4, weather:"27°C", score:9.2, tag:"BIERZEMY", reason:"Dużo słońca i egzotyki bez dalekiego lotu — mocny jesienny kierunek.", image:"https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1600&q=80", category:["city","cieplo"], hotel:"Riad 4★", board:"Śniadanie", dates:"listopad 2026", partner:"wakacje", affiliateUrl:partners.wakacje.buildUrl() , linkType:"search"},
  { id:18, flag:"🇹🇷", city:"Antalya", country:"Turcja", price:1999, departure:"Katowice", airportCode:"KTW", nights:7, weather:"27°C", score:9.2, tag:"BIERZEMY", reason:"Klasyczne All Inclusive i dobra pogoda na końcówkę sezonu.", image:"https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Resort 5★", board:"All Inclusive", dates:"wrzesień–październik 2026", partner:"tui", affiliateUrl:partners.tui.buildUrl() , linkType:"search"},
  { id:19, flag:"🇧🇬", city:"Słoneczny Brzeg", country:"Bułgaria", price:1599, departure:"Gdańsk", airportCode:"GDN", nights:7, weather:"25°C", score:8.8, tag:"OKAZJA", reason:"Tani tydzień nad morzem i sporo hoteli z All Inclusive.", image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive","tanio"], hotel:"Hotel 4★", board:"All Inclusive", dates:"wrzesień 2026", partner:"exim", ...eximDestination("/kierunki/bulgaria/sloneczny-brzeg"), linkType:"search"},
  { id:20, flag:"🇹🇳", city:"Hammamet", country:"Tunezja", price:1899, departure:"Katowice", airportCode:"KTW", nights:7, weather:"27°C", score:9.0, tag:"DOBRA OPCJA", reason:"Dużo słońca i solidny pakiet All Inclusive w dobrej cenie.", image:"https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Resort 4★", board:"All Inclusive", dates:"jesień 2026", partner:"exim", ...eximDestination("/kierunki/tunezja/tunezja-kontynent/hammamet"), linkType:"search"},
  { id:21, flag:"🇪🇸", city:"Teneryfa", country:"Hiszpania", price:2499, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"25°C", score:9.4, tag:"BIERZEMY", reason:"Pewna pogoda jesienią i zimą, dobry kierunek na pełny tydzień odpoczynku.", image:"https://images.unsplash.com/photo-1504326787394-e6d75cae8027?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"All Inclusive", dates:"jesień–zima 2026", partner:"wakacje", affiliateUrl:partners.wakacje.buildUrl() , linkType:"search"},
  { id:22, flag:"🇪🇸", city:"Fuerteventura", country:"Hiszpania", price:2299, departure:"Warszawa", airportCode:"WAW", nights:5, weather:"24°C", score:9.3, tag:"BIERZEMY", reason:"Krótki kanaryjski reset, plaże i bardzo przyjemna pogoda zimą.", image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo"], hotel:"Hotel 4★", board:"Śniadanie", dates:"grudzień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"co-ES", stayLength:"4:6", airportCode:"WAW" }) , linkType:"search"},
  { id:23, flag:"🇬🇷", city:"Rodos", country:"Grecja", price:2199, departure:"Gdańsk", airportCode:"GDN", nights:7, weather:"26°C", score:9.1, tag:"DOBRA OPCJA", reason:"Dobry wybór na spokojny tydzień z plażą i zwiedzaniem.", image:"https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"All Inclusive", dates:"wrzesień 2026", partner:"tui", affiliateUrl:partners.tui.buildUrl() , linkType:"search"},
  { id:24, flag:"🇦🇱", city:"Riwiera Albańska", country:"Albania", price:1999, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"26°C", score:9.0, tag:"DOBRA OPCJA", reason:"Coraz popularniejszy kierunek, dobre ceny i piękne plaże.", image:"https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"All Inclusive", dates:"wrzesień 2026", partner:"wakacje", affiliateUrl:partners.wakacje.buildUrl() , linkType:"search"},
  { id:25, flag:"🇭🇷", city:"Split", country:"Chorwacja", price:1299, departure:"Kraków", airportCode:"KRK", nights:4, weather:"23°C", score:9.0, tag:"DOBRA OPCJA", reason:"Świetne połączenie miasta, morza i jednodniowych wypadów.", image:"https://images.unsplash.com/photo-1555990538-1e6c3c6f4826?auto=format&fit=crop&w=1600&q=80", category:["city","plaza","cieplo"], hotel:"Hotel 3★", board:"Śniadanie", dates:"wrzesień–październik 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-SPU", stayLength:"4:4", airportCode:"KRK" }) , linkType:"search"},
  { id:26, flag:"🇮🇹", city:"Neapol", country:"Włochy", price:999, departure:"Warszawa Modlin", airportCode:"WMI", nights:3, weather:"22°C", score:9.1, tag:"OKAZJA", reason:"Pizza, Pompeje i Wybrzeże Amalfi — dużo możliwości na jeden krótki wypad.", image:"https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1600&q=80", category:["city","weekend","tanio","cieplo"], hotel:"Hotel 3★", board:"Bez wyżywienia", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-NAP", stayLength:"2:4", airportCode:"WMI" }) , linkType:"search"},
  { id:27, flag:"🇪🇸", city:"Sewilla", country:"Hiszpania", price:1399, departure:"Kraków", airportCode:"KRK", nights:4, weather:"25°C", score:9.2, tag:"BIERZEMY", reason:"Bardzo dobry kierunek na jesień: słońce, jedzenie i klimat bez tłumów lata.", image:"https://images.unsplash.com/photo-1559564484-e48b3e040ff4?auto=format&fit=crop&w=1600&q=80", category:["city","cieplo"], hotel:"Hotel 3★", board:"Śniadanie", dates:"październik–listopad 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-SVQ", stayLength:"3:5", airportCode:"KRK" }) , linkType:"search"},
  { id:28, flag:"🇳🇱", city:"Amsterdam", country:"Holandia", price:1199, departure:"Gdańsk", airportCode:"GDN", nights:3, weather:"15°C", score:8.7, tag:"DOBRA OPCJA", reason:"Krótki miejski wypad z bardzo dobrym transportem i masą atrakcji.", image:"https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1600&q=80", category:["city","weekend"], hotel:"Hotel 3★", board:"Śniadanie", dates:"wybrane terminy 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-AMS", stayLength:"2:4", airportCode:"GDN" }) , linkType:"search"},
  { id:29, flag:"🇩🇰", city:"Kopenhaga", country:"Dania", price:1099, departure:"Warszawa", airportCode:"WAW", nights:3, weather:"14°C", score:8.6, tag:"DOBRA OPCJA", reason:"Stylowy city break, świetne jedzenie i łatwe zwiedzanie na piechotę.", image:"https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1600&q=80", category:["city","weekend"], hotel:"Hotel 3★", board:"Śniadanie", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-CPH", stayLength:"2:4", airportCode:"WAW" }) , linkType:"search"},
  { id:30, flag:"🇦🇪", city:"Dubaj", country:"ZEA", price:2999, departure:"Warszawa", airportCode:"WAW", nights:5, weather:"31°C", score:9.2, tag:"BIERZEMY", reason:"Pewna pogoda, dobry standard hoteli i dużo atrakcji na 5 dni.", image:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80", category:["city","cieplo","plaza"], hotel:"Hotel 4★", board:"Śniadanie", dates:"listopad–grudzień 2026", partner:"wakacje", affiliateUrl:partners.wakacje.buildUrl() , linkType:"search"},
  { id:31, flag:"🇪🇬", city:"Marsa Alam", country:"Egipt", price:2399, departure:"Gdańsk", airportCode:"GDN", nights:7, weather:"30°C", score:9.2, tag:"BIERZEMY", reason:"Spokojniejsze od Hurghady, świetne rafy i bardzo dobra pogoda zimą.", image:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Resort 5★", board:"All Inclusive", dates:"jesień–zima 2026", partner:"exim", ...eximDestination("/kierunki/egipt/marsa-alam"), linkType:"search"},
  { id:32, flag:"🇹🇷", city:"Bodrum", country:"Turcja", price:2099, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"26°C", score:8.9, tag:"DOBRA OPCJA", reason:"Ładniejsze, bardziej butikowe oblicze Turcji i dobre hotele przy plaży.", image:"https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"All Inclusive", dates:"wrzesień 2026", partner:"tui", affiliateUrl:partners.tui.buildUrl() , linkType:"search"},
  { id:33, flag:"🇮🇹", city:"Sycylia", country:"Włochy", price:1699, departure:"Katowice", airportCode:"KTW", nights:5, weather:"24°C", score:9.1, tag:"BIERZEMY", reason:"Świetna kuchnia, morze i dużo zwiedzania — dobra opcja na 5 dni.", image:"https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=80", category:["city","plaza","cieplo"], hotel:"Hotel 4★", board:"Śniadanie", dates:"październik 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"co-IT", stayLength:"5:5", airportCode:"KTW" }) , linkType:"search"},
  { id:34, flag:"🇪🇸", city:"Majorka", country:"Hiszpania", price:1999, departure:"Kraków", airportCode:"KRK", nights:7, weather:"25°C", score:9.0, tag:"DOBRA OPCJA", reason:"Wciąż jeden z najłatwiejszych kierunków na tygodniowe wakacje w dobrym standardzie.", image:"https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80", category:["plaza","cieplo","allinclusive"], hotel:"Hotel 4★", board:"All Inclusive", dates:"wrzesień 2026", partner:"wakacje", affiliateUrl:partners.wakacje.buildUrl() , linkType:"search"},
  { id:35, flag:"🇵🇹", city:"Madera", country:"Portugalia", price:2599, departure:"Warszawa", airportCode:"WAW", nights:7, weather:"23°C", score:9.4, tag:"BIERZEMY", reason:"Dla osób, które chcą połączyć naturę, trekking i łagodny klimat przez cały rok.", image:"https://images.unsplash.com/photo-1548690395-0f879ee131bd?auto=format&fit=crop&w=1600&q=80", category:["cieplo","plaza"], hotel:"Hotel 4★", board:"Śniadanie", dates:"jesień–zima 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"co-PT", stayLength:"7:7", airportCode:"WAW" }) , linkType:"search"},
  { id:36, flag:"🇪🇸", city:"Malaga", country:"Hiszpania", price:1199, departure:"Warszawa", airportCode:"WAW", nights:4, weather:"24°C", score:9.2, tag:"BIERZEMY", reason:"Ciepła Andaluzja, plaża i stare miasto w jednym wyjeździe.", image:"https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1600&q=80", category:["city","plaza","cieplo"], hotel:"Hotel 3★", board:"Śniadanie", dates:"jesień 2026", partner:"esky", affiliateUrl:esky({ arrivalPlaces:"ci-AGP", stayLength:"3:5", airportCode:"WAW" }) , linkType:"search"}
];

export const airportOptions = [
  { code: "WAW", label: "Warszawa Chopina" },
  { code: "WMI", label: "Warszawa Modlin" },
  { code: "KRK", label: "Kraków" },
  { code: "KTW", label: "Katowice" },
  { code: "GDN", label: "Gdańsk" },
  { code: "WRO", label: "Wrocław" },
  { code: "POZ", label: "Poznań" },
  { code: "RZE", label: "Rzeszów" },
  { code: "LCJ", label: "Łódź" },
  { code: "LUZ", label: "Lublin" },
  { code: "SZZ", label: "Szczecin" },
  { code: "BZG", label: "Bydgoszcz" },
  { code: "IEG", label: "Zielona Góra" },
];

export const destinationOptions = Array.from(
  new Set(
    offers.flatMap((offer) => [
      offer.country,
      `${offer.city}, ${offer.country}`,
    ])
  )
).sort((a, b) => a.localeCompare(b, "pl"));

