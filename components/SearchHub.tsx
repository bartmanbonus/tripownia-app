"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, MapPin, Plane, Search, Trash2, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { airportOptions } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches, normalizeDestination, type WorldDestination } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";
import { rankSearchOffers, searchTier } from "@/lib/searchOfferRanking";
import { partners } from "@/lib/partners";
import FlexibleFlightsExplorer from "@/components/FlexibleFlightsExplorer";
import TravelpayoutsFlightsWidget from "@/components/TravelpayoutsFlightsWidget";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";

type Props = {
  initialAirports?: string[];
  initialDestinations?: string[];
  initialDuration?: string;
  searchRequest?: number;
  initialTab?: string;
  initialBoard?: string;
  initialDateMode?: "any" | "exact" | "month" | "range";
  initialDateFrom?: string;
  initialDateTo?: string;
  initialMonth?: string;
  initialWeekendOnly?: boolean;
  embedded?: boolean;
  destinationQuickPicks?: string[];
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

function uniqueOfferVariants(rows: any[]) {
  return rankSearchOffers(rows);
}

function diversifyOfferVariants(rows: any[], limit = 400, _perDirection?: number) {
  return rankSearchOffers(rows, limit);
}

function canonicalSearchDestination(value: string) {
  const normalized = value.trim();
  if (/\bbergamo\b/i.test(normalized)) return "Mediolan, Włochy";
  if (/\bmilan\b/i.test(normalized)) return "Mediolan";
  if (/\bsajgon\b/i.test(normalized)) return "Ho Chi Minh, Wietnam";
  return normalized;
}

function destinationPartnerLinks(destination: string) {
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

function standaloneFlightPartnerUrl(
  destinations: string[],
  departures: string[],
  options: { adults: number; cabin: string; tripType: "round" | "oneway"; outbound?: string; inbound?: string },
) {
  const target = destinations[0]?.trim() || "";
  const kiwiBase = new URL("https://www.kiwi.com/pl/");
  if (target) kiwiBase.searchParams.set("destination", target);
  if (departures.length === 1) kiwiBase.searchParams.set("origin", departures[0]);
  if (options.outbound) kiwiBase.searchParams.set("outboundDate", options.outbound);
  if (options.tripType === "round" && options.inbound) kiwiBase.searchParams.set("inboundDate", options.inbound);
  kiwiBase.searchParams.set("adults", String(Math.max(1, options.adults)));
  if (options.cabin !== "ECONOMY") kiwiBase.searchParams.set("cabinClass", options.cabin);
  kiwiBase.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(kiwiBase.toString());
}

function standaloneHotelPartnerUrl(destinations: string[], from?: string, to?: string) {
  const target = destinations[0]?.trim() || "";
  const bookingBase = new URL("https://www.booking.com/searchresults.pl.html");
  if (target) bookingBase.searchParams.set("ss", target);
  if (/^\d{4}-\d{2}-\d{2}$/.test(from || "") && /^\d{4}-\d{2}-\d{2}$/.test(to || "") && String(to) > String(from)) {
    bookingBase.searchParams.set("checkin", String(from));
    bookingBase.searchParams.set("checkout", String(to));
  }
  return partners.booking.buildUrl(bookingBase.toString());
}

function cleanRows(rows: any[], query: string) {
  const cleaned = rows
    .filter((o: any) => ["exim", "tui"].includes(String(o.partner || "").toLowerCase()))
    .filter((o: any) => isTravelDestinationAllowed(String(o.city || ""), String(o.country || "")))
    .sort((a: any, b: any) => Number(a.price || Infinity) - Number(b.price || Infinity));

  return uniqueOfferVariants(cleaned);
}

function isoMs(value: string) {
  if (!value) return Number.NaN;
  const ms = new Date(`${value}T00:00:00Z`).getTime();
  return Number.isFinite(ms) ? ms : Number.NaN;
}

function offerStartMs(offer: any) {
  return isoMs(String(offer?.startDateISO || ""));
}

function apiDepartureWindow(preference: DatePreference) {
  if (preference.mode === "exact" && /^\d{4}-\d{2}-\d{2}$/.test(preference.from)) {
    return { start: preference.from, end: preference.from };
  }
  if (preference.mode === "range") {
    const from = /^\d{4}-\d{2}-\d{2}$/.test(preference.from) ? preference.from : "";
    const to = /^\d{4}-\d{2}-\d{2}$/.test(preference.to) ? preference.to : "";
    if (from || to) return { start: from || to, end: to || from };
  }
  if (preference.mode === "month" && /^\d{4}-\d{2}$/.test(preference.month)) {
    const [year, month] = preference.month.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      start: `${preference.month}-01`,
      end: `${preference.month}-${String(lastDay).padStart(2, "0")}`,
    };
  }
  return { start: "", end: "" };
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
    const tier = searchTier(a) - searchTier(b);
    if (tier) return tier;
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
  initialTab = "Lot + hotel",
  initialBoard = "all",
  initialDateMode = "any",
  initialDateFrom = "",
  initialDateTo = "",
  initialMonth = "",
  initialWeekendOnly = false,
  embedded = false,
  destinationQuickPicks = [],
}: Props) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [destination, setDestination] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(initialDestinations);
  const [departures, setDepartures] = useState<string[]>(initialAirports);
  const [departureOpen, setDepartureOpen] = useState(false);
  const [departureQuery, setDepartureQuery] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>(initialTab === "Hotele" && initialDateMode === "any" ? "range" : initialDateMode);
  const [dateOpen, setDateOpen] = useState(false);
  const [month, setMonth] = useState(initialMonth);
  const [calendarMonth, setCalendarMonth] = useState(initialMonth || initialDateFrom.slice(0, 7));
  const [calendarView, setCalendarView] = useState<"calendar" | "months">("calendar");
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [duration, setDuration] = useState(initialDuration || "all");
  const [budget, setBudget] = useState("all");
  const [customBudgetMin, setCustomBudgetMin] = useState("");
  const [customBudgetMax, setCustomBudgetMax] = useState("");
  const [board, setBoard] = useState(initialBoard);
  const [weekendOnly, setWeekendOnly] = useState(initialWeekendOnly);
  const [flightAdults, setFlightAdults] = useState(1);
  const [flightCabin, setFlightCabin] = useState("ECONOMY");
  const [flightTripType, setFlightTripType] = useState<"round" | "oneway">("round");
  const [flightSearchMode, setFlightSearchMode] = useState<"flex" | "exact">("flex");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [remoteDestinations, setRemoteDestinations] = useState<WorldDestination[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [resultLocation, setResultLocation] = useState("");
  const [resultSort, setResultSort] = useState<"recommended" | "price" | "rating" | "nights">("price");
  const [visibleCount, setVisibleCount] = useState(18);
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState("");
  const destinationRef = useRef<HTMLDivElement>(null);
  const departureRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const searchRunRef = useRef(0);

  const filteredAirports = useMemo(() => {
    const query = departureQuery.trim().toLocaleLowerCase("pl-PL");
    if (!query) return airportOptions;
    return airportOptions.filter((airport:any) => `${airport.label} ${airport.code}`.toLocaleLowerCase("pl-PL").includes(query));
  }, [departureQuery]);

  const suggestions = useMemo(() => {
    const query = destination.trim();
    const source = query ? [...WORLD_DESTINATIONS, ...remoteDestinations] : WORLD_DESTINATIONS;
    const seen = new Set<string>();
    return source
      .filter((x) => isTravelDestinationAllowed(x.label, x.region))
      .filter((x) => !selectedDestinations.includes(x.label))
      .filter((x) => !query || destinationMatches(query, x))
      .filter((x) => {
        const key = normalizeDestination(x.label);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [destination, selectedDestinations, remoteDestinations]);

  useEffect(() => {
    const query = destination.trim();
    if (query.length < 2) {
      setRemoteDestinations([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/destination-search?q=${encodeURIComponent(query)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || data?.ok === false || !Array.isArray(data?.suggestions)) return;
        setRemoteDestinations(data.suggestions);
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") setRemoteDestinations([]);
      }
    }, 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [destination]);

  const resultLocations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const offer of results) {
      const label = String(offer?.city || offer?.country || "").trim();
      if (!label) continue;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pl"))
      .slice(0, 12);
  }, [results]);

  const visibleResults = useMemo(() => {
    const filtered = resultLocation
      ? results.filter((offer) => String(offer?.city || offer?.country || "").trim() === resultLocation)
      : [...results];

    if (resultSort === "price") return rankSearchOffers(filtered);
    if (resultSort === "rating") return [...filtered].sort((a, b) => Number(b?.score || 0) - Number(a?.score || 0) || Number(a?.price || Infinity) - Number(b?.price || Infinity));
    if (resultSort === "nights") return [...filtered].sort((a, b) => Number(a?.nights || Infinity) - Number(b?.nights || Infinity) || Number(a?.price || Infinity) - Number(b?.price || Infinity));
    return filtered;
  }, [results, resultLocation, resultSort]);

  useEffect(() => {
    setDestination("");
    setSelectedDestinations(initialDestinations);
    setDepartures(initialAirports);
    setDuration(initialDuration || "all");
    setActiveTab(initialTab);
    setBoard(initialBoard);
    setDateMode(initialDateMode);
    setDateFrom(initialDateFrom);
    setDateTo(initialDateTo);
    setMonth(initialMonth);
    setCalendarMonth(initialMonth || initialDateFrom.slice(0, 7));
    setWeekendOnly(initialWeekendOnly);
  }, [
    initialAirports.join("|"),
    initialDestinations.join("|"),
    initialDuration,
    initialTab,
    initialBoard,
    initialDateMode,
    initialDateFrom,
    initialDateTo,
    initialMonth,
    initialWeekendOnly,
  ]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) setSuggestionsOpen(false);
      if (departureRef.current && !departureRef.current.contains(event.target as Node)) setDepartureOpen(false);
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setDateOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Keep keyboard users inside the open picker and return to its trigger on close.
  useEffect(() => {
    const host = dateOpen ? dateRef.current : departureOpen ? departureRef.current : suggestionsOpen ? destinationRef.current : null;
    const panel = host?.querySelector<HTMLElement>('[role="dialog"]');
    if (!panel) return;
    const trigger = host?.querySelector<HTMLElement>('input, button');
    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, a[href], [tabindex="0"]')).filter(node => node.getClientRects().length > 0);
    if (!suggestionsOpen) focusable()[0]?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    const fullscreen = window.matchMedia('(max-width: 640px)').matches && (dateOpen || departureOpen);
    if (fullscreen) document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDateOpen(false);
        setDepartureOpen(false);
        setSuggestionsOpen(false);
      }
      if (event.key === 'Tab' && !suggestionsOpen) {
        const nodes = focusable();
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (fullscreen) document.body.style.overflow = previousOverflow;
      if (panel.contains(document.activeElement) || document.activeElement === document.body) trigger?.focus({ preventScroll: true });
    };
  }, [dateOpen, departureOpen, suggestionsOpen]);

  useEffect(() => {
    if (searchRequest > 0) void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchRequest]);

  async function runSearch(destinationOverride?: string, overrides: SearchOverrides = {}) {
    const runId = ++searchRunRef.current;
    const typed = (destinationOverride ?? destination).trim();
    const typedDestinations = typed
      ? typed.split(/[;\n]+/).map((item) => item.trim()).filter(Boolean)
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
    const parsedCustomMin = Math.max(0, Number(customBudgetMin || 0));
    const parsedCustomMax = Math.max(0, Number(customBudgetMax || 0));
    const activeMinBudget = activeBudget === "custom"
      ? parsedCustomMin && parsedCustomMax ? Math.min(parsedCustomMin, parsedCustomMax) : parsedCustomMin
      : 0;
    const activeMaxBudget = activeBudget === "custom"
      ? parsedCustomMin && parsedCustomMax ? Math.max(parsedCustomMin, parsedCustomMax) : parsedCustomMax
      : activeBudget !== "all" ? Math.max(0, Number(activeBudget || 0)) : 0;
    const activeBoard = overrides.board ?? board;
    const activeWeekend = overrides.weekendOnly ?? weekendOnly;
    const activeMode = overrides.tab ?? activeTab;
    const datePreference: DatePreference = {
      mode: overrides.dateMode ?? dateMode,
      month: overrides.month ?? month,
      from: overrides.dateFrom ?? dateFrom,
      to: overrides.dateTo ?? dateTo,
    };
    const apiDates = apiDepartureWindow(datePreference);
    // One request can cover several selected airports because the API accepts
    // a comma-separated airport list. This avoids repeating the same feed scan.
    const origins = departures.length ? [departures.join(",")] : [""];
    const targets = requested.length ? requested : [""];

    setLoading(true);
    setExpanding(false);
    setSearched(true);
    setVisibleCount(18);
    setResultLocation("");
    setResultSort("price");
    setSuggestionsOpen(false);
    setDepartureOpen(false);
    setDateOpen(false);
    setNotice("");

    const fetchBatch = async ({
      includeFilters = true,
      includeDates = true,
      includeDepartures = true,
      rescue,
    }: {
      includeFilters?: boolean;
      includeDates?: boolean;
      includeDepartures?: boolean;
      rescue?: "1" | "full";
    } = {}) => {
      const batchOrigins = includeDepartures ? origins : [""];
      const combinations = targets.flatMap((target) => batchOrigins.map((origin) => ({ target, origin }))).slice(0, 20);
      const payloads = await Promise.all(combinations.map(async ({ target, origin }) => {
        const params = new URLSearchParams({ mode: activeMode === "City break" ? "citybreak" : "search" });
        if (activeMode === "All Inclusive") params.set("board", "allinclusive");
        if (activeMode === "Last minute") params.set("lastMinute", "1");
        if (target) params.set("q", target);
        else params.set("broad", "1");
        if (rescue) params.set("rescue", rescue);
        if (origin) params.set("from", origin);
        params.set("strict", "1");
        if (activeMinBudget > 0) params.set("minPrice", String(activeMinBudget));
        if (activeMaxBudget > 0) params.set("maxPrice", String(activeMaxBudget));
        if (includeDates) {
          if (apiDates.start) params.set("start", apiDates.start);
          if (apiDates.end) params.set("end", apiDates.end);
          if (apiDates.start || apiDates.end) params.set("dateKind", "departure");
        }
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
        failed: payloads.filter(data => !data).length,
        offers: payloads.flatMap((data) => Array.isArray(data?.offers) ? data.offers : []),
        notice: payloads.map((data) => String(data?.notice || "")).find(Boolean) || "",
      };
    };

    try {
      const exact = await fetchBatch();
      if (runId !== searchRunRef.current) return;

      const perDirection = 400;
      let rows = diversifyOfferVariants(
        cleanRows(exact.offers, requested.length ? "multi" : ""),
        400,
        perDirection
      );
      let datePass = prioritizeByDate(rows, datePreference);
      rows = datePass.rows;
      const exactCount = rows.length;
      setNotice(exact.notice);
      setResults(rows);
      setLoading(false);

      let relaxedFilters = false;
      let expandedScope = false;
      let usedRescue = false;

      // Keep the chosen date and airports first, but relax secondary filters
      // so one strict setting does not collapse the whole result set.
      if (rows.length < 24 && (activeDuration !== "all" || activeWeekend || activeBoard !== "all")) {
        setExpanding(true);
        const relaxed = await fetchBatch({ includeFilters: false });
        if (runId !== searchRunRef.current) return;
        const previousCount = rows.length;
        const relaxedRows = cleanRows(relaxed.offers, requested.length ? "multi" : "").map(offer => ({ ...offer, searchTier: 1, searchAlternative: "Inne wyżywienie lub długość pobytu" }));
        rows = diversifyOfferVariants([...rows, ...relaxedRows], 400, perDirection);
        relaxedFilters = rows.length > previousCount;
        datePass = prioritizeByDate(rows, datePreference);
        rows = datePass.rows;
        setResults(rows);
      }

      // If "Gdziekolwiek" is still sparse, fan out across concrete destinations.
      // Individual destination feeds are much more reliable than one giant broad feed.
      if (rows.length < 48) {
        setExpanding(true);
        const previousCount = rows.length;

        if (!requested.length) {
          const rescued = await fetchBatch({
            includeFilters: false,
            includeDates: true,
            includeDepartures: false,
            rescue: "1",
          });
          if (runId !== searchRunRef.current) return;

          const rescuedRows = prioritizeByDate(
            cleanRows(rescued.offers, "").map(offer => ({ ...offer, searchTier: 2, searchAlternative: "Alternatywa — sprawdź termin, wylot i wyżywienie" })),
            datePreference
          ).rows;

          rows = diversifyOfferVariants([...rows, ...rescuedRows], 400, 12);
          usedRescue = rescuedRows.length > 0;
        } else {
          const broader = await fetchBatch({
            includeFilters: false,
            includeDates: false,
            includeDepartures: false,
          });
          if (runId !== searchRunRef.current) return;
          const broaderRows = prioritizeByDate(
            cleanRows(broader.offers, "multi").map(offer => ({ ...offer, searchTier: 2, searchAlternative: "Alternatywa — sprawdź termin, wylot i wyżywienie" })),
            datePreference
          ).rows;
          rows = diversifyOfferVariants([...rows, ...broaderRows], 400, perDirection);
        }

        expandedScope = rows.length > previousCount;
        setResults(rows);
      }

      if (!rows.length && activeMode === "City break" && !requested.length) {
        const broadParams = new URLSearchParams({ mode: "citybreak", broad: "1" });
        const broadResponse = await fetch(`/api/today-offers?${broadParams.toString()}`, { cache: "no-store" });
        const broadData = await broadResponse.json();
        if (runId !== searchRunRef.current) return;
        if (broadResponse.ok && broadData?.ok !== false) {
          rows = diversifyOfferVariants(
            cleanRows(Array.isArray(broadData?.offers) ? broadData.offers : [], "").filter(offer => (!activeMinBudget || offer.price >= activeMinBudget) && (!activeMaxBudget || offer.price <= activeMaxBudget)).map(offer => ({ ...offer, searchTier: 2, searchAlternative: "Alternatywa — sprawdź termin, wylot i wyżywienie" })),
            400,
            10
          );
          expandedScope = rows.length > 0;
          datePass = prioritizeByDate(rows, datePreference);
          rows = datePass.rows;
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
        const expansionNotice = usedRescue
          ? "Dodatkowo pokazujemy oznaczone alternatywy z innych terminów lub lotnisk. Sprawdź daty i wylot na karcie."
          : expandedScope
            ? `Dokładnych dopasowań: ${exactCount}. Dalej pokazujemy najbliższe dostępne alternatywy, żeby nie kończyć wyszukiwania na kilku kartach.`
            : "";
        setNotice([
          prefix,
          `Zakres: ${scope}. Najtańsze najpierw w każdej grupie dopasowania.`,
          exact.notice,
          exact.failed ? "Część wyszukiwania nie powiodła się. Wyniki mogą być niepełne." : "",
          relaxedFilters ? "Część propozycji ma inną długość pobytu, wyżywienie lub nie obejmuje weekendu." : "",
          expansionNotice,
          !expandedScope && !usedRescue ? datePass.notice : "",
        ].filter(Boolean).join(" "));
      } else {
        setNotice(exact.failed ? "Nie udało się pobrać części ofert. Spróbuj ponownie — to nie oznacza braku wyjazdów dla tych ustawień." : bergamoMapped
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

    if (activeTab === "Loty" || activeTab === "Hotele") {
      const typed = destination.trim();
      const destinations = Array.from(new Set([
        ...selectedDestinations,
        ...(typed ? typed.split(/[;\n]+/).map((item) => canonicalSearchDestination(item.trim())).filter(Boolean) : []),
      ])).filter((item) => !isTravelDestinationBlocked(item));

      if (activeTab === "Hotele" && !destinations.length) {
        setSearched(false);
        setResults([]);
        setNotice("Wybierz miasto lub kraj, żeby wyszukać nocleg.");
        setSuggestionsOpen(true);
        return;
      }

      const conversionContext = {
        mode: activeTab.toLowerCase(),
        destination: destinations.join(" + ").slice(0, 160) || "dowolnie",
        departure: departures.join(",").slice(0, 80) || "dowolnie",
        placement: "searchhub",
      };

      if (activeTab === "Loty") {
        const params = new URLSearchParams();
        if (destinations[0]) params.set("destination", destinations[0]);
        if (departures[0]) params.set("origin", departures[0]);
        if (dateFrom) params.set("outbound", dateFrom);
        if (flightTripType === "round" && dateTo) params.set("inbound", dateTo);
        params.set("adults", String(flightAdults));
        params.set("cabin", flightCabin);
        params.set("tripType", flightTripType);
        trackEvent("flight_compare_intent", conversionContext);
        setSearched(true);
        setResults([]);
        setNotice("Otwieramy porównywarkę lotów Tripowni.");
        window.location.assign(`/loty?${params.toString()}`);
        return;
      }

      if (pathname !== "/hotele") {
        const params = new URLSearchParams();
        if (destinations[0]) params.set("destination", destinations[0]);
        if (departures[0]) params.set("origin", departures[0]);
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);
        trackEvent("hotel_search_intent", conversionContext);
        setSearched(true);
        setResults([]);
        setNotice("Otwieramy wyszukiwarkę noclegów Tripowni.");
        window.location.assign(`/hotele?${params.toString()}`);
        return;
      }

      const outboundParams = { ...conversionContext, partner: "booking" };
      trackEvent("outbound_partner_click", outboundParams);
      trackMetaCustomEvent("PartnerOutboundClick", outboundParams);
      setSearched(true);
      setResults([]);
      setNotice("Sprawdzamy aktualną dostępność noclegów.");
      window.location.assign(standaloneHotelPartnerUrl(destinations, dateFrom, dateTo));
      return;
    }

    void runSearch();
  }

  function searchNearestDates() {
    setDateMode("any");
    setMonth("");
    setDateFrom("");
    setDateTo("");
    void runSearch(undefined, { dateMode: "any", month: "", dateFrom: "", dateTo: "" });
  }

  function relaxSearchFilters() {
    setDuration("all");
    setBudget("all");
    setCustomBudgetMin("");
    setCustomBudgetMax("");
    setBoard("all");
    setWeekendOnly(false);
    void runSearch(undefined, {
      duration: "all",
      budget: "all",
      board: "all",
      weekendOnly: false,
    });
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
    if (tab === "Hotele") { setDateMode("range"); setMonth(""); }
    setDuration("all");
    setBudget("all");
    setCustomBudgetMin("");
    setCustomBudgetMax("");
    setBoard("all");
    setWeekendOnly(false);
    setSearched(false);
    setResults([]);
    setResultLocation("");
    setVisibleCount(18);
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
    setFlightAdults(1);
    setFlightCabin("ECONOMY");
    setFlightTripType("round");
    setFlightSearchMode("flex");
    setResults([]);
    setResultLocation("");
    setVisibleCount(18);
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

  const budgetSummary = useMemo(() => {
    if (budget === "all") return "dowolny budżet";
    if (budget !== "custom") return `do ${Number(budget).toLocaleString("pl-PL")} zł/os.`;
    const min = Math.max(0, Number(customBudgetMin || 0));
    const max = Math.max(0, Number(customBudgetMax || 0));
    if (min && max) return `${Math.min(min, max).toLocaleString("pl-PL")}–${Math.max(min, max).toLocaleString("pl-PL")} zł/os.`;
    if (min) return `od ${min.toLocaleString("pl-PL")} zł/os.`;
    if (max) return `do ${max.toLocaleString("pl-PL")} zł/os.`;
    return "własny budżet";
  }, [budget, customBudgetMin, customBudgetMax]);

  const budgetInvalid = budget === "custom"
    && Number(customBudgetMin || 0) > 0
    && Number(customBudgetMax || 0) > 0
    && Number(customBudgetMin) > Number(customBudgetMax);

  const visibleCalendarMonth = calendarMonth || month || dateFrom.slice(0, 7) || localMonthKey();
  const now = new Date();
  const todayISO = `${localMonthKey()}-${String(now.getDate()).padStart(2, "0")}`;
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
    ["Mediolan, Włochy", "Mediolan / Bergamo", { duration: "3-4", budget: "1500", weekendOnly: false, tab: "City break" }],
    ["Zanzibar, Tanzania", "Egzotyka: Zanzibar", { duration: "11-14", budget: "7500", tab: "Wakacje" }],
  ];

  return (
    <section className={embedded ? "search-v3-section search-v3-embedded" : "section shell search-v3-section"} id={embedded ? undefined : "wyszukiwarka"}>
      <div className="search-v3">
        <div className="search-v3-head">
          <div>
            <small>WYSZUKIWARKA TRIPOWNI</small>
            {!embedded && <h2>{activeTab === "Loty" ? "Znajdź najlepszy lot" : "Gdzie chcesz lecieć?"}</h2>}
            {!embedded && <p>{activeTab === "Loty" ? "Wpisz dowolny kierunek, wybierz lotnisko, daty i podróżnych. Porównanie zaczynasz w Tripowni." : "Wybierz kierunki i lotniska. Zostaw puste, jeśli chcesz szukać wszędzie."}</p>}
          </div>
          <button type="button" className="search-v3-reset" onClick={resetSearch}>Wyczyść</button>
        </div>

        {embedded && destinationQuickPicks.length > 0 && (
          <div className="search-v3-destination-picks" aria-label="Szybki wybór kierunku">
            <span>Szybki wybór</span>
            <div>
              {destinationQuickPicks.map((place) => {
                const active = selectedDestinations.length === 1 && selectedDestinations[0] === place;
                return (
                  <button
                    key={place}
                    type="button"
                    className={active ? "active" : ""}
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedDestinations([place]);
                      setDestination("");
                      setSuggestionsOpen(false);
                      setSearched(false);
                      setNotice("");
                    }}
                  >
                    {place}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="search-v3-tabs" role="group" aria-label="Rodzaj podróży">
          {["Loty", "Hotele", "All Inclusive", "City break", "Lot + hotel"].map((tab) => (
            <button key={tab} type="button" aria-pressed={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => chooseTab(tab)}>{tab}</button>
          ))}
        </div>

        {activeTab === "Loty" ? (
          <div className="search-v3-flight-center">
            <div className="search-v3-flight-mode-switch" role="tablist" aria-label="Sposób wyszukiwania lotów">
              <button
                type="button"
                role="tab"
                aria-selected={flightSearchMode === "flex"}
                className={flightSearchMode === "flex" ? "active" : ""}
                onClick={() => setFlightSearchMode("flex")}
              >
                <strong>Szukam okazji</strong>
                <span>Elastyczne daty i Gdziekolwiek</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={flightSearchMode === "exact"}
                className={flightSearchMode === "exact" ? "active" : ""}
                onClick={() => setFlightSearchMode("exact")}
              >
                <strong>Mam konkretne daty</strong>
                <span>Porównaj dokładny lot</span>
              </button>
            </div>

            {flightSearchMode === "flex" ? (
              <FlexibleFlightsExplorer />
            ) : (
              <div className="search-v3-flight-exact">
                <div className="search-v3-flight-exact-head">
                  <div className="kicker">KONKRETNY TERMIN</div>
                  <h3>Porównaj loty dla wybranych dat</h3>
                  <p>Wyszukaj dokładną trasę i termin w porównywarce Tripowni.</p>
                </div>
                <TravelpayoutsFlightsWidget />
              </div>
            )}
          </div>
        ) : (
        <form className={`search-v3-form${activeTab === "Hotele" ? " is-hotels" : ""}`} onSubmit={submitSearch}>
          <div className={`search-v3-field search-v3-destination${suggestionsOpen ? " is-open" : ""}`} ref={destinationRef}>
            <label htmlFor="tripownia-destination"><MapPin size={15}/> Dokąd? <small>wiele kierunków</small></label>
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
                placeholder={selectedDestinations.length ? "Dodaj kolejny kierunek" : "Gdziekolwiek lub np. Rzym, Malta, Tokio"}
                autoComplete="off"
              />
              {destination && <button type="button" aria-label="Wyczyść wpisany kierunek" onClick={() => { setDestination(""); setSuggestionsOpen(true); }}><X size={16}/></button>}
            </div>

            {suggestionsOpen && (
              <div className="search-v3-suggestions" role="dialog" aria-label="Wybierz kierunki">
                <div className="search-v3-panel-head">
                  <div><strong>Wpisz kierunek</strong><small>Możesz wpisać dowolne miasto lub kraj na świecie — np. Ljubljana.</small></div>
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
                  {destination.trim() && !isTravelDestinationBlocked(destination) && (
                    <button type="button" className="search-v3-use-exact" onClick={() => {
                      setSelectedDestinations((current) => Array.from(new Set([...current, canonicalSearchDestination(destination.trim())])));
                      setDestination("");
                      setSuggestionsOpen(false);
                    }}><Search size={15}/><span><strong>Szukaj: „{destination.trim()}”</strong><small>Dowolne miasto lub kraj — nie musi być na liście</small></span></button>
                  )}
                  {!destination.trim() && activeTab !== "Hotele" && (
                    <button type="button" className="search-v3-anywhere" onClick={() => { setSelectedDestinations([]); setDestination(""); setSuggestionsOpen(false); }}>
                      <MapPin size={15}/><span><strong>🌍 Gdziekolwiek</strong><small>Bez ograniczenia kierunku — pokaż najlepsze dostępne opcje</small></span>
                    </button>
                  )}
                  {suggestions.map((item) => (
                    <button key={item.label} type="button" onClick={() => {
                      const next = canonicalSearchDestination(item.label);
                      setSelectedDestinations((current) => Array.from(new Set([...current, next])));
                      setDestination("");
                      setSuggestionsOpen(false);
                    }}>
                      <MapPin size={15}/><span><strong>{item.label}</strong><small>{item.region} · wybierz kierunek</small></span>
                    </button>
                  ))}
                </div>

                <div className="search-v3-panel-footer">
                  <span>{selectedDestinations.length ? `Wybrano: ${selectedDestinations.length}` : "Brak ograniczenia kierunku"}</span>
                  <button type="button" onClick={() => setSuggestionsOpen(false)}>Gotowe</button>
                </div>
              </div>
            )}
          </div>

          {activeTab !== "Hotele" && (
          <div className={`search-v3-field search-v3-departure search-v3-multiselect${departureOpen ? " is-open" : ""}`} ref={departureRef}>
            <span><Plane size={15}/> Skąd? <small>wiele lotnisk</small></span>
            <button type="button" className="search-v3-multi-trigger" onClick={toggleDeparturePanel} aria-expanded={departureOpen}>
              <strong>{departures.length ? (departures.length === 1 ? airportOptions.find((a:any) => a.code === departures[0])?.label || departures[0] : `${departures.length} lotniska`) : "Wszystkie lotniska"}</strong>
              <ChevronDown size={15}/>
            </button>
            {departureOpen && (
              <div className="search-v3-departure-menu search-v3-airport-picker" role="dialog" aria-label="Wybierz lotniska wylotu">
                <div className="search-v3-panel-head">
                  <div><strong>Skąd chcesz lecieć?</strong><small>Zaznacz jedno lub kilka lotnisk.</small></div>
                  <button type="button" className="search-v3-panel-close" aria-label="Zamknij wybór lotnisk" onClick={() => setDepartureOpen(false)}><X size={18}/></button>
                </div>
                <label className="search-v3-airport-search">
                  <Search size={17}/>
                  <input value={departureQuery} onChange={(event) => setDepartureQuery(event.target.value)} placeholder="Wpisz miasto lub kod lotniska" autoFocus />
                  {departureQuery && <button type="button" aria-label="Wyczyść wyszukiwanie lotniska" onClick={() => setDepartureQuery("")}><X size={15}/></button>}
                </label>
                <div className="search-v3-panel-scroll search-v3-airport-list">
                  {!departureQuery && <div className="search-v3-airport-section-label">POPULARNE LOTNISKA W POLSCE</div>}
                  {!departureQuery && (
                    <button type="button" aria-pressed={!departures.length} className={!departures.length ? "active" : ""} onClick={() => setDepartures([])}>
                      <span className="search-v3-option-check">{!departures.length && <Check size={14}/>}</span><span><strong>Wszystkie lotniska</strong><small>Nie ograniczaj miejsca wylotu</small></span>
                    </button>
                  )}
                  {filteredAirports.map((airport:any) => {
                    const active = departures.includes(airport.code);
                    return <button type="button" aria-pressed={active} className={active ? "active" : ""} key={airport.code} onClick={() => setDepartures((current) => active ? current.filter((code) => code !== airport.code) : [...current, airport.code])}>
                      <span className="search-v3-option-check">{active && <Check size={14}/>}</span><span><strong>{airport.label}</strong><small>{airport.code}</small></span>
                    </button>;
                  })}
                  {filteredAirports.length === 0 && <div className="search-v3-airport-empty">Nie znaleźliśmy takiego lotniska.</div>}
                </div>
                <div className="search-v3-panel-footer search-v3-airport-footer">
                  <button type="button" className="search-v3-airport-clear" onClick={() => { setDepartures([]); setDepartureQuery(""); }}>Wyczyść</button>
                  <span>{departures.length ? `Wybrano: ${departures.length}` : "Dowolne lotnisko"}</span>
                  <button type="button" className="search-v3-airport-apply" onClick={() => { setDepartureOpen(false); setDepartureQuery(""); }}>Wybierz</button>
                </div>
              </div>
            )}
          </div>

          )}

          <div className={`search-v3-field search-v3-date search-v3-smart-date${dateOpen ? " is-open" : ""}`} ref={dateRef}>
            <span><CalendarDays size={15}/> {activeTab === "Loty" ? (flightTripType === "round" ? "Wylot i powrót" : "Data wylotu") : activeTab === "Hotele" ? "Pobyt" : "Kiedy?"}</span>
            <button type="button" className="search-v3-date-trigger" onClick={toggleDatePanel} aria-expanded={dateOpen}>
              <strong>{dateSummary}</strong><ChevronDown size={15}/>
            </button>
            {dateOpen && (
              <div className="search-v3-calendar-popover search-v3-calendar-esky" role="dialog" aria-label="Wybierz termin podróży">
                <div className="search-v3-esky-top">
                  <button type="button" className="search-v3-esky-back" aria-label="Zamknij kalendarz" onClick={() => setDateOpen(false)}><X size={20}/></button>
                  <button type="button" className="search-v3-esky-summary" onClick={() => setCalendarView("calendar")}>
                    <small>Kiedy?</small>
                    <strong>{dateSummary}</strong>
                  </button>
                  <div className="search-v3-esky-summary">
                    <small>{activeTab === "Loty" ? "Podróż" : "Na jak długo?"}</small>
                    <strong>{activeTab === "Loty" ? (flightTripType === "round" ? "W obie strony" : "W jedną stronę") : (duration === "all" ? "Dowolnie" : duration.replace("-", " – ") + (duration === "1-2" ? " noce" : " nocy"))}</strong>
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

                <div className="search-v3-esky-tabs" role="group" aria-label="Sposób wyboru terminu">
                  <button type="button" aria-pressed={calendarView === "calendar"} className={calendarView === "calendar" ? "active" : ""} onClick={() => setCalendarView("calendar")}>Kalendarz</button>
                  <button type="button" aria-pressed={calendarView === "months"} className={calendarView === "months" ? "active" : ""} onClick={() => setCalendarView("months")}>Miesiące</button>
                </div>

                {calendarView === "calendar" && <>
                  <div className="search-picker-modes" role="group" aria-label="Termin wylotu">
                    <button type="button" aria-pressed={dateMode !== "range"} onClick={() => { selectDateMode("exact"); if (activeTab === "Loty") { setFlightTripType("oneway"); setDateTo(""); } }}> {activeTab === "Loty" ? "W jedną stronę" : "Konkretny dzień"} </button>
                    <button type="button" aria-pressed={dateMode === "range"} onClick={() => { selectDateMode("range"); setDateFrom(""); setDateTo(""); if (activeTab === "Loty") setFlightTripType("round"); }}>{activeTab === "Loty" ? "Wylot + powrót" : "Zakres od–do"}</button>
                  </div>
                  <div className="search-picker-nav">
                    <button type="button" aria-label="Poprzednie miesiące" disabled={visibleCalendarMonth <= localMonthKey()} onClick={() => setCalendarMonth(addMonths(visibleCalendarMonth, -1))}><ChevronLeft size={18}/></button>
                    <span>{activeTab === "Loty" ? (dateMode === "range" ? "Wybierz datę wylotu, a potem powrotu" : "Wybierz datę wylotu") : activeTab === "Hotele" ? "Wybierz zameldowanie, a potem wymeldowanie" : (dateMode === "range" ? "Wybierz najwcześniejszy i najpóźniejszy wylot" : "Wybierz dzień wylotu")}</span>
                    <button type="button" aria-label="Następne miesiące" onClick={() => setCalendarMonth(addMonths(visibleCalendarMonth, 1))}><ChevronRight size={18}/></button>
                  </div>
                </>}
                {calendarView === "calendar" ? (
                  <div className="search-v3-esky-calendar-scroll" key={visibleCalendarMonth}>
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
                                  disabled={cell.iso < todayISO}
                                  aria-pressed={selectedExact || rangeStart || rangeEnd}
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
                        ["all","Dowolnie"],["1","1"],["2","2"],["3","3"],["4","4"],["5-7","5–7"],["8-10","8–10"],["11-14","11–14"],["15+","15+"]
                      ].map(([value,label]) => (
                        <button type="button" key={value} className={duration === value ? "active" : ""} onClick={() => setDuration(value)}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="search-v3-esky-apply" disabled={dateMode === "range" && (!dateFrom || !dateTo)} onClick={() => setDateOpen(false)}>Zastosuj</button>
                </div>
              </div>
            )}
          </div>

          {activeTab === "Hotele" ? null : activeTab === "Loty" ? (
            <label className="search-v3-field search-v3-duration">
              <span>Podróżni</span>
              <select value={flightAdults} onChange={(event) => setFlightAdults(Number(event.target.value))}>
                {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>{value} {value === 1 ? "osoba" : value < 5 ? "osoby" : "osób"}</option>
                ))}
              </select>
              <ChevronDown size={15} className="search-v3-chevron"/>
            </label>
          ) : (
            <label className="search-v3-field search-v3-duration">
              <span>Na ile?</span>
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                <option value="all">Dowolnie</option>
                <option value="1">1 noc</option><option value="2">2 noce</option><option value="3">3 noce</option><option value="4">4 noce</option>
                <option value="1-2">1–2 noce</option>
                <option value="3-4">3–4 noce</option>
                <option value="5-7">5–7 nocy</option>
                <option value="8-10">8–10 nocy</option>
                <option value="11-14">11–14 nocy</option>
                <option value="15+">15+ nocy</option>
              </select>
              <ChevronDown size={15} className="search-v3-chevron"/>
            </label>
          )}

          {activeTab === "Hotele" ? null : activeTab === "Loty" ? (
            <label className="search-v3-field search-v3-budget">
              <span>Klasa</span>
              <select value={flightCabin} onChange={(event) => setFlightCabin(event.target.value)}>
                <option value="ECONOMY">Ekonomiczna</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First</option>
              </select>
              <ChevronDown size={15} className="search-v3-chevron"/>
            </label>
          ) : (
            <label className="search-v3-field search-v3-budget">
              <span>Budżet / os.</span>
              <select
                value={budget}
                onChange={(event) => {
                  const next = event.target.value;
                  setBudget(next);
                  if (next === "custom" && !customBudgetMin && !customBudgetMax) setCustomBudgetMax("3000");
                }}
              >
                <option value="all">Dowolny</option>
                <option value="750">do 750 zł</option><option value="1000">do 1 000 zł</option><option value="1500">do 1 500 zł</option>
                <option value="2000">do 2 000 zł</option><option value="3000">do 3 000 zł</option><option value="5000">do 5 000 zł</option>
                <option value="7500">do 7 500 zł</option><option value="10000">do 10 000 zł</option><option value="15000">do 15 000 zł</option>
                <option value="custom">Własny zakres…</option>
              </select>
              <ChevronDown size={15} className="search-v3-chevron"/>
            </label>
          )}

          {activeTab !== "Loty" && activeTab !== "Hotele" && budget === "custom" && (
            <div className={`search-v3-budget-custom${budgetInvalid ? " is-invalid" : ""}`} aria-label="Własny zakres budżetu na osobę">
              <div className="search-v3-budget-inputs">
                <label><span>Od</span><div><input type="number" inputMode="numeric" min="0" max="15000" step="50" value={customBudgetMin} onChange={(event) => setCustomBudgetMin(event.target.value.replace(/[^0-9]/g, ""))} placeholder="np. 1500"/><b>zł</b></div></label>
                <label><span>Do</span><div><input type="number" inputMode="numeric" min="0" max="15000" step="50" value={customBudgetMax} onChange={(event) => setCustomBudgetMax(event.target.value.replace(/[^0-9]/g, ""))} placeholder="np. 3000"/><b>zł</b></div></label>
              </div>
              <div className="search-v3-budget-sliders">
                <label><span>Minimum</span><input type="range" min="0" max="15000" step="250" value={Math.min(15000, Math.max(0, Number(customBudgetMin || 0)))} onChange={(event) => { const next = Number(event.target.value); const currentMax = Number(customBudgetMax || 0); setCustomBudgetMin(String(currentMax > 0 ? Math.min(next, currentMax) : next)); }}/></label>
                <label><span>Maksimum</span><input type="range" min="500" max="15000" step="250" value={Math.min(15000, Math.max(500, Number(customBudgetMax || 3000)))} onChange={(event) => { const next = Number(event.target.value); const currentMin = Number(customBudgetMin || 0); setCustomBudgetMax(String(Math.max(next, currentMin || 0))); }}/></label>
              </div>
              <small className={budgetInvalid ? "search-v3-budget-error" : undefined}>
                {budgetInvalid ? "Kwota „Od” nie może być wyższa niż kwota „Do”." : "Filtr działa dokładnie dla podanego zakresu ceny na osobę."}
              </small>
            </div>
          )}

          {activeTab !== "Hotele" && <div className="search-v3-options-row">
            {activeTab === "Loty" ? (
              <div className="search-v3-flight-options" role="group" aria-label="Typ podróży">
                <button type="button" className={flightTripType === "round" ? "active" : ""} onClick={() => { setFlightTripType("round"); if (dateMode === "exact" && dateFrom) setDateMode("range"); }}>W obie strony</button>
                <button type="button" className={flightTripType === "oneway" ? "active" : ""} onClick={() => { setFlightTripType("oneway"); setDateTo(""); if (dateMode === "range") setDateMode(dateFrom ? "exact" : "any"); }}>W jedną stronę</button>
              </div>
            ) : (
              <label className="search-v3-board">
                <span>Wyżywienie</span>
                <select value={board} onChange={(event) => setBoard(event.target.value)}>
                  <option value="all">Dowolne</option>
                  <option value="bez wyżywienia">Bez wyżywienia</option>
                  <option value="śniadanie">Śniadanie</option>
                  <option value="half board">Śniadanie i obiadokolacja</option>
                  <option value="full board">Trzy posiłki</option>
                  <option value="all inclusive">All Inclusive</option>
                  <option value="ultra all inclusive">Ultra All Inclusive</option>
                </select>
              </label>
            )}
          </div>}

          <button type="submit" className="search-v3-submit" disabled={loading || budgetInvalid}><Search size={18}/>{loading ? "Szukamy…" : budgetInvalid ? "Popraw budżet" : activeTab === "Loty" ? "Porównaj loty" : activeTab === "Hotele" ? "Szukaj hoteli" : "Szukaj wyjazdu"}</button>
        </form>
        )}

        {!embedded && activeTab !== "Loty" && activeTab !== "Hotele" && <div className="search-v3-quick">
          <span>Szybki start</span>
          <div>{quickPicks.map(([destinationLabel, label, overrides]) => <button type="button" key={destinationLabel} onClick={() => quickSearch(destinationLabel, overrides)}>{label}</button>)}</div>
        </div>}

        {searched && (
          <div className="search-v3-results">
            <div className="search-v3-active-summary">
              <strong>{selectedDestinations.length ? selectedDestinations.join(" + ") : "Gdziekolwiek"}</strong>
              <span>{departures.length ? departures.length === 1 ? "1 wybrane lotnisko" : `${departures.length} wybrane lotniska` : "Wszystkie lotniska"} · {dateSummary} · {budgetSummary}</span>
            </div>
            <div className="search-v3-results-head" role="status" aria-live="polite">
              <div><small>WYNIKI</small><h3>{expanding ? (results.length ? `Mamy ${results.length} opcji — szukamy jeszcze szerzej…` : "Szukamy szerzej…") : loading ? "Sprawdzamy aktualne oferty…" : results.length ? `Znalezione oferty: ${results.length}` : "Brak dokładnego dopasowania"}</h3></div>
              {notice && <p>{notice}</p>}
            </div>

            {!loading && results.length > 0 && (
              <>
                <div className="search-v3-sales-sort" aria-label="Szybkie sortowanie ofert">
                  <button type="button" className={resultSort === "recommended" ? "active" : ""} onClick={() => { setResultSort("recommended"); setVisibleCount(18); }}>Polecane</button>
                  <button type="button" className={resultSort === "price" ? "active" : ""} onClick={() => { setResultSort("price"); setVisibleCount(18); }}>Najtańsze</button>
                  <button type="button" className={resultSort === "rating" ? "active" : ""} onClick={() => { setResultSort("rating"); setVisibleCount(18); }}>Najwyżej oceniane</button>
                  <button type="button" className={resultSort === "nights" ? "active" : ""} onClick={() => { setResultSort("nights"); setVisibleCount(18); }}>Najkrótsze</button>
                </div>
                {resultLocations.length > 1 && (
                  <div className="search-v3-results-toolbar">
                    <div className="search-v3-result-filters" aria-label="Filtruj wyniki po miejscowości">
                      <span>Miejscowość</span>
                      <button type="button" className={!resultLocation ? "active" : ""} onClick={() => { setResultLocation(""); setVisibleCount(18); }}>
                        Wszystkie <b>{results.length}</b>
                      </button>
                      {resultLocations.map(([location, count]) => (
                        <button type="button" key={location} className={resultLocation === location ? "active" : ""} onClick={() => { setResultLocation(location); setVisibleCount(18); }}>
                          {location} <b>{count}</b>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="search-v3-results-grid">{visibleResults.slice(0, visibleCount).map((offer) => <div key={offer.id} className="search-v3-result-item">{offer.searchAlternative && <p className="search-v3-alternative-label">{offer.searchAlternative}</p>}<OfferCard offer={offer}/></div>)}</div>
                {visibleResults.length > visibleCount && <button className="search-v3-show-more" type="button" onClick={() => setVisibleCount((count) => Math.min(visibleResults.length, count + 12))}>Pokaż kolejne oferty ({visibleResults.length - visibleCount})</button>}
              </>
            )}
            {!loading && results.length === 0 && !expanding && (() => {
              const fallbackDestination = selectedDestinations[0] || destination;
              const fallback = fallbackDestination ? destinationPartnerLinks(fallbackDestination) : null;
              return <div className="search-v3-empty">
                <strong>{fallback ? `Nie mamy teraz gotowego pakietu dla „${fallbackDestination}”.` : "Nie znaleźliśmy dokładnego wariantu dla tych ustawień."}</strong>
                <span>{fallback ? "Możesz sprawdzić loty i noclegi dla tego kierunku albo od razu poszerzyć termin." : "Poszerz termin lub zdejmij dodatkowe filtry — bez wpisywania wyszukiwania od nowa."}</span>
                <div className="search-v3-empty-actions">
                  <button type="button" onClick={searchNearestDates}>Pokaż inne terminy</button>
                  <button type="button" onClick={relaxSearchFilters}>Usuń dodatkowe filtry</button>
                  {fallback && <a href={fallback.kiwi} rel="sponsored">Sprawdź loty</a>}
                  {fallback && <a href={fallback.booking} rel="sponsored">Sprawdź noclegi</a>}
                </div>
              </div>;
            })()}
          </div>
        )}
      </div>
    </section>
  );
}
