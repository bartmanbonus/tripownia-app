"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Plane, RotateCcw, Search, Ticket } from "lucide-react";
import styles from "@/app/jarmarki-bozonarodzeniowe/markets.module.css";

type MarketIdea = {
  city: string;
  country: string;
  flag: string;
  market: string;
  note: string;
  see: string;
  accent: string;
  months: string[];
};

const MARKET_IDEAS: MarketIdea[] = [
  {
    city: "Wiedeń", country: "Austria", flag: "🇦🇹", accent: "KLASYK",
    market: "13 listopada – 26 grudnia 2026",
    note: "Klasyczny pierwszy jarmarkowy city break. Kilka pięknych lokalizacji w jednym mieście.",
    see: "Rathausplatz · Schönbrunn · Belweder",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Praga", country: "Czechy", flag: "🇨🇿", accent: "RÓWNIEŻ W STYCZNIU",
    market: "28 listopada 2026 – 6 stycznia 2027",
    note: "Dobry wybór także na przełom roku. W styczniu szukaj terminów przed 6 stycznia.",
    see: "Rynek Staromiejski · Most Karola · Zamek",
    months: ["2026-11", "2026-12", "2027-01"],
  },
  {
    city: "Drezno", country: "Niemcy", flag: "🇩🇪", accent: "TRADYCYJNY",
    market: "25 listopada – 24 grudnia 2026",
    note: "Striezelmarkt i klasyczny świąteczny klimat. Jarmark kończy się przed świętami.",
    see: "Altmarkt · Frauenkirche · Stare Miasto",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Norymberga", country: "Niemcy", flag: "🇩🇪", accent: "NIEMIECKI KLASYK",
    market: "27 listopada – 24 grudnia 2026",
    note: "Christkindlesmarkt w historycznym centrum, idealny na krótki przedświąteczny wypad.",
    see: "Hauptmarkt · Frauenkirche · Kaiserburg",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Berlin", country: "Niemcy", flag: "🇩🇪", accent: "DUŻY WYBÓR",
    market: "23 listopada – 31 grudnia 2026",
    note: "Wiele jarmarków w różnych dzielnicach — od klasycznych po nowoczesne.",
    see: "Gendarmenmarkt · Charlottenburg · Mitte",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Budapeszt", country: "Węgry", flag: "🇭🇺", accent: "JARMARK + TERMY",
    market: "połowa listopada – 31 grudnia 2026",
    note: "Świąteczne place, termy i wieczorny Dunaj w jednym krótkim wyjeździe.",
    see: "Bazylika św. Stefana · Vörösmarty tér · termy",
    months: ["2026-11", "2026-12"],
  },
  {
    city: "Salzburg", country: "Austria", flag: "🇦🇹", accent: "ALPEJSKI KLIMAT",
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
  { value: "ALL", label: "Cała Polska — porównaj lotniska" },
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

function packageHref(idea: MarketIdea, airport: string, month: string, duration: string) {
  const params = new URLSearchParams({
    destination: idea.city,
    tab: duration === "5-7" ? "Lot + hotel" : "City break",
    duration,
    month,
  });
  if (airport !== "ALL") params.set("airport", airport);
  return "/szukaj?" + params.toString();
}

function flightsHref(idea: MarketIdea, airport: string, month: string) {
  const params = new URLSearchParams({
    destination: idea.city,
    origin: airport,
    month,
  });
  return "/loty?" + params.toString();
}

export default function ChristmasMarketsClient() {
  const [airport, setAirport] = useState("WAW");
  const [month, setMonth] = useState("2026-12");
  const [duration, setDuration] = useState("2-4");

  const availableMarkets = useMemo(
    () => MARKET_IDEAS.filter((idea) => idea.months.includes(month)),
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
            <p>Ustaw lotnisko, miesiąc i długość pobytu tylko raz. Wybrane parametry przeniesiemy do wyszukiwarki Tripowni.</p>
          </div>
          <span className={styles.finderStep}><CheckCircle2 size={18} /> Bez sztywnych dat</span>
        </div>

        <div className={styles.controls}>
          <label className={styles.field} htmlFor="market-airport">
            <span><MapPin size={16} /> Skąd lecisz?</span>
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
          <p><CheckCircle2 size={16} /> <strong>Twój wybór:</strong> {airportLabel} · {monthLabel} · {stayLabel}</p>
          <button type="button" onClick={restore}><RotateCcw size={14} /> Przywróć ustawienia</button>
        </div>
      </section>

      <section className={styles.results} id="jarmarki-wyniki" aria-labelledby="market-results-title">
        <div className={styles.resultsHead}>
          <div>
            <span className={styles.eyebrow}>WYBIERZ SWÓJ KIERUNEK</span>
            <h2 id="market-results-title">Jarmarki na {monthLabel.toLocaleLowerCase("pl-PL")}</h2>
            <p>Wybierz miasto — wyszukiwanie lotu i noclegu otworzy się z Twoimi parametrami.</p>
          </div>
          <span className={styles.counter} role="status" aria-live="polite">
            <Search size={16} /> {availableMarkets.length} {availableMarkets.length === 1 ? "kierunek" : availableMarkets.length > 4 ? "kierunków" : "kierunki"}
          </span>
        </div>

        <div className={styles.cards}>
          {availableMarkets.map((idea) => (
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

              <p className={styles.cardNote}>{idea.note}</p>

              <div className={styles.dates}>
                <CalendarDays size={19} aria-hidden="true" />
                <div>
                  <small>OKRES JARMARKU</small>
                  <strong>{idea.market}</strong>
                </div>
              </div>

              <div className={styles.sights}><strong>Warto zobaczyć</strong><span>{idea.see}</span></div>

              <div className={styles.cardActions}>
                <Link className={styles.primaryAction} href={packageHref(idea, airport, month, duration)}>
                  Szukaj lot + nocleg <ArrowRight size={17} />
                </Link>
                <div className={styles.secondaryActions}>
                  <Link href={flightsHref(idea, airport, month)}><Plane size={15} /> Tylko loty</Link>
                  <Link href={"/atrakcje?q=" + encodeURIComponent(idea.city + " jarmark bożonarodzeniowy")}><Ticket size={15} /> Atrakcje</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.note}>
          <CheckCircle2 size={19} aria-hidden="true" />
          <p><strong>Ważne przed rezerwacją:</strong> daty jarmarków mogą się zmienić. Wybrany miesiąc oznacza okres wyszukiwania, nie gwarancję, że jarmark działa przez cały miesiąc. Sprawdź termin konkretnego wydarzenia i cenę u organizatora oraz dostawcy.</p>
        </div>
        <nav className={styles.moreLinks} aria-label="Inne sposoby planowania">
          <Link href="/loty">Porównaj wszystkie loty <ArrowRight size={15}/></Link>
          <Link href="/city-break">City breaki z noclegiem <ArrowRight size={15}/></Link>
          <Link href="/moja-podroz">Mój plan podróży <ArrowRight size={15}/></Link>
        </nav>
      </section>
    </>
  );
}
