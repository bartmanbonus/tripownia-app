import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import styles from "./DestinationLandingPanel.module.css";

type DestinationLandingConfig = {
  flag: string;
  eyebrow: string;
  title: string;
  lead: string;
  searchDestination: string;
  image: string;
  popular: string[];
  matchingTerms: string[];
  wakacjeUrl: string;
  bookingQuery: string;
  highlights: Array<{ label: string; value: string }>;
};

const DESTINATIONS: Record<string, DestinationLandingConfig> = {
  "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute": {
    flag: "🇪🇸",
    eyebrow: "WYSPY KANARYJSKIE",
    title: "Wyspy Kanaryjskie: wakacje, All Inclusive i wybór wyspy",
    lead: "Szukasz wakacji na Wyspach Kanaryjskich? Wybierz Teneryfę, Gran Canarię, Fuerteventurę lub Lanzarote, ustaw daty i porównaj aktualne oferty All Inclusive, lot + hotel i noclegi.",
    searchDestination: "Wyspy Kanaryjskie",
    image: "/images/destinations/teneryfa.jpg",
    popular: ["Teneryfa", "Gran Canaria", "Fuerteventura", "Lanzarote"],
    matchingTerms: ["teneryfa", "fuerteventura", "gran canaria", "lanzarote", "wyspy kanaryjskie"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/wyspy-kanaryjskie/",
    bookingQuery: "Canary Islands",
    highlights: [
      { label: "Najbardziej uniwersalna", value: "Teneryfa" },
      { label: "Plaże", value: "Fuerteventura" },
      { label: "Plaże + miasto", value: "Gran Canaria" },
    ],
  },
  "/malta": {
    flag: "🇲🇹",
    eyebrow: "MALTA",
    title: "City break Malta: lot + hotel, wakacje i plaże",
    lead: "Planujesz city break na Malcie? Ustaw termin i lotnisko, porównaj lot + hotel oraz wakacje, a potem sprawdź Vallettę, Sliemę, St. Julian’s, Mellieħę i Gozo.",
    searchDestination: "Malta",
    image: "/images/destinations/valletta.jpg",
    popular: ["Valletta", "Sliema", "St. Julian's", "Mellieha", "Gozo"],
    matchingTerms: ["malta", "valletta", "sliema", "st. julian", "mellieha", "gozo"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/wyspa-malta/",
    bookingQuery: "Malta",
    highlights: [
      { label: "City break", value: "Valletta + Sliema" },
      { label: "Plaże", value: "Mellieha" },
      { label: "Wieczory i restauracje", value: "St. Julian's" },
    ],
  },
  "/hiszpania": {
    flag: "🇪🇸",
    eyebrow: "HISZPANIA",
    title: "Hiszpania: południowe wybrzeże, All Inclusive i wyspy",
    lead: "Porównaj Costa del Sol, Costa Blanca, Majorkę i Wyspy Kanaryjskie. Ustaw własny termin, lotnisko i długość pobytu, a potem sprawdź wakacje, All Inclusive i lot + hotel.",
    searchDestination: "Hiszpania",
    image: "/images/destinations/malaga.jpg",
    popular: ["Costa del Sol", "Costa Blanca", "Majorka", "Wyspy Kanaryjskie"],
    matchingTerms: ["hiszpania", "malaga", "alicante", "majorka", "teneryfa", "gran canaria", "fuerteventura"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/hiszpania/",
    bookingQuery: "Spain",
    highlights: [
      { label: "Południowe wybrzeże", value: "Costa del Sol" },
      { label: "Plaże + miasto", value: "Costa Blanca" },
      { label: "Wyspy", value: "Majorka i Kanary" },
    ],
  },
  "/wyspy-zielonego-przyladka": {
    flag: "🇨🇻",
    eyebrow: "CABO VERDE",
    title: "Wyspy Zielonego Przylądka: Sal czy Boa Vista?",
    lead: "Porównaj Sal i Boa Vista, ustaw termin i lotnisko wylotu, a potem sprawdź aktualne wakacje, All Inclusive i noclegi na Cabo Verde.",
    searchDestination: "Wyspy Zielonego Przylądka",
    image: "/images/destinations/cabo-verde.jpg",
    popular: ["Sal", "Boa Vista", "Santa Maria"],
    matchingTerms: ["cabo verde", "wyspy zielonego przylądka", "sal", "boa vista", "santa maria"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/wyspy-zielonego-przyladka/",
    bookingQuery: "Cape Verde",
    highlights: [
      { label: "Więcej infrastruktury", value: "Sal" },
      { label: "Spokojniej i resortowo", value: "Boa Vista" },
      { label: "Najpopularniejsza baza", value: "Santa Maria" },
    ],
  },
  "/cypr": {
    flag: "🇨🇾",
    eyebrow: "CYPR",
    title: "Cypr: wakacje, plaże i wybór regionu",
    lead: "Porównaj Pafos, Larnakę, Ayia Napę i Protaras, ustaw termin oraz lotnisko wylotu, a potem sprawdź aktualne wakacje, All Inclusive i noclegi.",
    searchDestination: "Cypr",
    image: "/images/destinations/pafos.jpg",
    popular: ["Pafos", "Larnaka", "Ayia Napa", "Protaras"],
    matchingTerms: ["cypr", "pafos", "larnaka", "larnaca", "ayia napa", "protaras"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/cypr/",
    bookingQuery: "Cyprus",
    highlights: [
      { label: "Zwiedzanie + plaże", value: "Pafos" },
      { label: "Wygodna baza", value: "Larnaka" },
      { label: "Plaże i kurort", value: "Ayia Napa / Protaras" },
    ],
  },

  "/albania": {
    flag: "🇦🇱",
    eyebrow: "ALBANIA",
    title: "Albania: Riwiera, plaże i wakacje bez kombinowania",
    lead: "Porównaj Riwierę Albańską, Ksamil, Sarandę i Durrës. Ustaw termin, lotnisko i długość pobytu, a potem sprawdź aktualne wakacje i noclegi.",
    searchDestination: "Albania",
    image: "/images/destinations/riwiera-albanska.jpg",
    popular: ["Ksamil", "Saranda", "Riwiera Albańska", "Durrës"],
    matchingTerms: ["albania", "ksamil", "saranda", "riwiera albanska", "durres"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/albania/",
    bookingQuery: "Albania",
    highlights: [
      { label: "Plaże", value: "Ksamil" },
      { label: "Baza do zwiedzania", value: "Saranda" },
      { label: "Wygodny wypoczynek", value: "Durrës" },
    ],
  },
  "/wlochy": {
    flag: "🇮🇹",
    eyebrow: "WŁOCHY",
    title: "Włochy: city break, wyspy i wakacje nad morzem",
    lead: "Porównaj Rzym, Sycylię, Sardynię i wybrzeże. Ustaw własny termin i lotnisko, a potem wybierz city break, lot + hotel albo dłuższe wakacje.",
    searchDestination: "Włochy",
    image: "/images/destinations/rzym.jpg",
    popular: ["Rzym", "Sycylia", "Sardynia", "Neapol"],
    matchingTerms: ["wlochy", "włochy", "rzym", "sycylia", "sardynia", "neapol"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/wlochy/",
    bookingQuery: "Italy",
    highlights: [
      { label: "City break", value: "Rzym" },
      { label: "Wyspa + plaże", value: "Sycylia" },
      { label: "Południe", value: "Neapol" },
    ],
  },
  "/malediwy": {
    flag: "🇲🇻",
    eyebrow: "MALEDIWY",
    title: "Malediwy: resort, atole i egzotyczne wakacje",
    lead: "Ustaw termin i budżet, porównaj wyjazdy na Malediwy i sprawdź aktualne pakiety, noclegi oraz opcje przelotu.",
    searchDestination: "Malediwy",
    image: "/images/longhaul/malediwy.webp",
    popular: ["Male", "Atole", "Resorty", "All Inclusive"],
    matchingTerms: ["malediwy", "maldives", "male", "atol"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/malediwy/",
    bookingQuery: "Maldives",
    highlights: [
      { label: "Najczęściej wybierane", value: "Resorty na atolach" },
      { label: "Styl wyjazdu", value: "Wypoczynek premium" },
      { label: "Warto sprawdzić", value: "Transfer na wyspę" },
    ],
  },
  "/zanzibar": {
    flag: "🇹🇿",
    eyebrow: "ZANZIBAR",
    title: "Zanzibar: plaże, Stone Town i egzotyczne wakacje",
    lead: "Porównaj Nungwi, Kendwę i wschodnie wybrzeże. Ustaw termin oraz budżet, a potem sprawdź aktualne pakiety i noclegi.",
    searchDestination: "Zanzibar",
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1600&q=82",
    popular: ["Nungwi", "Kendwa", "Stone Town", "Paje"],
    matchingTerms: ["zanzibar", "nungwi", "kendwa", "stone town", "paje"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/zanzibar/",
    bookingQuery: "Zanzibar",
    highlights: [
      { label: "Plaże", value: "Nungwi / Kendwa" },
      { label: "Kitesurfing", value: "Paje" },
      { label: "Zwiedzanie", value: "Stone Town" },
    ],
  },
  "/wietnam": {
    flag: "🇻🇳",
    eyebrow: "WIETNAM",
    title: "Wietnam: Hanoi, południe i większa podróż",
    lead: "Porównaj Hanoi, Ho Chi Minh, Phu Quoc i centralny Wietnam. Ustaw termin i zacznij od lotu, noclegu albo całego planu podróży.",
    searchDestination: "Wietnam",
    image: "/images/longhaul/wietnam.webp",
    popular: ["Hanoi", "Ho Chi Minh", "Phu Quoc", "Da Nang"],
    matchingTerms: ["wietnam", "vietnam", "hanoi", "ho chi minh", "phu quoc", "da nang"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/wietnam/",
    bookingQuery: "Vietnam",
    highlights: [
      { label: "Północ", value: "Hanoi" },
      { label: "Południe", value: "Ho Chi Minh" },
      { label: "Plaże", value: "Phu Quoc" },
    ],
  },
  "/tajlandia": {
    flag: "🇹🇭",
    eyebrow: "TAJLANDIA",
    title: "Tajlandia: Bangkok, Phuket czy Krabi?",
    lead: "Porównaj Bangkok, Phuket, Krabi i Koh Samui. Ustaw termin, budżet i długość pobytu, a potem sprawdź aktualne wyjazdy i noclegi.",
    searchDestination: "Tajlandia",
    image: "/images/longhaul/bangkok.webp",
    popular: ["Bangkok", "Phuket", "Krabi", "Koh Samui"],
    matchingTerms: ["tajlandia", "thailand", "bangkok", "phuket", "krabi", "koh samui"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/tajlandia/",
    bookingQuery: "Thailand",
    highlights: [
      { label: "Miasto", value: "Bangkok" },
      { label: "Plaże + infrastruktura", value: "Phuket" },
      { label: "Widoki i wyspy", value: "Krabi" },
    ],
  },
  "/turcja": {
    flag: "🇹🇷",
    eyebrow: "TURCJA",
    title: "Turcja: All Inclusive, wybrzeże i city break",
    lead: "Porównaj Antalyę, Side, Alanyę i Stambuł. Ustaw termin i lotnisko, a potem sprawdź aktualne wakacje i lot + hotel.",
    searchDestination: "Turcja",
    image: "/images/destinations/stambul.jpg",
    popular: ["Antalya", "Side", "Alanya", "Stambuł"],
    matchingTerms: ["turcja", "antalya", "side", "alanya", "stambul", "stambuł"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/turcja/",
    bookingQuery: "Turkey",
    highlights: [
      { label: "Resorty", value: "Antalya / Side" },
      { label: "Budżetowo", value: "Alanya" },
      { label: "City break", value: "Stambuł" },
    ],
  },
  "/chorwacja": {
    flag: "🇭🇷",
    eyebrow: "CHORWACJA",
    title: "Chorwacja: Dalmacja, wyspy i wakacje nad Adriatykiem",
    lead: "Porównaj Split, Dubrownik, Zadar i wyspy. Ustaw termin oraz sposób podróży, a potem sprawdź noclegi i aktualne propozycje.",
    searchDestination: "Chorwacja",
    image: "/images/destinations/split.jpg",
    popular: ["Split", "Dubrownik", "Zadar", "Hvar"],
    matchingTerms: ["chorwacja", "split", "dubrownik", "zadar", "hvar"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/chorwacja/",
    bookingQuery: "Croatia",
    highlights: [
      { label: "Najbardziej uniwersalny", value: "Split" },
      { label: "Zwiedzanie", value: "Dubrownik" },
      { label: "Baza wypadowa", value: "Zadar" },
    ],
  },
  "/czarnogora": {
    flag: "🇲🇪",
    eyebrow: "CZARNOGÓRA",
    title: "Czarnogóra: Budva, Kotor i wakacje nad Adriatykiem",
    lead: "Porównaj Budvę, Kotor, Petrovac i Herceg Novi. Ustaw termin i sprawdź noclegi oraz aktualne wakacje.",
    searchDestination: "Czarnogóra",
    image: "/images/destinations/dubrownik.jpg",
    popular: ["Budva", "Kotor", "Petrovac", "Herceg Novi"],
    matchingTerms: ["czarnogora", "czarnogóra", "budva", "kotor", "petrovac", "herceg novi"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/czarnogora/",
    bookingQuery: "Montenegro",
    highlights: [
      { label: "Kurort", value: "Budva" },
      { label: "Widoki i stare miasto", value: "Kotor" },
      { label: "Spokojniej", value: "Petrovac" },
    ],
  },
  "/portugalia": {
    flag: "🇵🇹",
    eyebrow: "PORTUGALIA",
    title: "Portugalia: Lizbona, Porto, Algarve i Madera",
    lead: "Porównaj city break w Lizbonie lub Porto z dłuższym wypoczynkiem w Algarve i na Maderze.",
    searchDestination: "Portugalia",
    image: "/images/destinations/lizbona.jpg",
    popular: ["Lizbona", "Porto", "Algarve", "Madera"],
    matchingTerms: ["portugalia", "lizbona", "porto", "algarve", "madera"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/portugalia/",
    bookingQuery: "Portugal",
    highlights: [
      { label: "City break", value: "Lizbona" },
      { label: "Jedzenie i klimat", value: "Porto" },
      { label: "Plaże", value: "Algarve" },
    ],
  },
  "/francja": {
    flag: "🇫🇷",
    eyebrow: "FRANCJA",
    title: "Francja: Paryż, Lazurowe Wybrzeże i city break",
    lead: "Porównaj Paryż, Niceę i południe Francji. Ustaw termin i lotnisko, a potem sprawdź lot + hotel oraz noclegi.",
    searchDestination: "Francja",
    image: "/images/destinations/paryz.jpg",
    popular: ["Paryż", "Nicea", "Lazurowe Wybrzeże", "Marsylia"],
    matchingTerms: ["francja", "paryz", "paryż", "nicea", "marsylia"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/francja/",
    bookingQuery: "France",
    highlights: [
      { label: "City break", value: "Paryż" },
      { label: "Morze", value: "Nicea" },
      { label: "Południe", value: "Lazurowe Wybrzeże" },
    ],
  },
  "/bulgaria": {
    flag: "🇧🇬",
    eyebrow: "BUŁGARIA",
    title: "Bułgaria: Słoneczny Brzeg, Nessebar i wakacje nad morzem",
    lead: "Porównaj Słoneczny Brzeg, Nessebar, Złote Piaski i Sozopol. Ustaw termin oraz lotnisko, a potem sprawdź aktualne wakacje.",
    searchDestination: "Bułgaria",
    image: "/images/destinations/sloneczny-brzeg.jpg",
    popular: ["Słoneczny Brzeg", "Nessebar", "Złote Piaski", "Sozopol"],
    matchingTerms: ["bulgaria", "bułgaria", "sloneczny brzeg", "słoneczny brzeg", "nessebar", "zlote piaski", "złote piaski", "sozopol"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/bulgaria/",
    bookingQuery: "Bulgaria",
    highlights: [
      { label: "Duży wybór", value: "Słoneczny Brzeg" },
      { label: "Klimat starego miasta", value: "Nessebar" },
      { label: "Kurort", value: "Złote Piaski" },
    ],
  },
  "/tunezja": {
    flag: "🇹🇳",
    eyebrow: "TUNEZJA",
    title: "Tunezja: Djerba, Hammamet i All Inclusive",
    lead: "Porównaj Djerbę, Hammamet, Sousse i Monastir. Ustaw termin, lotnisko i wyżywienie, a potem sprawdź aktualne wakacje.",
    searchDestination: "Tunezja",
    image: "/images/destinations/djerba.jpg",
    popular: ["Djerba", "Hammamet", "Sousse", "Monastir"],
    matchingTerms: ["tunezja", "djerba", "dżerba", "hammamet", "sousse", "monastir"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/tunezja/",
    bookingQuery: "Tunisia",
    highlights: [
      { label: "Wyspa", value: "Djerba" },
      { label: "Resort + miasto", value: "Hammamet" },
      { label: "Budżetowo", value: "Sousse" },
    ],
  },
  "/dominikana": {
    flag: "🇩🇴",
    eyebrow: "DOMINIKANA",
    title: "Dominikana: Punta Cana i karaibskie All Inclusive",
    lead: "Ustaw termin i budżet, porównaj Punta Canę i inne regiony Dominikany, a potem sprawdź aktualne pakiety oraz noclegi.",
    searchDestination: "Dominikana",
    image: "https://images.unsplash.com/photo-1584553421349-3557471bed79?auto=format&fit=crop&w=1600&q=82",
    popular: ["Punta Cana", "Bayahibe", "Puerto Plata", "La Romana"],
    matchingTerms: ["dominikana", "dominican", "punta cana", "bayahibe", "puerto plata", "la romana"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/dominikana/",
    bookingQuery: "Dominican Republic",
    highlights: [
      { label: "Najpopularniejsza", value: "Punta Cana" },
      { label: "Spokojniej", value: "Bayahibe" },
      { label: "Północ", value: "Puerto Plata" },
    ],
  },
  "/meksyk": {
    flag: "🇲🇽",
    eyebrow: "MEKSYK",
    title: "Meksyk: Jukatan, Riviera Maya i większa podróż",
    lead: "Porównaj Cancún, Riviera Maya i inne kierunki w Meksyku. Ustaw termin oraz budżet, a potem sprawdź loty, pakiety i noclegi.",
    searchDestination: "Meksyk",
    image: "/images/longhaul/meksyk.webp",
    popular: ["Cancún", "Riviera Maya", "Tulum", "Playa del Carmen"],
    matchingTerms: ["meksyk", "mexico", "cancun", "cancún", "riviera maya", "tulum", "playa del carmen"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/meksyk/",
    bookingQuery: "Mexico",
    highlights: [
      { label: "Największy wybór", value: "Cancún" },
      { label: "Resort + zwiedzanie", value: "Riviera Maya" },
      { label: "Klimat", value: "Tulum" },
    ],
  },
  "/egipt": {
    flag: "🇪🇬",
    eyebrow: "EGIPT",
    title: "Egipt: od razu do ofert, nie do ściany tekstu",
    lead: "Wybierz Hurghadę, Marsa Alam albo Sharm el Sheikh, ustaw termin i lotnisko, a potem porównaj aktualne propozycje.",
    searchDestination: "Egipt",
    image: "/images/destinations/marsa-alam.jpg",
    popular: ["Hurghada", "Marsa Alam", "Sharm el Sheikh", "Makadi Bay"],
    matchingTerms: ["egipt", "hurghada", "marsa alam", "sharm", "makadi"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/egipt/",
    bookingQuery: "Egypt",
    highlights: [
      { label: "Dużo hoteli", value: "Hurghada" },
      { label: "Rafy i spokojniej", value: "Marsa Alam" },
      { label: "Kurort + atrakcje", value: "Sharm el Sheikh" },
    ],
  },
  "/maroko": {
    flag: "🇲🇦",
    eyebrow: "MAROKO",
    title: "Maroko: wybierz styl wyjazdu i sprawdź konkrety",
    lead: "Agadir na wypoczynek, Marrakesz na city break, Essaouira na spokojniejszy klimat. Ustaw własny termin albo przejdź do gotowych wakacji.",
    searchDestination: "Maroko",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1600&q=80",
    popular: ["Agadir", "Marrakesz", "Essaouira", "Casablanca"],
    matchingTerms: ["maroko", "marrakesz", "marrakech", "agadir", "essaouira", "casablanca"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/maroko/",
    bookingQuery: "Morocco",
    highlights: [
      { label: "Plaża i hotel", value: "Agadir" },
      { label: "City break", value: "Marrakesz" },
      { label: "Ocean + klimat", value: "Essaouira" },
    ],
  },
  "/zea": {
    flag: "🇦🇪",
    eyebrow: "ZJEDNOCZONE EMIRATY ARABSKIE",
    title: "ZEA: Dubaj, Abu Dhabi czy Ras Al Khaimah?",
    lead: "Zamiast pustej strony z jedną kartą: wybierz emiraty, ustaw daty i od razu sprawdź wakacje, noclegi oraz aktualne propozycje Tripowni.",
    searchDestination: "Dubaj",
    image: "/images/destinations/dubaj.jpg?v=20260902",
    popular: ["Dubaj", "Abu Dhabi", "Ras Al Khaimah", "Ajman"],
    matchingTerms: ["zea", "zjednoczone emiraty", "dubaj", "dubai", "abu dhabi", "ras al khaimah", "ajman"],
    wakacjeUrl: "https://www.wakacje.pl/wczasy/dubaj/",
    bookingQuery: "United Arab Emirates",
    highlights: [
      { label: "Najwięcej atrakcji", value: "Dubaj" },
      { label: "Miasto + kultura", value: "Abu Dhabi" },
      { label: "Resort i plaża", value: "Ras Al Khaimah" },
    ],
  },
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pl");
}

export function hasDestinationLanding(path: string) {
  return Boolean(DESTINATIONS[path]);
}

export default function DestinationLandingPanel({ path }: { path: string }) {
  const config = DESTINATIONS[path];
  if (!config) return null;

  const matchedOffers = offers
    .filter((offer) => offer.availabilityStatus !== "expired")
    .filter((offer) => {
      const haystack = normalize([
        offer.city,
        offer.country,
        offer.hotel,
        offer.board,
        offer.reason,
        ...offer.category,
      ].join(" "));
      return config.matchingTerms.some((term) => haystack.includes(normalize(term)));
    })
    .slice(0, 6);

  const wakacjeUrl = partners.wakacje.buildUrl(config.wakacjeUrl);
  const bookingUrl = partners.booking.buildUrl(
    `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(config.bookingQuery)}`,
  );

  return (
    <div className={styles.wrap}>
      <section
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(100deg, rgba(10,18,33,.92) 0%, rgba(10,18,33,.70) 52%, rgba(10,18,33,.28) 100%), url("${config.image}")`,
        }}
      >
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>{config.flag} {config.eyebrow}</div>
          <h1>{config.title}</h1>
          <p>{config.lead}</p>
          <div className={styles.heroActions}>
            <a href="#szukaj-kierunku" className={styles.primaryAction}>Ustaw daty i szukaj</a>
            <a href={wakacjeUrl} target="_blank" rel="sponsored noopener noreferrer" className={styles.secondaryAction}>
              Sprawdź gotowe wakacje
            </a>
          </div>
          <div className={styles.popular} aria-label="Najczęściej wybierane miejsca">
            {config.popular.map((place) => <span key={place}>{place}</span>)}
          </div>
        </div>
      </section>

      <section className={styles.quickFacts}>
        {config.highlights.map((item) => (
          <div key={item.label}>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <section id="szukaj-kierunku" className={styles.searchSection}>
        <div className={styles.sectionHead}>
          <div>
            <span>SZUKAJ PO SWOJEMU</span>
            <h2>Ustaw lotnisko, termin i długość pobytu</h2>
            <p>Kierunek jest już uzupełniony. Zmień tylko to, co ma znaczenie dla Twojego wyjazdu.</p>
          </div>
        </div>
        <SearchHub embedded initialTab="Wakacje" initialDestinations={[config.searchDestination]} destinationQuickPicks={config.popular} />
      </section>

      <section className={styles.offersSection}>
        <div className={styles.sectionHead}>
          <div>
            <span>KONKRETNE PROPOZYCJE</span>
            <h2>{matchedOffers.length ? "Aktualne propozycje Tripowni" : "Sprawdź aktualną dostępność"}</h2>
            <p>
              {matchedOffers.length
                ? "Najpierw pokazujemy dopasowane aktywne oferty. Finalną cenę i dostępność zawsze potwierdzasz u partnera."
                : "Nie pokazujemy losowych kart. Przejdź bezpośrednio do wyszukiwania dla tego kierunku."}
            </p>
          </div>
          <Link href="/okazje">Wszystkie okazje →</Link>
        </div>
        {matchedOffers.length > 0 && (
          <div className="cards-grid">
            {matchedOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        )}
      </section>

      <section className={styles.partnerShortcuts} aria-label="Szybkie przejścia do partnerów">
        <a href={wakacjeUrl} target="_blank" rel="sponsored noopener noreferrer">
          <span>🏖️</span>
          <div><strong>Wakacje i All Inclusive</strong><small>Wakacje.pl · link afiliacyjny Tripowni</small></div>
          <b>Sprawdź →</b>
        </a>
        <a href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer">
          <span>🏨</span>
          <div><strong>Noclegi</strong><small>Booking.com · kierunek już ustawiony</small></div>
          <b>Sprawdź →</b>
        </a>
        <Link href="/planer-podrozy">
          <span>🧭</span>
          <div><strong>Zbuduj własny plan</strong><small>Lot, nocleg, atrakcje i dodatki w jednym miejscu</small></div>
          <b>Otwórz →</b>
        </Link>
      </section>

      <p className={styles.disclaimer}>Ceny i dostępność zmieniają się dynamicznie. Tripownia pokazuje punkt startowy i kieruje do partnera, gdzie widzisz finalne warunki rezerwacji.</p>
    </div>
  );
}
