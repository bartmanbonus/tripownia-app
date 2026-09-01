"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Flame, Search, Sparkles, Dice5 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import { airportOptions, destinationOptions, getDailyOffers, offers } from "@/lib/offers";
import { partners } from "@/lib/partners";


export default function Home() {
  const todaysOffers = useMemo(() => getDailyOffers(offers, 8), []);
  const [budget, setBudget] = useState(2500);
  const [surprise, setSurprise] = useState<(typeof offers)[number] | null>(null);
  const [heroAirport, setHeroAirport] = useState("all");
  const [heroDestination, setHeroDestination] = useState("all");
  const [heroDuration, setHeroDuration] = useState("all");
  const [searchRequest, setSearchRequest] = useState(0);

  function pickSurprise() { const pool = offers.filter(o => o.price <= budget); setSurprise(pool[Math.floor(Math.random() * pool.length)] ?? offers[0]); }
  function showTrips() {
    setSearchRequest(v => v + 1);
    setTimeout(() => document.getElementById("wyszukiwarka")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  return <main>
    <SiteHeader />
<section className="hero"><div className="shell hero-inner">
      <div className="hero-copy"><div className="pill"><Flame size={16}/> Codziennie wybrane okazje</div>
      <h1>Znajdź podróż, którą<br/><span>naprawdę warto zarezerwować.</span></h1>
      <p>Tripownia łączy nasze codzienne rekomendacje z wyszukiwaniem u sprawdzonych partnerów. Możesz zacząć od gotowej okazji albo wpisać własny kierunek i szukać szerzej.</p>
      <div className="searchbar hero-searchbar">
        <label><small>Skąd?</small><select value={heroAirport} onChange={e=>setHeroAirport(e.target.value)}><option value="all">Wszystkie lotniska</option>{airportOptions.map(a=><option key={a.code} value={a.code}>{a.label}</option>)}</select></label>
        <label><small>Dokąd?</small><select value={heroDestination} onChange={e=>setHeroDestination(e.target.value)}><option value="all">Gdziekolwiek</option>{destinationOptions.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
        <label><small>Na ile?</small><select value={heroDuration} onChange={e=>setHeroDuration(e.target.value)}><option value="all">Dowolnie</option><option value="short">2–4 noce</option><option value="week">5–8 nocy</option><option value="long">9+ nocy</option></select></label>
        <button type="button" onClick={showTrips}><Search size={18}/> Pokaż wyniki</button>
      </div>
      <div className="trustline">Najpierw nasze wybrane okazje. Gdy ich brakuje — możesz szukać dalej u sprawdzonych partnerów.</div></div>
      <aside className="hero-daily-panel">
        <div className="hero-daily-icon"><Sparkles size={22}/></div>
        <div className="kicker">DZISIAJ W TRIPOWNI</div>
        <h2>{todaysOffers.length} wybranych okazji</h2>
        <p>Nie pokazujemy setek przypadkowych wyników. Codziennie wybieramy propozycje, które naprawdę warto sprawdzić.</p>
        <div className="hero-daily-time"><Flame size={17}/><div><strong>Nowa selekcja codziennie o 12:00</strong><span>Po południu zajrzyj po świeże ceny i nowe kierunki.</span></div></div>
        <ul><li>Loty, city breaki i wakacje</li><li>Ocena ceny, terminu i pogody</li><li>Rezerwacja bezpośrednio u partnera</li></ul>
        <a href="#dzisiejsze-okazje" className="hero-daily-cta">Zobacz dzisiejsze okazje <ArrowRight size={17}/></a>
      </aside>
    </div></section>

    <section className="section shell daily-offers-section" id="dzisiejsze-okazje">
      <div className="section-heading daily-offers-heading"><div><div className="kicker">DZISIAJ W TRIPOWNI</div><h2>Okazje wybrane na dziś</h2><p>Aktualna selekcja jest widoczna od razu po wejściu. <strong>Codziennie o 12:00 dokładamy nowe propozycje.</strong></p></div><Link href="/okazje">Zobacz wszystkie okazje <ArrowRight size={16}/></Link></div>
      <div className="daily-offers-grid">{todaysOffers.map(offer=><OfferCard key={offer.id} offer={offer}/>)}</div>
    </section>

    <SearchHub
      initialAirports={heroAirport === "all" ? [] : [heroAirport]}
      initialDestinations={heroDestination === "all" ? [] : [heroDestination]}
      initialDuration={heroDuration}
      searchRequest={searchRequest}
    />

    <section className="section shell" id="odkrywaj"><div className="section-heading"><div><div className="kicker">NIE TYLKO KLASYKI</div><h2>Masz już za sobą Barcelonę i Rzym?</h2></div></div><div className="discovery-grid">
      <Link className="discovery-card" href="/maroko"><small>BLISKA EGZOTYKA</small><strong>🇲🇦 Maroko</strong><span>Kolor, jedzenie, pustynia i zupełnie inny klimat bez lotu na drugi koniec świata.</span></Link>
      <Link className="discovery-card" href="/riwiera-albanska"><small>MNIEJ OCZYWISTE</small><strong>🇦🇱 Albania</strong><span>Bałkany, morze i kierunek, który wciąż można odkrywać poza utartym szlakiem.</span></Link>
      <Link className="discovery-card" href="/madera"><small>AKTYWNIE</small><strong>🇵🇹 Madera</strong><span>Levada, klify i całoroczna zieleń zamiast klasycznego leżaka.</span></Link>
      <Link className="discovery-card" href="/dubaj"><small>DALEJ</small><strong>🇦🇪 Dubaj i ZEA</strong><span>Słońce zimą i dobra baza do pierwszej dalszej podróży.</span></Link>
    </div></section>

    <section className="section shell experience-section" id="przezycia"><div className="section-heading"><div><div className="kicker">PODRÓŻE PO PRZEŻYCIA</div><h2>Nie wybieraj miejsca. Wybierz to, co chcesz przeżyć.</h2><p>Sezonowe zjawiska, natura i podróże, dla których naprawdę warto złapać właściwy moment.</p></div><Link href="/podroze-po-przezycia">Zobacz kalendarz przeżyć <ArrowRight size={16}/></Link></div><div className="discovery-grid"><Link className="discovery-card" href="/islandia-zorza-polarna"><small>WRZESIEŃ–MARZEC</small><strong>🌌 Zorza na Islandii</strong><span>Ciemne noce, wodospady, geotermia i polowanie na zorzę.</span></Link><Link className="discovery-card" href="/japonia-kwitnienie-wisni"><small>WIOSNA</small><strong>🌸 Kwitnienie wiśni w Japonii</strong><span>Wyjazd planowany pod sakurę, a nie tylko pod Tokio i Kioto.</span></Link><Link className="discovery-card" href="/norwegia-fiordy"><small>MAJ–WRZESIEŃ</small><strong>🏔️ Fiordy i białe noce</strong><span>Długie dni, trekking i spektakularne trasy widokowe.</span></Link><Link className="discovery-card" href="/nowa-zelandia-najlepszy-czas"><small>LISTOPAD–MARZEC</small><strong>🥾 Nowa Zelandia</strong><span>Road trip, góry i lato na południowej półkuli.</span></Link></div></section>

    <section className="section shell custom-trip"><div className="section-heading"><div><div className="kicker">WŁASNA PODRÓŻ</div><h2>Masz pomysł? Zbuduj wyjazd po swojemu.</h2><p>Wybierz kierunek, lotnisko, długość i budżet. Tripownia pomoże połączyć lot, nocleg i atrakcje zamiast wciskać gotowy pakiet.</p></div></div><div className="hub-grid"><a href="#wyszukiwarka"><strong>🧩 Zacznij od własnych parametrów</strong><span>Ustaw filtry i przeszukaj aktualną bazę Tripowni.</span></a><a href={partners.kiwi.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>✈️ Dobierz lot</strong><span>Sprawdź połączenia przez afiliacyjny link Kiwi.com.</span></a><a href={partners.booking.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>🏨 Dobierz nocleg</strong><span>Przejdź do Booking.com z identyfikatorem afiliacyjnym Tripowni.</span></a></div></section>

    <section className="section shell content-hubs"><div className="section-heading"><div><div className="kicker">ODKRYWAJ Z TRIPOWNIĄ</div><h2>Więcej niż dzisiejsza selekcja</h2></div></div><div className="hub-grid"><Link href="/kierunki"><strong>🌍 Kierunki</strong><span>Malta, Grecja, Włochy, Hiszpania i dziesiątki inspiracji.</span></Link><Link href="/city-break-2"><strong>🏙 City break</strong><span>Krótkie wyjazdy, gotowe pomysły i aktualne okazje.</span></Link><Link href="/last-minute"><strong>🏖 Wakacje i Last Minute</strong><span>All Inclusive, słońce i wyjazdy z polskich lotnisk.</span></Link><Link href="/poradniki"><strong>🧭 Poradniki</strong><span>Formalności, lotniska, bagaż i praktyczne wskazówki.</span></Link><Link href="/parkingi"><strong>🚗 Parkingi</strong><span>Najpierw wybierz lotnisko, potem przejdź do rezerwacji.</span></Link><Link href="/atrakcje"><strong>🎟 Atrakcje</strong><span>Co robić na miejscu i gdzie kupować bilety.</span></Link></div></section>
    <section className="section shell score-section" id="score"><div className="score-copy"><div className="kicker">WYNIKI TRIPOWNIA.PL</div><h2>Cena to dopiero początek.</h2><p>Oceniamy wyjazd całościowo: cenę, pogodę, hotel, termin i lot. Dzięki temu od razu wiesz, czy oferta jest naprawdę dobra.</p></div><div className="score-box"><div className="bigscore">9,6<span>/10</span></div>{[['Cena','10/10'],['Pogoda','8/10'],['Hotel','9/10'],['Termin','10/10'],['Lot','9/10']].map(([a,b])=><div className="score-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}<div className="verdict">🔥 BIERZEMY</div></div></section>
    <SiteFooter />
</main>;
}
