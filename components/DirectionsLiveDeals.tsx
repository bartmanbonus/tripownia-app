"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";

type ApiResponse = { ok?: boolean; offers?: Offer[]; checkedAt?: string };

export default function DirectionsLiveDeals() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/deals?refresh=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as ApiResponse;
        if (!cancelled && Array.isArray(data.offers)) setOffers(data.offers.slice(0, 6));
      } catch {
        // The destination directory still works if live feeds are temporarily unavailable.
      }
    }

    void load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!offers.length) return null;

  return (
    <section className="section shell">
      <div className="section-heading">
        <div>
          <div className="kicker">NAJTAŃSZE KIERUNKI TERAZ</div>
          <h2>Zobacz, co jest aktualnie najtańsze</h2>
          <p>Aktualne ceny z dostępnych źródeł. Finalną cenę i dostępność potwierdzasz przy przejściu do rezerwacji.</p>
        </div>
        <Link href="/okazje">Wszystkie okazje →</Link>
      </div>
      <div className="cards-grid seo-live-offers-grid">
        {offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} />)}
      </div>
    </section>
  );
}
