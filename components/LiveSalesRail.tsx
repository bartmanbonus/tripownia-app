"use client";

import { isPromotableOffer } from "@/lib/offerValuePolicy";
import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
import { inferOfferStartDate, type Offer } from "@/lib/offers";

type LiveOffer = Offer & { startDateISO?: string };
type Mode = "citybreak" | "vacation" | "lastminute";
type ApiResponse = { ok?: boolean; offers?: LiveOffer[]; checkedAt?: string; notice?: string };

function uniqueOffers(items: LiveOffer[]) {
  const seen = new Set<string>();
  return items.filter((offer) => {
    const key = `${offer.affiliateUrl}|${offer.hotel}|${offer.dates}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchesMode(offer: LiveOffer, mode: Mode) {
  const categories = offer.category || [];
  if (mode === "citybreak") {
    return offer.nights >= 2 && offer.nights <= 5 && offer.price <= 2000;
  }
  if (mode === "vacation") {
    return offer.nights >= 5 || categories.some((item) => /wakacje|allinclusive|plaza|cieplo/i.test(item));
  }

  const start = offer.startDateISO
    ? new Date(`${offer.startDateISO}T00:00:00Z`)
    : inferOfferStartDate(offer.dates);
  if (!start || Number.isNaN(start.getTime())) return false;
  const now = new Date();
  const max = new Date(now);
  max.setUTCDate(max.getUTCDate() + 45);
  return start >= new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    && start <= max
    && (offer.nights >= 5 || categories.some((item) => /wakacje|allinclusive|plaza|cieplo/i.test(item)));
}

export default function LiveSalesRail({
  mode,
  limit = 8,
  initialOffers = [],
}: {
  mode: Mode;
  limit?: number;
  initialOffers?: Offer[];
}) {
  const [pool, setPool] = useState<LiveOffer[]>(initialOffers);
  const [loading, setLoading] = useState(initialOffers.length === 0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!initialOffers.length) setLoading(true);
      try {
        const response = await fetch(`/api/deals?refresh=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("live deals unavailable");
        const data = (await response.json()) as ApiResponse;
        if (!cancelled) setPool(Array.isArray(data.offers) ? data.offers : []);
      } catch {
        if (!cancelled && !initialOffers.length) setPool([]);
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
  }, [initialOffers.length]);

  const offers = useMemo(
    () => uniqueOffers(pool.filter((offer) => isPromotableOffer(offer) && matchesMode(offer, mode)))
      .sort((a, b) => Number(a.price) - Number(b.price))
      .slice(0, limit),
    [pool, mode, limit]
  );

  if (loading && !offers.length) {
    return (
      <div className="seo-live-skeleton-grid" aria-label="Ładowanie aktualnych ofert">
        {[0,1,2].map((item) => (
          <div className="seo-live-skeleton-card" key={item} aria-hidden="true">
            <div className="seo-live-skeleton-image"/>
            <div className="seo-live-skeleton-body">
              <span/><strong/><span/><button type="button" tabIndex={-1}/>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!offers.length) return null;

  return (
    <div className="cards-grid seo-live-offers-grid">
      {offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} sourceSurface="live_sales_rail" />)}
    </div>
  );
}
