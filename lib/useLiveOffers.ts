"use client";

import { useCallback, useEffect, useState } from "react";
import type { Offer } from "@/lib/offers";
import { isOfferExpired } from "@/lib/offerRuntime";
import { fetchBrowserEskyOffers } from "@/lib/browserEsky";
import { offerSourceIsLive, type OfferSourceType } from "@/lib/offerEngine";

type LiveOffersResponse = {
  ok?: boolean;
  checkedAt?: string;
  offers?: Offer[];
  notice?: string;
  error?: string;
  sourceType?: OfferSourceType;
  partial?: boolean;
};

type LiveOffersState = {
  offers: Offer[];
  source: "live" | "fallback";
  loading: boolean;
  checkedAt?: string;
  notice?: string;
  error?: string;
};

type CachedLiveOffers = {
  checkedAt?: string;
  savedAt: string;
  offers: Offer[];
};

const DEFAULT_ENDPOINT = "/api/today-offers?mode=search&broad=1";
const MAX_CACHE_AGE_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15_000;

function usableOffers(rows: Offer[]) {
  return rows.filter((offer) => offer && !isOfferExpired(offer));
}

function cacheKey(endpoint: string) {
  return `tripownia-live-cache:${encodeURIComponent(endpoint)}`;
}

function isFreshTimestamp(value?: string) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return false;
  const age = Date.now() - timestamp;
  return age >= 0 && age <= MAX_CACHE_AGE_MS;
}

function readCache(endpoint: string): CachedLiveOffers | null {
  if (typeof window === "undefined") return null;
  try {
    const key = cacheKey(endpoint);
    const parsed = JSON.parse(localStorage.getItem(key) || "null") as CachedLiveOffers | null;
    if (!parsed || !Array.isArray(parsed.offers) || !parsed.offers.length) return null;

    const freshnessTimestamp = parsed.checkedAt || parsed.savedAt;
    if (!isFreshTimestamp(freshnessTimestamp)) {
      localStorage.removeItem(key);
      return null;
    }

    const offers = usableOffers(parsed.offers);
    if (!offers.length) {
      localStorage.removeItem(key);
      return null;
    }

    return { ...parsed, offers };
  } catch {
    localStorage.removeItem(cacheKey(endpoint));
    return null;
  }
}

function writeCache(endpoint: string, offers: Offer[], checkedAt?: string) {
  if (typeof window === "undefined" || !offers.length) return;
  const usable = usableOffers(offers);
  if (!usable.length) return;
  try {
    localStorage.setItem(cacheKey(endpoint), JSON.stringify({
      checkedAt,
      savedAt: new Date().toISOString(),
      offers: usable,
    } satisfies CachedLiveOffers));
  } catch {}
}

function mergeOffers(primary: Offer[], supplement: Offer[]) {
  const unique = new Map<string, Offer>();
  for (const offer of usableOffers([...primary, ...supplement])) {
    const key = `${offer.partner || "unknown"}:${offer.id}`;
    const current = unique.get(key);
    if (!current || Number(offer.price) < Number(current.price)) unique.set(key, offer);
  }
  return Array.from(unique.values()).sort((a, b) => Number(a.price) - Number(b.price));
}

export function useLiveOffers(endpoint = DEFAULT_ENDPOINT, refreshMs = 5 * 60 * 1000) {
  const [state, setState] = useState<LiveOffersState>({
    offers: [],
    source: "fallback",
    loading: true,
  });

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
      const data = await response.json() as LiveOffersResponse;
      const live = usableOffers(Array.isArray(data.offers) ? data.offers : []);

      const tryBrowserEsky = () => {
        const shouldTry = Boolean(data.partial) || !offerSourceIsLive(data.sourceType);
        if (!shouldTry) return;

        void fetchBrowserEskyOffers(endpoint).then((rows) => {
          const browserLive = usableOffers(rows);
          if (!browserLive.length) return;

          const checkedAt = new Date().toISOString();
          const merged = mergeOffers(live, browserLive);
          writeCache(endpoint, merged, checkedAt);
          setState({
            offers: merged,
            source: "live",
            loading: false,
            checkedAt,
            notice: [
              data.notice,
              "Dodaliśmy dostępne wyniki eSky pobrane bezpośrednio w przeglądarce.",
            ].filter(Boolean).join(" "),
          });
        });
      };

      if (response.ok && data.ok && !live.length) {
        try { localStorage.removeItem(cacheKey(endpoint)); } catch {}
        setState({
          offers: [],
          source: offerSourceIsLive(data.sourceType) ? "live" : "fallback",
          loading: false,
          checkedAt: data.checkedAt,
          notice: data.notice,
        });
        tryBrowserEsky();
        return;
      }

      if (!response.ok || !live.length) {
        setState((current) => {
          if (current.source === "live" && current.offers.length && isFreshTimestamp(current.checkedAt)) {
            return {
              ...current,
              loading: false,
              notice: data.notice,
              error: data.error || (!response.ok ? `HTTP ${response.status}` : "Brak aktualnych ofert z feedu."),
            };
          }

          const cached = readCache(endpoint);
          return {
            offers: cached?.offers || [],
            source: "fallback",
            loading: false,
            checkedAt: cached?.checkedAt || data.checkedAt,
            notice: data.notice,
            error: data.error || (!response.ok ? `HTTP ${response.status}` : "Brak aktualnych ofert z feedu."),
          };
        });
        tryBrowserEsky();
        return;
      }

      const checkedAt = data.checkedAt || new Date().toISOString();
      writeCache(endpoint, live, checkedAt);
      setState({
        offers: live,
        source: offerSourceIsLive(data.sourceType) ? "live" : "fallback",
        loading: false,
        checkedAt,
        notice: data.notice,
      });
      if (data.partial || !offerSourceIsLive(data.sourceType)) tryBrowserEsky();
    } catch (error) {
      setState((current) => {
        if (current.source === "live" && current.offers.length && isFreshTimestamp(current.checkedAt)) {
          return {
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : "Nie udało się pobrać aktualnych ofert.",
          };
        }

        const cached = readCache(endpoint);
        return {
          offers: cached?.offers || [],
          source: "fallback",
          loading: false,
          checkedAt: cached?.checkedAt,
          error: error instanceof Error ? error.message : "Nie udało się pobrać aktualnych ofert.",
        };
      });
    } finally {
      window.clearTimeout(timeout);
    }
  }, [endpoint]);

  useEffect(() => {
    const cached = readCache(endpoint);
    if (cached) {
      setState({
        offers: cached.offers,
        source: "fallback",
        loading: true,
        checkedAt: cached.checkedAt,
      });
    } else {
      // Endpoint changes when filters change. Never leave results from the
      // previous filter visible while the new request is loading.
      setState({
        offers: [],
        source: "fallback",
        loading: true,
      });
    }

    refresh();

    const handleFocus = () => refresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    const timer = refreshMs > 0 ? window.setInterval(refresh, refreshMs) : undefined;

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timer) window.clearInterval(timer);
    };
  }, [endpoint, refresh, refreshMs]);

  return { ...state, refresh };
}
