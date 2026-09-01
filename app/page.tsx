"use client";

import Image from "next/image";
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
      <h1>Najlepsze okazje podróżnicze<br/><span>w jednym miejscu.</span></h1>
      <p>Codziennie wybieramy najciekawsze loty, city breaki i wakacje. Ty wybierasz ofertę, a rezerwujesz bezpośrednio u sprawdzonego partnera.</p>
      <div className="searchbar hero-searchbar">
        <label><small>Skąd?</small><select value={heroAirport} onChange={e=>setHeroAirport(e.target.value)}><option value="all">Wszystkie lotniska</option>{airportOptions.map(a=><option key={a.code} value={a.code}>{a.label}</option>)}</select></label>
        <label><small>Dokąd?</small><select value={heroDestination} onChange={e=>setHeroDestination(e.target.value)}><option value="all">Gdziekolwiek</option>{destinationOptions.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
        <label><small>Na ile?</small><select value={heroDuration} onChange={e=>setHeroDuration(e.target.value)}><option value="all">Dowolnie</option><option value="short">2–4 noce</option><option value="week">5–8 nocy</option><option value="long">9+ nocy</option></select></label>
        <button type="button" onClick={showTrips}><Search size={18}/> Pokaż wyniki</button>
      </div>
      <div className="trustline">Bez setek przypadkowych wyników. Tylko wybrane przez Tripownię propozycje.</div></div>
      <div className="hero-brand-card"><Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={520} height={420} priority /><div className="hero-brand-tag">Podróże, które warto brać.</div></div>
    </div></section>

    <section className="section shell" id="okazje"><div className="section-heading"><div><div className="kicker">DZISIEJSZA SELEKCJA</div><h2>Dziś bralibyśmy te</h2><p>Nowa selekcja codziennie o 12:00. Pula pozostaje stała do kolejnej publikacji; cena i dostępność są potwierdzane u partnera.</p></div><Link href="/okazje">Zobacz wszystkie <ArrowRight size={16}/></Link></div><div className="cards-grid">{todaysOffers.map(o => <OfferCard offer={o} key={o.id}/>)}</div></section>

    <SearchHub
      initialAirports={heroAirport === "all" ? [] : [heroAirport]}
      initialDestinations={heroDestination === "all" ? [] : [heroDestination]}
      initialDuration={heroDuration}
      searchRequest={searchRequest}
    />

    <section className="budget-wrap" id="budzet"><div className="shell budget-grid"><div><div className="kicker light">WYNIKI TRIPOWNIA.PL</div><h2>Mam {budget} zł.<br/>Gdzie mogę polecieć?</h2><p>Ustaw kwotę, a Tripownia pokaże tylko wyjazdy, które mieszczą się w Twoim budżecie.</p><input type="range" min="500" max="5000" step="100" value={budget} onChange={e=>setBudget(Number(e.target.value))}/><div className="range-labels"><span>500 zł</span><strong>{budget} zł</strong><span>5000 zł</span></div></div>
      <div className="surprise-card"><Sparkles size={30}/><h3>Nie wiesz gdzie?</h3><p>Daj nam budżet i daj się zaskoczyć.</p><button onClick={pickSurprise}><Dice5 size={18}/> Zaskocz mnie</button>{surprise && <Link className="surprise-result" href={`/oferta/${surprise.id}`}>{surprise.flag} <strong>{surprise.city}</strong><span>{surprise.price} zł/os. · {surprise.score}/10 →</span></Link>}</div></div></section>


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
