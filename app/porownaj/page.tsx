"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Scale } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers, publishedOfferOverrides } from "@/lib/offers";
import { getDealScore } from "@/lib/dealScore";
import { estimateTripCost } from "@/lib/tripCost";
import { getOfferOverride } from "@/lib/clientOfferOverrides";

export default function ComparePage() {
  const [ids, setIds] = useState<number[]>([]);
  const [priceVersion, setPriceVersion] = useState(0);

  useEffect(() => {
    const load = () => {
      try {
        setIds(JSON.parse(localStorage.getItem("tripownia-compare") || "[]") as number[]);
      } catch {
        setIds([]);
      }
      setPriceVersion((value) => value + 1);
    };
    load();
    window.addEventListener("tripownia-compare-updated", load);
    window.addEventListener("tripownia-offer-overrides-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-compare-updated", load);
      window.removeEventListener("tripownia-offer-overrides-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const selected = useMemo(() => ids.map((id) => offers.find((offer) => offer.id === id)).filter(Boolean), [ids, priceVersion]);

  function remove(id: number) {
    const next = ids.filter((item) => item !== id);
    localStorage.setItem("tripownia-compare", JSON.stringify(next));
    setIds(next);
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell compare-page">
        <div className="kicker">DECYZJA BEZ ZGADYWANIA</div>
        <h1>Porównaj wyjazdy</h1>
        <p className="hub-lead">Zestawiamy nie tylko cenę oferty, ale też szacowany pełny koszt, pogodę, długość pobytu, wyżywienie i Tripownia Deal Score.</p>

        {selected.length >= 2 ? (
          <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${Math.min(selected.length, 3)}, minmax(0,1fr))` }}>
            {selected.map((offer) => {
              if (!offer) return null;
              const clientOverride = getOfferOverride(offer.id);
              const publishedOverride = publishedOfferOverrides[String(offer.id)] || {};
              const displayPrice = clientOverride.price ?? publishedOverride.price ?? offer.price;
              const deal = getDealScore(offer, displayPrice, false);
              const cost = estimateTripCost(offer, displayPrice);
              return (
                <article className="compare-card" key={offer.id}>
                  <button className="compare-remove" onClick={() => remove(offer.id)} aria-label={`Usuń ${offer.city} z porównania`}>×</button>
                  <div className="eyebrow">{offer.flag} {offer.country}</div>
                  <h2>{offer.city}</h2>
                  <div className="compare-score"><BadgeCheck size={17} /><strong>{deal.score}/100</strong><span>{deal.verdict}</span></div>
                  <dl>
                    <div><dt>Cena oferty</dt><dd>{displayPrice.toLocaleString("pl-PL")} zł/os.</dd></div>
                    <div className="compare-total"><dt>Realny koszt Tripowni</dt><dd>ok. {cost.total.toLocaleString("pl-PL")} zł/os.</dd></div>
                    <div><dt>Wylot</dt><dd>{offer.departure}</dd></div>
                    <div><dt>Długość</dt><dd>{offer.nights} nocy</dd></div>
                    <div><dt>Pogoda</dt><dd>{offer.weather}</dd></div>
                    <div><dt>Wyżywienie</dt><dd>{offer.board}</dd></div>
                    <div><dt>Bagaż</dt><dd>{offer.baggageIncluded ? "w cenie" : `szacunek ${cost.baggage} zł`}</dd></div>
                    <div><dt>Transfer</dt><dd>{offer.transferIncluded ? "w cenie" : `szacunek ${cost.transfer} zł`}</dd></div>
                  </dl>
                  <p className="compare-reason">{offer.reason}</p>
                  <Link className="primary-cta" href={`/oferta/${offer.id}`}>Zobacz ofertę</Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="favorites-empty">
            <Scale size={36}/>
            <h2>Dodaj minimum 2 oferty</h2>
            <p>Na kartach ofert kliknij „Porównaj”. Możesz zestawić maksymalnie 3 wyjazdy.</p>
            <Link className="primary-cta" href="/"><ArrowLeft size={17}/> Wróć do ofert</Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
