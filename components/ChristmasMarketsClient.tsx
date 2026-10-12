"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BedDouble, CalendarDays, CheckCircle2, MapPin, Plane, TrainFront, RotateCcw, Search, Ticket } from "lucide-react";
import styles from "@/app/jarmarki-bozonarodzeniowe/markets.module.css";
import { partners } from "@/lib/partners";

type MarketIdea = {
  city: string;
  country: string;
  flag: string;
  market: string;
  note: string;
  see: string;
  accent: string;
  months: string[];
  opens: string;
  closes: string;
  january?: { opens: string; closes: string; market: string; note: string; see: string };
};

const MARKET_IDEAS: MarketIdea[] = [
  {
    city: "Wiedeń", country: "Austria", flag: "🇦🇹", accent: "KLASYK",
    opens: "2026-11-13", closes: "2026-12-26",
    january: { opens: "2027-01-01", closes: "2027-01-06", market: "Schönbrunn: do 6 stycznia 2027",
      note: "W styczniu nadal działa jarmark przy pałacu Schönbrunn (nie Rathausplatz).",
      see: "Schönbrunn · ogrody pałacowe · centrum Wiednia" },
    market: "13 listopada – 26 grudnia 2026",
    note: "Klasyczny pierwszy jarmarkowy city break. Kilka pięknych lokalizacji w jednym mieście.",
    see: "Rathausplatz · Schönbrunn · Belweder",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Praga", country: "Czechy", flag: "🇨🇿", accent: "RÓWNIEŻ W STYCZNIU",
    opens: "2026-11-28", closes: "2027-01-06",
    market: "28 listopada 2026 – 6 stycznia 2027",
    note: "Dobry wybór także na przełom roku. W styczniu szukaj terminów przed 6 stycznia.",
    see: "Rynek Staromiejski · Most Karola · Zamek",
    months: ["2026-11", "2026-12", "2027-01"],
  },
  {
    city: "Drezno", country: "Niemcy", flag: "🇩🇪", accent: "TRADYCYJNY",
    opens: "2026-11-25", closes: "2026-12-24",
    market: "25 listopada – 24 grudnia 2026",
    note: "Striezelmarkt i klasyczny świąteczny klimat. Jarmark kończy się przed świętami.",
    see: "Altmarkt · Frauenkirche · Stare Miasto",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Norymberga", country: "Niemcy", flag: "🇩🇪", accent: "NIEMIECKI KLASYK",
    opens: "2026-11-27", closes: "2026-12-24",
    market: "27 listopada – 24 grudnia 2026",
    note: "Christkindlesmarkt w historycznym centrum, idealny na krótki przedświąteczny wypad.",
    see: "Hauptmarkt · Frauenkirche · Kaiserburg",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Berlin", country: "Niemcy", flag: "🇩🇪", accent: "DUŻY WYBÓR",
    opens: "2026-11-23", closes: "2026-12-31",
    january: { opens: "2027-01-01", closes: "2027-01-03", market: "Rotes Rathaus: do 3 stycznia 2027",
      note: "Gendarmenmarkt kończy się 31 grudnia. W styczniu wybierz jarmark przy Rotes Rathaus.",
      see: "Rotes Rathaus · Neptunbrunnen · Humboldt Forum" },
    market: "23 listopada – 31 grudnia 2026",
    note: "Wiele jarmarków w różnych dzielnicach — od klasycznych po nowoczesne.",
    see: "Gendarmenmarkt · Charlottenburg · Mitte",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Budapeszt", country: "Węgry", flag: "🇭🇺", accent: "JARMARK + TERMY",
    opens: "2026-11-13", closes: "2027-01-01",
    market: "połowa listopada – 31 grudnia 2026",
    note: "Świąteczne place, termy i wieczorny Dunaj w jednym krótkim wyjeździe.",
    see: "Bazylika św. Stefana · Vörösmarty tér · termy",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Salzburg", country: "Austria", flag: "🇦🇹", accent: "ALPEJSKI KLIMAT",
    opens: "2026-11-19", closes: "2027-01-01",
    market: "19 listopada 2026 – 1 stycznia 2027",
    note: "Kameralny, alpejski klimat. Na pełny city break najlepiej wybrać listopad lub grudzień.",
    see: "Domplatz · Residenzplatz · Mirabell · Hellbrunn",
    months: ["2026-11", "2026-12"],
  },
];

const AIRPORTS = [
  { value: "WAW", label: "Warszawa Chopin (WAW)" },
  { value: "WMI", label: "Warszawa-Modlin (WMI)" },
  { value: "KRK", label: "Kraków (KRK)" },
  { value: "KTW", label: "Katowice (KTW)" },
  { value: "GDN", label: "Gdańsk (GDN)" },
  { value: "WRO", label: "Wrocław (WRO)" },
  { value: "POZ", label: "Poznań (POZ)" },
  { value: "RZE", label: "Rzeszów (RZE)" },
  { value: "ALL", label: "Cała Polska — porównaj możliwości" },
];

const MONTHS = [
  { value: "2026-11", label: "Listopad 2026", short: "Listopad" },
  { value: "2026-12", label: "Grudzień 2026", short: "Grudzień" },
  { value: "2027-01", label: "Styczeń 2027", short: "Styczeń" },
];

const STAYS = [
  { value: "2-4", label: "2–4 noce · weekend" },
  { value: "4-5", label: "4–5 nocy · długi weekend" },
  { value: "5-7", label: "5–7 nocy · dłuższy wyjazd" },
];

function marketDepartureWindow(idea: MarketIdea, month: string) {
  const period = month === "2027-01" && idea.january ? idea.january : idea;
  const [year, monthNumber] = month.split("-").map(Number);
  const monthEnd = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const from = [period.opens, `${month}-01`].sort().at(-1) || "";
  const to = [period.closes, `${month}-${String(monthEnd).padStart(2, "0")}`].sort()[0] || "";
  return from <= to ? { from, to } : null;
}

const MARKET_AIRPORTS: Record<string, string> = {
  Wiedeń: "VIE", Praga: "PRG", Drezno: "DRS", Norymberga: "NUE",
  Berlin: "BER", Budapeszt: "BUD", Salzburg: "SZG",
};

// Known scheduled nonstop routes, confirmed against airline timetables (October 2026).
// A route being scheduled does NOT guarantee a fare or seat on a selected date.
const SCHEDULED_DIRECT_FROM_WAW = new Set(["Wiedeń", "Budapeszt"]);

function knownDirectOrigin(airport: string, city: string) {
  // With "Cała Polska", direct people to the specific confirmed Warsaw origin.
  return (airport === "WAW" || airport === "ALL") && SCHEDULED_DIRECT_FROM_WAW.has(city)
    ? "WAW"
    : "";
}

type FlightAvailability = "found" | "none" | "unknown";
type FlightStatuses = { query: string; byCity: Record<string, FlightAvailability> };

// Preserve the approved Klook tracking IDs and link to its Europe rail section.
function railHref(idea: MarketIdea, origin: string, month: string) {
  const target = new URL(partners.klook.buildUrl());
  target.searchParams.set("u", "https://www.klook.com/europe-rail/");
  return "/go/live?" + new URLSearchParams({
    partner: "klook",
    target: target.toString(),
    destination: idea.city,
    source: "christmas_markets_train",
    page: "/jarmarki-bozonarodzeniowe",
    offer: [origin, idea.city, month].join("_"),
  }).toString();
}

// City-specific, date-flexible Booking.com search preserving the existing affiliate AID.
function bookingHotelHref(idea: MarketIdea) {
  const destination = new URL("https://www.booking.com/searchresults.html");
  destination.searchParams.set("ss", idea.city + ", " + idea.country);
  destination.searchParams.set("lang", "pl");
  destination.searchParams.set("selected_currency", "PLN");
  const target = partners.booking.buildUrl(destination.toString());
  return "/go/live?" + new URLSearchParams({
    partner: "booking",
    target,
    destination: idea.city,
    source: "christmas_markets_hotels",
    page: "/jarmarki-bozonarodzeniowe",
  }).toString();
}

function flightsHref(idea: MarketIdea, airport: string, month: string) {
  return "/loty?" + new URLSearchParams({
    destination: idea.city, origin: airport, month,
  }).toString();
}

export default function ChristmasMarketsClient() {
  const [airport, setAirport] = useState("WAW");
  const [month, setMonth] = useState("2026-12");
  const [duration, setDuration] = useState("2-4");

  const queryKey = [airport, month, duration].join("|");
  const [flights, setFlights] = useState<FlightStatuses>({ query: "", byCity: {} });

  // In addition to verified scheduled routes, use the price calendar to discover
  // other non-stop flights. Empty/failed calendar results do not invalidate a
  // known route from a separate timetable.
  useEffect(() => {
    const controller = new AbortController();
    setFlights({ query: queryKey, byCity: {} });
    if (airport === "ALL") return () => controller.abort();

    const [minDays, maxDays] = duration.split("-").map(Number);
    for (const idea of MARKET_IDEAS) {
      const bounds = marketDepartureWindow(idea, month);
      if (!bounds) continue;
      const params = new URLSearchParams({
        origin: airport,
        destination: MARKET_AIRPORTS[idea.city],
        month,
        minDays: String(minDays),
        maxDays: String(maxDays),
        direct: "true",
      });

      fetch("/api/flight-calendar?" + params.toString(), { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) return "unknown" as const;
          const data = await response.json();
          if (!data?.ok || !Array.isArray(data.results)) return "unknown" as const;
          const hasDirectFlight = data.results.some((item: {
            departDate?: string; returnDate?: string; price?: number;
            outboundStops?: number; returnStops?: number;
          }) =>
            Number(item.price || 0) > 0
            && Boolean(item.departDate && item.returnDate)
            && String(item.departDate) >= bounds.from
            && String(item.departDate) <= bounds.to
            && String(item.returnDate) <= bounds.to
            && Number(item.outboundStops || 0) === 0
            && Number(item.returnStops || 0) === 0
          );
          return hasDirectFlight ? "found" as const : "none" as const;
        })
        .catch(() => "unknown" as const)
        .then((availability: FlightAvailability) => {
          if (controller.signal.aborted) return;
          setFlights((current) => current.query === queryKey
            ? { ...current, byCity: { ...current.byCity, [idea.city]: availability } }
            : current);
        });
    }
    return () => controller.abort();
  }, [airport, month, duration, queryKey]);


  const availableMarkets = useMemo(
    () => MARKET_IDEAS.filter((idea) => Boolean(marketDepartureWindow(idea, month))),
    [month],
  );
  const monthLabel = MONTHS.find((item) => item.value === month)?.label || "wybrany miesiąc";
  const airportLabel = AIRPORTS.find((item) => item.value === airport)?.label || "wybrane lotnisko";
  const stayLabel = STAYS.find((item) => item.value === duration)?.label || "wybrany pobyt";

  const restore = () => {
    setAirport("WAW");
    setMonth("2026-12");
    setDuration("2-4");
  };

  return (
    <>
      <section className={styles.finder} aria-labelledby="market-finder-title" id="planuj-jarmark">
        <div className={styles.finderIntro}>
          <div>
            <span className={styles.eyebrow}>ZAPLANUJ SWÓJ WYJAZD</span>
            <h2 id="market-finder-title">Najpierw parametry. Potem wybierz miasto.</h2>
            <p>Wybierz miasto, miesiąc i długość pobytu. Kiedy nie ma potwierdzonego lotu bezpośredniego, pokażemy pociągi i noclegi.</p>
          </div>
          <span className={styles.finderStep}><CheckCircle2 size={18} /> Bez sztywnych dat</span>
        </div>

        <div className={styles.controls}>
          <label className={styles.field} htmlFor="market-airport">
            <span><MapPin size={16} /> Skąd wyruszasz?</span>
            <select id="market-airport" value={airport} onChange={(event) => setAirport(event.target.value)}>
              {AIRPORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <div className={styles.monthSelector} role="group" aria-label="Wybierz miesiąc wyjazdu">
            <span className={styles.fieldCaption}><CalendarDays size={16} /> Kiedy?</span>
            <div className={styles.monthButtons}>
              {MONTHS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={month === item.value ? styles.monthActive : undefined}
                  aria-pressed={month === item.value}
                  onClick={() => setMonth(item.value)}
                  title={item.label}
                >
                  {item.short}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field} htmlFor="market-duration">
            <span><CalendarDays size={16} /> Na jak długo?</span>
            <select id="market-duration" value={duration} onChange={(event) => setDuration(event.target.value)}>
              {STAYS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.finderBottom}>
          <p><CheckCircle2 size={16} /> <strong>Twój wybór:</strong> {airportLabel} · {monthLabel} · {stayLabel}{airport === "ALL" ? " · wybierz jedno lotnisko, by sprawdzić loty" : ""}</p>
          <button type="button" onClick={restore}><RotateCcw size={14} /> Przywróć ustawienia</button>
        </div>
      </section>

      <section className={styles.results} id="jarmarki-wyniki" aria-labelledby="market-results-title">
        <div className={styles.resultsHead}>
          <div>
            <span className={styles.eyebrow}>WYBIERZ SWÓJ KIERUNEK</span>
            <h2 id="market-results-title">Jarmarki na {monthLabel.toLocaleLowerCase("pl-PL")}</h2>
            <p>Sprawdź loty do Wiednia i Budapesztu z Warszawy oraz inne loty znalezione w kalendarzu cenowym. Do każdego miasta możesz wybrać też pociąg i hotel.</p>
          </div>
          <span className={styles.counter} role="status" aria-live="polite">
            <Search size={16} /> {availableMarkets.length} {availableMarkets.length === 1 ? "kierunek" : availableMarkets.length > 4 ? "kierunków" : "kierunki"}
          </span>
        </div>

        <div className={styles.cards}>
          {availableMarkets.map((idea) => {
            const status = flights.query === queryKey ? flights.byCity[idea.city] : undefined;
            const flightConfirmed = status === "found";
            const scheduledOrigin = knownDirectOrigin(airport, idea.city);
            const showFlight = flightConfirmed || Boolean(scheduledOrigin);
            const flightOrigin = scheduledOrigin || airport;
            return (
            <article className={styles.card} key={idea.city}>
              <div className={styles.cardHeader}>
                <div className={styles.cityWrap}>
                  <span className={styles.flag} aria-hidden="true">{idea.flag}</span>
                  <div>
                    <small>{idea.country}</small>
                    <h3>{idea.city}</h3>
                  </div>
                </div>
                <span className={styles.cardBadge}>{idea.accent}</span>
              </div>

              <p className={styles.cardNote}>{month === "2027-01" && idea.january ? idea.january.note : idea.note}</p>

              <div className={styles.dates}>
                <CalendarDays size={19} aria-hidden="true" />
                <div>
                  <small>OKRES JARMARKU</small>
                  <strong>{month === "2027-01" && idea.january ? idea.january.market : idea.market}</strong>
                </div>
              </div>

              <div className={styles.sights}><strong>Warto zobaczyć</strong><span>{month === "2027-01" && idea.january ? idea.january.see : idea.see}</span></div>

              <p className={styles.transportNote} aria-live="polite">
                {flightConfirmed
                  ? <><Plane size={14}/> Znaleziono lot bezpośredni w kalendarzu cenowym.</>
                  : scheduledOrigin
                    ? <><Plane size={14}/> Z Warszawy Chopina kursują loty bezpośrednie. Sprawdź dostępność i cenę na wybrany termin.</>
                  : status === "none"
                    ? <><TrainFront size={14}/> Nie znaleziono lotu bezpośredniego w tym okresie. Sprawdź pociąg.</>
                    : status === "unknown"
                      ? <><TrainFront size={14}/> Nie możemy potwierdzić lotu. Możesz sprawdzić pociąg.</>
                      : <><TrainFront size={14}/> {airport === "ALL" ? "Pociąg: miasto odjazdu wybierzesz u partnera." : "Sprawdzamy loty; pociągi już dostępne."}</>
                }
              </p>

              <div className={styles.cardActions}>
                {showFlight ? (
                  <Link className={styles.primaryAction} href={flightsHref(idea, flightOrigin, month)}>
                    <Plane size={17}/> {airport === "ALL" && scheduledOrigin ? "Loty z Warszawy" : "Sprawdź loty"} <ArrowRight size={17}/>
                  </Link>
                ) : (
                  <Link className={styles.primaryAction} href={railHref(idea, airport, month)} rel="sponsored"
                    title={"Sprawdź pociągi do " + idea.city + " — stację i daty wybierzesz u partnera"}>
                    <TrainFront size={18}/> Sprawdź pociągi <ArrowRight size={17}/>
                  </Link>
                )}
                <div className={styles.secondaryActions}>
                  {showFlight && (
                    <Link href={railHref(idea, airport, month)} rel="sponsored" title="Wybierz stację i daty na stronie partnera">
                      <TrainFront size={15}/> Pociągi
                    </Link>
                  )}
                  <Link href={bookingHotelHref(idea)} rel="sponsored" title={"Noclegi w " + idea.city + " — konkretne daty wybierzesz na Booking.com"}>
                    <BedDouble size={15}/> Hotele
                  </Link>
                  <Link href={"/atrakcje?q=" + encodeURIComponent(idea.city + " jarmark bożonarodzeniowy")}>
                    <Ticket size={15}/> Atrakcje
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        <div className={styles.note}>
          <CheckCircle2 size={19} aria-hidden="true" />
          <p><strong>Ważne:</strong> loty Warszawa–Wiedeń i Warszawa–Budapeszt wynikają z rozkładów połączeń, a nie z gwarantowanej dostępności miejsc w wybranym terminie. Brak lotu w kalendarzu cen nie dowodzi, że lot nie istnieje. Pociągi prowadzą do afiliacyjnej wyszukiwarki Klook — tam wybierzesz stacje i konkretne daty; dostępność połączeń z Polski nie jest gwarantowana. Hotele otwierają wyszukiwanie miasta w Booking.com z afiliacją Tripowni. Daty i ceny potwierdź u dostawców, a daty jarmarków u organizatorów.</p>
        </div>
        <nav className={styles.moreLinks} aria-label="Inne sposoby planowania">
          <Link href="/hotele">Znajdź nocleg <ArrowRight size={15}/></Link>
          <Link href="/city-break">City breaki z noclegiem <ArrowRight size={15}/></Link>
          <Link href="/moja-podroz">Mój plan podróży <ArrowRight size={15}/></Link>
        </nav>
      </section>
    </>
  );
}
