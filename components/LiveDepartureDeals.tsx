"use client";

import { isPromotableOffer } from "@/lib/offerValuePolicy";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
import { offers, isOfferExpired, type Offer } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { trackEvent } from "@/lib/analytics";
import styles from "./LiveDepartureDeals.module.css";

type Props = { airportCodes?: string[]; weekendOnly?: boolean; limit?: number };
type ViewMode = "best" | "cheap" | "city" | "holiday";

function uniqueDirections(rows: Offer[]) {
  const seen = new Set<string>();
  return [...rows].sort((a, b) => a.price - b.price).filter((offer) => {
    const key = touristDestinationKey(offer);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeAirportText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchesAirport(offer: Offer, codes: string[]) {
  if (!codes.length) return true;
  const haystack = normalizeAirportText(`${offer.departure || ""} ${offer.airportCode || ""}`);
  return codes.some((code) => {
    if (code === "WAW") return /warszawa|chopin|okecie|\bwaw\b/.test(haystack) && !/modlin|radom|\brdo\b/.test(haystack);
    if (code === "WMI") return /modlin|\bwmi\b/.test(haystack);
    if (code === "KRK") return /krakow|balice|\bkrk\b/.test(haystack);
    return haystack.includes(code.toLowerCase());
  });
}

export default function LiveDepartureDeals({ airportCodes = [], weekendOnly = false, limit = 18 }: Props) {
  const [rows, setRows] = useState<Offer[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [viewMode, setViewMode] = useState<ViewMode>("best");

  const airportParam = airportCodes.join(",");
  const sourceSurface = airportCodes.includes("KRK")
    ? "departure_hub_krakow"
    : airportCodes.some((code) => code === "WAW" || code === "WMI")
      ? "departure_hub_warsaw"
      : "departure_hub";

  useEffect(() => {
    let active = true;

    const load = async () => {
      const controller = new AbortController();
      const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Warsaw",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const params = new URLSearchParams({ key, mode: "search", hub: "1", refresh: String(Date.now()) });
      if (airportParam) params.set("from", airportParam);

      try {
        const response = await fetch("/api/today-offers?" + params.toString(), { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        const result = Array.isArray(data?.offers) ? data.offers as Offer[] : [];
        if (response.ok && data?.ok !== false && result.length) {
          if (active) {
            setRows(result);
            setStatus("live");
          }
          return;
        }

        // Some partner feeds temporarily return no results for a broad airport query
        // even though the daily pool still contains a verified departure from that airport.
        const dailyResponse = await fetch(`/api/today-offers?key=${encodeURIComponent(key)}&refresh=${Date.now()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const dailyData = await dailyResponse.json();
        const dailyRows = Array.isArray(dailyData?.offers) ? dailyData.offers as Offer[] : [];
        const airportRows = dailyRows.filter((offer) => matchesAirport(offer, airportCodes));
        if (dailyResponse.ok && airportRows.length) {
          if (active) {
            setRows(airportRows);
            setStatus("live");
          }
          return;
        }

        throw new Error("today-offers");
      } catch {
        if (!active) return;
        setRows(offers);
        setStatus("fallback");
      }
    };

    void load();
    const timer = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [airportParam]);

  const available = useMemo(() => {
    const result = rows
      .filter((offer) => offer && offer.id && offer.price > 0 && offer.affiliateUrl)
      .filter((offer) => !isOfferExpired(offer) && isPromotableOffer(offer))
      .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
      .filter((offer) => matchesAirport(offer, airportCodes))
      .filter((offer) => !weekendOnly || (offer.nights >= 2 && offer.nights <= 4));

    return uniqueDirections(result);
  }, [rows, airportParam, weekendOnly, status]);

  const counts = useMemo(() => ({
    best: available.length,
    cheap: available.length,
    city: available.filter((offer) => offer.nights >= 2 && offer.nights <= 4).length,
    holiday: available.filter((offer) => offer.nights >= 5).length,
  }), [available]);

  const filtered = useMemo(() => {
    let result = [...available];

    if (viewMode === "city") {
      result = result.filter((offer) => offer.nights >= 2 && offer.nights <= 4);
      result.sort((a, b) => a.price - b.price || b.score - a.score);
    } else if (viewMode === "holiday") {
      result = result.filter((offer) => offer.nights >= 5);
      result.sort((a, b) => a.price - b.price || b.score - a.score);
    } else if (viewMode === "cheap") {
      result.sort((a, b) => a.price - b.price || b.score - a.score);
    } else {
      result.sort((a, b) => a.price - b.price || b.score - a.score);
    }

    return result.slice(0, limit);
  }, [available, viewMode, limit]);

  function chooseView(next: ViewMode) {
    setViewMode(next);
    trackEvent("departure_hub_filter_click", {
      source_surface: sourceSurface,
      filter: next,
      airports: airportParam || "all",
    });
  }

  if (status === "loading") return (
    <div className={styles.loadingGrid} aria-label="Ładowanie aktualnych ofert">
      {[0,1,2].map((item) => (
        <div className={styles.skeletonCard} key={item} aria-hidden="true">
          <div className={styles.skeletonImage}/>
          <div className={styles.skeletonBody}>
            <span/><strong/><span/><button type="button" tabIndex={-1}/>
          </div>
        </div>
      ))}
    </div>
  );
  if (!available.length) return <div className={styles.empty}><strong>Nie ma teraz potwierdzonej oferty spełniającej te warunki.</strong><span>Nie podstawiamy starej ceny tylko po to, żeby zapełnić listę. Zajrzyj później albo ustaw alert.</span></div>;

  const cheapest = Math.min(...available.map((offer) => offer.price));

  return <>
    <div className={styles.toolbar}>
      <div className={styles.status}>
        <strong>{status === "live" ? "● aktualne oferty" : "ostatnio sprawdzone oferty"}</strong>
        <span>{available.length} kierunków · od {cheapest.toLocaleString("pl-PL")} zł/os.</span>
      </div>

      <div className={styles.filters} aria-label="Filtruj oferty z lotniska">
        <button type="button" className={viewMode === "best" ? styles.active : ""} onClick={() => chooseView("best")}>
          Najlepsze <span>{counts.best}</span>
        </button>
        <button type="button" className={viewMode === "cheap" ? styles.active : ""} onClick={() => chooseView("cheap")}>
          Najtaniej
        </button>
        <button type="button" disabled={!counts.city} className={viewMode === "city" ? styles.active : ""} onClick={() => chooseView("city")}>
          City break <span>{counts.city}</span>
        </button>
        <button type="button" disabled={!counts.holiday} className={viewMode === "holiday" ? styles.active : ""} onClick={() => chooseView("holiday")}>
          Wakacje <span>{counts.holiday}</span>
        </button>
      </div>
    </div>

    {!filtered.length ? (
      <div className={styles.empty}><strong>W tej kategorii nie ma teraz potwierdzonej oferty.</strong><span>Wybierz inny filtr powyżej — nie pokazujemy przypadkowych kierunków tylko po to, by zapełnić stronę.</span></div>
    ) : (
      <div className={styles.grid}>
        {filtered.map((offer) => (
          <OfferCard offer={offer} key={offer.id} sourceSurface={sourceSurface} />
        ))}
      </div>
    )}
  </>;
}
