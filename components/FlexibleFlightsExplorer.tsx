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
];

function placeLabel(place: Place) {
  return place.name + " (" + place.code + ")";
}

function TPMultiPlaceInput({
  label,
  values,
  onChange,
  placeholder,
  specialLabel,
  specialActive,
  onSpecialChange,
}: {
  label: string;
  values: Place[];
  onChange: (places: Place[]) => void;
  placeholder: string;
  specialLabel: string;
  specialActive: boolean;
  onSpecialChange: (active: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);

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
        setOpen(true);
      } catch {
        setRows([]);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function addPlace(place: Place) {
    const alreadySelected = values.some((item) => item.code === place.code);
    onSpecialChange(false);
    if (!alreadySelected) onChange([...values, place]);
    setQuery("");
    setRows([]);
    setOpen(false);
  }

  function removePlace(code: string) {
    onChange(values.filter((item) => item.code !== code));
  }

  function chooseSpecial() {
    onChange([]);
    onSpecialChange(true);
    setQuery("");
    setRows([]);
    setOpen(false);
  }

  return (
    <div
      className="flight-hunt-field flight-hunt-field-multi"
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <span>{label}</span>
      <div className="flight-hunt-multi">
        {specialActive && (
          <span className="flight-hunt-chip special">
            {specialLabel}
            <button type="button" aria-label={"Usuń " + specialLabel} onClick={() => onSpecialChange(false)}>×</button>
          </span>
        )}
        {!specialActive && values.map((place) => (
          <span className="flight-hunt-chip" key={place.code}>
            {placeLabel(place)}
            <button type="button" aria-label={"Usuń " + placeLabel(place)} onClick={() => removePlace(place.code)}>×</button>
          </span>
        ))}
        <input
          value={query}
          placeholder={specialActive || values.length > 0 ? "Dodaj kolejne…" : placeholder}
          aria-label={label}
          onFocus={() => setOpen(true)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !query && !specialActive && values.length > 0) {
              removePlace(values[values.length - 1].code);
            }
          }}
        />
      </div>

      {open && (
        <div className="flight-hunt-suggestions">
          <button
            type="button"
            className={"flight-hunt-special-option" + (specialActive ? " selected" : "")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={chooseSpecial}
          >
            <strong>{specialLabel}</strong>
            <small>{label === "Skąd?" ? "główne lotniska w Polsce" : "pokaż tanie kierunki bez wskazywania celu"}</small>
          </button>

          {rows.map((row) => {
            const selected = values.some((item) => item.code === row.code);
            return (
              <button
                type="button"
                key={row.code + "-" + row.name}
                disabled={selected}
                className={selected ? "selected" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addPlace(row)}
              >
                <strong>{row.name}</strong>
                <small>
                  {row.code}
                  {row.country ? " · " + row.country : ""}
                  {selected ? " · wybrane" : ""}
                </small>
              </button>
            );
          })}
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
  const marker = "695999.tripownia_flexible";

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
        <TPMultiPlaceInput
          label="Skąd"
          values={origins}
          onChange={(next) => { setOrigins(next); dirty(); }}
          placeholder="Miasto lub lotnisko"
          specialLabel="Skądkolwiek"
          specialActive={originAnywhere}
          onSpecialChange={(active) => { setOriginAnywhere(active); dirty(); }}
        />

        <TPMultiPlaceInput
          label="Dokąd"
          values={destinations}
          onChange={(next) => { setDestinations(next); dirty(); }}
          placeholder="Miasto, kraj lub lotnisko"
          specialLabel="Gdziekolwiek"
          specialActive={destinationAnywhere}
          onSpecialChange={(active) => { setDestinationAnywhere(active); dirty(); }}
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
