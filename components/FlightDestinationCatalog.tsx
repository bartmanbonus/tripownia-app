"use client";

import { useMemo, useState } from "react";
import {
  FLIGHT_DESTINATION_CATALOG,
  FLIGHT_CATALOG_REGIONS,
  normalizeFlightDestinationQuery,
} from "@/lib/flightDestinationCatalog";
import { kiwiFlightExitHref } from "@/lib/kiwiFlights";

type Props = { origin: string; pricedCodes: string[] };

export default function FlightDestinationCatalog({ origin, pricedCodes }: Props) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [remote, setRemote] = useState<Array<{code: string; name: string; country: string}>>([]);
  const [loading, setLoading] = useState(false);

  const priced = useMemo(() => new Set(pricedCodes.map((value) => value.toUpperCase())), [pricedCodes]);
  const items = useMemo(() => {
    const text = normalizeFlightDestinationQuery(query);
    return FLIGHT_DESTINATION_CATALOG.filter((place) => {
      if (place.code === origin || priced.has(place.code)) return false;
      if (region !== "all" && place.region !== region) return false;
      return !text || normalizeFlightDestinationQuery([place.code, place.name, place.country].join(" ")).includes(text);
    }).sort((a, b) => a.name.localeCompare(b.name, "pl"));
  }, [origin, priced, query, region]);

  async function findOtherPlaces() {
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const response = await fetch("/api/flight-places?q=" + encodeURIComponent(query.trim()), { cache: "no-store" });
      const data = await response.json();
      const rows = Array.isArray(data?.places) ? data.places : [];
      setRemote(rows.filter((item: {code?: string; name?: string}) => /^[A-Z]{3}$/.test(item.code || "") && item.name));
    } catch {
      setRemote([]);
    } finally {
      setLoading(false);
    }
  }

  const remoteResults = region === "all" && query.trim().length >= 2
    ? remote.filter((place) => !priced.has(place.code) && place.code !== origin && !items.some((item) => item.code === place.code))
    : [];
  const visible = query || expanded ? items : items.slice(0, 18);

  return (
    <section className="flight-catalog" aria-label="Pozostałe kierunki lotów">
      <div className="flight-catalog-heading">
        <div>
          <small>KATALOG TRAS · BEZ GWARANTOWANEJ CENY</small>
          <h3>Nie widzisz swojego kierunku?</h3>
          <p>Wyszukaj dowolne miasto. Kierunki poniżej nie mają aktualnie potwierdzonej ceny w Tripowni — sprawdzisz aktualną cenę przed rezerwacją, bez wymyślonych kwot.</p>
        </div>
        <strong>{items.length} kierunków</strong>
      </div>
      <div className="flight-catalog-controls">
        <input
          aria-label="Wyszukaj miasto, kraj albo kod lotniska"
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setRemote([]); }}
          onKeyDown={(event) => { if (event.key === "Enter") void findOtherPlaces(); }}
          placeholder="Np. Tokio, Rio, Kenia, Wietnam..."
        />
        <button type="button" onClick={findOtherPlaces} disabled={loading || query.trim().length < 2}>
          {loading ? "Szukamy..." : "Sprawdź inne miasta"}
        </button>
      </div>
      <div className="flight-catalog-regions" aria-label="Kontynent lub region">
        <button type="button" className={region === "all" ? "active" : ""} onClick={() => setRegion("all")}>Wszystkie</button>
        {FLIGHT_CATALOG_REGIONS.map((name) =>
          <button key={name} type="button" className={region === name ? "active" : ""} onClick={() => setRegion(name)}>{name}</button>
        )}
      </div>
      <div className="flight-catalog-grid">
        {visible.map((place) => (
          <a key={place.code} className="flight-catalog-card" href={kiwiFlightExitHref({ origin, destination: place.code, source: "flight_catalog", destinationName: place.name })} rel="sponsored">
            <strong>{place.name}</strong><span>{place.country} · {place.code}</span><em>Sprawdź lot →</em>
          </a>
        ))}
        {remoteResults.map((place) => (
          <a key={"remote-"+place.code} className="flight-catalog-card" href={kiwiFlightExitHref({ origin, destination: place.code, source: "flight_catalog_search", destinationName: place.name })} rel="sponsored">
            <strong>{place.name}</strong><span>{place.country} · {place.code}</span><em>Sprawdź lot →</em>
          </a>
        ))}
      </div>
      {!query && items.length > 18 &&
        <button type="button" className="flight-catalog-expand" onClick={() => setExpanded((current) => !current)}>
          {expanded ? "Pokaż mniej" : "Pokaż wszystkie kierunki (" + items.length + ")"}
        </button>}
      {query && visible.length === 0 && remoteResults.length === 0 && <p>Nie ma tego miejsca na liście. Kliknij „Sprawdź inne miasta”, aby wyszukać je w bazie lotnisk.</p>}
    </section>
  );
}
