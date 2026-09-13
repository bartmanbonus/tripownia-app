"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, WalletCards, Sun, Moon, ArrowRight, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { inferredOfferCategories } from "@/lib/offerPersonalization";
import { useLiveOffers } from "@/lib/useLiveOffers";

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

export default function TravelAdvisor() {
  const [budget, setBudget] = useState(2000);
  const [maxNights, setMaxNights] = useState(5);
  const [climate, setClimate] = useState("dowolnie");
  const [style, setStyle] = useState("dowolnie");
  const [submitted, setSubmitted] = useState(false);
  const endpoint = useMemo(() => `/api/today-offers?mode=search&broad=1&maxPrice=${budget}`, [budget]);
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers(endpoint);

  const strictRecommendations = useMemo(() => offers
    .filter((offer) => offer.availabilityStatus !== "expired")
    .filter((offer) => offer.price <= budget)
    .filter((offer) => offer.nights <= maxNights)
    .filter((offer) => climate === "dowolnie" || inferredOfferCategories(offer).has(climate))
    .filter((offer) => style === "dowolnie" || inferredOfferCategories(offer).has(style))
    .sort((a, b) => b.score - a.score || a.price - b.price)
    .slice(0, 3), [offers, budget, maxNights, climate, style]);

  const relaxedRecommendations = useMemo(() => offers
    .filter((offer) => offer.availabilityStatus !== "expired")
    .filter((offer) => offer.price <= budget)
    .map((offer) => {
      const categories = inferredOfferCategories(offer);
      let score = offer.score * 10;
      score += offer.nights <= maxNights ? 16 : -Math.min(30, (offer.nights - maxNights) * 5);
      if (climate !== "dowolnie") score += categories.has(climate) ? 24 : -40;
      if (style !== "dowolnie") score += categories.has(style) ? 20 : -35;
      return { offer, score };
    })
    .sort((a, b) => b.score - a.score || a.offer.price - b.offer.price)
    .slice(0, 3)
    .map((row) => row.offer), [offers, budget, maxNights, climate, style]);

  const recommendations = strictRecommendations.length ? strictRecommendations : relaxedRecommendations;
  const relaxed = !strictRecommendations.length && relaxedRecommendations.length > 0;

  const freshness = source === "live"
    ? checkedAt ? `Aktualne oferty · ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : "Aktualne oferty"
    : "Tryb awaryjny — ostatnia dostępna pula";

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

          <div className="advisor-next" style={{ justifyContent: "space-between" }}>
            <span>{freshness}</span>
            <button type="button" className="app-secondary-button" onClick={refresh}><RefreshCw size={16}/> {loading ? "Odświeżam…" : "Odśwież oferty"}</button>
          </div>

          <button className="primary-cta advisor-submit" onClick={() => setSubmitted(true)}><Sparkles size={18}/> Pokaż moje 3 kierunki</button>
        </div>

        {submitted && (
          <section className="advisor-results">
            <div className="section-heading"><div><div className="kicker">TOP 3 DLA CIEBIE</div><h2>Najlepsze dopasowanie</h2><p>Wybraliśmy aktualne oferty, które najlepiej mieszczą się w Twoim budżecie i stylu podróży.</p></div></div>
            {relaxed && <p className="app-results-notice">Nie ma teraz oferty spełniającej wszystkie warunki jednocześnie. Pokazujemy najbliższe dopasowania, ale nadal mieszczące się w podanym budżecie.</p>}
            {!loading && recommendations.length === 0 && <div className="search-v3-empty"><strong>Brak ofert w tym budżecie.</strong><span>Zwiększ budżet albo zmień długość lub styl wyjazdu.</span></div>}
            <div className="cards-grid">{recommendations.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>
            <div className="advisor-next"><Link href="/dla-ciebie">Zobacz więcej dopasowanych ofert <ArrowRight size={16}/></Link></div>
          </section>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
