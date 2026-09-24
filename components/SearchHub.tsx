"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, MapPin, Plane, Search, Trash2, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { airportOptions } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { partners } from "@/lib/partners";

type Props = {
  initialAirports?: string[];
  initialDestinations?: string[];
  initialDuration?: string;
  searchRequest?: number;
  initialTab?: string;
};

type DateMode = "any" | "exact" | "month" | "range";

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

function monthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function localMonthKey() {
  const now = new Date();
  return monthKey(now.getFullYear(), now.getMonth());
}

function addMonths(value: string, delta: number) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return monthKey(date.getUTCFullYear(), date.getUTCMonth());
}

function monthLabel(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return "";
  const [year, month] = value.split("-").map(Number);
  const raw = new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function calendarCells(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return [] as Array<{ iso: string; day: number } | null>;
  const [year, month] = value.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const mondayOffset = (firstDay + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<{ iso: string; day: number } | null> = Array.from({ length: mondayOffset }, () => null);
  for (let day = 1; day <= days; day += 1) {
    cells.push({ iso: `${value}-${String(day).padStart(2, "0")}`, day });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

function isoLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T12:00:00Z`));
}

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

function canonicalSearchDestination(value: string) {
  const normalized = value.trim();
  if (/\bbergamo\b/i.test(normalized)) return "Mediolan, Włochy";
  if (/\bmilan\b/i.test(normalized)) return "Mediolan, Włochy";
  if (/\bsajgon\b/i.test(normalized)) return "Ho Chi Minh, Wietnam";
  return normalized;
}

function cityBreakFallbackLinks(destination: string) {
  const query = destination.trim();
  if (!query) return null;
  const bookingBase = new URL("https://www.booking.com/searchresults.pl.html");
  bookingBase.searchParams.set("ss", query);
  const kiwiBase = new URL("https://www.kiwi.com/pl/");
  kiwiBase.searchParams.set("destination", query);
  kiwiBase.searchParams.set("currency", "PLN");
  return {
    booking: partners.booking.buildUrl(bookingBase.toString()),
    kiwi: partners.kiwi.buildUrl(kiwiBase.toString()),
  };
}

function cleanRows(rows: any[], query: string) {
  const cleaned = rows
    .filter((o: any) => ["exim", "tui"].includes(String(o.partner || "").toLowerCase()))
    .filter((o: any) => isTravelDestinationAllowed(String(o.city || ""), String(o.country || "")))
    .sort((a: any, b: any) => Number(a.price || Infinity) - Number(b.price || Infinity));

  return query
    ? uniqueOfferVariants(cleaned).slice(0, 36)
    : onePerDirection(cleaned).slice(0, 24);
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
  if (preference.mode === "exact" && preference.from) {
    const day = isoMs(preference.from);
    if (Number.isFinite(day)) return { start: day, end: day + 86399999, label: "wybranym dniu" };
  }

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
  const [destination, setDestination] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(initialDestinations);
  const [departures, setDepartures] = useState<string[]>(initialAirports);
  const [departureOpen, setDepartureOpen] = useState(false);
  const [dateMode, setDateMode] = useState<DateMode>("any");
  const [dateOpen, setDateOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [calendarMonth, setCalendarMonth] = useState("");
  const [calendarView, setCalendarView] = useState<"calendar" | "months">("calendar");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [duration, setDuration] = useState(initialDuration || "all");
  const [budget, setBudget] = useState("all");
  const [board, setBoard] = useState("all");
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState("");
  const destinationRef = useRef<HTMLDivElement>(null);
  const departureRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const searchRunRef = useRef(0);

  const suggestions = useMemo(() => {
    const query = destination.trim();
    if (!query) return WORLD_DESTINATIONS.filter((x) => isTravelDestinationAllowed(x.label, x.region)).slice(0, 8);
    return WORLD_DESTINATIONS
      .filter((x) => isTravelDestinationAllowed(x.label, x.region))
      .filter((x) => !selectedDestinations.includes(x.label))
      .filter((x) => destinationMatches(query, x))
      .slice(0, 8);
  }, [destination, selectedDestinations]);

  useEffect(() => {
    setDestination("");
    setSelectedDestinations(initialDestinations);
    setDepartures(initialAirports);
    setDuration(initialDuration || "all");
  }, [initialAirports.join("|"), initialDestinations.join("|"), initialDuration]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) setSuggestionsOpen(false);
      if (departureRef.current && !departureRef.current.contains(event.target as Node)) setDepartureOpen(false);
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setDateOpen(false);
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
    const typed = (destinationOverride ?? destination).trim();
    const typedDestinations = typed
      ? typed.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean)
      : [];
    const requestedRaw = destinationOverride
      ? [destinationOverride]
      : Array.from(new Set([...selectedDestinations, ...typedDestinations]));
    const requested = requestedRaw
      .filter((item) => !isTravelDestinationBlocked(item))
      .map(canonicalSearchDestination);
    const blockedOnly = requestedRaw.length > 0 && requested.length === 0;

    if (blockedOnly) {
      setSearched(true);
      setResults([]);
      setNotice("Wybrane kierunki są obecnie wyłączone z rekomendacji ze względów bezpieczeństwa.");
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
    const origins = departures.length ? departures : [""];
    const targets = requested.length ? requested : [""];

    setLoading(true);
    setExpanding(false);
    setSearched(true);
    setVisibleCount(12);
    setSuggestionsOpen(false);
    setDepartureOpen(false);
    setNotice("");

    const fetchBatch = async (includeFilters: boolean) => {
      const combinations = targets.flatMap((target) => origins.map((origin) => ({ target, origin }))).slice(0, 20);
      const payloads = await Promise.all(combinations.map(async ({ target, origin }) => {
        const params = new URLSearchParams({ mode: activeMode === "City break" ? "citybreak" : "search" });
        if (target) params.set("q", target);
        else params.set("broad", "1");
        if (origin) params.set("from", origin);
        if (activeBudget !== "all") params.set("maxPrice", activeBudget);
        if (includeFilters) {
          if (activeDuration !== "all") params.set("nights", activeDuration);
          if (activeWeekend) params.set("weekend", "1");
          if (activeBoard === "all inclusive") params.set("board", "allinclusive");
          else if (activeBoard === "ultra all inclusive") params.set("board", "ultraallinclusive");
          else if (activeBoard === "śniadanie") params.set("board", "breakfast");
          else if (activeBoard === "half board") params.set("board", "halfboard");
          else if (activeBoard === "full board") params.set("board", "fullboard");
          else if (activeBoard === "bez wyżywienia") params.set("board", "roomonly");
        }
        try {
          const response = await fetch(`/api/today-offers?${params.toString()}`, { cache: "no-store" });
          const data = await response.json();
          return response.ok && data?.ok !== false ? data : null;
        } catch {
          return null;
        }
      }));
      return {
        offers: payloads.flatMap((data) => Array.isArray(data?.offers) ? data.offers : []),
        notice: payloads.map((data) => String(data?.notice || "")).find(Boolean) || "",
      };
    };

    try {
      const exact = await fetchBatch(true);
      if (runId !== searchRunRef.current) return;

      let rows = requested.length
        ? uniqueOfferVariants(cleanRows(exact.offers, "multi")).slice(0, 36)
        : onePerDirection(cleanRows(exact.offers, "")).slice(0, 24);
      let datePass = prioritizeByDate(rows, datePreference);
      rows = datePass.rows;
      setResults(rows);
      setLoading(false);

      if (rows.length < 6) {
        setExpanding(true);
        const relaxed = await fetchBatch(false);
        if (runId !== searchRunRef.current) return;
        const relaxedRows = cleanRows(relaxed.offers, requested.length ? "multi" : "");
        rows = requested.length
          ? uniqueOfferVariants([...rows, ...relaxedRows]).slice(0, 36)
          : onePerDirection([...rows, ...relaxedRows]).slice(0, 24);
        datePass = prioritizeByDate(rows, datePreference);
        rows = datePass.rows;
        setResults(rows);
      }

      if (!rows.length && activeMode === "City break") {
        const broadParams = new URLSearchParams({ mode: "citybreak", broad: "1" });
        const broadResponse = await fetch(`/api/today-offers?${broadParams.toString()}`, { cache: "no-store" });
        const broadData = await broadResponse.json();
        if (runId !== searchRunRef.current) return;
        if (broadResponse.ok && broadData?.ok !== false) {
          rows = onePerDirection(cleanRows(Array.isArray(broadData?.offers) ? broadData.offers : [], "")).slice(0, 24);
          rows = prioritizeByDate(rows, datePreference).rows;
          setResults(rows);
        }
      }

      const bergamoMapped = requestedRaw.some((item) => /\bbergamo\b/i.test(item));
      const scope = [
        requestedRaw.length ? `${requestedRaw.length} ${requestedRaw.length === 1 ? "kierunek" : "kierunki"}` : "gdziekolwiek",
        departures.length ? `${departures.length} ${departures.length === 1 ? "lotnisko" : "lotniska"}` : "dowolne lotnisko",
      ].join(" · ");

      if (rows.length) {
        const prefix = bergamoMapped ? "Bergamo wyszukujemy jako Mediolan, żeby pokazać realne oferty dla tego obszaru. " : "";
        setNotice(`${prefix}${datePass.notice || `Zakres: ${scope}. Pokazujemy najlepsze aktualne dopasowania.`}`);
      } else {
        setNotice(bergamoMapped
          ? "Dla Bergamo szukaliśmy ofert jako Mediolan. Nie mamy teraz potwierdzonego pakietu — spróbuj Lot + hotel albo elastycznych parametrów."
          : `Nie znaleźliśmy teraz potwierdzonych ofert dla ustawień: ${scope}. Poszerz jeden filtr albo wybierz gdziekolwiek.`);
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

  function openDestinationPanel() {
    setDepartureOpen(false);
    setDateOpen(false);
    setSuggestionsOpen(true);
  }

  function toggleDeparturePanel() {
    setSuggestionsOpen(false);
    setDateOpen(false);
    setDepartureOpen((open) => !open);
  }

  function toggleDatePanel() {
    setSuggestionsOpen(false);
    setDepartureOpen(false);
    setDateOpen((open) => {
      const next = !open;
      if (next && !calendarMonth) {
        setCalendarMonth(month || dateFrom.slice(0, 7) || localMonthKey());
      }
      return next;
    });
  }

  function selectDateMode(mode: DateMode) {
    setDateMode(mode);
    if (mode === "any") {
      setMonth("");
      setDateFrom("");
      setDateTo("");
      return;
    }
    if (mode === "month") {
      const nextMonth = calendarMonth || localMonthKey();
      setCalendarMonth(nextMonth);
      setMonth(nextMonth);
      setDateFrom("");
      setDateTo("");
      return;
    }
    setMonth("");
    if (!calendarMonth) setCalendarMonth(dateFrom.slice(0, 7) || localMonthKey());
  }

  function selectCalendarDay(iso: string) {
    if (dateMode === "month") {
      setMonth(iso.slice(0, 7));
      return;
    }

    if (dateMode === "range") {
      if (!dateFrom || dateTo) {
        setDateFrom(iso);
        setDateTo("");
        return;
      }
      if (iso < dateFrom) {
        setDateTo(dateFrom);
        setDateFrom(iso);
      } else {
        setDateTo(iso);
      }
      return;
    }

    setDateMode("exact");
    setDateFrom(iso);
    setDateTo(iso);
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
    setSuggestionsOpen(false);
    setDepartureOpen(false);
    setDateOpen(false);
    setActiveTab(tab);
    setDuration("all");
    setBudget("all");
    setBoard("all");
    setWeekendOnly(false);
    setSearched(false);
    setResults([]);
    setVisibleCount(12);
    setNotice("");
  }

  function quickSearch(label: string, overrides: SearchOverrides) {
    const nextDuration = overrides.duration ?? "all";
    const nextBudget = overrides.budget ?? "all";
    const nextBoard = overrides.board ?? "all";
    const nextWeekend = overrides.weekendOnly ?? false;

    const canonicalLabel = canonicalSearchDestination(label);
    setSuggestionsOpen(false);
    setDepartureOpen(false);
    setDateOpen(false);
    setSelectedDestinations([canonicalLabel]);
    setDestination("");
    setDuration(nextDuration);
    setBudget(nextBudget);
    setBoard(nextBoard);
    setWeekendOnly(nextWeekend);
    if (overrides.tab) setActiveTab(overrides.tab);

    void runSearch(canonicalLabel, {
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
    setSuggestionsOpen(false);
    setSelectedDestinations([]);
    setDepartures([]);
    setDepartureOpen(false);
    setDateOpen(false);
    setDateMode("any");
    setMonth("");
    setCalendarMonth("");
    setDateFrom("");
    setDateTo("");
    setDuration("all");
    setBudget("all");
    setBoard("all");
    setWeekendOnly(false);
    setResults([]);
    setVisibleCount(12);
    setNotice("");
    setSearched(false);
    setLoading(false);
    setExpanding(false);
  }

  const dateSummary = useMemo(() => {
    if (dateMode === "month") return month ? monthLabel(month) : "Wybierz miesiąc";
    if (dateMode === "exact") return dateFrom ? isoLabel(dateFrom) : "Wybierz dzień";
    if (dateMode === "range") {
      if (dateFrom && dateTo) return `${isoLabel(dateFrom)} – ${isoLabel(dateTo)}`;
      if (dateFrom) return `Od ${isoLabel(dateFrom)}`;
      return "Wybierz zakres";
    }
    return "Elastycznie";
  }, [dateMode, month, dateFrom, dateTo]);

  const visibleCalendarMonth = calendarMonth || month || dateFrom.slice(0, 7) || localMonthKey();
  const visibleCalendarCells = calendarCells(visibleCalendarMonth);
  const calendarSelectionLabel = dateMode === "month" && month
    ? monthLabel(month)
    : dateMode === "range" && dateFrom
      ? dateTo ? `${isoLabel(dateFrom)} – ${isoLabel(dateTo)}` : `Start: ${isoLabel(dateFrom)}`
      : dateMode === "exact" && dateFrom
        ? isoLabel(dateFrom)
        : "Bez ograniczenia daty";

  const quickPicks: Array<[string, string, SearchOverrides]> = [
    ["Rzym, Włochy", "Rzym na city break", { duration: "3-4", budget: "1500", tab: "City break" }],
    ["Teneryfa, Hiszpania", "Ciepło na Teneryfie", { duration: "5-7", budget: "3000", tab: "Wakacje" }],
    ["Djerba, Tunezja", "All Inclusive na Djerbie", { duration: "5-7", board: "all inclusive", budget: "3000", tab: "Wakacje" }],
    ["Mediolan, Włochy", "Tani weekend: Mediolan / Bergamo", { duration: "3-4", budget: "1000", weekendOnly: true, tab: "City break" }],
    ["Zanzibar, Tanzania", "Egzotyka: Zanzibar", { duration: "11-14", budget: "7500", tab: "Wakacje" }],
  ];

  return (
    <section className="section shell search-v3-section" id="wyszukiwarka">
      <div className="search-v3">
        <div className="search-v3-head">
          <div>
            <small>WYSZUKIWARKA TRIPOWNI</small>
            <h2>Gdzie chcesz lecieć?</h2>
            <p>Możesz wybrać kilka kierunków i kilka lotnisk albo zostawić je puste. Tripownia ma szukać szeroko, kiedy jesteś elastyczna/y.</p>
          </div>
          <button type="button" className="search-v3-reset" onClick={resetSearch}>Wyczyść</button>
        </div>

        <div className="search-v3-tabs" role="tablist" aria-label="Rodzaj podróży">
          {["Inspiracje", "City break", "Lot + hotel", "Wakacje"].map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => chooseTab(tab)}>{tab}</button>
          ))}
        </div>

        <form className="search-v3-form" onSubmit={submitSearch}>
          <div className={`search-v3-field search-v3-destination${suggestionsOpen ? " is-open" : ""}`} ref={destinationRef}>
            <label htmlFor="tripownia-destination"><MapPin size={15}/> Dokąd? <small>możesz wybrać kilka</small></label>
            {selectedDestinations.length > 0 && (
              <div className="search-v3-selected">
                {selectedDestinations.map((item) => <button type="button" key={item} onClick={() => setSelectedDestinations((current) => current.filter((x) => x !== item))}>{item}<X size={12}/></button>)}
              </div>
            )}
            <div className="search-v3-input-wrap">
              <input
                id="tripownia-destination"
                value={destination}
                onChange={(event) => { setDestination(event.target.value); openDestinationPanel(); }}
                onFocus={openDestinationPanel}
                placeholder={selectedDestinations.length ? "Dodaj kolejny kierunek" : "Np. Rzym, Malta, Tokio"}
                autoComplete="off"
              />
              {destination && <button type="button" aria-label="Wyczyść wpisany kierunek" onClick={() => { setDestination(""); setSuggestionsOpen(true); }}><X size={16}/></button>}
            </div>

            {suggestionsOpen && (
              <div className="search-v3-suggestions" role="dialog" aria-label="Wybierz kierunki">
                <div className="search-v3-panel-head">
                  <div><strong>Wybierz kierunki</strong><small>Możesz dodać kilka i wyszukać je jednocześnie.</small></div>
                  <button type="button" className="search-v3-panel-close" aria-label="Zamknij wybór kierunków" onClick={() => setSuggestionsOpen(false)}><X size={16}/></button>
                </div>

                {selectedDestinations.length > 0 && (
                  <div className="search-v3-panel-selected">
                    {selectedDestinations.map((item) => (
                      <button type="button" key={item} onClick={() => setSelectedDestinations((current) => current.filter((x) => x !== item))}>
                        {item}<X size={12}/>
                      </button>
                    ))}
                  </div>
                )}

                <div className="search-v3-panel-scroll">
                  <button type="button" className="search-v3-anywhere" onClick={() => { setSelectedDestinations([]); setDestination(""); setSuggestionsOpen(false); }}>
                    <MapPin size={15}/><span><strong>🌍 Gdziekolwiek</strong><small>Pokaż najlepsze opcje bez ograniczania kierunku</small></span>
                  </button>
                  {suggestions.length > 0 ? suggestions.map((item) => (
                    <button key={item.label} type="button" onClick={() => {
                      const next = canonicalSearchDestination(item.label);
                      setSelectedDestinations((current) => Array.from(new Set([...current, next])));
                      setDestination("");
                    }}>
                      <MapPin size={15}/><span><strong>{item.label}</strong><small>{item.region} · dodaj do wyboru</small></span>
                    </button>
                  )) : destination.trim() && !isTravelDestinationBlocked(destination) ? (
                    <button type="button" onClick={() => {
                      setSelectedDestinations((current) => Array.from(new Set([...current, canonicalSearchDestination(destination.trim())])));
                      setDestination("");
                    }}><Search size={15}/><span><strong>Dodaj „{destination.trim()}”</strong><small>Dodaj jako kolejny kierunek</small></span></button>
                  ) : null}
                </div>

                <div className="search-v3-panel-footer">
                  <span>{selectedDestinations.length ? `Wybrano: ${selectedDestinations.length}` : "Brak ograniczenia kierunku"}</span>
                  <button type="button" onClick={() => setSuggestionsOpen(false)}>Gotowe</button>
                </div>
              </div>
            )}
          </div>

          <div className={`search-v3-field search-v3-departure search-v3-multiselect${departureOpen ? " is-open" : ""}`} ref={departureRef}>
            <span><Plane size={15}/> Skąd? <small>możesz wybrać kilka</small></span>
            <button type="button" className="search-v3-multi-trigger" onClick={toggleDeparturePanel} aria-expanded={departureOpen}>
              <strong>{departures.length ? (departures.length === 1 ? airportOptions.find((a:any) => a.code === departures[0])?.label || departures[0] : `${departures.length} lotniska`) : "Wszystkie lotniska"}</strong>
              <ChevronDown size={15}/>
            </button>
            {departureOpen && (
              <div className="search-v3-departure-menu" role="dialog" aria-label="Wybierz lotniska wylotu">
                <div className="search-v3-panel-head">
                  <div><strong>Skąd chcesz lecieć?</strong><small>Możesz zaznaczyć kilka lotnisk.</small></div>
                  <button type="button" className="search-v3-panel-close" aria-label="Zamknij wybór lotnisk" onClick={() => setDepartureOpen(false)}><X size={16}/></button>
                </div>
                <div className="search-v3-panel-scroll">
                  <button type="button" className={!departures.length ? "active" : ""} onClick={() => setDepartures([])}>
                    <span className="search-v3-option-check">{!departures.length && <Check size={14}/>}</span><span><strong>Wszystkie lotniska</strong><small>Jestem elastyczna/y</small></span>
                  </button>
                  {airportOptions.map((airport:any) => {
                    const active = departures.includes(airport.code);
                    return <button type="button" className={active ? "active" : ""} key={airport.code} onClick={() => setDepartures((current) => active ? current.filter((code) => code !== airport.code) : [...current, airport.code])}>
                      <span className="search-v3-option-check">{active && <Check size={14}/>}</span><span><strong>{airport.label}</strong><small>{airport.code}</small></span>
                    </button>;
                  })}
                </div>
                <div className="search-v3-panel-footer">
                  <span>{departures.length ? `Wybrano: ${departures.length}` : "Wszystkie lotniska"}</span>
                  <button type="button" onClick={() => setDepartureOpen(false)}>Gotowe</button>
                </div>
              </div>
            )}
          </div>

          <div className={`search-v3-field search-v3-date search-v3-smart-date${dateOpen ? " is-open" : ""}`} ref={dateRef}>
            <span><CalendarDays size={15}/> Kiedy?</span>
            <button type="button" className="search-v3-date-trigger" onClick={toggleDatePanel} aria-expanded={dateOpen}>
              <strong>{dateSummary}</strong><ChevronDown size={15}/>
            </button>
            {dateOpen && (
              <div className="search-v3-calendar-popover search-v3-calendar-esky" role="dialog" aria-label="Wybierz termin podróży">
                <div className="search-v3-esky-top">
                  <button type="button" className="search-v3-esky-back" aria-label="Zamknij kalendarz" onClick={() => setDateOpen(false)}><ChevronLeft size={20}/></button>
                  <button type="button" className="search-v3-esky-summary" onClick={() => setCalendarView("calendar")}>
                    <small>Kiedy?</small>
                    <strong>{dateSummary}</strong>
                  </button>
                  <div className="search-v3-esky-summary">
                    <small>Na jak długo?</small>
                    <strong>{duration === "all" ? "Dowolnie" : duration.replace("-", " – ") + (duration === "1-2" ? " noce" : " nocy")}</strong>
                  </div>
                  <button
                    type="button"
                    className="search-v3-esky-clear"
                    aria-label="Wyczyść termin"
                    onClick={() => {
                      setDateMode("any");
                      setMonth("");
                      setDateFrom("");
                      setDateTo("");
                      setDuration("all");
                      setWeekendOnly(false);
                    }}
                  ><Trash2 size={18}/></button>
                </div>

                <div className="search-v3-esky-tabs" role="tablist" aria-label="Sposób wyboru terminu">
                  <button type="button" className={calendarView === "calendar" ? "active" : ""} onClick={() => setCalendarView("calendar")}>Kalendarz</button>
                  <button type="button" className={calendarView === "months" ? "active" : ""} onClick={() => setCalendarView("months")}>Miesiące</button>
                </div>

                {calendarView === "calendar" ? (
                  <div className="search-v3-esky-calendar-scroll">
                    {[visibleCalendarMonth, addMonths(visibleCalendarMonth, 1), addMonths(visibleCalendarMonth, 2)].map((calendarValue) => {
                      const cells = calendarCells(calendarValue);
                      return (
                        <section className="search-v3-esky-month" key={calendarValue}>
                          <h3>{monthLabel(calendarValue)}</h3>
                          <div className="search-v3-calendar-weekdays" aria-hidden="true">
                            {["pon.","wt.","śr.","czw.","pt.","sob.","niedz."].map((day) => <span key={day}>{day}</span>)}
                          </div>
                          <div className="search-v3-calendar-grid">
                            {cells.map((cell, index) => {
                              if (!cell) return <span className="empty" key={`${calendarValue}-empty-${index}`} />;
                              const selectedExact = dateMode === "exact" && dateFrom === cell.iso;
                              const rangeStart = dateMode === "range" && dateFrom === cell.iso;
                              const rangeEnd = dateMode === "range" && dateTo === cell.iso;
                              const inRange = dateMode === "range" && Boolean(dateFrom && dateTo && cell.iso > dateFrom && cell.iso < dateTo);
                              const className = [
                                selectedExact || rangeStart || rangeEnd ? "selected" : "",
                                rangeStart ? "range-start" : "",
                                rangeEnd ? "range-end" : "",
                                inRange ? "in-range" : "",
                              ].filter(Boolean).join(" ");
                              return (
                                <button
                                  type="button"
                                  key={cell.iso}
                                  className={className}
                                  onClick={() => {
                                    if (dateMode === "range") selectCalendarDay(cell.iso);
                                    else {
                                      setDateMode("exact");
                                      setDateFrom(cell.iso);
                                      setDateTo(cell.iso);
                                    }
                                  }}
                                  aria-label={cell.iso}
                                >
                                  <span>{cell.day}</span>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="search-v3-esky-months-grid">
                    {Array.from({ length: 12 }, (_, offset) => addMonths(localMonthKey(), offset)).map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={month === value ? "active" : ""}
                        onClick={() => {
                          setDateMode("month");
                          setMonth(value);
                          setCalendarMonth(value);
                        }}
                      >
                        <span>{monthLabel(value).split(" ")[0]}</span>
                        <small>{value.slice(0,4)}</small>
                      </button>
                    ))}
                  </div>
                )}

                <div className="search-v3-esky-bottom">
                  <button type="button" className={`search-v3-esky-weekend${weekendOnly ? " active" : ""}`} onClick={() => setWeekendOnly((value) => !value)}>
                    <span className="search-v3-check">{weekendOnly && <Check size={13}/>}</span>
                    Musi zawierać weekend
                    <em>Nowość</em>
                  </button>
                  <div className="search-v3-esky-nights">
                    <strong>Wybierz liczbę nocy</strong>
                    <div>
                      {[
                        ["all","Dowolnie"],["1","1"],["2","2"],["3","3"],["4","4"],["5-7","5–7"],["8-10","8–10"],["11-14","11–14"]
                      ].map(([value,label]) => (
                        <button type="button" key={value} className={duration === value ? "active" : ""} onClick={() => setDuration(value)}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="search-v3-esky-apply" onClick={() => setDateOpen(false)}>Zastosuj</button>
                </div>
              </div>
            )}
          </div>

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
              <option value="750">do 750 zł</option><option value="1000">do 1 000 zł</option><option value="1500">do 1 500 zł</option>
              <option value="2000">do 2 000 zł</option><option value="3000">do 3 000 zł</option><option value="5000">do 5 000 zł</option>
              <option value="7500">do 7 500 zł</option><option value="10000">do 10 000 zł</option><option value="15000">do 15 000 zł</option>
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <div className="search-v3-options-row">
            <button type="button" className={`search-v3-weekend ${weekendOnly ? "active" : ""}`} onClick={() => setWeekendOnly((value) => !value)}>
              <span className="search-v3-check">{weekendOnly && <Check size={13}/>}</span> Pobyt obejmuje sobotę i niedzielę
            </button>
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
          </div>

          <button type="submit" className="search-v3-submit" disabled={loading}><Search size={18}/>{loading ? "Szukamy…" : "Szukaj wyjazdu"}</button>
        </form>

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
            {!loading && results.length === 0 && !expanding && (() => {
              const fallbackDestination = selectedDestinations[0] || destination;
              const fallback = activeTab === "City break" ? cityBreakFallbackLinks(fallbackDestination) : null;
              return <div className="search-v3-empty">
                <strong>{fallback ? "Nie ma teraz gotowego pakietu — ale nadal możesz złożyć city break." : "Spróbuj trochę szerzej."}</strong>
                <span>{fallback ? "Sprawdź lot i nocleg osobno u partnerów Tripowni albo zmień filtry pakietu." : "Usuń jeden filtr lub wybierz Inspiracje — Tripownia spróbuje znaleźć więcej aktualnych opcji."}</span>
                {fallback && <div className="search-v3-empty-actions">
                  <a href={fallback.kiwi} target="_blank" rel="sponsored noopener noreferrer">Sprawdź loty w Kiwi.com</a>
                  <a href={fallback.booking} target="_blank" rel="sponsored noopener noreferrer">Sprawdź noclegi w Booking.com</a>
                </div>}
              </div>;
            })()}
          </div>
        )}
      </div>
    </section>
  );
}
