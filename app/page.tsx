"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Flame, Sparkles, Dice5 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import { offers, isOfferExpired, getDailyOffers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";



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

type TripOffer = (typeof offers)[number];

function offerForDisplay(offer: TripOffer): TripOffer {
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
  const current = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00+02:00`);
  if (Number(parts.hour) < 12) current.setDate(current.getDate() - 1);
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
  { href: "/dalekie-podroze#wietnam", flag: "🇻🇳", label: "AZJA", title: "Wietnam", text: "Hanoi, zatoka Ha Long, Hoi An i południe kraju — podróż, której szkoda zamykać w jednym mieście." },
  { href: "/dalekie-podroze#pekin", flag: "🇨🇳", label: "CHINY", title: "Pekin", text: "Wielki Mur, Zakazane Miasto i zupełnie inna skala city breaku niż w Europie." },
  { href: "/dalekie-podroze#nowy-jork", flag: "🇺🇸", label: "USA", title: "Nowy Jork", text: "Manhattan, Brooklyn i miasto, które spokojnie wypełnia tydzień bez szukania atrakcji na siłę." },
  { href: "/dalekie-podroze#japonia", flag: "🇯🇵", label: "JAPONIA", title: "Tokio + Kioto", text: "Nowoczesność, świątynie, jedzenie i kolej — najlepiej jako większa podróż, nie szybki weekend." },
  { href: "/dalekie-podroze#tajlandia", flag: "🇹🇭", label: "TAJLANDIA", title: "Bangkok + wyspy", text: "Miasto, street food i kilka dni nad morzem w jednej podróży." },
  { href: "/dalekie-podroze#bali", flag: "🇮🇩", label: "INDONEZJA", title: "Bali", text: "Świątynie, natura, ocean i wyjazd, który warto układać regionami zamiast wokół jednego hotelu." },
  { href: "/dalekie-podroze#singapur", flag: "🇸🇬", label: "SINGAPUR", title: "Singapur", text: "Azjatycka metropolia idealna także jako pierwszy lub ostatni etap dłuższej podróży." },
  { href: "/dalekie-podroze#kapsztad", flag: "🇿🇦", label: "RPA", title: "Kapsztad", text: "Ocean, góry, winnice i road trip — jeden z tych kierunków, dla których warto polecieć dalej." },
];

const experienceCards = [
  {
    href: "/podroze-po-przezycia#zorza",
    season: "WRZESIEŃ–MARZEC",
    title: "🌌 Zorza na Islandii",
    text: "Ciemne noce, geotermia i wyjazd planowany pod szansę zobaczenia zorzy.",
  },
  {
    href: "/podroze-po-przezycia#sakura",
    season: "MARZEC–KWIECIEŃ",
    title: "🌸 Sakura w Japonii",
    text: "Tokio i Kioto wtedy, gdy kwitnienie wiśni staje się głównym punktem podróży.",
  },
  {
    href: "/podroze-po-przezycia#fiordy",
    season: "MAJ–WRZESIEŃ",
    title: "🏔️ Fiordy i białe noce",
    text: "Długie dni, trekking, rejsy i spektakularne trasy widokowe po Norwegii.",
  },
  {
    href: "/podroze-po-przezycia#nowa-zelandia",
    season: "LISTOPAD–MARZEC",
    title: "🥾 Nowa Zelandia",
    text: "Road trip, góry i lato na południowej półkuli w najlepszym oknie na aktywny wyjazd.",
  },
  {
    href: "/podroze-po-przezycia#tulipany",
    season: "KWIECIEŃ–MAJ",
    title: "🌷 Tulipany w Holandii",
    text: "Krótki city break połączony z polami kwiatów i sezonem, który trwa tylko chwilę.",
  },
  {
    href: "/podroze-po-przezycia#safari",
    season: "CZERWIEC–PAŹDZIERNIK",
    title: "🦁 Safari w Kenii i Tanzanii",
    text: "Suchszy sezon, dzika przyroda i podróż, której termin ma ogromne znaczenie.",
  },
  {
    href: "/podroze-po-przezycia#jarmarki",
    season: "LISTOPAD–GRUDZIEŃ",
    title: "🎄 Jarmarki bożonarodzeniowe",
    text: "Wiedeń, Praga, Budapeszt i inne miasta wtedy, gdy sam klimat jest powodem wyjazdu.",
  },
  {
    href: "/podroze-po-przezycia#egzotyka",
    season: "ZIMA W POLSCE",
    title: "🌴 Egzotyka w porze suchej",
    text: "Tropiki dobrane nie tylko po cenie, ale także po sezonie, opadach i warunkach na miejscu.",
  },
];

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
  return <section className="offer-stream-row">
    <div className="offer-stream-head">
      <div><div className="kicker">{kicker}</div><h3>{title}</h3><p>{description}</p></div>
      <div className="offer-stream-controls"><button type="button" onClick={()=>move(-1)} aria-label={`Poprzednie: ${title}`}><ArrowLeft size={18}/></button><button type="button" onClick={()=>move(1)} aria-label={`Następne: ${title}`}><ArrowRight size={18}/></button></div>
    </div>
    <div className="offer-stream-rail" ref={railRef} tabIndex={0} onWheel={(e)=>{const rail=railRef.current;if(!rail)return;if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();rail.scrollBy({left:e.deltaY,behavior:"smooth"});}}}>{items.map(o=><div className="offer-stream-item" key={`${title}-${o.id}`}><OfferCard offer={o}/></div>)}</div>
  </section>;
}

export default function Home() {
  // V100: selekcja dzienna naprawdę przełącza się o 12:00 czasu polskiego.
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

  const todaysOffers = useMemo(() =>
    getDailyOffers(offers.filter(o => isTravelDestinationAllowed(o.city, o.country)), 12, new Date()).map(offerForDisplay),
    [dailyKey]
  );

  const previousOffers = useMemo(() =>
    getDailyOffers(offers.filter(o => isTravelDestinationAllowed(o.city, o.country)), 12, new Date(Date.now() - 86_400_000)),
    [dailyKey]
  );

  const newOffersCount = useMemo(() => {
    const previousIds = new Set(previousOffers.map(offer => offer.id));
    return todaysOffers.filter(offer => !previousIds.has(offer.id)).length;
  }, [todaysOffers, previousOffers]);

  const refreshStatus = useMemo(() => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
    }).formatToParts(now).reduce<Record<string,string>>((acc, part) => { acc[part.type] = part.value; return acc; }, {});
    const afterNoon = Number(parts.hour) >= 12;
    const [year, month, day] = dailyKey.split("-");
    return {
      last: `${day}.${month}.${year}, 12:00`,
      next: afterNoon ? "jutro o 12:00" : "dzisiaj o 12:00",
    };
  }, [dailyKey]);

  const themedRails = useMemo(() => {
    const key = dailyKey;
    const active: TripOffer[] = seededShuffle<TripOffer>(offers.filter(o => !isOfferExpired(o) && isTravelDestinationAllowed(o.city, o.country)).map(offerForDisplay), `tripownia-rails:${key}`);
    const pick = (match: (o: (typeof offers)[number]) => boolean, limit = 8) => active.filter(match).slice(0, limit);
    const fillRail = (primary: typeof active, minimum = 5) => {
      const result = [...primary];
      for (const offer of active) {
        if (result.length >= minimum) break;
        if (!result.some(item => item.id === offer.id)) result.push(offer);
      }
      return result;
    };
    const city = fillRail(pick(o => (o.category || []).some(c => /city|weekend|tanio/i.test(c))), 5);
    const sun = fillRail(pick(o => (o.category || []).some(c => /plaza|cieplo|allinclusive/i.test(c))), 5);
    const unusualNames = /Marrakesz|Pafos|Riwiera Albańska|Marsa Alam|Bodrum|Sycylia|Madera|Djerba|Hammamet|Rodos|Fuerteventura/i;
    const unusual = fillRail(pick(o => unusualNames.test(o.city)), 5);
    return { city, sun, unusual };
  }, [dailyKey]);
  const offersRailRef = useRef<HTMLDivElement>(null);
  const [budget, setBudget] = useState(2500);
  const [surprise, setSurprise] = useState<TripOffer | null>(null);

  const budgetCandidates = useMemo(() => {
    const wowBonus = (offer: TripOffer) => {
      const city = offer.city.toLowerCase();
      const country = offer.country.toLowerCase();

      // Im większy budżet, tym bardziej "Zaskocz mnie" ma premiować kierunki z efektem wow,
      // a nie tylko te najbliższe górnej granicy ceny.
      if (budget >= 2800) {
        if (/dubaj|madera/.test(city) || /zea/.test(country)) return 95;
        if (/marsa alam|teneryfa|fuerteventura|marrakesz/.test(city)) return 70;
      }
      if (budget >= 1900) {
        if (/marsa alam|teneryfa|fuerteventura/.test(city)) return 90;
        if (/marrakesz|djerba|hurghada/.test(city)) return 72;
        if (/bodrum|antaly/.test(city)) return 45;
        if (/riwiera albańska|alban/.test(city) || /alban/.test(country)) return 8;
      }
      if (budget >= 1200) {
        if (/marrakesz|djerba|pafos|lizbona/.test(city)) return 65;
        if (/barcelona|rzym|paryż/.test(city)) return 18;
      }
      if (budget < 1200) {
        if (/malta|porto|bergamo|alicante|praga|budapeszt/.test(city)) return 55;
      }
      return 0;
    };

    const candidates = offers
      .filter(o => !isOfferExpired(o))
      .filter(o => isTravelDestinationAllowed(o.city, o.country))
      .filter(o => o.price <= budget)
      .map(offerForDisplay)
      .sort((a, b) => {
        const aFit = a.price / Math.max(1, budget);
        const bFit = b.price / Math.max(1, budget);
        const aScore = Number(a.score || 0) * 12 + aFit * 24 + wowBonus(a);
        const bScore = Number(b.score || 0) * 12 + bFit * 24 + wowBonus(b);
        return bScore - aScore;
      });

    // Różne kraje = większe poczucie odkrywania, a nie pięć wariantów tego samego miejsca.
    const diversified: TripOffer[] = [];
    const countries = new Set<string>();
    for (const offer of candidates) {
      if (!countries.has(offer.country) || diversified.length >= 5) {
        diversified.push(offer);
        countries.add(offer.country);
      }
      if (diversified.length >= 8) break;
    }
    return diversified.length ? diversified : candidates.slice(0, 8);
  }, [budget]);



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

      <section className="hero hero-clean">
        <div className="shell hero-inner hero-inner-clean hero-inner-restored">
          <div className="hero-copy hero-copy-clean">
            <div className="pill"><Flame size={16}/> Codziennie wybrane okazje</div>
            <h1>Najlepsze okazje podróżnicze<br/><span>w jednym miejscu.</span></h1>
            <p>Wybieramy konkretne wyjazdy, ale możesz też samodzielnie przeszukać cały świat — od city breaku po Nową Zelandię.</p>
          </div>

          <aside className="hero-daily-panel hero-radar-panel" aria-label="Na radarze Tripowni dzisiaj">
            <div className="hero-daily-icon">✦</div>
            <div className="kicker">NA RADARZE DZISIAJ</div>
            <h2>Co warto kliknąć teraz?</h2>
            <p>Nie przypadkowe kierunki — trzy propozycje wyciągnięte z dzisiejszej selekcji.</p>
            <div className="hero-daily-stats">
              <div className="hero-daily-stat"><strong>{newOffersCount}</strong><span>faktycznie nowych okazji w tej puli</span></div>
              <div className="hero-daily-stat"><Clock3 size={17}/><div><strong>Ostatnia aktualizacja: {refreshStatus.last}</strong><span>Kolejna: {refreshStatus.next} czasu polskiego</span></div></div>
            </div>
            <div className="hero-radar-list">
              {todaysOffers.slice(0,3).map((offer, index) => (
                <Link href={`/oferta/${offer.id}`} className="hero-radar-offer" key={offer.id}>
                  <span>{offer.flag}</span>
                  <div><small>{index === 0 ? "🔥 NAJLEPSZY STRZAŁ" : index === 1 ? "✨ WARTO SPRAWDZIĆ" : "🌍 COŚ INNEGO"}</small><strong>{offer.city}</strong></div>
                  <b>od {offer.price.toLocaleString("pl-PL")} zł →</b>
                </Link>
              ))}
            </div>
            <Link className="hero-daily-cta" href="#okazje"><span>Zobacz dzisiejsze okazje</span><ArrowRight size={16}/></Link>
          </aside>
        </div>
      </section>

      <SearchHub />

      <section className="section shell visual-chapter chapter-daily" id="okazje">
        <div className="section-heading">
          <div>
            <div className="kicker">DZISIEJSZA SELEKCJA</div>
            <h2>Dziś bralibyśmy te</h2>
            <p>Nowa, mieszana selekcja publikowana codziennie o 12:00 czasu polskiego. Karty zmieniają się raz dziennie; aktualną cenę i dostępność potwierdza partner.</p>
          </div>
          <Link className="section-premium-link" href="/okazje">Zobacz wszystkie okazje <ArrowRight size={16}/></Link>
        </div>
        <div className="daily-carousel-wrap">
          <div className="daily-carousel-controls" aria-label="Sterowanie karuzelą ofert">
            <button type="button" onClick={() => moveOffersRail(-1)} aria-label="Poprzednie oferty"><ArrowLeft size={18}/></button>
            <button type="button" onClick={() => moveOffersRail(1)} aria-label="Następne oferty"><ArrowRight size={18}/></button>
          </div>
          <div className="daily-carousel" ref={offersRailRef}>
            {todaysOffers.map(o => <div className="daily-carousel-item" key={o.id}><OfferCard offer={o}/></div>)}
          </div>
        </div>
        <div className="premium-action-row">
          <Link className="premium-action-main" href="#wyszukiwarka">Wyszukaj po swojemu <ArrowRight size={17}/></Link>
          <Link className="premium-action-secondary" href="/okazje">Zobacz wszystkie okazje <ArrowRight size={17}/></Link>
        </div>
      </section>

      <section className="section shell streaming-discovery streaming-offers visual-chapter chapter-streaming" aria-label="Odkrywaj oferty Tripowni">
        <div className="section-heading"><div><div className="kicker">NETFLIX PODRÓŻY</div><h2>Przewijaj, aż coś kliknie.</h2><p>Nie jedna ściana ofert. Różne nastroje, różne budżety i konkretne kierunki — codziennie w innym układzie.</p></div></div>
        <OfferRail kicker="🔥 TREND / CITY BREAK" title="Weekend, który ratuje tydzień" description="Krótkie wypady, miasta i loty, które nie wymagają pół roku planowania." items={themedRails.city}/>
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
            <button onClick={pickSurprise}><Dice5 size={18}/> Zaskocz mnie</button>
            {!budgetCandidates.length && (
              <div className="surprise-result surprise-result-v2">
                <strong>W tym budżecie nie mamy dziś zweryfikowanej okazji.</strong>
                <em>Zwiększ budżet albo wróć do pełnej wyszukiwarki — nie podsuwamy przypadkowego kierunku tylko po to, żeby coś pokazać.</em>
              </div>
            )}
            {surprise && (
              <div className="surprise-result surprise-result-v2">
                <span className="surprise-flag">{surprise.flag}</span>
                <strong>{surprise.city}</strong>
                <em>{surprise.reason}</em>
                <span>Tripownia znalazła od {surprise.price.toLocaleString("pl-PL")} zł/os. · mieści się w budżecie {budget.toLocaleString("pl-PL")} zł.</span>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                  <Link href={`/oferta/${surprise.id}`} style={{fontWeight:800,textDecoration:"none"}}>Zobacz wyjazd →</Link>
                  <a href={buildKiwiFlightSearch(surprise.city, surprise.country)} target="_blank" rel="sponsored noopener noreferrer" style={{fontWeight:800}}>✈️ Loty na Kiwi →</a>
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

      <section className="section shell long-haul-home visual-chapter chapter-longhaul" id="dalekie-podroze">
        <div className="section-heading">
          <div>
            <div className="kicker">DALEJ NIŻ WEEKEND</div>
            <h2>Czasem warto polecieć trochę dalej.</h2>
            <p>Nie tylko Europa. Kierunki na większą podróż: Azja, USA, Afryka i miejsca, które naprawdę dają poczucie wyjazdu gdzieś dalej.</p>
          </div>
          <Link href="/dalekie-podroze">Zobacz dalekie podróże <ArrowRight size={16}/></Link>
        </div>
        <div className="long-haul-grid">
          {longHaulCards.map(card => (
            <Link className="long-haul-card" href={card.href} key={card.href}>
              <div className="long-haul-card-top"><span>{card.flag}</span><small>{card.label}</small></div>
              <strong>{card.title}</strong>
              <p>{card.text}</p>
              <b>Zobacz pomysł →</b>
            </Link>
          ))}
        </div>
      </section>

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
          {experienceCards.map(card => (
            <Link className="discovery-card" href={card.href} key={card.href}>
              <small>{card.season}</small>
              <strong>{card.title}</strong>
              <span>{card.text}</span>
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
          <a href="#wyszukiwarka"><strong>🧩 Zacznij od własnych parametrów</strong><span>Ustaw filtry i przeszukaj aktualną bazę Tripowni.</span></a>
          <a href={partners.kiwi.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>✈️ Dobierz lot</strong><span>Sprawdź połączenia przez afiliacyjny link Kiwi.com.</span></a>
          <a href={partners.booking.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>🏨 Dobierz nocleg</strong><span>Przejdź do Booking.com z identyfikatorem afiliacyjnym Tripowni.</span></a>
        </div>
      </section>

      <section className="section shell content-hubs visual-chapter chapter-content">
        <div className="section-heading"><div><div className="kicker">ODKRYWAJ Z TRIPOWNIĄ</div><h2>Więcej niż dzisiejsza selekcja</h2></div></div>
        <div className="hub-grid">
          <Link href="/kierunki"><strong>🌍 Kierunki</strong><span>Malta, Grecja, Włochy, Hiszpania i dziesiątki inspiracji.</span></Link>
          <Link href="/city-break"><strong>🏙 City break</strong><span>Krótkie wyjazdy, gotowe pomysły i aktualne okazje.</span></Link>
          <Link href="/wakacje"><strong>🏖 Wakacje</strong><span>Pełna oferta EXIM, Wakacje.pl, eSky, Kiwi i Booking.</span></Link><Link href="/last-minute"><strong>⚡ Last minute</strong><span>Szybkie wyjazdy i pełne bazy partnerów.</span></Link>
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
