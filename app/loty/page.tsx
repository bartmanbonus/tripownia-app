import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FlightsPageClient from "@/components/FlightsPageClient";

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

type FlightsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const params = await searchParams;
  const destination = firstParam(params.destination);
  const origin = firstParam(params.origin) || "WAW";
  const outbound = firstParam(params.outbound);
  const inbound = firstParam(params.inbound);
  const initialMonth = /^\d{4}-\d{2}-\d{2}$/.test(outbound) ? outbound.slice(0, 7) : "";

  return (
    <main className="tpwl-tripownia-page">
      <SiteHeader />
      <div className="shell">
        <section className="flight-search-modes-intro">
          <div className="kicker">LOTY W TRIPOWNI</div>
          <h1>Znajdź konkretny lot albo upoluj najlepszy termin.</h1>
          <p>Masz dokładne daty? Użyj porównywarki. Masz elastyczny termin? Sprawdź kalendarz cen albo wybierz „Gdziekolwiek”.</p>
        </section>
        <FlightsPageClient
          initialDestination={destination}
          initialOrigin={origin}
          initialMonth={initialMonth}
          initialOutbound={outbound}
          initialInbound={inbound}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
