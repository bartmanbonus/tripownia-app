"use client";

import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { isOfferExpired, offers as savedOffers } from "@/lib/offers";
import { touristDestinationKey } from "@/lib/destinationGrouping";

const CACHE_KEY = "tripownia:last-good-daily";
const CACHE_MAX_AGE_MS = 48 * 60 * 60 * 1000;

type Deal = (typeof savedOffers)[number];
type CachePayload = { checkedAt?: string; offers?: Deal[] };

function cleanDeals(rows: Deal[]) {
  const best = new Map<string, Deal>();
  for (const row of [...rows].sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity))) {
    if (!row || !row.affiliateUrl || Number(row.price || 0) <= 0) continue;
    const key = touristDestinationKey(row);
    if (!key || best.has(key)) continue;
    best.set(key, row);
  }
  return Array.from(best.values()).slice(0, 20);
}

function readCachedDeals(): CachePayload | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null") as CachePayload | null;
    if (!cached?.checkedAt || !Array.isArray(cached.offers) || !cached.offers.length) return null;
    const checkedMs = new Date(cached.checkedAt).getTime();
    const age = Date.now() - checkedMs;
    if (!Number.isFinite(checkedMs) || age < 0 || age > CACHE_MAX_AGE_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function checkedLabel(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function LiveDealsPage() {
  const staticFallback = useMemo(
    () => savedOffers.filter((offer) => !isOfferExpired(offer)).slice(0, 20),
    []
  );
  const [deals, setDeals] = useState<Deal[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "cache" | "fallback">("loading");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const cached = readCachedDeals();

    if (cached?.offers?.length) {
      setDeals(cleanDeals(cached.offers));
      setCheckedAt(cached.checkedAt || null);
      setStatus("cache");
    }

    fetch("/api/today-offers?mode=search&broad=1", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.ok === false) throw new Error(String(data?.error || response.status));
        return data;
      })
      .then((data) => {
        if (!active) return;
        const next = cleanDeals(Array.isArray(data?.offers) ? data.offers : []);
        if (!next.length) throw new Error("empty-live-deals");
        const nextCheckedAt = String(data?.checkedAt || new Date().toISOString());
        setDeals(next);
        setCheckedAt(nextCheckedAt);
        setStatus("live");
        localStorage.setItem(CACHE_KEY, JSON.stringify({ checkedAt: nextCheckedAt, offers: next }));
      })
      .catch(() => {
        if (!active || controller.signal.aborted) return;
        if (cached?.offers?.length) {
          setDeals(cleanDeals(cached.offers));
          setCheckedAt(cached.checkedAt || null);
          setStatus("cache");
          return;
        }
        setDeals(staticFallback);
        setCheckedAt(null);
        setStatus("fallback");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [staticFallback]);

  const statusCopy = status === "live"
    ? `Aktualne oferty z feedów${checkedAt ? ` · sprawdzone ${checkedLabel(checkedAt)}` : ""}`
    : status === "cache"
      ? `Ostatnia poprawna pula${checkedAt ? ` · sprawdzona ${checkedLabel(checkedAt)}` : ""}`
      : status === "fallback"
        ? "Feed jest chwilowo niedostępny — pokazujemy zapisane inspiracje, a cenę potwierdzisz u partnera."
        : "Sprawdzamy najnowsze oferty…";

  return (
    <main>
      <SiteHeader />
      <section className="shell hub-page">
        <div className="kicker">OKAZJE TRIPOWNI</div>
        <h1>Najlepsze znalezione dziś</h1>
        <p className="hub-lead">Do 20 różnych kierunków. Na każdy kierunek pokazujemy najtańszą poprawną ofertę, którą udało się teraz potwierdzić.</p>
        <p className="offer-live-note">{statusCopy}</p>

        {deals.length > 0 ? (
          <div className="cards-grid">
            {deals.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        ) : (
          <div className="search-v3-empty">
            <strong>Nie mamy teraz poprawnej puli ofert.</strong>
            <span>Odśwież stronę za chwilę albo skorzystaj z wyszukiwarki na stronie głównej.</span>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
