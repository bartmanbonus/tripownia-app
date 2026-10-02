"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { cheapestPerDestination as selectCheapestPerDestination } from "@/lib/offerEngine";
import { getHistoricalPriceHighlight, recordDealPriceHistory } from "@/lib/dealPriceHistory";
import { trackEvent } from "@/lib/analytics";

type DealsOffer = Offer & { startDateISO?: string };

type PriceHighlight = {
  label: string;
  detail: string;
};

type QuickFilter = "all" | "city" | "allinclusive" | "sun" | "under2000";

const AIRPORTS = [
  { value: "any", label: "Wszystkie lotniska" },
  { value: "WAWA", label: "Warszawa (WAW + WMI)" },
  { value: "KRK", label: "Kraków" },
  { value: "KTW", label: "Katowice" },
  { value: "GDN", label: "Gdańsk" },
  { value: "WRO", label: "Wrocław" },
  { value: "POZ", label: "Poznań" },
  { value: "RZE", label: "Rzeszów" },
  { value: "LCJ", label: "Łódź" },
  { value: "LUZ", label: "Lublin" },
  { value: "SZZ", label: "Szczecin" },
  { value: "BZG", label: "Bydgoszcz" },
  { value: "IEG", label: "Zielona Góra" },
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

function cheapestUnique(rows: DealsOffer[], liveOnly = true) {
  return selectCheapestPerDestination(
    rows.filter((offer) => isTravelDestinationAllowed(offer.city, offer.country)),
    { mode: liveOnly ? "live" : "fallback", limit: 20 }
  );
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

export default function DealsPage({
  destination = "",
  dealType = "",
  pageTitle = "Najpierw cena. Potem kierunek.",
  pageLead = "Pokazujemy najtańszą aktualną ofertę dla każdego kierunku. Cena, termin i dostępność są regularnie odświeżane.",
  kicker = "OKAZJE TRIPOWNI",
}: {
  destination?: string;
  dealType?: "" | "allinclusive";
  pageTitle?: string;
  pageLead?: string;
  kicker?: string;
}) {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearOptions = useMemo(() => buildYearOptions(3), []);
  const [airport, setAirport] = useState("any");
  const [month, setMonth] = useState("any");
  const [year, setYear] = useState("any");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(dealType === "allinclusive" ? "allinclusive" : "all");

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (destination) params.set("q", destination);
    if (dealType) params.set("type", dealType);
    if (airport !== "any") params.set("from", airport);
    if (month !== "any") params.set("month", month);
    if (year !== "any") params.set("year", year);
    const query = params.toString();
    return query ? `/api/deals?${query}` : "/api/deals";
  }, [destination, dealType, airport, month, year]);

  const { offers, source, loading, checkedAt, notice, refresh } = useLiveOffers(endpoint);
  const todayOffers: Offer[] = [];
  const todayLoading = false;
  const todayCheckedAt: string | null = null;
  const quickFilteredOffers = useMemo(() => {
    const sourceRows = offers as DealsOffer[];
    if (quickFilter === "city") return sourceRows.filter((offer) => offer.category.includes("city") || offer.category.includes("weekend"));
    if (quickFilter === "allinclusive") return sourceRows.filter((offer) => offer.category.includes("allinclusive"));
    if (quickFilter === "sun") return sourceRows.filter((offer) => offer.category.includes("cieplo") || offer.category.includes("plaza"));
    if (quickFilter === "under2000") return sourceRows.filter((offer) => Number(offer.price) <= 2000);
    return sourceRows;
  }, [offers, quickFilter]);
  const rows = useMemo(() => cheapestUnique(quickFilteredOffers, source === "live"), [quickFilteredOffers, source]);
  const destinationHotelHref = useMemo(
    () => destination ? `/hotele?q=${encodeURIComponent(destination)}` : "",
    [destination]
  );
  const todayRows = useMemo(() => cheapestUnique(todayOffers as DealsOffer[]).slice(0, 5), [todayOffers]);
  const poolHighlights = useMemo(() => source === "live" ? buildPoolHighlights(rows) : new Map<number, PriceHighlight>(), [rows, source]);

  useEffect(() => {
    if (source !== "live" || !rows.length) return;
    const changed = recordDealPriceHistory(rows);
    if (changed) setHistoryVersion((value) => value + 1);
  }, [rows, source]);

  const priceHighlights = useMemo(() => {
    const result = new Map<number, PriceHighlight>();
    if (source !== "live") return result;
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
  }, [rows, poolHighlights, historyVersion, source]);

  const isGenericDealsPage = !destination && dealType !== "allinclusive";
  const todayDirectionKeys = useMemo(
    () => new Set(todayRows.map((offer) => touristDestinationKey(offer))),
    [todayRows]
  );
  const featuredDeal = useMemo(() => {
    if (!rows.length) return undefined;
    if (!isGenericDealsPage) return rows[0];
    return rows.find((offer) => !todayDirectionKeys.has(touristDestinationKey(offer)));
  }, [rows, isGenericDealsPage, todayDirectionKeys]);
  const featuredDealExternal = Boolean(featuredDeal && /^https?:\/\//.test(featuredDeal.affiliateUrl || ""));
  const featuredDealHref = featuredDeal
    ? featuredDealExternal ? featuredDeal.affiliateUrl : `/oferta/${featuredDeal.id}`
    : "";
  const displayRows = useMemo(
    () => rows.filter((offer) => {
      if (featuredDeal?.id === offer.id) return false;
      if (isGenericDealsPage && todayDirectionKeys.has(touristDestinationKey(offer))) return false;
      return true;
    }),
    [rows, featuredDeal?.id, isGenericDealsPage, todayDirectionKeys]
  );

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

  const todayCheckedLabel = todayCheckedAt
    ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(todayCheckedAt))
    : "";

  const sourceCopy = loading && !offers.length
    ? "Sprawdzamy aktualne ceny…"
    : source === "live"
      ? `Aktualne${checkedLabel ? ` · ${checkedLabel}` : ""}`
      : offers.length
        ? "Ostatnio sprawdzone · potwierdź cenę przed rezerwacją"
        : "Brak aktualnych danych";

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
    <section className="shell deals-simple-page">
      <div className="deals-simple-hero">
        <div>
          <div className="kicker">{kicker}</div>
          <h1>{destination ? "Okazje: " + destination : "Najtańsze wyjazdy. Bez przekopywania się przez setki ofert."}</h1>
          <p className="deals-simple-lead">
            {source === "fallback" && offers.length
              ? "Źródła live są chwilowo ograniczone. Pokazujemy nieprzeterminowane propozycje orientacyjne — finalną cenę potwierdź u partnera."
              : destination
                ? "Pokazujemy tylko aktualne oferty dla tego kierunku — bez przypadkowych zamienników."
                : "Jedna najtańsza oferta na kierunek, bez duplikatów. Najtańsze pokazujemy jako pierwsze."}
          </p>
        </div>
        <Link className="primary-cta deals-simple-search" href="/#wyszukiwarka">
          <Search size={16}/> Wyszukaj po swojemu
        </Link>
      </div>

      <div className="deals-simple-controls">
        <div className="deals-simple-topline">
          <div className="deals-quick-filters" aria-label="Szybkie filtry okazji">
            {([
              ["all", "Wszystkie"],
              ["city", "City break"],
              ["allinclusive", "All inclusive"],
              ["sun", "Ciepło"],
              ["under2000", "Do 2000 zł"],
            ] as Array<[QuickFilter, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={quickFilter === value ? "active" : ""}
                onClick={() => {
                  setQuickFilter(value);
                  trackEvent("deals_quick_filter", { filter: value });
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="deals-simple-refresh"
            onClick={refresh}
            disabled={loading}
            aria-label="Odśwież ceny"
          >
            <RefreshCw size={16} className={loading ? "is-spinning" : ""}/>
            <span>{loading ? "Odświeżamy…" : "Odśwież"}</span>
          </button>
        </div>

        <button
          type="button"
          className={"deals-filter-toggle deals-simple-filter-toggle" + (filtersOpen ? " is-open" : "")}
          onClick={() => setFiltersOpen((value) => !value)}
          aria-expanded={filtersOpen}
          aria-controls="deals-filters"
        >
          <SlidersHorizontal size={17}/>
          <span><strong>Filtry</strong><small>{filterSummary}</small></span>
        </button>

        <div
          id="deals-filters"
          className={"deals-filter-panel deals-simple-filter-panel" + (filtersOpen ? " is-open" : "")}
          aria-label="Filtry okazji Tripowni"
        >
          <label>
            <span><MapPin size={15}/> Skąd</span>
            <select value={airport} onChange={(event) => setAirport(event.target.value)}>
              {AIRPORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label>
            <span><CalendarDays size={15}/> Kiedy</span>
            <select
              value={month === "any" || year === "any" ? "any" : year + "-" + month}
              onChange={(event) => {
                const next = event.target.value;
                if (next === "any") {
                  setMonth("any");
                  setYear("any");
                  return;
                }
                const [nextYear, nextMonth] = next.split("-");
                setYear(nextYear);
                setMonth(nextMonth);
              }}
            >
              <option value="any">Dowolny termin</option>
              {Array.from({ length: 15 }, (_, index) => {
                const date = new Date(currentYear, currentMonth - 1 + index, 1);
                const optionYear = String(date.getFullYear());
                const optionMonth = String(date.getMonth() + 1).padStart(2, "0");
                return (
                  <option key={optionYear + "-" + optionMonth} value={optionYear + "-" + optionMonth}>
                    {MONTH_NAMES[date.getMonth()]} {optionYear}
                  </option>
                );
              })}
            </select>
          </label>

          {filtering && (
            <button type="button" className="deals-clear-filters" onClick={clearFilters}>
              Wyczyść
            </button>
          )}

          <button
            type="button"
            className="deals-filter-apply"
            onClick={() => {
              setFiltersOpen(false);
              window.setTimeout(
                () => document.getElementById("deals-results-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }),
                80
              );
            }}
          >
            Pokaż wyniki
          </button>
        </div>
      </div>

      <div className="deals-simple-summary" id="deals-results-anchor">
        <div>
          <strong>
            {loading && !rows.length
              ? "Szukamy najlepszych cen…"
              : rows.length + " " + (rows.length === 1 ? "kierunek" : "kierunków")}
          </strong>
          <span>{filtering ? filterSummary : "Wszystkie lotniska · dowolny termin"}</span>
        </div>
        <small>{sourceCopy}</small>
      </div>

      {notice && <div className="deals-filter-notice">{notice}</div>}

      {rows.length > 0 ? (
        <div className="cards-grid deals-premium-grid deals-simple-grid">
          {rows.map((offer) => (
            <OfferCard key={offer.id} offer={offer} priceHighlight={priceHighlights.get(offer.id)} sourceSurface="okazje" />
          ))}
        </div>
      ) : !loading ? (
        <div className="self-search-empty deals-simple-empty">
          <strong>{destination ? "Brak aktualnej oferty dla: " + destination : "Brak ofert dla tych filtrów."}</strong>
          <span>
            {destination
              ? "Nie podstawiamy innego kierunku. Zmień termin albo sprawdź lot i hotel osobno."
              : "Zmień jeden filtr albo wyczyść ustawienia — nie pokazujemy sztucznych wyników."}
          </span>
          {destination && (
            <div className="deals-empty-actions">
              <Link href={"/loty?destination=" + encodeURIComponent(destination)}>✈️ Porównaj loty</Link>
              <Link href={destinationHotelHref}>🏨 Sprawdź hotele</Link>
            </div>
          )}
        </div>
      ) : null}

      <div className="deals-simple-bottom">
        <span>Nie widzisz nic dla siebie?</span>
        <Link href="/#wyszukiwarka">Ustaw kierunek, budżet i długość pobytu</Link>
      </div>
    </section>
    <SiteFooter/>

    <style jsx>{`
      .deals-simple-page {
        padding-top: 28px;
        padding-bottom: 36px;
      }

      .deals-simple-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 28px;
        padding: 12px 0 22px;
      }

      .deals-simple-hero h1 {
        margin: 8px 0 8px;
        max-width: 820px;
        font-size: clamp(32px, 4.2vw, 54px);
        line-height: 1.02;
        letter-spacing: -0.04em;
      }

      .deals-simple-lead {
        margin: 0;
        max-width: 720px;
        color: #5f6670;
        font-size: 16px;
        line-height: 1.55;
      }

      .deals-simple-search {
        flex: 0 0 auto;
        white-space: nowrap;
      }

      .deals-simple-controls {
        margin: 8px 0 16px;
        padding: 14px;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        background: #fff;
      }

      .deals-simple-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .deals-quick-filters {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
        padding-bottom: 1px;
      }

      .deals-quick-filters::-webkit-scrollbar {
        display: none;
      }

      .deals-quick-filters button {
        border: 1px solid #e5e7eb;
        background: #fff;
        border-radius: 999px;
        padding: 9px 13px;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
      }

      .deals-quick-filters button.active {
        border-color: #111827;
        background: #111827;
        color: #fff;
      }

      .deals-simple-refresh {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 0;
        background: transparent;
        color: #4b5563;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }

      .deals-simple-filter-toggle {
        display: none;
      }

      .deals-simple-filter-panel {
        display: grid;
        grid-template-columns: minmax(210px, 1fr) minmax(210px, 1fr) auto auto;
        align-items: end;
        gap: 10px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #eef0f2;
      }

      .deals-simple-filter-panel label {
        display: grid;
        gap: 6px;
      }

      .deals-simple-filter-panel label > span {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #6b7280;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .04em;
      }

      .deals-simple-filter-panel select {
        width: 100%;
        height: 44px;
        padding: 0 12px;
        border: 1px solid #dfe3e8;
        border-radius: 12px;
        background: #fff;
        color: #111827;
        font: inherit;
        font-weight: 650;
      }

      .deals-clear-filters,
      .deals-filter-apply {
        height: 44px;
        border-radius: 12px;
        padding: 0 14px;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .deals-clear-filters {
        border: 1px solid #e5e7eb;
        background: #fff;
      }

      .deals-filter-apply {
        display: none;
        border: 0;
        background: #111827;
        color: #fff;
      }

      .deals-simple-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin: 18px 0 12px;
      }

      .deals-simple-summary > div {
        display: flex;
        align-items: baseline;
        gap: 10px;
        min-width: 0;
      }

      .deals-simple-summary strong {
        font-size: 20px;
      }

      .deals-simple-summary span,
      .deals-simple-summary small {
        color: #737982;
        font-size: 13px;
      }

      .deals-simple-grid {
        margin-top: 0;
        gap: 16px;
      }

      .deals-simple-bottom {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
        padding: 18px;
        border-top: 1px solid #eceff2;
        color: #6b7280;
        font-size: 14px;
      }

      .deals-simple-bottom a {
        font-weight: 800;
      }

      @media (max-width: 820px) {
        .deals-simple-page {
          padding-top: 14px;
        }

        .deals-simple-hero {
          display: grid;
          gap: 14px;
          padding-bottom: 10px;
        }

        .deals-simple-hero h1 {
          font-size: clamp(30px, 10vw, 42px);
        }

        .deals-simple-search {
          width: 100%;
          justify-content: center;
        }

        .deals-simple-controls {
          padding: 10px;
          border-radius: 15px;
        }

        .deals-simple-topline {
          display: block;
        }

        .deals-simple-refresh {
          display: none;
        }

        .deals-simple-filter-toggle {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          padding: 11px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          text-align: left;
        }

        .deals-simple-filter-toggle span {
          display: grid;
          gap: 1px;
        }

        .deals-simple-filter-toggle small {
          color: #6b7280;
          font-size: 11px;
          font-weight: 500;
        }

        .deals-simple-filter-panel {
          display: none;
          grid-template-columns: 1fr;
          margin-top: 10px;
        }

        .deals-simple-filter-panel.is-open {
          display: grid;
        }

        .deals-filter-apply {
          display: block;
        }

        .deals-simple-summary {
          align-items: flex-start;
          margin-top: 14px;
        }

        .deals-simple-summary > div {
          display: grid;
          gap: 2px;
        }

        .deals-simple-summary small {
          display: none;
        }

        .deals-simple-grid {
          gap: 12px;
        }

        .deals-simple-bottom {
          display: grid;
          text-align: center;
        }
      }
    `}</style>
  </main>;
}