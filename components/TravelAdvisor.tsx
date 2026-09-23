"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, WalletCards, Sun, Moon, ArrowRight, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { type Offer } from "@/lib/offers";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { recommendationScore } from "@/lib/offerQuality";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";

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

function matchScore(offer: Offer, budget: number, climate: string, style: string) {
  let score = recommendationScore(offer, "all");
  const budgetFit = offer.price / Math.max(1, budget);

  // Wśród ofert mieszczących się w budżecie premiujemy te, które dobrze go wykorzystują,
  // ale nie wygrywają wyłącznie najniższą ceną.
  score += Math.round(Math.min(18, budgetFit * 18));
  if (climate !== "dowolnie" && offer.category.includes(climate)) score += 18;
  if (style !== "dowolnie" && offer.category.includes(style)) score += 14;
  return score;
}

export default function TravelAdvisor() {
  const [minBudget, setMinBudget] = useState(0);
  const [minNights, setMinNights] = useState(1);
  const [budget, setBudget] = useState(2000);
  const [maxNights, setMaxNights] = useState(5);
  const [climate, setClimate] = useState("dowolnie");
  const [style, setStyle] = useState("dowolnie");
  const [submitted, setSubmitted] = useState(false);
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers("/api/today-offers?mode=search&broad=1");

  const recommendations = useMemo(() => {
    const ranked = offers
      .filter((offer) => offer.availabilityStatus !== "expired")
      .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
      .filter((offer) => offer.price >= minBudget && offer.price <= budget)
      .filter((offer) => offer.nights >= minNights && offer.nights <= maxNights)
      .map((offer) => ({ offer, score: matchScore(offer, budget, climate, style) }))
      .sort((a, b) => b.score - a.score || a.offer.price - b.offer.price);

    const seen = new Set<string>();
    return ranked
      .filter(({ offer }) => {
        const key = touristDestinationKey(offer);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12)
      .map((row) => row.offer);
  }, [offers, minBudget, budget, minNights, maxNights, climate, style]);

  const freshness = source === "live"
    ? checkedAt
      ? `Aktualne oferty · ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`
      : "Aktualne oferty"
    : offers.length
      ? checkedAt
        ? `Ostatnia poprawna pula · ${new Date(checkedAt).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
        : "Ostatnia poprawna pula"
      : "Brak potwierdzonej puli";

  return (
    <main>
      <SiteHeader />
      <section className="shell advisor-page">
        <div className="advisor-hero">
          <div className="advisor-icon"><Compass size={30} /></div>
          <div>
            <div className="kicker">NIE WIESZ GDZIE LECIEĆ?</div>
            <h1>Powiedz, czego potrzebujesz. Tripownia wybierze kierunek.</h1>
            <p>Nie musisz znać miasta ani kraju. Wybierz budżet i liczbę nocy od–do. Klimat i styl pomogą dopasować kierunek.</p>
          </div>
        </div>

        <div className="advisor-controls">
          <div className="advisor-choice">
            <span><WalletCards size={17}/> Budżet na osobę</span>
            <RangeBounds label="Budżet na osobę" min={0} max={6000} step={100} lower={minBudget} upper={budget} unit="zł" onLower={setMinBudget} onUpper={setBudget} />
          </div>

          <div className="advisor-choice">
            <span><Moon size={17}/> Liczba nocy</span>
            <RangeBounds label="Liczba nocy" min={1} max={14} step={1} lower={minNights} upper={maxNights} unit="" onLower={setMinNights} onUpper={setMaxNights} />
          </div>

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

          <button className="primary-cta advisor-submit" onClick={() => setSubmitted(true)}><Sparkles size={18}/> Pokaż moje kierunki i oferty</button>
        </div>

        {submitted && (
          <section className="advisor-results">
            <div className="section-heading">
              <div>
                <div className="kicker">NAJLEPSZE DLA CIEBIE</div>
                <h2>{recommendations.length ? "Najlepsze dopasowanie" : loading ? "Sprawdzamy możliwości…" : "Brak dobrego dopasowania"}</h2>
                <p>{recommendations.length
                  ? source === "live"
                    ? "Pokazujemy więcej różnych kierunków mieszczących się w wybranym zakresie budżetu i liczby nocy — najlepsze są na początku."
                    : "Pokazujemy najlepsze dopasowania z ostatniej poprawnej puli. Przed rezerwacją potwierdź aktualną cenę."
                  : "Nie naginamy budżetu ani długości pobytu. Poszerz zakres budżetu lub liczby nocy albo odśwież aktualną pulę."}</p>
              </div>
            </div>
            {recommendations.length > 0 && <div className="cards-grid">{recommendations.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>}
            <div className="advisor-next"><Link href="/dla-ciebie">Zobacz więcej dopasowanych ofert <ArrowRight size={16}/></Link></div>
          </section>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

function RangeBounds({ label, min, max, step, lower, upper, unit, onLower, onUpper }: {
  label: string; min: number; max: number; step: number;
  lower: number; upper: number; unit: string;
  onLower: (value: number) => void; onUpper: (value: number) => void;
}) {
  return (
    <div role="group" aria-label={label} style={{ display: "grid", gap: 8, marginTop: 12, minWidth: 0 }}>
      <label style={{ display: "grid", gap: 4, minWidth: 0 }}>
        <span>Od <strong>{lower.toLocaleString("pl-PL")} {unit}</strong></span>
        <input type="range" aria-label={label + " od"} aria-valuetext={lower + " " + unit}
          min={min} max={max} step={step} value={lower}
          onChange={(event) => onLower(Math.min(Number(event.target.value), upper))}
          style={{ width: "100%", minWidth: 0, height: 44, margin: 0, accentColor: "#ff602e" }} />
      </label>
      <label style={{ display: "grid", gap: 4, minWidth: 0 }}>
        <span>Do <strong>{upper.toLocaleString("pl-PL")} {unit}</strong></span>
        <input type="range" aria-label={label + " do"} aria-valuetext={upper + " " + unit}
          min={min} max={max} step={step} value={upper}
          onChange={(event) => onUpper(Math.max(Number(event.target.value), lower))}
          style={{ width: "100%", minWidth: 0, height: 44, margin: 0, accentColor: "#ff602e" }} />
      </label>
    </div>
  );
}
