"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Place = { code: string; name: string; country: string; airport?: string; type?: string };

function TPPlaceInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState(value ? `${value.name} (${value.code})` : "");
  const [rows, setRows] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = query.trim();
    if (raw.length < 2 || (value && raw === `${value.name} (${value.code})`)) {
      setRows([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/flight-places?q=${encodeURIComponent(raw)}`, { signal: controller.signal, cache: "no-store" });
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
  }, [query, value]);

  return (
    <label className="flight-hunt-field">
      <span>{label}</span>
      <input
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange(null);
        }}
      />
      {open && rows.length > 0 && (
        <div className="flight-hunt-suggestions">
          {rows.map((row) => (
            <button
              type="button"
              key={`${row.code}-${row.name}`}
              onClick={() => {
                onChange(row);
                setQuery(`${row.name} (${row.code})`);
                setOpen(false);
              }}
            >
              <strong>{row.name}</strong>
              <small>{row.code}{row.country ? ` · ${row.country}` : ""}</small>
            </button>
          ))}
        </div>
      )}
    </label>
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
  const [mode, setMode] = useState<"calendar" | "anywhere">("calendar");
  const [origin, setOrigin] = useState<Place | null>({ code: "WAW", name: "Warszawa", country: "Polska" });
  const [destination, setDestination] = useState<Place | null>(null);
  const [daysMin, setDaysMin] = useState(3);
  const [daysMax, setDaysMax] = useState(7);
  const [directOnly, setDirectOnly] = useState(false);
  const marker = "695999.tripownia_flexible";

  const calendarSrc = useMemo(() => {
    if (!origin?.code || !destination?.code) return "";
    const params = new URLSearchParams({
      marker,
      origin: origin.code,
      destination: destination.code,
      currency: "pln",
      one_way: "false",
      only_direct: directOnly ? "true" : "false",
      locale: "pl",
      period: "year",
      range: `${Math.min(daysMin, daysMax)},${Math.max(daysMin, daysMax)}`,
      powered_by: "false",
      width: "100%",
    });
    return `https://www.travelpayouts.com/calendar_widget/iframe.js?${params.toString()}`;
  }, [origin, destination, daysMin, daysMax, directOnly]);

  const mapSrc = useMemo(() => {
    if (!origin?.code) return "";
    const params = new URLSearchParams({
      marker,
      origin: origin.code,
      currency: "pln",
      locale: "pl",
      one_way: "false",
      only_direct: directOnly ? "true" : "false",
      powered_by: "false",
    });
    return `https://www.travelpayouts.com/widgets/aframe.js?v=1&${params.toString()}`;
  }, [origin, directOnly]);

  return (
    <section className="flight-hunt">
      <div className="flight-hunt-head">
        <div>
          <div className="kicker">POLUJ NA TANI LOT</div>
          <h2>Nie znasz dat? To właśnie tutaj szukaj.</h2>
          <p>Wybierz kierunek i zobacz najtańsze kombinacje terminów albo zostaw kierunek otwarty i sprawdź, dokąd warto polecieć najtaniej.</p>
        </div>
        <div className="flight-hunt-tabs" role="group" aria-label="Tryb elastycznego wyszukiwania lotów">
          <button type="button" className={mode === "calendar" ? "active" : ""} onClick={() => setMode("calendar")}>Najtańsze daty</button>
          <button type="button" className={mode === "anywhere" ? "active" : ""} onClick={() => setMode("anywhere")}>Gdziekolwiek</button>
        </div>
      </div>

      <div className="flight-hunt-controls">
        <TPPlaceInput label="Skąd?" value={origin} onChange={setOrigin} placeholder="Warszawa, Kraków, Gdańsk…" />
        {mode === "calendar" && (
          <TPPlaceInput label="Dokąd?" value={destination} onChange={setDestination} placeholder="Dowolne miasto lub lotnisko" />
        )}
        {mode === "calendar" && (
          <>
            <label className="flight-hunt-field compact">
              <span>Minimum dni</span>
              <select value={daysMin} onChange={(event) => setDaysMin(Number(event.target.value))}>
                {[2,3,4,5,6,7,8,10,12,14].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="flight-hunt-field compact">
              <span>Maksimum dni</span>
              <select value={daysMax} onChange={(event) => setDaysMax(Number(event.target.value))}>
                {[3,4,5,6,7,8,10,12,14,21].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </>
        )}
        <label className="flight-hunt-direct">
          <input type="checkbox" checked={directOnly} onChange={(event) => setDirectOnly(event.target.checked)} />
          <span>Tylko bezpośrednie</span>
        </label>
      </div>

      {mode === "calendar" ? (
        destination?.code ? (
          <>
            <div className="flight-hunt-copy">
              <strong>Najtańsze terminy {origin?.name} → {destination.name}</strong>
              <span>Porównujemy cały rok i długość pobytu {Math.min(daysMin, daysMax)}–{Math.max(daysMin, daysMax)} dni.</span>
            </div>
            {calendarSrc && <ScriptSlot id="tripownia-price-calendar" src={calendarSrc} />}
          </>
        ) : (
          <div className="flight-hunt-empty">
            <strong>Wpisz kierunek.</strong>
            <span>Nie musisz wybierać konkretnej daty — po wyborze miasta pokażemy kalendarz najtańszych terminów.</span>
          </div>
        )
      ) : (
        <>
          <div className="flight-hunt-copy">
            <strong>Dokąd najtaniej z {origin?.name || "wybranego lotniska"}?</strong>
            <span>Przeglądaj kierunki po cenie zamiast zaczynać od konkretnego miejsca.</span>
          </div>
          {mapSrc && <ScriptSlot id="tripownia-low-price-map" src={mapSrc} />}
        </>
      )}

      <div className="flight-hunt-note">
        Dane i przejścia rezerwacyjne są obsługiwane przez afiliacyjne narzędzia Travelpayouts/Aviasales przypisane do Tripowni.
      </div>
    </section>
  );
}
