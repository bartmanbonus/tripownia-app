"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Flame, Search, Sparkles, Sun, WalletCards, PlaneTakeoff, Palmtree, Building2, Dice5 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { offers } from "@/lib/offers";

const categories = [
  { id: "cieplo", label: "Chcę słońca", icon: Sun },
  { id: "tanio", label: "Polecieć tanio", icon: WalletCards },
  { id: "city", label: "City break", icon: Building2 },
  { id: "plaza", label: "Tydzień na plaży", icon: Palmtree },
  { id: "weekend", label: "Weekend", icon: PlaneTakeoff },
];

export default function Home() {
  const [category, setCategory] = useState<string | null>(null);
  const [budget, setBudget] = useState(1500);
  const [surprise, setSurprise] = useState<string | null>(null);

  const filtered = useMemo(() => offers.filter(o => (!category || o.category.includes(category)) && o.price <= budget), [category, budget]);

  function pickSurprise() {
    const pool = offers.filter(o => o.price <= budget);
    const chosen = pool[Math.floor(Math.random() * pool.length)] ?? offers[0];
    setSurprise(`${chosen.flag} ${chosen.city} — ${chosen.price} zł/os. · ${chosen.score}/10`);
  }

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#"><span>TRIP</span>OWNIA<span className="brand-dot">.</span></a>
        <nav>
          <a href="#okazje">Okazje</a>
          <a href="#inspiracje">Inspiracje</a>
          <a href="#budzet">Mam budżet</a>
        </nav>
        <button className="nav-cta">❤️ Ulubione</button>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="pill"><Flame size={16}/> Codziennie nowe selekcje</div>
          <h1>Nie szukaj godzinami.<br/><span>My szukamy. Ty lecisz.</span></h1>
          <p>Wyłapujemy podróże, które naprawdę mają sens: dobra cena, sensowny lot, dobry termin i kierunek wart wyjazdu.</p>
          <div className="searchbar">
            <div><small>Skąd?</small><strong>Warszawa + Modlin</strong></div>
            <div><small>Kiedy?</small><strong>Dowolnie</strong></div>
            <div><small>Na ile?</small><strong>2–7 nocy</strong></div>
            <button><Search size={18}/> Pokaż mi dobre wyjazdy</button>
          </div>
          <div className="trustline">Bez miliona wyników. Tylko to, co sami byśmy rozważyli.</div>
        </div>
      </section>

      <section className="section shell" id="okazje">
        <div className="section-heading">
          <div><div className="kicker">🔥 SELEKCJA DNIA</div><h2>Dziś bralibyśmy te</h2></div>
          <a href="#inspiracje">Zobacz wszystkie <ArrowRight size={16}/></a>
        </div>
        <div className="cards-grid">
          {offers.slice(0,3).map(o => <OfferCard offer={o} key={o.id}/>)}
        </div>
      </section>

      <section className="section shell" id="inspiracje">
        <div className="section-heading"><div><div className="kicker">✨ ZACZNIJ OD POTRZEBY</div><h2>Na jaki wyjazd masz dziś ochotę?</h2></div></div>
        <div className="category-grid">
          {categories.map(c => {
            const Icon = c.icon;
            return <button key={c.id} className={`category ${category===c.id ? "active" : ""}`} onClick={()=>setCategory(category===c.id?null:c.id)}><Icon size={22}/><span>{c.label}</span></button>
          })}
        </div>
        <div className="cards-grid filtered-grid">
          {filtered.map(o => <OfferCard offer={o} key={o.id}/>)}
        </div>
      </section>

      <section className="budget-wrap" id="budzet">
        <div className="shell budget-grid">
          <div>
            <div className="kicker light">💸 BUDŻET NA OSOBĘ</div>
            <h2>Mam {budget} zł.<br/>Gdzie mogę polecieć?</h2>
            <p>Ustaw kwotę, a Tripownia pokaże tylko wyjazdy, które mieszczą się w Twoim budżecie.</p>
            <input type="range" min="500" max="4000" step="100" value={budget} onChange={e=>setBudget(Number(e.target.value))}/>
            <div className="range-labels"><span>500 zł</span><strong>{budget} zł</strong><span>4000 zł</span></div>
          </div>
          <div className="surprise-card">
            <Sparkles size={30}/>
            <h3>Nie wiesz gdzie?</h3>
            <p>Daj nam budżet i daj się zaskoczyć.</p>
            <button onClick={pickSurprise}><Dice5 size={18}/> Zaskocz mnie</button>
            {surprise && <div className="surprise-result">{surprise}</div>}
          </div>
        </div>
      </section>

      <section className="section shell score-section">
        <div className="score-copy">
          <div className="kicker">TRIPOWNIA SCORE</div>
          <h2>Cena to dopiero początek.</h2>
          <p>Oceniamy wyjazd całościowo: cenę, pogodę, hotel, termin i lot. Dzięki temu od razu wiesz, czy oferta jest naprawdę dobra.</p>
        </div>
        <div className="score-box">
          <div className="bigscore">9,6<span>/10</span></div>
          {[['Cena','10/10'],['Pogoda','8/10'],['Hotel','9/10'],['Termin','10/10'],['Lot','9/10']].map(([a,b])=><div className="score-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}
          <div className="verdict">🔥 BIERZEMY</div>
        </div>
      </section>

      <footer className="footer"><div className="shell"><div className="brand footer-brand"><span>TRIP</span>OWNIA<span className="brand-dot">.</span></div><p>Podróże, które warto brać.</p></div></footer>
    </main>
  );
}
