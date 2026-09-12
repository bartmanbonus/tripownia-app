"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, WalletCards, Sun, Moon, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { offers, isOfferExpired } from "@/lib/offers";

const climates = [
  { key: "dowolnie", label: "Dowolnie" },
  { key: "cieplo", label: "Ciepło" },
  { key: "plaza", label: "Plaża" },
  { key: "city", label: "City break" },
];

const styles = [
  { key: "dowolnie", label: "Bez znaczenia" },
  { key: "tanio", label: "Jak najtaniej" },
  { key: "weekend", label: "Krótki reset" },
  { key: "allinclusive", label: "Wygodnie / All Inclusive" },
];

function matchScore(offer: (typeof offers)[number], budget: number, maxNights: number, climate: string, style: string) {
  let score = offer.score * 10;
  if (offer.price <= budget) score += 20;
  else score -= Math.min(30, ((offer.price - budget) / Math.max(1, budget)) * 35);
  if (offer.nights <= maxNights) score += 10;
  else score -= Math.min(18, (offer.nights - maxNights) * 3);
  if (climate !== "dowolnie" && offer.category.includes(climate)) score += 18;
  if (style !== "dowolnie" && offer.category.includes(style)) score += 14;
  if (offer.tag === "BIERZEMY") score += 5;
  return score;
}

export default function TravelAdvisor() {
  const [budget, setBudget] = useState(2000);
  const [maxNights, setMaxNights] = useState(5);
  const [climate, setClimate] = useState("dowolnie");
  const [style, setStyle] = useState("dowolnie");
  const [submitted, setSubmitted] = useState(false);

  const recommendations = useMemo(() => {
    return offers
      .filter((offer) => offer.partner !== "esky" && !isOfferExpired(offer))
      .map((offer) => ({ offer, score: matchScore(offer, budget, maxNights, climate, style) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((row) => row.offer);
  }, [budget, maxNights, climate, style]);

  return (
    <main>
      <SiteHeader />
      <section className="shell advisor-page">
        <div className="advisor-hero">
          <div className="advisor-icon"><Compass size={30} /></div>
          <div>
            <div className="kicker">NIE WIESZ GDZIE LECIEĆ?</div>
            <h1>Powiedz, czego potrzebujesz. Tripownia wybierze kierunek.</h1>
            <p>Nie musisz znać miasta ani kraju. Wystarczy budżet, długość wyjazdu i klimat.</p>
          </div>
        </div>

        <div className="advisor-controls">
          <label>
            <span><WalletCards size={17}/> Budżet na osobę</span>
            <div className="advisor-range-row">
              <input type="range" min="500" max="6000" step="100" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
              <strong>{budget.toLocaleString("pl-PL")} zł</strong>
            </div>
          </label>

          <label>
            <span><Moon size={17}/> Maksymalnie nocy</span>
            <div className="advisor-range-row">
              <input type="range" min="2" max="14" step="1" value={maxNights} onChange={(e) => setMaxNights(Number(e.target.value))} />
              <strong>{maxNights}</strong>
            </div>
          </label>

          <div className="advisor-choice">
            <span><Sun size={17}/> Klimat</span>
            <div className="profile-chips">
              {climates.map((item) => <button key={item.key} type="button" className={`profile-chip ${climate === item.key ? "active" : ""}`} onClick={() => setClimate(item.key)}>{item.label}</button>)}
            </div>
          </div>

          <div className="advisor-choice">
            <span><Sparkles size={17}/> Styl wyjazdu</span>
            <div className="profile-chips">
              {styles.map((item) => <button key={item.key} type="button" className={`profile-chip ${style === item.key ? "active" : ""}`} onClick={() => setStyle(item.key)}>{item.label}</button>)}
            </div>
          </div>

          <button className="primary-cta advisor-submit" onClick={() => setSubmitted(true)}><Sparkles size={18}/> Pokaż moje 3 kierunki</button>
        </div>

        {submitted && (
          <section className="advisor-results">
            <div className="section-heading"><div><div className="kicker">TOP 3 DLA CIEBIE</div><h2>Najlepsze dopasowanie</h2><p>Wybraliśmy oferty, które najlepiej mieszczą się w Twoim budżecie i stylu podróży.</p></div></div>
            <div className="cards-grid">{recommendations.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>
            <div className="advisor-next"><Link href="/dla-ciebie">Zobacz więcej dopasowanych ofert <ArrowRight size={16}/></Link></div>
          </section>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
