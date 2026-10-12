"use client";

import { useMemo } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { selectLiveDeals } from "@/lib/liveDealSelection";

export default function LivePriceRadar() {
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers("/api/deals?strict=1", 5 * 60 * 1000);
  const picks = useMemo(
    () => source === "live" ? selectLiveDeals(offers, 5) : [],
    [offers, source]
  );
  const checkedLabel = checkedAt
    ? new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", dateStyle: "short", timeStyle: "short" }).format(new Date(checkedAt))
    : "";

  return <section aria-label="Zweryfikowane okazje podróżnicze" className="shell deals-simple-page">
    <div className="deals-simple-hero" style={{ alignItems: "center" }}>
      <div>
        <div className="kicker">TYLKO AKTUALNE CENY</div>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", marginBottom: 8 }}>
          {picks.length ? String(picks.length) + " najciekawszych ofert z aktualną ceną" : "Sprawdzamy prawdziwe okazje"}
        </h2>
        <p className="deals-simple-lead">
          Wybieramy maksymalnie 5 ofert z konkretnym terminem, ceną z ostatnich 6 godzin i dokładnym linkiem do rezerwacji.
          Żadnych orientacyjnych cen ani zapisanych promocji.
        </p>
      </div>
      <button type="button" onClick={refresh} disabled={loading} className="deals-simple-refresh">
        <RefreshCw size={16} aria-hidden="true" />{loading ? "Odświeżamy…" : "Odśwież ceny"}
      </button>
    </div>

    {checkedLabel && picks.length > 0 && <p className="deals-filter-notice">Ostatnie odświeżenie danych: {checkedLabel}. Ceny mogą zmienić się w czasie rezerwacji.</p>}

    {picks.length > 0 ? (
      <div className="cards-grid deals-premium-grid deals-simple-grid">
        {picks.map((offer) => <OfferCard key={offer.id} offer={offer} sourceSurface="radar_tripowni" />)}
      </div>
    ) : (
      <div className="self-search-empty deals-simple-empty" role="status">
        <strong>{loading ? "Szukamy dostępnych okazji…" : "Brak teraz ofert spełniających nasze wymagania cenowe."}</strong>
        <span>{loading ? "Sprawdzamy ceny i konkretne terminy w dostępnych źródłach." : "Nie zastępujemy ich nieaktualnymi promocjami. Sprawdź więcej kierunków albo odśwież wyniki."}</span>
        {!loading && <Link href="/okazje">Wróć do wyszukiwarki okazji →</Link>}
      </div>
    )}
    <div className="deals-simple-bottom">
      <span>Chcesz przejrzeć więcej kierunków i terminy?</span>
      <Link href="/okazje">Wszystkie okazje Tripowni →</Link>
    </div>
  </section>;
}
