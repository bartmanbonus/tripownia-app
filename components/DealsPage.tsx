"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";
import { isOfferExpired } from "@/lib/offerRuntime";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { getHistoricalPriceHighlight, recordDealPriceHistory } from "@/lib/dealPriceHistory";

type DealsOffer = Offer & { startDateISO?: string };

type PriceHighlight = {
  label: string;
  detail: string;
};

const AIRPORTS = [
  { value: "any", label: "Wszystkie lotniska" },
  { value: "WAWA", label: "Warszawa (WAW + WMI)" },
  { value: "KRK", label: "Kraków" },
  { value: "KTW", label: "Katowice" },
  { value: "GDN", label: "Gdańsk" },
  { value: "WRO", label: "Wrocław" },
  { value: "POZ", label: "Poznań" },
] as const;

const MONTH_NAMES = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];

const MONTH_OPTIONS = MONTH_NAMES.map((label, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label,
}));

function buildYearOptions(count = 3) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, index) => String(currentYear + index));
}

function cheapestUnique(rows: DealsOffer[]) {
  const best = new Map<string, DealsOffer>();

  rows
    .filter((offer) => offer && Number(offer.price) > 0)
    .filter((offer) => !isOfferExpired(offer))
    .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
    .forEach((offer) => {
      const key = touristDestinationKey(offer);
      const current = best.get(key);
      if (!current || Number(offer.price) < Number(current.price)) best.set(key, offer);
    });

  return Array.from(best.values())
    .sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 20);
}

function buildPoolHighlights(rows: DealsOffer[]) {
  const highlights = new Map<number, PriceHighlight>();
  if (rows.length < 5) return highlights;

  const prices = rows
    .map((offer) => Number(offer.price))
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);
  if (prices.length < 5) return highlights;

  const middle = Math.floor(prices.length / 2);
  const median = prices.length % 2
    ? prices[middle]
    : (prices[middle - 1] + prices[middle]) / 2;
  if (!Number.isFinite(median) || median <= 0) return highlights;

  const threshold = median * 0.82;
  rows
    .filter((offer) => Number(offer.price) <= threshold)
    .slice(0, 4)
    .forEach((offer) => {
      const belowMedian = Math.max(18, Math.round((1 - Number(offer.price) / median) * 100));
      highlights.set(offer.id, {
        label: "TOP CENA W PULI",
        detail: `${belowMedian}% poniżej mediany aktualnych okazji`,
      });
    });

  return highlights;
}

export default function DealsPage() {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearOptions = useMemo(() => buildYearOptions(3), []);
  const [airport, setAirport] = useState("any");
  const [month, setMonth] = useState("any");
  const [year, setYear] = useState("any");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (airport !== "any") params.set("from", airport);
    if (month !== "any") params.set("month", month);
    if (year !== "any") params.set("year", year);
    const query = params.toString();
    return query ? `/api/deals?${query}` : "/api/deals";
  }, [airport, month, year]);

  const { offers, source, loading, checkedAt, notice, refresh } = useLiveOffers(endpoint);
  const rows = useMemo(() => cheapestUnique(offers as DealsOffer[]), [offers]);
  const poolHighlights = useMemo(() => buildPoolHighlights(rows), [rows]);

  useEffect(() => {
    if (source !== "live" || !rows.length) return;
    const changed = recordDealPriceHistory(rows);
    if (changed) setHistoryVersion((value) => value + 1);
  }, [rows, source]);

  const priceHighlights = useMemo(() => {
    const result = new Map<number, PriceHighlight>();
    rows.forEach((offer) => {
      const historical = getHistoricalPriceHighlight(offer);
      if (historical) {
        result.set(offer.id, { label: historical.label, detail: historical.detail });
        return;
      }
      const pool = poolHighlights.get(offer.id);
      if (pool) result.set(offer.id, pool);
    });
    return result;
  }, [rows, poolHighlights, historyVersion]);

  const historicalCount = useMemo(() => {
    let count = 0;
    rows.forEach((offer) => {
      if (getHistoricalPriceHighlight(offer)) count += 1;
    });
    return count;
  }, [rows, historyVersion]);

  const checkedLabel = checkedAt
    ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(checkedAt))
    : "";

  const sourceCopy = loading && !offers.length
    ? "Sprawdzamy aktualne ceny…"
    : source === "live"
      ? `Aktualny feed${checkedLabel ? ` · ${checkedLabel}` : ""}`
      : offers.length
        ? "Ostatnia opublikowana pula · sprawdź cenę u partnera"
        : "Nie udało się potwierdzić aktualnej puli";

  const airportLabel = AIRPORTS.find((item) => item.value === airport)?.label || "Wszystkie lotniska";
  const monthLabel = MONTH_OPTIONS.find((item) => item.value === month)?.label || "dowolny miesiąc";
  const yearLabel = year === "any" ? "dowolny rok" : year;
  const filtering = airport !== "any" || month !== "any" || year !== "any";
  const filterSummary = filtering
    ? [airport !== "any" ? airportLabel : "", month !== "any" ? monthLabel : "", year !== "any" ? yearLabel : ""].filter(Boolean).join(" · ")
    : "Wszystkie lotniska · dowolny termin";

  const handleYearChange = (nextYear: string) => {
    setYear(nextYear);
    if (nextYear === String(currentYear) && month !== "any" && Number(month) < currentMonth) setMonth("any");
  };

  const clearFilters = () => {
    setAirport("any");
    setMonth("any");
    setYear("any");
  };

  return <main>
    <SiteHeader/>
    <section className="shell hub-page deals-hub-page">
      <div className="deals-hub-hero">
        <div>
          <div className="kicker">OKAZJE TRIPOWNI</div>
          <h1>Najpierw cena. Potem kierunek.</h1>
          <p className="hub-lead">Pokazujemy najtańszą aktualną ofertę dla każdego kierunku. Cena, termin i dostępność pochodzą z bieżącego feedu partnera.</p>
        </div>
        <div className="deals-hub-actions">
          <Link className="primary-cta" href="/#wyszukiwarka"><Search size={17}/> Wyszukaj dokładniej</Link>
          <button className="secondary-cta" type="button" onClick={refresh} disabled={loading}><RefreshCw size={16}/>{loading ? "Odświeżamy…" : "Odśwież ceny"}</button>
        </div>
      </div>

      <div className="deals-mobile-toolbar">
        <button
          type="button"
          className={`deals-filter-toggle${filtersOpen ? " is-open" : ""}`}
          onClick={() => setFiltersOpen((value) => !value)}
          aria-expanded={filtersOpen}
          aria-controls="deals-filters"
        >
          <SlidersHorizontal size={17}/>
          <span><strong>Filtry</strong><small>{filterSummary}</small></span>
        </button>
        <button type="button" className="deals-mobile-refresh" onClick={refresh} disabled={loading} aria-label="Odśwież ceny">
          <RefreshCw size={17} className={loading ? "is-spinning" : ""}/>
        </button>
      </div>

      <div id="deals-filters" className={`deals-filter-panel${filtersOpen ? " is-open" : ""}`} aria-label="Filtry okazji Tripowni">
        <label>
          <span><MapPin size={15}/> Lotnisko wylotu</span>
          <select value={airport} onChange={(event) => setAirport(event.target.value)}>
            {AIRPORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span><CalendarDays size={15}/> Miesiąc</span>
          <select value={month} onChange={(event) => setMonth(event.target.value)}>
            <option value="any">Wszystkie miesiące</option>
            {MONTH_OPTIONS.map((item) => {
              const disabled = year === String(currentYear) && Number(item.value) < currentMonth;
              return <option key={item.value} value={item.value} disabled={disabled}>{item.label}</option>;
            })}
          </select>
        </label>
        <label>
          <span><CalendarDays size={15}/> Rok</span>
          <select value={year} onChange={(event) => handleYearChange(event.target.value)}>
            <option value="any">Wszystkie lata</option>
            {yearOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        {filtering && <button type="button" className="deals-clear-filters" onClick={clearFilters}>Wyczyść filtry</button>}
      </div>

      <div className="deals-trust-bar">
        <span className="deals-trust-primary"><Sparkles size={15}/><strong>{loading && !rows.length ? "Sprawdzamy oferty…" : `${rows.length} ${rows.length === 1 ? "kierunek" : "kierunków"}`}</strong></span>
        <span className="deals-trust-detail">{historicalCount ? `${historicalCount} historycznych minimów` : priceHighlights.size ? `${priceHighlights.size} cen wyraźnie poniżej mediany puli` : "Oferty od najniższej ceny"}</span>
        <span className="deals-trust-detail">{filtering ? `${airportLabel} · ${monthLabel} · ${yearLabel}` : "Wszystkie dostępne lotniska i terminy"}</span>
        <span className="deals-trust-source">{sourceCopy}</span>
      </div>

      {notice && <div className="deals-filter-notice">{notice}</div>}

      {rows.length > 0 ? (
        <>
          <div className="deals-results-heading">
            <div><span>AKTUALNE OFERTY</span><h2>{filtering ? "Najlepsze dopasowania" : "Najlepsze ceny teraz"}</h2></div>
            <p>{source === "live" ? "Kliknięcie w ofertę prowadzi do propozycji u partnera." : "Pokazujemy opublikowaną pulę Tripowni. Aktualną cenę i dostępność potwierdzisz u partnera po kliknięciu."}</p>
          </div>
          <div className="cards-grid deals-premium-grid">{rows.map((offer) => <OfferCard key={offer.id} offer={offer} priceHighlight={priceHighlights.get(offer.id)}/>)}</div>
        </>
      ) : !loading ? (
        <div className="self-search-empty">
          <strong>Nie mamy teraz potwierdzonych okazji w tej puli.</strong>
          <span>Spróbuj odświeżyć dane lub zmienić jeden filtr. Tripownia nie podmieni ceny na statyczną.</span>
        </div>
      ) : null}

      <div className="deals-end-cta"><div><strong>Chcesz zawęzić jeszcze bardziej?</strong><span>W głównej wyszukiwarce ustawisz też kierunek, budżet, długość pobytu, weekend i wyżywienie.</span></div><Link href="/#wyszukiwarka">Przejdź do wyszukiwarki <ArrowRight size={16}/></Link></div>
    </section>
    <SiteFooter/>
  </main>;
}