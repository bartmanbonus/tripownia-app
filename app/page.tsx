"use client";

import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Flame, Search, Sparkles, Sun, WalletCards, PlaneTakeoff, Palmtree, Building2, Dice5 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import TodayResults from "@/components/TodayResults";
import { offers } from "@/lib/offers";

const categories = [
  { id: "cieplo", label: "Chcę słońca", icon: Sun }, { id: "tanio", label: "Polecieć tanio", icon: WalletCards },
  { id: "city", label: "City break", icon: Building2 }, { id: "plaza", label: "Tydzień na plaży", icon: Palmtree },
  { id: "weekend", label: "Weekend", icon: PlaneTakeoff },
];

export default function Home() {
  const [category, setCategory] = useState<string | null>(null);
  const [budget, setBudget] = useState(2500);
  const [surprise, setSurprise] = useState<(typeof offers)[number] | null>(null);
  const [favorites, setFavorites] = useState(0);
  const filtered = useMemo(() => offers.filter(o => (!category || o.category.includes(category)) && o.price <= budget), [category, budget]);

  useEffect(() => {
    const update = () => setFavorites((JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[]).length);
    update(); window.addEventListener("tripownia-favorites-updated", update); return () => window.removeEventListener("tripownia-favorites-updated", update);
  }, []);
  function pickSurprise() { const pool = offers.filter(o => o.price <= budget); setSurprise(pool[Math.floor(Math.random() * pool.length)] ?? offers[0]); }
  function showTrips() { document.getElementById("wyszukiwarka")?.scrollIntoView({ behavior: "smooth" }); }

  return <main>
    <SiteHeader />
<section className="hero"><div className="shell hero-inner">
      <div className="hero-copy"><div className="pill"><Flame size={16}/> Codziennie nowe selekcje</div>
      <h1>Nie szukaj godzinami.<br/><span>My szukamy. Ty lecisz.</span></h1>
      <p>Wyniki Tripownia.pl pokazują tylko te podróże, które naprawdę mają sens: dobra cena, sensowny lot, dobry termin i kierunek wart wyjazdu.</p>
      <div className="searchbar"><div><small>Skąd?</small><strong>Wszystkie lotniska</strong></div><div><small>Dokąd?</small><strong>Gdziekolwiek</strong></div><div><small>Na ile?</small><strong>Dowolnie</strong></div><button onClick={showTrips}><Search size={18}/> Ustaw filtry</button></div>
      <div className="trustline">Bez miliona wyników. Tylko to, co sami byśmy rozważyli.</div></div>
      <div className="hero-brand-card"><Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={520} height={420} priority /><div className="hero-brand-tag">Podróże, które warto brać.</div></div>
    </div></section>

    <SearchHub />
    <TodayResults />

    <section className="section shell" id="okazje"><div className="section-heading"><div><div className="kicker">WYNIKI TRIPOWNIA.PL</div><h2>Dziś bralibyśmy te</h2></div><Link href="/okazje">Zobacz wszystkie <ArrowRight size={16}/></Link></div><div className="cards-grid">{offers.slice(0,3).map(o => <OfferCard offer={o} key={o.id}/>)}</div></section>

    <section className="section shell" id="inspiracje"><div className="section-heading"><div><div className="kicker">WYNIKI TRIPOWNIA.PL</div><h2>Na jaki wyjazd masz dziś ochotę?</h2></div></div>
      <div className="category-grid">{categories.map(c => { const Icon=c.icon; return <button key={c.id} className={`category ${category===c.id?"active":""}`} onClick={()=>setCategory(category===c.id?null:c.id)}><Icon size={22}/><span>{c.label}</span></button> })}</div>
      <div className="results-info">{filtered.length ? `Znaleźliśmy ${filtered.length} propozycje w tym budżecie.` : "Brak ofert dla tych ustawień — zwiększ budżet albo wybierz inną kategorię."}</div>
      <div className="cards-grid filtered-grid">{filtered.map(o=><OfferCard offer={o} key={o.id}/>)}</div>
    </section>

    <section className="budget-wrap" id="budzet"><div className="shell budget-grid"><div><div className="kicker light">WYNIKI TRIPOWNIA.PL</div><h2>Mam {budget} zł.<br/>Gdzie mogę polecieć?</h2><p>Ustaw kwotę, a Tripownia pokaże tylko wyjazdy, które mieszczą się w Twoim budżecie.</p><input type="range" min="500" max="5000" step="100" value={budget} onChange={e=>setBudget(Number(e.target.value))}/><div className="range-labels"><span>500 zł</span><strong>{budget} zł</strong><span>5000 zł</span></div></div>
      <div className="surprise-card"><Sparkles size={30}/><h3>Nie wiesz gdzie?</h3><p>Daj nam budżet i daj się zaskoczyć.</p><button onClick={pickSurprise}><Dice5 size={18}/> Zaskocz mnie</button>{surprise && <Link className="surprise-result" href={`/oferta/${surprise.id}`}>{surprise.flag} <strong>{surprise.city}</strong><span>{surprise.price} zł/os. · {surprise.score}/10 →</span></Link>}</div></div></section>


    <section className="section shell" id="planuj"><div className="section-heading"><div><div className="kicker">PLANUJ Z WYPRZEDZENIEM</div><h2>Nie tylko wyjazdy na teraz</h2></div><Link href="/planowanie-podrozy">Zobacz planer <ArrowRight size={16}/></Link></div><div className="plan-ahead-grid">
      <Link className="plan-ahead-card" href="/planowanie-podrozy"><small>PRZEŁOM ROKU</small><strong>🎆 Sylwester 2026/27</strong><span>Miasta, słońce i dalsze kierunki.</span></Link>
      <Link className="plan-ahead-card" href="/planowanie-podrozy"><small>ZIMA</small><strong>❄️ Ferie 2027</strong><span>Rodzinne wyjazdy, narty albo ciepło.</span></Link>
      <Link className="plan-ahead-card" href="/planowanie-podrozy"><small>WIOSNA</small><strong>🌷 Majówka 2027</strong><span>Krótki urlop wykorzystany maksymalnie.</span></Link>
      <Link className="plan-ahead-card" href="/planowanie-podrozy"><small>FIRST MINUTE</small><strong>☀️ Lato 2027</strong><span>Wakacje planowane kilka miesięcy wcześniej.</span></Link>
    </div></section>

    <section className="section shell" id="odkrywaj"><div className="section-heading"><div><div className="kicker">NIE TYLKO KLASYKI</div><h2>Masz już za sobą Barcelonę i Rzym?</h2></div></div><div className="discovery-grid">
      <Link className="discovery-card" href="/maroko"><small>BLISKA EGZOTYKA</small><strong>🇲🇦 Maroko</strong><span>Kolor, jedzenie, pustynia i zupełnie inny klimat bez lotu na drugi koniec świata.</span></Link>
      <Link className="discovery-card" href="/riwiera-albanska"><small>MNIEJ OCZYWISTE</small><strong>🇦🇱 Albania</strong><span>Bałkany, morze i kierunek, który wciąż można odkrywać poza utartym szlakiem.</span></Link>
      <Link className="discovery-card" href="/madera"><small>AKTYWNIE</small><strong>🇵🇹 Madera</strong><span>Levada, klify i całoroczna zieleń zamiast klasycznego leżaka.</span></Link>
      <Link className="discovery-card" href="/dubaj"><small>DALEJ</small><strong>🇦🇪 Dubaj i ZEA</strong><span>Słońce zimą i dobra baza do pierwszej dalszej podróży.</span></Link>
    </div></section>

    <section className="section shell content-hubs"><div className="section-heading"><div><div className="kicker">WYNIKI TRIPOWNIA.PL</div><h2>Nie tylko oferty. Zostań z nami dłużej.</h2></div></div><div className="hub-grid"><Link href="/kierunki"><strong>🌍 Kierunki</strong><span>Malta, Grecja, Włochy, Hiszpania i dziesiątki inspiracji.</span></Link><Link href="/city-break-2"><strong>🏙 City break</strong><span>Krótkie wyjazdy, gotowe pomysły i aktualne okazje.</span></Link><Link href="/last-minute"><strong>🏖 Wakacje i Last Minute</strong><span>All Inclusive, słońce i wyjazdy z polskich lotnisk.</span></Link><Link href="/poradniki"><strong>🧭 Poradniki</strong><span>Formalności, lotniska, bagaż i praktyczne wskazówki.</span></Link><Link href="/parkingi"><strong>🚗 Parkingi</strong><span>Najpierw wybierz lotnisko, potem przejdź do rezerwacji.</span></Link><Link href="/atrakcje"><strong>🎟 Atrakcje</strong><span>Co robić na miejscu i gdzie kupować bilety.</span></Link></div></section>
    <section className="section shell score-section" id="score"><div className="score-copy"><div className="kicker">WYNIKI TRIPOWNIA.PL</div><h2>Cena to dopiero początek.</h2><p>Oceniamy wyjazd całościowo: cenę, pogodę, hotel, termin i lot. Dzięki temu od razu wiesz, czy oferta jest naprawdę dobra.</p></div><div className="score-box"><div className="bigscore">9,6<span>/10</span></div>{[['Cena','10/10'],['Pogoda','8/10'],['Hotel','9/10'],['Termin','10/10'],['Lot','9/10']].map(([a,b])=><div className="score-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}<div className="verdict">🔥 BIERZEMY</div></div></section>
    <SiteFooter />
</main>;
}
