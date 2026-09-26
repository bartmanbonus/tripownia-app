"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Plus, Scale, Trash2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers, publishedOfferOverrides, type Offer } from "@/lib/offers";
import { getDealScore } from "@/lib/dealScore";
import { estimateTripCost } from "@/lib/tripCost";
import { getOfferOverride } from "@/lib/clientOfferOverrides";
import { isPriceStale } from "@/lib/offerQuality";
import {
  COMPARE_OFFER_SNAPSHOTS_KEY,
  pruneOfferSnapshots,
  readSavedOfferSnapshots,
  type SavedOfferSnapshots,
} from "@/lib/savedOfferSnapshots";

export default function ComparePage() {
  const [ids, setIds] = useState<number[]>([]);
  const [snapshots, setSnapshots] = useState<SavedOfferSnapshots>({});
  const [priceVersion, setPriceVersion] = useState(0);

  useEffect(() => {
    const load = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem("tripownia-compare") || "[]");
        const nextIds = Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number").slice(-3) : [];
        setIds(nextIds);
        setSnapshots(readSavedOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY));
        pruneOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY, nextIds);
      } catch {
        setIds([]);
        setSnapshots({});
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

  const selected = useMemo(
    () => ids
      .map((id) => snapshots[String(id)] || offers.find((offer) => offer.id === id))
      .filter((offer): offer is Offer => Boolean(offer)),
    [ids, snapshots, priceVersion]
  );

  function remove(id: number) {
    const next = ids.filter((item) => item !== id);
    localStorage.setItem("tripownia-compare", JSON.stringify(next));
    pruneOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY, next);
    setIds(next);
    setSnapshots(readSavedOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY));
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  function clearAll() {
    localStorage.removeItem("tripownia-compare");
    localStorage.removeItem(COMPARE_OFFER_SNAPSHOTS_KEY);
    setIds([]);
    setSnapshots({});
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell compare-page">
        <div className="kicker">DECYZJA BEZ ZGADYWANIA</div>
        <h1>Porównaj wyjazdy</h1>
        <p className="hub-lead">Zestawiamy cenę, szacowany pełny koszt, pogodę, długość pobytu, wyżywienie i Tripownia Deal Score. Zapisane oferty live nie znikają po odświeżeniu.</p>

        <div className="compare-page-toolbar">
          <span><strong>{selected.length}/3</strong> wybrane oferty</span>
          {selected.length > 0 && <button type="button" onClick={clearAll}><Trash2 size={15}/> Wyczyść porównanie</button>}
        </div>

        {selected.length === 1 && (
          <div className="compare-page-hint">
            <Scale size={18}/>
            <span>Masz już pierwszą ofertę. Dodaj jeszcze jedną, żeby zobaczyć pełne porównanie obok siebie.</span>
          </div>
        )}

        {selected.length > 0 ? (
          <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${Math.min(selected.length < 3 ? selected.length + 1 : selected.length, 3)}, minmax(0,1fr))` }}>
            {selected.map((offer) => {
              const clientOverride = getOfferOverride(offer.id);
              const publishedOverride = publishedOfferOverrides[String(offer.id)] || {};
              const displayPrice = clientOverride.price ?? publishedOverride.price ?? offer.price;
              const checkedAt = clientOverride.updatedAt || publishedOverride.updatedAt || offer.priceCheckedAt;
              const hasExternalAffiliateUrl = /^https?:\/\//.test(offer.affiliateUrl || "");
              const isLiveOffer = offer.id >= 1_000_000;
              const isExactLink = offer.linkMatch === "exact" && hasExternalAffiliateUrl;
              const hasSafeLivePartnerLink = isLiveOffer && hasExternalAffiliateUrl;
              const isFreshLiveExact = isLiveOffer && isExactLink && Boolean(checkedAt) && !isPriceStale(checkedAt);
              const deal = getDealScore({ ...offer, priceCheckedAt: checkedAt }, displayPrice, isFreshLiveExact);
              const cost = estimateTripCost(offer, displayPrice);
              return (
                <article className="compare-card" key={offer.id}>
                  <button className="compare-remove" onClick={() => remove(offer.id)} aria-label={`Usuń ${offer.city} z porównania`}>×</button>
                  <div className="eyebrow">{offer.flag} {offer.country}</div>
                  <h2>{offer.city}</h2>
                  <div className="compare-score"><BadgeCheck size={17} /><strong>{deal.score}/100</strong><span>{deal.verdict}</span></div>
                  <small>Pewność oceny: {deal.confidence}</small>
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
                  {isExactLink || hasSafeLivePartnerLink ? (
                    <a className="primary-cta" href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">
                      {isExactLink ? "Sprawdź tę ofertę" : "Sprawdź aktualne oferty"}
                    </a>
                  ) : (
                    <Link className="primary-cta" href={`/oferta/${offer.id}`}>Zobacz ofertę</Link>
                  )}
                </article>
              );
            })}
            {selected.length < 3 && (
              <Link className="compare-add-card" href="/#wyszukiwarka">
                <Plus size={28}/>
                <strong>{selected.length === 1 ? "Dodaj drugą ofertę" : "Dodaj trzecią ofertę"}</strong>
                <span>Wróć do wyszukiwarki i kliknij „Porównaj” na kolejnej ofercie.</span>
              </Link>
            )}
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
