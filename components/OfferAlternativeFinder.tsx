"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Plane, Search, SlidersHorizontal } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { airportOptions, type Offer } from "@/lib/offers";
import { trackEvent } from "@/lib/analytics";
import styles from "./OfferAlternativeFinder.module.css";

type Props = {
  city: string;
  country: string;
  nights: number;
  board: string;
  departure: string;
  airportCode?: string;
  dates: string;
  hotel?: string;
  currentOfferId: number;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveAirportCode(code: string | undefined, departure: string) {
  const explicit = String(code || "").trim().toUpperCase();
  if (explicit && airportOptions.some((airport: any) => airport.code === explicit)) return explicit;

  const wanted = normalize(departure);
  if (!wanted) return "";

  const matched = airportOptions.find((airport: any) => {
    const label = normalize(String(airport.label || ""));
    return label === wanted || label.includes(wanted) || wanted.includes(label);
  });
  return matched?.code || "";
}

function addDaysIso(value: string, days: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function OfferAlternativeFinder({
  city,
  country,
  nights,
  board,
  departure,
  airportCode,
  dates,
  hotel,
  currentOfferId,
}: Props) {
  const initialAirport = useMemo(() => resolveAirportCode(airportCode, departure), [airportCode, departure]);
  const [selectedAirport, setSelectedAirport] = useState(initialAirport);
  const [selectedDate, setSelectedDate] = useState("");
  const [flexDays, setFlexDays] = useState("7");
  const [results, setResults] = useState<Offer[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(event?: FormEvent, forceAnyAirport = false, forceAnyDate = false) {
    event?.preventDefault();
    setLoading(true);
    setSearched(true);
    setNotice("");

    const airport = forceAnyAirport ? "" : selectedAirport;
    const date = forceAnyDate ? "" : selectedDate;
    const flex = Math.max(0, Number(flexDays) || 0);

    const buildParams = (query: string) => {
      const params = new URLSearchParams({
        mode: "search",
        q: query,
        nights: String(Math.max(1, nights || 1)),
        fast: "1",
        strict: "1",
      });

      if (airport) params.set("from", airport);
      if (date) {
        params.set("start", addDaysIso(date, -flex));
        params.set("end", addDaysIso(date, flex));
        params.set("dateKind", "departure");
      }
      return params;
    };

    trackEvent("offer_alternative_search", {
      destination: city,
      country,
      hotel: hotel || "",
      from: airport || "any",
      date: date || "any",
      flex_days: date ? flex : null,
      offer_id: currentOfferId,
    });

    try {
      const search = async (query: string) => {
        const response = await fetch(`/api/today-offers?${buildParams(query).toString()}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok || data?.ok === false) throw new Error(data?.error || "search_failed");
        const offers = (Array.isArray(data?.offers) ? data.offers : [])
          .filter((offer: Offer) => offer.id !== currentOfferId)
          .sort((a: Offer, b: Offer) => Number(a.price || Infinity) - Number(b.price || Infinity));
        return { data, offers };
      };

      const hotelQuery = String(hotel || "").trim();
      const canSearchSameHotel = hotelQuery.length >= 4 && !/^hotel$/i.test(hotelQuery);
      let result = canSearchSameHotel ? await search(hotelQuery) : { data: null, offers: [] as Offer[] };
      let sameHotel = result.offers.length > 0;

      if (!result.offers.length) {
        result = await search(city);
        sameHotel = false;
      }

      const found = result.offers.slice(0, 6);
      setResults(found);
      setNotice(
        found.length
          ? [
              sameHotel
                ? `Znaleźliśmy ${found.length} wariantów tego samego hotelu/wyjazdu.`
                : `Nie znaleźliśmy tego samego hotelu, więc pokazujemy ${found.length} najlepszych alternatyw w kierunku ${city}.`,
              result.data?.notice || "",
              result.data?.partial ? "Część źródeł może być chwilowo niepełna." : "",
            ]
              .filter(Boolean)
              .join(" ")
          : result.data?.notice || "Nie znaleźliśmy teraz potwierdzonej alternatywy dla tych ustawień."
      );
    } catch {
      setResults([]);
      setNotice("Nie udało się teraz pobrać alternatyw. Spróbuj ponownie albo wyszukaj bez ograniczeń.");
    } finally {
      setLoading(false);
    }
  }

  const airportLabel = selectedAirport
    ? airportOptions.find((airport: any) => airport.code === selectedAirport)?.label || selectedAirport
    : "dowolne lotnisko";

  return (
    <section className={styles.wrapper} aria-labelledby="offer-alternatives-title">
      <div className={styles.heading}>
        <div>
          <div className={styles.kicker}>TEN SAM KIERUNEK, INNE MOŻLIWOŚCI</div>
          <h2 id="offer-alternatives-title">Inny termin albo inne miasto wylotu?</h2>
          <p>Zostań przy {city}. Zmień tylko termin, lotnisko albo oba parametry i od razu zobacz aktualne oferty.</p>
        </div>
        <div className={styles.current}>
          <span>Teraz</span>
          <strong>{departure} · {dates}</strong>
          <small>{nights} nocy · {board}</small>
        </div>
      </div>

      <form className={styles.form} onSubmit={runSearch}>
        <label className={styles.field}>
          <span><Plane size={16} /> Miasto wylotu</span>
          <select value={selectedAirport} onChange={(event) => setSelectedAirport(event.target.value)}>
            <option value="">Wszystkie lotniska w Polsce</option>
            {airportOptions.map((airport: any) => (
              <option key={airport.code} value={airport.code}>{airport.label} ({airport.code})</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span><CalendarDays size={16} /> Preferowana data wylotu</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span><SlidersHorizontal size={16} /> Elastyczność terminu</span>
          <select value={flexDays} onChange={(event) => setFlexDays(event.target.value)} disabled={!selectedDate}>
            <option value="0">Dokładnie ten dzień</option>
            <option value="3">± 3 dni</option>
            <option value="7">± 7 dni</option>
            <option value="14">± 14 dni</option>
          </select>
        </label>

        <button className={styles.submit} type="submit" disabled={loading}>
          <Search size={18} />
          {loading ? "Szukamy..." : "Pokaż alternatywy"}
        </button>
      </form>

      <div className={styles.summary} aria-live="polite">
        <span>Szukasz: <strong>{city}</strong></span>
        <span>Wylot: <strong>{airportLabel}</strong></span>
        <span>Termin: <strong>{selectedDate || "dowolny"}</strong></span>
      </div>

      {notice && <p className={styles.notice}>{notice}</p>}

      {searched && !loading && results.length === 0 && (
        <div className={styles.empty}>
          <strong>Nie ma dobrego dopasowania?</strong>
          <span>Poszerz wyszukiwanie — nadal zostawimy ten sam kierunek.</span>
          <button type="button" onClick={() => runSearch(undefined, true, true)}>Pokaż wszystkie terminy i lotniska</button>
        </div>
      )}

      {results.length > 0 && (
        <div className={`cards-grid ${styles.results}`}>
          {results.map((offer) => (
            <OfferCard key={offer.id} offer={offer} sourceSurface="offer_alternative_finder" />
          ))}
        </div>
      )}
    </section>
  );
}
