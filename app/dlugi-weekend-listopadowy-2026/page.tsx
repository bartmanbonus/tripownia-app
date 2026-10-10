import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";

const title = "Długi weekend listopadowy 2026 — lot + hotel, city break | Tripownia.pl";
const description = "11 listopada 2026 wypada w środę. Porównaj wyjazdy 7–11 i 11–15 listopada, wybierz lotnisko i budżet, a następnie sprawdź aktualne ceny i dostępność.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/dlugi-weekend-listopadowy-2026" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/dlugi-weekend-listopadowy-2026",
    siteName: "Tripownia",
    locale: "pl_PL",
  },
};

type PageProps = {
  searchParams: Promise<{
    airport?: string;
    destination?: string;
    budget?: string;
    duration?: string;
    from?: string;
    to?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
  }>;
};

const shortTrips = [
  {
    title: "7–11 listopada",
    subtitle: "Weekend + poniedziałek i wtorek",
    href: "/szukaj?tab=City%20break&duration=2-5&from=2026-11-07&to=2026-11-11",
  },
  {
    title: "11–15 listopada",
    subtitle: "Święto + czwartek i piątek",
    href: "/szukaj?tab=City%20break&duration=2-5&from=2026-11-11&to=2026-11-15",
  },
  {
    title: "7–15 listopada",
    subtitle: "Elastyczny termin i wybór kierunku",
    href: "/szukaj?tab=Lot%20%2B%20hotel&duration=3-8&from=2026-11-07&to=2026-11-15",
  },
] as const;

const departureQuickPicks = [
  { label: "Warszawa — Chopin i Modlin", codes: "WAW,WMI" },
  { label: "Kraków", codes: "KRK" },
  { label: "Katowice", codes: "KTW" },
  { label: "Gdańsk", codes: "GDN" },
  { label: "Wrocław", codes: "WRO" },
  { label: "Poznań", codes: "POZ" },
] as const;

const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
const allowedAirports = new Set(["WAW", "WMI", "KRK", "KTW", "GDN", "WRO", "POZ", "RZE", "LCJ", "LUZ", "SZZ", "BZG", "IEG"]);

export default async function NovemberWeekend({ searchParams }: PageProps) {
  const params = await searchParams;
  const airport = typeof params.airport === "string"
    ? params.airport.split(",").map((code) => code.trim().toUpperCase()).filter((code) => allowedAirports.has(code)).slice(0, 8)
    : [];
  const destination = typeof params.destination === "string" ? params.destination.trim().slice(0, 80) : "";
  const budget = typeof params.budget === "string" ? params.budget : "all";
  const duration = typeof params.duration === "string" ? params.duration : "2-5";
  const from = typeof params.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.from) ? params.from : "2026-11-07";
  const to = typeof params.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.to) ? params.to : "2026-11-15";
  const key = [airport.join(","), destination, budget, duration, from, to].join("|");
  const attribution = new URLSearchParams();
  for (const utmKey of utmKeys) {
    const value = params[utmKey];
    if (typeof value === "string" && value.length > 0 && value.length <= 120) attribution.set(utmKey, value);
  }
  const withAttribution = (href: string) =>
    attribution.size ? `${href}${href.includes("?") ? "&" : "?"}${attribution.toString()}` : href;
  const departureHref = (codes: string) => {
    const search = new URLSearchParams({ airport: codes, duration, from, to });
    if (destination) search.set("destination", destination);
    if (budget !== "all") search.set("budget", budget);
    for (const utmKey of utmKeys) {
      const value = attribution.get(utmKey);
      if (value) search.set(utmKey, value);
    }
    return `/dlugi-weekend-listopadowy-2026?${search.toString()}#szukaj-listopad`;
  };

  return (
    <main>
      <SiteHeader />
      <SalesCollectionSchema
        name="Długi weekend listopadowy 2026"
        description={description}
        path="/dlugi-weekend-listopadowy-2026"
        about={["długi weekend listopad 2026", "11 listopada wyjazdy", "city break", "lot + hotel"]}
      />
      <section className="seasonal-hero shell newyear-hero-premium">
        <div className="kicker">11 LISTOPADA 2026 · ŚRODA</div>
        <h1>Zamień listopadową przerwę na podróż.</h1>
        <p>
          Wybierz krótszy city break lub kilka dni w słońcu. Na Tripowni porównasz loty z polskich lotnisk,
          hotele i gotowe wyjazdy — bez przekopywania się przez dziesiątki kart.
        </p>
        <div className="newyear-type-nav">
          <a href="#gotowe-terminy">Wybierz termin</a>
          <a href="#szukaj-listopad">Sprawdź wyjazdy</a>
          <Link href={withAttribution("/alerty")}>Ustaw alert cenowy</Link>
        </div>
      </section>

      <section className="section shell" id="gotowe-terminy">
        <div className="section-heading">
          <div>
            <div className="kicker">TRZY GOTOWE STARTY</div>
            <h2>Wybierz dni, a nie przypadkową ofertę.</h2>
            <p>11 listopada przypada w środę. Sprawdź oba sąsiednie weekendy i porównaj rzeczywisty koszt wyjazdu.</p>
          </div>
        </div>
        <div className="newyear-ready-grid">
          {shortTrips.map((trip) => (
            <Link className="newyear-ready-card" href={withAttribution(trip.href)} key={trip.href}>
              <strong>{trip.title}</strong>
              <span>{trip.subtitle}</span>
              <small>Przejdź do wyjazdów →</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell" id="lotnisko-listopad">
        <div className="section-heading">
          <div>
            <div className="kicker">WYGODNIE Z TWOJEGO MIASTA</div>
            <h2>Skąd chcesz wystartować?</h2>
            <p>Wybierz lotnisko, a Tripownia od razu przefiltruje wyjazdy. Możesz też wybrać kilka lotnisk w wyszukiwarce poniżej.</p>
          </div>
        </div>
        <div className="newyear-ready-grid">
          {departureQuickPicks.map((pick) => (
            <Link className="newyear-ready-card" href={departureHref(pick.codes)} key={pick.codes}>
              <strong>{pick.label}</strong>
              <span>Sprawdź terminy i aktualne ceny</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell" id="szukaj-listopad">
        <div className="section-heading">
          <div>
            <div className="kicker">WYSZUKIWARKA TRIPOWNI</div>
            <h2>Wybierz swoje lotnisko, kierunek i budżet.</h2>
            <p>Wyniki i ceny zmieniają się wraz z dostępnością. Ostateczną kwotę potwierdź przed rezerwacją.</p>
          </div>
        </div>
        <div className="single-partner-search-wrap">
          <SearchHub
            key={key}
            embedded
            initialTab="Lot + hotel"
            initialDestinations={destination ? [destination] : []}
            initialAirports={airport}
            initialBudget={budget}
            initialDuration={duration}
            initialDateMode="range"
            initialDateFrom={from}
            initialDateTo={to}
            searchRequest={1}
          />
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <div className="kicker">WYJAZD BEZ NIESPODZIANEK</div>
            <h2>Porównaj pełny koszt, nie tylko cenę lotu.</h2>
            <p>Przy krótkim wyjeździe sprawdź bagaż, transfer, godziny przylotu, lokalizację hotelu i warunki anulacji.</p>
          </div>
        </div>
        <div className="premium-action-row">
          <Link className="premium-action-main" href={withAttribution("/okazje")}>Zobacz wszystkie okazje</Link>
          <Link className="premium-action-secondary" href={withAttribution("/weekend-bez-urlopu")}>Inne krótkie wyjazdy</Link>
        </div>
      </section>

      <section className="section shell"><FacebookFollowCTA placement="november_weekend_2026" compact /></section>
      <SiteFooter />
    </main>
  );
}
