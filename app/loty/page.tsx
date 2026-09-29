import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelpayoutsFlightsWidget from "@/components/TravelpayoutsFlightsWidget";
import FlexibleFlightsExplorer from "@/components/FlexibleFlightsExplorer";

export const metadata: Metadata = {
  title: "Porównywarka lotów – znajdź tanie loty",
  description: "Porównuj ceny lotów z wielu źródeł bezpośrednio w Tripowni. Wybierz trasę, daty i pasażerów, a potem dodaj wyjazd do planera.",
  alternates: { canonical: "/loty" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Porównywarka lotów | Tripownia.pl",
    description: "Znajdź i porównaj loty bez wychodzenia z Tripowni.",
    url: "/loty",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function FlightsPage() {
  return (
    <main className="tpwl-tripownia-page">
      <SiteHeader />
      <div className="shell">
        <section className="flight-search-modes-intro">
          <div className="kicker">LOTY W TRIPOWNI</div>
          <h1>Znajdź konkretny lot albo upoluj najlepszy termin.</h1>
          <p>Masz dokładne daty? Użyj porównywarki. Jesteś elastyczna/y? Sprawdź kalendarz cen lub kierunki „gdziekolwiek”.</p>
        </section>
        <FlexibleFlightsExplorer />
        <TravelpayoutsFlightsWidget />
      </div>
      <SiteFooter />
    </main>
  );
}
