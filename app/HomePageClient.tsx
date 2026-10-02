"use client";

import { isHomepageDeal } from "@/lib/offerValuePolicy";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Flame, Sparkles, Dice5, Plane, Globe2, Palmtree, Building2, BadgePercent, ShieldCheck, Compass } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { offers, homepageFallbackOffers, isOfferExpired } from "@/lib/offers";
import { partners } from "@/lib/partners";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { trackEvent } from "@/lib/analytics";
import { touristDestinationKey } from "@/lib/destinationGrouping";

const SearchHub = dynamic(() => import("@/components/SearchHub"));
const SalesVisualShortcuts = dynamic(() => import("@/components/SalesVisualShortcuts"));
const RecentlyViewedOffers = dynamic(() => import("@/components/RecentlyViewedOffers"));

const DAILY_CACHE_MAX_AGE_MS = 48 * 60 * 60 * 1000;

const LOCAL_IMAGE_BY_CITY: Record<string, string> = {
  malta: "/images/destinations/valletta.jpg",
  valletta: "/images/destinations/valletta.jpg",
  barcelona: "/images/destinations/barcelona.jpg",
  alicante: "/images/destinations/alicante.jpg",
  bergamo: "/images/destinations/bergamo.jpg",
  djerba: "/images/destinations/djerba.jpg",
  rzym: "/images/destinations/rzym.jpg",
  roma: "/images/destinations/rzym.jpg",
  porto: "/images/destinations/porto.jpg",
  lizbona: "/images/destinations/lizbona.jpg",
  paryz: "/images/destinations/paryz.jpg",
  praga: "/images/destinations/praga.jpg",
  budapeszt: "/images/destinations/budapeszt.jpg",
  amsterdam: "/images/destinations/amsterdam.jpg",
  hammamet: "/images/destinations/hammamet.jpg",
  split: "/images/destinations/split.jpg",
  sewilla: "/images/destinations/sewilla.jpg",
  walencja: "/images/destinations/walencja.jpg",
  zadar: "/images/destinations/zadar.jpg",
  madera: "/images/destinations/madera.jpg",
  teneryfa: "/images/destinations/teneryfa.jpg",
  fuerteventura: "/images/destinations/fuerteventura.jpg",
  santorini: "/images/destinations/santorini.jpg",
  rodos: "/images/destinations/rodos.jpg",
  pafos: "/images/destinations/pafos.jpg",
  sycylia: "/images/destinations/sycylia.jpg",
  "marsa alam": "/images/destinations/marsa-alam.jpg",
  "sloneczny brzeg": "/images/destinations/sloneczny-brzeg.jpg",
  "riwiera albanska": "/images/destinations/riwiera-albanska.jpg",
  mediolan: "/images/destinations/mediolan.jpg",
  wenecja: "/images/destinations/wenecja.jpg",
  wieden: "/images/destinations/wieden.jpg",
  londyn: "/images/destinations/londyn.jpg",
  dubaj: "/images/destinations/dubaj.jpg",
  marrakesz: "/images/destinations/marrakesz.jpg",
  helsinki: "/images/destinations/helsinki.jpg",
  kopenhaga: "/images/destinations/kopenhaga.jpg",
  dublin: "/images/destinations/dublin.jpg",
  edynburg: "/images/destinations/edynburg.jpg",
  neapol: "/images/destinations/neapol.jpg",
  nicea: "/images/destinations/nicea.jpg",
  madryt: "/images/destinations/madryt.jpg",
  majorka: "/images/destinations/majorka.jpg",
  malaga: "/images/destinations/malaga.jpg",
  stambul: "/images/destinations/stambul.jpg",
};

function normalizeKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function destinationGroupKey(offer: { city: string; country: string }) {
  return touristDestinationKey(offer);
}

function cheapestPerDirection<T extends { city: string; country: string; price: number }>(rows: T[]) {
  const best = new Map<string, T>();
  for (const offer of rows) {
    const key = destinationGroupKey(offer);
    const current = best.get(key);
    if (!current || Number(offer.price || Infinity) < Number(current.price || Infinity)) {
      best.set(key, offer);
    }
  }
  return Array.from(best.values());
}

function isPublishedHomepageFallback(offer: TripOffer) {
  if (!offer?.affiliateUrl || !Number.isFinite(offer.price) || offer.price <= 0 || Number(offer.nights || 0) <= 0) return false;
  if (isOfferExpired(offer) || !isTravelDestinationAllowed(offer.city, offer.country)) return false;

  const haystack = `${offer.city} ${offer.country}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const exotic = /zanzibar|tanzania|kenia|mauritius|malediw|seszel|tajland|wietnam|indonez|bali|sri lanka|dominik|meksyk|kuba|jamaj|japon|usa|nowy jork|brazyl|kolumbi|peru|kostary|rpa/i.test(haystack);
  const allInclusive = /all[ -]?inclusive/i.test(offer.board || "");

  if (exotic) return offer.price <= (allInclusive ? 6000 : 5200);
  if (offer.nights <= 5) return offer.price <= 2000;
  if (offer.nights <= 8) return offer.price <= (allInclusive ? 3500 : 3000);
  return offer.price <= (allInclusive ? 3800 : 3200);
}

type TripOffer = (typeof offers)[number];

type DailyCache = {
  key?: string;
  checkedAt?: string;
  offers?: TripOffer[];
};

function readLastGoodDaily(): DailyCache | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(localStorage.getItem("tripownia:last-good-daily") || "null") as DailyCache | null;
    if (!saved || !Array.isArray(saved.offers) || !saved.offers.length || !saved.checkedAt) return null;
    const checkedAt = new Date(saved.checkedAt).getTime();
    const age = Date.now() - checkedAt;
    if (!Number.isFinite(checkedAt) || age < 0 || age > DAILY_CACHE_MAX_AGE_MS) {
      localStorage.removeItem("tripownia:last-good-daily");
      return null;
    }
    return saved;
  } catch {
    localStorage.removeItem("tripownia:last-good-daily");
    return null;
  }
}

function offerForDisplay(offer: TripOffer): TripOffer {
  if (offer.id >= 1_000_000 && offer.linkMatch === "exact") return offer;
  const key = normalizeKey(offer.city);
  const mapped = LOCAL_IMAGE_BY_CITY[key];
  if (!mapped) return offer;
  return { ...offer, image: `${mapped}?v=20260902` };
}

function buildKiwiFlightSearch(city: string, country: string, adults = 2) {
  const slug = `${normalizeKey(city)}-${normalizeKey(country)}`
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const url = new URL("https://www.kiwi.com/pl/");
  url.searchParams.set("origin", "warszawa-polska");
  url.searchParams.set("destination", slug);
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(url.toString());
}

function publicationKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now).reduce<Record<string,string>>((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  const current = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  if (Number(parts.hour) < 8) current.setUTCDate(current.getUTCDate() - 1);
  return current.toISOString().slice(0, 10);
}

const longHaulCards = [
  { href: "/dalekie-podroze#wietnam", region: "azja", label: "WIETNAM", title: "Wietnam", subtitle: "Hanoi · Ha Long · Hoi An", text: "Zatoka Ha Long, klimat Azji i niezapomniane smaki.", imageCity: "Wietnam", imageCountry: "Wietnam" },
  { href: "/dalekie-podroze#pekin", region: "azja", label: "CHINY", title: "Pekin", subtitle: "Wielki Mur · Zakazane Miasto", text: "Historia, nowoczesność i zupełnie inna skala podróżowania.", imageCity: "Pekin", imageCountry: "Chiny" },
  { href: "/dalekie-podroze#japonia", region: "azja", label: "JAPONIA", title: "Tokio + Kioto", subtitle: "Fuji · świątynie · tradycja", text: "Świątynie, kultura, jedzenie i kolej — podróż, której nie zamyka się w weekendzie.", imageCity: "Tokio", imageCountry: "Japonia" },
  { href: "/dalekie-podroze#tajlandia", region: "azja", label: "TAJLANDIA", title: "Bangkok + wyspy", subtitle: "Street food · świątynie · plaże", text: "Energia Bangkoku i kilka dni nad morzem w jednej podróży.", imageCity: "Bangkok", imageCountry: "Tajlandia" },
  { href: "/dalekie-podroze#bali", region: "azja", label: "INDONEZJA", title: "Bali", subtitle: "Tarasy ryżowe · świątynie · ocean", text: "Wyjazd, który warto układać regionami zamiast wokół jednego hotelu.", imageCity: "Bali", imageCountry: "Indonezja" },
  { href: "/dalekie-podroze#singapur", region: "azja", label: "SINGAPUR", title: "Singapur", subtitle: "Miasto · food · architektura", text: "Idealny jako pierwszy lub ostatni etap dłuższej podróży po Azji.", imageCity: "Singapur", imageCountry: "Singapur" },
  { href: "/dalekie-podroze#seul", region: "azja", label: "KOREA PŁD.", title: "Seul", subtitle: "Pałace · kultura · K-food", text: "Nowoczesne miasto, tradycja i świetna baza do odkrywania Korei Południowej.", imageCity: "Seul", imageCountry: "Korea Południowa" },
  { href: "/dalekie-podroze#malezja", region: "azja", label: "MALEZJA", title: "Malezja", subtitle: "Kuala Lumpur · wyspy · natura", text: "Metropolia, tropiki i różnorodność, która dobrze działa w jednej dłuższej trasie.", imageCity: "Kuala Lumpur", imageCountry: "Malezja" },
  { href: "/dalekie-podroze#malediwy", region: "azja", label: "MALEDIWY", title: "Malediwy", subtitle: "Laguny · rafy · wyspy", text: "Kierunek na prawdziwe odcięcie od codzienności i kilka dni nad turkusową wodą.", imageCity: "Malediwy", imageCountry: "Malediwy" },
  { href: "/dalekie-podroze#meksyk", region: "ameryka", label: "MEKSYK", title: "Meksyk", subtitle: "Kultura · kuchnia · Karaiby", text: "Kolor, historia, świetne jedzenie i możliwość połączenia zwiedzania z plażą.", imageCity: "Meksyk", imageCountry: "Meksyk" },
  { href: "/dalekie-podroze#sydney", region: "oceania", label: "AUSTRALIA", title: "Sydney", subtitle: "Opera · ocean · city life", text: "Ikoniczne miasto i dobry początek większej podróży po Australii.", imageCity: "Sydney", imageCountry: "Australia" },
  { href: "/dalekie-podroze#kapsztad", region: "afryka", label: "RPA", title: "Kapsztad", subtitle: "Ocean · góry · winnice", text: "Road trip i widoki, dla których naprawdę warto polecieć dalej.", imageCity: "Kapsztad", imageCountry: "RPA" },
  { href: "/dalekie-podroze#nowy-jork", region: "ameryka", label: "USA", title: "Nowy Jork", subtitle: "Manhattan · Brooklyn · Times Square", text: "Miasto, które nigdy nie śpi i zawsze daje powód, by wrócić.", imageCity: "Nowy Jork", imageCountry: "USA" },
  { href: "/dalekie-podroze#kostaryka", region: "ameryka", label: "KOSTARYKA", title: "Kostaryka", subtitle: "Dżungla · Pacyfik · Karaiby", text: "Natura, plaże i road trip pomiędzy dwoma wybrzeżami.", imageCity: "Kostaryka", imageCountry: "Kostaryka" },
  { href: "/dalekie-podroze#peru", region: "ameryka", label: "PERU", title: "Peru", subtitle: "Machu Picchu · Andy · Cusco", text: "Historia i krajobrazy, które spokojnie wypełnią dużą podróż.", imageCity: "Peru", imageCountry: "Peru" },
  { href: "/dalekie-podroze#zanzibar", region: "afryka", label: "ZANZIBAR", title: "Zanzibar", subtitle: "Plaże · Stone Town · przyprawy", text: "Tropikalna wyspa, którą łatwo połączyć z safari w Tanzanii.", imageCity: "Zanzibar", imageCountry: "Tanzania" },
  { href: "/dalekie-podroze#mauritius", region: "afryka", label: "MAURITIUS", title: "Mauritius", subtitle: "Laguny · góry · plaże", text: "Wyspa na dłuższy wypoczynek, ale z dużą ilością rzeczy do zobaczenia poza resortem.", imageCity: "Mauritius", imageCountry: "Mauritius" },
  { href: "/dalekie-podroze#nowa-zelandia", region: "oceania", label: "NOWA ZELANDIA", title: "Nowa Zelandia", subtitle: "Fiordy · road trip · natura", text: "Kierunek na dużą podróż i trasę, której nie warto robić w pośpiechu.", imageCity: "Nowa Zelandia", imageCountry: "Nowa Zelandia" },
  { href: "/dalekie-podroze#kenia", region: "afryka", label: "KENIA", title: "Kenia", subtitle: "Safari · sawanna · ocean", text: "Safari i kilka dni nad oceanem — podróż, którą warto planować etapami.", imageCity: "Kenia", imageCountry: "Kenia" },
  { href: "/dalekie-podroze#dominikana", region: "ameryka", label: "DOMINIKANA", title: "Dominikana", subtitle: "Karaiby · plaże · natura", text: "Tropiki nie tylko w resorcie — wyspa ma dużo więcej do pokazania.", imageCity: "Dominikana", imageCountry: "Dominikana" },
];

function LongHaulCardImage({ city, country }: { city: string; country: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [dynamicSrc, setDynamicSrc] = useState<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = hostRef.current;
    if (!node || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "420px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;

    let active = true;
    const controller = new AbortController();
    const params = new URLSearchParams({ city, country });

    fetch(`/api/destination-image?${params.toString()}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (active && data?.image?.url) setDynamicSrc(data.image.url);
      })
      .catch(() => {});

    return () => {
      active = false;
      controller.abort();
    };
  }, [city, country, shouldLoad]);

  return (
    <div ref={hostRef} className="long-haul-card-media" aria-hidden="true">
      {dynamicSrc ? (
        <img
          src={dynamicSrc}
          alt=""
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="long-haul-card-skeleton" />
      )}
      <span className="long-haul-card-shade" />
    </div>
  );
}

function LongHaulHomeSection() {
  const [region, setRegion] = useState("all");
  const railRef = useRef<HTMLDivElement>(null);
  const filtered = region === "all" ? longHaulCards : longHaulCards.filter(card => card.region === region);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".long-haul-card");
    const step = card ? card.getBoundingClientRect().width + 18 : 360;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const filters = [
    ["all", "Wszystkie", Globe2],
    ["azja", "Azja", Palmtree],
    ["ameryka", "Ameryka", Building2],
    ["afryka", "Afryka", Compass],
    ["oceania", "Australia i Oceania", Plane],
  ] as const;

  return (
    <section className="section shell long-haul-home visual-chapter chapter-longhaul" id="dalekie-podroze">
      <div className="long-haul-home-head">
        <div>
          <div className="kicker">DALEJ NIŻ WEEKEND</div>
          <h2>Czasem warto polecieć trochę dalej.</h2>
          <p>Nie tylko Europa. Azja, Ameryka, Afryka, Australia i Oceania — kierunki, które naprawdę dają poczucie większej podróży.</p>
        </div>
        <Link className="long-haul-all-link" href="/dalekie-podroze"><Plane size={20}/> Zobacz wszystkie kierunki <ArrowRight size={18}/></Link>
      </div>

      <div className="long-haul-filters" aria-label="Filtruj dalekie podróże według regionu">
        {filters.map(([key, label, Icon]) => (
          <button
            type="button"
            key={key}
            className={region === key ? "active" : ""}
            onClick={() => setRegion(key)}
            aria-pressed={region === key}
          >
            <Icon size={17}/><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="long-haul-rail-wrap">
        <button className="long-haul-arrow long-haul-arrow-left" type="button" onClick={() => scroll(-1)} aria-label="Poprzednie kierunki"><ArrowLeft size={22}/></button>
        <div className="long-haul-grid" ref={railRef}>
          {filtered.map(card => (
            <Link
              className="long-haul-card long-haul-card-photo-only"
              href={card.href}
              key={card.href}
              aria-label={`Zobacz kierunek: ${card.title}`}
              title={card.title}
            >
              <LongHaulCardImage
                city={card.imageCity}
                country={card.imageCountry}
              />
              <div className="long-haul-photo-caption">
                <strong>{card.title}</strong>
                <span>{card.subtitle}</span>
              </div>
            </Link>
          ))}
        </div>
        <button className="long-haul-arrow long-haul-arrow-right" type="button" onClick={() => scroll(1)} aria-label="Następne kierunki"><ArrowRight size={22}/></button>
      </div>

      <div className="long-haul-trust">
        <div><span><Globe2 size={19}/></span><p><strong>Wybrane kierunki</strong><small>Kierunki z przydatnymi informacjami i ofertami</small></p></div>
        <div><span><BadgePercent size={19}/></span><p><strong>Dobre ceny</strong><small>Aktualne propozycje w jednym miejscu</small></p></div>
        <div><span><ShieldCheck size={19}/></span><p><strong>Praktyczne przygotowanie</strong><small>Dokumenty, logistyka i rzeczy do sprawdzenia</small></p></div>
        <div><span><Compass size={19}/></span><p><strong>Inspiracje na cały rok</strong><small>Weekend, wakacje i wielkie podróże</small></p></div>
      </div>
    </section>
  );
}

const experienceCards = [
  { href: "/podroze-po-przezycia#zorza", season: "WRZESIEŃ–MARZEC", title: "🌌 Zorza na Islandii", text: "Ciemne noce, geotermia i wyjazd planowany pod szansę zobaczenia zorzy.", imageCity: "zorza islandia", imageCountry: "Islandia", fallbackImage: "/images/experiences/islandia-zorza.png" },
  { href: "/podroze-po-przezycia#sakura", season: "MARZEC–KWIECIEŃ", title: "🌸 Sakura w Japonii", text: "Tokio i Kioto wtedy, gdy kwitnienie wiśni staje się głównym punktem podróży.", imageCity: "sakura japonia", imageCountry: "Japonia", fallbackImage: "/images/experiences/japonia-sakura.png" },
  { href: "/podroze-po-przezycia#fiordy", season: "MAJ–WRZESIEŃ", title: "🏔️ Fiordy i białe noce", text: "Długie dni, trekking, rejsy i spektakularne trasy widokowe po Norwegii.", imageCity: "fiordy norwegia", imageCountry: "Norwegia", fallbackImage: "/images/experiences/norwegia-fiordy.png" },
  { href: "/podroze-po-przezycia#nowa-zelandia", season: "LISTOPAD–MARZEC", title: "🥾 Nowa Zelandia", text: "Road trip, góry i lato na południowej półkuli w najlepszym oknie na aktywny wyjazd.", imageCity: "nowa zelandia road trip", imageCountry: "Nowa Zelandia", fallbackImage: "/images/experiences/nowa-zelandia.png" },
  { href: "/podroze-po-przezycia#tulipany", season: "KWIECIEŃ–MAJ", title: "🌷 Tulipany w Holandii", text: "Krótki city break połączony z polami kwiatów i sezonem, który trwa tylko chwilę.", imageCity: "tulipany holandia", imageCountry: "Holandia", fallbackImage: "/images/experiences/holandia-tulipany.png" },
  { href: "/podroze-po-przezycia#safari", season: "CZERWIEC–PAŹDZIERNIK", title: "🦁 Safari w Kenii i Tanzanii", text: "Suchszy sezon, dzika przyroda i podróż, której termin ma ogromne znaczenie.", imageCity: "safari kenia tanzania", imageCountry: "Kenia", fallbackImage: "/images/experiences/kenia-safari.png" },
  { href: "/podroze-po-przezycia#wieloryby", season: "KWIECIEŃ–PAŹDZIERNIK", title: "🐋 Wieloryby i ocean", text: "Azory, Madera i Islandia w sezonie, w którym obserwacje wielorybów naprawdę mają sens.", imageCity: "wieloryby azory", imageCountry: "Portugalia", fallbackImage: "/images/destinations/madera.jpg" },
  { href: "/jarmarki-bozonarodzeniowe", season: "LISTOPAD–GRUDZIEŃ", title: "🎄 Jarmarki bożonarodzeniowe", text: "Wiedeń, Praga, Budapeszt i inne miasta wtedy, gdy sam klimat jest powodem wyjazdu.", imageCity: "jarmarki wieden noc", imageCountry: "Austria", fallbackImage: "/images/experiences/jarmarki.png" },
  { href: "/podroze-po-przezycia#egzotyka", season: "ZIMA W POLSCE", title: "🌴 Egzotyka w porze suchej", text: "Tropiki dobrane nie tylko po cenie, ale także po sezonie, opadach i warunkach na miejscu.", imageCity: "egzotyka pora sucha", imageCountry: "Seszele", fallbackImage: "/images/experiences/egzotyka.png" },
];

const homepageTripTypes = [
  { href: "/city-break", icon: "🏙️", title: "City break", note: "2–4 dni · szybki wyjazd" },
  { href: "/wakacje", icon: "🏖️", title: "Wakacje", note: "pakiety · All Inclusive · słońce" },
  { href: "/last-minute-oferty", icon: "⚡", title: "Last minute", note: "wyjazdy na już i najbliższe tygodnie" },
  { href: "/dalekie-podroze", icon: "🌏", title: "Dalekie podróże", note: "Azja · Ameryka · Afryka · Oceania" },
  { href: "/polska", icon: "🇵🇱", title: "Polska", note: "weekendy i wakacje bliżej domu" },
  { href: "/wakacje-z-dziecmi", icon: "👨‍👩‍👧‍👦", title: "Z dziećmi", note: "rodzinne kierunki i wygodny wyjazd" },
  { href: "/ferie-2027", icon: "⛷️", title: "Ferie 2027", note: "zimowy wyjazd w terminie szkolnym" },
  { href: "/majowka-2027", icon: "🌿", title: "Majówka 2027", note: "długi weekend i gotowe pomysły" },
  { href: "/wakacje-2027", icon: "☀️", title: "Wakacje 2027", note: "planuj wcześniej i porównuj terminy" },
  { href: "/tanie-loty", icon: "✈️", title: "Tanie loty", note: "okazje lotnicze z Polski" },
  { href: "/podroze-po-przezycia", icon: "✨", title: "Podróże po przeżycia", note: "zorza · sakura · safari · sezon" },
  { href: "/wydarzenia", icon: "⚽", title: "Mecze i wydarzenia", note: "wydarzenie jako powód do wyjazdu" },
  { href: "/jarmarki-bozonarodzeniowe", icon: "🎄", title: "Jarmarki", note: "świąteczne miasta i konkretne terminy" },
  { href: "/sylwester", icon: "🥂", title: "Sylwester", note: "city break na przełom roku" },
  { href: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu", icon: "🌤️", title: "Ciepło zimą", note: "słońce bez bardzo dalekiego lotu" },
] as const;

function OfferRail({ kicker, title, description, items, moreHref = "/okazje" }: { kicker: string; title: string; description: string; items: TripOffer[]; moreHref?: string }) {
  const railRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".offer-card");
    const step = card ? card.getBoundingClientRect().width + 18 : 320;
    rail.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="offer-stream-row">
      <div className="offer-stream-head">
        <div>
          <div className="kicker">{kicker}</div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="offer-stream-controls" aria-label={`Sterowanie: ${title}`}>
          <button type="button" onClick={() => move(-1)} aria-label={`Poprzednie: ${title}`}><ArrowLeft size={18}/></button>
          <button type="button" onClick={() => move(1)} aria-label={`Następne: ${title}`}><ArrowRight size={18}/></button>
        </div>
      </div>
      <div className="offer-stream-rail" ref={railRef}>
        {items.map((offer) => <div className="offer-stream-item" key={`${title}-${offer.id}`}><OfferCard offer={offer}/></div>)}
        <div className="offer-stream-item offer-stream-more-card">
          <Link href={moreHref}>
            <small>WIĘCEJ OFERT</small>
            <strong>Zobacz pełną pulę</strong>
            <span>Przejdź do wszystkich aktualnych propozycji.</span>
            <em>Zobacz więcej <ArrowRight size={15}/></em>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ExperienceTeaserImage({ city, country, title, fallbackSrc }: { city: string; country: string; title: string; fallbackSrc?: string }) {
  const [src, setSrc] = useState<string | null>(fallbackSrc || null);

  useEffect(() => {
    if (fallbackSrc) {
      setSrc(fallbackSrc);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const params = new URLSearchParams({ city, country });

    fetch(`/api/destination-image?${params.toString()}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (active && data?.image?.url) setSrc(data.image.url);
      })
      .catch(() => {});

    return () => {
      active = false;
      controller.abort();
    };
  }, [city, country, fallbackSrc]);

  return (
    <div className="experience-teaser-media" aria-hidden="true">
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.dataset.safeFallback !== "1") {
              image.dataset.safeFallback = "1";
              image.src = "/images/experiences/egzotyka.png";
              image.style.display = "block";
              return;
            }
            image.style.display = "none";
          }}
        />
      ) : (
        <div className="experience-teaser-skeleton" />
      )}
      <span>{title}</span>
    </div>
  );
}

export default function Home() {
  const [dailyKey, setDailyKey] = useState(() => publicationKey());

  useEffect(() => {
    const checkPublicationWindow = () => {
      const nextKey = publicationKey();
      setDailyKey(current => current === nextKey ? current : nextKey);
    };
    checkPublicationWindow();
    const timer = window.setInterval(checkPublicationWindow, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const [liveOffers, setLiveOffers] = useState<TripOffer[]>([]);
  const [liveOffersStatus, setLiveOffersStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [liveRefreshTick, setLiveRefreshTick] = useState(0);
  const [lastLiveCheckedAt, setLastLiveCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setLiveRefreshTick(value => value + 1), 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLiveOffersStatus("loading");

    const useCachedPool = () => {
      const saved = readLastGoodDaily();
      if (saved?.offers?.length) {
        setLiveOffers(saved.offers.slice(0, 60));
        setLastLiveCheckedAt(saved.checkedAt || null);
      } else {
        const publishedFallback = homepageFallbackOffers
          .filter((offer) => !isOfferExpired(offer))
          .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
          .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity))
          .slice(0, 60);
        setLiveOffers(publishedFallback);
        setLastLiveCheckedAt(null);
      }
      setLiveOffersStatus("fallback");
    };

    fetch(`/api/today-offers?key=${encodeURIComponent(dailyKey)}&refresh=${liveRefreshTick}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.ok === false) throw new Error("today-offers");
        return data;
      })
      .then((data) => {
        if (!active) return;
        const rows = Array.isArray(data?.offers) ? data.offers : [];
        const safeRows = rows
          .filter((offer: TripOffer) => offer && offer.id && offer.price > 0 && offer.affiliateUrl)
          .filter((offer: TripOffer) => isTravelDestinationAllowed(offer.city, offer.country));

        if (!safeRows.length) {
          useCachedPool();
          return;
        }

        const checkedAt = typeof data?.checkedAt === "string" ? data.checkedAt : new Date().toISOString();
        const freshPool = safeRows.slice(0, 60);
        setLiveOffers(freshPool);
        setLastLiveCheckedAt(checkedAt);
        setLiveOffersStatus("live");
        try {
          localStorage.setItem("tripownia:last-good-daily", JSON.stringify({ key: dailyKey, checkedAt, offers: freshPool }));
        } catch {}
      })
      .catch(() => {
        if (active) useCachedPool();
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [dailyKey, liveRefreshTick]);

  const publishedFallbackOffers = useMemo(() =>
    cheapestPerDirection(
      homepageFallbackOffers
        .filter(isPublishedHomepageFallback)
        .map(offerForDisplay)
    )
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity))
      .slice(0, 24),
    []
  );

  const homepageOfferPool = useMemo(() => {
    const liveDeals = cheapestPerDirection(liveOffers.map(offerForDisplay).filter(isHomepageDeal))
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity));

    const seen = new Set(liveDeals.map(destinationGroupKey));
    const fallback = publishedFallbackOffers.filter((offer) => {
      const key = destinationGroupKey(offer);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return [...liveDeals, ...fallback]
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity) || b.score - a.score)
      .slice(0, 18);
  }, [liveOffers, publishedFallbackOffers]);

  const todaysOffers = homepageOfferPool.slice(0, 18);

  const usingPublishedFallback = homepageOfferPool.some((offer) => offer.id < 1_000_000);
  const newOffersCount = todaysOffers.length;
  const hasOffers = newOffersCount > 0;

  const refreshStatus = useMemo(() => {
    const checked = lastLiveCheckedAt ? new Date(lastLiveCheckedAt) : null;
    const last = checked && !Number.isNaN(checked.getTime())
      ? new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(checked)
      : "w trakcie";
    return { last, next: "ceny sprawdzamy ponownie automatycznie co 10 min" };
  }, [lastLiveCheckedAt]);

  const themedRails = useMemo(() => {
    const uniqueCheapest = [...homepageOfferPool]
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity));

    const cheapest = uniqueCheapest.slice(0, 10);
    const cheapestKeys = new Set(cheapest.map(destinationGroupKey));

    const city = uniqueCheapest
      .filter((offer) => !cheapestKeys.has(destinationGroupKey(offer)))
      .filter((offer) => Number(offer.nights || 0) >= 2 && Number(offer.nights || 0) <= 5)
      .slice(0, 10);

    const usedKeys = new Set([...cheapestKeys, ...city.map(destinationGroupKey)]);
    const sunPattern = /egipt|turcj|grecj|hiszp|cypr|tunez|zanzibar|malediw|mauritius|dominik|teneryf|fuertevent|djerb|marsa alam|madera/i;
    const sun = uniqueCheapest
      .filter((offer) => !usedKeys.has(destinationGroupKey(offer)))
      .filter((offer) => Number(offer.nights || 0) >= 5 && sunPattern.test(`${offer.city} ${offer.country} ${(offer.category || []).join(" ")}`))
      .slice(0, 10);

    return {
      cheapest,
      city: city.length ? city : uniqueCheapest.filter((offer) => Number(offer.nights || 0) >= 2 && Number(offer.nights || 0) <= 5).slice(0, 10),
      sun: sun.length ? sun : uniqueCheapest.filter((offer) => Number(offer.nights || 0) >= 5).slice(0, 10),
    };
  }, [homepageOfferPool]);

  const offersRailRef = useRef<HTMLDivElement>(null);
  const [budget, setBudget] = useState(2500);
  const [surprise, setSurprise] = useState<TripOffer | null>(null);
  const [surpriseLive, setSurpriseLive] = useState<TripOffer[]>([]);
  const [surpriseLoading, setSurpriseLoading] = useState(false);

  useEffect(() => {
    setSurprise(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSurpriseLoading(true);
      fetch(`/api/today-offers?mode=surprise&budget=${budget}&key=${encodeURIComponent(dailyKey)}`, { cache: "no-store", signal: controller.signal })
        .then(r => r.json())
        .then(data => setSurpriseLive(Array.isArray(data?.offers) ? data.offers : []))
        .catch(() => setSurpriseLive([]))
        .finally(() => setSurpriseLoading(false));
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [budget, dailyKey]);

  const budgetCandidates = useMemo(() => {
    const pool = cheapestPerDirection([...surpriseLive, ...homepageOfferPool])
      .filter((offer) => isHomepageDeal(offer) || isPublishedHomepageFallback(offer));
    const exotic = /zanzibar|dominikan|malediw|kenia|meksyk|tajland|kuba|dubaj|bali|wietnam|japon|nowy jork|mauritius|seszel/i;
    const mid = /marsa alam|teneryfa|fuerteventura|marrakesz|djerba|hurghada|oman|wyspy zielonego przyladka/i;
    const low = /malta|sycylia|alicante|pafos|stambul|marrakesz|bergamo|porto/i;

    return pool
      .filter(o => !isOfferExpired(o))
      .filter(o => isTravelDestinationAllowed(o.city, o.country))
      .filter(o => o.price <= budget)
      .filter(o => budget < 3500 || exotic.test(`${o.city} ${o.country}`))
      .map(offerForDisplay)
      .sort((a, b) => a.price - b.price || b.score - a.score)
      .slice(0, 10);
  }, [budget, surpriseLive, homepageOfferPool]);

  function moveOffersRail(direction: -1 | 1) {
    const rail = offersRailRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".offer-card");
    const step = card ? card.getBoundingClientRect().width + 18 : 360;
    rail.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  }

  function pickSurprise() {
    if (!budgetCandidates.length) {
      setSurprise(null);
      return;
    }
    const top = budgetCandidates.slice(0, Math.min(6, budgetCandidates.length));
    let next = top[Math.floor(Math.random() * top.length)];
    if (surprise && top.length > 1 && next.id === surprise.id) {
      next = top[(top.findIndex(item => item.id === next.id) + 1) % top.length];
    }
    setSurprise(next);
  }

  const dailyCopy = liveOffersStatus === "live"
    ? "Dzisiejsze oferty są aktualizowane na bieżąco. Przy każdej karcie pokazujemy status ceny i dostępności."
    : hasOffers
      ? "Część aktualnych danych jest chwilowo niedostępna. Pokazujemy ostatnio sprawdzone oferty Tripowni — cenę i dostępność potwierdzisz przy rezerwacji."
      : "Sprawdzamy dzisiejszą pulę. Nie pokazujemy archiwalnych cen w zastępstwie aktualnych danych.";

  return (
    <main className="homepage-visual-v2">
      <SiteHeader />

      <section className="dream-hero">
        <div className="shell dream-hero-shell">
          <div className="dream-hero-copy">
            <div className="dream-eyebrow"><Sparkles size={16}/> Wyszukiwanie i darmowy planer w jednym miejscu</div>
            <h1>Znajdź wyjazd.<br/><span>Zaplanuj całą podróż za 0 zł.</span></h1>
            <p>Znajdź wyjazd, a potem ogarnij całą podróż w jednym miejscu.</p>
            <div className="dream-hero-actions">
              <Link className="dream-primary" href="#wyszukiwarka" onClick={() => trackEvent("home_primary_cta", { action: "search" })}>Znajdź wyjazd <ArrowRight size={18}/></Link>
              <Link className="dream-secondary" href="/dodaj-podroz?mode=owned" onClick={() => trackEvent("home_primary_cta", { action: "add_owned_trip" })}>Dodaj kupiony wyjazd</Link>
            </div>
            <div className="dream-category-row" aria-label="Co znajdziesz w Tripowni">
              <Link href="/wakacje">🌴 Wakacje</Link>
              <Link href="/loty">✈️ Loty</Link>
              <Link href="/hotele">🏨 Hotele</Link>
              <Link href="/atrakcje">🎟️ Atrakcje</Link>
              <Link href="/wynajem-auta">🚗 Auto</Link>
            </div>
          </div>

          <div className="dream-hero-card">
            <div className="dream-card-kicker">ZACZNIJ TAK, JAK CI WYGODNIE</div>
            <Link href="#wyszukiwarka"><span>🔎</span><div><strong>Wiem, gdzie chcę lecieć</strong><small>Wyszukaj po swojemu</small></div><ArrowRight size={18}/></Link>
            <Link href="/gdzie-leciec"><span>✨</span><div><strong>Nie wiem gdzie</strong><small>Dobierz kierunek do mnie</small></div><ArrowRight size={18}/></Link>
            <Link href="/dodaj-podroz?mode=owned"><span>🧳</span><div><strong>Dodaj kupiony wyjazd</strong><small>Wpisz to, co już masz — Tripownia ułoży resztę</small></div><ArrowRight size={18}/></Link>
          </div>
        </div>
      </section>

      <SearchHub />
      <SalesVisualShortcuts />
      <RecentlyViewedOffers />

      <section className="section shell homepage-curated-trips" aria-labelledby="curated-trips-title">
        <div className="section-heading">
          <div>
            <div className="kicker">PODPOWIEDZI TRIPOWNI</div>
            <h2 id="curated-trips-title">Najtańsze sensowne wyjazdy na start.</h2>
            <p>Najpierw cena, potem różnorodność. Każdy kierunek pokazujemy tylko raz w pierwszej sekcji.</p>
          </div>
          <Link className="section-premium-link" href="/okazje">Wszystkie okazje <ArrowRight size={16}/></Link>
        </div>
        {usingPublishedFallback && (
          <div className="homepage-offer-source-note" role="status">
            Źródła ofert live chwilowo nie odpowiadają. Pokazujemy ostatnio opublikowane propozycje — aktualną cenę i dostępność potwierdzisz po kliknięciu.
          </div>
        )}
        <OfferRail kicker="💸 NAJTANIEJ TERAZ" title="Najniższe ceny na pierwszy rzut" description="Najtańsze propozycje pokazujemy pierwsze — po jednym wariancie na kierunek." items={themedRails.cheapest}/>
        <OfferRail kicker="🏙 CITY BREAK" title="Na kilka dni" description="Krótkie wyjazdy bez powielania kierunków z sekcji najtańszych." items={themedRails.city}/>
        <OfferRail kicker="☀️ WAKACJE" title="Słońce i dłuższy odpoczynek" description="Dłuższe wyjazdy i ciepłe kierunki, których nie pokazaliśmy wyżej." items={themedRails.sun}/>
      </section>

      <section className="section shell visual-chapter chapter-daily" id="okazje">
        <div className="section-heading">
          <div>
            <div className="kicker">DZISIEJSZA SELEKCJA</div>
            <h2>Co dziś ma sens cenowo?</h2>
            <p>{dailyCopy}</p>
          </div>
          <Link className="section-premium-link" href="/okazje">Zobacz wszystkie okazje <ArrowRight size={16}/></Link>
        </div>
        <div className="daily-carousel-wrap">
          {todaysOffers.length > 1 && <div className="daily-carousel-controls" aria-label="Sterowanie karuzelą ofert">
            <button type="button" onClick={() => moveOffersRail(-1)} aria-label="Poprzednie oferty"><ArrowLeft size={18}/></button>
            <button type="button" onClick={() => moveOffersRail(1)} aria-label="Następne oferty"><ArrowRight size={18}/></button>
          </div>}
          <div className="daily-carousel" ref={offersRailRef}>
            {todaysOffers.length > 0 ? (
              todaysOffers.map(o => <div className="daily-carousel-item" key={o.id}><OfferCard offer={o}/></div>)
            ) : (
              <div className="daily-live-empty">
                <strong>{liveOffersStatus === "loading" ? "Sprawdzamy dzisiejszą pulę" : "Aktualizujemy dzisiejsze oferty"}</strong>
                <span>Nie pokazujemy starych cen jako bieżących. Wyszukiwarka powyżej również działa wyłącznie na potwierdzonych danych.</span>
              </div>
            )}
          </div>
        </div>
        <div className="premium-action-row">
          <Link className="premium-action-main" href="#wyszukiwarka">Wyszukaj po swojemu <ArrowRight size={17}/></Link>
          <Link className="premium-action-secondary" href="/okazje">Zobacz wszystkie okazje <ArrowRight size={17}/></Link>
        </div>
      </section>

      <section className="section shell homepage-trip-types" aria-labelledby="homepage-trip-types-title">
        <div className="section-heading homepage-trip-types-heading">
          <div>
            <div className="kicker">WYBIERZ SWÓJ WYJAZD</div>
            <h2 id="homepage-trip-types-title">Wybierz typ podróży.</h2>
          </div>
          <Link className="section-premium-link" href="/kierunki">Wszystkie kierunki <ArrowRight size={16}/></Link>
        </div>
        <div className="homepage-trip-types-grid">
          {homepageTripTypes.map(item => (
            <Link className="homepage-trip-type-card" href={item.href} key={item.href}>
              <span aria-hidden="true">{item.icon}</span>
              <div><strong>{item.title}</strong><small>{item.note}</small></div>
              <ArrowRight size={17}/>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell homepage-events" aria-labelledby="homepage-events-title">
        <div className="section-heading">
          <div>
            <div className="kicker">WYJAZDY NA WYDARZENIA</div>
            <h2 id="homepage-events-title">Jedź na wydarzenie.</h2>
          </div>
          <Link className="section-premium-link" href="/wydarzenia">Zobacz wydarzenia <ArrowRight size={16}/></Link>
        </div>

        <Link href="/wydarzenia" className="homepage-football-package">
          <div className="homepage-football-copy">
            <small>⚽ OSOBNY PAKIET</small>
            <h3>Piłka nożna + city break</h3>
            <p>Wybierz konkretny mecz. Tripownia dopasuje termin, lot, nocleg i plan pobytu wokół wydarzenia.</p>
            <strong>Wybierz mecz i zbuduj wyjazd <ArrowRight size={17}/></strong>
          </div>
          <div className="homepage-football-steps" aria-label="Co obejmuje pakiet piłkarski">
            <span><b>1</b> Mecz</span>
            <span><b>2</b> Lot</span>
            <span><b>3</b> Nocleg</span>
            <span><b>4</b> City break</span>
          </div>
        </Link>
      </section>

      <section className="section shell homepage-phenomena" aria-labelledby="homepage-phenomena-title">
        <div className="section-heading">
          <div>
            <div className="kicker">ZJAWISKA I SEZON</div>
            <h2 id="homepage-phenomena-title">Podróże, na które warto trafić w dobrym momencie.</h2>
          </div>
          <Link className="section-premium-link" href="/podroze-po-przezycia">Zobacz pełny kalendarz <ArrowRight size={16}/></Link>
        </div>
        <div className="homepage-phenomena-grid">
          {[...experienceCards,
            { href: "/sylwester", season: "29 GRUDNIA–2 STYCZNIA", title: "🥂 Sylwester za granicą", text: "Gotowy city break na przełom roku — lot, nocleg i miasto, w którym północ naprawdę jest wydarzeniem.", imageCity: "sylwester praga noc fajerwerki", imageCountry: "Czechy", fallbackImage: "/images/destinations/praga.jpg" }
          ].map(card => (
            <Link className="discovery-card experience-teaser-card" href={card.href} key={card.href}>
              <ExperienceTeaserImage city={card.imageCity} country={card.imageCountry} title={card.title} fallbackSrc={"fallbackImage" in card && typeof card.fallbackImage === "string" ? card.fallbackImage : undefined} />
              <div className="experience-teaser-copy">
                <small>{card.season}</small>
                <strong>{card.title}</strong>
                <span>{card.text}</span>
                <em>Zobacz najlepszy moment →</em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell dream-free-plan">
        <div className="dream-free-plan-copy">
          <div className="kicker">DARMOWY PERSONALIZOWANY PLAN PODRÓŻY</div>
          <h2>Powiedz nam tylko <span>dokąd i kiedy jedziesz.</span><br/>Resztę pomożemy Ci ogarnąć.</h2>
          <p>Plan, rezerwacje, checklista i wydatki — razem.</p>
          <div className="dream-free-plan-actions">
            <Link href="/dodaj-podroz" onClick={() => trackEvent("planner_cta_click", { placement: "homepage_free_plan" })}>Stwórz mój plan — 0 zł <ArrowRight size={18}/></Link>
            <Link href="/app">Zobacz moją Tripownię</Link>
          </div>
          <div className="dream-free-plan-trust">Bez abonamentu za planer · Możesz dodać wyjazd kupiony gdzie indziej · Wszystko możesz odhaczać i wracać później</div>
        </div>

        <div className="dream-free-plan-board">
          <div className="dream-free-plan-top">
            <div><small>TWOJA TRIPOWNIA</small><strong>Wszystkie podróże w jednym miejscu</strong></div>
            <span>Konto opcjonalne</span>
          </div>
          <div className="dream-free-plan-items">
            <div className="done"><b>✓</b><span><strong>Twoje podróże</strong><small>aktualne i wcześniejsze plany</small></span></div>
            <div className="done"><b>✓</b><span><strong>Profil podróżnika</strong><small>budżet, lotniska, styl i preferencje</small></span></div>
            <div><b>✓</b><span><strong>Plan dnia i checklista</strong><small>osobno dla każdego wyjazdu</small></span></div>
            <div><b>✓</b><span><strong>Rezerwacje i notatki</strong><small>lot, hotel, transfer i ważne informacje</small></span></div>
            <div><b>✓</b><span><strong>Wydatki</strong><small>koszty konkretnej podróży w jednym miejscu</small></span></div>
            <div><b>✓</b><span><strong>Ulubione i porównania</strong><small>wracasz do zapisanych ofert później</small></span></div>
            <div><b>✓</b><span><strong>Synchronizacja konta</strong><small>po zalogowaniu wracasz do danych na innym urządzeniu</small></span></div>
          </div>
          <Link className="dream-free-plan-board-cta" href="/dodaj-podroz" onClick={() => trackEvent("planner_cta_click", { placement: "homepage_board" })}>Dodaj swoją pierwszą podróż <ArrowRight size={16}/></Link>
        </div>
      </section>

      <section className="section shell dream-marketplace" id="marketplace">
        <div className="dream-marketplace-head">
          <div>
            <div className="kicker">MARKETPLACE PODRÓŻY</div>
            <h2>Wszystko do podróży.<br/><span>W kolejności, w której naprawdę tego potrzebujesz.</span></h2>

          </div>
          <Link className="dream-marketplace-all" href="/dodaj-podroz?mode=owned" onClick={() => trackEvent("planner_cta_click", { placement: "homepage_marketplace_owned" })}>Mam już wyjazd — dodaj go do planera <ArrowRight size={17}/></Link>
        </div>

        <div className="dream-marketplace-groups">
          <div className="dream-marketplace-group">
            <div className="dream-marketplace-group-head"><small>1. REZERWUJĘ WYJAZD</small><strong>Zacznij od podstaw</strong></div>
            <div className="dream-marketplace-grid">
              <Link className="dream-service-card dream-service-main" href="/wakacje">
                <div className="dream-service-icon">🌴</div><strong>Wakacje</strong><span>Gotowy pakiet: hotel, termin i wyjazd.</span><em>Znajdź wakacje →</em>
              </Link>
              <Link className="dream-service-card" href="/loty">
                <div className="dream-service-icon">✈️</div><strong>Loty</strong><span>Porównaj połączenia i wybierz najlepszy wariant.</span><em>Sprawdź loty →</em>
              </Link>
              <Link className="dream-service-card" href="/hotele">
                <div className="dream-service-icon">🏨</div><strong>Hotele</strong><span>Znajdź nocleg dopasowany do planu wyjazdu.</span><em>Sprawdź noclegi →</em>
              </Link>
            </div>
          </div>

          <div className="dream-marketplace-group">
            <div className="dream-marketplace-group-head"><small>2. PRZYGOTOWUJĘ WYJAZD</small><strong>Domknij rzeczy przed wylotem</strong></div>
            <div className="dream-marketplace-grid">
              <Link className="dream-service-card" href="/ubezpieczenia">
                <div className="dream-service-icon">🛡️</div><strong>Ubezpieczenie</strong><span>Sprawdź ochronę przed wyjazdem.</span><em>Sprawdź opcje →</em>
              </Link>
              <Link className="dream-service-card" href="/esim">
                <div className="dream-service-icon">📱</div><strong>eSIM</strong><span>Internet gotowy od chwili lądowania.</span><em>Wybierz eSIM →</em>
              </Link>
              <Link className="dream-service-card" href="/parkingi">
                <div className="dream-service-icon">🅿️</div><strong>Parking</strong><span>Zostaw auto przy lotnisku bez stresu.</span><em>Znajdź parking →</em>
              </Link>
            </div>
          </div>

          <div className="dream-marketplace-group">
            <div className="dream-marketplace-group-head"><small>3. JESTEM NA MIEJSCU</small><strong>Poruszaj się i korzystaj z wyjazdu</strong></div>
            <div className="dream-marketplace-grid">
              <Link className="dream-service-card" href="/transfery">
                <div className="dream-service-icon">🚕</div><strong>Transfer</strong><span>Lotnisko → hotel bez szukania po lądowaniu.</span><em>Sprawdź transfer →</em>
              </Link>
              <Link className="dream-service-card" href="/wynajem-auta">
                <div className="dream-service-icon">🚗</div><strong>Auto</strong><span>Wynajem dopasowany do Twojej trasy.</span><em>Porównaj auta →</em>
              </Link>
              <Link className="dream-service-card" href="/atrakcje">
                <div className="dream-service-icon">🎟️</div><strong>Atrakcje</strong><span>Bilety, wycieczki i rezerwacje na miejscu.</span><em>Znajdź atrakcje →</em>
              </Link>
            </div>
          </div>
        </div>

        <div className="dream-marketplace-footer">
          <span>Masz już kupiony wyjazd?</span>
          <Link href="/dodaj-podroz">Dodaj go do Tripowni — planer podpowie, czego jeszcze brakuje <ArrowRight size={16}/></Link>
        </div>
      </section>

      <section className="section shell dream-personalization">
        <div>
          <small>DOPASOWANE DO CIEBIE</small>
          <h2>Ustaw swoje preferencje.<br/>Tripownia dopasuje do nich podróże.</h2>

        </div>
        <div className="dream-personalization-chips">
          <span>✈️ Warszawa</span><span>💰 Twój budżet</span><span>🌡️ Ciepło</span><span>🗓️ Twój urlop</span><span>🏨 Twój standard</span><span>❤️ Twój styl</span>
        </div>
        <div className="dream-personalization-actions">
          <Link href="/dla-ciebie">Zobacz „Dla Ciebie” <ArrowRight size={17}/></Link>
          <Link href="/profil">Ustaw profil podróżnika</Link>
        </div>
      </section>

      <section className="section shell streaming-discovery visual-chapter chapter-streaming" aria-label="Odkrywaj Tripownię inaczej">
        <div className="section-heading"><div><div className="kicker">WIĘCEJ NIŻ ZWYKŁA OFERTA</div><h2>Wybierz powód do podróży.</h2><p>Zamiast kolejnej listy podobnych ofert — cztery różne sposoby na znalezienie następnego wyjazdu.</p></div></div>
        <div className="streaming-rail editorial-streaming-rail">
          <Link href="/dalekie-podroze" className="streaming-tile"><small>🌏 DALEJ</small><strong>Europa to dziś za mało</strong><span>Wietnam, Japonia, Bali, Nowy Jork i kierunki na większą podróż.</span></Link>
          <Link href="/podroze-po-przezycia" className="streaming-tile"><small>✨ PO PRZEŻYCIA</small><strong>Nie jedź tylko „gdzieś”</strong><span>Zorza, sakura, safari, fiordy, jarmarki i podróże pod właściwy moment.</span></Link>
          <Link href="/wydarzenia" className="streaming-tile"><small>⚽ PIŁKA NOŻNA</small><strong>Wyjazdy na mecze piłkarskie</strong><span>Barcelona, Inter i inne wydarzenia jako najlepszy pretekst do wyjazdu.</span></Link>
          <Link href="/egzotyka-zima" className="streaming-tile"><small>🌴 UCIECZKA OD ZIMY</small><strong>30°C zamiast skrobania szyb</strong><span>Tropiki dobrane do sezonu, nie tylko do najniższej ceny.</span></Link>
        </div>
      </section>

      <section className="budget-wrap visual-chapter chapter-budget" id="budzet">
        <div className="shell budget-grid">
          <div>
            <div className="kicker light">WYNIKI TRIPOWNIA.PL</div>
            <h2>Mam {budget} zł.<br/>Gdzie mogę polecieć?</h2>
            <p>Ustaw kwotę, a Tripownia pokaże tylko wyjazdy, które mieszczą się w Twoim budżecie.</p>
            <input type="range" min="500" max="5000" step="100" value={budget} onChange={e => setBudget(Number(e.target.value))}/>
            <div className="range-labels"><span>500 zł</span><strong>{budget} zł</strong><span>5000 zł</span></div>
          </div>
          <div className="surprise-card">
            <Sparkles size={30}/><h3>Nie wiesz gdzie?</h3><p>Daj nam budżet i daj się zaskoczyć.</p>
            <button onClick={pickSurprise} disabled={surpriseLoading}><Dice5 size={18}/> {surpriseLoading?"Szukamy czegoś lepszego…":"Zaskocz mnie"}</button>
            {!budgetCandidates.length && (
              <div className="surprise-result surprise-result-v2">
                <strong>W tym budżecie nie mamy teraz potwierdzonej okazji.</strong>
                <em>Nie podstawiamy starej ceny ani przypadkowego kierunku tylko po to, żeby coś pokazać.</em>
              </div>
            )}
            {surprise && (
              <div className="surprise-result surprise-result-v2">
                <span className="surprise-flag">{surprise.flag}</span>
                <strong>{surprise.city}</strong>
                <em>{surprise.reason}</em>
                <span>Tripownia znalazła od {surprise.price.toLocaleString("pl-PL")} zł/os. · mieści się w budżecie {budget.toLocaleString("pl-PL")} zł.</span>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                  <a href={surprise.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer" style={{fontWeight:800,textDecoration:"none"}}>Zobacz wyjazd →</a>
                  <a href={buildKiwiFlightSearch(surprise.city, surprise.country)} target="_blank" rel="sponsored noopener noreferrer" style={{fontWeight:800}}>✈️ Sprawdź loty →</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
