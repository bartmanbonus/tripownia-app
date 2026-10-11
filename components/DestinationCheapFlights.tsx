"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Plane, RefreshCw } from "lucide-react";

type FlightCalendarRow = {
  destinationCode?: string;
  price?: number;
  departDate?: string;
  returnDate?: string;
  outboundStops?: number;
  returnStops?: number;
};

type FlightCalendarResponse = {
  ok?: boolean;
  results?: FlightCalendarRow[];
};

type FlightResult = {
  origin: string;
  destination: "SEZ";
  price: number;
  departDate: string;
  returnDate: string;
  changes: number;
};

const POLISH_AIRPORTS = [
  "WAW", "WMI", "KRK", "KTW", "GDN", "WRO", "POZ", "RZE", "LUZ", "SZZ",
  "LCJ", "BZG", "IEG", "SZY", "RDO",
];

function isSeychelles(destination: string) {
  const normalized = destination.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return /^(seszele|seychelles|mahe|mahe, seszele)$/.test(normalized);
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return day + "." + month + "." + year;
}

function offerHref(offer: FlightResult) {
  return "/loty/oferta?" + new URLSearchParams({
    origin: offer.origin,
    destination: offer.destination,
    depart: offer.departDate,
    return: offer.returnDate,
    price: String(offer.price),
    name: "Mahé",
    country: "Seszele",
    changes: String(offer.changes),
  }).toString();
}

export default function DestinationCheapFlights({
  destination,
  airport,
  month,
  year,
}: {
  destination: string;
  airport: string;
  month: string;
  year: string;
}) {
  const supported = isSeychelles(destination);
  const origins = useMemo(() => {
    if (airport === "any") return POLISH_AIRPORTS;
    if (airport === "WAWA") return ["WAW", "WMI"];
    return POLISH_AIRPORTS.includes(airport) ? [airport] : [];
  }, [airport]);

  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!supported || !origins.length) {
      setFlights([]);
      setLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    setFlights([]);
    setLoading(true);
    setUnavailable(false);

    void Promise.all(origins.map(async (origin): Promise<{ rows: FlightResult[]; ok: boolean }> => {
      try {
        const params = new URLSearchParams({
          origin,
          destination: "SEZ",
          minDays: "7",
          maxDays: "14",
        });
        if (month !== "any" && year !== "any") params.set("month", year + "-" + month);
        const response = await fetch("/api/flight-calendar?" + params.toString(), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return { rows: [], ok: false };
        const payload = await response.json() as FlightCalendarResponse;
        if (!payload.ok || !Array.isArray(payload.results)) return { rows: [], ok: false };
        const rows: FlightResult[] = payload.results
          .filter((row) => row.destinationCode === "SEZ")
          .filter((row) => Number.isFinite(row.price) && Number(row.price) > 0)
          .filter((row) => /^20\d{2}-\d{2}-\d{2}$/.test(row.departDate || "")
            && /^20\d{2}-\d{2}-\d{2}$/.test(row.returnDate || ""))
          .map((row) => ({
            origin,
            destination: "SEZ",
            price: Math.round(Number(row.price)),
            departDate: String(row.departDate),
            returnDate: String(row.returnDate),
            changes: Math.max(0, Number(row.outboundStops) || 0, Number(row.returnStops) || 0),
          }));
        return { rows, ok: true };
      } catch {
        return { rows: [], ok: false };
      }
    })).then((responses) => {
      if (!active) return;
      const today = new Date().toISOString().slice(0, 10);
      const exactMonth = month !== "any" && year !== "any" ? year + "-" + month : "";
      const unique = new Map<string, FlightResult>();

      responses.flatMap((response) => response.rows)
        .filter((row) => row.departDate >= today && row.returnDate > row.departDate)
        .filter((row) => !exactMonth || row.departDate.startsWith(exactMonth))
        .forEach((row) => {
          const key = [row.origin, row.departDate, row.returnDate].join(":");
          const current = unique.get(key);
          if (!current || row.price < current.price) unique.set(key, row);
        });

      setFlights(Array.from(unique.values())
        .sort((a, b) => a.price - b.price || a.departDate.localeCompare(b.departDate))
        .slice(0, 8));
      setUnavailable(responses.every((response) => !response.ok));
    }).finally(() => {
      if (!active) return;
      window.clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [supported, origins, month, year]);

  if (!supported) return null;

  return (
    <section className="destination-monthly-results" aria-label="Tanie loty na Seszele" style={{ marginTop: 20 }}>
      <div className="destination-monthly-head">
        <div>
          <strong>✈️ Tańsza alternatywa: same loty na Seszele</strong>
          <span>
            Porównujemy też loty w obie strony, nie tylko gotowe wakacje.
            To ceny samych biletów bez hotelu; bagaż i dostępność potwierdzisz podczas rezerwacji.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="deals-filter-notice">
          <RefreshCw size={16} className="is-spinning"/> Sprawdzamy tańsze loty z polskich lotnisk…
        </div>
      ) : flights.length ? (
        <>
          <div className="destination-monthly-grid">
            {flights.map((flight) => (
              <Link
                key={[flight.origin, flight.departDate, flight.returnDate].join("-")}
                className="destination-month-card"
                href={offerHref(flight)}
              >
                <div className="destination-month-card-top">
                  <span className="destination-month-card-badge">SAM LOT · TAM I Z POWROTEM</span>
                  <Plane size={18}/>
                </div>
                <div className="destination-month-card-main">
                  <small>{flight.origin} → SEZ · Mahé</small>
                  <strong>od {flight.price.toLocaleString("pl-PL")} zł/os.</strong>
                  <span><CalendarDays size={14}/> {formatDate(flight.departDate)} – {formatDate(flight.returnDate)}</span>
                  <span>{flight.changes === 0 ? "Bez przesiadek" : flight.changes === 1 ? "1 przesiadka" : flight.changes + " przesiadki"}</span>
                </div>
                <div className="destination-month-card-cta">
                  Sprawdź ten lot <ArrowRight size={16}/>
                </div>
              </Link>
            ))}
          </div>
          <small style={{ display: "block", marginTop: 10 }}>
            Ceny orientacyjne z kalendarza lotów, mogą się zmieniać. Nie porównuj ich bezpośrednio z cenami pakietów lot + hotel poniżej.
          </small>
        </>
      ) : (
        <div className="self-search-empty deals-simple-empty">
          <strong>{unavailable ? "Nie udało się pobrać aktualnych cen lotów." : "Brak znalezionych lotów w wybranym terminie lub z tego lotniska."}</strong>
          <span>Sprawdź inny miesiąc, lotnisko albo elastyczne wyszukiwanie.</span>
          <Link href={"/loty?destination=" + encodeURIComponent(destination)}>Wyszukaj inne loty →</Link>
        </div>
      )}
    </section>
  );
}
