"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Flame, Sparkles, Dice5, Heart, Plane, Globe2, Palmtree, Building2, BadgePercent, ShieldCheck, Compass } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import SelfSearchLegacy from "@/components/SelfSearchLegacy";
import { offers, getDailyOffers, isOfferExpired } from "@/lib/offers";
import { partners } from "@/lib/partners";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { LONG_HAUL_IMAGES } from "@/lib/longHaulImages";



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
  const text = `${normalizeKey(offer.city)} ${normalizeKey(offer.country)}`;

  // Jeden kierunek turystyczny może zawierać wiele miejscowości/hoteli.
  // Grupujemy je tak, jak widzi je użytkownik, a nie według technicznej nazwy resortu.
  const groups: Array<[RegExp, string]> = [
    [/zanzibar|kiwengwa|matemwe|mangapwani|nungwi|kendwa|paje|jambiani|makunduchi/, "zanzibar"],
    [/durres|durrës|golem|shkembi|riwiera albanska|albania/, "riwiera-albanska"],
    [/malta|mellieha|sliema|st julian|saint julian|bugibba|qawra|valletta/, "malta"],
    [/teneryf|tenerife|costa adeje|playa de las americas|puerto de la cruz/, "teneryfa"],
    [/fuerteventura|corralejo|costa calma|morro jable|caleta de fuste/, "fuerteventura"],
    [/gran canaria|maspalomas|playa del ingles|puerto rico/, "gran-canaria"],
    [/lanzarote|puerto del carmen|playa blanca|costa teguise/, "lanzarote"],
    [/djerba|midoun|zarzis/, "djerba"],
    [/hammamet|yasmine hammamet/, "hammamet"],
    [/hurghada|makadi bay|soma bay|sahl hasheesh/, "hurghada"],
    [/marsa alam|port ghalib|el quseir/, "marsa-alam"],
    [/sharm el sheikh|sharm|nabq bay/, "sharm-el-sheikh"],
    [/rodos|rhodes|faliraki|kolymbia|lindos/, "rodos"],
    [/kreta|crete|heraklion|hersonissos|malia|rethymno|chania/, "kreta"],
    [/majorka|mallorca|palma de mallorca|alcudia|magaluf/, "majorka"],
    [/cypr|cyprus|pafos|paphos|larnaka|larnaca|ayia napa|protaras/, "cypr"],
    [/mauritius|mauritius/, "mauritius"],
    [/malediw|maldives/, "malediwy"],
    [/seszel|seychelles/, "seszele"],
  ];

  for (const [pattern, key] of groups) {
    if (pattern.test(text)) return key;
  }

  return `${normalizeKey(offer.city)}|${normalizeKey(offer.country)}`;
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

type TripOffer = (typeof offers)[number];

function offerForDisplay(offer: TripOffer): TripOffer {
  // Oferty z feedów live mają własne zdjęcie konkretnego hotelu i gotowy deeplink.
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

function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function seededShuffle<T>(items: T[], seedText: string) {
  let seed = hashSeed(seedText) || 1;
  const out = [...items];
  const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

const longHaulCards = [
  { href: "/dalekie-podroze#wietnam", region: "azja", label: "WIETNAM", title: "Wietnam", subtitle: "Hanoi · Ha Long · Hoi An", text: "Zatoka Ha Long, klimat Azji i niezapomniane smaki.", imageCity: "Wietnam", imageCountry: "Wietnam", fallbackImage: LONG_HAUL_IMAGES.wietnam },
  { href: "/dalekie-podroze#pekin", region: "azja", label: "CHINY", title: "Pekin", subtitle: "Wielki Mur · Zakazane Miasto", text: "Historia, nowoczesność i zupełnie inna skala podróżowania.", imageCity: "Pekin", imageCountry: "Chiny", fallbackImage: LONG_HAUL_IMAGES.pekin },
  { href: "/dalekie-podroze#japonia", region: "azja", label: "JAPONIA", title: "Tokio + Kioto", subtitle: "Fuji · świątynie · tradycja", text: "Świątynie, kultura, jedzenie i kolej — podróż, której nie zamyka się w weekendzie.", imageCity: "Tokio", imageCountry: "Japonia", fallbackImage: LONG_HAUL_IMAGES.japonia },
  { href: "/dalekie-podroze#tajlandia", region: "azja", label: "TAJLANDIA", title: "Bangkok + wyspy", subtitle: "Street food · świątynie · plaże", text: "Energia Bangkoku i kilka dni nad morzem w jednej podróży.", imageCity: "Bangkok", imageCountry: "Tajlandia", fallbackImage: LONG_HAUL_IMAGES.tajlandia },
  { href: "/dalekie-podroze#bali", region: "azja", label: "INDONEZJA", title: "Bali", subtitle: "Tarasy ryżowe · świątynie · ocean", text: "Wyjazd, który warto układać regionami zamiast wokół jednego hotelu.", imageCity: "Bali", imageCountry: "Indonezja", fallbackImage: LONG_HAUL_IMAGES.bali },
  { href: "/dalekie-podroze#singapur", region: "azja", label: "SINGAPUR", title: "Singapur", subtitle: "Miasto · food · architektura", text: "Idealny jako pierwszy lub ostatni etap dłuższej podróży po Azji.", imageCity: "Singapur", imageCountry: "Singapur", fallbackImage: LONG_HAUL_IMAGES.singapur },
  { href: "/dalekie-podroze#seul", region: "azja", label: "KOREA PŁD.", title: "Seul", subtitle: "Pałace · kultura · K-food", text: "Nowoczesne miasto, tradycja i świetna baza do odkrywania Korei Południowej.", imageCity: "Seul", imageCountry: "Korea Południowa", fallbackImage: LONG_HAUL_IMAGES.seul },
  { href: "/dalekie-podroze#malezja", region: "azja", label: "MALEZJA", title: "Malezja", subtitle: "Kuala Lumpur · wyspy · natura", text: "Metropolia, tropiki i różnorodność, która dobrze działa w jednej dłuższej trasie.", imageCity: "Kuala Lumpur", imageCountry: "Malezja", fallbackImage: LONG_HAUL_IMAGES.malezja },
  { href: "/dalekie-podroze#malediwy", region: "azja", label: "MALEDIWY", title: "Malediwy", subtitle: "Laguny · rafy · wyspy", text: "Kierunek na prawdziwe odcięcie od codzienności i kilka dni nad turkusową wodą.", imageCity: "Malediwy", imageCountry: "Malediwy", fallbackImage: LONG_HAUL_IMAGES.malediwy },
  { href: "/dalekie-podroze#meksyk", region: "ameryka", label: "MEKSYK", title: "Meksyk", subtitle: "Kultura · kuchnia · Karaiby", text: "Kolor, historia, świetne jedzenie i możliwość połączenia zwiedzania z plażą.", imageCity: "Meksyk", imageCountry: "Meksyk", fallbackImage: LONG_HAUL_IMAGES.meksyk },
  { href: "/dalekie-podroze#sydney", region: "oceania", label: "AUSTRALIA", title: "Sydney", subtitle: "Opera · ocean · city life", text: "Ikoniczne miasto i dobry początek większej podróży po Australii.", imageCity: "Sydney", imageCountry: "Australia", fallbackImage: LONG_HAUL_IMAGES.sydney },
  { href: "/dalekie-podroze#kapsztad", region: "afryka", label: "RPA", title: "Kapsztad", subtitle: "Ocean · góry · winnice", text: "Road trip i widoki, dla których naprawdę warto polecieć dalej.", imageCity: "Kapsztad", imageCountry: "RPA", fallbackImage: LONG_HAUL_IMAGES.kapsztad },
  { href: "/dalekie-podroze#nowy-jork", region: "ameryka", label: "USA", title: "Nowy Jork", subtitle: "Manhattan · Brooklyn · Times Square", text: "Miasto, które nigdy nie śpi i zawsze daje powód, by wrócić.", imageCity: "Nowy Jork", imageCountry: "USA", fallbackImage: LONG_HAUL_IMAGES.nowy_jork },
  { href: "/dalekie-podroze#kostaryka", region: "ameryka", label: "KOSTARYKA", title: "Kostaryka", subtitle: "Dżungla · Pacyfik · Karaiby", text: "Natura, plaże i road trip pomiędzy dwoma wybrzeżami.", imageCity: "Kostaryka", imageCountry: "Kostaryka", fallbackImage: LONG_HAUL_IMAGES.kostaryka },
  { href: "/dalekie-podroze#peru", region: "ameryka", label: "PERU", title: "Peru", subtitle: "Machu Picchu · Andy · Cusco", text: "Historia i krajobrazy, które spokojnie wypełnią dużą podróż.", imageCity: "Peru", imageCountry: "Peru", fallbackImage: LONG_HAUL_IMAGES.peru },
  { href: "/dalekie-podroze#zanzibar", region: "afryka", label: "ZANZIBAR", title: "Zanzibar", subtitle: "Plaże · Stone Town · przyprawy", text: "Tropikalna wyspa, którą łatwo połączyć z safari w Tanzanii.", imageCity: "Zanzibar", imageCountry: "Tanzania", fallbackImage: LONG_HAUL_IMAGES.zanzibar },
  { href: "/dalekie-podroze#mauritius", region: "afryka", label: "MAURITIUS", title: "Mauritius", subtitle: "Laguny · góry · plaże", text: "Wyspa na dłuższy wypoczynek, ale z dużą ilością rzeczy do zobaczenia poza resortem.", imageCity: "Mauritius", imageCountry: "Mauritius", fallbackImage: LONG_HAUL_IMAGES.mauritius },
];


function LongHaulCardImage({ city, country, fallbackSrc }: { city: string; country: string; fallbackSrc?: string }) {
  const [dynamicSrc, setDynamicSrc] = useState<string | null>(null);

  useEffect(() => {
    if (fallbackSrc) return;

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
  }, [city, country, fallbackSrc]);

  const src = fallbackSrc || dynamicSrc;

  return (
    <div className="long-haul-card-media" aria-hidden="true">
      {src ? (
        <img
          src={src}
          alt=""
          loading={fallbackSrc ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={fallbackSrc ? "high" : "auto"}
          onError={(event) => {
            const img = event.currentTarget;
            img.style.display = "none";
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
                fallbackSrc={"fallbackImage" in card ? card.fallbackImage : undefined}
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
        <div><span><Globe2 size={19}/></span><p><strong>Sprawdzone kierunki</strong><small>Tylko miejsca, które polecamy</small></p></div>
        <div><span><BadgePercent size={19}/></span><p><strong>Dobre ceny</strong><small>Oferty z zaufanych partnerów</small></p></div>
        <div><span><ShieldCheck size={19}/></span><p><strong>Bezpieczne podróże</strong><small>Praktyczne wskazówki i porady</small></p></div>
        <div><span><Compass size={19}/></span><p><strong>Inspiracje na cały rok</strong><small>Weekend, wakacje i wielkie podróże</small></p></div>
      </div>
    </section>
  );
}

const experienceCards = [
  {
    href: "/podroze-po-przezycia#zorza",
    season: "WRZESIEŃ–MARZEC",
    title: "🌌 Zorza na Islandii",
    text: "Ciemne noce, geotermia i wyjazd planowany pod szansę zobaczenia zorzy.",
    imageCity: "zorza islandia", imageCountry: "Islandia", fallbackImage: "/images/experiences/islandia-zorza.png",
  },
  {
    href: "/podroze-po-przezycia#sakura",
    season: "MARZEC–KWIECIEŃ",
    title: "🌸 Sakura w Japonii",
    text: "Tokio i Kioto wtedy, gdy kwitnienie wiśni staje się głównym punktem podróży.",
    imageCity: "sakura japonia", imageCountry: "Japonia", fallbackImage: "/images/experiences/japonia-sakura.png",
  },
  {
    href: "/podroze-po-przezycia#fiordy",
    season: "MAJ–WRZESIEŃ",
    title: "🏔️ Fiordy i białe noce",
    text: "Długie dni, trekking, rejsy i spektakularne trasy widokowe po Norwegii.",
    imageCity: "fiordy norwegia", imageCountry: "Norwegia", fallbackImage: "/images/experiences/norwegia-fiordy.png",
  },
  {
    href: "/podroze-po-przezycia#nowa-zelandia",
    season: "LISTOPAD–MARZEC",
    title: "🥾 Nowa Zelandia",
    text: "Road trip, góry i lato na południowej półkuli w najlepszym oknie na aktywny wyjazd.",
    imageCity: "nowa zelandia road trip", imageCountry: "Nowa Zelandia", fallbackImage: "/images/experiences/nowa-zelandia.png",
  },
  {
    href: "/podroze-po-przezycia#tulipany",
    season: "KWIECIEŃ–MAJ",
    title: "🌷 Tulipany w Holandii",
    text: "Krótki city break połączony z polami kwiatów i sezonem, który trwa tylko chwilę.",
    imageCity: "tulipany holandia", imageCountry: "Holandia", fallbackImage: "/images/experiences/holandia-tulipany.png",
  },
  {
    href: "/podroze-po-przezycia#safari",
    season: "CZERWIEC–PAŹDZIERNIK",
    title: "🦁 Safari w Kenii i Tanzanii",
    text: "Suchszy sezon, dzika przyroda i podróż, której termin ma ogromne znaczenie.",
    imageCity: "safari kenia tanzania", imageCountry: "Kenia", fallbackImage: "/images/experiences/kenia-safari.png",
  },
  {
    href: "/podroze-po-przezycia#jarmarki",
    season: "LISTOPAD–GRUDZIEŃ",
    title: "🎄 Jarmarki bożonarodzeniowe",
    text: "Wiedeń, Praga, Budapeszt i inne miasta wtedy, gdy sam klimat jest powodem wyjazdu.",
    imageCity: "jarmarki wieden", imageCountry: "Austria", fallbackImage: "/images/experiences/jarmarki.png",
  },
  {
    href: "/podroze-po-przezycia#egzotyka",
    season: "ZIMA W POLSCE",
    title: "🌴 Egzotyka w porze suchej",
    text: "Tropiki dobrane nie tylko po cenie, ale także po sezonie, opadach i warunkach na miejscu.",
    imageCity: "egzotyka pora sucha", imageCountry: "Seszele", fallbackImage: "/images/experiences/egzotyka.png",
  },
];

function ExperienceTeaserImage({
  city,
  country,
  title,
  fallbackSrc,
}: {
  city: string;
  country: string;
  title: string;
  fallbackSrc?: string;
}) {
  const [src, setSrc] = useState<string | null>(fallbackSrc || null);

  useEffect(() => {
    // Dla kart kuratorskich lokalna grafika ma pierwszeństwo i nie jest nadpisywana API-em.
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
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="experience-teaser-skeleton" />
      )}
      <span>{title}</span>
    </div>
  );
}

function OfferRail({ kicker, title, description, items }: { kicker: string; title: string; description: string; items: typeof offers }) {
  const railRef = useRef<HTMLDivElement>(null);
  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".offer-card");
    const step = card ? card.getBoundingClientRect().width + 18 : 360;
    rail.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  };
  if (!items.length) return null;
  const sparse = items.length < 3;
  return <section className={`offer-stream-row${sparse ? " is-sparse" : ""}`}>
    <div className="offer-stream-head">
      <div><div className="kicker">{kicker}</div><h3>{title}</h3><p>{description}</p></div>
    </div>
    <div className={`offer-stream-rail-wrap${sparse ? " is-sparse" : ""}`}>
      {items.length > 1 && <div className="offer-stream-controls"><button type="button" onClick={()=>move(-1)} aria-label={`Poprzednie: ${title}`}><ArrowLeft size={18}/></button><button type="button" onClick={()=>move(1)} aria-label={`Następne: ${title}`}><ArrowRight size={18}/></button></div>}
      <div className="offer-stream-rail" ref={railRef} tabIndex={0} onWheel={(e)=>{const rail=railRef.current;if(!rail)return;if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();rail.scrollBy({left:e.deltaY,behavior:"smooth"});}}}>{items.map(o=><div className="offer-stream-item" key={`${title}-${o.id}`}><OfferCard offer={o}/></div>)}</div>
      {sparse && <div className="offer-stream-sparse-helper"><small>CHCESZ WIĘCEJ OPCJI?</small><strong>Nie rozciągamy jednej oferty na cały ekran.</strong><span>Jeśli dzisiejszy feed ma mało dobrych dopasowań, pokażemy tylko zweryfikowane propozycje. Resztę możesz wyszukać po swoich parametrach.</span><Link href="#szukaj-samodzielnie">Wyszukaj samodzielnie <ArrowRight size={16}/></Link></div>}
    </div>
  </section>;
}

export default function Home() {
  // V101: selekcja dzienna przełącza się o 08:00 czasu polskiego.
  // Nie zależy od deploymentu ani od ponownego otwarcia karty.
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

  const [liveOffers, setLiveOffers] = useState<TripOffer[]>(() => getDailyOffers(offers, 20));
  const [liveOffersStatus, setLiveOffersStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [eximCityBreaks, setEximCityBreaks] = useState<TripOffer[]>([]);
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

    fetch(`/api/today-offers?key=${encodeURIComponent(dailyKey)}&refresh=${liveRefreshTick}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("today-offers")))
      .then((data) => {
        if (!active) return;
        const rows = Array.isArray(data?.offers) ? data.offers : [];
        const safeRows = rows
          .filter((offer: TripOffer) => offer && offer.id && offer.price > 0 && offer.affiliateUrl)
          .filter((offer: TripOffer) => isTravelDestinationAllowed(offer.city, offer.country));
        if (safeRows.length >= 8) {
          const freshPool = safeRows.slice(0, 20);
          setLiveOffers(freshPool);
          try {
            localStorage.setItem("tripownia:last-good-daily", JSON.stringify({
              key: dailyKey,
              checkedAt: data?.checkedAt || new Date().toISOString(),
              offers: freshPool,
            }));
          } catch {}
          setLastLiveCheckedAt(typeof data?.checkedAt === "string" ? data.checkedAt : new Date().toISOString());
          setLiveOffersStatus("live");
        } else {
          try {
            const saved = JSON.parse(localStorage.getItem("tripownia:last-good-daily") || "null");
            if (Array.isArray(saved?.offers) && saved.offers.length) {
              setLiveOffers(saved.offers.slice(0, 20));
              setLastLiveCheckedAt(saved.checkedAt || null);
            } else {
              setLiveOffers(getDailyOffers(offers, 20));
              setLastLiveCheckedAt(null);
            }
          } catch {
            setLiveOffers(getDailyOffers(offers, 20));
            setLastLiveCheckedAt(null);
          }
          setLiveOffersStatus("fallback");
        }
      })
      .catch(() => {
        if (!active) return;
        try {
          const saved = JSON.parse(localStorage.getItem("tripownia:last-good-daily") || "null");
          if (Array.isArray(saved?.offers) && saved.offers.length) {
            setLiveOffers(saved.offers.slice(0, 20));
            setLastLiveCheckedAt(saved.checkedAt || null);
          } else {
            setLiveOffers(getDailyOffers(offers, 20));
            setLastLiveCheckedAt(null);
          }
        } catch {
          setLiveOffers(getDailyOffers(offers, 20));
          setLastLiveCheckedAt(null);
        }
        setLiveOffersStatus("fallback");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [dailyKey, liveRefreshTick]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/today-offers?mode=citybreak&key=${encodeURIComponent(dailyKey)}&refresh=${liveRefreshTick}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("citybreak-exim")))
      .then((data) => {
        const rows = Array.isArray(data?.offers) ? data.offers : [];
        setEximCityBreaks(rows
          .filter((offer: TripOffer) => offer?.partner === "exim" && offer.nights >= 2 && offer.nights <= 5 && offer.price > 0 && offer.affiliateUrl)
          .filter((offer: TripOffer) => isTravelDestinationAllowed(offer.city, offer.country))
          .slice(0, 8));
      })
      .catch(() => setEximCityBreaks([]));
    return () => controller.abort();
  }, [dailyKey, liveRefreshTick]);

  // Sekcja „dzisiejsze” pokazuje wyłącznie dane pobrane na żywo.
  // Nie podstawiamy starych kart jako rzekomo aktualnej puli.
  const todaysOffers = useMemo(() =>
    cheapestPerDirection(liveOffers.map(offerForDisplay))
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity)),
    [liveOffersStatus, liveOffers]
  );

  const newOffersCount = todaysOffers.length;

  const refreshStatus = useMemo(() => {
    const checked = lastLiveCheckedAt ? new Date(lastLiveCheckedAt) : null;
    const last = checked && !Number.isNaN(checked.getTime())
      ? new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(checked)
      : "w trakcie";
    return {
      last,
      next: "ceny sprawdzamy ponownie automatycznie co 10 min",
    };
  }, [lastLiveCheckedAt]);

  const themedRails = useMemo(() => {
    const key = dailyKey;
    const homePool = liveOffers;
    // Najpierw wybieramy NAJTAŃSZĄ ofertę dla każdego kierunku, dopiero potem układamy kolejność dnia.
    const cheapestDirections = cheapestPerDirection(
      homePool
        .filter(o => isTravelDestinationAllowed(o.city, o.country))
        .map(offerForDisplay)
    );
    const active: TripOffer[] = seededShuffle<TripOffer>(cheapestDirections, `tripownia-rails:${key}`);
    const uniqueDestinations = (rows: typeof active) => {
      const seen = new Set<string>();
      return rows.filter((offer) => {
        const destination = destinationGroupKey(offer);
        if (seen.has(destination)) return false;
        seen.add(destination);
        return true;
      });
    };
    const pick = (match: (o: (typeof offers)[number]) => boolean, limit = 8) => uniqueDestinations(active.filter(match)).slice(0, limit);
    const fillRail = (primary: typeof active, minimum = 5) => {
      const result = uniqueDestinations(primary);
      const used = new Set(result.map(destinationGroupKey));
      for (const offer of active) {
        if (result.length >= minimum) break;
        const destination = destinationGroupKey(offer);
        if (!used.has(destination)) { result.push(offer); used.add(destination); }
      }
      return result;
    };
    // City breaki nadal opieramy na EXIM, ale łączymy dedykowany feed z aktualną pulą EXIM,
    // żeby pojedynczy słabszy response nie zostawiał sekcji z jedną samotną kartą.
    const eximCityPool = [
      ...eximCityBreaks,
      ...liveOffers.filter(o => o.partner === "exim" && o.nights >= 2 && o.nights <= 5),
    ];
    const city = uniqueDestinations(cheapestPerDirection(eximCityPool.map(offerForDisplay))).slice(0, 8);
    const sun = fillRail(pick(o => (o.category || []).some(c => /plaza|cieplo|allinclusive/i.test(c))), 5);
    const unusualNames = /Marrakesz|Pafos|Riwiera Albańska|Marsa Alam|Bodrum|Sycylia|Madera|Djerba|Hammamet|Rodos|Fuerteventura/i;
    const unusual = fillRail(pick(o => unusualNames.test(o.city)), 5);
    return { city, sun, unusual };
  }, [dailyKey, liveOffersStatus, liveOffers, eximCityBreaks]);
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
    const pool = surpriseLive.length ? surpriseLive : liveOffers;
    const exotic = /zanzibar|dominikan|malediw|kenia|meksyk|tajland|kuba|dubaj|bali|wietnam|japon|nowy jork|mauritius|seszel/i;
    const mid = /marsa alam|teneryfa|fuerteventura|marrakesz|djerba|hurghada|oman|wyspy zielonego przyladka/i;
    const low = /malta|sycylia|alicante|pafos|stambul|marrakesz|bergamo|porto/i;

    return pool
      .filter(o => !isOfferExpired(o))
      .filter(o => isTravelDestinationAllowed(o.city, o.country))
      .filter(o => o.price <= budget)
      .filter(o => budget < 3500 || exotic.test(`${o.city} ${o.country}`))
      .map(offerForDisplay)
      .sort((a, b) => {
        const aText = `${a.city} ${a.country}`.toLowerCase();
        const bText = `${b.city} ${b.country}`.toLowerCase();
        const tierScore = (text:string) => budget >= 3500 ? (exotic.test(text) ? 500 : 0) : budget >= 1800 ? (mid.test(text) ? 250 : 0) : (low.test(text) ? 180 : 0);
        const aFit = a.price / Math.max(1, budget);
        const bFit = b.price / Math.max(1, budget);
        return (tierScore(bText) + bFit * 80 + Number(b.score || 0) * 10) - (tierScore(aText) + aFit * 80 + Number(a.score || 0) * 10);
      })
      .slice(0, 10);
  }, [budget, surpriseLive, liveOffersStatus, liveOffers]);



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

  return (
    <main>
      <SiteHeader />

      <section className="hero hero-clean hero-travel-visual">
        <div className="shell hero-inner hero-inner-clean hero-inner-restored">
          <div className="hero-copy hero-copy-clean">
            <div className="pill"><Flame size={16}/> Codziennie wybrane okazje</div>
            <h1>Gdzie dziś lecimy?<br/><span>Znajdź coś naprawdę dobrego.</span></h1>
            <p>Nie wiesz gdzie? Pokażemy najlepsze znalezione dziś. Wiesz czego chcesz? Wyszukaj po swojemu — bez wychodzenia z Tripowni.</p>
            <div className="hero-mode-actions">
              <Link href="#okazje">🔥 Pokaż mi okazje</Link>
              <Link href="#szukaj-samodzielnie">🔎 Wyszukaj samodzielnie</Link>
            </div>
          </div>

          <aside className="hero-daily-panel hero-radar-panel" aria-label="Na radarze Tripowni dzisiaj">
            <div className="hero-daily-icon">✦</div>
            <div className="kicker">NA RADARZE DZISIAJ</div>
            <h2>Co warto kliknąć teraz?</h2>
            <p>Nie przypadkowe kierunki — trzy propozycje wyciągnięte z dzisiejszej selekcji.</p>
            <div className="hero-daily-stats">
              <div className="hero-daily-stat"><strong>{newOffersCount}</strong><span>aktualnych ofert w dzisiejszej puli</span></div>
              <div className="hero-daily-stat"><Clock3 size={17}/><div><strong>Ostatnia aktualizacja: {refreshStatus.last}</strong><span>{refreshStatus.next}</span></div></div>
            </div>
            <div className="hero-radar-list">
              {todaysOffers.slice(0,3).map((offer, index) => (
                <a href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer" className="hero-radar-offer" key={offer.id}>
                  <span>{offer.flag}</span>
                  <div><small>{index === 0 ? "🔥 NAJLEPSZY STRZAŁ" : index === 1 ? "✨ WARTO SPRAWDZIĆ" : "🌍 COŚ INNEGO"}</small><strong>{offer.city}</strong><em>{offer.dates} · {offer.nights} nocy</em></div>
                  <b>od {offer.price.toLocaleString("pl-PL")} zł →</b>
                </a>
              ))}
            </div>
            <Link className="hero-daily-cta" href="#okazje"><span>Zobacz dzisiejsze okazje</span><ArrowRight size={16}/></Link>
          </aside>
          <a className="hero-photo-credit" href="https://commons.wikimedia.org/wiki/File:Bora_Bora_(16542797633).jpg" target="_blank" rel="noopener noreferrer">Bora Bora · The TerraMar Project · CC BY 2.0</a>
        </div>
      </section>

      <SearchHub />

      <section className="section shell visual-chapter chapter-daily" id="okazje">
        <div className="section-heading">
          <div>
            <div className="kicker">DZISIEJSZA SELEKCJA</div>
            <h2>Dziś bralibyśmy te</h2>
            <p>Codziennie wybieramy aktualne propozycje i o 08:00 czasu polskiego publikujemy nową pulę z cenami i bezpośrednim przejściem do rezerwacji.</p>
          </div>
          <Link className="section-premium-link" href="#okazje">Zobacz wszystkie okazje <ArrowRight size={16}/></Link>
        </div>
        <div className="daily-carousel-wrap">
          <div className="daily-carousel-controls" aria-label="Sterowanie karuzelą ofert">
            <button type="button" onClick={() => moveOffersRail(-1)} aria-label="Poprzednie oferty"><ArrowLeft size={18}/></button>
            <button type="button" onClick={() => moveOffersRail(1)} aria-label="Następne oferty"><ArrowRight size={18}/></button>
          </div>
          <div className="daily-carousel" ref={offersRailRef}>
            {todaysOffers.length > 0 ? (
              todaysOffers.map(o => <div className="daily-carousel-item" key={o.id}><OfferCard offer={o}/></div>)
            ) : (
              <div className="daily-live-empty">
                <strong>Aktualizujemy dzisiejszą pulę</strong>
                <span>Nie udało się pobrać nowej puli. Pokazujemy ostatnią poprawnie zweryfikowaną selekcję, jeśli jest dostępna.</span>
              </div>
            )}
          </div>
        </div>
        <div className="premium-action-row">
          <Link className="premium-action-main" href="#szukaj-samodzielnie">Wyszukaj po swojemu <ArrowRight size={17}/></Link>
          <Link className="premium-action-secondary" href="#okazje">Zobacz wszystkie okazje <ArrowRight size={17}/></Link>
        </div>
      </section>

      <section className="self-search-home-stage" aria-label="Wyszukaj podróż samodzielnie">
        <div className="shell self-search-home-shell">
          <div className="self-search-home-intro">
            <div>
              <span className="self-search-home-badge">🔎 WIESZ, CZEGO SZUKASZ?</span>
              <strong>Przejdź z inspiracji do konkretu.</strong>
            </div>
            <p>Tu nie podpowiadamy przypadkowych kierunków. Ustaw własne parametry i przejdź prosto do dostępnych opcji.</p>
          </div>
          <SelfSearchLegacy />
        </div>
      </section>

      <section className="section shell streaming-discovery streaming-offers visual-chapter chapter-streaming" aria-label="Odkrywaj oferty Tripowni">
        <div className="section-heading"><div><div className="kicker">NETFLIX PODRÓŻY</div><h2>Przewijaj, aż coś kliknie.</h2><p>Nie jedna ściana ofert. Różne nastroje, różne budżety i konkretne kierunki — codziennie w innym układzie.</p></div></div>
        <OfferRail kicker="🔥 TREND / CITY BREAK" title="Weekend, który ratuje tydzień" description="Krótkie pakiety: lot + hotel + transfer w cenie. Konkretne terminy i ceny w jednym miejscu." items={themedRails.city}/>
        <OfferRail kicker="☀️ SŁOŃCE / ALL INCLUSIVE" title="Jeszcze trochę lata" description="Plaża, ciepło i gotowe wakacje — od krótkiego resetu po pełny tydzień." items={themedRails.sun}/>
        <OfferRail kicker="✨ UKRYTE PEREŁKI" title="Nie kolejny Rzym i Barcelona" description="Mniej oczywiste kierunki, które robią większe wrażenie niż kolejny klasyk." items={themedRails.unusual}/>
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
                <strong>W tym budżecie nie mamy dziś zweryfikowanej okazji.</strong>
                <em>Przy tym budżecie szukamy kierunku, który naprawdę ma sens — bez wciskania przypadkowego klasyka.</em>
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

      <section className="section shell visual-chapter chapter-discover" id="odkrywaj">
        <div className="section-heading"><div><div className="kicker">NIE TYLKO KLASYKI</div><h2>Masz już za sobą Barcelonę i Rzym?</h2></div></div>
        <div className="discovery-grid">
          <Link className="discovery-card" href="/maroko"><small>BLISKA EGZOTYKA</small><strong>🇲🇦 Maroko</strong><span>Kolor, jedzenie, pustynia i zupełnie inny klimat bez lotu na drugi koniec świata.</span></Link>
          <Link className="discovery-card" href="/riwiera-albanska"><small>MNIEJ OCZYWISTE</small><strong>🇦🇱 Albania</strong><span>Bałkany, morze i kierunek, który wciąż można odkrywać poza utartym szlakiem.</span></Link>
          <Link className="discovery-card" href="/madera"><small>AKTYWNIE</small><strong>🇵🇹 Madera</strong><span>Levada, klify i całoroczna zieleń zamiast klasycznego leżaka.</span></Link>
          <Link className="discovery-card" href="/dubaj"><small>DALEJ</small><strong>🇦🇪 Dubaj i ZEA</strong><span>Słońce zimą i dobra baza do pierwszej dalszej podróży.</span></Link>
        </div>
      </section>

      <LongHaulHomeSection />

      <section className="section shell experience-section visual-chapter chapter-experience" id="przezycia">
        <div className="section-heading">
          <div>
            <div className="kicker">PODRÓŻE PO PRZEŻYCIA</div>
            <h2>Nie wybieraj miejsca.<br/>Wybierz to, co chcesz przeżyć.</h2>
            <p>Sezonowe zjawiska, natura i podróże, dla których naprawdę warto złapać właściwy moment.</p>
          </div>
          <Link href="/podroze-po-przezycia">Zobacz pełny kalendarz <ArrowRight size={16}/></Link>
        </div>

        <div className="discovery-grid experience-home-grid">
          {experienceCards.filter(card => card.href !== "/podroze-po-przezycia#jarmarki" || Date.now() <= new Date("2027-01-07T22:59:59Z").getTime()).map(card => (
            <Link className="discovery-card experience-teaser-card" href={card.href} key={card.href}>
              <ExperienceTeaserImage city={card.imageCity} country={card.imageCountry} title={card.title} fallbackSrc={"fallbackImage" in card ? card.fallbackImage : undefined} />
              <div className="experience-teaser-copy">
                <small>{card.season}</small>
                <strong>{card.title}</strong>
                <span>{card.text}</span>
                <em>Zobacz najlepszy moment →</em>
              </div>
            </Link>
          ))}
        </div>

        <div className="experience-signals-grid" aria-label="Co Tripownia bierze pod uwagę przy podróżach po przeżycia">
          <div className="experience-signal"><span>🌦️</span><strong>Pogoda i sezon</strong><small>Pora sucha, deszczowa, temperatury i długość dnia.</small></div>
          <div className="experience-signal"><span>🌌</span><strong>Zjawiska</strong><small>Zorza, kwitnienie, białe noce i krótkie okna sezonowe.</small></div>
          <div className="experience-signal"><span>🐋</span><strong>Natura i migracje</strong><small>Safari, wieloryby i okresy największej aktywności przyrody.</small></div>
          <div className="experience-signal"><span>🧊</span><strong>Warunki na miejscu</strong><small>Lodowce, trekking, stan szlaków i realna dostępność atrakcji.</small></div>
        </div>
      </section>

      <section className="section shell custom-trip visual-chapter chapter-custom">
        <div className="section-heading">
          <div>
            <div className="kicker">WŁASNA PODRÓŻ</div>
            <h2>Masz pomysł? Zbuduj wyjazd po swojemu.</h2>
            <p>Wybierz kierunek, lotnisko, długość i budżet. Tripownia pomoże połączyć lot, nocleg i atrakcje zamiast wciskać gotowy pakiet.</p>
          </div>
        </div>
        <div className="hub-grid">
          <a href="#szukaj-samodzielnie"><strong>🧩 Zacznij od własnych parametrów</strong><span>Ustaw filtry i przeszukaj aktualną bazę Tripowni.</span></a>
          <a href={partners.kiwi.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>✈️ Dobierz lot</strong><span>Porównaj połączenia i dobierz najlepszy wariant.</span></a>
          <a href={partners.booking.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>🏨 Dobierz nocleg</strong><span>Porównaj noclegi dla wybranego kierunku i terminu.</span></a>
        </div>
      </section>

      <section className="section shell content-hubs visual-chapter chapter-content">
        <div className="section-heading"><div><div className="kicker">ODKRYWAJ Z TRIPOWNIĄ</div><h2>Więcej niż dzisiejsza selekcja</h2></div></div>
        <div className="hub-grid">
          <Link href="/kierunki"><strong>🌍 Kierunki</strong><span>Malta, Grecja, Włochy, Hiszpania i dziesiątki inspiracji.</span></Link>
          <Link href="/city-break"><strong>🏙 City break</strong><span>Krótkie wyjazdy, gotowe pomysły i aktualne okazje.</span></Link>
          <Link href="/wakacje"><strong>🏖 Wakacje</strong><span>Gotowe pakiety i dodatkowe narzędzia do samodzielnego planowania.</span></Link><Link href="/last-minute"><strong>⚡ Last minute</strong><span>Szybkie wyjazdy i szersze wyszukiwanie.</span></Link>
          <Link href="/podroze-po-przezycia"><strong>✨ Przeżycia</strong><span>Zjawiska, sezonowość i podróże planowane pod właściwy moment.</span></Link>
          <Link href="/dalekie-podroze"><strong>🌏 Dalekie podróże</strong><span>Wietnam, Pekin, Nowy Jork, Japonia, Tajlandia i dalsze wyprawy.</span></Link>
          <Link href="/magazyn-podrozniczy"><strong>📰 Magazyn podróżniczy</strong><span>Formalności, lotniska, bagaż i praktyczne wskazówki.</span></Link>
          <Link href="/parkingi"><strong>🚗 Parkingi</strong><span>Najpierw wybierz lotnisko, potem przejdź do rezerwacji.</span></Link>
          <Link href="/atrakcje"><strong>🎟 Atrakcje</strong><span>Co robić na miejscu i gdzie kupować bilety.</span></Link>
        </div>
      </section>

      <section className="section shell score-section visual-chapter chapter-score" id="score">
        <div className="score-copy">
          <div className="kicker">WYNIKI TRIPOWNIA.PL</div>
          <h2>Cena to dopiero początek.</h2>
          <p>Oceniamy wyjazd całościowo: cenę, pogodę, hotel, termin i lot. Dzięki temu od razu wiesz, czy oferta jest naprawdę dobra.</p>
        </div>
        <div className="score-box">
          <div className="bigscore">9,6<span>/10</span></div>
          {[['Cena','10/10'],['Pogoda','8/10'],['Hotel','9/10'],['Termin','10/10'],['Lot','9/10']].map(([a,b]) => <div className="score-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}
          <div className="verdict">🔥 BIERZEMY</div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}