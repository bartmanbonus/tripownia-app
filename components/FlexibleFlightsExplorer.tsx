"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, ArrowRight, Briefcase, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Plane, Search, SlidersHorizontal, X } from "lucide-react";
import { eskyFlightExitHref } from "@/lib/eskyFlights";
import FlightDestinationCatalog from "@/components/FlightDestinationCatalog";

type Place = { code: string; name: string; country: string; airport?: string; type?: string; searchCode?: string };
type RouteChoice = { key: string; origin: Place; destination: Place | null };
type FlightDeal = {
  destination: string;
  name: string;
  country: string;
  price: number;
  departDate: string;
  returnDate: string;
  changes: number;
  affiliateUrl: string;
};

const FLEXIBLE_ORIGINS: Place[] = [
  { code: "WAW", name: "Warszawa", country: "Polska" },
  { code: "KRK", name: "Kraków", country: "Polska" },
  { code: "KTW", name: "Katowice", country: "Polska" },
  { code: "GDN", name: "Gdańsk", country: "Polska" },
  { code: "WRO", name: "Wrocław", country: "Polska" },
  { code: "POZ", name: "Poznań", country: "Polska" },
  { code: "RZE", name: "Rzeszów", country: "Polska" },
  { code: "SZZ", name: "Szczecin", country: "Polska" },
  { code: "LUZ", name: "Lublin", country: "Polska" },
];

const POPULAR_DESTINATIONS: Place[] = [
  { code: "ROM", name: "Rzym", country: "Włochy" },
  { code: "MIL", name: "Mediolan", country: "Włochy" },
  { code: "BCN", name: "Barcelona", country: "Hiszpania" },
  { code: "LIS", name: "Lizbona", country: "Portugalia" },
  { code: "PAR", name: "Paryż", country: "Francja" },
  { code: "LON", name: "Londyn", country: "Wielka Brytania" },
  { code: "ATH", name: "Ateny", country: "Grecja" },
  { code: "PMI", name: "Majorka", country: "Hiszpania" },
  { code: "TFS", name: "Teneryfa", country: "Hiszpania" },
  { code: "IST", name: "Stambuł", country: "Turcja" },
  { code: "DXB", name: "Dubaj", country: "ZEA" },
  { code: "BKK", name: "Bangkok", country: "Tajlandia" },
];

function nextMonth(value: string, offset: number) {
  const [y, m] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}

function formatTravelDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return new Intl.DateTimeFormat("pl-PL", { day:"numeric", month:"short", year:"numeric", timeZone:"UTC" }).format(new Date(value+"T12:00:00Z"));
}

function calendarDays(value: string) {
  const [y, m] = value.split("-").map(Number);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay()+6)%7;
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [...Array<null>(offset).fill(null), ...Array.from({length},(_,i)=>value+"-"+String(i+1).padStart(2,"0"))];
}

function displayPlaceCode(place: Place) {
  return place.type === "country" && place.searchCode ? place.searchCode : place.code;
}

function placeLabel(place: Place) {
  return place.name + " (" + displayPlaceCode(place) + ")";
}

function flightDetailHref({
  origin,
  destination,
  destinationName,
  country,
  departDate,
  returnDate,
  price,
  changes,
}: {
  origin: string;
  destination: string;
  destinationName?: string;
  country?: string;
  departDate: string;
  returnDate: string;
  price: number;
  changes?: number;
}) {
  const params = new URLSearchParams({
    origin,
    destination,
    depart: departDate,
    return: returnDate,
    price: String(price),
  });
  if (destinationName) params.set("name", destinationName);
  if (country) params.set("country", country);
  if (typeof changes === "number") params.set("changes", String(changes));
  return `/loty/oferta?${params.toString()}`;
}

function TPCheckboxPlacePicker({
  label,
  values,
  onChange,
  placeholder,
  specialLabel,
  specialActive,
  onSpecialChange,
  defaultOptions,
}: {
  label: string;
  values: Place[];
  onChange: (places: Place[]) => void;
  placeholder: string;
  specialLabel: string;
  specialActive: boolean;
  onSpecialChange: (active: boolean) => void;
  defaultOptions: Place[];
}) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const raw = query.trim();
    if (raw.length < 2) {
      setRows([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/flight-places?q=" + encodeURIComponent(raw), {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        setRows(Array.isArray(data?.places) ? data.places : []);
      } catch {
        setRows([]);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const visibleRows = query.trim().length >= 2 ? rows : defaultOptions;

  function togglePlace(place: Place) {
    const selected = values.some((item) => item.code === place.code);
    onSpecialChange(false);
    onChange(selected ? values.filter((item) => item.code !== place.code) : [...values, place]);
  }

  function chooseSpecial() {
    onChange([]);
    onSpecialChange(!specialActive);
  }

  function clearAll() {
    onChange([]);
    onSpecialChange(false);
    setQuery("");
  }

  const summary = specialActive
    ? specialLabel
    : values.length === 0
      ? placeholder
      : values.length === 1
        ? placeLabel(values[0])
        : values.length + " wybrane";

  return (
    <div className="flight-hunt-field flight-hunt-checkbox-picker" ref={rootRef} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      <span>{label}</span>

      <button
        type="button"
        className={"flight-hunt-picker-trigger" + (open ? " open" : "")}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label + ": " + summary}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={values.length || specialActive ? "has-value" : ""}>{summary}</span>
        <ChevronDown aria-hidden="true" size={17} className={open ? "rotated" : ""} />
      </button>

      {open && (
        <div className="flight-hunt-picker-menu" id={menuId} role="group" aria-label={label + " — wybór wielu miejsc"}>
          <div className="flight-hunt-picker-search">
            <Search size={18} aria-hidden="true" />
            <input
              autoFocus
              aria-label={label.startsWith("Skąd") ? "Szukaj lotniska wylotu" : "Szukaj kierunku podróży"}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={label.startsWith("Skąd") ? "Szukaj miasta lub lotniska" : "Szukaj miasta, kraju lub lotniska"}
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Wyczyść wyszukiwanie">×</button>}
          </div>

          <button
            type="button"
            className={"flight-hunt-check-row special" + (specialActive ? " selected" : "")}
            aria-pressed={specialActive}
            onClick={chooseSpecial}
          >
            <span className="flight-hunt-checkbox">{specialActive ? "✓" : ""}</span>
            <span>
              <strong>{specialLabel}</strong>
              <small>{label.startsWith("Skąd") ? "szukaj z głównych lotnisk w Polsce" : "nie ograniczaj kierunku"}</small>
            </span>
          </button>

          <div className="flight-hunt-picker-section-label">
            {query.trim().length >= 2 ? "WYNIKI WYSZUKIWANIA" : label.startsWith("Skąd") ? "LOTNISKA W POLSCE" : "POPULARNE KIERUNKI"}
          </div>

          <div className="flight-hunt-picker-list">
            {visibleRows.map((row) => {
              const selected = values.some((item) => item.code === row.code);
              return (
                <button
                  type="button"
                  className={"flight-hunt-check-row" + (selected ? " selected" : "")}
                  aria-pressed={selected}
                  key={row.code + "-" + row.name}
                  onClick={() => togglePlace(row)}
                >
                  <span className="flight-hunt-checkbox">{selected ? "✓" : ""}</span>
                  <span>
                    <strong>{row.name}</strong>
                    <small>{displayPlaceCode(row)}{row.country && row.country !== row.name ? " · " + row.country : ""}</small>
                  </span>
                </button>
              );
            })}
            {query.trim().length >= 2 && visibleRows.length === 0 && (
              <div className="flight-hunt-picker-empty">Brak wyników. Spróbuj wpisać miasto albo kod lotniska.</div>
            )}
          </div>

          <div className="flight-hunt-picker-footer">
            <button type="button" className="clear" onClick={clearAll}>Wyczyść</button>
            <span>{specialActive ? specialLabel : values.length ? "Wybrano: " + values.length : "Nic nie wybrano"}</span>
            <button type="button" className="apply" onClick={() => setOpen(false)}>Gotowe</button>
          </div>
        </div>
      )}

      {!specialActive && values.length > 1 && (
        <div className="flight-hunt-picked-chips">
          {values.map((place) => (
            <button type="button" key={place.code} onClick={() => togglePlace(place)}>
              {place.name} <span>×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScriptSlot({ src, id, fallbackHref }: { src: string; id: string; fallbackHref: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    if (!host.current) return;
    setStatus("loading");
    host.current.innerHTML = "";

    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.charset = "UTF-8";
    script.onload = () => {
      window.setTimeout(() => {
        const hasContent = Boolean(
          host.current?.querySelector("iframe, table, .map, [class*='widget'], [class*='ticket']")
          || (host.current?.textContent || "").trim().length > 20
        );
        setStatus(hasContent ? "ready" : "fallback");
      }, 1400);
    };
    script.onerror = () => setStatus("fallback");
    host.current.appendChild(script);

    const timeout = window.setTimeout(() => {
      const hasContent = Boolean(host.current?.querySelector("iframe, table, .map, [class*='widget'], [class*='ticket']"));
      if (!hasContent) setStatus("fallback");
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      if (host.current) host.current.innerHTML = "";
    };
  }, [src]);

  return (
    <div className={"flight-hunt-widget-shell " + status}>
      {status === "loading" && <div className="flight-hunt-widget-loading">Sprawdzamy aktualne ceny…</div>}
      <div className="flight-hunt-widget" id={id} ref={host} />
      {status === "fallback" && (
        <div className="flight-hunt-widget-fallback">
          <strong>Nie udało się wyświetlić podglądu cen tutaj.</strong>
          <span>Otwórz pełną wyszukiwarkę lotów Tripowni.</span>
          <a href={fallbackHref} rel="sponsored">Sprawdź loty</a>
        </div>
      )}
    </div>
  );
}


function LowPriceMapFrame({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={"flight-hunt-map-shell" + (loaded ? " ready" : " loading")}>
      {!loaded && <div className="flight-hunt-widget-loading">Ładujemy mapę najtańszych kierunków…</div>}
      <iframe
        title="Mapa najtańszych lotów"
        src={src}
        loading="eager"
        allow="geolocation"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

type FlexibleFlightsExplorerProps = {
  initialDestination?: string;
  initialOrigin?: string;
  initialMonth?: string;
  initialOutbound?: string;
  initialInbound?: string;
};

export default function FlexibleFlightsExplorer({
  initialDestination = "",
  initialOrigin = "WAW",
  initialMonth = "",
  initialOutbound = "",
  initialInbound = "",
}: FlexibleFlightsExplorerProps) {
  const initialOriginPlace = FLEXIBLE_ORIGINS.find((place) => place.code === initialOrigin.toUpperCase()) || FLEXIBLE_ORIGINS[0];
  const monthSelectId = useId();
  const monthsRef = useRef<HTMLDivElement>(null);
  const stayRef = useRef<HTMLDivElement>(null);
  const baggageRef = useRef<HTMLDivElement>(null);
  const stayGroupId = useId();
  const [origins, setOrigins] = useState<Place[]>([initialOriginPlace]);
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [originAnywhere, setOriginAnywhere] = useState(false);
  const [destinationAnywhere, setDestinationAnywhere] = useState(!initialDestination.trim());
  const [daysMin, setDaysMin] = useState(2);
  const [daysMax, setDaysMax] = useState(4);
  const [directOnly, setDirectOnly] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(/^\d{4}-\d{2}$/.test(initialMonth) ? [initialMonth] : []);
  const [monthsOpen, setMonthsOpen] = useState(false);
  const [stayOpen, setStayOpen] = useState(false);
  const [baggageOpen, setBaggageOpen] = useState(false);
  const [baggage, setBaggage] = useState<"cabin"|"checked">("cabin");
  const [tripType, setTripType] = useState<"round"|"oneway">(initialOutbound && !initialInbound ? "oneway" : "round");
  const [dateMode, setDateMode] = useState<"flex"|"exact">(initialOutbound ? "exact" : "flex");
  const [departureDate, setDepartureDate] = useState(initialOutbound);
  const [returnDate, setReturnDate] = useState(initialInbound);
  const [calendarStart, setCalendarStart] = useState(() => initialOutbound.slice(0,7) || new Date().toISOString().slice(0,7));
  const [searchError, setSearchError] = useState("");
  const [monthPage, setMonthPage] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [regionFilter, setRegionFilter] = useState("all");
  const [onlyDirectResults, setOnlyDirectResults] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState("Ekonomiczna");
  const [monthOptions, setMonthOptions] = useState<Array<{ value: string; label: string }>>([]);
  useEffect(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric", timeZone: "UTC" });
    setMonthOptions(Array.from({ length: 15 }, (_, index) => {
      const date = new Date(Date.UTC(today.getFullYear(), today.getMonth() + index, 1));
      const value = date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0");
      const rawLabel = formatter.format(date);
      return { value, label: rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1) };
    }));
  }, []);
  const [calendarResults, setCalendarResults] = useState<Array<{ destinationCode:string; price:number; departDate:string; returnDate:string; outboundStops:number; returnStops:number; affiliateUrl:string }>>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [activeRouteKey, setActiveRouteKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [deals, setDeals] = useState<FlightDeal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [dealsSort, setDealsSort] = useState<"price" | "name">("price");
  const [selectedCountry, setSelectedCountry] = useState("");
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (monthsRef.current && !monthsRef.current.contains(event.target as Node)) setMonthsOpen(false);
      if (stayRef.current && !stayRef.current.contains(event.target as Node)) setStayOpen(false);
      if (baggageRef.current && !baggageRef.current.contains(event.target as Node)) setBaggageOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const query = initialDestination.trim();
    if (!query) return;

    const controller = new AbortController();
    fetch("/api/flight-places?q=" + encodeURIComponent(query), {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        const places = Array.isArray(data?.places) ? data.places : [];
        if (!places.length) return;
        setDestinationAnywhere(false);
        setDestinations([places[0]]);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [initialDestination]);

  const effectiveOrigins = useMemo(
    () => (originAnywhere ? FLEXIBLE_ORIGINS : origins),
    [originAnywhere, origins],
  );

  const routes = useMemo<RouteChoice[]>(() => {
    if (!effectiveOrigins.length) return [];

    if (destinationAnywhere) {
      return effectiveOrigins.map((origin) => ({
        key: origin.code + "-ANY",
        origin,
        destination: null,
      }));
    }

    if (!destinations.length) return [];

    return effectiveOrigins.flatMap((origin) =>
      destinations
        .filter((destination) => destination.code !== origin.code)
        .map((destination) => ({
          key: origin.code + "-" + destination.code,
          origin,
          destination,
        })),
    );
  }, [effectiveOrigins, destinations, destinationAnywhere]);

  useEffect(() => {
    if (!routes.length) {
      setActiveRouteKey("");
      return;
    }
    setActiveRouteKey((current) =>
      routes.some((route) => route.key === current) ? current : routes[0].key,
    );
  }, [routes]);

  const activeRoute = routes.find((route) => route.key === activeRouteKey) || routes[0] || null;

  const affiliateFallbackUrl = useMemo(() => {
    const destination = activeRoute?.destination?.searchCode || activeRoute?.destination?.code || "";
    if (!destination) return "/loty";
    try {
      return eskyFlightExitHref({
        origin: activeRoute?.origin.code || "WAW",
        destination,
        source: "flight_fallback",
      });
    } catch {
      return "/loty";
    }
  }, [activeRoute]);

  const effectiveDestinationCode = activeRoute?.destination?.searchCode || activeRoute?.destination?.code || "";
  const fallbackDestinationCode = activeRoute?.destination?.code || "";

  useEffect(() => {
    if (!submitted || destinationAnywhere || !activeRoute?.origin.code || !effectiveDestinationCode) {
      setCalendarResults([]);
      setCalendarLoading(false);
      return;
    }

    const controller = new AbortController();
    setCalendarLoading(true);
    const months = selectedMonths.length ? selectedMonths : [""];
    Promise.all(months.map(async (travelMonth) => {
      const params = new URLSearchParams({
        origin: activeRoute.origin.code,
        destination: effectiveDestinationCode,
        minDays: String(Math.min(daysMin, daysMax)),
        maxDays: String(Math.max(daysMin, daysMax)),
        direct: directOnly ? "true" : "false",
      });
      if (travelMonth) params.set("month", travelMonth);
      if (/^[A-Z]{3}$/.test(fallbackDestinationCode) && fallbackDestinationCode !== effectiveDestinationCode) {
        params.set("fallback", fallbackDestinationCode);
      }
      try {
        const response = await fetch("/api/flight-calendar?" + params.toString(), { signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        return Array.isArray(data?.results) ? data.results : [];
      } catch {
        return [];
      }
    })).then((groups) => {
      const unique = new Map<string, (typeof calendarResults)[number]>();
      for (const row of groups.flat()) {
        if (!row?.departDate || (selectedMonths.length && !selectedMonths.includes(row.departDate.slice(0, 7)))) continue;
        const key = row.destinationCode + "-" + row.departDate + "-" + row.returnDate;
        const existing = unique.get(key);
        if (!existing || existing.price > row.price) unique.set(key, row);
      }
      setCalendarResults([...unique.values()].sort((a,b) => a.price - b.price));
    }).finally(() => setCalendarLoading(false));
    return () => controller.abort();
  }, [submitted, destinationAnywhere, selectedMonths.join(","), activeRoute?.origin.code, effectiveDestinationCode, fallbackDestinationCode, daysMin, daysMax, directOnly]);

  const mapSrc = "";

  useEffect(() => {
    if (!submitted || !destinationAnywhere || !activeRoute?.origin.code) {
      setDeals([]);
      return;
    }

    const controller = new AbortController();
    setDealsLoading(true);

    const params = new URLSearchParams({
      origin: activeRoute.origin.code,
      direct: directOnly ? "true" : "false",
      minDays: String(Math.min(daysMin, daysMax)),
      maxDays: String(Math.max(daysMin, daysMax)),
    });

    if (selectedMonths.length) params.set("months", selectedMonths.join(","));

    fetch("/api/flight-deals?" + params.toString(), {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => setDeals(Array.isArray(data?.offers) ? data.offers : []))
      .catch(() => setDeals([]))
      .finally(() => setDealsLoading(false));

    return () => controller.abort();
  }, [submitted, destinationAnywhere, activeRoute?.origin.code, directOnly, daysMin, daysMax, selectedMonths.join(",")]);

  const sortedDeals = useMemo(() => {
    const unique = new Map<string, FlightDeal>();
    for (const deal of deals) {
      if (!deal.price || !deal.departDate || (selectedMonths.length && !selectedMonths.includes(deal.departDate.slice(0, 7)))) continue;
      if (maxPrice && deal.price > maxPrice) continue;
      if ((directOnly || onlyDirectResults) && deal.changes > 0) continue;
      if (regionFilter !== "all" && !deal.country.toLowerCase().includes(regionFilter.toLowerCase())) continue;
      const key = deal.country + "/" + deal.destination;
      const old = unique.get(key);
      if (!old || deal.price < old.price) unique.set(key, deal);
    }
    const rows = [...unique.values()];
    return dealsSort === "name" ? rows.sort((a,b) => a.name.localeCompare(b.name, "pl")) : rows.sort((a,b) => a.price - b.price);
  }, [deals, selectedMonths, maxPrice, regionFilter, directOnly, onlyDirectResults, dealsSort]);

  const groupedCountries = useMemo(() => {
    const groups = new Map<string, FlightDeal[]>();
    for (const deal of sortedDeals) {
      const key = deal.country || deal.name;
      groups.set(key, [...(groups.get(key) || []), deal]);
    }
    return [...groups].map(([country, entries]) => ({ country, entries, best: entries[0] }))
      .sort((a,b) => dealsSort === "name" ? a.country.localeCompare(b.country, "pl") : a.best.price - b.best.price);
  }, [sortedDeals, dealsSort]);

  const monthSummary = selectedMonths.length === 0 ? "Dowolny miesiąc" : selectedMonths.length === 1
    ? monthOptions.find((item) => item.value === selectedMonths[0])?.label || selectedMonths[0]
    : selectedMonths.length + " wybrane miesiące";

  function toggleMonth(value: string) {
    setSelectedMonths((current) => current.includes(value)
      ? current.filter((month) => month !== value)
      : current.length >= 6 ? current : [...current, value].sort());
    dirty();
  }

  function dirty() {
    setSubmitted(false);
    setSearchError("");
  }

  function chooseTravelDate(value: string) {
    if (tripType === "oneway") {
      setDepartureDate(value);
      setReturnDate("");
      return;
    }
    if (!departureDate || returnDate || value <= departureDate) {
      setDepartureDate(value);
      setReturnDate("");
    } else {
      setReturnDate(value);
    }
  }

  function selectDateMode(mode: "flex"|"exact") {
    setDateMode(mode);
    if (mode === "flex") setTripType("round");
    dirty();
  }

  function submitFlightSearch() {
    setSearchError("");
    if (!canSearch) return;
    if (dateMode === "exact") {
      if (!departureDate || (tripType === "round" && (!returnDate || returnDate <= departureDate))) {
        setSearchError("Wybierz datę wylotu i późniejszą datę powrotu.");
        setMonthsOpen(true);
        return;
      }
      if (originAnywhere || origins.length !== 1 || destinationAnywhere || destinations.length !== 1) {
        setSearchError("Dla konkretnych dat wybierz jedno lotnisko wylotu i jeden kierunek.");
        return;
      }
      try {
        const dest = destinations[0].searchCode || destinations[0].code;
        window.location.assign(eskyFlightExitHref({
          origin: origins[0].code,
          destination: dest,
          departure: departureDate,
          returnDate: tripType === "round" ? returnDate : undefined,
          adults,
          destinationName: destinations[0].name,
          source: "flight_exact_skyline",
        }));
      } catch {
        setSearchError("Nie udało się zbudować wyszukiwania. Wybierz konkretną trasę.");
      }
      return;
    }
    setSubmitted(true);
    requestAnimationFrame(() => document.querySelector(".flight-hunt-results-shell")?.scrollIntoView({ behavior:"smooth", block:"start" }));
  }

  function setTripLength(min: number, max: number) {
    setDaysMin(min);
    setDaysMax(max);
    dirty();
  }

  function setAnywhere() {
    setDestinationAnywhere(true);
    setDestinations([]);
    dirty();
  }

  const canSearch = effectiveOrigins.length > 0 && (destinationAnywhere || destinations.length > 0);

  return (
    <section className="flight-hunt flight-hunt-clean" aria-label="Wyszukiwarka elastycznych lotów">
      <div className="skyline-search">
        <div className="skyline-search-top">
          <div className="skyline-toggle" role="group" aria-label="Rodzaj podróży">
            <button type="button" className={tripType==="round"?"active":""} aria-pressed={tripType==="round"} onClick={()=>{setTripType("round");dirty();}}>W obie strony</button>
            <button type="button" className={tripType==="oneway"?"active":""} aria-pressed={tripType==="oneway"} onClick={()=>{setTripType("oneway");setReturnDate("");dirty();}}>W jedną stronę</button>
          </div>
          <div className="skyline-baggage" ref={baggageRef}>
            <button type="button" onClick={()=>setBaggageOpen(!baggageOpen)} aria-expanded={baggageOpen}><Briefcase size={16}/> {baggage==="cabin"?"Bagaż podręczny":"Bagaż rejestrowany"} <ChevronDown size={15}/></button>
            {baggageOpen&&<div className="skyline-baggage-menu">
              <button type="button" onClick={()=>{setBaggage("cabin");setBaggageOpen(false);}}>Bagaż podręczny</button>
              <button type="button" onClick={()=>{setBaggage("checked");setBaggageOpen(false);}}>Bagaż rejestrowany</button>
              <small>Dokładną cenę i warunki bagażu sprawdzisz przy rezerwacji.</small>
            </div>}
          </div>
        </div>
        <div className="skyline-main-row">
          <div className="skyline-field skyline-origin">
            <TPCheckboxPlacePicker label="Z:" values={origins} onChange={(next)=>{setOrigins(next);dirty();}} placeholder="Kraj, miasto lub lotnisko" specialLabel="Skądkolwiek" specialActive={originAnywhere} onSpecialChange={(active)=>{setOriginAnywhere(active);dirty();}} defaultOptions={FLEXIBLE_ORIGINS}/>
          </div>
          <button type="button" className="skyline-swap" aria-label="Zamień kierunek lotu" onClick={()=>{
            if(origins.length!==1||destinations.length!==1||originAnywhere||destinationAnywhere)return;
            const oldOrigin=origins[0],oldDestination=destinations[0];
            setOrigins([oldDestination]);setDestinations([oldOrigin]);dirty();
          }}><ArrowLeftRight size={19}/></button>
          <div className="skyline-field skyline-destination">
            <TPCheckboxPlacePicker label="Do:" values={destinations} onChange={(next)=>{setDestinations(next);dirty();}} placeholder="Kraj, miasto lub lotnisko" specialLabel="Gdziekolwiek" specialActive={destinationAnywhere} onSpecialChange={(active)=>{setDestinationAnywhere(active);dirty();}} defaultOptions={POPULAR_DESTINATIONS}/>
          </div>
          <div className="skyline-dates" ref={monthsRef}>
            <button type="button" className="skyline-date-field" onClick={()=>setMonthsOpen(!monthsOpen)} aria-expanded={monthsOpen}><small>Wylot</small><strong>{dateMode==="exact"?formatTravelDate(departureDate)||"Dodaj datę":selectedMonths.length?monthSummary:"Dowolny termin"}</strong></button>
            <button type="button" className="skyline-date-field" disabled={tripType==="oneway"} onClick={()=>setMonthsOpen(!monthsOpen)}><small>Powrót</small><strong>{tripType==="oneway"?"Nie dotyczy":dateMode==="exact"?formatTravelDate(returnDate)||"Dodaj datę":selectedMonths.length?monthSummary:"Elastycznie"}</strong></button>
            {monthsOpen&&<div className="skyline-date-panel" role="dialog" aria-label="Wybierz terminy podróży">
              <div className="skyline-date-panel-head"><strong>Kiedy chcesz lecieć?</strong><button type="button" onClick={()=>setMonthsOpen(false)} aria-label="Zamknij"><X size={19}/></button></div>
              <div className="skyline-date-modes">
                <button type="button" className={dateMode==="exact"?"active":""} onClick={()=>selectDateMode("exact")}>Konkretne daty</button>
                <button type="button" className={dateMode==="flex"?"active":""} onClick={()=>selectDateMode("flex")}>Dowolny termin</button>
              </div>
              {dateMode==="flex"?<><p>Wybierz nawet 6 miesięcy jednocześnie.</p>
                <div className="flight-multi-month-nav"><button type="button" disabled={monthPage===0} onClick={()=>setMonthPage(Math.max(0,monthPage-3))}><ChevronLeft size={18}/></button>
                  <strong>{monthOptions[monthPage]?.label} – {monthOptions[Math.min(monthPage+5,monthOptions.length-1)]?.label}</strong>
                  <button type="button" disabled={monthPage+6>=monthOptions.length} onClick={()=>setMonthPage(Math.min(monthPage+3,Math.max(0,monthOptions.length-6)))}><ChevronRight size={18}/></button></div>
                <div className="flight-multi-month-grid">{monthOptions.slice(monthPage,monthPage+6).map(item=><button key={item.value} type="button" className={selectedMonths.includes(item.value)?"active":""} aria-pressed={selectedMonths.includes(item.value)} disabled={!selectedMonths.includes(item.value)&&selectedMonths.length>=6} onClick={()=>toggleMonth(item.value)}><small>{item.value.slice(0,4)}</small><strong>{item.label.replace(/\s+\d{4}$/,"")}</strong></button>)}</div>
              </>:<>
                <div className="skyline-calendar-navigation"><button type="button" onClick={()=>setCalendarStart(nextMonth(calendarStart,-1))}><ChevronLeft size={18}/></button><strong>Wylot: {formatTravelDate(departureDate)||"wybierz"} · Powrót: {formatTravelDate(returnDate)||"wybierz"}</strong><button type="button" onClick={()=>setCalendarStart(nextMonth(calendarStart,1))}><ChevronRight size={18}/></button></div>
                <div className="skyline-calendar-pair">{[calendarStart,nextMonth(calendarStart,1)].map(month=><div key={month}><strong>{new Intl.DateTimeFormat("pl-PL",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(month+"-01T12:00:00Z"))}</strong><div className="skyline-calendar-days">{["P","W","Ś","C","P","S","N"].map((d,i)=><small key={i}>{d}</small>)}{calendarDays(month).map((day,i)=>day?<button key={day} type="button" disabled={day<new Date().toISOString().slice(0,10)} className={[day===departureDate||day===returnDate?"chosen":"",departureDate&&returnDate&&day>departureDate&&day<returnDate?"within":""].join(" ")} onClick={()=>chooseTravelDate(day)}>{Number(day.slice(-2))}</button>:<span key={"pad"+i}/>)}</div></div>)}</div>
              </>}
              <div className="skyline-date-actions"><button type="button" onClick={()=>{setSelectedMonths([]);setDepartureDate("");setReturnDate("");dirty();}}>Wyczyść</button><button type="button" className="primary" onClick={()=>setMonthsOpen(false)}>Zastosuj</button></div>
            </div>}
          </div>
          <div className="skyline-travellers">
            <button type="button" className="skyline-passenger-trigger" onClick={()=>setGuestsOpen(!guestsOpen)} aria-expanded={guestsOpen}><small>Podróżni i klasa</small><strong>{adults+children} os. · {cabin}</strong></button>
            {guestsOpen&&<div className="flight-guests-panel"><label>Klasa podróży<select value={cabin} onChange={e=>setCabin(e.target.value)}><option>Ekonomiczna</option><option>Premium Economy</option><option>Biznesowa</option><option>Pierwsza</option></select></label><div><span>Dorośli</span><button type="button" disabled={adults<=1} onClick={()=>setAdults(adults-1)}>−</button><strong>{adults}</strong><button type="button" disabled={adults>=9} onClick={()=>setAdults(adults+1)}>+</button></div><div><span>Dzieci</span><button type="button" disabled={children<=0} onClick={()=>setChildren(children-1)}>−</button><strong>{children}</strong><button type="button" disabled={children>=8} onClick={()=>setChildren(children+1)}>+</button></div><button type="button" className="primary" onClick={()=>setGuestsOpen(false)}>Zastosuj</button><small>Cena orientacyjna z porównywarki dla jednej osoby; liczbę osób, klasę i bagaż zweryfikuj u partnera.</small></div>}
          </div>
          <button type="button" className="skyline-submit" disabled={!canSearch} onClick={submitFlightSearch}><Search size={19}/> Szukaj</button>
        </div>
        <div className="skyline-under-row">
          <label><input type="checkbox" checked={directOnly} onChange={e=>{setDirectOnly(e.target.checked);dirty();}}/> Loty bezpośrednie</label>
          <label><input type="checkbox" checked={daysMin===2&&daysMax===4} onChange={e=>setTripLength(e.target.checked?2:5,e.target.checked?4:7)}/> Weekend (2–4 dni)</label>
          <div className="skyline-stay" ref={stayRef}><button type="button" onClick={()=>setStayOpen(!stayOpen)}>Długość pobytu: {daysMin}–{daysMax} dni <ChevronDown size={14}/></button>{stayOpen&&<div className="skyline-stay-menu">{[[2,4,"Weekend"],[5,7,"Krótki urlop"],[8,10,"Dłuższy urlop"],[11,14,"Wyprawa"]].map(([min,max,label])=><button type="button" key={String(min)} onClick={()=>{setTripLength(Number(min),Number(max));setStayOpen(false);}}>{label}: {min}–{max} dni</button>)}</div>}</div>
          <span>{dateMode==="flex"?"Wiele miesięcy · wiele lotnisk · Gdziekolwiek":"Wybierz dokładne daty i trasę"}</span>
        </div>
        {searchError&&<p className="skyline-error" role="alert">{searchError}</p>}
      </div>
      <div className="flight-hunt-shortcuts flight-hunt-shortcuts-clean" aria-label="Gotowe pomysły na wyszukiwanie">
        <span>Szybkie wyszukiwanie:</span>
        <button type="button" onClick={() => { setAnywhere(); setTripLength(2, 4); setSelectedMonths([]); }}>Gdziekolwiek na weekend</button>
        <button type="button" onClick={() => { setAnywhere(); setTripLength(5, 7); setSelectedMonths([]); }}>Gdziekolwiek na tydzień</button>
        <button type="button" onClick={() => { setOriginAnywhere(true); setOrigins([]); dirty(); }}>Wylot z całej Polski</button>
      </div>

      {!submitted && (
        <p className="flight-hunt-helper" role="status">
          {canSearch ? "Wszystko gotowe — sprawdź dostępne ceny i terminy poniżej." : "Wybierz co najmniej jedno lotnisko wylotu, aby zobaczyć loty."}
        </p>
      )}

      {submitted && routes.length > 0 && (
        <div className="flight-hunt-results-shell">
          {routes.length > 1 && (
            <div className="flight-hunt-route-tabs" role="tablist" aria-label="Wybrane trasy">
              {routes.map((route) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={route.key === activeRoute?.key}
                  className={route.key === activeRoute?.key ? "active" : ""}
                  key={route.key}
                  onClick={() => setActiveRouteKey(route.key)}
                >
                  {route.origin.name + " → " + (route.destination?.name || "Gdziekolwiek")}
                </button>
              ))}
            </div>
          )}

          <div className="flight-hunt-copy">
            <div>
              <small>{destinationAnywhere ? "NAJTAŃSZE KIERUNKI" : "NAJTAŃSZE DATY"}</small>
              <strong>
                {destinationAnywhere
                  ? "Z " + (activeRoute?.origin.name || "wybranego lotniska") + " — dokąd warto lecieć?"
                  : (activeRoute?.origin.name || "") + " → " + (activeRoute?.destination?.name || "")}
              </strong>
            </div>
            <span>
              {destinationAnywhere
                ? "Porównuj kierunki po cenie."
                : "Zakres pobytu: " + Math.min(daysMin, daysMax) + "–" + Math.max(daysMin, daysMax) + " dni."}
            </span>
          </div>

          {destinationAnywhere ? (
            <>
              {mapSrc && <LowPriceMapFrame key={activeRoute?.key + "-map"} src={mapSrc} />}

              {(dealsLoading || deals.length > 0) && (
              <section className="flight-deals-list" aria-label="Lista tanich lotów">
                <div className="flight-deals-list-head">
                  <div>
                    <small>LISTA OFERT</small>
                    <h3>Tanie kierunki z {activeRoute?.origin.name || "wybranego lotniska"}</h3>
                  </div>
                  <div className="flight-deals-sort" role="group" aria-label="Sortowanie listy lotów">
                    <button type="button" className={dealsSort === "price" ? "active" : ""} onClick={() => setDealsSort("price")}>Najtańsze</button>
                    <button type="button" className={dealsSort === "name" ? "active" : ""} onClick={() => setDealsSort("name")}>A–Z</button>
                  </div>
                </div>

                <div className="flight-discovery-toolbar">
                  <label><SlidersHorizontal size={17}/> Budżet na lot
                    <select value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}>
                      <option value={0}>Dowolny</option>
                      <option value={300}>Do 300 zł</option><option value={600}>Do 600 zł</option>
                      <option value={1000}>Do 1 000 zł</option><option value={2000}>Do 2 000 zł</option>
                      <option value={4000}>Do 4 000 zł</option>
                    </select>
                  </label>
                  <label>Państwo
                    <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                      <option value="all">Wszystkie kraje</option>
                      {[...new Set(deals.map(d => d.country).filter(Boolean))].sort((a,b) => a.localeCompare(b,"pl")).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="flight-results-check"><input type="checkbox" checked={onlyDirectResults} onChange={(e) => setOnlyDirectResults(e.target.checked)}/> Bez przesiadek</label>
                  <button type="button" onClick={() => {setMaxPrice(0);setRegionFilter("all");setOnlyDirectResults(false);}}>Wyczyść filtry</button>
                </div>
                {dealsLoading && <div className="flight-deals-loading">Pobieramy najtańsze kierunki…</div>}

                {!dealsLoading && groupedCountries.length > 0 && (
                  <div className="flight-country-grid">
                    {groupedCountries.map((group) => (
                      <article className="flight-country-card" key={group.country}>
                        <div className="flight-country-title">
                          <span><small>LOTY OD</small><strong>{group.country}</strong><span>{group.entries.length} {group.entries.length === 1 ? "kierunek" : "kierunki"}</span></span>
                          <b>{group.best.price.toLocaleString("pl-PL")} zł</b>
                        </div>
                        <div className="flight-country-best">
                          <strong>{group.best.name}</strong>
                          <span>{group.best.departDate} – {group.best.returnDate}</span>
                          <span>{group.best.changes === 0 ? "Bez przesiadek" : "Lot z przesiadką"}</span>
                        </div>
                        <button type="button" className="flight-country-expand" aria-expanded={selectedCountry === group.country}
                          onClick={() => setSelectedCountry(selectedCountry === group.country ? "" : group.country)}>
                          {selectedCountry === group.country ? "Ukryj loty" : "Zobacz dostępne loty"} <ChevronDown size={16}/>
                        </button>
                        {selectedCountry === group.country && <div className="flight-country-options">
                          {group.entries.map((deal) => (
                            <a key={deal.destination} href={flightDetailHref({
                              origin:activeRoute?.origin.code || "WAW",destination:deal.destination,destinationName:deal.name,
                              country:deal.country,departDate:deal.departDate,returnDate:deal.returnDate,price:deal.price,changes:deal.changes,
                            })}>
                              <span><strong>{deal.name}</strong><small>{deal.departDate} – {deal.returnDate}</small></span>
                              <b>{deal.price.toLocaleString("pl-PL")} zł →</b>
                            </a>
                          ))}
                        </div>}
                      </article>
                    ))}
                  </div>
                )}
                {!dealsLoading && deals.length > 0 && !groupedCountries.length && <p className="flight-deals-empty">Brak lotów spełniających filtry. Zmień budżet, daty lub połączenia.</p>}

              </section>
              )}

              {!dealsLoading && deals.length === 0 && (
                <div className="flight-deals-empty">
                  <strong>Lista cen chwilowo nie odpowiada.</strong>
                  <span>Możesz otworzyć pełne wyszukiwanie dla wybranego lotniska.</span>
                  <div style={{ marginTop: 10 }}><a href={affiliateFallbackUrl} rel="sponsored">Sprawdź wszystkie loty →</a></div>
                </div>
              )}
              {!dealsLoading && <FlightDestinationCatalog origin={activeRoute?.origin.code || "WAW"} pricedCodes={deals.map((deal) => deal.destination)} />}
            </>
          ) : (
            <section className="flight-month-results" aria-label="Najtańsze terminy dla wybranej trasy">
              {calendarLoading ? (
                <div className="flight-deals-loading">Sprawdzamy najtańsze terminy…</div>
              ) : calendarResults.length ? (
                <>
                  <div className="flight-deals-list-head">
                    <div>
                      <small>NAJTAŃSZE TERMINY</small>
                      <h3>{activeRoute?.origin.name} → {activeRoute?.destination?.name}{selectedMonths.length ? " · " + selectedMonths.map((m) => monthOptions.find((o) => o.value === m)?.label || m).join(", ") : " · dowolny miesiąc"}</h3>
                    </div>
                  </div>
                  <div className="flight-deals-grid">
                    {calendarResults.map((deal) => (
                      <a
                        className="flight-deal-card"
                        key={deal.departDate + "-" + deal.returnDate}
                        href={flightDetailHref({
                          origin: activeRoute?.origin.code || "WAW",
                          destination: deal.destinationCode || effectiveDestinationCode,
                          destinationName: activeRoute?.destination?.name,
                          country: activeRoute?.destination?.country,
                          departDate: deal.departDate,
                          returnDate: deal.returnDate,
                          price: deal.price,
                          changes: Math.max(deal.outboundStops, deal.returnStops),
                        })}
                      >
                        <div className="flight-deal-main">
                          <div>
                            <strong>{deal.departDate} → {deal.returnDate}</strong>
                            <span>{activeRoute?.destination?.country || activeRoute?.destination?.name}</span>
                          </div>
                          <b>od {deal.price.toLocaleString("pl-PL")} zł</b>
                        </div>
                        <div className="flight-deal-meta">
                          <span>tam: {deal.outboundStops === 0 ? "bez przesiadek" : deal.outboundStops + " przesiadki"}</span>
                          <span>powrót: {deal.returnStops === 0 ? "bez przesiadek" : deal.returnStops + " przesiadki"}</span>
                          <em>Sprawdź lot</em>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flight-deals-empty">
                  Nie mamy teraz potwierdzonej ceny dla tej trasy. Możesz przejść do pełnego wyszukiwania lotów z zachowaniem kierunku.
                  <div style={{marginTop:10}}><a href={affiliateFallbackUrl} rel="sponsored">Sprawdź loty dla tej trasy →</a></div>
                </div>
              )}
            </section>
          )}
        </div>
      )}


    </section>
  );
}
