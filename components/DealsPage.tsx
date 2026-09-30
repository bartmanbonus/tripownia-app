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
import { trackEvent } from "@/lib/analytics";
import { partners } from "@/lib/partners";

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

export default function DealsPage({
  destination = "",
  dealType = "",
  pageTitle = "Najpierw cena. Potem kierunek.",
  pageLead = "Pokazujemy najtańszą aktualną ofertę dla każdego kierunku. Cena, termin i dostępność pochodzą z bieżącego feedu partnera.",
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
  const { offers: todayOffers, loading: todayLoading, checkedAt: todayCheckedAt } = useLiveOffers("/api/today-offers");
  const quickFilteredOffers = useMemo(() => {
    const sourceRows = offers as DealsOffer[];
    if (quickFilter === "city") return sourceRows.filter((offer) => offer.category.includes("city") || offer.category.includes("weekend"));
    if (quickFilter === "allinclusive") return sourceRows.filter((offer) => offer.category.includes("allinclusive"));
    if (quickFilter === "sun") return sourceRows.filter((offer) => offer.category.includes("cieplo") || offer.category.includes("plaza"));
    if (quickFilter === "under2000") return sourceRows.filter((offer) => Number(offer.price) <= 2000);
    return sourceRows;
  }, [offers, quickFilter]);
  const rows = useMemo(() => cheapestUnique(quickFilteredOffers), [quickFilteredOffers]);
  const destinationHotelHref = useMemo(() => {
    if (!destination) return "";
    const url = new URL("https://www.booking.com/searchresults.pl.html");
    url.searchParams.set("ss", destination);
    return partners.booking.buildUrl(url.toString());
  }, [destination]);
  const todayRows = useMemo(() => cheapestUnique(todayOffers as DealsOffer[]).slice(0, 5), [todayOffers]);
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

  const featuredDeal = rows[0];
  const featuredDealExternal = Boolean(featuredDeal && /^https?:\/\//.test(featuredDeal.affiliateUrl || ""));
  const featuredDealHref = featuredDeal
    ? featuredDealExternal ? featuredDeal.affiliateUrl : `/oferta/${featuredDeal.id}`
    : "";
  const featuredDealPartner = featuredDeal
    ? (partners[featuredDeal.partner]?.name || "partnera")
    : "";

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
          <div className="kicker">{kicker}</div>
          <h1>{destination ? `Oferty: ${destination}` : pageTitle}</h1>
          <p className="hub-lead">{destination ? `Aktualne, potwierdzone oferty dla kierunku ${destination}. Nie pokazujemy losowych krajów zamiast tego, którego szukasz.` : pageLead}</p>
        </div>
        <div className="deals-hub-actions">
          <Link className="primary-cta" href="/#wyszukiwarka"><Search size={16}/> Dokładne wyszukiwanie</Link>
          <button className="secondary-cta" type="button" onClick={refresh} disabled={loading}><RefreshCw size={15}/>{loading ? "Odświeżamy…" : "Odśwież"}</button>
        </div>
      </div>

      {!destination && dealType !== "allinclusive" && <><div className="deals-results-heading">
        <div><span>DZISIAJ W TRIPOWNI</span><h2>5 okazji, które warto sprawdzić dziś</h2></div>
        <p>{todayLoading && !todayRows.length ? "Szukamy dzisiejszych okazji…" : `Codzienna selekcja Tripowni${todayCheckedLabel ? ` · sprawdzone ${todayCheckedLabel}` : ""}. Te same kierunki wykorzystujemy w naszych publikacjach społecznościowych.`}</p>
      </div>
      {todayRows.length > 0 ? (
        <div className="cards-grid deals-premium-grid">{todayRows.map((offer) => <OfferCard key={`today-${offer.id}`} offer={offer}/>)}</div>
      ) : !todayLoading ? (
        <div className="self-search-empty">
          <strong>Dzisiejsza pula właśnie się odświeża.</strong>
          <span>Wróć za chwilę — pokazujemy tylko oferty, które udało się potwierdzić w bieżącym feedzie.</span>
        </div>
      ) : null}</>}

      {!destination && dealType !== "allinclusive" && (
        <div className="deals-ai-promo-strip">
          <div>
            <small>TANIE ALL INCLUSIVE 🔥</small>
            <strong>Najtańsze pakiety z pełnym wyżywieniem</strong>
            <span>Osobna lista live — sortowana od najniższej potwierdzonej ceny.</span>
          </div>
          <Link href="/tanie-all-inclusive" onClick={() => trackEvent("allinclusive_promo_click", { placement: "deals_page" })}>Zobacz Tanie All Inclusive →</Link>
        </div>
      )}

      {!destination && dealType === "allinclusive" && (
        <div className="deals-ai-promo-strip">
          <div><small>TANIE ALL INCLUSIVE 🔥</small><strong>Hotel + wyżywienie + przelot w jednej cenie</strong><span>Sortujemy od najniższej potwierdzonej ceny w live feedzie.</span></div>
          <Link href="/okazje">Zobacz też wszystkie okazje →</Link>
        </div>
      )}

      <div className="deals-quick-filters" aria-label="Szybkie filtry okazji">
        {([
          ["all", "Wszystkie"],
          ["city", "City break"],
          ["allinclusive", dealType === "allinclusive" ? "Tanie All Inclusive 🔥" : "Tanie All Inclusive"],
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

      {featuredDeal && (
        <section className="deals-buy-now" aria-label="Najtańsza aktualna oferta">
          <div className="deals-buy-now-copy">
            <small>NAJTAŃSZA Z AKTUALNYCH WYNIKÓW</small>
            <strong>{featuredDeal.flag} {featuredDeal.city} — od {Number(featuredDeal.price).toLocaleString("pl-PL")} zł / os.</strong>
            <span>{featuredDeal.departure} · {featuredDeal.dates} · {featuredDeal.nights} nocy · {featuredDeal.board}</span>
          </div>
          <div className="deals-buy-now-actions">
            {featuredDeal.id < 1_000_000 && (
              <Link
                className="deals-buy-now-details"
                href={`/oferta/${featuredDeal.id}`}
                onClick={() => trackEvent("featured_offer_detail_click", { offer_id: featuredDeal.id, destination: featuredDeal.city, price: featuredDeal.price })}
              >
                Szczegóły w Tripowni
              </Link>
            )}
            {featuredDealExternal ? (
              <a
                className="deals-buy-now-primary"
                href={featuredDealHref}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={() => trackEvent("featured_offer_outbound_click", { offer_id: featuredDeal.id, destination: featuredDeal.city, price: featuredDeal.price, partner: featuredDeal.partner })}
              >
                Sprawdź cenę w {featuredDealPartner} <ArrowRight size={16}/>
              </a>
            ) : (
              <Link
                className="deals-buy-now-primary"
                href={featuredDealHref}
                onClick={() => trackEvent("featured_offer_open_click", { offer_id: featuredDeal.id, destination: featuredDeal.city, price: featuredDeal.price })}
              >
                Sprawdź ofertę <ArrowRight size={16}/>
              </Link>
            )}
          </div>
          <p>Finalną cenę i dostępność potwierdza partner. Tripownia nie dolicza dodatkowej opłaty do rezerwacji.</p>
        </section>
      )}

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
          <strong>{destination ? `Nie mamy teraz potwierdzonego pakietu: ${destination}.` : "Nie mamy teraz potwierdzonych okazji w tej puli."}</strong>
          <span>{destination ? "Nie pokazujemy losowego kierunku zamiast tego, którego szukasz. Sprawdź loty albo noclegi dla tego samego miejsca." : "Spróbuj odświeżyć dane lub zmienić jeden filtr. Tripownia nie podmieni ceny na statyczną."}</span>
          {destination && (
            <div className="deals-empty-actions">
              <Link href={`/loty?destination=${encodeURIComponent(destination)}`}>✈️ Porównaj loty</Link>
              <a href={destinationHotelHref} target="_blank" rel="sponsored noopener noreferrer">🏨 Sprawdź hotele</a>
            </div>
          )}
        </div>
      ) : null}

      <div className="deals-end-cta"><div><strong>Chcesz zawęzić jeszcze bardziej?</strong><span>W głównej wyszukiwarce ustawisz też kierunek, budżet, długość pobytu, weekend i wyżywienie.</span></div><Link href="/#wyszukiwarka">Przejdź do wyszukiwarki <ArrowRight size={16}/></Link></div>
      <div className="facebook-growth-strip facebook-growth-strip-compact">
        <div><small>NIE PRZEGAP KOLEJNEJ PULI</small><strong>Obserwuj Tripownię na Facebooku.</strong><span>Nowe okazje i konkretne wyjazdy publikujemy również tam.</span></div>
        <a href="https://www.facebook.com/987707741084438" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("facebook_follow_click", { placement: "deals_page" })}>Obserwuj na Facebooku →</a>
      </div>
    </section>
    <SiteFooter/>
  </main>;
}