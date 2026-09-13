"use client";

import { useCallback, useEffect, useState } from "react";
import { offers as fallbackOffers, type Offer } from "@/lib/offers";

type LiveOffersResponse = {
  ok?: boolean;
  checkedAt?: string;
  offers?: Offer[];
  notice?: string;
  error?: string;
};

type LiveOffersState = {
  offers: Offer[];
  source: "live" | "fallback";
  loading: boolean;
  checkedAt?: string;
  notice?: string;
  error?: string;
};

const DEFAULT_ENDPOINT = "/api/today-offers?mode=search&broad=1";

export function useLiveOffers(endpoint = DEFAULT_ENDPOINT, refreshMs = 5 * 60 * 1000) {
  const [state, setState] = useState<LiveOffersState>({
    offers: fallbackOffers,
    source: "fallback",
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json() as LiveOffersResponse;
      const live = Array.isArray(data.offers) ? data.offers : [];

      if (!response.ok || !live.length) {
        setState((current) => ({
          ...current,
          offers: current.source === "live" && current.offers.length ? current.offers : fallbackOffers,
          source: current.source === "live" && current.offers.length ? "live" : "fallback",
          loading: false,
          checkedAt: data.checkedAt || current.checkedAt,
          notice: data.notice,
          error: data.error || (!response.ok ? `HTTP ${response.status}` : "Brak aktualnych ofert z feedu."),
        }));
        return;
      }

      setState({
        offers: live,
        source: "live",
        loading: false,
        checkedAt: data.checkedAt || new Date().toISOString(),
        notice: data.notice,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        offers: current.source === "live" && current.offers.length ? current.offers : fallbackOffers,
        source: current.source === "live" && current.offers.length ? "live" : "fallback",
        loading: false,
        error: error instanceof Error ? error.message : "Nie udało się pobrać aktualnych ofert.",
      }));
    }
  }, [endpoint]);

  useEffect(() => {
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
  }, [refresh, refreshMs]);

  return { ...state, refresh };
}
