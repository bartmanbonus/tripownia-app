"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Search, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { isOfferExpired, type Offer } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { useLiveOffers } from "@/lib/useLiveOffers";

function cheapestUnique(rows: Offer[]) {
  const best = new Map<string, Offer>();

  rows
    .filter((offer) => offer && Number(offer.price) > 0)
    .filter((offer) => !isOfferExpired(offer))
    .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
    .forEach((offer) => {
      const key = touristDestinationKey(offer);
      const current = best.get(key);
      if (!current || Number(offer.price) < Number(current.price)) best.set(key, offer);
    });

  return Array.from(best.values())
    .sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 20);
}

export default function DealsPage() {
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers("/api/today-offers?mode=search&broad=1");
  const rows = useMemo(() => cheapestUnique(offers), [offers]);

  const checkedLabel = checkedAt
    ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(checkedAt))
    : "";

  const sourceCopy = source === "live"
    ? `Aktualny feed${checkedLabel ? ` · ${checkedLabel}` : ""}`
    : rows.length
      ? `Ostatnia poprawna pula${checkedLabel ? ` · ${checkedLabel}` : ""}`
      : "Brak potwierdzonej puli — odświeżamy dane";

  return <main>
    <SiteHeader/>
    <section className="shell hub-page deals-hub-page">
      <div className="deals-hub-hero">
        <div>
          <div className="kicker">OKAZJE TRIPOWNI</div>
          <h1>Różne kierunki, które dziś mają sens.</h1>
          <p className="hub-lead">Bez ściany podobnych hoteli. Dla każdego kierunku zostawiamy najtańszą dostępną propozycję z ostatniej poprawnie pobranej puli.</p>
        </div>
        <div className="deals-hub-actions">
          <Link className="primary-cta" href="/#wyszukiwarka"><Search size={17}/> Wyszukaj po swojemu</Link>
          <button className="secondary-cta" type="button" onClick={refresh} disabled={loading}><RefreshCw size={16}/>{loading ? "Odświeżamy…" : "Odśwież ceny"}</button>
        </div>
      </div>

      <div className="deals-trust-bar">
        <span><Sparkles size={15}/><strong>{rows.length} {rows.length === 1 ? "różny kierunek" : "różnych kierunków"}</strong></span>
        <span>{sourceCopy}</span>
      </div>

      {rows.length > 0 ? (
        <div className="cards-grid deals-premium-grid">{rows.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
      ) : !loading ? (
        <div className="self-search-empty">
          <strong>Nie mamy teraz potwierdzonej puli okazji.</strong>
          <span>Nie podstawiamy statycznych cen. Odśwież dane albo skorzystaj z wyszukiwarki Tripowni.</span>
        </div>
      ) : null}

      <div className="deals-end-cta"><div><strong>Nie widzisz swojego kierunku?</strong><span>Ustaw lotnisko, budżet, długość pobytu i wyżywienie — zwykła wyszukiwarka działa niezależnie od „Okazji Tripowni”.</span></div><Link href="/#wyszukiwarka">Przejdź do wyszukiwarki <ArrowRight size={16}/></Link></div>
    </section>
    <SiteFooter/>
  </main>;
}
