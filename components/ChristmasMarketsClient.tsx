"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BedDouble, CalendarDays, CheckCircle2, MapPin, Plane, TrainFront, RotateCcw, Search, Ticket, X } from "lucide-react";
import styles from "@/app/jarmarki-bozonarodzeniowe/markets.module.css";
import { partners } from "@/lib/partners";
import { MARKET_RAIL_ORIGINS, marketOriginForAirport, marketDestinationStations, marketStationDirectionsHref } from "@/lib/marketRailStations";
import { marketFlightDateSuggestions, marketFlightDateLabel, marketKiwiFlightHref } from "@/lib/marketFlightDates";
import { parseMarketFlightPrices, marketFlightPriceDateLabel, type MarketFlightPrice } from "@/lib/marketFlightPrices";

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
const SCHEDULED_DIRECT_FROM_WAW = new Set(["Wiedeń", "Budapeszt", "Praga", "Berlin"]);

function knownDirectOrigin(airport: string, city: string) {
  // With "Cała Polska", direct people to the specific confirmed Warsaw origin.
  return (airport === "WAW" || airport === "ALL") && SCHEDULED_DIRECT_FROM_WAW.has(city)
    ? "WAW"
    : "";
}

type FlightAvailability = "found" | "none" | "unknown";
type FlightStatuses = { query: string; byCity: Record<string, FlightAvailability>; prices: Record<string, MarketFlightPrice[]> };

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

function flightsHref(idea: MarketIdea, airport: string, month: string, duration: string) {
  const bounds = marketDepartureWindow(idea, month);
  const params = new URLSearchParams({
    destination: idea.city,
    destinationCode: MARKET_AIRPORTS[idea.city],
    origin: airport,
    month,
    duration,
    autoSearch: "1",
  });
  if (bounds) {
    params.set("marketFrom", bounds.from);
    params.set("marketTo", bounds.to);
  }
  return "/loty?" + params.toString();
}

export default function ChristmasMarketsClient() {
  const [airport, setAirport] = useState("WAW");
  const [month, setMonth] = useState("2026-12");
  const [duration, setDuration] = useState("2-4");
  const [expandedFlightCity, setExpandedFlightCity] = useState<string | null>(null);
  const [expandedRailCity, setExpandedRailCity] = useState<string | null>(null);
  const [railOriginId, setRailOriginId] = useState("WAW");
  const [railDestinationId, setRailDestinationId] = useState("");

  const queryKey = [airport, month, duration].join("|");
  const [flights, setFlights] = useState<FlightStatuses>({ query: "", byCity: {}, prices: {} });

  // In addition to verified scheduled routes, use the price calendar to discover
  // other non-stop flights. Empty/failed calendar results do not invalidate a
  // known route from a separate timetable.
  useEffect(() => {
    const controller = new AbortController();
    setFlights({ query: queryKey, byCity: {}, prices: {} });
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
          if (!response.ok) return { status: "unknown" as FlightAvailability, prices: [] as MarketFlightPrice[] };
          const data = await response.json();
          if (!data?.ok) return { status: "unknown" as FlightAvailability, prices: [] as MarketFlightPrice[] };
          const prices = parseMarketFlightPrices(data, {
            from: bounds.from,
            to: bounds.to,
            minNights: minDays,
            maxNights: maxDays,
          });
          return { status: (prices.length ? "found" : "none") as FlightAvailability, prices };
        })
        .catch(() => ({ status: "unknown" as FlightAvailability, prices: [] as MarketFlightPrice[] }))
        .then(({ status, prices }) => {
          if (controller.signal.aborted) return;
          setFlights((current) => current.query === queryKey
            ? {
                ...current,
                byCity: { ...current.byCity, [idea.city]: status },
                prices: { ...current.prices, [idea.city]: prices },
              }
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
  const monthHeading = ({
    "2026-11": "listopadzie 2026",
    "2026-12": "grudniu 2026",
    "2027-01": "styczniu 2027",
  } as Record<string, string>)[month] || month;

  const expandedIdea = availableMarkets.find((idea) => idea.city === expandedFlightCity) || null;
  const expandedPrices = expandedIdea && flights.query === queryKey ? flights.prices[expandedIdea.city] || [] : [];
  const expandedOrigin = expandedIdea ? knownDirectOrigin(airport, expandedIdea.city) || airport : airport;
  const expandedBounds = expandedIdea ? marketDepartureWindow(expandedIdea, month) : null;
  const [minimumNights, maximumNights] = duration.split("-").map(Number);
  const suggestedDates = expandedBounds
    ? marketFlightDateSuggestions({
        month, from: expandedBounds.from, to: expandedBounds.to,
        minNights: minimumNights, maxNights: maximumNights, limit: 3,
      })
    : [];

  function toggleFlightPanel(city: string) {
    setExpandedRailCity(null);
    const opening = expandedFlightCity !== city;
    setExpandedFlightCity(opening ? city : null);
    if (opening && typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById("jarmarki-flight-panel")?.scrollIntoView({
          behavior: "smooth", block: "center",
        });
      });
    }
  }

  const activeRailStations = expandedRailCity ? marketDestinationStations(expandedRailCity) : [];
  const activeRailOrigin = MARKET_RAIL_ORIGINS.find((item) => item.id === railOriginId) || MARKET_RAIL_ORIGINS[0];
  const activeRailDestination = activeRailStations.find((item) => item.id === railDestinationId) || activeRailStations[0];

  function toggleRailPanel(city: string) {
    if (expandedRailCity === city) { setExpandedRailCity(null); return; }
    const stations = marketDestinationStations(city);
    setRailOriginId(marketOriginForAirport(airport).id);
    setRailDestinationId(stations[0]?.id || "");
    setExpandedFlightCity(null);
    setExpandedRailCity(city);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => document.getElementById("jarmarki-rail-panel")?.scrollIntoView({behavior:"smooth",block:"center"}));
    }
  }

  const restore = () => {
    setExpandedRailCity(null);
    setExpandedFlightCity(null);
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
            <select id="market-airport" value={airport} onChange={(event) => {setAirport(event.target.value);setExpandedFlightCity(null);setExpandedRailCity(null);}}>
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
                  onClick={() => {setMonth(item.value);setExpandedFlightCity(null);setExpandedRailCity(null);}}
                  title={item.label}
                >
                  {item.short}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field} htmlFor="market-duration">
            <span><CalendarDays size={16} /> Na jak długo?</span>
            <select id="market-duration" value={duration} onChange={(event) => {setDuration(event.target.value);setExpandedFlightCity(null);setExpandedRailCity(null);}}>
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
            <h2 id="market-results-title">Jarmarki w {monthHeading}</h2>
            <p>Wybierz miasto i porównaj transport oraz noclegi. Ceny lotów i terminy otworzysz w osobnym panelu, bez rozciągania kart.</p>
          </div>
          <span className={styles.counter} role="status" aria-live="polite">
            <Search size={16} /> {availableMarkets.length} {availableMarkets.length === 1 ? "kierunek" : availableMarkets.length > 4 ? "kierunków" : "kierunki"}
          </span>
        </div>

        <div className={styles.cards}>
          {availableMarkets.map((idea) => {
            const pricedFlights = flights.query === queryKey ? flights.prices[idea.city] || [] : [];
            const scheduledOrigin = knownDirectOrigin(airport, idea.city);
            const showFlight = pricedFlights.length > 0 || Boolean(scheduledOrigin);
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

              <div className={styles.transportSummary}>
                {pricedFlights.length ? (
                  <span className={styles.pricedBadge}><Plane size={15}/> Loty od <strong>{pricedFlights[0].price.toLocaleString("pl-PL")} zł</strong></span>
                ) : showFlight ? (
                  <span className={styles.routeBadge}><Plane size={15}/> Sprawdź loty</span>
                ) : (
                  <span className={styles.railBadge}><TrainFront size={15}/> Podróż pociągiem</span>
                )}
              </div>
              <div className={styles.cardActions}>
                {showFlight ? (
                  <button type="button" className={styles.primaryAction}
                    aria-expanded={expandedFlightCity === idea.city}
                    aria-controls="jarmarki-flight-panel"
                    onClick={() => toggleFlightPanel(idea.city)}>
                    <Plane size={17}/> {expandedFlightCity === idea.city ? "Ukryj loty" : "Zobacz loty"} <ArrowRight size={17}/>
                  </button>
                ) : (
                  <button type="button" className={styles.primaryAction} onClick={() => toggleRailPanel(idea.city)} aria-expanded={expandedRailCity===idea.city} aria-controls="jarmarki-rail-panel"><TrainFront size={17}/> Wybierz pociąg <ArrowRight size={17}/></button>
                )}
                <div className={styles.secondaryActions}>
                  {showFlight && <button type="button" onClick={() => toggleRailPanel(idea.city)}><TrainFront size={15}/> Pociągi</button>}
                  <Link href={bookingHotelHref(idea)} rel="sponsored"><BedDouble size={15}/> Hotele</Link>
                  <Link href={"/atrakcje?q=" + encodeURIComponent(idea.city + " jarmark bożonarodzeniowy")}><Ticket size={15}/> Atrakcje</Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>
        {expandedIdea && (
          <section id="jarmarki-flight-panel" className={styles.flightPanel} aria-labelledby="jarmarki-flight-title">
            <div className={styles.flightPanelHead}>
              <div>
                <span className={styles.eyebrow}>LOTY DO {expandedIdea.city.toLocaleUpperCase("pl-PL")}</span>
                <h3 id="jarmarki-flight-title">{expandedIdea.city} · {expandedOrigin} · {monthLabel}</h3>
                <p>{expandedPrices.length ? "Wybierz termin i sprawdź aktualną cenę u partnera." : "Nie mamy aktualnej ceny w kalendarzu. Sprawdź propozycje terminów u partnera."}</p>
              </div>
              <button type="button" className={styles.closePanel} onClick={() => setExpandedFlightCity(null)}>Zamknij <X size={17}/></button>
            </div>
            <div className={styles.flightPanelOffers}>
              {expandedPrices.length ? expandedPrices.slice(0, 4).map(offer => (
                <a key={offer.departDate + offer.returnDate} href={offer.affiliateUrl} rel="sponsored" className={styles.flightOffer}>
                  <span><Plane size={18}/> {marketFlightPriceDateLabel(offer)}</span>
                  <strong>od {offer.price.toLocaleString("pl-PL")} zł <ArrowRight size={16}/></strong>
                </a>
              )) : suggestedDates.map(dates => (
                <a key={dates.departure} href={marketKiwiFlightHref({origin:expandedOrigin,destination:MARKET_AIRPORTS[expandedIdea.city],city:expandedIdea.city,dates})} rel="sponsored" className={styles.flightOffer}>
                  <span><Plane size={18}/> {marketFlightDateLabel(dates)}</span>
                  <strong>Sprawdź cenę <ArrowRight size={16}/></strong>
                </a>
              ))}
            </div>
            {!expandedPrices.length && !suggestedDates.length && <p>Brak propozycji terminów w tym okresie.</p>}
            <div className={styles.flightPanelFooter}>
              <Link href={flightsHref(expandedIdea, expandedOrigin, month, duration)}><Plane size={16}/> Więcej terminów</Link>
              <Link href={bookingHotelHref(expandedIdea)} rel="sponsored"><BedDouble size={16}/> Hotele Booking</Link>
              <button type="button" onClick={() => toggleRailPanel(expandedIdea.city)}><TrainFront size={16}/> Pociągi</button>
            </div>
            <p className={styles.flightPanelDisclaimer}>Ceny orientacyjne; dostępność i cenę ostateczną potwierdza partner przy rezerwacji.</p>
          </section>
        )}
        {expandedRailCity && activeRailDestination && (
          <section id="jarmarki-rail-panel" className={styles.flightPanel} aria-label={"Zaplanuj pociąg do " + expandedRailCity}>
            <div className={styles.flightPanelHead}>
              <div>
                <span className={styles.eyebrow}>PODRÓŻ POCIĄGIEM</span>
                <h3>{activeRailOrigin.label} → {activeRailDestination.label}</h3>
                <p>Ustawiliśmy domyślne dworce dla Twojej trasy. Możesz zmienić je przed sprawdzeniem połączeń.</p>
              </div>
              <button type="button" className={styles.closePanel} onClick={() => setExpandedRailCity(null)}>Zamknij <X size={17}/></button>
            </div>
            <div className={styles.railInputs}>
              <label>Stacja wyjazdu
                <select value={railOriginId} onChange={e=>setRailOriginId(e.target.value)}>
                  {MARKET_RAIL_ORIGINS.map(station=><option key={station.id} value={station.id}>{station.label}</option>)}
                </select>
              </label>
              <label>Stacja docelowa
                <select value={activeRailDestination.id} onChange={e=>setRailDestinationId(e.target.value)}>
                  {activeRailStations.map(station=><option key={station.id} value={station.id}>{station.label}</option>)}
                </select>
              </label>
            </div>
            <div className={styles.flightPanelFooter}>
              <a href={marketStationDirectionsHref(activeRailOrigin,activeRailDestination)} target="_blank" rel="noopener noreferrer"><TrainFront size={16}/> Sprawdź tę trasę i rozkład <ArrowRight size={16}/></a>
              <Link href={railHref(MARKET_IDEAS.find(x=>x.city===expandedRailCity)!,airport,month)} rel="sponsored"><TrainFront size={16}/> Bilety kolejowe Klook</Link>
            </div>
            <p className={styles.flightPanelDisclaimer}>Rozkład otwiera się z uzupełnionymi stacjami. Klook nie potwierdza przekazywania tych parametrów, więc w jego wyszukiwarce może być konieczny ponowny wybór stacji i daty.</p>
          </section>
        )}
        <div className={styles.note}>
          <CheckCircle2 size={19} aria-hidden="true" />
          <p><strong>Ważne:</strong> znalezione ceny lotów pochodzą z kalendarza taryf, nie są gwarantowaną ceną zakupu. Daty bez ceny są propozycjami wyszukiwania w Kiwi.com. Połączenia Warszawa–Wiedeń, Warszawa–Budapeszt, Warszawa–Praga i Warszawa–Berlin wynikają z rozkładów lotów, a nie z gwarantowanej dostępności miejsc w wybranym terminie. Brak lotu w kalendarzu cen nie dowodzi, że lot nie istnieje. Pociągi prowadzą do afiliacyjnej wyszukiwarki Klook — tam wybierzesz stacje i konkretne daty; dostępność połączeń z Polski nie jest gwarantowana. Hotele otwierają wyszukiwanie miasta w Booking.com z afiliacją Tripowni. Daty i ceny potwierdź u dostawców, a daty jarmarków u organizatorów.</p>
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
