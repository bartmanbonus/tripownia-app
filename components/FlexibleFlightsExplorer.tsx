"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Place = { code: string; name: string; country: string; airport?: string; type?: string };
type RouteChoice = { key: string; origin: Place; destination: Place | null };

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

function placeLabel(place: Place) {
  return place.name + " (" + place.code + ")";
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
    <div className="flight-hunt-field flight-hunt-checkbox-picker" ref={rootRef}>
      <span>{label}</span>

      <button
        type="button"
        className={"flight-hunt-picker-trigger" + (open ? " open" : "")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={values.length || specialActive ? "has-value" : ""}>{summary}</span>
        <b>{open ? "▲" : "▼"}</b>
      </button>

      {open && (
        <div className="flight-hunt-picker-menu" role="dialog" aria-label={label + " — wybór wielu miejsc"}>
          <div className="flight-hunt-picker-search">
            <span>⌕</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={label === "Skąd" ? "Szukaj miasta lub lotniska" : "Szukaj miasta, kraju lub lotniska"}
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Wyczyść wyszukiwanie">×</button>}
          </div>

          <button
            type="button"
            className={"flight-hunt-check-row special" + (specialActive ? " selected" : "")}
            onClick={chooseSpecial}
          >
            <span className="flight-hunt-checkbox">{specialActive ? "✓" : ""}</span>
            <span>
              <strong>{specialLabel}</strong>
              <small>{label === "Skąd" ? "szukaj z głównych lotnisk w Polsce" : "nie ograniczaj kierunku"}</small>
            </span>
          </button>

          <div className="flight-hunt-picker-section-label">
            {query.trim().length >= 2 ? "WYNIKI WYSZUKIWANIA" : label === "Skąd" ? "LOTNISKA W POLSCE" : "POPULARNE KIERUNKI"}
          </div>

          <div className="flight-hunt-picker-list">
            {visibleRows.map((row) => {
              const selected = values.some((item) => item.code === row.code);
              return (
                <button
                  type="button"
                  className={"flight-hunt-check-row" + (selected ? " selected" : "")}
                  key={row.code + "-" + row.name}
                  onClick={() => togglePlace(row)}
                >
                  <span className="flight-hunt-checkbox">{selected ? "✓" : ""}</span>
                  <span>
                    <strong>{row.name}</strong>
                    <small>{row.code}{row.country ? " · " + row.country : ""}</small>
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

function ScriptSlot({ src, id }: { src: string; id: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return;
    host.current.innerHTML = "";
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.charset = "UTF-8";
    host.current.appendChild(script);
    return () => {
      if (host.current) host.current.innerHTML = "";
    };
  }, [src]);

  return <div className="flight-hunt-widget" id={id} ref={host} />;
}

export default function FlexibleFlightsExplorer() {
  const [origins, setOrigins] = useState<Place[]>([
    { code: "WAW", name: "Warszawa", country: "Polska" },
  ]);
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [originAnywhere, setOriginAnywhere] = useState(false);
  const [destinationAnywhere, setDestinationAnywhere] = useState(false);
  const [daysMin, setDaysMin] = useState(3);
  const [daysMax, setDaysMax] = useState(7);
  const [directOnly, setDirectOnly] = useState(false);
  const [activeRouteKey, setActiveRouteKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const marker = "695999.TRIPOWNIAPL";

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

  const calendarSrc = useMemo(() => {
    if (!activeRoute?.origin.code || !activeRoute.destination?.code) return "";
    const params = new URLSearchParams({
      marker,
      shmarker: marker,
      origin: activeRoute.origin.code,
      destination: activeRoute.destination.code,
      currency: "pln",
      one_way: "false",
      only_direct: directOnly ? "true" : "false",
      locale: "pl",
      period: "year",
      range: Math.min(daysMin, daysMax) + "," + Math.max(daysMin, daysMax),
      powered_by: "false",
      width: "100%",
    });
    return "https://www.travelpayouts.com/calendar_widget/iframe.js?" + params.toString();
  }, [activeRoute, daysMin, daysMax, directOnly]);

  const mapSrc = useMemo(() => {
    if (!activeRoute?.origin.code || !destinationAnywhere) return "";
    const params = new URLSearchParams({
      marker,
      origin: activeRoute.origin.code,
      currency: "pln",
      locale: "pl",
      one_way: "false",
      only_direct: directOnly ? "true" : "false",
      powered_by: "false",
    });
    return "https://www.travelpayouts.com/widgets/aframe.js?v=1&" + params.toString();
  }, [activeRoute, destinationAnywhere, directOnly]);

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
    <section className="flight-hunt flight-hunt-clean">
      <div className="flight-hunt-modebar">
        <div>
          <div className="kicker">ELASTYCZNE LOTY</div>
          <strong>Poluj na najtańszy termin</strong>
          <span>Nie musisz znać dat. Wybierz trasę albo zostaw kierunek otwarty.</span>
        </div>
        <div className="flight-hunt-tabs" role="group" aria-label="Tryb elastycznego wyszukiwania lotów">
          <button
            type="button"
            className={!destinationAnywhere ? "active" : ""}
            onClick={() => {
              setDestinationAnywhere(false);
              dirty();
            }}
          >
            Mam kierunek
          </button>
          <button type="button" className={destinationAnywhere ? "active" : ""} onClick={setAnywhere}>
            Gdziekolwiek
          </button>
        </div>
      </div>

      <div className="flight-hunt-controls-clean">
        <TPCheckboxPlacePicker
          label="Skąd"
          values={origins}
          onChange={(next) => { setOrigins(next); dirty(); }}
          placeholder="Miasto lub lotnisko"
          specialLabel="Skądkolwiek"
          specialActive={originAnywhere}
          onSpecialChange={(active) => { setOriginAnywhere(active); dirty(); }}
          defaultOptions={FLEXIBLE_ORIGINS}
        />

        <TPCheckboxPlacePicker
          label="Dokąd"
          values={destinations}
          onChange={(next) => { setDestinations(next); dirty(); }}
          placeholder="Miasto, kraj lub lotnisko"
          specialLabel="Gdziekolwiek"
          specialActive={destinationAnywhere}
          onSpecialChange={(active) => { setDestinationAnywhere(active); dirty(); }}
          defaultOptions={POPULAR_DESTINATIONS}
        />

        {!destinationAnywhere && (
          <div className="flight-hunt-stay">
            <span>Na ile dni?</span>
            <div className="flight-hunt-stay-pills">
              <button type="button" className={daysMin === 2 && daysMax === 4 ? "active" : ""} onClick={() => setTripLength(2,4)}>2–4</button>
              <button type="button" className={daysMin === 5 && daysMax === 7 ? "active" : ""} onClick={() => setTripLength(5,7)}>5–7</button>
              <button type="button" className={daysMin === 8 && daysMax === 10 ? "active" : ""} onClick={() => setTripLength(8,10)}>8–10</button>
              <button type="button" className={daysMin === 11 && daysMax === 14 ? "active" : ""} onClick={() => setTripLength(11,14)}>11–14</button>
            </div>
          </div>
        )}

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
          onClick={() => setSubmitted(true)}
        >
          {destinationAnywhere ? "Pokaż tanie kierunki" : "Pokaż najtańsze terminy"}
        </button>
      </div>

      <div className="flight-hunt-shortcuts" aria-label="Szybkie ustawienia lotów">
        <span>Szybko:</span>
        <button type="button" onClick={() => setTripLength(2,4)}>Weekend 2–4 dni</button>
        <button type="button" onClick={() => setTripLength(5,7)}>Tydzień</button>
        <button type="button" onClick={setAnywhere}>Gdziekolwiek</button>
        <button type="button" onClick={() => { setDirectOnly(true); dirty(); }}>Tylko bezpośrednie</button>
      </div>

      {!submitted && (
        <div className="flight-hunt-empty flight-hunt-empty-clean">
          <div>
            <strong>{canSearch ? "Gotowe do szukania." : "Wybierz kierunek albo kliknij „Gdziekolwiek”."}</strong>
            <span>{canSearch ? "Kliknij pomarańczowy przycisk, a pokażemy najlepsze ceny w elastycznych terminach." : "Dat nie musisz podawać — Tripownia przeszuka elastyczne opcje."}</span>
          </div>
          <div className="flight-hunt-empty-badges">
            <span>✓ elastyczne daty</span>
            <span>✓ wiele lotnisk</span>
            <span>✓ afiliacyjne ceny</span>
          </div>
        </div>
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

          {destinationAnywhere
            ? mapSrc && <ScriptSlot key={activeRoute?.key + "-map"} id="tripownia-low-price-map" src={mapSrc} />
            : calendarSrc && <ScriptSlot key={activeRoute?.key + "-calendar"} id="tripownia-price-calendar" src={calendarSrc} />}
        </div>
      )}

      <div className="flight-hunt-note">
        Ceny i przejścia do rezerwacji są afiliacyjne i przypisane do Tripowni.
      </div>
    </section>
  );
}
