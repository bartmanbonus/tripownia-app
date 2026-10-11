"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Search } from "lucide-react";

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
};

export default function FlexibleFlightsExplorer({
  initialDestination = "",
  initialOrigin = "WAW",
  initialMonth = "",
}: FlexibleFlightsExplorerProps) {
  const initialOriginPlace = FLEXIBLE_ORIGINS.find((place) => place.code === initialOrigin.toUpperCase()) || FLEXIBLE_ORIGINS[0];
  const [origins, setOrigins] = useState<Place[]>([initialOriginPlace]);
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [originAnywhere, setOriginAnywhere] = useState(false);
  const [destinationAnywhere, setDestinationAnywhere] = useState(!initialDestination.trim());
  const [daysMin, setDaysMin] = useState(2);
  const [daysMax, setDaysMax] = useState(4);
  const [directOnly, setDirectOnly] = useState(false);
  const [travelMonth, setTravelMonth] = useState(/^\d{4}-\d{2}$/.test(initialMonth) ? initialMonth : "");
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
  const marker = "695999.TRIPOWNIAPL";

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
    const url = new URL("https://www.aviasales.com/");
    url.searchParams.set("marker", "695999.TRIPOWNIAPL");
    url.searchParams.set("shmarker", "695999.TRIPOWNIAPL");
    if (activeRoute?.origin.code) url.searchParams.set("origin", activeRoute.origin.code);
    const fallbackDestination = activeRoute?.destination?.searchCode || activeRoute?.destination?.code;
    if (fallbackDestination) url.searchParams.set("destination", fallbackDestination);
    return url.toString();
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

    fetch("/api/flight-calendar?" + params.toString(), { signal: controller.signal, cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCalendarResults(Array.isArray(data?.results) ? data.results : []))
      .catch(() => setCalendarResults([]))
      .finally(() => setCalendarLoading(false));

    return () => controller.abort();
  }, [submitted, destinationAnywhere, travelMonth, activeRoute?.origin.code, effectiveDestinationCode, fallbackDestinationCode, daysMin, daysMax, directOnly]);

  const mapSrc = useMemo(() => {
    if (!activeRoute?.origin.code || !destinationAnywhere) return "";
    const params = new URLSearchParams({
      redirect_on_click: "true",
      hide_sidebar: "true",
      hide_logo: "true",
      zoom: "3",
      cluster_manager: "TpWidgetClusterManager",
      host: "www.aviasales.com",
      show_tutorial: "false",
      hide_reformal: "true",
      marker,
      currency: "pln",
      small_spinner: "true",
      direct: directOnly ? "true" : "false",
      disable_googlemaps_ui: "true",
      auto_fit_map: "true",
      locale: "pl",
      show_filters_icon: "true",
      lines_type: "TpLines",
      origin_iata: activeRoute.origin.code,
    });
    return "https://maps.tp.media/flights/?" + params.toString();
  }, [activeRoute, destinationAnywhere, directOnly]);

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

    fetch("/api/flight-deals?" + params.toString(), {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => setDeals(Array.isArray(data?.offers) ? data.offers : []))
      .catch(() => setDeals([]))
      .finally(() => setDealsLoading(false));

    return () => controller.abort();
  }, [submitted, destinationAnywhere, activeRoute?.origin.code, directOnly, daysMin, daysMax]);

  const sortedDeals = useMemo(() => {
    const rows = [...deals];
    if (dealsSort === "name") {
      return rows.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    }
    return rows.sort((a, b) => a.price - b.price);
  }, [deals, dealsSort]);

  function dirty() {
    setSubmitted(false);
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
      <div className="flight-hunt-modebar">
        <div>
          <div className="kicker">ELASTYCZNE DATY, WIĘCEJ OKAZJI</div>
          <strong>Wybierz trasę i długość wyjazdu</strong>
          <span>Nie potrzebujesz konkretnych dat. Pokażemy dostępne kierunki i najtańsze terminy.</span>
        </div>
      </div>

      <div className="flight-hunt-controls-clean">
        <TPCheckboxPlacePicker
          label="Skąd lecisz?"
          values={origins}
          onChange={(next) => { setOrigins(next); dirty(); }}
          placeholder="Miasto lub lotnisko"
          specialLabel="Skądkolwiek"
          specialActive={originAnywhere}
          onSpecialChange={(active) => { setOriginAnywhere(active); dirty(); }}
          defaultOptions={FLEXIBLE_ORIGINS}
        />

        <TPCheckboxPlacePicker
          label="Dokąd?"
          values={destinations}
          onChange={(next) => { setDestinations(next); dirty(); }}
          placeholder="Miasto, kraj lub lotnisko"
          specialLabel="Gdziekolwiek"
          specialActive={destinationAnywhere}
          onSpecialChange={(active) => { setDestinationAnywhere(active); dirty(); }}
          defaultOptions={POPULAR_DESTINATIONS}
        />

        <div className="flight-hunt-month">
          <label htmlFor="flight-hunt-month">Kiedy?</label>
          <select id="flight-hunt-month" value={travelMonth} onChange={(event) => { setTravelMonth(event.target.value); dirty(); }}>
            <option value="">Dowolny miesiąc</option>
            {monthOptions.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
            {travelMonth && !monthOptions.some((month) => month.value === travelMonth) && (
              <option value={travelMonth}>{travelMonth}</option>
            )}
          </select>
        </div>

        <div className="flight-hunt-stay">
          <span id="flight-hunt-stay-label">Na ile dni?</span>
          <div className="flight-hunt-stay-pills" role="group" aria-labelledby="flight-hunt-stay-label">
            <button type="button" aria-pressed={daysMin === 2 && daysMax === 4} className={daysMin === 2 && daysMax === 4 ? "active" : ""} onClick={() => setTripLength(2, 4)}><strong>Weekend</strong><small>2–4 dni</small></button>
            <button type="button" aria-pressed={daysMin === 5 && daysMax === 7} className={daysMin === 5 && daysMax === 7 ? "active" : ""} onClick={() => setTripLength(5, 7)}><strong>Krótki urlop</strong><small>5–7 dni</small></button>
            <button type="button" aria-pressed={daysMin === 8 && daysMax === 10} className={daysMin === 8 && daysMax === 10 ? "active" : ""} onClick={() => setTripLength(8, 10)}><strong>Dłuższy urlop</strong><small>8–10 dni</small></button>
            <button type="button" aria-pressed={daysMin === 11 && daysMax === 14} className={daysMin === 11 && daysMax === 14 ? "active" : ""} onClick={() => setTripLength(11, 14)}><strong>Wyprawa</strong><small>11–14 dni</small></button>
          </div>
        </div>

        <label className="flight-hunt-direct">
          <input
            type="checkbox"
            checked={directOnly}
            onChange={(event) => {
              setDirectOnly(event.target.checked);
              dirty();
            }}
          />
          <span>Bez przesiadek</span>
        </label>

        <button
          type="button"
          className="flight-hunt-submit"
          disabled={!canSearch}
          onClick={() => {
            setSubmitted(true);
            requestAnimationFrame(() => document.querySelector(".flight-hunt-results-shell")?.scrollIntoView({ behavior: "smooth", block: "start" }));
          }}
        >
          <span>{destinationAnywhere ? "Odkryj tanie kierunki" : "Pokaż najtańsze loty"}</span>
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </div>

      <div className="flight-hunt-shortcuts flight-hunt-shortcuts-clean" aria-label="Gotowe pomysły na wyszukiwanie">
        <span>Gotowe pomysły:</span>
        <button type="button" onClick={() => { setAnywhere(); setTripLength(2, 4); setTravelMonth(""); }}>Gdziekolwiek na weekend</button>
        <button type="button" onClick={() => { setAnywhere(); setTripLength(5, 7); setTravelMonth(""); }}>Gdziekolwiek na tydzień</button>
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

              {(dealsLoading || sortedDeals.length > 0) && (
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

                {dealsLoading && <div className="flight-deals-loading">Pobieramy najtańsze kierunki…</div>}

                {!dealsLoading && sortedDeals.length > 0 && (
                  <div className="flight-deals-grid">
                    {sortedDeals.slice(0, 36).map((deal) => (
                      <a
                        className="flight-deal-card"
                        key={deal.destination}
                        href={flightDetailHref({
                          origin: activeRoute?.origin.code || "WAW",
                          destination: deal.destination,
                          destinationName: deal.name,
                          country: deal.country,
                          departDate: deal.departDate,
                          returnDate: deal.returnDate,
                          price: deal.price,
                          changes: deal.changes,
                        })}
                      >
                        <div className="flight-deal-main">
                          <div>
                            <strong>{deal.name}</strong>
                            <span>{deal.country || deal.destination}</span>
                          </div>
                          <b>od {deal.price.toLocaleString("pl-PL")} zł</b>
                        </div>
                        <div className="flight-deal-meta">
                          <span>{deal.departDate || "elastyczny termin"}{deal.returnDate ? " → " + deal.returnDate : ""}</span>
                          <span>{deal.changes === 0 ? "bez przesiadek" : deal.changes + " przesiadka" + (deal.changes > 1 ? "i" : "")}</span>
                          <em>Zobacz konkretny lot</em>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

              </section>
              )}

              {!dealsLoading && sortedDeals.length === 0 && (
                <div className="flight-deals-empty">
                  <strong>Lista cen chwilowo nie odpowiada.</strong>
                  <span>Mapa kierunków powyżej nadal może działać. Możesz też otworzyć pełne wyszukiwanie dla wybranego lotniska.</span>
                  <div style={{ marginTop: 10 }}><a href={affiliateFallbackUrl} rel="sponsored">Sprawdź wszystkie loty →</a></div>
                </div>
              )}
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
                      <h3>{activeRoute?.origin.name} → {activeRoute?.destination?.name}{travelMonth ? " · " + travelMonth : " · dowolny miesiąc"}</h3>
                    </div>
                  </div>
                  <div className="flight-deals-grid">
                    {calendarResults.slice(0, 18).map((deal) => (
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
