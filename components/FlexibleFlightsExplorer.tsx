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
    setOpen(true);
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
            <button
              type="button"
              aria-label={"Usuń " + specialLabel}
              onClick={() => onSpecialChange(false)}
            >
              ×
            </button>
          </span>
        )}
        {!specialActive && values.map((place) => (
          <span className="flight-hunt-chip" key={place.code}>
            {placeLabel(place)}
            <button
              type="button"
              aria-label={"Usuń " + placeLabel(place)}
              onClick={() => removePlace(place.code)}
            >
              ×
            </button>
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
            <small>{label === "Skąd?" ? "bez sztywnego lotniska wylotu" : "pokaż najtańsze kierunki bez wskazywania celu"}</small>
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

  const emptyTitle = !effectiveOrigins.length
    ? "Wybierz skąd chcesz lecieć."
    : "Wybierz dokąd chcesz lecieć.";

  const emptyText = !effectiveOrigins.length
    ? "Możesz wskazać jedno lub kilka miast i lotnisk albo wybrać opcję „Skądkolwiek”."
    : "Dodaj jedno lub kilka miejsc albo wybierz „Gdziekolwiek”, jeśli kierunek ma pozostać otwarty.";

  return (
    <section className="flight-hunt">
      <div className="flight-hunt-head">
        <div>
          <div className="kicker">POLUJ NA TANI LOT</div>
          <h2>Nie znasz dat? To właśnie tutaj szukaj.</h2>
          <p>
            Skąd i dokąd może być elastyczne: wybierz jedno miejsce, kilka miejsc albo zostaw stronę trasy otwartą jako „Skądkolwiek” / „Gdziekolwiek”.
          </p>
        </div>
        <div className="flight-hunt-tabs" role="group" aria-label="Tryb elastycznego wyszukiwania lotów">
          <button
            type="button"
            className={!destinationAnywhere ? "active" : ""}
            onClick={() => setDestinationAnywhere(false)}
          >
            Najtańsze daty
          </button>
          <button
            type="button"
            className={destinationAnywhere ? "active" : ""}
            onClick={() => {
              setDestinationAnywhere(true);
              setDestinations([]);
            }}
          >
            Gdziekolwiek
          </button>
        </div>
      </div>

      <div className={"flight-hunt-controls" + (destinationAnywhere ? " is-anywhere" : "")}>
        <TPMultiPlaceInput
          label="Skąd?"
          values={origins}
          onChange={setOrigins}
          placeholder="Dodaj 1 lub kilka miast / lotnisk"
          specialLabel="Skądkolwiek"
          specialActive={originAnywhere}
          onSpecialChange={setOriginAnywhere}
        />

        <TPMultiPlaceInput
          label="Dokąd?"
          values={destinations}
          onChange={setDestinations}
          placeholder="Dodaj 1 lub kilka miast / lotnisk"
          specialLabel="Gdziekolwiek"
          specialActive={destinationAnywhere}
          onSpecialChange={setDestinationAnywhere}
        />

        {!destinationAnywhere && (
          <>
            <label className="flight-hunt-field compact">
              <span>Minimum dni</span>
              <select value={daysMin} onChange={(event) => setDaysMin(Number(event.target.value))}>
                {[2, 3, 4, 5, 6, 7, 8, 10, 12, 14].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="flight-hunt-field compact">
              <span>Maksimum dni</span>
              <select value={daysMax} onChange={(event) => setDaysMax(Number(event.target.value))}>
                {[3, 4, 5, 6, 7, 8, 10, 12, 14, 21].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className="flight-hunt-direct">
          <input
            type="checkbox"
            checked={directOnly}
            onChange={(event) => setDirectOnly(event.target.checked)}
          />
          <span>Tylko bezpośrednie</span>
        </label>
      </div>

      {originAnywhere && (
        <div className="flight-hunt-scope-note">
          <strong>Skądkolwiek:</strong> porównujemy główne lotniska w Polsce: Warszawę, Kraków, Katowice, Gdańsk, Wrocław i Poznań.
        </div>
      )}

      {routes.length > 0 && (
        <>
          <div className="flight-hunt-selection-summary">
            <strong>
              {destinationAnywhere
                ? "Elastyczny wylot: " + routes.length + " lotnisk → Gdziekolwiek"
                : "Wybrane kombinacje: " + effectiveOrigins.length + " × " + destinations.length + " = " + routes.length + " tras"}
            </strong>
            <span>
              {routes.length > 1
                ? "Przełączaj trasy poniżej — wybory zostają zaznaczone, więc nie musisz wpisywać ich ponownie."
                : "Masz jedną trasę. Dodaj kolejne miejsca, aby porównać więcej kombinacji."}
            </span>
          </div>

          {routes.length > 1 && (
            <div className="flight-hunt-route-tabs" role="tablist" aria-label="Wybrane kombinacje tras">
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

          {destinationAnywhere ? (
            <>
              <div className="flight-hunt-copy">
                <strong>{"Dokąd najtaniej z " + (activeRoute?.origin.name || "wybranego lotniska") + "?"}</strong>
                <span>Przeglądaj kierunki po cenie zamiast zaczynać od konkretnego miejsca.</span>
              </div>
              {mapSrc && (
                <ScriptSlot
                  key={activeRoute?.key + "-map"}
                  id="tripownia-low-price-map"
                  src={mapSrc}
                />
              )}
            </>
          ) : (
            <>
              <div className="flight-hunt-copy">
                <strong>
                  {"Najtańsze terminy " + (activeRoute?.origin.name || "") + " → " + (activeRoute?.destination?.name || "")}
                </strong>
                <span>
                  {"Porównujemy cały rok i długość pobytu " + Math.min(daysMin, daysMax) + "–" + Math.max(daysMin, daysMax) + " dni."}
                </span>
              </div>
              {calendarSrc && (
                <ScriptSlot
                  key={activeRoute?.key + "-calendar"}
                  id="tripownia-price-calendar"
                  src={calendarSrc}
                />
              )}
            </>
          )}
        </>
      )}

      {routes.length === 0 && (
        <div className="flight-hunt-empty">
          <strong>{emptyTitle}</strong>
          <span>{emptyText}</span>
        </div>
      )}

      <div className="flight-hunt-note">
        Kalendarz Travelpayouts obsługuje jedną trasę naraz, dlatego przy wielu zaznaczeniach Tripownia tworzy wszystkie kombinacje i pozwala przełączać je jednym kliknięciem. Dane i przejścia rezerwacyjne są afiliacyjne.
      </div>
    </section>
  );
}
