"use client";

import { isPromotableOffer } from "@/lib/offerValuePolicy";
import { fetchEskyBrowserPackages } from "@/lib/eskyBrowserSearch";
import { eskySearchUrl } from "@/lib/eskySearch";
import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
import { inferOfferEndDate, inferOfferStartDate, type Offer } from "@/lib/offers";

type LiveOffer = Offer & { startDateISO?: string };
type Mode = "citybreak" | "vacation" | "lastminute";
type ApiResponse = { ok?: boolean; offers?: LiveOffer[]; checkedAt?: string; notice?: string };

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function lastMinuteFallbackSearches() {
  const today = new Date();
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() + 45);
  const start = isoDate(today);
  const finish = isoDate(end);

  return ["Egipt", "Turcja", "Tunezja", "Cypr"].map((destination) => {
    const target = eskySearchUrl({
      query: destination,
      minNights: 5,
      maxNights: 9,
      start,
      end: finish,
    });
    const href = `/go/live?${new URLSearchParams({
      partner: "esky",
      target,
      source: "last_minute_first_paint",
      destination,
    }).toString()}`;
    return { destination, href };
  });
}

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

  const inferredEnd = offer.startDateISO
    ? new Date(start.getTime() + Math.max(1, offer.nights) * 86_400_000)
    : inferOfferEndDate(offer.dates);
  const end = inferredEnd && !Number.isNaN(inferredEnd.getTime()) ? inferredEnd : start;

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const max = new Date(today);
  max.setUTCDate(max.getUTCDate() + 45);

  return end >= today
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
    const controller = new AbortController();

    async function load() {
      if (!initialOffers.length) setLoading(true);
      try {
        if (mode === "citybreak") {
          const [eskyResult, dealsResult] = await Promise.allSettled([
            fetchEskyBrowserPackages({ cityBreak: true }, controller.signal),
            fetch(`/api/deals?refresh=${Date.now()}`, { cache: "no-store", signal: controller.signal })
              .then(async (response) => {
                if (!response.ok) throw new Error("live deals unavailable");
                return await response.json() as ApiResponse;
              }),
          ]);

          const mixed: LiveOffer[] = [];
          if (eskyResult.status === "fulfilled" && Array.isArray(eskyResult.value.offers)) {
            mixed.push(...eskyResult.value.offers);
          }
          if (dealsResult.status === "fulfilled" && Array.isArray(dealsResult.value.offers)) {
            mixed.push(...dealsResult.value.offers);
          }

          if (!cancelled && mixed.length) setPool(mixed);
          return;
        }
        const response = await fetch(`/api/deals?refresh=${Date.now()}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("live deals unavailable");
        const data = (await response.json()) as ApiResponse;
        if (!cancelled && Array.isArray(data.offers) && data.offers.length) setPool(data.offers);
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
      controller.abort();
      window.clearInterval(timer);
    };
  }, [initialOffers.length, mode]);

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
  if (!offers.length) {
    if (mode === "lastminute") {
      const searches = lastMinuteFallbackSearches();
      return (
        <div className="search-v3-empty last-minute-search-fallback">
          <strong>Sprawdź aktualne Last Minute bez czekania na odświeżenie feedu.</strong>
          <span>Nie pokazujemy starej ceny jako aktualnej. Otwórz gotowe wyszukiwanie na najbliższe 45 dni.</span>
          <div className="search-v3-empty-actions">
            {searches.map(({ destination, href }) => (
              <a key={destination} href={href} rel="sponsored">
                {destination} · 5–9 nocy
              </a>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="cards-grid seo-live-offers-grid">
      {offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} sourceSurface="live_sales_rail" />)}
    </div>
  );
}
