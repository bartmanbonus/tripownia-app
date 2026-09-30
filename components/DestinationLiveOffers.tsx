"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";

type LiveOffer = Offer & { startDateISO?: string };
type Props = { destination: string; allInclusive?: boolean };
type ResponsePayload = { ok?: boolean; offers?: LiveOffer[]; checkedAt?: string; notice?: string };

export default function DestinationLiveOffers({ destination, allInclusive = false }: Props) {
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: destination });
        if (allInclusive) params.set("type", "allinclusive");
        const response = await fetch(`/api/deals?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("offers unavailable");
        const data = (await response.json()) as ResponsePayload;
        if (cancelled) return;
        setOffers(Array.isArray(data.offers) ? data.offers.slice(0, 6) : []);
        setNotice(data.notice || "");
      } catch {
        if (!cancelled) {
          setOffers([]);
          setNotice("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [destination, allInclusive]);

  if (loading) {
    return <div className="seo-live-status"><span className="seo-live-pulse" /><strong>Sprawdzamy aktualne oferty dla: {destination}…</strong></div>;
  }

  if (!offers.length) {
    return (
      <div className="seo-live-status seo-live-status-warning">
        <strong>Nie mamy teraz potwierdzonego pakietu dla: {destination}.</strong>
        <span>Nie podstawiamy losowego kierunku. Możesz przejść do wyszukiwania lub sprawdzić ponownie później.</span>
        <Link href={`/okazje?q=${encodeURIComponent(destination)}`}>Sprawdź wszystkie aktualne opcje →</Link>
      </div>
    );
  }

  return (
    <>
      {notice && <div className="seo-live-note">{notice}</div>}
      <div className="cards-grid seo-live-offers-grid">
        {offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} />)}
      </div>
    </>
  );
}
