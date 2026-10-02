"use client";

import { isPromotableOffer } from "@/lib/offerValuePolicy";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, BriefcaseBusiness, Check, Flame, MapPin, Plane, Search, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import { offers, isOfferExpired, type Offer } from "@/lib/offers";
import { partners } from "@/lib/partners";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

const airports = [
  ["Warszawa", "Chopin + Modlin", "/z-warszawy"],
  ["Kraków", "KRK", "/z-krakowa"],
  ["Katowice", "KTW", "/z-katowic"],
  ["Gdańsk", "GDN", "/z-gdanska"],
  ["Poznań", "POZ", "/z-poznania"],
  ["Wrocław", "WRO", "/z-wroclawia"],
] as const;

const flightShortcuts = [
  ["🇮🇹", "Rzym", "Włochy"], ["🇮🇹", "Mediolan", "Włochy"], ["🇪🇸", "Barcelona", "Hiszpania"],
  ["🇵🇹", "Porto", "Portugalia"], ["🇲🇹", "Malta", "Malta"], ["🇬🇧", "Londyn", "Wielka Brytania"],
] as const;

type FlightGem = { city:string; country:string; flag:string; price:number; currency?:string; bookingUrl:string; departureDate:string; returnDate:string; discountPct?:number; from?:string };

function publicationKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone:"Europe/Warsaw", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
}

function cleanOffers(rows: Offer[]) {
  const seen = new Set<string>();
  return rows
    .filter(o => isPromotableOffer(o) && o?.id && o.price > 0 && o.affiliateUrl && !isOfferExpired(o) && isTravelDestinationAllowed(o.city, o.country))
    .sort((a,b) => a.price - b.price || b.score - a.score)
    .filter(o => { const key = `${o.city.toLowerCase()}|${o.country.toLowerCase()}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

function kiwiSearch(city:string, country:string) {
  const target = `${city}-${country}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const url = new URL("https://www.kiwi.com/pl/");
  url.searchParams.set("origin", "polska"); url.searchParams.set("destination", target); url.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(url.toString());
}

function OfferRail({ title, description, items, href="/okazje" }:{ title:string; description:string; items:Offer[]; href?:string }) {
  const railRef = useRef<HTMLDivElement>(null);
  if (!items.length) return null;
  const move = (direction:-1|1) => railRef.current?.scrollBy({ left: direction * 720, behavior:"smooth" });
  return <section className="offer-stream-row">
    <div className="offer-stream-head"><div><h3>{title}</h3><p>{description}</p></div><Link className="offer-stream-more-link" href={href}>Zobacz więcej <ArrowRight size={15}/></Link></div>
    <div className="offer-stream-rail-wrap">
      <div className="offer-stream-controls"><button type="button" onClick={()=>move(-1)} aria-label="Poprzednie"><ArrowLeft size={18}/></button><button type="button" onClick={()=>move(1)} aria-label="Następne"><ArrowRight size={18}/></button></div>
      <div className="offer-stream-rail" ref={railRef}>{items.map(o=><div className="offer-stream-item" key={`${title}-${o.id}`}><OfferCard offer={o}/></div>)}</div>
    </div>
  </section>;
}

export default function HomePageV2() {
  const [liveOffers, setLiveOffers] = useState<Offer[]>([]);
  const [feedStatus, setFeedStatus] = useState<"loading"|"live"|"fallback">("loading");
  const [flightGem, setFlightGem] = useState<FlightGem|null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/today-offers?key=${encodeURIComponent(publicationKey())}`, { cache:"no-store", signal:controller.signal })
      .then(async r => { const d=await r.json(); const rows=Array.isArray(d?.offers)?d.offers as Offer[]:[]; if(!r.ok||d?.ok===false||!rows.length) throw new Error(); setLiveOffers(rows.slice(0,60)); setFeedStatus("live"); })
      .catch(() => { if(!controller.signal.aborted){ setLiveOffers(offers); setFeedStatus("fallback"); } });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/daily-flight-gem", { cache:"no-store", signal:controller.signal }).then(r=>r.ok?r.json():null).then(d=>setFlightGem(d?.gem||null)).catch(()=>setFlightGem(null));
    return () => controller.abort();
  }, []);

  const pool = useMemo(() => cleanOffers(liveOffers.length ? liveOffers : offers), [liveOffers]);
  const daily = pool.slice(0,8);
  const used = new Set(daily.map(o=>o.id));
  const weekends = pool.filter(o=>o.nights>=2 && o.nights<=4 && !used.has(o.id)).slice(0,8);

  return <main>
    <SiteHeader/>

    <section className="section shell" style={{paddingTop:44,paddingBottom:34}}>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.25fr) minmax(320px,.75fr)",gap:34,alignItems:"center"}} className="homepage-v2-hero">
        <div>
          <div className="kicker">🔥 OKAZJE + DARMOWY PLANNER</div>
          <h1 style={{fontSize:"clamp(44px,5.8vw,76px)",lineHeight:.98,letterSpacing:"-.055em",margin:"16px 0"}}>Znajdź okazję.<br/><span style={{color:"#f47721"}}>Tripownia ogarnie resztę.</span></h1>
          <p style={{fontSize:18,lineHeight:1.6,maxWidth:720,color:"#61708d"}}>Tanie loty, wakacje i city breaki z Polski. Znajdź wyjazd, oceń go, zapisz i ułóż całą podróż w jednym miejscu.</p>
          <div className="premium-action-row" style={{marginTop:24}}><a className="premium-action-main" href="#dzisiaj">Zobacz dzisiejsze okazje <ArrowRight size={17}/></a><Link className="premium-action-secondary" href="/dodaj-podroz">Ułóż moją podróż <Sparkles size={17}/></Link></div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:18,fontSize:13,fontWeight:800,color:"#6b7890"}}><span>✓ realne oferty</span><span>✓ Deal Score</span><span>✓ planner za 0 zł</span></div>
        </div>
        <div className="dream-free-plan-board" style={{margin:0}}>
          <div className="dream-free-plan-top"><div><small>JAK CHCESZ ZACZĄĆ?</small><strong>Jedna Tripownia, trzy proste ścieżki</strong></div></div>
          <div className="dream-free-plan-items">
            <Link href="/okazje"><b><Flame size={18}/></b><span><strong>Chcę gotowy wyjazd</strong><small>Konkretny termin i cena.</small></span></Link>
            <a href="#wyszukiwarka"><b><Search size={18}/></b><span><strong>Złożę go po swojemu</strong><small>Skąd, dokąd, kiedy i za ile.</small></span></a>
            <Link href="/dodaj-podroz?mode=owned"><b><BriefcaseBusiness size={18}/></b><span><strong>Już coś kupiłam/em</strong><small>Planner pomoże domknąć resztę.</small></span></Link>
          </div>
        </div>
      </div>
    </section>

    <section className="section shell homepage-curated-trips" id="dzisiaj">
      <div className="section-heading"><div><div className="kicker">DZISIAJ NA TRIPOWNI 🔥</div><h2>Najciekawsze oferty z aktualnej puli.</h2><p>Jedna oferta pojawia się tutaj tylko raz. Bez tych samych kierunków w pięciu kolejnych sekcjach.</p></div><Link className="section-premium-link" href="/okazje">Wszystkie okazje <ArrowRight size={16}/></Link></div>
      <div style={{margin:"-6px 0 16px",fontSize:13,fontWeight:800,color:"#68758d"}}>{feedStatus==="live"?"● LIVE — aktualny feed":feedStatus==="loading"?"Pobieramy aktualne oferty…":"Ostatnia bezpieczna pula"} · {daily.length} różnych kierunków</div>
      <OfferRail title="Oferty warte sprawdzenia teraz" description="Aktualna pula, różne kierunki i linki prowadzące do partnerów Tripowni." items={daily}/>
    </section>

    <section className="section shell dream-marketplace">
      <div className="dream-marketplace-head"><div><div className="kicker">TANIE LOTY DZISIAJ ✈️</div><h2>Najpierw lot.<br/><span>Potem Tripownia składa z niego wyjazd.</span></h2><p>Nie pokazujemy wymyślonych cen. Jeśli automat wykryje mocny lot dnia, pokazujemy go z ceną; w pozostałych przypadkach kierujemy do aktualnego wyszukiwania.</p></div><Link className="dream-marketplace-all" href="/tanie-loty">Zobacz tanie loty <ArrowRight size={17}/></Link></div>
      <div className="dream-marketplace-grid">
        {flightGem ? <a className="dream-service-card dream-service-main" href={flightGem.bookingUrl} target="_blank" rel="sponsored noopener noreferrer"><div className="dream-service-icon">{flightGem.flag}</div><strong>{flightGem.city} — od {Math.round(flightGem.price)} {flightGem.currency||"PLN"}</strong><span>{flightGem.from||"Polska"} · {flightGem.departureDate}–{flightGem.returnDate}{flightGem.discountPct?` · ok. ${flightGem.discountPct}% poniżej mediany`:""}</span><em>Sprawdź lot →</em></a> : flightShortcuts.map(([flag,city,country])=><a className="dream-service-card" href={kiwiSearch(city,country)} target="_blank" rel="sponsored noopener noreferrer" key={city}><div className="dream-service-icon">{flag}</div><strong>{city}</strong><span>Sprawdź aktualną cenę z Polski</span><em>Szukaj lotu →</em></a>)}
      </div>
    </section>

    <section className="section shell homepage-curated-trips">
      <div className="section-heading"><div><div className="kicker">WEEKEND BEZ URLOPU ⚡</div><h2>Krótki reset bez oddawania połowy urlopu.</h2><p>2–4 noce i sensowny czas na miejscu. To ma być wyjazd, nie dwa dni na lotnisku.</p></div><Link className="section-premium-link" href="/weekend-bez-urlopu">Wszystkie weekendy <ArrowRight size={16}/></Link></div>
      {weekends.length ? <OfferRail title="Krótkie wyjazdy" description="Różne kierunki, bez duplikowania głównej puli." items={weekends} href="/weekend-bez-urlopu"/> : <div className="facebook-growth-strip"><div><small>SZUKAMY KOLEJNYCH TERMINÓW</small><strong>Nie podstawiamy starej ceny tylko po to, żeby coś pokazać.</strong><span>Ustaw alert albo własne daty w wyszukiwarce.</span></div><Link href="/alerty">Ustaw alert →</Link></div>}
    </section>

    <section className="section shell homepage-trip-types">
      <div className="section-heading"><div><div className="kicker">Z TWOJEGO LOTNISKA 📍</div><h2>Najpierw wybierz skąd lecisz.</h2><p>Osobne strony z polskich lotnisk skracają drogę do oferty i wspierają SEO Tripowni.</p></div></div>
      <div className="homepage-trip-types-grid">{airports.map(([title,note,href])=><Link className="homepage-trip-type-card" href={href} key={href}><span><MapPin size={20}/></span><div><strong>{title}</strong><small>{note}</small></div><ArrowRight size={17}/></Link>)}</div>
    </section>

    <section className="section shell" id="wyszukiwarka">
      <div className="section-heading"><div><div className="kicker">ZNAJDŹ PO SWOJEMU</div><h2>Masz konkretny pomysł? Ustaw kierunek, termin i budżet.</h2><p>Rozbudowana wyszukiwarka zostaje, ale nie blokuje już pierwszego ekranu.</p></div></div>
      <SearchHub embedded destinationQuickPicks={["Rzym","Barcelona","Malta","Porto","Marrakesz","Gdziekolwiek"]}/>
    </section>

    <section className="section shell dream-personalization">
      <div><small>TRIPOWNIA DEAL SCORE + ALERTY</small><h2>Nie tylko „tanie”.<br/>Ma być warte wyjazdu.</h2><p>Deal Score ocenia ofertę, a alert pozwala wrócić dopiero wtedy, gdy pojawi się odpowiednia cena lub kierunek.</p></div>
      <div className="dream-personalization-chips"><span>⭐ Deal Score</span><span>💰 cena</span><span>🗓️ termin</span><span>🧳 pakiet</span><span>🔗 jakość linku</span></div>
      <div className="dream-personalization-actions"><Link href="/alerty">Ustaw alert <Bell size={17}/></Link><Link href="/okazje">Zobacz ocenione oferty</Link></div>
    </section>

    <section className="section shell dream-free-plan">
      <div className="dream-free-plan-copy"><div className="kicker">TU ZACZYNA SIĘ PRZEWAGA TRIPOWNI</div><h2>Znajdź okazję.<br/><span>Potem ogarnij cały wyjazd.</span></h2><p>Lot, hotel, transfer, atrakcje, eSIM, parking, plan dnia, dokumenty i checklista — jedna podróż zamiast dziesięciu zakładek.</p><div className="dream-free-plan-actions"><Link href="/dodaj-podroz">Ułóż mój wyjazd — 0 zł <ArrowRight size={18}/></Link><Link href="/planer-podrozy">Jak działa planner</Link></div></div>
      <div className="dream-free-plan-board"><div className="dream-free-plan-top"><div><small>TWOJA TRIPOWNIA</small><strong>Cała podróż w jednym miejscu</strong></div></div><div className="dream-free-plan-items">{["Lot i hotel","Transfer","Atrakcje","eSIM i parking","Plan dnia","Dokumenty i checklista"].map(x=><div key={x}><b><Check size={17}/></b><span><strong>{x}</strong><small>wracasz do tego, kiedy potrzebujesz</small></span></div>)}</div><Link className="dream-free-plan-board-cta" href="/dodaj-podroz">Dodaj swoją podróż <ArrowRight size={16}/></Link></div>
    </section>

    <SiteFooter/>
    <style jsx global>{`@media(max-width:900px){.homepage-v2-hero{grid-template-columns:1fr!important}}`}</style>
  </main>;
}
