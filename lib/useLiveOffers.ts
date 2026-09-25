"use client";

import { useCallback, useEffect, useState } from "react";
import type { Offer } from "@/lib/offers";

type LiveOffersResponse = {
  ok?: boolean;
  checkedAt?: string;
  offers?: Offer[];
  notice?: string;
  error?: string;
  sourceType?: "live" | "published_fallback";
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
const MAX_CACHE_AGE_MS = 48 * 60 * 60 * 1000;

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

    return parsed;
  } catch {
    localStorage.removeItem(cacheKey(endpoint));
    return null;
  }
}

function writeCache(endpoint: string, offers: Offer[], checkedAt?: string) {
  if (typeof window === "undefined" || !offers.length) return;
  try {
    localStorage.setItem(cacheKey(endpoint), JSON.stringify({
      checkedAt,
      savedAt: new Date().toISOString(),
      offers,
    } satisfies CachedLiveOffers));
  } catch {}
}

export function useLiveOffers(endpoint = DEFAULT_ENDPOINT, refreshMs = 5 * 60 * 1000) {
  const [state, setState] = useState<LiveOffersState>({
    offers: [],
    source: "fallback",
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json() as LiveOffersResponse;
      const live = Array.isArray(data.offers) ? data.offers : [];

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
        return;
      }

      const checkedAt = data.checkedAt || new Date().toISOString();
      writeCache(endpoint, live, checkedAt);
      setState({
        offers: live,
        source: data.sourceType === "published_fallback" ? "fallback" : "live",
        loading: false,
        checkedAt,
        notice: data.notice,
      });
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
