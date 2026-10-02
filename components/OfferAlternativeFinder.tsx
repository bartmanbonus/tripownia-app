"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { CalendarDays, LoaderCircle, Plane, Search } from "lucide-react";
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
  currentOfferId?: number;
};

type ChangeMode = "date" | "airport" | "both";

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

const POLISH_MONTHS: Record<string, number> = {
  stycznia: 1, lutego: 2, marca: 3, kwietnia: 4, maja: 5, czerwca: 6,
  lipca: 7, sierpnia: 8, wrzesnia: 9, pazdziernika: 10, listopada: 11, grudnia: 12,
};

function inferDepartureDate(value: string) {
  const raw = value
    .toLocaleLowerCase("pl")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[–—]/g, "-");

  const iso = value.match(/20\d{2}-\d{2}-\d{2}/);
  if (iso?.[0]) return iso[0];

  const dotted = value.match(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2})\b/);
  if (dotted) {
    return `${dotted[3]}-${String(Number(dotted[2])).padStart(2, "0")}-${String(Number(dotted[1])).padStart(2, "0")}`;
  }

  const polishRange = raw.match(/\b(\d{1,2})\s*-\s*\d{1,2}\s+([a-z]+)\s+(20\d{2})\b/);
  if (polishRange) {
    const month = POLISH_MONTHS[polishRange[2]];
    if (month) {
      return `${polishRange[3]}-${String(month).padStart(2, "0")}-${String(Number(polishRange[1])).padStart(2, "0")}`;
    }
  }

  const polishSingle = raw.match(/\b(\d{1,2})\s+([a-z]+)\s+(20\d{2})\b/);
  if (polishSingle) {
    const month = POLISH_MONTHS[polishSingle[2]];
    if (month) {
      return `${polishSingle[3]}-${String(month).padStart(2, "0")}-${String(Number(polishSingle[1])).padStart(2, "0")}`;
    }
  }

  return "";
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
  currentOfferId = 0,
}: Props) {
  const initialAirport = useMemo(() => resolveAirportCode(airportCode, departure), [airportCode, departure]);
  const originalDepartureDate = useMemo(() => inferDepartureDate(dates), [dates]);
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [changeMode, setChangeMode] = useState<ChangeMode>("date");
  const [selectedAirport, setSelectedAirport] = useState(initialAirport);
  const [selectedDate, setSelectedDate] = useState("");
  const [flexDays, setFlexDays] = useState("7");
  const [results, setResults] = useState<Offer[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const usesDate = changeMode === "date" || changeMode === "both";
  const usesAirport = changeMode === "airport" || changeMode === "both";
  const canSearch = !loading && (!usesDate || Boolean(selectedDate));

  function chooseMode(mode: ChangeMode) {
    setChangeMode(mode);
    setNotice("");
    setResults([]);
    setSearched(false);
    if (mode === "date") setSelectedAirport(initialAirport);
    if (mode === "airport") setSelectedDate("");
  }

  async function runSearch(event?: FormEvent, forceAnyAirport = false, forceAnyDate = false) {
    event?.preventDefault();
    if (!forceAnyDate && usesDate && !selectedDate) {
      setNotice("Wybierz datę wylotu, żebyśmy mogli znaleźć najbliższe warianty tej wycieczki.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setNotice("");

    const airport = forceAnyAirport ? "" : usesAirport ? selectedAirport : initialAirport;
    const date = forceAnyDate ? "" : usesDate ? selectedDate : changeMode === "airport" ? originalDepartureDate : "";
    const flex = usesDate ? Math.max(0, Number(flexDays) || 0) : 0;

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
      mode: changeMode,
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
          .filter((offer: Offer) => !currentOfferId || offer.id !== currentOfferId)
          .sort((a: Offer, b: Offer) => Number(a.price || Infinity) - Number(b.price || Infinity));
        return { data, offers };
      };

      const hotelQuery = String(hotel || "").trim();
      const normalizedHotel = normalize(hotelQuery);
      const genericHotel = /^(hotel|resort|nocleg|obiekt)( w centrum)?( [1-5])?$/.test(normalizedHotel);
      const canSearchSameHotel = hotelQuery.length >= 4 && !genericHotel;
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
                ? `Mamy ${found.length} wariantów tej samej wycieczki lub hotelu.`
                : `Nie ma teraz dokładnie tego samego hotelu. Pokazujemy najlepsze opcje w ${city} dla wybranych ustawień.`,
              result.data?.partial ? "Część źródeł może być chwilowo niepełna." : "",
            ]
              .filter(Boolean)
              .join(" ")
          : result.data?.notice || "Nie znaleźliśmy teraz potwierdzonej alternatywy dla tych ustawień."
      );

      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } catch {
      setResults([]);
      setNotice("Nie udało się teraz pobrać wariantów. Spróbuj ponownie albo poszerz wyszukiwanie.");
    } finally {
      setLoading(false);
    }
  }

  const airportLabel = selectedAirport
    ? airportOptions.find((airport: any) => airport.code === selectedAirport)?.label || selectedAirport
    : "Wszystkie lotniska";

  return (
    <section id="alternatywy" className={styles.wrapper} aria-labelledby="offer-alternatives-title">
      <div className={styles.heading}>
        <div>
          <div className={styles.kicker}>NIE PASUJE TERMIN LUB WYLOT?</div>
          <h2 id="offer-alternatives-title">Znajdź tę samą wycieczkę w innym wariancie</h2>
          <p>Nie zaczynaj wyszukiwania od nowa. Zmień tylko to, czego potrzebujesz.</p>
        </div>
        <div className={styles.current}>
          <span>Obecna oferta</span>
          <strong>{departure} · {dates}</strong>
          <small>{nights} nocy · {board}</small>
        </div>
      </div>

      <div className={styles.modeGrid} role="group" aria-label="Co chcesz zmienić?">
        <button type="button" className={changeMode === "date" ? styles.modeActive : ""} aria-pressed={changeMode === "date"} onClick={() => chooseMode("date")}>
          <CalendarDays size={18} />
          <span><strong>Inny termin</strong><small>Zostaw obecne lotnisko</small></span>
        </button>
        <button type="button" className={changeMode === "airport" ? styles.modeActive : ""} aria-pressed={changeMode === "airport"} onClick={() => chooseMode("airport")}>
          <Plane size={18} />
          <span><strong>Inne lotnisko</strong><small>{originalDepartureDate ? "Zostaw ten sam termin" : "Szukaj dostępnych terminów"}</small></span>
        </button>
        <button type="button" className={changeMode === "both" ? styles.modeActive : ""} aria-pressed={changeMode === "both"} onClick={() => chooseMode("both")}>
          <Search size={18} />
          <span><strong>Zmień oba</strong><small>Termin i miejsce wylotu</small></span>
        </button>
      </div>

      <form className={styles.form} onSubmit={runSearch}>
        {usesAirport && (
          <label className={styles.field}>
            <span><Plane size={16} /> Skąd chcesz lecieć?</span>
            <select value={selectedAirport} onChange={(event) => setSelectedAirport(event.target.value)}>
              <option value="">Wszystkie lotniska w Polsce</option>
              {airportOptions.map((airport: any) => (
                <option key={airport.code} value={airport.code}>{airport.label} ({airport.code})</option>
              ))}
            </select>
          </label>
        )}

        {usesDate && (
          <div className={styles.dateBlock}>
            <label className={styles.field}>
              <span><CalendarDays size={16} /> Kiedy chcesz wylecieć?</span>
              <input
                type="date"
                min={todayIso}
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>

            {selectedDate && (
              <div className={styles.flexRow}>
                <span>Może być:</span>
                {[["0", "dokładnie"], ["3", "±3 dni"], ["7", "±7 dni"], ["14", "±14 dni"]].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={flexDays === value}
                    className={flexDays === value ? styles.flexActive : ""}
                    onClick={() => setFlexDays(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button className={styles.submit} type="submit" disabled={!canSearch}>
          {loading ? <LoaderCircle className={styles.spinner} size={18} /> : <Search size={18} />}
          {loading ? "Szukamy wariantów..." : "Znajdź tę samą wycieczkę"}
        </button>
      </form>

      <div className={styles.contextLine}>
        <span>Kierunek: <strong>{city}</strong></span>
        {usesAirport && <span>Wylot: <strong>{airportLabel}</strong></span>}
        {usesDate && selectedDate && <span>Termin: <strong>{selectedDate}</strong></span>}
        {changeMode === "airport" && originalDepartureDate && <span>Termin: <strong>{originalDepartureDate}</strong></span>}
      </div>

      <div ref={resultsRef} className={styles.resultAnchor} aria-live="polite">
        {notice && <p className={styles.notice}>{notice}</p>}

        {searched && !loading && results.length === 0 && (
          <div className={styles.empty}>
            <div>
              <strong>Nic sensownego w tych ustawieniach.</strong>
              <span>Możemy zostawić tylko kierunek i pokazać wszystkie dostępne warianty.</span>
            </div>
            <button type="button" onClick={() => runSearch(undefined, true, true)}>Pokaż wszystkie warianty</button>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className={styles.resultsHead}>
              <strong>Dostępne warianty</strong>
              <span>Najtańsze pokazujemy jako pierwsze.</span>
            </div>
            <div className={`cards-grid ${styles.results}`}>
              {results.map((offer) => (
                <OfferCard key={offer.id} offer={offer} sourceSurface="offer_alternative_finder" />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
