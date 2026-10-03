"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, MapPin, Plane, Search, Trash2, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { airportOptions } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches, normalizeDestination, type WorldDestination } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";
import { rankSearchOffers, searchTier } from "@/lib/searchOfferRanking";
import { partners } from "@/lib/partners";
import { eskySearchUrl } from "@/lib/eskySearch";
import { fetchEskyBrowserPackages } from "@/lib/eskyBrowserSearch";
import { isAffordableShortTrip } from "@/lib/offerValuePolicy";
import FlexibleFlightsExplorer from "@/components/FlexibleFlightsExplorer";
import TravelpayoutsFlightsWidget from "@/components/TravelpayoutsFlightsWidget";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { consumeRequestedSearchResume, saveSearchResumeContext, type SearchResumeContext } from "@/lib/searchResume";

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

function diversifyOfferVariants(rows: any[], limit = Number.MAX_SAFE_INTEGER, _perDirection?: number) {
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
    .filter((o: any) => ["exim", "tui", "esky"].includes(String(o.partner || "").toLowerCase()))
    .filter((o: any) => isTravelDestinationAllowed(String(o.city || ""), String(o.country || "")))
    .filter(isAffordableShortTrip)
    .sort((a: any, b: any) => Number(a.price || Infinity) - Number(b.price || Infinity));

  return uniqueOfferVariants(cleaned);
}

function cheapestDirectionRows(rows: any[]) {
  const ranked = rankSearchOffers(rows);
  const best = new Map<string, any>();

  for (const offer of ranked) {
    const city = String(offer?.city || "").trim();
    const country = String(offer?.country || "").trim();
    const key = touristDestinationKey({ city, country }) || normalizeDestination(`${city}|${country}`);
    if (!key) continue;

    const current = best.get(key);
    if (!current
      || searchTier(offer) < searchTier(current)
      || (searchTier(offer) === searchTier(current) && Number(offer?.price || Infinity) < Number(current?.price || Infinity))) {
      best.set(key, offer);
    }
  }

  return Array.from(best.values())
    .sort((a, b) => searchTier(a) - searchTier(b) || Number(a?.price || Infinity) - Number(b?.price || Infinity));
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
  const [anywhereSelected, setAnywhereSelected] = useState(false);
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
  const [resultDestinationCount, setResultDestinationCount] = useState(0);
  const [resultView, setResultView] = useState<"all" | "destinations">("all");
  const [packageSearchLink, setPackageSearchLink] = useState("");
  const [resultSort, setResultSort] = useState<"recommended" | "price" | "rating" | "nights">("price");
  const [visibleCount, setVisibleCount] = useState(18);
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingResume, setPendingResume] = useState<SearchResumeContext | null>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const departureRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const searchRunRef = useRef(0);
  const searchAbortRef = useRef<AbortController | null>(null);
  useEffect(() => () => { searchRunRef.current += 1; searchAbortRef.current?.abort(); }, []);

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
    const displayRows = resultView === "destinations" ? cheapestDirectionRows(filtered) : filtered;

    if (resultSort === "price") return rankSearchOffers(displayRows);
    if (resultSort === "rating") return [...displayRows].sort((a, b) => Number(b?.score || 0) - Number(a?.score || 0) || Number(a?.price || Infinity) - Number(b?.price || Infinity));
    if (resultSort === "nights") return [...displayRows].sort((a, b) => Number(a?.nights || Infinity) - Number(b?.nights || Infinity) || Number(a?.price || Infinity) - Number(b?.price || Infinity));
    return displayRows;
  }, [results, resultLocation, resultSort, resultView]);

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
    const saved = consumeRequestedSearchResume();
    if (!saved) return;

    setDestination(saved.destinationInput);
    setSelectedDestinations(saved.selectedDestinations);
    setDepartures(saved.departures);
    setDuration(saved.duration);
    setBudget(saved.budget);
    setCustomBudgetMin(saved.customBudgetMin);
    setCustomBudgetMax(saved.customBudgetMax);
    setActiveTab(saved.activeTab);
    setBoard(saved.board);
    setWeekendOnly(saved.weekendOnly);
    setDateMode(saved.dateMode);
    setDateFrom(saved.dateFrom);
    setDateTo(saved.dateTo);
    setMonth(saved.month);
    setCalendarMonth(saved.month || saved.dateFrom.slice(0, 7) || localMonthKey());
    setPendingResume(saved);
  }, []);

  useEffect(() => {
    if (!pendingResume) return;
    const restored = pendingResume;
    setPendingResume(null);
    const resumedSearch = runSearch();
    setResultSort(restored.resultSort);
    setResultView(restored.resultView);
    void resumedSearch.finally(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("wyszukiwarka")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    // Run once after all restored form state is committed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingResume]);

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
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
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
      setLoading(false);
      setExpanding(false);
      setPackageSearchLink("");
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

    saveSearchResumeContext({
      path: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : pathname || "/",
      destinationInput: destinationOverride ?? destination,
      selectedDestinations: destinationOverride ? [] : selectedDestinations,
      departures,
      activeTab: activeMode,
      dateMode: datePreference.mode,
      month: datePreference.month,
      dateFrom: datePreference.from,
      dateTo: datePreference.to,
      duration: activeDuration,
      budget: activeBudget,
      customBudgetMin,
      customBudgetMax,
      board: activeBoard,
      weekendOnly: activeWeekend,
      resultSort,
      resultView,
    });

    setPackageSearchLink(eskySearchUrl({ query: requested[0], departure: departures.join(","), cityBreak: activeMode === "City break",
      nights: activeDuration, start: apiDates.start, end: apiDates.end }));
    // One request can cover several selected airports because the API accepts
    // a comma-separated airport list. This avoids repeating the same feed scan.
    const targets = requested.length ? requested : [""];

    setLoading(true);
    setExpanding(false);
    setSearched(true);
    setResultDestinationCount(requested.length);
    setResultView(activeMode === "City break" && !requested.length ? "destinations" : "all");
    setResults([]);
    setVisibleCount(18);
    setResultLocation("");
    setResultSort("price");
    setSuggestionsOpen(false);
    setDepartureOpen(false);
    setDateOpen(false);
    setNotice("");

    let rows: any[] = [];
    let failedSources = 0;
    const selectedDepartureCodes = new Set(
      departures.flatMap((code) => code === "WAWA" ? ["WAW", "WMI"] : [code]).map((code) => code.toUpperCase())
    );
    const inferredOfferAirport = (offer: any) => {
      const explicit = String(offer?.airportCode || "").trim().toUpperCase();
      if (explicit) return explicit;
      const raw = String(offer?.departure || "").toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (/modlin|\bwmi\b/.test(raw)) return "WMI";
      if (/radom|\brdo\b/.test(raw)) return "RDO";
      if (/chopin|okecie|\bwaw\b/.test(raw)) return "WAW";
      if (/krakow|balice|\bkrk\b/.test(raw)) return "KRK";
      if (/katowice|pyrzowice|\bktw\b/.test(raw)) return "KTW";
      if (/gdansk|rebiechowo|\bgdn\b/.test(raw)) return "GDN";
      if (/wroclaw|strachowice|\bwro\b/.test(raw)) return "WRO";
      if (/poznan|lawica|\bpoz\b/.test(raw)) return "POZ";
      if (/rzeszow|jasionka|\brze\b/.test(raw)) return "RZE";
      if (/lublin|swidnik|\bluz\b/.test(raw)) return "LUZ";
      if (/szczecin|goleniow|\bszz\b/.test(raw)) return "SZZ";
      if (/lodz|lublinek|\blcj\b/.test(raw)) return "LCJ";
      if (/bydgoszcz|\bbzg\b/.test(raw)) return "BZG";
      if (/zielona gora|babimost|\bieg\b/.test(raw)) return "IEG";
      if (/olsztyn|szymany|\bszy\b/.test(raw)) return "SZY";
      if (/warszawa/.test(raw)) return "WAW";
      return "";
    };

    const fetchBatch = async (tier = 0, relaxDates = false, relaxFilters = false, relaxAirports = false) => {
      const providers = ["esky", "exim", "tui"];
      const jobs = targets.flatMap(target => providers.map(provider => ({ target, provider })));
      const boardCodes: Record<string, string> = { "all inclusive": "allinclusive", "ultra all inclusive": "ultraallinclusive", "śniadanie": "breakfast", "half board": "halfboard", "full board": "fullboard", "bez wyżywienia": "roomonly" };
      const alternative = [
        relaxDates ? "Inny termin" : "",
        relaxFilters ? "inna długość pobytu lub wyżywienie" : "",
        relaxAirports ? "inne lotnisko" : "",
      ].filter(Boolean).join(" · ");
      for (let index = 0; index < jobs.length; index += 6) {
        if (controller.signal.aborted) return;
        await Promise.all(jobs.slice(index, index + 6).map(async ({ target, provider }) => {
          const params = new URLSearchParams({ mode: activeMode === "City break" ? "citybreak" : "search", provider, strict: "1" });
          if (target) params.set("q", target); else params.set("broad", "1");
          if (departures.length && !relaxAirports) params.set("from", departures.join(","));
          if (activeMinBudget > 0) params.set("minPrice", String(activeMinBudget));
          if (activeMaxBudget > 0) params.set("maxPrice", String(activeMaxBudget));
          if (activeMode === "All Inclusive") params.set("board", "allinclusive");
          if (activeMode === "Last minute") params.set("lastMinute", "1");
          if (!relaxDates) {
            if (apiDates.start) params.set("start", apiDates.start);
            if (apiDates.end) params.set("end", apiDates.end);
            if (apiDates.start || apiDates.end) params.set("dateKind", "departure");
          }
          if (!relaxFilters) {
            if (activeDuration !== "all") params.set("nights", activeDuration);
            if (activeWeekend) params.set("weekend", "1");
            if (boardCodes[activeBoard]) params.set("board", boardCodes[activeBoard]);
          }
          const timeout = new AbortController();
          const abort = () => timeout.abort();
          controller.signal.addEventListener("abort", abort, { once: true });
          const timer = window.setTimeout(abort, 55000);
          try {
            const data = provider === "esky"
              ? await fetchEskyBrowserPackages({
                  query: target,
                  departure: relaxAirports ? "" : departures.join(","),
                  cityBreak: activeMode === "City break",
                  nights: relaxFilters ? "all" : activeDuration,
                  start: relaxDates ? "" : apiDates.start,
                  end: relaxDates ? "" : apiDates.end,
                  minPrice: activeMinBudget,
                  maxPrice: activeMaxBudget,
                  board: params.get("board") || undefined,
                  weekendOnly: params.get("weekend") === "1",
                  lastMinuteOnly: params.get("lastMinute") === "1",
                }, timeout.signal)
              : await (async () => {
                  const response = await fetch(`/api/today-offers?${params}`, { cache: "no-store", signal: timeout.signal });
                  const payload = await response.json();
                  if (!response.ok || payload?.ok === false) throw new Error("source_unavailable");
                  return payload;
                })();
            if (runId !== searchRunRef.current) return;
            if (data.partial) failedSources++;
            const found = cleanRows(Array.isArray(data.offers) ? data.offers : [], target)
              .filter((offer) => {
                if (!relaxAirports || selectedDepartureCodes.size === 0) return true;
                const code = inferredOfferAirport(offer);
                return !code || !selectedDepartureCodes.has(code);
              })
              .map(offer => tier ? { ...offer, searchTier: tier, searchAlternative: alternative } : offer);
            rows = rankSearchOffers([...rows, ...found]);
            setResults(rows);
            if (rows.length) { setLoading(false); setExpanding(true); }
          } catch {
            if (!controller.signal.aborted) failedSources++;
          } finally {
            window.clearTimeout(timer);
            controller.signal.removeEventListener("abort", abort);
          }
        }));
      }
    };

    try {
      await fetchBatch();
      if (runId !== searchRunRef.current) return;
      const exactCount = rows.length;
      setLoading(false);
      const secondaryFilters = activeDuration !== "all" || activeWeekend || activeBoard !== "all";
      const hasDates = Boolean(apiDates.start || apiDates.end);
      // Alternatives keep the direction, departure airports and price ceiling.
      // Different dates/board/duration are labelled on every affected card.
      if (rows.length < 12 && (secondaryFilters || hasDates)) {
        setExpanding(true);
        setNotice("Sprawdzamy też oznaczone alternatywy z tych samych lotnisk i w Twoim budżecie.");
        await fetchBatch(1, hasDates, secondaryFilters);
        if (runId !== searchRunRef.current) return;
      }
      if (rows.length === 0 && departures.length) {
        setExpanding(true);
        setNotice("Nie kończymy na pustej liście — sprawdzamy ten sam kierunek i budżet także z innych polskich lotnisk.");
        await fetchBatch(2, hasDates, secondaryFilters, true);
        if (runId !== searchRunRef.current) return;
      }
      const alternatives = rows.length - exactCount;
      setNotice([
        rows.length ? "Ceny za osobę. Najtańsze najpierw w każdej grupie dopasowania." : "Nie mamy jeszcze potwierdzonej ceny w feedach dla tych ustawień. Możesz sprawdzić ten sam pakiet bezpośrednio w wyszukiwarce partnera lub porównać lot i nocleg.",
        alternatives > 0 ? `Dokładnych dopasowań: ${exactCount}. Alternatywy (${alternatives}) są oznaczone na kartach.` : "",
        failedSources ? "Część źródeł jest chwilowo niedostępna; lista może być niepełna." : "",
        requestedRaw.some(item => /bergamo/i.test(item)) ? "Bergamo uwzględniamy razem z Mediolanem." : "",
      ].filter(Boolean).join(" "));
    } finally {
      if (runId === searchRunRef.current) { setLoading(false); setExpanding(false); }
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

      trackEvent("hotel_search_ready", conversionContext);
      setSearched(true);
      setResults([]);
      setNotice("Kierunek i termin są gotowe. Sprawdź podsumowanie poniżej.");
      setSuggestionsOpen(false);
      setDateOpen(false);
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
    searchAbortRef.current?.abort();
    setLoading(false);
    setExpanding(false);
    setSuggestionsOpen(false);
    setDepartureOpen(false);
    setDateOpen(false);
    setActiveTab(tab);
    if (tab === "Hotele") { setDateMode("range"); setMonth(""); setSelectedDestinations((current) => current.slice(0, 1)); }
    setDuration("all");
    setBudget("all");
    setCustomBudgetMin("");
    setCustomBudgetMax("");
    setBoard("all");
    setWeekendOnly(false);
    setSearched(false);
    setResults([]);
    setResultLocation("");
    setResultDestinationCount(0);
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
    searchAbortRef.current?.abort();
    setDestination("");
    setAnywhereSelected(false);
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
    setResultDestinationCount(0);
    setVisibleCount(18);
    setNotice("");
    setSearched(false);
    setLoading(false);
    setExpanding(false);
  }

  useEffect(() => {
    if (activeTab === "Hotele" || selectedDestinations.length > 0 || destination.trim()) {
      setAnywhereSelected(false);
    }
  }, [activeTab, selectedDestinations.length, destination]);

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
    ["Malta", "Malta do 1 000 zł", { duration: "3-4", budget: "1000", tab: "City break" }],
    ["Bergamo, Włochy", "Bergamo / Mediolan do 1 000 zł", { duration: "1-2", budget: "1000", tab: "City break" }],
    ["Praga, Czechy", "Praga na weekend", { duration: "1-2", budget: "1000", tab: "City break" }],
    ["Rzym, Włochy", "Rzym do 1 500 zł", { duration: "3-4", budget: "1500", tab: "City break" }],
    ["Djerba, Tunezja", "All Inclusive do 3 000 zł", { duration: "5-7", board: "all inclusive", budget: "3000", tab: "Lot + hotel" }],
  ];
  const hotelSearchDestination = selectedDestinations[0] || destination.trim();
  const hotelPartnerTarget = hotelSearchDestination
    ? standaloneHotelPartnerUrl([hotelSearchDestination], dateFrom, dateTo)
    : "";
  const hotelSearchHref = hotelPartnerTarget
    ? `/go/live?${new URLSearchParams({
        partner: "booking",
        target: hotelPartnerTarget,
        source: "hotel_search_ready",
        destination: hotelSearchDestination,
      }).toString()}`
    : "";
  const hotelStayLabel = dateFrom && dateTo
    ? `${isoLabel(dateFrom)} – ${isoLabel(dateTo)}`
    : dateFrom
      ? `od ${isoLabel(dateFrom)}`
      : "termin elastyczny";

  const simpleHomePackage = !embedded && activeTab !== "Loty" && activeTab !== "Hotele";
  const visibleTabs = embedded
    ? ["Loty", "Hotele", "All Inclusive", "City break", "Lot + hotel"]
    : ["Lot + hotel", "City break", "Loty", "Hotele"];

  return (
    <section className={embedded ? "search-v3-section search-v3-embedded" : "section shell search-v3-section"} id={embedded ? undefined : "wyszukiwarka"}>
      <div className={`search-v3${simpleHomePackage ? " search-v3-simple" : ""}`}>
        <div className="search-v3-head">
          <div>
            <small>WYSZUKIWARKA TRIPOWNI</small>
            {!embedded && <h2>{activeTab === "Loty" ? "Znajdź najlepszy lot" : "Gdzie chcesz lecieć?"}</h2>}
            {!embedded && <p>{activeTab === "Loty" ? "Wpisz kierunek, wybierz lotnisko i daty. Porównanie zaczynasz w Tripowni." : activeTab === "Hotele" ? "Wpisz kierunek i termin pobytu." : "Wybierz dokąd, skąd i kiedy. Możesz też zostawić pola puste — najtańsze kierunki pokażemy jako pierwsze."}</p>}
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
          {visibleTabs.map((tab) => (
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
            <label htmlFor="tripownia-destination"><MapPin size={15}/> Dokąd? {!simpleHomePackage && <small>{activeTab === "Hotele" ? "miasto lub kraj" : "wiele kierunków"}</small>}</label>
            {(anywhereSelected || selectedDestinations.length > 0) && (
              <div className="search-v3-selected">
                {anywhereSelected && <button type="button" className="search-v3-selected-anywhere" onClick={() => setAnywhereSelected(false)}>🌍 Gdziekolwiek<X size={12}/></button>}
                {selectedDestinations.map((item) => <button type="button" key={item} onClick={() => setSelectedDestinations((current) => current.filter((x) => x !== item))}>{item}<X size={12}/></button>)}
              </div>
            )}
            <div className="search-v3-input-wrap">
              <input
                id="tripownia-destination"
                value={destination}
                onChange={(event) => { setAnywhereSelected(false); setDestination(event.target.value); openDestinationPanel(); }}
                onFocus={openDestinationPanel}
                placeholder={anywhereSelected || selectedDestinations.length ? "Dodaj konkretny kierunek" : "Wpisz kierunek lub wybierz Gdziekolwiek"}
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

                {(anywhereSelected || selectedDestinations.length > 0) && (
                  <div className="search-v3-panel-selected">
                    {anywhereSelected && (
                      <button type="button" className="search-v3-selected-anywhere" onClick={() => setAnywhereSelected(false)}>
                        🌍 Gdziekolwiek<X size={12}/>
                      </button>
                    )}
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
                      setAnywhereSelected(false);
                      setSelectedDestinations((current) => activeTab === "Hotele" ? [canonicalSearchDestination(destination.trim())] : Array.from(new Set([...current, canonicalSearchDestination(destination.trim())])));
                      setDestination("");
                      setSuggestionsOpen(false);
                    }}><Search size={15}/><span><strong>Szukaj: „{destination.trim()}”</strong><small>Dowolne miasto lub kraj — nie musi być na liście</small></span></button>
                  )}
                  {activeTab !== "Hotele" && (
                    <button
                      type="button"
                      className={`search-v3-anywhere${anywhereSelected ? " active" : ""}`}
                      aria-pressed={anywhereSelected}
                      onClick={() => { setAnywhereSelected(true); setSelectedDestinations([]); setDestination(""); setSuggestionsOpen(false); }}
                    >
                      {anywhereSelected ? <Check size={15}/> : <MapPin size={15}/>}
                      <span><strong>🌍 Gdziekolwiek</strong><small>Bez ograniczenia kierunku — pokaż najlepsze dostępne opcje</small></span>
                    </button>
                  )}
                  {suggestions.map((item) => (
                    <button key={item.label} type="button" onClick={() => {
                      const next = canonicalSearchDestination(item.label);
                      setAnywhereSelected(false);
                      setSelectedDestinations((current) => activeTab === "Hotele" ? [next] : Array.from(new Set([...current, next])));
                      setDestination("");
                      setSuggestionsOpen(false);
                    }}>
                      <MapPin size={15}/><span><strong>{item.label}</strong><small>{item.region} · wybierz kierunek</small></span>
                    </button>
                  ))}
                </div>

                <div className="search-v3-panel-footer">
                  <span>{anywhereSelected ? "🌍 Gdziekolwiek — bez ograniczenia kierunku" : selectedDestinations.length ? `Wybrano: ${selectedDestinations.length}` : "Wybierz kierunek albo Gdziekolwiek"}</span>
                  <button type="button" onClick={() => setSuggestionsOpen(false)}>Gotowe</button>
                </div>
              </div>
            )}
          </div>

          {activeTab !== "Hotele" && (
          <div className={`search-v3-field search-v3-departure search-v3-multiselect${departureOpen ? " is-open" : ""}`} ref={departureRef}>
            <span><Plane size={15}/> Skąd? {!simpleHomePackage && <small>wiele lotnisk</small>}</span>
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
                  <input value={departureQuery} onChange={(event) => setDepartureQuery(event.target.value)} placeholder="Wpisz miasto lub kod lotniska" inputMode="search" />
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

          {simpleHomePackage ? null : activeTab === "Hotele" ? null : activeTab === "Loty" ? (
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

          {simpleHomePackage ? null : activeTab === "Hotele" ? null : activeTab === "Loty" ? (
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

          {!simpleHomePackage && activeTab !== "Hotele" && <div className="search-v3-options-row">
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

        {searched && activeTab === "Hotele" && pathname === "/hotele" && hotelSearchDestination && (
          <div className="hotel-search-ready" role="status" aria-live="polite">
            <div className="hotel-search-ready-head">
              <div>
                <small>KROK 3 · AKTUALNA DOSTĘPNOŚĆ</small>
                <h3>Sprawdź noclegi dla {hotelSearchDestination}</h3>
                <p>Tripownia zachowuje wybrany kierunek i termin. Dopiero teraz przechodzisz do aktualnych cen i dostępności noclegów.</p>
              </div>
              <span className="hotel-search-ready-check"><Check size={20}/></span>
            </div>

            <div className="hotel-search-ready-summary">
              <div><span>Miejsce</span><strong>{hotelSearchDestination}</strong></div>
              <div><span>Pobyt</span><strong>{hotelStayLabel}</strong></div>
            </div>

            <div className="hotel-search-ready-actions">
              <a
                href={hotelSearchHref}
                rel="sponsored"
                onClick={() => {
                  const outboundParams = {
                    mode: "hotele",
                    destination: hotelSearchDestination,
                    placement: "hotel_ready_step",
                    partner: "booking",
                  };
                  trackEvent("outbound_partner_click", outboundParams);
                  trackMetaCustomEvent("PartnerOutboundClick", outboundParams);
                }}
              >
                <Search size={17}/> Sprawdź aktualne noclegi
              </a>
              <button type="button" onClick={() => {
                setDateOpen(true);
                window.requestAnimationFrame(() => dateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
              }}>
                Zmień termin
              </button>
            </div>

            <div className="hotel-search-ready-note">
              Przejście nastąpi w tej samej karcie. Nie otwieramy dodatkowego okna.
            </div>
          </div>
        )}

        {searched && activeTab !== "Hotele" && (
          <div className="search-v3-results">
            <div className="search-v3-active-summary">
              <strong>{selectedDestinations.length ? selectedDestinations.join(" + ") : "Gdziekolwiek"}</strong>
              <span>{departures.length ? departures.length === 1 ? "1 wybrane lotnisko" : `${departures.length} wybrane lotniska` : "Wszystkie lotniska"} · {dateSummary} · {budgetSummary}</span>
            </div>
            <div className="search-v3-results-head" role="status" aria-live="polite">
              <div><small>WYNIKI</small><h3>{expanding ? (visibleResults.length ? `Mamy ${visibleResults.length} ofert — szukamy jeszcze szerzej…` : "Szukamy szerzej…") : loading ? "Sprawdzamy aktualne oferty…" : visibleResults.length ? `Znalezione oferty: ${visibleResults.length}` : "Sprawdź dostępne pakiety lot + hotel"}</h3></div>
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
                <div className="search-v3-sales-sort" aria-label="Widok wyników">
                  <button type="button" className={resultView === "all" ? "active" : ""} onClick={() => { setResultView("all"); setVisibleCount(18); }}>Wszystkie oferty ({results.length})</button>
                  <button type="button" className={resultView === "destinations" ? "active" : ""} onClick={() => { setResultView("destinations"); setVisibleCount(18); }}>Różne kierunki ({cheapestDirectionRows(results).length})</button>
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
                <div className="search-v3-results-grid">{visibleResults.slice(0, visibleCount).map((offer) => <div key={offer.id} className="search-v3-result-item">{offer.searchAlternative && <p className="search-v3-alternative-label">{offer.searchAlternative}</p>}<OfferCard offer={offer} sourceSurface="search_results"/></div>)}</div>
                {visibleResults.length > visibleCount && <button className="search-v3-show-more" type="button" onClick={() => setVisibleCount((count) => Math.min(visibleResults.length, count + 12))}>Pokaż kolejne oferty ({visibleResults.length - visibleCount})</button>}
              </>
            )}
            {!loading && packageSearchLink && results.length > 0 && <div className="search-v3-empty-actions">
              <a
                href={`/go/live?${new URLSearchParams({
                  partner: "esky",
                  target: packageSearchLink,
                  source: "search_more_packages",
                  destination: selectedDestinations[0] || destination.trim(),
                }).toString()}`}
                rel="sponsored"
              >Sprawdź więcej pakietów lot + hotel</a>
              <span>Cena i dostępność są potwierdzane przy rezerwacji.</span>
            </div>}
            {!loading && results.length === 0 && !expanding && (() => {
              const fallbackDestination = selectedDestinations[0] || destination;
              return <div className="search-v3-empty">
                <strong>{fallbackDestination ? `Sprawdzamy „${fallbackDestination}” szerzej` : "Sprawdzamy szerzej"}</strong>
                <span>Live feed nie potwierdził jeszcze dokładnej ceny, ale nie zatrzymujemy wyszukiwania. Wybierz pakiet, lot albo nocleg — zachowujemy Twój kierunek.</span>
                <div className="search-v3-empty-actions" aria-label="Dostępne ścieżki rezerwacji">
                  {packageSearchLink && (
                    <a
                      href={`/go/live?${new URLSearchParams({
                        partner: "esky",
                        target: packageSearchLink,
                        source: "search_zero_rescue",
                        destination: fallbackDestination || "",
                      }).toString()}`}
                      rel="sponsored"
                    >
                      Pakiet lot + hotel
                    </a>
                  )}
                  {fallbackDestination && <Link href={`/loty?destination=${encodeURIComponent(fallbackDestination)}`}>Znajdź lot</Link>}
                  {fallbackDestination && <Link href={`/hotele?destination=${encodeURIComponent(fallbackDestination)}`}>Znajdź nocleg</Link>}
                  <button type="button" onClick={searchNearestDates}>Sprawdź inne terminy</button>
                  <button type="button" onClick={relaxSearchFilters}>Poszerz filtry</button>
                </div>
              </div>;
            })()}
          </div>
        )}
      </div>
    </section>
  );
}
