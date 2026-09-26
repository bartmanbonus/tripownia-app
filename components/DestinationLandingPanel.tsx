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
