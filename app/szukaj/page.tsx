import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";

export const metadata: Metadata = {
  title: "Wyniki wyszukiwania podróży | Tripownia.pl",
  description: "Gotowe wyszukiwanie podróży z ustawionym kierunkiem, lotniskiem, terminem, długością pobytu i budżetem.",
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{
    destination?: string;
    airport?: string;
    budget?: string;
    duration?: string;
    board?: string;
    tab?: string;
    from?: string;
    to?: string;
    month?: string;
    weekend?: string;
  }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const destinations = typeof params.destination === "string"
    ? params.destination.split("|").map((item) => item.trim()).filter(Boolean)
    : [];
  const airports = typeof params.airport === "string"
    ? params.airport.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
  const budget = typeof params.budget === "string" ? params.budget : "all";
  const duration = typeof params.duration === "string" ? params.duration : "all";
  const board = typeof params.board === "string" ? params.board : "all";
  const tab = typeof params.tab === "string" ? params.tab : "Lot + hotel";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  const month = typeof params.month === "string" ? params.month : "";
  const weekendOnly = params.weekend === "1";
  const dateMode = month ? "month" : (from || to) ? "range" : "any";
  const hasPreset = Boolean(destinations.length || airports.length || budget !== "all" || duration !== "all" || board !== "all" || from || to || month || weekendOnly);
  const searchKey = [tab, destinations.join("|"), airports.join(","), budget, duration, board, from, to, month, weekendOnly ? "1" : "0"].join("::");

  return (
    <main>
      <SiteHeader />
      <section className="shell ready-search-page">
        <div className="ready-search-page-head">
          <div className="kicker">GOTOWE WYSZUKIWANIE</div>
          <h1>Już ustawiliśmy najważniejsze parametry.</h1>
          <p>Nie zaczynasz od zera. Zobacz wyniki od razu, a jeśli chcesz — zmień tylko jeden parametr.</p>
        </div>
        <SearchHub
          key={searchKey}
          embedded
          initialTab={tab}
          initialDestinations={destinations}
          initialAirports={airports}
          initialBudget={budget}
          initialDuration={duration}
          initialBoard={board}
          initialDateMode={dateMode}
          initialDateFrom={from}
          initialDateTo={to}
          initialMonth={month}
          initialWeekendOnly={weekendOnly}
          searchRequest={hasPreset ? 1 : 0}
        />
      </section>
      <SiteFooter />
    </main>
  );
}
