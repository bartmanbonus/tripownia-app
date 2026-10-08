"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";
import { getLinkMatch } from "@/lib/offers";
import { isPriceStale } from "@/lib/offerQuality";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { getHistoricalPriceHighlight, recordDealPriceHistory } from "@/lib/dealPriceHistory";
import { trackEvent } from "@/lib/analytics";
import { eskySearchUrl } from "@/lib/eskySearch";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ReadySearchGrid, { type ReadySearchItem } from "@/components/ReadySearchGrid";

type DealsOffer = Offer & { startDateISO?: string };

type PriceHighlight = {
  label: string;
  detail: string;
};

type QuickFilter = "all" | "city" | "allinclusive" | "sun" | "under2000" | "flight" | "package";
type SortMode = "sales" | "mix" | "priceAsc" | "priceDesc" | "shortest";

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

function dedupedOfferRows(rows: DealsOffer[]) {
  const unique = new Map<number, DealsOffer>();
  rows
    .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
    .forEach((offer) => {
      const current = unique.get(offer.id);
      if (!current || Number(offer.price) < Number(current.price)) unique.set(offer.id, offer);
    });
  return Array.from(unique.values());
}

function priceSort(rows: DealsOffer[]) {
  return [...rows].sort((a, b) => Number(a.price) - Number(b.price) || Number(b.score || 0) - Number(a.score || 0));
}

function purchaseReadinessScore(offer: DealsOffer) {
  const link = getLinkMatch(offer);
  let score = Number(offer.score || 0) * 2;

  if (offer.availabilityStatus === "available") score += 18;
  if (offer.availabilityStatus === "expired") score -= 100;

  if (link === "exact") score += 24;
  else if (link === "parameters") score += 14;
  else if (link === "destination") score += 5;
  else score -= 20;

  if (offer.priceCheckedAt && !isPriceStale(offer.priceCheckedAt, 0.25)) score += 16;
  if (offer.hotel && !/hotel\s*[2345]★?/i.test(offer.hotel)) score += 5;
  if (offer.board && !/wg oferty|bez informacji/i.test(offer.board)) score += 4;
  if (offer.departure && offer.airportCode) score += 3;
  if (offer.nights >= 2 && offer.nights <= 9) score += 2;

  // Price still matters, but it should not beat a stale or generic offer.
  const price = Number(offer.price || 0);
  if (price > 0 && price <= 1500) score += 6;
  else if (price <= 2500) score += 4;
  else if (price <= 4000) score += 2;

  return score;
}

function salesSort(rows: DealsOffer[]) {
  return [...rows].sort((a, b) =>
    purchaseReadinessScore(b) - purchaseReadinessScore(a)
    || Number(a.price) - Number(b.price)
    || Number(b.score || 0) - Number(a.score || 0)
  );
}

function diversifiedOfferRows(rows: DealsOffer[]) {
  const source = priceSort(dedupedOfferRows(rows));
  const flights = source.filter((offer) => offer.category.includes("flight"));
  const cityPackages = source.filter((offer) => !offer.category.includes("flight") && (offer.category.includes("city") || offer.category.includes("weekend")));
  const holidays = source.filter((offer) => !offer.category.includes("flight") && !offer.category.includes("city") && !offer.category.includes("weekend"));
  const buckets = [flights, cityPackages, holidays];
  const output: DealsOffer[] = [];
  let cursor = 0;

  while (buckets.some((bucket) => bucket.length)) {
    const bucket = buckets[cursor % buckets.length];
    if (bucket.length) output.push(bucket.shift()!);
    cursor++;
  }
  return output;
}

function allOfferRows(rows: DealsOffer[], sortMode: SortMode) {
  const unique = dedupedOfferRows(rows);
  if (sortMode === "sales") return salesSort(unique);
  if (sortMode === "mix") return diversifiedOfferRows(unique);
  if (sortMode === "priceDesc") return priceSort(unique).reverse();
  if (sortMode === "shortest") return [...unique].sort((a, b) => Number(a.nights) - Number(b.nights) || Number(a.price) - Number(b.price));
  return priceSort(unique);
}

function destinationOfferRows(rows: DealsOffer[], sortMode: SortMode) {
  return allOfferRows(rows, sortMode === "mix" ? "priceAsc" : sortMode);
}

function offerCountLabel(count: number) {
  if (count === 1) return "1 oferta";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${count} oferty`;
  return `${count} ofert`;
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
  pageTitle = "Aktualne okazje gotowe do sprawdzenia.",
  pageLead = "Najwyżej pokazujemy oferty z najlepszym połączeniem aktualności, konkretnego linku, pełnych danych i ceny. Jeśli chcesz, jednym kliknięciem posortujesz wyłącznie po najniższej cenie.",
  kicker = "OKAZJE TRIPOWNI",
  initialOffers = [],
  readySearchItems = [],
}: {
  destination?: string;
  dealType?: "" | "allinclusive";
  pageTitle?: string;
  pageLead?: string;
  kicker?: string;
  initialOffers?: Offer[];
  readySearchItems?: ReadySearchItem[];
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
  const [sortMode, setSortMode] = useState<SortMode>("sales");

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

  const { offers, source, loading, checkedAt, notice, refresh } = useLiveOffers(
    endpoint,
    5 * 60 * 1000,
    endpoint === "/api/deals" ? initialOffers : []
  );
  const todayOffers: Offer[] = [];
  const todayLoading = false;
  const todayCheckedAt: string | null = null;
  const quickFilteredOffers = useMemo(() => {
    const sourceRows = offers as DealsOffer[];
    if (quickFilter === "city") return sourceRows.filter((offer) => offer.category.includes("city") || offer.category.includes("weekend"));
    if (quickFilter === "allinclusive") return sourceRows.filter((offer) => offer.category.includes("allinclusive"));
    if (quickFilter === "sun") return sourceRows.filter((offer) => offer.category.includes("cieplo") || offer.category.includes("plaza"));
    if (quickFilter === "under2000") return sourceRows.filter((offer) => Number(offer.price) <= 2000);
    if (quickFilter === "flight") return sourceRows.filter((offer) => offer.category.includes("flight"));
    if (quickFilter === "package") return sourceRows.filter((offer) => !offer.category.includes("flight"));
    return sourceRows;
  }, [offers, quickFilter]);
  const rows = useMemo(
    () => destination
      ? destinationOfferRows(quickFilteredOffers, sortMode)
      : allOfferRows(quickFilteredOffers, sortMode),
    [quickFilteredOffers, source, destination, sortMode]
  );
  const destinationHotelHref = useMemo(
    () => destination ? `/hotele?q=${encodeURIComponent(destination)}` : "",
    [destination]
  );
  const destinationPackageHref = useMemo(() => {
    if (!destination) return "";
    const target = eskySearchUrl({ query: destination });
    const params = new URLSearchParams({
      partner: "esky",
      target,
      source: "deals_empty_package",
      destination,
      page: "/okazje",
    });
    return `/go/live?${params.toString()}`;
  }, [destination]);
  const destinationMonthSearches = useMemo(() => {
    if (!destination) return [];

    const monthSlots = month !== "any" && year !== "any"
      ? [{ year: Number(year), month: Number(month) }]
      : Array.from({ length: 12 }, (_, index) => {
          const date = new Date(currentYear, currentMonth - 1 + index, 1);
          return { year: date.getFullYear(), month: date.getMonth() + 1 };
        });

    const stayVariants = [
      { minNights: 4, maxNights: 6, stayLabel: "4–6 nocy" },
      { minNights: 7, maxNights: 9, stayLabel: "7–9 nocy" },
      { minNights: 10, maxNights: 14, stayLabel: "10–14 nocy" },
    ];

    return monthSlots.flatMap(({ year: searchYear, month: searchMonth }) => {
      const monthValue = String(searchMonth).padStart(2, "0");
      const lastDay = new Date(searchYear, searchMonth, 0).getDate();
      const start = `${searchYear}-${monthValue}-01`;
      const end = `${searchYear}-${monthValue}-${String(lastDay).padStart(2, "0")}`;
      const monthLabel = `${MONTH_NAMES[searchMonth - 1]} ${searchYear}`;

      return stayVariants.map(({ minNights, maxNights, stayLabel }) => {
        const target = eskySearchUrl({
          query: destination,
          start,
          end,
          minNights,
          maxNights,
          departure: airport !== "any" ? airport : "",
        });
        const params = new URLSearchParams({
          partner: "esky",
          target,
          source: "destination_month_fallback",
          destination,
          page: "/okazje",
        });
        return {
          key: `${searchYear}-${monthValue}-${minNights}-${maxNights}`,
          label: monthLabel,
          stayLabel,
          href: `/go/live?${params.toString()}`,
        };
      });
    });
  }, [destination, currentYear, currentMonth, airport, month, year]);
  const destinationAlternativeSearches = useMemo(() => {
    if (!destination || !rows.length) return [];

    const primary = rows[0];
    const primaryNights = Math.max(1, Number(primary.nights) || 3);
    const rawBaseDate = month !== "any" && year !== "any"
      ? new Date(Number(year), Number(month) - 1, 1)
      : primary.startDateISO
        ? new Date(primary.startDateISO)
        : new Date(currentYear, currentMonth - 1, 1);
    const baseDate = Number.isNaN(rawBaseDate.getTime())
      ? new Date(currentYear, currentMonth - 1, 1)
      : rawBaseDate;

    const stayVariants = primaryNights <= 3
      ? [
          { minNights: 2, maxNights: 3, stayLabel: "2–3 noce" },
          { minNights: 4, maxNights: 5, stayLabel: "4–5 nocy" },
          { minNights: 6, maxNights: 7, stayLabel: "6–7 nocy" },
        ]
      : primaryNights <= 6
        ? [
            { minNights: 2, maxNights: 3, stayLabel: "2–3 noce" },
            { minNights: 4, maxNights: 6, stayLabel: "4–6 nocy" },
            { minNights: 7, maxNights: 9, stayLabel: "7–9 nocy" },
          ]
        : [
            { minNights: 4, maxNights: 6, stayLabel: "4–6 nocy" },
            { minNights: 7, maxNights: 9, stayLabel: "7–9 nocy" },
            { minNights: 10, maxNights: 14, stayLabel: "10–14 nocy" },
          ];

    return Array.from({ length: 3 }, (_, index) => {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + index, 1);
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }).flatMap(({ year: searchYear, month: searchMonth }) => {
      const monthValue = String(searchMonth).padStart(2, "0");
      const lastDay = new Date(searchYear, searchMonth, 0).getDate();
      const start = `${searchYear}-${monthValue}-01`;
      const end = `${searchYear}-${monthValue}-${String(lastDay).padStart(2, "0")}`;
      const monthLabel = `${MONTH_NAMES[searchMonth - 1]} ${searchYear}`;

      return stayVariants.map(({ minNights, maxNights, stayLabel }) => {
        const target = eskySearchUrl({
          query: destination,
          start,
          end,
          minNights,
          maxNights,
          departure: airport !== "any" ? airport : "",
        });
        const params = new URLSearchParams({
          partner: "esky",
          target,
          source: "destination_alternative",
          destination,
          page: "/okazje",
        });
        return {
          key: `alt-${searchYear}-${monthValue}-${minNights}-${maxNights}`,
          label: monthLabel,
          stayLabel,
          href: `/go/live?${params.toString()}`,
        };
      });
    }).slice(0, 6);
  }, [destination, rows, airport, month, year, currentYear, currentMonth]);
  const todayRows = useMemo(() => allOfferRows(todayOffers as DealsOffer[], "priceAsc").slice(0, 5), [todayOffers]);
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
        : destination
          ? `${destinationMonthSearches.length} gotowych opcji · sprawdź dostępność`
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
            {loading
              ? "Sprawdzamy aktualne oferty. Zapisane wyniki mogą być widoczne podczas odświeżania."
              : source === "fallback" && offers.length
              ? "Pokazujemy zapisane propozycje — sprawdź aktualną cenę i dostępność u partnera."
              : destination
                ? (rows.length
                    ? "Pokazujemy tylko aktualne oferty dla tego kierunku — bez przypadkowych zamienników."
                    : "Jeśli feed nie zwraca dziś gotowej karty, pokazujemy kilka gotowych wariantów na każdy miesiąc — bez pustej strony.")
                : "Pokazujemy całą aktualną pulę bez sztucznego limitu. Domyślnie wyżej są oferty najbardziej gotowe do rezerwacji; możesz przełączyć sortowanie na samą cenę."}
          </p>
        </div>
        <Link className="primary-cta deals-simple-search" href="/#wyszukiwarka">
          <Search size={16}/> Wyszukaj po swojemu
        </Link>
      </div>

      {readySearchItems.length > 0 && (
        <section className="deals-ready-searches">
          <div className="section-heading">
            <div>
              <div className="kicker">GOTOWE WYSZUKIWANIA</div>
              <h2>Wybierz konkretny wariant</h2>
              <p>Lotnisko, budżet i długość pobytu są już ustawione. Kliknięcie uruchamia wyniki, nie kolejną stronę kategorii.</p>
            </div>
          </div>
          <ReadySearchGrid items={readySearchItems} />
        </section>
      )}

      <div className="deals-simple-controls">
        <div className="deals-simple-topline">
          <div className="deals-quick-filters" aria-label="Szybkie filtry okazji">
            {([
              ["all", "Wszystkie"],
              ["city", "City break"],
              ["allinclusive", "All inclusive"],
              ["sun", "Ciepło"],
              ["under2000", "Do 2000 zł"],
              ["flight", "Sam lot"],
              ["package", "Pakiety"],
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

          <div className="deals-sort-refresh">
            <label className="deals-sort-control">
              <span>Sortuj</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                <option value="sales">Największa szansa zakupu</option>
                <option value="mix">Polecany miks</option>
                <option value="priceAsc">Cena: od najniższej</option>
                <option value="priceDesc">Cena: od najwyższej</option>
                <option value="shortest">Najkrótszy wyjazd</option>
              </select>
            </label>
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
              : destination
                ? (rows.length ? offerCountLabel(rows.length) : `${destinationMonthSearches.length} gotowych opcji`)
                : rows.length + " " + (rows.length === 1 ? "oferta" : "ofert")}
          </strong>
          <span>{filtering ? filterSummary : "Wszystkie lotniska · dowolny termin"}</span>
        </div>
        <small>{sourceCopy}</small>
      </div>

      {notice && <div className="deals-filter-notice">{notice}</div>}

      {rows.length > 0 ? (
        <>
          <div className="cards-grid deals-premium-grid deals-simple-grid">
            {rows.map((offer) => (
              <OfferCard key={offer.id} offer={offer} priceHighlight={priceHighlights.get(offer.id)} sourceSurface="okazje" />
            ))}
          </div>
          {destination && (
            <>
              <div className="deals-more-destination deals-full-pool-note">
                <div>
                  <strong>Pokazujemy pełną pulę, którą zwracają podpięte źródła dla: {destination}.</strong>
                  <span>Nie ukrywamy dalszych ofert za przyciskiem „więcej” i nie przenosimy Cię do partnera po samą listę.</span>
                </div>
              </div>

              {destinationAlternativeSearches.length > 0 && (
                <section className="destination-monthly-results" aria-label={"Inne warianty dla " + destination}>
                  <div className="destination-monthly-head">
                    <div>
                      <strong>Sprawdź też inne terminy</strong>
                      <span>Najpierw pokazujemy konkretną aktualną ofertę. Poniżej dajemy alternatywne terminy i długości pobytu — bez podawania ceny, dopóki partner jej nie potwierdzi.</span>
                    </div>
                  </div>
                  <div className="destination-monthly-grid">
                    {destinationAlternativeSearches.map((item) => (
                      <a
                        className="destination-month-card"
                        key={item.key}
                        href={item.href}
                        rel="sponsored"
                        onClick={() => trackEvent("destination_alternative_click", { destination, variant: item.key })}
                      >
                        <div className="destination-month-card-top">
                          <span className="destination-month-card-badge">INNY WARIANT</span>
                          <CalendarDays size={18}/>
                        </div>
                        <div className="destination-month-card-main">
                          <small>{destination}</small>
                          <strong>{item.label}</strong>
                          <span>{item.stayLabel} · sprawdź dostępność i aktualną cenę</span>
                        </div>
                        <div className="destination-month-card-cta">
                          Zobacz wariant <ArrowRight size={16}/>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      ) : !loading ? (
        destination ? (
          <section className="destination-monthly-results" aria-label={"Gotowe miesięczne wyszukiwania dla " + destination}>
            <div className="destination-monthly-head">
              <div>
                <strong>{destinationMonthSearches.length} gotowych opcji dla: {destination}</strong>
                <span>
                  {month !== "any" && year !== "any"
                    ? "Dla wybranego miesiąca pokazujemy 3 długości pobytu: krótki, tygodniowy i dłuższy."
                    : "Na każdy z kolejnych 12 miesięcy pokazujemy 3 długości pobytu: 4–6, 7–9 i 10–14 nocy."}
                </span>
              </div>
            </div>
            <div className="destination-monthly-grid">
              {destinationMonthSearches.map((item) => (
                <a
                  className="destination-month-card"
                  key={item.key}
                  href={item.href}
                  rel="sponsored"
                  onClick={() => trackEvent("destination_month_fallback_click", { destination, month: item.key })}
                >
                  <div className="destination-month-card-top">
                    <span className="destination-month-card-badge">LOT + HOTEL</span>
                    <CalendarDays size={18}/>
                  </div>
                  <div className="destination-month-card-main">
                    <small>{destination}</small>
                    <strong>{item.label}</strong>
                    <span>{item.stayLabel} · sprawdź aktualne ceny i terminy</span>
                  </div>
                  <div className="destination-month-card-cta">
                    Sprawdź oferty <ArrowRight size={16}/>
                  </div>
                </a>
              ))}
            </div>
            <div className="deals-empty-actions">
              <a href={destinationPackageHref} rel="sponsored">🧳 Sprawdź lot + hotel</a>
              <Link href={"/loty?destination=" + encodeURIComponent(destination)}>✈️ Loty</Link>
              <Link href={destinationHotelHref}>🏨 Hotele</Link>
            </div>
          </section>
        ) : (
          <div className="self-search-empty deals-simple-empty">
            <strong>Brak ofert dla tych filtrów.</strong>
            <span>Zmień jeden filtr albo wyczyść ustawienia — nie pokazujemy sztucznych wyników.</span>
          </div>
        )
      ) : null}

      {!destination && <FacebookFollowCTA placement="deals_after_results" compact />}

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

      .deals-sort-refresh {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
      }

      .deals-sort-control {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 12px;
        font-weight: 800;
        color: #6b7280;
      }

      .deals-sort-control select {
        height: 38px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background: #fff;
        padding: 0 9px;
        color: #111827;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
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

      .deals-more-destination{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:16px;padding:14px 16px;border:1px solid #e6e2df;border-radius:15px;background:#faf8f6}.deals-more-destination>div{display:grid;gap:3px}.deals-more-destination strong{color:#24211f;font-size:14px}.deals-more-destination span{color:#74706c;font-size:12px}.deals-more-destination>a{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 13px;border-radius:11px;background:#111827;color:#fff;font-size:13px;font-weight:850;text-decoration:none}
      .destination-month-fallback{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%;margin-top:14px}.destination-month-fallback a{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px;padding:0 12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;color:#111827;font-size:13px;font-weight:800;text-decoration:none}.destination-month-fallback a:hover{border-color:#111827}
      .destination-monthly-results{display:grid;gap:18px;margin-top:18px}.destination-monthly-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end}.destination-monthly-head>div{display:grid;gap:5px}.destination-monthly-head strong{font-size:20px;color:#1f2937}.destination-monthly-head span{font-size:13px;color:#6b7280;max-width:760px;line-height:1.5}.destination-monthly-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.destination-month-card{display:grid;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:16px;background:#fff;color:#111827;text-decoration:none;box-shadow:0 8px 22px rgba(17,24,39,.06);transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}.destination-month-card:hover{transform:translateY(-2px);border-color:#9ca3af;box-shadow:0 12px 28px rgba(17,24,39,.1)}.destination-month-card-top{display:flex;justify-content:space-between;align-items:center}.destination-month-card-badge{font-size:11px;font-weight:900;letter-spacing:.06em;color:#9a3412;background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;padding:5px 8px}.destination-month-card-main{display:grid;gap:4px}.destination-month-card-main small{font-size:12px;color:#6b7280}.destination-month-card-main strong{font-size:18px}.destination-month-card-main span{font-size:12px;line-height:1.45;color:#6b7280}.destination-month-card-cta{display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:900;color:#111827}

      .deals-facebook-cta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-top: 26px;
        padding: 18px 20px;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        background: #f9fafb;
      }

      .deals-facebook-cta > div {
        display: grid;
        gap: 3px;
      }

      .deals-facebook-cta strong {
        font-size: 16px;
      }

      .deals-facebook-cta span {
        color: #6b7280;
        font-size: 13px;
        line-height: 1.45;
      }

      .deals-facebook-cta a {
        flex: 0 0 auto;
        font-weight: 800;
        text-decoration: none;
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

        .deals-sort-refresh {
          width: 100%;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .deals-sort-control {
          width: 100%;
          justify-content: space-between;
        }

        .deals-sort-control select {
          flex: 1;
          max-width: 220px;
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

        .deals-more-destination{display:grid;gap:10px}.deals-more-destination>a{width:100%;justify-content:center}
        .destination-month-fallback{grid-template-columns:1fr 1fr}
        .destination-monthly-grid{grid-template-columns:1fr 1fr}

        .deals-facebook-cta {
          display: grid;
          gap: 12px;
          padding: 16px;
        }

        .deals-facebook-cta a {
          display: inline-flex;
        }

        .deals-simple-bottom {
          display: grid;
          text-align: center;
        }
      }
    `}</style>
  </main>;
}