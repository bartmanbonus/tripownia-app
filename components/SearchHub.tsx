"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, MapPin, Plane, Search, SlidersHorizontal, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { airportOptions } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";

type Props = {
  initialAirports?: string[];
  initialDestinations?: string[];
  initialDuration?: string;
  searchRequest?: number;
  initialTab?: string;
};

type DateMode = "any" | "month" | "range";

type SearchOverrides = {
  duration?: string;
  budget?: string;
  board?: string;
  weekendOnly?: boolean;
  tab?: string;
  dateMode?: DateMode;
  month?: string;
  dateFrom?: string;
  dateTo?: string;
};

type DatePreference = {
  mode: DateMode;
  month: string;
  from: string;
  to: string;
};

function onePerDirection(rows: any[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = touristDestinationKey(row);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueOfferVariants(rows: any[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = [
      String(row?.partner || ""),
      String(row?.hotel || row?.city || "").toLowerCase(),
      String(row?.dates || ""),
      String(row?.departure || "").toLowerCase(),
      String(row?.price || ""),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function cleanRows(rows: any[], query: string) {
  const cleaned = rows
    .filter((o: any) => ["exim", "tui"].includes(String(o.partner || "").toLowerCase()))
    .filter((o: any) => isTravelDestinationAllowed(String(o.city || ""), String(o.country || "")))
    .sort((a: any, b: any) => Number(a.price || Infinity) - Number(b.price || Infinity));

  return query
    ? uniqueOfferVariants(cleaned).slice(0, 18)
    : onePerDirection(cleaned).slice(0, 12);
}

function isoMs(value: string) {
  if (!value) return Number.NaN;
  const ms = new Date(`${value}T00:00:00Z`).getTime();
  return Number.isFinite(ms) ? ms : Number.NaN;
}

function offerStartMs(offer: any) {
  return isoMs(String(offer?.startDateISO || ""));
}

function preferenceWindow(preference: DatePreference) {
  if (preference.mode === "month" && /^\d{4}-\d{2}$/.test(preference.month)) {
    const [year, month] = preference.month.split("-").map(Number);
    const start = Date.UTC(year, month - 1, 1);
    const end = Date.UTC(year, month, 0, 23, 59, 59, 999);
    return { start, end, label: "wybranym miesiącu" };
  }

  if (preference.mode === "range" && (preference.from || preference.to)) {
    const from = isoMs(preference.from || preference.to);
    const to = isoMs(preference.to || preference.from);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      return { start: Math.min(from, to), end: Math.max(from, to), label: "wybranym zakresie dat" };
    }
  }

  return null;
}

function distanceFromWindow(offer: any, window: { start: number; end: number }) {
  const start = offerStartMs(offer);
  if (!Number.isFinite(start)) return Number.POSITIVE_INFINITY;
  if (start >= window.start && start <= window.end) return 0;
  const distance = start < window.start ? window.start - start : start - window.end;
  return Math.round(distance / 86400000);
}

function prioritizeByDate(rows: any[], preference: DatePreference) {
  const window = preferenceWindow(preference);
  if (!window || !rows.length) return { rows, notice: "" };

  const sorted = [...rows].sort((a, b) => {
    const distance = distanceFromWindow(a, window) - distanceFromWindow(b, window);
    if (distance !== 0) return distance;
    return Number(a.price || Infinity) - Number(b.price || Infinity);
  });

  const exact = sorted.filter((row) => distanceFromWindow(row, window) === 0);
  if (exact.length >= 3) {
    return { rows: sorted, notice: `Najpierw pokazujemy oferty w ${window.label}.` };
  }
  if (exact.length > 0) {
    return { rows: sorted, notice: `Mamy ${exact.length} ofert w ${window.label}; dalej pokazujemy najbliższe dostępne terminy.` };
  }
  return { rows: sorted, notice: `Brak ofert dokładnie w ${window.label} — pokazujemy najbliższe dostępne terminy zamiast pustego wyniku.` };
}

export default function SearchHub({
  initialAirports = [],
  initialDestinations = [],
  initialDuration = "all",
  searchRequest = 0,
  initialTab = "Inspiracje",
}: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [destination, setDestination] = useState(initialDestinations[0] || "");
  const [departure, setDeparture] = useState(initialAirports[0] || "");
  const [dateMode, setDateMode] = useState<DateMode>("any");
  const [month, setMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [duration, setDuration] = useState(initialDuration || "all");
  const [budget, setBudget] = useState("all");
  const [board, setBoard] = useState("all");
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState("");
  const destinationRef = useRef<HTMLDivElement>(null);
  const searchRunRef = useRef(0);

  const suggestions = useMemo(() => {
    const query = destination.trim();
    if (!query) return WORLD_DESTINATIONS.filter((x) => isTravelDestinationAllowed(x.label, x.region)).slice(0, 8);
    return WORLD_DESTINATIONS
      .filter((x) => isTravelDestinationAllowed(x.label, x.region))
      .filter((x) => destinationMatches(query, x))
      .slice(0, 8);
  }, [destination]);

  useEffect(() => {
    setDestination(initialDestinations[0] || "");
    setDeparture(initialAirports[0] || "");
    setDuration(initialDuration || "all");
  }, [initialAirports.join("|"), initialDestinations.join("|"), initialDuration]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) setSuggestionsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (searchRequest > 0) void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchRequest]);

  async function runSearch(destinationOverride?: string, overrides: SearchOverrides = {}) {
    const runId = ++searchRunRef.current;
    const query = (destinationOverride ?? destination).trim();
    if (query && isTravelDestinationBlocked(query)) {
      setSearched(true);
      setResults([]);
      setNotice("Tego kierunku Tripownia obecnie nie promuje ze względów bezpieczeństwa.");
      return;
    }

    const activeDuration = overrides.duration ?? duration;
    const activeBudget = overrides.budget ?? budget;
    const activeBoard = overrides.board ?? board;
    const activeWeekend = overrides.weekendOnly ?? weekendOnly;
    const activeMode = overrides.tab ?? activeTab;
    const datePreference: DatePreference = {
      mode: overrides.dateMode ?? dateMode,
      month: overrides.month ?? month,
      from: overrides.dateFrom ?? dateFrom,
      to: overrides.dateTo ?? dateTo,
    };

    setLoading(true);
    setExpanding(false);
    setSearched(true);
    setVisibleCount(6);
    setSuggestionsOpen(false);
    setNotice("");

    try {
      const params = new URLSearchParams({ mode: activeMode === "City break" && !query ? "citybreak" : "search" });
      if (query) params.set("q", query);
      else params.set("broad", "1");
      if (departure) params.set("from", departure);
      if (activeDuration !== "all") params.set("nights", activeDuration);
      if (activeBudget !== "all") params.set("maxPrice", activeBudget);
      if (activeWeekend) params.set("weekend", "1");
      if (activeBoard === "all inclusive") params.set("board", "allinclusive");
      else if (activeBoard === "ultra all inclusive") params.set("board", "ultraallinclusive");
      else if (activeBoard === "śniadanie") params.set("board", "breakfast");
      else if (activeBoard === "half board") params.set("board", "halfboard");
      else if (activeBoard === "full board") params.set("board", "fullboard");
      else if (activeBoard === "bez wyżywienia") params.set("board", "roomonly");

      const response = await fetch(`/api/today-offers?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data?.ok === false) throw new Error(String(data?.error || `HTTP ${response.status}`));
      if (runId !== searchRunRef.current) return;

      let rows = cleanRows(Array.isArray(data?.offers) ? data.offers : [], query);
      const firstDatePass = prioritizeByDate(rows, datePreference);
      rows = firstDatePass.rows;
      setResults(rows);
      setLoading(false);

      const apiNotice = String(data?.notice || "");
      if (rows.length >= 6) {
        setNotice(firstDatePass.notice || apiNotice);
        return;
      }

      setExpanding(true);
      setNotice(rows.length
        ? "Mamy dokładne dopasowania. Dobieramy jeszcze kilka najbliższych aktualnych opcji…"
        : "Nie ma dokładnego dopasowania. Szukamy teraz najbliższych aktualnych opcji…");

      const relaxedParams = new URLSearchParams({ mode: activeMode === "City break" ? "citybreak" : "search" });
      if (query) relaxedParams.set("q", query);
      else relaxedParams.set("broad", "1");

      const relaxedResponse = await fetch(`/api/today-offers?${relaxedParams.toString()}`, { cache: "no-store" });
      const relaxedData = await relaxedResponse.json();
      if (runId !== searchRunRef.current) return;

      let finalDateNotice = firstDatePass.notice;
      if (relaxedResponse.ok && relaxedData?.ok !== false) {
        const relaxedRows = cleanRows(Array.isArray(relaxedData?.offers) ? relaxedData.offers : [], query);
        rows = query
          ? uniqueOfferVariants([...rows, ...relaxedRows]).slice(0, 18)
          : onePerDirection([...rows, ...relaxedRows]).slice(0, 12);
        const relaxedDatePass = prioritizeByDate(rows, datePreference);
        rows = relaxedDatePass.rows;
        finalDateNotice = relaxedDatePass.notice || finalDateNotice;
        setResults(rows);
      }

      // City-break searches should never dead-end on an exact city.
      // If the requested city is not in the current live pool, widen first to its country
      // and finally to currently available city-breaks. We label this clearly as alternatives.
      if (!rows.length && activeMode === "City break") {
        const countryFallback = query.includes(",") ? query.split(",").slice(-1)[0].trim() : "";
        const fallbackParams = new URLSearchParams({ mode: "citybreak" });
        if (countryFallback) fallbackParams.set("q", countryFallback);
        else fallbackParams.set("broad", "1");

        const fallbackResponse = await fetch(`/api/today-offers?${fallbackParams.toString()}`, { cache: "no-store" });
        const fallbackData = await fallbackResponse.json();
        if (runId !== searchRunRef.current) return;

        if (fallbackResponse.ok && fallbackData?.ok !== false) {
          const fallbackRows = cleanRows(Array.isArray(fallbackData?.offers) ? fallbackData.offers : [], "");
          rows = onePerDirection(fallbackRows).slice(0, 12);
          const fallbackDatePass = prioritizeByDate(rows, datePreference);
          rows = fallbackDatePass.rows;
          finalDateNotice = rows.length
            ? `Brak potwierdzonej oferty dokładnie dla „${query}”. Pokazujemy najbliższe aktualne city breaki${countryFallback ? ` w kraju: ${countryFallback}` : ""}.`
            : finalDateNotice;
          setResults(rows);
        }
      }

      if (rows.length) {
        setNotice(finalDateNotice || (rows.length >= 6
          ? "Najpierw pokazujemy najbliższe dopasowania, a dalej dodatkowe aktualne opcje dla tego samego kierunku."
          : apiNotice || "Pokazujemy wszystkie aktualne dopasowania, które udało się teraz potwierdzić."));
      } else {
        setNotice(query
          ? `Nie znaleźliśmy teraz potwierdzonej oferty dla „${query}”. Spróbuj zmienić kierunek albo wybierz Inspiracje.`
          : "Nie znaleźliśmy teraz potwierdzonej oferty. Spróbuj ponownie lub wybierz jeden z szybkich kierunków.");
      }
    } catch {
      if (runId !== searchRunRef.current) return;
      setResults([]);
      setNotice("Nie udało się teraz pobrać aktualnych ofert. Spróbuj ponownie za chwilę albo wybierz szersze parametry.");
    } finally {
      if (runId === searchRunRef.current) {
        setLoading(false);
        setExpanding(false);
      }
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    void runSearch();
  }

  function chooseTab(tab: string) {
    if (tab === "Atrakcje") {
      window.location.href = "/atrakcje";
      return;
    }
    if (tab === "Parkingi") {
      window.location.href = "/parkingi";
      return;
    }
    if (tab === "eSIM") {
      window.location.href = "/esim";
      return;
    }

    searchRunRef.current += 1;
    setActiveTab(tab);
    setDuration("all");
    setBudget("all");
    setBoard("all");
    setWeekendOnly(false);
    setAdvancedOpen(false);
    setSearched(false);
    setResults([]);
    setVisibleCount(6);
    setNotice("");
  }

  function quickSearch(label: string, overrides: SearchOverrides) {
    const nextDuration = overrides.duration ?? "all";
    const nextBudget = overrides.budget ?? "all";
    const nextBoard = overrides.board ?? "all";
    const nextWeekend = overrides.weekendOnly ?? false;

    setDestination(label);
    setDuration(nextDuration);
    setBudget(nextBudget);
    setBoard(nextBoard);
    setWeekendOnly(nextWeekend);
    setAdvancedOpen(nextBoard !== "all");
    if (overrides.tab) setActiveTab(overrides.tab);

    void runSearch(label, {
      ...overrides,
      duration: nextDuration,
      budget: nextBudget,
      board: nextBoard,
      weekendOnly: nextWeekend,
    });
  }

  function resetSearch() {
    searchRunRef.current += 1;
    setDestination("");
    setDeparture("");
    setDateMode("any");
    setMonth("");
    setDateFrom("");
    setDateTo("");
    setDuration("all");
    setBudget("all");
    setBoard("all");
    setWeekendOnly(false);
    setAdvancedOpen(false);
    setResults([]);
    setVisibleCount(6);
    setNotice("");
    setSearched(false);
    setLoading(false);
    setExpanding(false);
  }

  const quickPicks: Array<[string, string, SearchOverrides]> = [
    ["Rzym, Włochy", "Rzym na city break", { duration: "3-4", budget: "1500", tab: "City break" }],
    ["Teneryfa, Hiszpania", "Ciepło na Teneryfie", { duration: "5-7", budget: "3000", tab: "Wakacje" }],
    ["Djerba, Tunezja", "All Inclusive na Djerbie", { duration: "5-7", board: "all inclusive", budget: "3000", tab: "Wakacje" }],
    ["Bergamo, Włochy", "Tani weekend w Bergamo", { duration: "3-4", budget: "1000", weekendOnly: true, tab: "City break" }],
    ["Zanzibar, Tanzania", "Egzotyka: Zanzibar", { duration: "11-14", budget: "7500", tab: "Wakacje" }],
  ];

  return (
    <section className="section shell search-v3-section" id="wyszukiwarka">
      <div className="search-v3">
        <div className="search-v3-head">
          <div>
            <small>WYSZUKIWARKA TRIPOWNI</small>
            <h2>Gdzie chcesz lecieć?</h2>
            <p>Wybierz kierunek i, jeśli chcesz, termin. Tripownia dobierze najbliższe aktualne oferty.</p>
          </div>
          <button type="button" className="search-v3-reset" onClick={resetSearch}>Wyczyść</button>
        </div>

        <div className="search-v3-tabs" role="tablist" aria-label="Rodzaj podróży">
          {["Inspiracje", "City break", "Lot + hotel", "Wakacje", "Atrakcje", "Parkingi", "eSIM"].map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => chooseTab(tab)}>{tab}</button>
          ))}
        </div>

        <form className="search-v3-form" onSubmit={submitSearch}>
          <div className="search-v3-field search-v3-destination" ref={destinationRef}>
            <label htmlFor="tripownia-destination"><MapPin size={15}/> Dokąd?</label>
            <div className="search-v3-input-wrap">
              <input
                id="tripownia-destination"
                value={destination}
                onChange={(event) => { setDestination(event.target.value); setSuggestionsOpen(true); }}
                onFocus={() => setSuggestionsOpen(true)}
                placeholder="Miasto, kraj albo wyspa"
                autoComplete="off"
              />
              {destination && <button type="button" aria-label="Wyczyść kierunek" onClick={() => { setDestination(""); setSuggestionsOpen(true); }}><X size={16}/></button>}
            </div>

            {suggestionsOpen && (
              <div className="search-v3-suggestions">
                {suggestions.length > 0 ? suggestions.map((item) => (
                  <button key={item.label} type="button" onClick={() => { setDestination(item.label); setSuggestionsOpen(false); }}>
                    <MapPin size={15}/><span><strong>{item.label}</strong><small>{item.region}</small></span>
                  </button>
                )) : destination.trim() && !isTravelDestinationBlocked(destination) ? (
                  <button type="button" onClick={() => setSuggestionsOpen(false)}><Search size={15}/><span><strong>Szukaj dokładnie „{destination.trim()}”</strong><small>Dowolny kierunek na świecie</small></span></button>
                ) : null}
              </div>
            )}
          </div>

          <label className="search-v3-field search-v3-departure">
            <span><Plane size={15}/> Skąd?</span>
            <select value={departure} onChange={(event) => setDeparture(event.target.value)}>
              <option value="">Wszystkie lotniska</option>
              {airportOptions.map((airport: any) => <option key={airport.code} value={airport.code}>{airport.label}</option>)}
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <label className="search-v3-field search-v3-date">
            <span><CalendarDays size={15}/> Kiedy?</span>
            <select value={dateMode} onChange={(event) => setDateMode(event.target.value as DateMode)}>
              <option value="any">Elastycznie / dowolny termin</option>
              <option value="month">Miesiąc — elastycznie</option>
              <option value="range">Zakres dat — pokaż też bliskie terminy</option>
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <label className="search-v3-field search-v3-duration">
            <span>Na ile?</span>
            <select value={duration} onChange={(event) => setDuration(event.target.value)}>
              <option value="all">Dowolnie</option>
              <option value="1-2">1–2 noce</option>
              <option value="3-4">3–4 noce</option>
              <option value="5-7">5–7 nocy</option>
              <option value="8-10">8–10 nocy</option>
              <option value="11-14">11–14 nocy</option>
              <option value="15+">15+ nocy</option>
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <label className="search-v3-field search-v3-budget">
            <span>Budżet / os.</span>
            <select value={budget} onChange={(event) => setBudget(event.target.value)}>
              <option value="all">Dowolny</option>
              <option value="750">do 750 zł</option>
              <option value="1000">do 1 000 zł</option>
              <option value="1500">do 1 500 zł</option>
              <option value="2000">do 2 000 zł</option>
              <option value="3000">do 3 000 zł</option>
              <option value="5000">do 5 000 zł</option>
              <option value="7500">do 7 500 zł</option>
              <option value="10000">do 10 000 zł</option>
              <option value="15000">do 15 000 zł</option>
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <button type="submit" className="search-v3-submit" disabled={loading}><Search size={18}/>{loading ? "Szukamy…" : "Szukaj wyjazdu"}</button>
        </form>

        {dateMode !== "any" && (
          <div className="search-v3-date-details">
            {dateMode === "month" ? (
              <label><span>Miesiąc wyjazdu</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
            ) : (
              <>
                <label><span>Najwcześniej</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
                <label><span>Najpóźniej</span><input type="date" min={dateFrom || undefined} value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
              </>
            )}
            <small>Daty są elastyczne — najpierw pokazujemy Twój termin, a jeśli ofert jest mało, najbliższe dostępne daty.</small>
          </div>
        )}

        <div className="search-v3-options-row">
          <button type="button" className={`search-v3-more ${advancedOpen ? "active" : ""}`} onClick={() => setAdvancedOpen((value) => !value)}>
            <SlidersHorizontal size={15}/> Więcej filtrów
          </button>
          <button type="button" className={`search-v3-weekend ${weekendOnly ? "active" : ""}`} onClick={() => setWeekendOnly((value) => !value)}>
            <span className="search-v3-check">{weekendOnly && <Check size={13}/>}</span> Pobyt obejmuje sobotę i niedzielę
          </button>
          {advancedOpen && (
            <label className="search-v3-board">
              <span>Wyżywienie</span>
              <select value={board} onChange={(event) => setBoard(event.target.value)}>
                <option value="all">Dowolne</option>
                <option value="bez wyżywienia">Bez wyżywienia</option>
                <option value="śniadanie">Śniadanie</option>
                <option value="half board">Half Board</option>
                <option value="full board">Full Board</option>
                <option value="all inclusive">All Inclusive</option>
                <option value="ultra all inclusive">Ultra All Inclusive</option>
              </select>
            </label>
          )}
        </div>

        <div className="search-v3-quick">
          <span>Szybki start</span>
          <div>{quickPicks.map(([destinationLabel, label, overrides]) => <button type="button" key={destinationLabel} onClick={() => quickSearch(destinationLabel, overrides)}>{label}</button>)}</div>
        </div>

        {searched && (
          <div className="search-v3-results">
            <div className="search-v3-results-head">
              <div><small>WYNIKI</small><h3>{loading ? "Sprawdzamy aktualne oferty…" : results.length ? `${results.length} aktualnych ofert` : "Brak potwierdzonego dopasowania"}</h3></div>
              {notice && <p>{notice}</p>}
            </div>

            {!loading && results.length > 0 && (
              <>
                <div className="search-v3-results-grid">{results.slice(0, visibleCount).map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
                {results.length > visibleCount && <button className="search-v3-show-more" type="button" onClick={() => setVisibleCount((count) => Math.min(results.length, count + 6))}>Pokaż kolejne oferty ({results.length - visibleCount})</button>}
              </>
            )}
            {!loading && results.length === 0 && !expanding && <div className="search-v3-empty"><strong>Spróbuj trochę szerzej.</strong><span>Usuń jeden filtr lub wybierz Inspiracje — Tripownia spróbuje znaleźć więcej aktualnych opcji.</span></div>}
          </div>
        )}
      </div>
    </section>
  );
}
